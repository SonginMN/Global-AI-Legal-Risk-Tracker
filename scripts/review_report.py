#!/usr/bin/env python3
"""AI Legal Tracker report quality review script."""

import json
import re
import sys
from urllib.parse import urlparse

DEEP_ANALYSIS_FIELDS = {"scope", "compliance_timeline", "violation_risk", "peer_response", "recommendations"}
REPORT_META_FIELDS = {"issue", "date", "period_start", "period_end", "generated_at", "item_count"}
ITEM_REQUIRED_FIELDS = {"id", "priority", "category", "title", "region", "institution", "date", "status", "summary", "impact", "action_required", "deadline", "sources", "tags"}

HOMEPAGE_PATTERNS = [
    re.compile(r'^https?://[^/]+/?$'),
    re.compile(r'^https?://www\.[^/]+/?$'),
]
CATEGORY_PAGE_PATTERNS = [
    re.compile(r'/topics?/'),
    re.compile(r'/category/'),
    re.compile(r'/tags?/'),
    re.compile(r'/news/?$'),
    re.compile(r'/blog/?$'),
]
CHINA_ENGLISH_SUMMARY = re.compile(r'english\.www\.gov\.cn')

US_STATE_KEYWORDS = [
    "colorado", "california", "connecticut", "georgia", "texas", "new york",
    "illinois", "virginia", "florida", "ohio", "washington", "oregon",
    "massachusetts", "maryland", "minnesota", "indiana", "tennessee",
    "utah", "montana", "louisiana", "arizona", "nebraska", "iowa",
    "州长", "state legislature", "state bill", "state law", "州级",
    "sb ", "hb ", "ab ", "SB ", "HB ", "AB ",
]

CHINA_LOCAL_COURT_KEYWORDS = [
    "中级人民法院", "基层人民法院", "区人民法院", "市人民法院",
    "高级人民法院",
    "intermediate court", "district court", "local court",
]

VAGUE_RISK_PHRASES = [
    re.compile(r'本周标志着'),
    re.compile(r'标志着.*转向'),
    re.compile(r'标志着.*新阶段'),
    re.compile(r'意味着.*时代'),
]

ASCII_QUOTE = re.compile(r'(?<!\\)"')


class ReviewResult:
    def __init__(self):
        self.passes = []
        self.warns = []
        self.fails = []

    def ok(self, msg):
        self.passes.append(msg)

    def warn(self, msg):
        self.warns.append(msg)

    def fail(self, msg):
        self.fails.append(msg)

    def report(self):
        lines = []
        for msg in self.fails:
            lines.append(f"FAIL: {msg}")
        for msg in self.warns:
            lines.append(f"WARN: {msg}")
        for msg in self.passes:
            lines.append(f"PASS: {msg}")
        lines.append("")
        total = len(self.passes) + len(self.warns) + len(self.fails)
        lines.append(f"--- {total} checks: {len(self.passes)} PASS, {len(self.warns)} WARN, {len(self.fails)} FAIL ---")
        return "\n".join(lines)


def check_json_structure(data, r):
    if "report_meta" not in data:
        r.fail("missing report_meta")
        return
    missing = REPORT_META_FIELDS - set(data["report_meta"].keys())
    if missing:
        r.fail(f"report_meta missing fields: {missing}")
    else:
        r.ok("report_meta fields complete")

    if "overview" not in data:
        r.fail("missing overview")
    else:
        for f in ("summary", "highlights", "risk_alert"):
            if f not in data["overview"]:
                r.fail(f"overview missing '{f}'")
        r.ok("overview fields complete")

    if "items" not in data or not isinstance(data["items"], list) or len(data["items"]) == 0:
        r.fail("items missing or empty")
        return
    for i, item in enumerate(data["items"]):
        missing = ITEM_REQUIRED_FIELDS - set(item.keys())
        if missing:
            r.fail(f"item[{i}] '{item.get('title', '?')[:30]}' missing: {missing}")
    r.ok(f"item field completeness checked ({len(data['items'])} items)")

    if "trends" not in data:
        r.fail("missing trends[]")
    elif not isinstance(data["trends"], list):
        r.fail("trends must be an array")
    else:
        for i, t in enumerate(data["trends"]):
            if not isinstance(t, str):
                r.fail(f"trends[{i}] is {type(t).__name__}, must be string")
                break
        else:
            r.ok("trends[] are all strings")

    if "key_deadlines" not in data:
        r.fail("missing key_deadlines[]")
    elif not isinstance(data["key_deadlines"], list):
        r.fail("key_deadlines must be an array")
    else:
        for i, kd in enumerate(data["key_deadlines"]):
            if "event" in kd:
                r.fail(f"key_deadlines[{i}] uses 'event' instead of 'item'")
            if "urgency" in kd:
                r.fail(f"key_deadlines[{i}] uses 'urgency' instead of 'priority'")
            if "item" not in kd or "priority" not in kd:
                r.fail(f"key_deadlines[{i}] missing required field 'item' or 'priority'")
        r.ok("key_deadlines field names correct")


def check_priority_rules(data, r):
    items = data.get("items", [])
    deadlines = data.get("key_deadlines", [])

    for item in items:
        title_lower = (item.get("title", "") + " " + item.get("summary", "")).lower()
        priority = item.get("priority", "")

        if item.get("category") == "legislation" and priority in ("P0", "P1"):
            for kw in US_STATE_KEYWORDS:
                if kw.lower() in title_lower:
                    r.fail(f"State legislation '{item['title'][:40]}' is {priority}, should be P2 max")
                    break

        if item.get("region") == "CN" and priority in ("P0", "P1"):
            for kw in CHINA_LOCAL_COURT_KEYWORDS:
                if kw in item.get("title", "") or kw in item.get("summary", ""):
                    r.fail(f"China local court item '{item['title'][:40]}' is {priority}, should be P2 max")
                    break

    p2_in_deadlines = [kd for kd in deadlines if kd.get("priority") == "P2"]
    if p2_in_deadlines:
        for kd in p2_in_deadlines:
            r.fail(f"P2 item in key_deadlines: '{kd.get('item', '?')[:40]}'")
    else:
        r.ok("no P2 items in key_deadlines")

    r.ok("priority rules checked")


def check_source_quality(data, r):
    items = data.get("items", [])
    issues = []

    for item in items:
        sources = item.get("sources", [])
        if not sources:
            r.fail(f"item '{item['title'][:40]}' has no sources")
            continue

        for j, url in enumerate(sources):
            parsed = urlparse(url)
            full_url = url.rstrip("/")

            if any(p.match(url) for p in HOMEPAGE_PATTERNS):
                issues.append(f"homepage URL in '{item['title'][:30]}': {url}")

            path = parsed.path.rstrip("/")
            if any(p.search(path) for p in CATEGORY_PAGE_PATTERNS) and len(path.split("/")) <= 3:
                issues.append(f"possible category page in '{item['title'][:30]}': {url}")

            if CHINA_ENGLISH_SUMMARY.search(url):
                issues.append(f"Chinese policy uses english.www.gov.cn in '{item['title'][:30]}': {url}")

    if issues:
        for issue in issues:
            r.fail(issue)
    else:
        r.ok("source URLs are specific (no homepages/category pages)")


def check_analysis_depth(data, r):
    items = data.get("items", [])

    for item in items:
        priority = item.get("priority", "")
        title_short = item.get("title", "?")[:40]

        if priority == "P0":
            da = item.get("deep_analysis")
            if not da:
                r.fail(f"P0 '{title_short}' missing deep_analysis")
            else:
                missing = DEEP_ANALYSIS_FIELDS - set(da.keys())
                if missing:
                    r.fail(f"P0 '{title_short}' deep_analysis missing: {missing}")
                else:
                    r.ok(f"P0 '{title_short}' deep_analysis complete")

        if priority == "P1":
            if "impact_summary" not in item:
                r.fail(f"P1 '{title_short}' missing impact_summary")
            if "key_points" not in item or not item["key_points"]:
                r.fail(f"P1 '{title_short}' missing or empty key_points")

    p1_items = [i for i in items if i.get("priority") == "P1"]
    if p1_items:
        all_ok = all("impact_summary" in i and i.get("key_points") for i in p1_items)
        if all_ok:
            r.ok(f"all {len(p1_items)} P1 items have impact_summary + key_points")


def check_formatting(data, r):
    raw = json.dumps(data, ensure_ascii=False)

    string_values = []
    def extract_strings(obj, path=""):
        if isinstance(obj, str):
            string_values.append((path, obj))
        elif isinstance(obj, dict):
            for k, v in obj.items():
                extract_strings(v, f"{path}.{k}")
        elif isinstance(obj, list):
            for i, v in enumerate(obj):
                extract_strings(v, f"{path}[{i}]")
    extract_strings(data)

    ascii_quote_found = False
    for path, val in string_values:
        if '"' in val:
            r.warn(f"ASCII double quote found at {path}: ...{val[max(0, val.index('\"')-10):val.index('\"')+10]}...")
            ascii_quote_found = True
            break
    if not ascii_quote_found:
        r.ok("no ASCII double quotes in string values")

    deadlines = data.get("key_deadlines", [])
    plus_found = False
    for kd in deadlines:
        text = kd.get("item", "")
        if "+" in text and len(text) > 60:
            r.warn(f"key_deadline uses '+' concatenation: '{text[:50]}...'")
            plus_found = True
    if not plus_found:
        r.ok("key_deadlines formatting OK (no '+' concatenation)")

    items = data.get("items", [])
    state_indices = []
    federal_after_state = False
    for i, item in enumerate(items):
        title_lower = (item.get("title", "") + " " + item.get("summary", "")).lower()
        is_state = any(kw.lower() in title_lower for kw in US_STATE_KEYWORDS) and item.get("category") == "legislation"
        if is_state:
            state_indices.append(i)

    if state_indices:
        last_non_state = max(i for i in range(len(items)) if i not in state_indices) if any(i not in state_indices for i in range(len(items))) else -1
        first_state = min(state_indices)
        if last_non_state > first_state:
            r.warn("state legislation items not grouped at end of items array")
        else:
            r.ok("state legislation items correctly placed at end")
    else:
        r.ok("no state legislation items to check ordering")


def check_consistency(data, r):
    meta_count = data.get("report_meta", {}).get("item_count", -1)
    actual_count = len(data.get("items", []))
    if meta_count != actual_count:
        r.fail(f"item_count mismatch: report_meta says {meta_count}, actual {actual_count}")
    else:
        r.ok(f"item_count consistent ({actual_count})")

    overview = data.get("overview", {})
    highlights = overview.get("highlights", [])
    summary = overview.get("summary", "")
    if highlights and summary:
        for h in highlights:
            if len(h) > 10 and h in summary:
                r.warn(f"highlight duplicates summary text: '{h[:40]}...'")
                break
    r.ok("highlights/summary checked")


def check_risk_alert(data, r):
    risk_alert = data.get("overview", {}).get("risk_alert", "")
    for pattern in VAGUE_RISK_PHRASES:
        m = pattern.search(risk_alert)
        if m:
            r.warn(f"risk_alert has vague phrasing: '{m.group()}'")
            return
    r.ok("risk_alert has no obvious vague phrasing")


def check_scope(data, r):
    excluded_keywords = [
        "石油", "天然气", "原油", "能源制裁",
        "外汇", "金融合规", "OFAC和解",
        "黄金", "矿产制裁", "大宗商品",
        "普通关税",
    ]
    items = data.get("items", [])
    for item in items:
        combined = item.get("title", "") + " " + item.get("summary", "")
        for kw in excluded_keywords:
            if kw in combined and "芯片" not in combined and "半导体" not in combined and "AI" not in combined:
                r.warn(f"item may be out of scope ('{kw}'): '{item['title'][:40]}'")
                break
    r.ok("scope filter checked")


def main():
    if len(sys.argv) < 2:
        print("Usage: python3 review_report.py <path-to-data.json>")
        sys.exit(1)

    path = sys.argv[1]
    try:
        with open(path, "r", encoding="utf-8") as f:
            data = json.load(f)
    except json.JSONDecodeError as e:
        print(f"FAIL: invalid JSON - {e}")
        sys.exit(2)
    except FileNotFoundError:
        print(f"FAIL: file not found - {path}")
        sys.exit(2)

    r = ReviewResult()

    check_json_structure(data, r)
    check_priority_rules(data, r)
    check_source_quality(data, r)
    check_analysis_depth(data, r)
    check_formatting(data, r)
    check_consistency(data, r)
    check_risk_alert(data, r)
    check_scope(data, r)

    print(r.report())

    sys.exit(1 if r.fails else 0)


if __name__ == "__main__":
    main()
