const REGION_FLAGS = {
  US: '🇺🇸', 'US-WA': '🇺🇸 WA', EU: '🇪🇺', CN: '🇨🇳', UK: '🇬🇧',
  BR: '🇧🇷', KR: '🇰🇷', JP: '🇯🇵', SG: '🇸🇬', GLOBAL: '🌐'
};
const CATEGORY_LABELS = {
  export_control: '出口管制', sanctions: '经济制裁', enforcement: '执法行动',
  litigation: '诉讼判决', legislation: '立法动态', regulation: '法规政策',
  trade_policy: '贸易政策', policy: '政策更新', industry: '行业动态',
  market: '市场数据', trade: '贸易法律'
};
const OFFICIAL_LINKS = [
  { label: 'OFAC Recent Actions', url: 'https://ofac.treasury.gov/recent-actions' },
  { label: 'BIS 出口管制主页', url: 'https://www.bis.gov/' },
  { label: 'BIS 新闻公告', url: 'https://www.bis.gov/news-updates' },
  { label: 'EU AI Act 官方页', url: 'https://digital-strategy.ec.europa.eu/en/policies/regulatory-framework-ai' },
  { label: 'EUR-Lex 欧盟法规库', url: 'https://eur-lex.europa.eu/' },
  { label: '中国网信办', url: 'http://www.cac.gov.cn/' },
  { label: 'SIA 半导体协会', url: 'https://www.semiconductors.org/news/' },
  { label: 'JD Supra AI专题', url: 'https://www.jdsupra.com/topics/artificial-intelligence/' },
];

let allItems = [];
let currentFilter = 'all';
let currentDate = '2026-03-18';

function formatDate(s) {
  if (!s || s.length <= 7) return s;
  const d = new Date(s + 'T00:00:00');
  if (isNaN(d)) return s;
  return `${d.getFullYear()}年${d.getMonth()+1}月${d.getDate()}日`;
}

// ── Render Overview ──
function renderOverview(ov) {
  const el = document.getElementById('overview-card');
  if (!ov) { el.style.display = 'none'; return; }
  el.innerHTML = `
    <div class="ov-label">本期内容概览</div>
    <div class="ov-summary">${ov.summary}</div>
    <div class="ov-highlights">
      ${(ov.highlights||[]).map(h=>`<div class="ov-item">${h}</div>`).join('')}
    </div>
    ${ov.risk_alert ? `<div class="ov-alert">${ov.risk_alert}</div>` : ''}
  `;
}

// ── Render Deadlines ──
function renderDeadlines(deadlines) {
  const el = document.getElementById('deadline-banner');
  if (!deadlines?.length) { el.style.display='none'; return; }
  el.innerHTML = `
    <span class="dl-title">⏰ 关键截止日期</span>
    <div class="deadline-items">
      ${deadlines.map((d,i) => `
        ${i>0 ? '<span class="deadline-sep">|</span>' : ''}
        <div class="deadline-item">
          <span class="deadline-date">${formatDate(d.date)}</span>
          <span class="priority-badge ${d.priority.toLowerCase()}">${d.priority}</span>
          <span>${d.item}</span>
        </div>
      `).join('')}
    </div>
  `;
}

// ── Render a single card ──
function renderCard(item) {
  const flag = REGION_FLAGS[item.region] || '🌍';
  const cat = CATEGORY_LABELS[item.category] || item.category;
  const pc = item.priority.toLowerCase();
  const tags = (item.tags||[]).slice(0,6).map(t=>`<span class="tag">${t}</span>`).join('');
  const sourceLink = item.sources?.[0]
    ? `<a class="source-link" href="${item.sources[0]}" target="_blank">📎 官方来源</a>` : '';
  const actionBadge = item.action_required ? `<span class="action-badge">⚡ 需关注</span>` : '';
  const dlBadge = item.deadline ? `<span class="deadline-tag">⏰ ${formatDate(item.deadline)}</span>` : '';

  // P0: deep analysis panel
  let expandSection = '';
  if (item.priority === 'P0' && item.deep_analysis) {
    const da = item.deep_analysis;
    expandSection = `
      <button class="expand-btn" onclick="togglePanel(this, 'deep-${item.id}')">
        <em class="chevron">▼</em><span class="btn-text"> 查看深度分析</span>
      </button>
      <div class="deep-panel" id="deep-${item.id}">
        <div class="deep-inner">
          ${da.scope ? `<div class="deep-section"><div class="deep-label">影响范围</div><div class="deep-content">${da.scope}</div></div>` : ''}
          ${da.compliance_timeline ? `<div class="deep-section"><div class="deep-label">合规时间线</div><div class="deep-content">${da.compliance_timeline}</div></div>` : ''}
          ${da.violation_risk ? `<div class="deep-section"><div class="deep-label">违规风险</div><div class="deep-content">${da.violation_risk}</div></div>` : ''}
          ${da.peer_response ? `<div class="deep-section"><div class="deep-label">同业应对</div><div class="deep-content">${da.peer_response}</div></div>` : ''}
          ${da.recommendations?.length ? `
            <div class="deep-section">
              <div class="deep-label">行动建议</div>
              <ul class="recs-list">${da.recommendations.map(r=>`<li>${r}</li>`).join('')}</ul>
            </div>` : ''}
        </div>
      </div>`;
  }

  // P1: impact summary panel
  if (item.priority === 'P1' && (item.impact_summary || item.key_points?.length)) {
    expandSection = `
      <button class="expand-btn" onclick="togglePanel(this, 'impact-${item.id}')">
        <em class="chevron">▼</em><span class="btn-text"> 查看影响分析</span>
      </button>
      <div class="impact-panel" id="impact-${item.id}">
        <div class="impact-inner">
          ${item.impact_summary ? `<div class="impact-summary-text">${item.impact_summary}</div>` : ''}
          ${item.key_points?.length ? `
            <ul class="key-points">${item.key_points.map(p=>`<li>${p}</li>`).join('')}</ul>
          ` : ''}
        </div>
      </div>`;
  }

  return `
    <div class="card ${pc}" data-priority="${item.priority}">
      <div class="card-main">
        <div class="card-header">
          <span class="priority-badge ${pc}">${item.priority}</span>
          <div class="card-title">${item.title}</div>
        </div>
        <div class="card-meta">
          <span>${flag} ${item.region}</span>
          <span>🏛 ${item.institution}</span>
          <span>📅 ${formatDate(item.date)}</span>
          <span>📂 ${cat}</span>
        </div>
        <div class="card-summary">${item.summary}</div>
        <div class="card-footer">
          <div class="tags">${tags}</div>
          <div class="card-badges">${dlBadge}${actionBadge}${sourceLink}</div>
        </div>
      </div>
      ${expandSection}
    </div>`;
}

function togglePanel(btn, panelId) {
  const panel = document.getElementById(panelId);
  const isOpen = panel.classList.contains('open');
  panel.classList.toggle('open', !isOpen);
  btn.classList.toggle('open', !isOpen);
  const label = panelId.startsWith('deep') ? '深度分析' : '影响分析';
  btn.querySelector('.btn-text').textContent = isOpen ? ` 查看${label}` : ' 收起';
}

// ── Filter & Render Cards ──
function renderCards(filter) {
  const items = filter === 'all' ? allItems : allItems.filter(i => i.priority === filter);
  document.getElementById('cards-container').innerHTML = items.map(renderCard).join('');
}

function setFilter(filter) {
  currentFilter = filter;
  document.querySelectorAll('.tab').forEach(t => t.classList.toggle('active', t.dataset.filter === filter));
  renderCards(filter);
}

// ── History Drawer ──
function openDrawer() {
  document.getElementById('history-drawer').classList.add('open');
  document.getElementById('drawer-mask').classList.add('show');
}
function closeDrawer() {
  document.getElementById('history-drawer').classList.remove('open');
  document.getElementById('drawer-mask').classList.remove('show');
}

async function loadReport(date) {
  currentDate = date;
  closeDrawer();
  const resp = await fetch(`/archives/${date}/data.json`);
  const data = await resp.json();
  applyData(data, date);
}

function renderHistoryList(reports) {
  const list = document.getElementById('history-list');
  list.innerHTML = reports.map(r => `
    <div class="drawer-item ${r.date === currentDate ? 'active' : ''}" onclick="loadReport('${r.date}')">
      <div class="di-date">第${r.issue}期 · ${r.date}</div>
      <div class="di-headline">${r.headline || ''}</div>
      <div class="di-count">共 ${r.count} 条动态 · ${r.period_start} — ${r.period_end}</div>
    </div>
  `).join('');
}

// ── Apply loaded data to page ──
function applyData(data, date) {
  allItems = data.items || [];
  const meta = data.report_meta || {};
  const p0 = allItems.filter(i=>i.priority==='P0').length;
  const p1 = allItems.filter(i=>i.priority==='P1').length;
  const p2 = allItems.filter(i=>i.priority==='P2').length;

  document.getElementById('header-meta').textContent = `${meta.period_start} — ${meta.period_end}`;
  document.getElementById('header-issue').textContent = `第 ${meta.issue} 期`;
  document.getElementById('stat-total').textContent = allItems.length;
  document.getElementById('stat-p0').textContent = p0;
  document.getElementById('stat-p1').textContent = p1;
  document.getElementById('stat-p2').textContent = p2;
  document.getElementById('tab-count-all').textContent = allItems.length;
  document.getElementById('tab-count-p0').textContent = p0;
  document.getElementById('tab-count-p1').textContent = p1;
  document.getElementById('tab-count-p2').textContent = p2;

  renderOverview(data.overview);
  renderDeadlines(data.key_deadlines);
  setFilter('all');

  const trends = document.getElementById('trends-list');
  trends.innerHTML = (data.trends||[]).map(t=>`<li>${t}</li>`).join('');

  document.getElementById('links-grid').innerHTML = OFFICIAL_LINKS
    .map(l=>`<div class="link-item"><a href="${l.url}" target="_blank">${l.label}</a></div>`).join('');

  document.getElementById('site-footer').textContent =
    `报告生成时间：${meta.date} · 下次更新：2026年3月23日（周一）`;
}

// ── Init ──
async function init() {
  // Load manifest for history
  try {
    const mResp = await fetch('/archives/manifest.json');
    const manifest = await mResp.json();
    renderHistoryList(manifest.reports || []);
  } catch(e) { /* silent */ }

  // Load latest report
  try {
    const resp = await fetch(`/archives/${currentDate}/data.json`);
    if (!resp.ok) throw new Error('数据加载失败');
    const data = await resp.json();
    applyData(data, currentDate);
  } catch(e) {
    document.getElementById('cards-container').innerHTML =
      `<div style="padding:40px;text-align:center;color:#999;">数据加载失败：${e.message}</div>`;
  }
}

// Events
document.querySelectorAll('.tab').forEach(t => t.addEventListener('click', () => setFilter(t.dataset.filter)));
document.querySelectorAll('.summary-card').forEach(c => {
  c.addEventListener('click', () => {
    const f = c.dataset.filter;
    if (f) setFilter(f);
  });
});
document.getElementById('btn-history').addEventListener('click', openDrawer);
document.getElementById('drawer-close').addEventListener('click', closeDrawer);
document.getElementById('drawer-mask').addEventListener('click', closeDrawer);

init();
