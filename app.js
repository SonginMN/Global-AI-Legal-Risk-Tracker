document.addEventListener('DOMContentLoaded', () => {
    initTabs();
    renderLegislation();
    renderLitigation();
    initModal();
    updateDynamicDates();
    renderArchives();
});

// 动态计算距离目标日期的天数
function calculateDaysUntil(targetDate) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const target = new Date(targetDate);
    target.setHours(0, 0, 0, 0);
    const diffTime = target - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
}

function formatDaysText(days) {
    if (days < 0) {
        return `${Math.abs(days)}天前`;
    } else if (days === 0) {
        return '今天';
    } else {
        return `${days}天后`;
    }
}

function updateDynamicDates() {
    // 更新概览区域的日期
    const koreaDate = '2026-01-22';
    const ukDate = '2026-02-06';
    
    const koreaDays = calculateDaysUntil(koreaDate);
    const ukDays = calculateDaysUntil(ukDate);
    
    // 更新概览区域
    const overviewAlerts = document.querySelectorAll('.overview-alert .alert-text');
    if (overviewAlerts[0]) {
        overviewAlerts[0].textContent = `韩国 AI Basic Act 将于 ${koreaDate} 生效（${formatDaysText(koreaDays)}）`;
    }
    if (overviewAlerts[1]) {
        overviewAlerts[1].textContent = `英国深度伪造条款将于 ${ukDate} 生效（${formatDaysText(ukDays)}）`;
    }
    
    // 更新分析报告中的日期显示
    const highlightDates = document.querySelectorAll('.highlight-date');
    highlightDates.forEach(el => {
        const text = el.textContent;
        if (text.includes('2026-01-22')) {
            el.textContent = `${koreaDate}（${formatDaysText(koreaDays)}）`;
        } else if (text.includes('2026-02-06')) {
            el.textContent = `${ukDate}（${formatDaysText(ukDays)}）`;
        }
    });
    
    // 更新时间线
    updateTimelineDates();
}

function updateTimelineDates() {
    const timelineItems = document.querySelectorAll('.timeline-item');
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    timelineItems.forEach(item => {
        const dateEl = item.querySelector('.timeline-date');
        const contentEl = item.querySelector('.timeline-content h4');
        if (!dateEl) return;
        
        const dateStr = dateEl.textContent;
        const itemDate = new Date(dateStr);
        itemDate.setHours(0, 0, 0, 0);
        
        const days = calculateDaysUntil(dateStr);
        
        // 更新样式类
        item.classList.remove('past', 'upcoming', 'critical', 'future');
        
        if (days < 0) {
            item.classList.add('past');
        } else if (days <= 7) {
            item.classList.add('upcoming');
            if (days <= 3) {
                item.classList.add('critical');
            }
        } else {
            item.classList.add('future');
        }
        
        // 更新标题中的天数显示
        if (contentEl && days >= 0 && days <= 30) {
            const baseText = contentEl.textContent.replace(/（.*天后）/g, '').replace(/（今天）/g, '');
            if (!baseText.includes('Tracker')) {
                contentEl.textContent = `${baseText}（${formatDaysText(days)}）`;
            }
        }
    });
}

// 历史归档数据
const archivesData = [
    {
        id: 'Tracker-20260119',
        date: '2026-01-19',
        title: '第2期报告',
        highlights: ['韩国AI Basic Act即将生效', '英国深度伪造条款倒计时'],
        legislation: 6,
        litigation: 5,
        isCurrent: true
    },
    {
        id: 'Tracker-20260116',
        date: '2026-01-16',
        title: '第1期报告（首次发布）',
        highlights: ['项目启动', '建立追踪框架'],
        legislation: 6,
        litigation: 5,
        isCurrent: false
    }
];

function renderArchives() {
    const container = document.getElementById('archives-list');
    if (!container) return;
    
    container.innerHTML = archivesData.map((archive, index) => `
        <div class="archive-item ${archive.isCurrent ? 'current' : ''}">
            <div class="archive-header">
                <div class="archive-info">
                    <span class="archive-date">${archive.date}</span>
                    <h4 class="archive-title">${archive.title}</h4>
                    <span class="archive-id">${archive.id}</span>
                </div>
                ${archive.isCurrent ? '<span class="archive-badge">当前</span>' : ''}
            </div>
            <div class="archive-meta">
                <span>立法/法规: ${archive.legislation}</span>
                <span>诉讼/执法: ${archive.litigation}</span>
            </div>
            <div class="archive-highlights">
                ${archive.highlights.map(h => `<span class="archive-tag">${h}</span>`).join('')}
            </div>
            <div class="archive-actions">
                ${archive.isCurrent 
                    ? `<button class="archive-link" onclick="switchToTab('analysis')">查看报告</button>`
                    : `<button class="archive-link" onclick="showArchiveReport('${archive.date}')">查看报告</button>`
                }
                <button class="archive-link secondary" onclick="showArchiveData('${archive.date}')">查看数据</button>
            </div>
        </div>
    `).join('');
}

function switchToTab(tabId) {
    const tabBtn = document.querySelector(`.tab-btn[data-tab="${tabId}"]`);
    if (tabBtn) tabBtn.click();
}

function showArchiveReport(date) {
    const reportContent = getArchiveReportContent(date);
    showArchiveModal(`${date} 分析报告`, reportContent);
}

function showArchiveData(date) {
    const dataContent = getArchiveDataContent(date);
    showArchiveModal(`${date} 结构化数据`, `<pre class="json-display">${dataContent}</pre>`);
}

function showArchiveModal(title, content) {
    document.getElementById('modal-title').textContent = title;
    document.getElementById('modal-body').innerHTML = content;
    openModal();
}

function getArchiveReportContent(date) {
    if (date === '2026-01-16') {
        return `
            <div class="archive-report-content">
                <div class="report-info">
                    <p><strong>档案编号：</strong>Tracker-20260116</p>
                    <p><strong>报告日期：</strong>2026年1月16日（周五）</p>
                    <p><strong>报告类型：</strong>首次发布</p>
                </div>
                
                <div class="report-section-modal">
                    <h4>本期概述</h4>
                    <p>这是 Global AI Legal Risk Tracker 的首期报告，建立了全球AI法律风险追踪框架。</p>
                </div>

                <div class="report-section-modal">
                    <h4>追踪范围</h4>
                    <ul>
                        <li>立法/法规：6项</li>
                        <li>诉讼/执法：5项</li>
                        <li>覆盖地区：美国、欧盟、中国、英国、韩国、德国</li>
                    </ul>
                </div>

                <div class="report-section-modal">
                    <h4>P0 优先关注</h4>
                    <p>进出口管制与监管制裁，重点跟踪中国商务部对Meta收购Manus AI案的调查。</p>
                </div>

                <div class="report-section-modal">
                    <h4>重要时间节点</h4>
                    <ul>
                        <li>2026-01-22：韩国AI Basic Act生效</li>
                        <li>2026-02-06：英国AI深度伪造条款生效</li>
                    </ul>
                </div>
            </div>
        `;
    }
    return '<p>报告内容加载中...</p>';
}

function getArchiveDataContent(date) {
    if (date === '2026-01-19') {
        return JSON.stringify({
            tracker_id: "Tracker-20260119",
            date: "2026-01-19",
            legislation_count: 6,
            litigation_count: 5,
            regions: ["美国", "欧盟", "中国", "英国", "韩国", "德国"],
            p0_focus: "进出口管制与监管制裁",
            highlights: [
                "韩国AI Basic Act即将生效（3天后）",
                "英国深度伪造条款倒计时（18天后）"
            ],
            note: "完整数据请查看 archives/2026-01-19/data.json"
        }, null, 2);
    } else if (date === '2026-01-16') {
        return JSON.stringify({
            tracker_id: "Tracker-20260116",
            date: "2026-01-16",
            legislation_count: 6,
            litigation_count: 5,
            regions: ["美国", "欧盟", "中国", "英国", "韩国", "德国"],
            p0_focus: "进出口管制与监管制裁",
            highlights: [
                "项目启动",
                "建立追踪框架"
            ],
            note: "完整数据请查看 archives/2026-01-16/data.json"
        }, null, 2);
    }
    return '{}';
}

function initTabs() {
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabPanes = document.querySelectorAll('.tab-pane');
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const tabId = btn.dataset.tab;
            tabBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            tabPanes.forEach(pane => {
                pane.classList.remove('active');
                if (pane.id === tabId) pane.classList.add('active');
            });
        });
    });
}

const legislationData = [
    { 
        id: "LEG-001",
        region: "美国-加州", 
        name: "California AI Transparency Act (SB-942)", 
        status: "effective", 
        date: "2026-01-01", 
        summary: "月活>100万的AI系统须披露AI生成内容，提供检测工具",
        fullSummary: "针对月活用户超过100万的生成式AI系统：使用时必须披露AI生成内容；需提供免费的AI内容检测工具；违规每日罚款最高$5,000",
        obligations: ["AI生成内容必须披露", "提供免费AI内容检测工具", "适用于月活>100万的公开AI系统"],
        penalties: "每日罚款最高 $5,000",
        officialSource: "https://leginfo.legislature.ca.gov/faces/billTextClient.xhtml?bill_id=202320240SB942",
        officialSourceName: "加州立法信息网 (leginfo.legislature.ca.gov)",
        tags: ["transparency", "disclosure", "generative-ai"]
    },
    { 
        id: "LEG-002",
        region: "美国-德州", 
        name: "Texas RAIGA (HB 1709)", 
        status: "effective", 
        date: "2026-01-01", 
        summary: "禁止AI用于受限用途，要求风险评估与审计",
        fullSummary: "禁止AI用于特定受限用途（如鼓励自残、暴力、儿童性虐待内容、深伪内容等）；要求风险评估、功能说明、监控与审计",
        obligations: ["禁止受限用途", "风险评估义务", "功能说明文档", "监控与审计机制"],
        penalties: "州检察长可发起民事调查",
        officialSource: "https://capitol.texas.gov/BillLookup/History.aspx?LegSess=89R&Bill=HB1709",
        officialSourceName: "德州立法在线 (capitol.texas.gov)",
        tags: ["restricted-uses", "risk-assessment", "child-safety"]
    },
    { 
        id: "LEG-003",
        region: "欧盟", 
        name: "EU AI Act (Regulation 2024/1689)", 
        status: "effective", 
        date: "2024-08-01", 
        summary: "风险分级监管，最高罚款全球营业额7%",
        fullSummary: "风险分级监管框架：禁止不可接受风险用途；高风险AI应用需严格合规；通用型AI(GPAI)透明度要求；最高罚款全球营业额7%或€3500万",
        obligations: ["风险分级合规", "训练数据透明度", "偏见测试", "外部审计", "能力披露"],
        penalties: "最高全球营业额7%或€3500万",
        officialSource: "http://data.europa.eu/eli/reg/2024/1689/oj",
        officialSourceName: "EUR-Lex 欧盟官方公报",
        tags: ["risk-based", "high-risk", "GPAI", "transparency"]
    },
    { 
        id: "LEG-004",
        region: "韩国", 
        name: "AI Basic Act", 
        status: "imminent", 
        date: "2026-01-22", 
        summary: "亚洲首个全面AI法律框架，3天后生效，AI内容水印义务",
        fullSummary: "亚洲首个全面性AI法律框架：设立国家AI委员会；高影响力AI系统需风险评估、透明度披露；AI生成内容标签/水印义务",
        obligations: ["高影响力AI系统风险管理", "持续监测社会影响", "AI内容水印/标签", "文档保存"],
        penalties: "设有至少一年宽限期，主要先指导、咨询",
        officialSource: "https://aibasicact.kr/",
        officialSourceName: "韩国AI基本法官方网站 (aibasicact.kr)",
        tags: ["high-impact", "watermark", "transparency", "asia"]
    },
    { 
        id: "LEG-005",
        region: "英国", 
        name: "Data (Use and Access) Act - 深度伪造条款", 
        status: "pending", 
        date: "2026-02-06", 
        summary: "非自愿深度伪造裸露图像设为刑事犯罪（18天后生效）",
        fullSummary: "将创造或请求非自愿AI深度伪造裸露图像设为刑事犯罪；纳入Online Safety Act优先罪行；Ofcom可处以最高全球营收10%罚款",
        obligations: ["禁止非自愿深度伪造裸露图像", "平台内容审核义务"],
        penalties: "最高全球营收10%",
        officialSource: "https://bills.parliament.uk/bills/3825",
        officialSourceName: "英国议会法案追踪 (parliament.uk)",
        tags: ["deepfake", "intimate-images", "criminal", "child-safety"]
    },
    { 
        id: "LEG-006",
        region: "中国", 
        name: "网络安全法修正案（草案）", 
        status: "proposed", 
        date: "待定", 
        summary: "加强AI监管，加重跨境数据传输违法处罚",
        fullSummary: "加强AI与新兴技术监管；扩展网络运营者与关键基础设施合规义务；加重数据处理、跨境数据传输违法处罚",
        obligations: ["AI技术监管加强", "关键基础设施合规", "跨境数据传输管控"],
        penalties: "加重违法处罚",
        officialSource: "http://www.cac.gov.cn/",
        officialSourceName: "国家互联网信息办公室 (cac.gov.cn)",
        relatedLaw: "https://www.cac.gov.cn/2016-11/07/c_1119867116.htm",
        relatedLawName: "现行《网络安全法》全文",
        tags: ["cybersecurity", "cross-border-data", "critical-infrastructure"]
    }
];

const litigationData = [
    { 
        id: "LIT-002",
        region: "中国", 
        name: "Meta收购Manus AI案", 
        status: "ongoing", 
        priority: "P0", 
        summary: "中国商务部审查出口管制与技术转移",
        fullSummary: "日本AI创业公司Manus被Meta收购后，中国监管机构审查是否违反出口管制法与技术转移规定；被认为是对美国企业收购中国AI技术/人才的警告",
        parties: { complainant: "中国商务部", respondent: "Meta / Manus AI" },
        potentialImpact: "可能要求交易条件、罚款或限制未来类似并购",
        source: "https://www.businessinsider.com/china-probe-meta-manus-deal-warning-us-analysts-singapore-washing-2026-1",
        tags: ["m&a", "export-control", "technology-transfer", "cross-border"]
    },
    { 
        id: "LIT-004",
        region: "德国", 
        name: "GEMA v. OpenAI", 
        status: "decided", 
        summary: "OpenAI败诉，歌词记忆构成版权侵权",
        fullSummary: "GEMA起诉OpenAI未授权使用德国歌曲歌词，LLM将其记忆并在回答时再现文本构成版权侵权",
        parties: { plaintiff: "GEMA (德国版权集体管理组织)", defendant: "OpenAI" },
        decision: "OpenAI被判侵权；歌词记忆本身构成复制行为；Text & Data Mining例外不能免责",
        potentialImpact: "对AI模型训练使用受版权保护内容具有重要示范性参照价值",
        source: "https://www.nbs-partners.de/en/latest-news/gema-wins-against-open-ai-in-dispute-over-usage-rights/",
        tags: ["copyright", "training-data", "TDM-exception", "landmark-case"]
    },
    { 
        id: "LIT-001",
        region: "欧盟", 
        name: "Google AI训练数据反垄断调查", 
        status: "ongoing", 
        summary: "指控未经补偿使用出版物内容",
        fullSummary: "指控Google在'AI Overviews'和'AI Mode'功能中使用出版物和YouTube内容未经合理补偿，且未允许内容创作者选择退出，可能违反竞争法",
        parties: { complainant: "欧盟委员会", respondent: "Google" },
        potentialImpact: "若被判违法可能被处以高额罚款（最高全球营收10%）",
        source: "https://apnews.com/article/a0267a57b55849b1855ebe08d0788c45",
        tags: ["antitrust", "training-data", "copyright", "opt-out"]
    },
    { 
        id: "LIT-003",
        region: "英国", 
        name: "Grok深度伪造调查", 
        status: "ongoing", 
        summary: "Ofcom调查非自愿性图像生成",
        fullSummary: "Grok AI工具被指生成含未成年人或真实人物的性化/裸露图像；X已在法律禁止地区禁止此类图像生成",
        parties: { complainant: "Ofcom", respondent: "xAI / X (Grok)" },
        potentialImpact: "新法律将使创建或请求此类图像构成刑事罪；平台可能面临最高全球营收10%罚款",
        source: "https://www.theguardian.com/technology/2026/jan/15/grok-ai-images-uk-limits-x-app-ofcom",
        tags: ["deepfake", "intimate-images", "platform-liability", "child-safety"]
    },
    { 
        id: "LIT-005",
        region: "美国", 
        name: "FTC AI聊天机器人调查", 
        status: "ongoing", 
        summary: "调查消费者AI聊天机器人安全机制",
        fullSummary: "FTC调查七家公司的消费者AI聊天机器人，关注这些系统如何测试、监控及防止潜在伤害",
        parties: { complainant: "美国联邦贸易委员会(FTC)", respondent: "七家AI公司" },
        potentialImpact: "可能带来行政处罚；要求AI聊天系统治理机制透明化",
        source: "https://www.mondaq.com/unitedstates/new-technology/1706598/ai-litigation-enforcement-and-compliance-risk-q4-2025-regulatory-update",
        tags: ["consumer-protection", "chatbot", "harm-prevention"]
    }
];

function renderLegislation() {
    const container = document.getElementById('legislation-cards');
    if (!container) return;
    container.innerHTML = legislationData.map(item => `
        <div class="leg-card" data-id="${item.id}" data-type="legislation">
            <div class="card-header">
                <span class="card-region">${item.region}</span>
                <span class="card-status ${item.status}">${getStatusLabel(item.status)}</span>
            </div>
            <h3 class="card-title">${item.name}</h3>
            <p class="card-summary">${item.summary}</p>
            <p class="card-date">${item.date}</p>
            <p class="card-click-hint">点击查看详情 →</p>
        </div>
    `).join('');
    
    // Add click events
    container.querySelectorAll('.leg-card').forEach(card => {
        card.addEventListener('click', () => {
            const id = card.dataset.id;
            const item = legislationData.find(l => l.id === id);
            if (item) showLegislationModal(item);
        });
    });
}

function renderLitigation() {
    const container = document.getElementById('litigation-cards');
    if (!container) return;
    container.innerHTML = litigationData.map(item => `
        <div class="lit-card" data-id="${item.id}" data-type="litigation" style="${item.priority === 'P0' ? 'border-color:#dc2626;background:linear-gradient(135deg,#fff 0%,#fef2f2 100%);' : ''}">
            <div class="card-header">
                <span class="card-region">${item.region}</span>
                <div>
                    ${item.priority === 'P0' ? '<span style="background:#dc2626;color:white;padding:2px 8px;border-radius:6px;font-size:0.7rem;margin-right:4px;font-weight:600;">P0</span>' : ''}
                    <span class="card-status ${item.status}">${getStatusLabel(item.status)}</span>
                </div>
            </div>
            <h3 class="card-title">${item.name}</h3>
            <p class="card-summary">${item.summary}</p>
            <p class="card-click-hint">点击查看详情 →</p>
        </div>
    `).join('');
    
    // Add click events
    container.querySelectorAll('.lit-card').forEach(card => {
        card.addEventListener('click', () => {
            const id = card.dataset.id;
            const item = litigationData.find(l => l.id === id);
            if (item) showLitigationModal(item);
        });
    });
}

function getStatusLabel(status) {
    const labels = { 
        effective: '已生效', 
        pending: '待生效', 
        imminent: '即将生效', 
        proposed: '草案', 
        ongoing: '进行中', 
        decided: '已判决' 
    };
    return labels[status] || status;
}

// Modal functionality
let modalOverlay;

function initModal() {
    // Create modal container
    modalOverlay = document.createElement('div');
    modalOverlay.className = 'modal-overlay';
    modalOverlay.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3 id="modal-title"></h3>
                <button class="modal-close">✕</button>
            </div>
            <div class="modal-body" id="modal-body"></div>
        </div>
    `;
    document.body.appendChild(modalOverlay);
    
    // Close on overlay click
    modalOverlay.addEventListener('click', (e) => {
        if (e.target === modalOverlay) closeModal();
    });
    
    // Close button
    modalOverlay.querySelector('.modal-close').addEventListener('click', closeModal);
    
    // Close on Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeModal();
    });
}

function showLegislationModal(item) {
    document.getElementById('modal-title').textContent = item.name;
    
    const relatedLawHtml = item.relatedLaw ? `
        <a href="${item.relatedLaw}" target="_blank" class="modal-link" style="margin-left:1rem;">
            📄 ${item.relatedLawName || '相关法律'}
        </a>
    ` : '';
    
    document.getElementById('modal-body').innerHTML = `
        <div class="modal-section">
            <div class="modal-info-grid">
                <div class="modal-info-item">
                    <label>地区</label>
                    <span>${item.region}</span>
                </div>
                <div class="modal-info-item">
                    <label>状态</label>
                    <span>${getStatusLabel(item.status)}</span>
                </div>
                <div class="modal-info-item">
                    <label>生效日期</label>
                    <span>${item.date}</span>
                </div>
                <div class="modal-info-item">
                    <label>编号</label>
                    <span>${item.id}</span>
                </div>
            </div>
        </div>
        
        <div class="modal-section">
            <h4>概述</h4>
            <p>${item.fullSummary}</p>
        </div>
        
        <div class="modal-section">
            <h4>核心义务</h4>
            <ul>
                ${item.obligations.map(o => `<li>${o}</li>`).join('')}
            </ul>
        </div>
        
        <div class="modal-section">
            <h4>处罚</h4>
            <p>${item.penalties}</p>
        </div>
        
        <div class="modal-section">
            <h4>标签</h4>
            <div>
                ${item.tags.map(t => `<span class="modal-tag">${t}</span>`).join('')}
            </div>
        </div>
        
        <div class="modal-section" style="background:#f8fafc;padding:1rem;border-radius:8px;border:1px solid var(--border-color);">
            <h4>官方法条链接</h4>
            <p style="font-size:0.85rem;color:#4b5563;margin-bottom:0.5rem;">${item.officialSourceName}</p>
            <a href="${item.officialSource}" target="_blank" class="modal-link" style="margin-top:0;">
                查看官方法条全文 →
            </a>
            ${relatedLawHtml}
        </div>
    `;
    openModal();
}

function showLitigationModal(item) {
    document.getElementById('modal-title').textContent = item.name;
    
    const partiesHtml = item.parties ? `
        <div class="modal-section">
            <h4>当事方</h4>
            <div class="modal-info-grid">
                ${item.parties.complainant ? `<div class="modal-info-item"><label>申诉方/原告</label><span>${item.parties.complainant || item.parties.plaintiff}</span></div>` : ''}
                ${item.parties.respondent ? `<div class="modal-info-item"><label>被申诉方/被告</label><span>${item.parties.respondent || item.parties.defendant}</span></div>` : ''}
            </div>
        </div>
    ` : '';
    
    const decisionHtml = item.decision ? `
        <div class="modal-section">
            <h4>判决结果</h4>
            <p>${item.decision}</p>
        </div>
    ` : '';
    
    document.getElementById('modal-body').innerHTML = `
        <div class="modal-section">
            <div class="modal-info-grid">
                <div class="modal-info-item">
                    <label>地区</label>
                    <span>${item.region}</span>
                </div>
                <div class="modal-info-item">
                    <label>状态</label>
                    <span>${getStatusLabel(item.status)}</span>
                </div>
                ${item.priority ? `<div class="modal-info-item"><label>优先级</label><span style="color:#dc2626;font-weight:600;">${item.priority}</span></div>` : ''}
                <div class="modal-info-item">
                    <label>编号</label>
                    <span>${item.id}</span>
                </div>
            </div>
        </div>
        
        ${partiesHtml}
        
        <div class="modal-section">
            <h4>案件概述</h4>
            <p>${item.fullSummary}</p>
        </div>
        
        ${decisionHtml}
        
        <div class="modal-section">
            <h4>潜在影响</h4>
            <p>${item.potentialImpact}</p>
        </div>
        
        <div class="modal-section">
            <h4>标签</h4>
            <div>
                ${item.tags.map(t => `<span class="modal-tag">${t}</span>`).join('')}
            </div>
        </div>
        
        <a href="${item.source}" target="_blank" class="modal-link">
            查看来源 →
        </a>
    `;
    openModal();
}

function openModal() {
    modalOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeModal() {
    modalOverlay.classList.remove('active');
    document.body.style.overflow = '';
}
