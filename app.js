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
    
    // 更新概览区域 - 根据日期判断用"已于"还是"将于"
    const overviewAlerts = document.querySelectorAll('.overview-alert .alert-text');
    if (overviewAlerts[0]) {
        const koreaVerb = koreaDays < 0 ? '已于' : '将于';
        overviewAlerts[0].textContent = `韩国 AI Basic Act ${koreaVerb} ${koreaDate} 生效（${formatDaysText(koreaDays)}）`;
    }
    // overviewAlerts[1] 现在是新加坡框架，跳过
    if (overviewAlerts[2]) {
        const ukVerb = ukDays < 0 ? '已于' : '将于';
        overviewAlerts[2].textContent = `英国深度伪造条款${ukVerb} ${ukDate} 生效（${formatDaysText(ukDays)}）`;
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
        id: 'Tracker-20260126',
        date: '2026-01-26',
        title: '第5期报告（新加坡Agentic AI框架）',
        highlights: ['新加坡发布全球首个Agentic AI治理框架', '韩国AI Basic Act已生效', 'Remote Access Security Act参议院待审'],
        legislation: 13,
        litigation: 6,
        isCurrent: true
    },
    {
        id: 'Tracker-20260123',
        date: '2026-01-23',
        title: '第4期报告（TikTok USDS合资企业成立）',
        highlights: ['TikTok USDS Joint Venture正式成立', '美国数据安全监管里程碑'],
        legislation: 12,
        litigation: 6,
        isCurrent: false
    },
    {
        id: 'Tracker-20260122',
        date: '2026-01-22',
        title: '第3期报告（芯片与云服务管制扩展）',
        highlights: ['Remote Access Security Act众议院通过', '芯片与云服务管制全覆盖'],
        legislation: 12,
        litigation: 5,
        isCurrent: false
    },
    {
        id: 'Tracker-20260119',
        date: '2026-01-19',
        title: '第2期报告',
        highlights: ['韩国AI Basic Act即将生效', '英国深度伪造条款倒计时'],
        legislation: 6,
        litigation: 5,
        isCurrent: false
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
                    : `<a class="archive-link" href="archives/${archive.date}/index.html">查看报告</a>`
                }
                <a class="archive-link secondary" href="archives/${archive.date}/data.json" target="_blank">查看数据</a>
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
    if (date === '2026-01-23') {
        return `
            <div class="archive-report-content">
                <div class="report-info">
                    <p><strong>档案编号：</strong>Tracker-20260123</p>
                    <p><strong>报告日期：</strong>2026年1月23日（周四）</p>
                    <p><strong>报告类型：</strong>TikTok USDS合资企业成立特别版</p>
                </div>
                
                <div class="report-section-modal">
                    <h4>本期概述</h4>
                    <p>TikTok USDS Joint Venture LLC于1月23日正式成立，这是美国对外国科技公司数据安全和算法监管的重大里程碑，为AI行业的数据本地化合规提供重要参考。</p>
                </div>

                <div class="report-section-modal">
                    <h4>追踪范围</h4>
                    <ul>
                        <li>立法/法规：12项</li>
                        <li>诉讼/执法：6项（+1项TikTok USDS）</li>
                        <li>覆盖地区：美国、欧盟、中国、英国、韩国、德国、荷兰</li>
                    </ul>
                </div>

                <div class="report-section-modal">
                    <h4>P0 优先关注</h4>
                    <ul>
                        <li><strong style="color:#dc2626;">【今日】TikTok USDS Joint Venture成立</strong> - 美国多数持股，Oracle托管数据和算法</li>
                        <li><strong>Remote Access Security Act (H.R. 2683)</strong> - 众议院通过，等待参议院</li>
                        <li><strong>Meta收购Manus AI案</strong> - 中国商务部审查进行中</li>
                    </ul>
                </div>

                <div class="report-section-modal">
                    <h4>TikTok USDS 核心要点</h4>
                    <ul>
                        <li>股权结构：Silver Lake/Oracle/MGX各15%，ByteDance保留19.9%</li>
                        <li>数据存储：美国用户数据存于Oracle美国云环境</li>
                        <li>算法安全：推荐算法在美国数据上重新训练</li>
                        <li>内容审核：合资企业拥有决策权</li>
                    </ul>
                </div>

                <div class="report-section-modal">
                    <h4>重要时间节点</h4>
                    <ul>
                        <li>2026-01-23：TikTok USDS Joint Venture成立（今日）</li>
                        <li>2026-01-22：韩国AI Basic Act生效（昨日）</li>
                        <li>2026-02-06：英国AI深度伪造条款生效</li>
                    </ul>
                </div>
            </div>
        `;
    }
    if (date === '2026-01-22') {
        return `
            <div class="archive-report-content">
                <div class="report-info">
                    <p><strong>档案编号：</strong>Tracker-20260122</p>
                    <p><strong>报告日期：</strong>2026年1月22日（周三）</p>
                    <p><strong>报告类型：</strong>芯片与云服务管制扩展版</p>
                </div>
                
                <div class="report-section-modal">
                    <h4>本期概述</h4>
                    <p>本期重点扩展了美国芯片与云服务出口管制的追踪范围，新增6项相关立法/法规。</p>
                </div>

                <div class="report-section-modal">
                    <h4>追踪范围</h4>
                    <ul>
                        <li>立法/法规：12项（+6项芯片与云服务管制）</li>
                        <li>诉讼/执法：5项</li>
                        <li>覆盖地区：美国、欧盟、中国、英国、韩国、德国、荷兰</li>
                    </ul>
                </div>

                <div class="report-section-modal">
                    <h4>P0 优先关注</h4>
                    <ul>
                        <li><strong>Remote Access Security Act (H.R. 2683)</strong> - 众议院1月12日以369-22通过，堵住云端出口管制漏洞</li>
                        <li><strong>Meta收购Manus AI案</strong> - 中国商务部审查出口管制与技术转移</li>
                    </ul>
                </div>

                <div class="report-section-modal">
                    <h4>新增芯片与云服务管制追踪</h4>
                    <ul>
                        <li>BIS 先进芯片出口管制规则（A100/H100等）</li>
                        <li>BIS IaaS出口管制规则（云服务算力）</li>
                        <li>半导体设备出口管制（ASML光刻机）</li>
                        <li>Remote Access Security Act（远程访问管制）</li>
                        <li>DOJ 敏感数据跨境传输规则</li>
                        <li>BIS IaaS 客户识别规则（草案）</li>
                    </ul>
                </div>

                <div class="report-section-modal">
                    <h4>重要时间节点</h4>
                    <ul>
                        <li>2026-01-22：韩国AI Basic Act生效（当日）</li>
                        <li>2026-02-06：英国AI深度伪造条款生效</li>
                        <li>待定：Remote Access Security Act参议院审议</li>
                    </ul>
                </div>
            </div>
        `;
    }
    if (date === '2026-01-19') {
        return `
            <div class="archive-report-content">
                <div class="report-info">
                    <p><strong>档案编号：</strong>Tracker-20260119</p>
                    <p><strong>报告日期：</strong>2026年1月19日（周日）</p>
                    <p><strong>报告类型：</strong>常规更新</p>
                </div>
                
                <div class="report-section-modal">
                    <h4>本期概述</h4>
                    <p>第二期报告，重点关注韩国AI Basic Act即将生效及英国深度伪造条款倒计时。</p>
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
                    <h4>重要时间节点</h4>
                    <ul>
                        <li>2026-01-22：韩国AI Basic Act生效</li>
                        <li>2026-02-06：英国AI深度伪造条款生效</li>
                    </ul>
                </div>
            </div>
        `;
    }
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
            </div>
        `;
    }
    return '<p>报告内容加载中...</p>';
}

function getArchiveDataContent(date) {
    if (date === '2026-01-23') {
        return JSON.stringify({
            tracker_id: "Tracker-20260123",
            date: "2026-01-23",
            legislation_count: 12,
            litigation_count: 6,
            regions: ["美国", "欧盟", "中国", "英国", "韩国", "德国", "荷兰"],
            p0_focus: "TikTok USDS合资企业成立 + 进出口管制",
            p0_events: [
                "TikTok USDS Joint Venture成立（今日）",
                "Remote Access Security Act（众议院通过）",
                "Meta收购Manus AI案（调查中）"
            ],
            highlights: [
                "TikTok USDS Joint Venture正式成立",
                "美国数据安全监管里程碑",
                "算法本地化先例"
            ],
            note: "完整数据请查看当期报告"
        }, null, 2);
    } else if (date === '2026-01-22') {
        return JSON.stringify({
            tracker_id: "Tracker-20260122",
            date: "2026-01-22",
            legislation_count: 12,
            litigation_count: 5,
            regions: ["美国", "欧盟", "中国", "英国", "韩国", "德国", "荷兰"],
            p0_focus: "进出口管制与监管制裁",
            highlights: [
                "Remote Access Security Act众议院通过",
                "芯片与云服务管制全覆盖",
                "韩国AI Basic Act生效"
            ],
            note: "完整数据请查看 archives/2026-01-22/data.json"
        }, null, 2);
    } else if (date === '2026-01-19') {
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
        status: "effective", 
        date: "2026-01-22", 
        summary: "亚洲首个全面AI法律框架，已于1月22日生效，AI内容水印义务",
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
        summary: "非自愿深度伪造裸露图像设为刑事犯罪（2月6日生效）",
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
    },
    { 
        id: "LEG-007",
        region: "美国-联邦", 
        name: "BIS 先进芯片出口管制规则", 
        status: "effective", 
        date: "2022-10-07 / 持续更新", 
        summary: "限制向中国出口先进AI芯片（A100/H100等）及半导体制造设备",
        fullSummary: "美国商务部BIS对华芯片出口管制：禁止向中国出口先进AI芯片（如NVIDIA A100、H100、H800等）；限制半导体制造设备出口；限制美国人为中国半导体产业提供支持",
        obligations: ["出口许可证要求", "最终用户/用途审查", "美国人员限制", "设备转让限制"],
        penalties: "违反出口管制可面临刑事和民事处罚",
        officialSource: "https://www.bis.doc.gov/index.php/policy-guidance/semiconductor-related-information",
        officialSourceName: "美国商务部BIS半导体出口管制专页",
        tags: ["export-control", "semiconductor", "AI-chip", "GPU", "China"]
    },
    { 
        id: "LEG-008",
        region: "美国-联邦", 
        name: "BIS IaaS出口管制规则（云服务算力）", 
        status: "effective", 
        date: "2024-01-29 / 生效中", 
        summary: "要求云服务商对外国客户进行KYC，限制提供AI训练算力",
        fullSummary: "针对基础设施即服务(IaaS)的出口管制：要求美国云服务商对外国客户进行身份识别(KYC)；需报告外国客户使用IaaS训练大型AI模型的情况",
        obligations: ["客户身份识别(KYC)", "交易记录保留", "可疑活动报告", "大型AI模型训练活动报告"],
        penalties: "违规可面临民事和刑事处罚",
        officialSource: "https://www.bis.doc.gov/",
        officialSourceName: "BIS IaaS KYC指南",
        tags: ["export-control", "cloud-computing", "IaaS", "compute", "KYC"]
    },
    { 
        id: "LEG-009",
        region: "荷兰/多边", 
        name: "半导体设备出口管制（光刻机）", 
        status: "effective", 
        date: "2023-09-01 / 持续更新", 
        summary: "荷兰限制ASML先进光刻机出口，与美日协调管制",
        fullSummary: "荷兰政府限制ASML向中国出口先进DUV光刻机（EUV早已受限）；与美国、日本协调半导体制造设备出口管制",
        obligations: ["出口许可证申请", "最终用户审查", "技术转让限制"],
        penalties: "违规出口可导致许可证撤销和法律处罚",
        officialSource: "https://www.government.nl/topics/export-controls-of-strategic-goods",
        officialSourceName: "荷兰政府出口管制页面",
        tags: ["export-control", "semiconductor-equipment", "lithography", "ASML", "multilateral"]
    },
    { 
        id: "LEG-010",
        region: "美国-联邦", 
        name: "Remote Access Security Act (H.R. 2683)", 
        status: "pending", 
        priority: "P0",
        date: "2026-01-12 众议院通过", 
        summary: "【P0】堵住云端出口管制漏洞，远程访问受控技术需许可证（等待参议院）",
        fullSummary: "修补'云服务租用规避出口管制'的漏洞：即使芯片/设备不出境，外国人远程访问美国受控技术（包括云端运行的高级AI、算力等）也需要出口许可证。众议院以369-22压倒性票数通过。",
        obligations: ["远程访问受控技术需许可证", "云服务商需审查外国用户访问权限", "与物理出口管制同等适用"],
        penalties: "违反出口管制法规可面临刑事和民事处罚",
        officialSource: "https://www.congress.gov/bill/119th-congress/house-bill/2683",
        officialSourceName: "美国国会法案追踪 (congress.gov)",
        tags: ["export-control", "cloud-computing", "remote-access", "P0"]
    },
    { 
        id: "LEG-011",
        region: "美国-联邦", 
        name: "DOJ 敏感数据跨境传输规则", 
        status: "effective", 
        date: "2025-04-08 生效", 
        summary: "限制向'关注国家'传输敏感个人数据，含云服务场景",
        fullSummary: "司法部(DOJ)规则限制包含美国敏感个人数据和政府相关数据向'关注国家'的传输；适用于供应商协议、雇佣协议、投资协议等场景；'供应商协议'明确包括云计算服务",
        obligations: ["禁止/限制向关注国家传输敏感数据", "云服务商需审查数据流向", "合同条款需符合规则要求"],
        penalties: "民事和刑事处罚",
        officialSource: "https://www.federalregister.gov/",
        officialSourceName: "Federal Register",
        tags: ["data-transfer", "sensitive-data", "countries-of-concern", "cloud-service"]
    },
    { 
        id: "LEG-012",
        region: "美国-联邦", 
        name: "BIS IaaS 客户识别规则（草案）", 
        status: "proposed", 
        date: "2024-01-29 草案发布", 
        summary: "要求云服务商建立外国客户识别程序(CIP)，报告AI训练活动",
        fullSummary: "Commerce部BIS提议规则'Know Your Cloud Customer'：要求美国IaaS提供商及外国转售商建立客户识别程序(CIP)；核验外国客户真实身份和受益所有人",
        obligations: ["客户识别程序(CIP)", "外国客户身份核验", "AI模型训练报告义务"],
        penalties: "民事和刑事处罚（若最终通过）",
        officialSource: "https://www.bis.doc.gov/",
        officialSourceName: "BIS",
        tags: ["cloud-computing", "IaaS", "KYC", "AI-training", "proposed-rule"]
    },
    { 
        id: "LEG-013",
        region: "新加坡", 
        name: "Model AI Governance Framework for Agentic AI", 
        status: "effective", 
        priority: "P0",
        date: "2026-01-22 发布", 
        summary: "【P0】全球首个Agentic AI专门治理框架，四维治理要求",
        fullSummary: "新加坡信息通信媒体发展局(IMDA)发布全球首个专门针对Agentic AI（智能代理AI）的治理框架Version 1.0。针对基于语言模型的AI代理（如编程助手、客服代理、企业自动化工作流），提出四维治理要求：(1) 预先评估和限制风险；(2) 确保人类有意义的责任；(3) 实施技术控制和流程；(4) 赋能最终用户责任。框架为指导性文件，非强制法律，但具有国际示范效应。",
        obligations: ["预先评估代理行为范围和可逆性", "设计人工审批检查点(高风险/不可逆操作)", "开发阶段技术控制+部署前测试+部署后监控", "告知用户代理行为范围并提供培训"],
        penalties: "指导性框架，非强制法律",
        officialSource: "https://www.imda.gov.sg/-/media/imda/files/about/emerging-tech-and-research/artificial-intelligence/mgf-for-agentic-ai.pdf",
        officialSourceName: "新加坡IMDA官网",
        tags: ["agentic-ai", "governance-framework", "ai-agents", "human-oversight", "international-standard", "P0"]
    }
];

const litigationData = [
    { 
        id: "LIT-006",
        region: "美国", 
        name: "TikTok USDS Joint Venture 成立", 
        status: "decided", 
        priority: "P0", 
        date: "2026-01-23",
        summary: "【P0】美国多数持股合资企业正式成立，Oracle托管数据和算法",
        fullSummary: "TikTok USDS Joint Venture LLC 于2026年1月23日正式成立，遵守美国政府的监管要求。该合资企业由美国投资者多数持股（Silver Lake、Oracle、MGX各持15%，ByteDance保留19.9%），将负责：(1) 美国用户数据存储在Oracle的美国云环境中；(2) 推荐算法在美国数据上重新训练并托管于美国；(3) 内容审核决策权归合资企业；(4) 持续的第三方安全审计。这是美国对外国科技公司数据安全监管的重大里程碑。",
        parties: { complainant: "美国政府/行政命令", respondent: "TikTok / ByteDance → TikTok USDS Joint Venture" },
        decision: "合规解决方案：成立美国多数持股合资企业，数据和算法托管于Oracle美国云",
        potentialImpact: "为其他外国科技公司（尤其是AI公司）在美国运营设立数据本地化和算法审查先例；可能影响中国AI公司在美国市场的运营模式",
        source: "https://newsroom.tiktok.com/announcement-from-the-new-tiktok-usds-joint-venture-llc",
        tags: ["data-localization", "algorithm-security", "national-security", "precedent", "P0"]
    },
    { 
        id: "LIT-002",
        region: "中国", 
        name: "Meta收购Manus AI案", 
        status: "ongoing", 
        priority: "P0", 
        summary: "中国商务部审查出口管制与技术转移",
        fullSummary: "中国团队创立、注册于新加坡的AI公司Manus被Meta收购后，中国监管机构审查是否违反出口管制法与技术转移规定；被认为是对美国企业收购涉华AI技术/人才的警告",
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
    
    // 按重要性排序：P0优先 > 状态(imminent > pending > effective > proposed)
    const statusOrder = { 'imminent': 1, 'pending': 2, 'effective': 3, 'proposed': 4 };
    const sortedData = [...legislationData].sort((a, b) => {
        if (a.priority === 'P0' && b.priority !== 'P0') return -1;
        if (b.priority === 'P0' && a.priority !== 'P0') return 1;
        return (statusOrder[a.status] || 5) - (statusOrder[b.status] || 5);
    });
    
    container.innerHTML = sortedData.map(item => `
        <div class="leg-card ${item.priority === 'P0' ? 'priority-p0' : ''}" data-id="${item.id}" data-type="legislation">
            <div class="card-header">
                <span class="card-region">${item.region}</span>
                <span class="card-status ${item.status}">${getStatusLabel(item.status)}</span>
                ${item.priority === 'P0' ? '<span class="card-priority p0">P0</span>' : ''}
            </div>
            <h3 class="card-title">${item.name}</h3>
            <p class="card-summary">${item.summary}</p>
            <div class="card-tags">
                ${(item.tags || []).slice(0, 3).map(tag => `<span class="card-tag">${tag}</span>`).join('')}
            </div>
            <p class="card-date">${item.date}</p>
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
    
    // 按重要性排序：P0优先 > 状态(ongoing > decided)
    const statusOrder = { 'ongoing': 1, 'decided': 2 };
    const sortedData = [...litigationData].sort((a, b) => {
        if (a.priority === 'P0' && b.priority !== 'P0') return -1;
        if (b.priority === 'P0' && a.priority !== 'P0') return 1;
        return (statusOrder[a.status] || 3) - (statusOrder[b.status] || 3);
    });
    
    container.innerHTML = sortedData.map(item => `
        <div class="lit-card ${item.priority === 'P0' ? 'priority-p0' : ''}" data-id="${item.id}" data-type="litigation">
            <div class="card-header">
                <span class="card-region">${item.region}</span>
                <span class="card-status ${item.status}">${getStatusLabel(item.status)}</span>
                ${item.priority === 'P0' ? '<span class="card-priority p0">P0</span>' : ''}
            </div>
            <h3 class="card-title">${item.name}</h3>
            <p class="card-summary">${item.summary}</p>
            <div class="card-tags">
                ${(item.tags || []).slice(0, 3).map(tag => `<span class="card-tag">${tag}</span>`).join('')}
            </div>
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
