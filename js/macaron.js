// L'Atelier des Macarons - Logic Core
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        const overlay = document.getElementById('entrance-overlay');
        if (overlay) overlay.style.opacity = '0';
        setTimeout(() => overlay && overlay.remove(), 1500);
    }, 5500);

    document.getElementById('btn-calc').addEventListener('click', calculateStructure);
    document.getElementById('image-upload')?.addEventListener('change', handleImageUpload);
    document.getElementById('img-upload')?.addEventListener('change', handleImageUpload);
    document.getElementById('btn-learn').addEventListener('click', openLearnModal);
    document.getElementById('learn-close').addEventListener('click', closeLearnModal);
    document.getElementById('layer-close').addEventListener('click', () => {
        document.getElementById('layer-modal').classList.add('hidden');
    });
    document.getElementById('bp-search-btn').addEventListener('click', handleBlueprintSearch);
    document.getElementById('btn-explode').addEventListener('click', toggleLayerBreakdown);
    document.getElementById('btn-prep')?.addEventListener('click', showPrepTutorial);

    calculateStructure();
});

let macaronData = { d: 4, n: 20 };
let colorMapping = {};
let pixelMatrix = [];
let isBrokenDown = false;

function calculateStructure() {
    isBrokenDown = false;
    const d = parseFloat(document.getElementById('in-dia').value) || 4;
    const n = parseInt(document.getElementById('in-num').value) || 20;

    macaronData = { d, n };

    // 核心物理公式：单枚马卡龙外壳(双片)理论重 ≈ 0.75 * D^2 (克) 
    // 单枚夹心理论重 ≈ 0.5 * D^2 (克)
    const shellWeightPerUnit = 0.75 * d * d;
    const fillWeightPerUnit = 0.5 * d * d;

    const totalShellWeight = shellWeightPerUnit * n;
    const totalFillWeight = fillWeightPerUnit * n;

    // 法式蛋白霜流派配比 (杏仁:糖粉:蛋清:细砂糖 = 1.2 : 1.2 : 1 : 1) ≈ 30% : 30% : 20% : 20%
    const almond = (totalShellWeight * 0.3).toFixed(1);
    const icing = (totalShellWeight * 0.3).toFixed(1);
    const egg = (totalShellWeight * 0.2).toFixed(1);
    const caster = (totalShellWeight * 0.2).toFixed(1);

    const ganache = totalFillWeight.toFixed(1);

    macaronData.mats = { almond, icing, egg, caster, ganache };

    // 渲染物资清单
    const matsList = document.getElementById('mats-list');
    matsList.innerHTML = `
        <div class="mat-category" style="color:#d47c9e;">■ 核心食材提取库 (Matières Premières)</div>
        <ul class="mat-ul">
            <li><span><strong style="color:#8e6a7c;">Tpt粉底：</strong>超细马卡龙专用纯杏仁粉</span> <span class="fw-bold">${almond} g</span></li>
            <li><span><strong style="color:#8e6a7c;">Tpt粉底：</strong>无淀粉特级纯糖粉</span> <span class="fw-bold">${icing} g</span></li>
            <li><span><strong style="color:#8e6a7c;">液压核心：</strong>冰箱陈化 24~48H 的老态蛋清</span> <span class="fw-bold">${egg} g</span></li>
            <li><span><strong style="color:#8e6a7c;">结构支撑：</strong>超细幼砂糖 (用以稳固蛋白霜气室)</span> <span class="fw-bold">${caster} g</span></li>
            <li><span><strong style="color:#8e6a7c;">力学胶水：</strong>夹心巧克力淡奶油甘纳许液</span> <span class="fw-bold">${ganache} g</span></li>
        </ul>
        <div class="mat-category" style="color:#d47c9e; margin-top:15px;">■ 必需重型工具军火 (Outils Indispensables)</div>
        <ul class="mat-ul" style="list-style: square;">
            <li><span>精准到 0.1g 的高敏电子秤 <span style="color:#b56a6a;">(严重声明：失去此物必败)</span></span></li>
            <li><span>烤箱内置挂式探针温度计 <span style="color:#888;">(屏蔽烤箱旋钮的欺骗性虚假温度)</span></span></li>
            <li><span>绝对无油无水无垢的「不锈钢打蛋盆」与电动打蛋器</span></li>
            <li><span>马卡龙专用玻璃纤维特氟龙/硅胶塔夫绸烤垫</span></li>
            <li><span>刚性硅胶刮刀 与 10mm 标准圆孔不锈钢裱花嘴</span></li>
            <li><span style="color:#b3769c; font-weight:bold;">表面彩绘器列：0.05mm 细头干性可食用色素微雕笔</span></li>
        </ul>
    `;

    renderMacaronSVG(d);
}

function iso(x, y, z) {
    return {
        x: (x - y) * 0.866,
        y: ((x + y) * 0.5) - z
    };
}

function renderMacaronSVG(d) {
    const group = document.getElementById('render-group');
    group.innerHTML = '';

    // 视口 -200 to 200
    // 马卡龙高度大约是直径的 0.6 倍
    const h = d * 0.6;
    const scale = 200 / d; // 缩放因子

    // 为了适应 ISO 视角，将 D 映射为 L 和 W (由于是圆，L=W=D)
    const L = d * scale * 0.6;
    const W = d * scale * 0.6;
    const H = h * scale * 0.6;

    const gBot = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    const gFill = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    const gTop = document.createElementNS('http://www.w3.org/2000/svg', 'g');

    gBot.setAttribute('id', 'layer-bot');
    gFill.setAttribute('id', 'layer-fill');
    gTop.setAttribute('id', 'layer-top');

    gBot.style.transition = 'transform 1.2s cubic-bezier(0.1, 0.9, 0.2, 1)';
    gFill.style.transition = 'transform 1.2s cubic-bezier(0.1, 0.9, 0.2, 1)';
    gTop.style.transition = 'transform 1.2s cubic-bezier(0.1, 0.9, 0.2, 1)';

    const cBase = iso(L / 2, W / 2, -H / 2);
    const cFillBot = iso(L / 2, W / 2, -H * 0.1);
    const cFillTop = iso(L / 2, W / 2, H * 0.1);
    const cTop = iso(L / 2, W / 2, H / 2);

    const rx = (L / 2) * 0.866 * 2;
    const ry = (L / 2) * 0.5 * 2;

    // -- Bottom Shell (Coque Inférieure) --
    // 下裙边
    const pBotPied = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    pBotPied.setAttribute('d', `M ${cFillBot.x - rx * 1.05} ${cFillBot.y} Q ${cFillBot.x} ${cFillBot.y + ry + 8} ${cFillBot.x + rx * 1.05} ${cFillBot.y} L ${cBase.x + rx * 0.9} ${cBase.y - 10} Q ${cBase.x} ${cBase.y + ry * 0.9 - 10} ${cBase.x - rx * 0.9} ${cBase.y - 10} Z`);
    pBotPied.setAttribute('fill', '#e6a8c4'); pBotPied.setAttribute('stroke', '#b3769c'); pBotPied.setAttribute('stroke-width', '2');
    // 下穹顶
    const pBotDome = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    pBotDome.setAttribute('d', `M ${cBase.x - rx * 0.9} ${cBase.y - 10} C ${cBase.x - rx * 0.9} ${cBase.y + ry * 2}, ${cBase.x + rx * 0.9} ${cBase.y + ry * 2}, ${cBase.x + rx * 0.9} ${cBase.y - 10} Z`);
    pBotDome.setAttribute('fill', '#f0b1cd'); pBotDome.setAttribute('stroke', '#b3769c'); pBotDome.setAttribute('stroke-width', '2');
    // 下平切面
    const eBotFlat = document.createElementNS('http://www.w3.org/2000/svg', 'ellipse');
    eBotFlat.setAttribute('cx', cFillBot.x); eBotFlat.setAttribute('cy', cFillBot.y); eBotFlat.setAttribute('rx', rx * 0.98); eBotFlat.setAttribute('ry', ry * 0.98);
    eBotFlat.setAttribute('fill', '#d47c9e'); eBotFlat.setAttribute('stroke', '#b3769c'); eBotFlat.setAttribute('stroke-width', '1.5');

    gBot.appendChild(pBotDome); gBot.appendChild(pBotPied); gBot.appendChild(eBotFlat);

    // -- Filling (Ganache) --
    const pFill = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    pFill.setAttribute('d', `M ${cFillTop.x - rx * 0.85} ${cFillTop.y} L ${cFillBot.x - rx * 0.85} ${cFillBot.y} A ${rx * 0.85} ${ry * 0.85} 0 0 0 ${cFillBot.x + rx * 0.85} ${cFillBot.y} L ${cFillTop.x + rx * 0.85} ${cFillTop.y} A ${rx * 0.85} ${ry * 0.85} 0 0 1 ${cFillTop.x - rx * 0.85} ${cFillTop.y}`);
    pFill.setAttribute('fill', '#825e4c'); pFill.setAttribute('stroke', '#4a3b32'); pFill.setAttribute('stroke-width', '1.5');

    const eFillFlat = document.createElementNS('http://www.w3.org/2000/svg', 'ellipse');
    eFillFlat.setAttribute('cx', cFillTop.x); eFillFlat.setAttribute('cy', cFillTop.y); eFillFlat.setAttribute('rx', rx * 0.85); eFillFlat.setAttribute('ry', ry * 0.85);
    eFillFlat.setAttribute('fill', '#6d4d3d'); eFillFlat.setAttribute('stroke', '#4a3b32'); eFillFlat.setAttribute('stroke-width', '1.5');

    gFill.appendChild(pFill); gFill.appendChild(eFillFlat);

    // -- Top Shell (Coque Supérieure) --
    // 上裙边
    const pTopPied = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    pTopPied.setAttribute('d', `M ${cFillTop.x - rx * 1.05} ${cFillTop.y} Q ${cFillTop.x} ${cFillTop.y + ry + 8} ${cFillTop.x + rx * 1.05} ${cFillTop.y} L ${cTop.x + rx * 0.9} ${cTop.y + 10} Q ${cTop.x} ${cTop.y + ry * 0.9} ${cTop.x - rx * 0.9} ${cTop.y + 10} Z`);
    pTopPied.setAttribute('fill', '#e6a8c4'); pTopPied.setAttribute('stroke', '#b3769c'); pTopPied.setAttribute('stroke-width', '2');
    // 上穹顶
    const pTopDome = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    pTopDome.setAttribute('d', `M ${cTop.x - rx * 0.9} ${cTop.y + 10} C ${cTop.x - rx * 0.9} ${cTop.y - ry * 2.5}, ${cTop.x + rx * 0.9} ${cTop.y - ry * 2.5}, ${cTop.x + rx * 0.9} ${cTop.y + 10} Z`);
    pTopDome.setAttribute('fill', '#f0b1cd'); pTopDome.setAttribute('stroke', '#b3769c'); pTopDome.setAttribute('stroke-width', '2');
    pTopDome.setAttribute('filter', 'url(#macaron-texture)');

    gTop.appendChild(pTopPied); gTop.appendChild(pTopDome);

    group.appendChild(gBot); group.appendChild(gFill); group.appendChild(gTop);

    // Canvas overlay for painting on top
    const sLayer = document.getElementById('shell-layer');
    if (pixelMatrix.length > 0) {
        sLayer.style.display = 'block';
        let cvsSize = rx * 1.6;
        sLayer.setAttribute('x', cTop.x - cvsSize / 2);
        sLayer.setAttribute('y', cTop.y - ry * 1.5 - cvsSize / 2);
        sLayer.setAttribute('width', cvsSize);
        sLayer.setAttribute('height', cvsSize);

        const canvas = document.getElementById('shell-canvas');
        canvas.style.transform = `scaleY(0.5)`; // Flatten into isometric perspective
    } else {
        sLayer.style.display = 'none';
    }

    // 绑定物理数据到模态说明
    bindTutorialData();
}

function bindTutorialData() {
    const mats = macaronData.mats;
    const n = macaronData.n;

    // 通用估算
    const tWhip = 8; // 精确的法式蛋白霜中速到高速打发时间 (8分钟)
    const tMacaronage = 4; // 预计翻拌界限 4 分钟
    const tDry = 30; // 结皮通常 30-45
    const tBake = 15; // 烤制通常 12-16

    const tutorials = {
        'layer-bot': {
            title: "【底层力学：Coque的深渊基座】",
            desc: `
                <div style="background: rgba(212,124,158,0.1); padding: 10px; margin-bottom: 20px; border-left: 3px solid #d47c9e; font-size: 0.9rem;">
                    <strong>[提取指示]：</strong> 取陈化蛋清 ${mats.egg}g | 糖粉 ${mats.icing}g | 杏仁粉 ${mats.almond}g | 细砂糖 ${mats.caster}g
                </div>
                
                <div style="display:flex; gap:15px; margin-bottom:15px; border-bottom:1px dashed rgba(212,124,158,0.3); padding-bottom:15px;">
                    <svg viewBox="0 0 60 60" width="70" height="70" style="flex-shrink:0; background:rgba(255,255,255,0.7); border-radius:6px; border:1px solid #d47c9e;">
                        <ellipse cx="30" cy="45" rx="20" ry="10" fill="none" stroke="#b3769c" stroke-width="2"/>
                        <circle cx="30" cy="45" r="5" fill="#f0a8d0">
                            <animate attributeName="r" values="5; 15; 5" dur="1.5s" repeatCount="indefinite"/>
                        </circle>
                        <path d="M25 15 L35 15 M30 15 L30 45" stroke="#8e6a7c" stroke-width="2">
                             <animateTransform attributeName="transform" type="rotate" values="0 30 30; 360 30 30" dur="0.5s" repeatCount="indefinite"/>
                        </path>
                    </svg>
                    <div>
                        <strong style="color:#b56a6a;">[工序 01 - 法式蛋白霜建造] ⏱️ 预计耗时：8 分钟</strong><br>
                        启动高频电动引擎，中速至高速打发陈化蛋清 ${mats.egg}g。分3次投入幼砂糖构建钢筋网络。终极判定点：提起打蛋头时必定形成**“坚挺且带有极微弯钩的小鸟嘴”**，过度发泡将直接导致成品空心崩溃！
                    </div>
                </div>

                <div style="display:flex; gap:15px; margin-bottom:15px; padding-bottom:5px;">
                    <svg viewBox="0 0 60 60" width="70" height="70" style="flex-shrink:0; background:rgba(255,255,255,0.7); border-radius:6px; border:1px solid #d47c9e;">
                        <circle cx="30" cy="30" r="20" fill="none" stroke="#b3769c" stroke-width="2"/>
                        <path d="M30 15 C15 15, 15 45, 30 45 C45 45, 45 35, 30 35" fill="none" stroke="#d47c9e" stroke-width="3">
                            <animate attributeName="stroke-dasharray" values="0,200; 200,0" dur="1s" repeatCount="indefinite"/>
                        </path>
                    </svg>
                    <div>
                        <strong style="color:#b56a6a;">[工序 02 - Macaronage J字翻拌压吸法] ⏱️ 预计：4 分钟</strong><br>
                        将提前过筛的重粉（Tpt粉底）分两批压入气蛋白霜中。右手执刮刀紧贴盆壁做**『J字型刮底压拌』**。不断消泡调整流性！<br>
                        <strong>✅ 测绘达标标准：</strong>用刮刀铲起一坨泥浆，它必须像浓稠的岩浆一样呈锻带状连续滑落，且落下的折叠纹路15秒内才缓慢融合消失。未及此标准会炸裂，超过此标准会化为一滩死水。死线在此！
                    </div>
                </div>
            `
        },
        'layer-fill': {
            title: "【中层链接：Fourrage 力学胶水】",
            desc: `
                <div style="background: rgba(212,124,158,0.1); padding: 10px; margin-bottom: 20px; border-left: 3px solid #d47c9e; font-size: 0.9rem;">
                    <strong>[提取指示]：</strong> 准备夹心甘纳许或黄油霜 ${mats.ganache}g
                </div>

                <div style="display:flex; gap:15px; margin-bottom:15px;">
                    <svg viewBox="0 0 60 60" width="70" height="70" style="flex-shrink:0; background:rgba(255,255,255,0.7); border-radius:6px; border:1px solid #d47c9e;">
                        <ellipse cx="30" cy="45" rx="20" ry="10" fill="#f0b1cd" stroke="#b3769c" stroke-width="1.5"/>
                        <circle cx="30" cy="40" r="2" fill="#825e4c">
                            <animate attributeName="r" values="2; 12; 2" dur="2s" repeatCount="indefinite"/>
                        </circle>
                        <path d="M30 10 L30 40 L25 30 M30 40 L35 30" stroke="#825e4c" stroke-width="2">
                            <animateTransform attributeName="transform" type="translate" values="0 -5; 0 5; 0 -5" dur="1.5s" repeatCount="indefinite"/>
                        </path>
                    </svg>
                    <div>
                        <strong style="color:#b56a6a;">[工序 01 - 中心注射与闭锁压合] ⏱️ 预计：2 分钟</strong><br>
                        马卡龙不靠奶油承重，而依靠极高粘度的“结构胶水”。将微温冷凝的甘纳许溶液准确地注射在底层 Coque 的<strong>正中心死点</strong>。<br>
                        取出顶层蛋壳，施加标准的垂直向下压强，逼迫高阻胶水向四周呈完美圆形辐射延展至边缘（绝不可渗出）。
                    </div>
                </div>
            `
        },
        'layer-top': {
            title: "【顶端护盾：裙边(Pied)与结皮(Croûtage)】",
            desc: `
                <div style="display:flex; gap:15px; margin-bottom:15px; border-bottom:1px dashed rgba(212,124,158,0.3); padding-bottom:15px;">
                    <svg viewBox="0 0 60 60" width="70" height="70" style="flex-shrink:0; background:rgba(255,255,255,0.7); border-radius:6px; border:1px solid #d47c9e;">
                        <rect x="15" y="45" width="30" height="4" fill="#a76a45"/>
                        <path d="M22 35 L38 35 M25 30 L35 30" stroke="#f0b1cd" stroke-width="5" stroke-linecap="round"/>
                        <path d="M10 15 L20 25 M50 15 L40 25 M10 50 L20 40 M50 50 L40 40" stroke="#b3769c" stroke-width="2" opacity="0.4">
                            <animateTransform attributeName="transform" type="rotate" values="0 30 30; 90 30 30" dur="3s" repeatCount="indefinite"/>
                        </path>
                        <text x="5" y="10" font-size="20">🌬️</text>
                    </svg>
                    <div>
                        <strong style="color:#b56a6a;">[工序 01 - 结皮场域(Croûtage)] ⏱️ 预计等待：30-45 分钟</strong><br>
                        刚成型的柔弱蛋壳不能直面烈火。<strong>必须暴露在干燥环境风口中！</strong> 直到表面水分被抽干，形成一层用指尖轻碰完全不黏手、具有弹性张力的硬壳被膜。这是阻挡随后蒸汽爆发防崩裂的神圣护盾。
                    </div>
                </div>

                <div style="display:flex; gap:15px; margin-bottom:15px; border-bottom:1px dashed rgba(212,124,158,0.3); padding-bottom:15px;">
                    <svg viewBox="0 0 60 60" width="70" height="70" style="flex-shrink:0; background:rgba(255,255,255,0.7); border-radius:6px; border:1px solid #d47c9e;">
                        <path d="M15 40 Q30 30 45 40" fill="#f0b1cd" stroke="#b3769c" stroke-width="1.5"/>
                        <path d="M15 40 Q20 45 25 40 Q30 45 35 40 Q40 45 45 40" fill="#e6a8c4" stroke="#b3769c" stroke-width="1.5">
                            <animateTransform attributeName="transform" type="translate" values="0 0; 0 7; 0 0" dur="2s" repeatCount="indefinite"/>
                        </path>
                        <path d="M22 40 L22 45 M38 40 L38 45" stroke="#fff" stroke-width="1" stroke-dasharray="1 1"/>
                    </svg>
                    <div>
                        <strong style="color:#b56a6a;">[工序 02 - 高温挤压破面 (蕾丝裙边诞生)] ⏱️ 预计烤制：15 分钟 (150°C)</strong><br>
                        强力推送入烤炉！底部热量导致内部蛋白霜剧烈沸腾产生超强蒸汽压，然而顶部结就的硬皮如盾牌般将其无情压回。无可奈何之下，内部高压糊状物只能从下方接触垫子的缝隙处水平爆炸横扫渗出——<br>工业奇迹“蕾丝裙边（λ_pied）”因此诞生。
                    </div>
                </div>
            `
        }
    };

    ['layer-bot', 'layer-fill', 'layer-top'].forEach(id => {
        const layer = document.getElementById(id);
        if (layer) {
            layer.addEventListener('click', function () {
                if (!isBrokenDown) return;
                const data = tutorials[this.id];
                if (data) {
                    document.getElementById('layer-title').textContent = data.title;
                    document.getElementById('layer-desc').innerHTML = data.desc;
                    document.getElementById('layer-modal').classList.remove('hidden');
                }
            });
        }
    });
}

function showPrepTutorial() {
    const mats = macaronData.mats;
    const desc = `
        <div style="background: rgba(212,124,158,0.1); padding: 10px; margin-bottom: 20px; border-left: 3px solid #d47c9e; font-size: 0.9rem;">
            <strong>大厨信条 (Mise en Place)：</strong> “马卡龙没有容错率。每一克的误差，每一丝油脂的混入，都能在烤箱里引发物理学坍塌。”
        </div>

        <div style="display:flex; gap:15px; margin-bottom:15px; border-bottom:1px dashed rgba(212,124,158,0.3); padding-bottom:15px;">
            <svg viewBox="0 0 60 60" width="70" height="70" style="flex-shrink:0; background:rgba(255,255,255,0.7); border-radius:6px; border:1px solid #d47c9e;">
                <path d="M20 10 C20 10, 10 30, 20 50 C30 50, 40 50, 40 10 Z" fill="#fff9fa" stroke="#b56a6a" stroke-width="2"/>
                <circle cx="30" cy="35" r="8" fill="#e2c5d1">
                   <animate attributeName="r" values="8; 4; 8" dur="4s" repeatCount="indefinite"/>
                </circle>
                <text x="18" y="25" font-size="10" fill="#888">48h</text>
            </svg>
            <div>
                <strong style="color:#b56a6a;">[第 1 步 - 蛋清的衰化 (Le Vieillissement)]</strong><br>
                取 ${mats.egg}g 蛋清，绝对不可直接使用。必须覆保鲜膜扎孔，放入冰箱冷藏<strong>24~48小时</strong>进行“陈化”。水分蒸发后蛋白质网络放松，烘烤时才具备极限的稳定性。准备打发前须使其回温至 21°C。
            </div>
        </div>

        <div style="display:flex; gap:15px; margin-bottom:15px; padding-bottom:15px; border-bottom:1px dashed rgba(212,124,158,0.3);">
            <svg viewBox="0 0 60 60" width="70" height="70" style="flex-shrink:0; background:rgba(255,255,255,0.7); border-radius:6px; border:1px solid #d47c9e;">
                <circle cx="30" cy="30" r="15" fill="none" stroke="#b3769c" stroke-width="2"/>
                <circle cx="30" cy="30" r="10" fill="none" stroke="#d47c9e" stroke-width="2" stroke-dasharray="2 2">
                     <animateTransform attributeName="transform" type="rotate" values="0 30 30; 360 30 30" dur="2s" repeatCount="indefinite"/>
                </circle>
            </svg>
            <div>
                <strong style="color:#b56a6a;">[第 2 步 - TPT粉体均质 (Tant Pour Tant)]</strong><br>
                将 ${mats.almond}g 杏仁粉与 ${mats.icing}g 糖粉混合。使用料理机<strong>脉冲式点按(Pulse)</strong>打碎混合，然后用极细网筛过筛两遍以上。绝不可长时间研磨，否则释放过多油脂必定导致表面崩塌出油。
            </div>
        </div>

        <div style="display:flex; gap:15px; margin-bottom:15px;">
            <svg viewBox="0 0 60 60" width="70" height="70" style="flex-shrink:0; background:rgba(255,255,255,0.7); border-radius:6px; border:1px solid #d47c9e;">
                <path d="M10 50 L50 50 L45 20 L15 20 Z" fill="none" stroke="#8e6a7c" stroke-width="2"/>
                <path d="M25 15 L25 50" stroke="#d47c9e" stroke-width="3">
                    <animateTransform attributeName="transform" type="translate" values="-5 0; 5 0; -5 0" dur="1s" repeatCount="indefinite"/>
                </path>
                <text x="35" y="40" font-size="12" fill="#b56a6a">0%</text>
            </svg>
            <div>
                <strong style="color:#b56a6a;">[第 3 步 - 会诊前脱脂擦拭]</strong><br>
                大厨警告：各种打蛋盆和器皿，必须用厨房纸蘸取白醋或柠檬汁彻底擦净。微克级的油脂残留都会摧毁蛋白霜的起泡物理引擎。然后将需要使用的 ${mats.caster}g 细砂糖等材料备齐待命。
            </div>
        </div>
    `;

    document.getElementById('layer-title').textContent = "【战前整备参数法则：La Mise en Place】";
    document.getElementById('layer-desc').innerHTML = desc;
    document.getElementById('layer-modal').classList.remove('hidden');
}

function toggleLayerBreakdown() {
    isBrokenDown = !isBrokenDown;
    const gTop = document.getElementById('layer-top');
    const gFill = document.getElementById('layer-fill');
    const gBot = document.getElementById('layer-bot');
    const sLayer = document.getElementById('shell-layer');
    const btn = document.getElementById('btn-explode');

    if (!gTop) return;

    if (isBrokenDown) {
        gTop.style.transform = 'translateY(-140px)';
        if (sLayer) sLayer.style.transform = 'translateY(-140px)';
        gFill.style.transform = 'translateY(-50px)';
        gBot.style.transform = 'translateY(50px)';

        gTop.classList.add('layer-clickable');
        gFill.classList.add('layer-clickable');
        gBot.classList.add('layer-clickable');

        btn.textContent = "【复原】 返回出厂状态";
        btn.classList.remove('btn-accent');
        btn.style.background = '#e2c5d1';
        btn.style.color = '#3a2e28';
    } else {
        gTop.style.transform = 'translateY(0)';
        if (sLayer) sLayer.style.transform = 'translateY(0)';
        gFill.style.transform = 'translateY(0)';
        gBot.style.transform = 'translateY(0)';

        gTop.classList.remove('layer-clickable');
        gFill.classList.remove('layer-clickable');
        gBot.classList.remove('layer-clickable');

        btn.textContent = "【解构】 零基础装配工艺教程";
        btn.classList.add('btn-accent');
        btn.style.background = '';
        btn.style.color = '';
    }
}

let lastUploadedImage = null;

function handleImageUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function (e) {
        const img = new Image();
        img.onload = function () {
            lastUploadedImage = img;
            processFrostingImage(img);
        };
        img.src = e.target.result;
    };
    reader.readAsDataURL(file);
}

function processFrostingImage(img) {
    // We treat the top view as a pure circle. size = d * 10 for resolution.
    const res = Math.floor(macaronData.d * 20);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = res;
    canvas.height = res;

    // Draw scaled down
    ctx.drawImage(img, 0, 0, res, res);
    const imgData = ctx.getImageData(0, 0, res, res);

    pixelMatrix = [];
    let colorCounts = {};

    for (let y = 0; y < res; y++) {
        let row = [];
        for (let x = 0; x < res; x++) {
            const cx = res / 2;
            const dx = (x - cx) / cx;
            const dy = (y - cx) / cx;
            // 剪裁为圆
            if ((dx * dx + dy * dy) > 0.95) {
                row.push("transparent");
                continue;
            }

            const idx = (y * res + x) * 4;
            // 因为马卡龙不能吃水，色素用量是微滴级别的，所以色系基本提取原色，可以略作复古化衰减
            let cr = Math.min(255, imgData.data[idx] * 0.95 + 10);
            let cg = Math.min(255, imgData.data[idx + 1] * 0.95 + 10);
            let cb = Math.min(255, imgData.data[idx + 2] * 0.95 + 10);

            // 提取为12色谱以便归置点阵
            const step = 255 / 11;
            cr = Math.round(cr / step) * step;
            cg = Math.round(cg / step) * step;
            cb = Math.round(cb / step) * step;
            let fColor = `rgb(${Math.round(cr)},${Math.round(cg)},${Math.round(cb)})`;

            // Background is pale, let's ignore very white pixels
            if (cr > 230 && cg > 230 && cb > 230) {
                row.push("transparent");
                continue;
            }

            row.push(fColor);
            if (!colorCounts[fColor]) colorCounts[fColor] = 0;
            colorCounts[fColor]++;
        }
        pixelMatrix.push(row);
    }

    let totalGrams = 0;
    Object.keys(colorCounts).forEach(c => {
        // 色素极轻，0.005g 每一像滴
        colorCounts[c] = (colorCounts[c] * 0.005);
        totalGrams += colorCounts[c];
    });

    document.getElementById('val-pigment').textContent = `${totalGrams.toFixed(2)} g`;

    const displayCanvas = document.getElementById('shell-canvas');
    displayCanvas.width = res;
    displayCanvas.height = res;
    const dCtx = displayCanvas.getContext('2d');
    dCtx.clearRect(0, 0, res, res);

    for (let y = 0; y < res; y++) {
        for (let x = 0; x < res; x++) {
            if (pixelMatrix[y][x] !== 'transparent') {
                dCtx.fillStyle = pixelMatrix[y][x];
                dCtx.fillRect(x, y, 1, 1);
            }
        }
    }

    renderMacaronSVG(macaronData.d);
    renderPaletteAndBlueprint(colorCounts, res, res);
}

function renderPaletteAndBlueprint(colorObj, width, height) {
    const container = document.getElementById('color-palette-container');
    container.innerHTML = '';
    colorMapping = {};

    if (Object.keys(colorObj).length === 0) return;

    const colors = Object.keys(colorObj).map(c => {
        return { color: c, count: colorObj[c] };
    }).sort((a, b) => b.count - a.count);

    colors.forEach((item, index) => {
        const colorId = index + 1;
        colorMapping[item.color] = { id: colorId, color: item.color };

        const row = document.createElement('div');
        row.className = 'swatch-row';
        row.innerHTML = `
        < div class="swatch-info" >
                <div class="swatch-color-box" style="background-color: ${item.color}; border-radius: 50%;"></div>
                <div>
                    <div class="swatch-name">色谱频道 [0${index + 1}]</div>
                    <div class="swatch-hex">${item.color}</div>
                </div>
            </div >
        <div class="swatch-count">提炼量 ${item.count.toFixed(3)}g</div>
    `;
        container.appendChild(row);
    });

    const bpCanvas = document.getElementById('blueprint-canvas');
    bpCanvas.width = width;
    bpCanvas.height = height;
    const ctx = bpCanvas.getContext('2d');
    ctx.clearRect(0, 0, width, height);

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            if (pixelMatrix[y][x] !== 'transparent') {
                ctx.fillStyle = pixelMatrix[y][x];
                ctx.fillRect(x, y, 1, 1);
            }
        }
    }

    bpCanvas.style.backgroundSize = `calc(100 % / ${width}) calc(100% / ${height})`;
    const newBp = bpCanvas.cloneNode(true);
    bpCanvas.parentNode.replaceChild(newBp, bpCanvas);

    newBp.addEventListener('mousemove', (e) => {
        const rect = newBp.getBoundingClientRect();
        const scaleX = newBp.width / rect.width;
        const scaleY = newBp.height / rect.height;
        let x = Math.floor((e.clientX - rect.left) * scaleX);
        let y = Math.floor((e.clientY - rect.top) * scaleY);

        x = Math.max(0, Math.min(x, newBp.width - 1));
        y = Math.max(0, Math.min(y, newBp.height - 1));

        const pixelColor = pixelMatrix[y][x];
        const mappedInfo = colorMapping[pixelColor];
        const tooltip = document.getElementById('blueprint-tooltip');

        if (mappedInfo && pixelColor !== 'transparent') {
            tooltip.innerHTML = `
        < div style = "display:flex; align-items:center; gap:8px;" >
                    <div style="width:12px;height:12px;background:${mappedInfo.color}; border:1px solid #fff; border-radius:50%;"></div>
                    <strong>提取色道 - ${mappedInfo.id}</strong>
                </div >
        <div style="font-family:monospace; margin-top:4px;">Y坐标位: ${y + 1} | X坐标位: ${x + 1}</div>
    `;
            tooltip.classList.remove('hidden');
            tooltip.style.left = (e.clientX - rect.left + 15) + 'px';
            tooltip.style.top = (e.clientY - rect.top + 15) + 'px';
        } else {
            tooltip.classList.add('hidden');
        }
    });

    newBp.addEventListener('mouseleave', () => {
        document.getElementById('blueprint-tooltip').classList.add('hidden');
    });
}

function handleBlueprintSearch() {
    if (pixelMatrix.length === 0) return;
    const rowInput = parseInt(document.getElementById('bp-search-y').value);
    const colInput = parseInt(document.getElementById('bp-search-x').value);
    const resultSpan = document.getElementById('bp-search-result');
    const crosshair = document.getElementById('blueprint-crosshair');
    const canvas = document.getElementById('blueprint-canvas');
    const wrap = document.getElementById('blueprint-wrapper');

    const maxRow = pixelMatrix.length;
    const maxCol = pixelMatrix[0].length;

    if (isNaN(rowInput) || isNaN(colInput) || rowInput < 1 || rowInput > maxRow || colInput < 1 || colInput > maxCol) {
        resultSpan.textContent = `越界警戒！范围 X(1 - ${maxCol}), Y(1 - ${maxRow})`;
        resultSpan.style.color = '#ff3d3d';
        crosshair.classList.add('hidden');
        return;
    }

    const y = rowInput - 1;
    const x = colInput - 1;
    const pixelColor = pixelMatrix[y][x];
    const mappedInfo = colorMapping[pixelColor];

    if (mappedInfo && pixelColor !== 'transparent') {
        resultSpan.innerHTML = `< span style = "display:inline-block;width:10px;height:10px;background:${mappedInfo.color}; border-radius:50%; margin-right:4px;border:1px solid #fff;" ></span > 执行阵列: X[${colInput}]Y[${rowInput}]-> 放出色液[${mappedInfo.id}]`;
        resultSpan.style.color = '#fcebf0';

        const rect = canvas.getBoundingClientRect();
        const wrapRect = wrap.getBoundingClientRect();
        const pixelW = rect.width / maxCol;
        const pixelH = rect.height / maxRow;

        const targetX = (rect.left - wrapRect.left) + x * pixelW + (pixelW / 2);
        const targetY = (rect.top - wrapRect.top) + y * pixelH + (pixelH / 2);

        crosshair.style.left = `${targetX} px`;
        crosshair.style.top = `${targetY} px`;
        const size = Math.max(12, pixelW * 1.5);
        crosshair.style.width = `${size} px`;
        crosshair.style.height = `${size} px`;
        crosshair.style.transform = `translate(-50 %, -50 %)`;
        crosshair.classList.remove('hidden');
    } else {
        resultSpan.innerHTML = '<span style="color:#b56a6a;">盲区：该坐标无着色点。</span>';
        crosshair.classList.add('hidden');
    }
}

function openLearnModal() { document.getElementById('learn-modal').classList.remove('hidden'); }
function closeLearnModal() { document.getElementById('learn-modal').classList.add('hidden'); }
