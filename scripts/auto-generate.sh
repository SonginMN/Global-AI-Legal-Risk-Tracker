#!/bin/bash
# Weekly AI Legal Tracker report generation via claude CLI
# Triggered by macOS LaunchAgent every Monday at 9:00 AM
#
# Prerequisites:
#   sudo pmset repeat wakeorpoweron M 08:55:00   # Mac auto-wake before trigger
#   launchctl load ~/Library/LaunchAgents/com.ai-legal-tracker.weekly.plist

set -euo pipefail

PROJECT_DIR="/Users/minimax/Documents/Claude Code Project/AI-Legal-Tracker"
LOG_DIR="$PROJECT_DIR/logs"
LOG_FILE="$LOG_DIR/$(date +%Y-%m-%d)-generation.log"
CLAUDE_BIN="/Users/minimax/.local/bin/claude"

mkdir -p "$LOG_DIR"

exec > "$LOG_FILE" 2>&1

echo "=== AI Legal Tracker Auto-Generation ==="
echo "Start: $(date '+%Y-%m-%d %H:%M:%S')"
echo "Working directory: $PROJECT_DIR"
echo ""

cd "$PROJECT_DIR"

if ! command -v "$CLAUDE_BIN" &>/dev/null; then
    echo "ERROR: claude CLI not found at $CLAUDE_BIN"
    exit 1
fi

if ! curl -s --max-time 5 https://www.google.com > /dev/null 2>&1; then
    echo "ERROR: no internet connectivity"
    exit 1
fi

PROMPT='请按照 generate-report skill 的完整流程生成本周 AI 法律风险周报。

要求：
1. 按 skill 中的 Step 1-7 完整执行
2. Step 5.5 审核步骤必须执行：运行 python3 scripts/review_report.py 检查，若有 FAIL 则修复后重新验证
3. LLM 二次审核：检查每条是否与 AI 直接相关，检查优先级是否正确，抽查 2-3 个 source URL 确认内容匹配
4. 审核全部通过后，自动 git add + git commit（不要 push）
5. 完成后发送桌面通知

注意：这是自动化运行，无需等待用户确认，直接按流程执行到 commit 步骤。'

echo "Running claude -p ..."
echo ""

"$CLAUDE_BIN" -p "$PROMPT" \
    --output-format text \
    --verbose

EXIT_CODE=$?

echo ""
echo "=== Generation Complete ==="
echo "Exit code: $EXIT_CODE"
echo "End: $(date '+%Y-%m-%d %H:%M:%S')"

if [ $EXIT_CODE -eq 0 ]; then
    osascript -e 'display notification "本周 AI 法律风险周报已生成并 commit，请 git push" with title "AI Legal Tracker"' 2>/dev/null || true
else
    osascript -e 'display notification "周报自动生成失败，请检查日志" with title "AI Legal Tracker"' 2>/dev/null || true
fi
