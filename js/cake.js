// Da Vinci Cake Mechanics & Calculator
document.addEventListener('DOMContentLoaded', () => {
    // 1. 开场动画消除
    setTimeout(() => {
        const overlay = document.getElementById('entrance-overlay');
        if (overlay) overlay.style.opacity = '0';
        setTimeout(() => overlay && overlay.remove(), 1500);
    }, 5500);

    // 2. 初始化绑定
    document.getElementById('btn-calc').addEventListener('click', calculateStructure);
    document.getElementById('in-shape').addEventListener('change', calculateStructure);
    document.getElementById('image-upload').addEventListener('change', handleImageUpload);
    document.getElementById('btn-learn').addEventListener('click', openLearnModal);
    document.getElementById('learn-close').addEventListener('click', closeLearnModal);
    document.getElementById('layer-close').addEventListener('click', () => {
        document.getElementById('layer-modal').classList.add('hidden');
    });
    document.getElementById('bp-search-btn').addEventListener('click', handleBlueprintSearch);
    document.getElementById('btn-layer-breakdown').addEventListener('click', toggleLayerBreakdown);

    // Initial render
    calculateStructure();
});

let cakeData = { shape: 'square', l: 20, w: 20, h: 10 };
let colorMapping = {};
let pixelMatrix = [];
let isBrokenDown = false;

function calculateStructure() {
    isBrokenDown = false;
    const shape = document.getElementById('in-shape').value;
    const l = parseFloat(document.getElementById('in-l').value) || 20;
    const w = parseFloat(document.getElementById('in-w').value) || 20;
    const h = parseFloat(document.getElementById('in-h').value) || 10;

    cakeData = { shape, l, w, h };

    let vol = 0;
    let area = 0;

    if (shape === 'round') {
        const r = l / 2;
        vol = Math.PI * r * r * h;
        area = (Math.PI * r * r) + (Math.PI * l * h);
        cakeData.w = l; // Force W = L for round bounding box
    } else {
        vol = l * w * h;
        area = (l * w) + (2 * l * h) + (2 * w * h);
    }

    // 假设材料系数 (g/cm³ or g/cm²)
    const flour = (vol * 0.12).toFixed(1);
    const sugar = (vol * 0.08).toFixed(1);
    const eggs = Math.max(1, Math.round(vol / 400));
    const butter = (vol * 0.05).toFixed(1);
    const cream = (area * 0.25).toFixed(1);

    cakeData.mats = { flour, sugar, eggs, butter, cream };

    document.getElementById('val-flour').textContent = `${flour} g`;
    document.getElementById('val-sugar').textContent = `${sugar} g`;
    document.getElementById('val-egg').textContent = `${eggs} 个`;
    document.getElementById('val-butter').textContent = `${butter} g`;
    document.getElementById('val-cream').textContent = `${cream} g`;

    // 如果没有手稿图案，糖霜总量暂为 0
    if (pixelMatrix.length === 0) {
        document.getElementById('val-frosting').textContent = "需上传手稿图样";
    } else {
        // 重绘图片以匹配新尺寸
        reprocessImageForNewSize();
    }

    renderCakeSVG(l, w, h);
}

// Isometric Projection Helper
function iso(x, y, z) {
    // 简单2D轴侧投射: nx = x - y, ny = (x + y)/2 - z
    return {
        x: (x - y) * 0.866,
        y: ((x + y) * 0.5) - z
    };
}

function renderCakeSVG(l, w, h) {
    const group = document.getElementById('cake-render-group');
    group.innerHTML = '';

    const maxDim = Math.max(l, w, h * 2);
    const scale = 150 / maxDim;

    const L = l * scale;
    const W = w * scale;
    const H = h * scale;

    const gBase = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    const gFilling = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    const gTop = document.createElementNS('http://www.w3.org/2000/svg', 'g');

    gBase.setAttribute('id', 'layer-base');
    gFilling.setAttribute('id', 'layer-filling');
    gTop.setAttribute('id', 'layer-top');

    gBase.style.transition = 'transform 1s cubic-bezier(0.2, 0.8, 0.2, 1)';
    gFilling.style.transition = 'transform 1s cubic-bezier(0.2, 0.8, 0.2, 1)';
    gTop.style.transition = 'transform 1s cubic-bezier(0.2, 0.8, 0.2, 1)';

    const drawPoly = (points, fill, stroke) => {
        const poly = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
        poly.setAttribute('points', points.map(pt => `${pt.x},${pt.y}`).join(' '));
        poly.setAttribute('fill', fill);
        poly.setAttribute('stroke', stroke);
        poly.setAttribute('stroke-width', '1.5');
        poly.setAttribute('stroke-linejoin', 'round');
        return poly;
    };

    let fLayerCenterX = 0, fLayerCenterY = 0, isoW = 0;

    if (cakeData.shape === 'square') {
        const p = [
            iso(L, W, 0), iso(0, W, 0), iso(0, 0, 0), iso(L, 0, 0),
            iso(L, W, H / 2), iso(0, W, H / 2), iso(0, 0, H / 2), iso(L, 0, H / 2),
            iso(L, W, H), iso(0, W, H), iso(0, 0, H), iso(L, 0, H)
        ];

        gBase.appendChild(drawPoly([p[1], p[2], p[6], p[5]], '#dbd0bc', '#8b7355'));
        gBase.appendChild(drawPoly([p[0], p[1], p[5], p[4]], '#eadcc5', '#8b7355'));

        gFilling.appendChild(drawPoly([p[4], p[5], p[6], p[7]], '#dcbfa3', '#a76a45'));
        gFilling.innerHTML += `<text x="${p[5].x + 20}" y="${p[5].y - 10}" fill="#a76a45" font-weight="bold" font-size="12" class="layer-label" opacity="0">软心果酱层</text>`;

        gTop.appendChild(drawPoly([p[5], p[6], p[10], p[9]], '#e2d4c0', '#8b7355'));
        gTop.appendChild(drawPoly([p[4], p[5], p[9], p[8]], '#f0dfc8', '#8b7355'));
        gTop.appendChild(drawPoly([p[8], p[9], p[10], p[11]], '#f4e9d5', '#8b7355'));
        gTop.innerHTML += `<text x="${p[9].x + 20}" y="${p[9].y - 20}" fill="#8b7355" font-weight="bold" font-size="12" class="layer-label" opacity="0">顶层海绵胚与奶油抹面</text>`;
        gBase.innerHTML += `<text x="${p[2].x + 50}" y="${p[2].y + 40}" fill="#8b7355" font-weight="bold" font-size="12" class="layer-label" opacity="0">底层承重蛋糕胚</text>`;

        fLayerCenterX = (p[8].x + p[9].x + p[10].x + p[11].x) / 4;
        fLayerCenterY = (p[8].y + p[9].y + p[10].y + p[11].y) / 4;
        isoW = Math.sqrt(L * L + W * W);
    } else {
        const cBase = iso(L / 2, L / 2, 0);
        const cMid = iso(L / 2, L / 2, H / 2);
        const cTop = iso(L / 2, L / 2, H);

        const rx = (L / 2) * 0.866 * 2;
        const ry = (L / 2) * 0.5 * 2;

        const pathBase = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        pathBase.setAttribute('d', `M ${cMid.x - rx} ${cMid.y} L ${cBase.x - rx} ${cBase.y} A ${rx} ${ry} 0 0 0 ${cBase.x + rx} ${cBase.y} L ${cMid.x + rx} ${cMid.y} Z`);
        pathBase.setAttribute('fill', '#eadcc5'); pathBase.setAttribute('stroke', '#8b7355'); pathBase.setAttribute('stroke-width', '1.5');
        gBase.appendChild(pathBase);

        const ellMid = document.createElementNS('http://www.w3.org/2000/svg', 'ellipse');
        ellMid.setAttribute('cx', cMid.x); ellMid.setAttribute('cy', cMid.y); ellMid.setAttribute('rx', Math.abs(rx)); ellMid.setAttribute('ry', Math.abs(ry));
        ellMid.setAttribute('fill', '#dcbfa3'); ellMid.setAttribute('stroke', '#a76a45'); ellMid.setAttribute('stroke-width', '1.5');
        gFilling.appendChild(ellMid);
        gFilling.innerHTML += `<text x="${cMid.x + 20}" y="${cMid.y - 10}" fill="#a76a45" font-weight="bold" font-size="12" class="layer-label" opacity="0">软心果酱层</text>`;

        const pathTop = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        pathTop.setAttribute('d', `M ${cTop.x - rx} ${cTop.y} L ${cMid.x - rx} ${cMid.y} A ${rx} ${ry} 0 0 0 ${cMid.x + rx} ${cMid.y} L ${cTop.x + rx} ${cTop.y} Z`);
        pathTop.setAttribute('fill', '#f0dfc8'); pathTop.setAttribute('stroke', '#8b7355'); pathTop.setAttribute('stroke-width', '1.5');

        const ellTop = document.createElementNS('http://www.w3.org/2000/svg', 'ellipse');
        ellTop.setAttribute('cx', cTop.x); ellTop.setAttribute('cy', cTop.y); ellTop.setAttribute('rx', Math.abs(rx)); ellTop.setAttribute('ry', Math.abs(ry));
        ellTop.setAttribute('fill', '#f4e9d5'); ellTop.setAttribute('stroke', '#8b7355'); ellTop.setAttribute('stroke-width', '1.5');

        gTop.appendChild(pathTop);
        gTop.appendChild(ellTop);

        gTop.innerHTML += `<text x="${cTop.x + rx / 2}" y="${cTop.y - ry}" fill="#8b7355" font-weight="bold" font-size="12" class="layer-label" opacity="0">顶层海绵胚与奶油抹面</text>`;
        gBase.innerHTML += `<text x="${cBase.x + rx / 2}" y="${cBase.y + ry / 2}" fill="#8b7355" font-weight="bold" font-size="12" class="layer-label" opacity="0">底层承重蛋糕胚</text>`;

        fLayerCenterX = cTop.x;
        fLayerCenterY = cTop.y;
        isoW = L * 1.414;
    }

    group.appendChild(gBase);
    group.appendChild(gFilling);
    group.appendChild(gTop);

    const fLayer = document.getElementById('frosting-layer');
    if (pixelMatrix.length > 0) {
        fLayer.style.display = 'block';
        fLayer.style.transition = 'transform 1s cubic-bezier(0.2, 0.8, 0.2, 1)';
        fLayer.setAttribute('x', fLayerCenterX - isoW);
        fLayer.setAttribute('y', fLayerCenterY - isoW);
        fLayer.setAttribute('width', isoW * 2);
        fLayer.setAttribute('height', isoW * 2);

        const canvas = document.getElementById('frosting-canvas');
        canvas.style.transform = `scaleX(${L / isoW}) scaleY(${(cakeData.shape === 'round' ? L : W) / isoW})`;
        canvas.style.borderRadius = cakeData.shape === 'round' ? '50%' : '0';
    } else {
        fLayer.style.display = 'none';
    }

    // Bind layer click tutorials
    const mats = cakeData.mats || { flour: 0, sugar: 0, eggs: 0, butter: 0, cream: 0 };
    // Universal procedural time formulas based on inputs
    const tBeat = Math.max(3, Math.round(3 + mats.eggs * 0.5));
    const tMix = Math.max(2, Math.round(2 + mats.flour / 50));
    const tBake = Math.max(30, Math.round(30 + Math.sqrt(L * L + W * W) * 0.8 + H));
    const tCool = Math.max(20, Math.round(20 + (L * W) / 20));
    const tWhip = Math.max(3, Math.round(2 + mats.cream / 100));
    const tCoat = Math.max(5, Math.round(3 + (L * W) / 100));
    const tChill = 15;
    const tFrost = Math.max(10, Math.round(5 + (L * W + L * H + W * H) / 80));

    const layerData = {
        'layer-base': {
            title: "【底层承重基石：结构化装配协议】",
            desc: `
                <div style="background: rgba(139, 115, 85, 0.1); padding: 10px; margin-bottom: 20px; border-left: 3px solid #8b7355; font-size: 0.9rem;">
                    <strong>材料提取：</strong> 面粉 ${mats.flour}g | 砂糖 ${mats.sugar}g | 鸡蛋 ${mats.eggs}个 | 黄油 ${mats.butter}g
                </div>

                <div style="display:flex; gap:15px; margin-bottom:15px; border-bottom:1px dashed rgba(139, 115, 85, 0.3); padding-bottom:15px;">
                    <svg viewBox="0 0 60 60" width="60" height="60" style="flex-shrink:0; background:rgba(255,255,255,0.5); border-radius:6px; border:1px solid #c4a56e;">
                        <ellipse cx="30" cy="45" rx="20" ry="10" fill="none" stroke="#e2d4c0" stroke-width="2"/>
                        <circle cx="30" cy="20" r="8" fill="#f4cc3a">
                            <animate attributeName="cy" values="20; 45; 20" dur="2s" repeatCount="indefinite" keyTimes="0; 0.5; 1"/>
                        </circle>
                        <path d="M15 45 Q30 55 45 45" fill="#f4e9d5" opacity="0.8">
                            <animate attributeName="d" values="M15 45 Q30 55 45 45; M15 45 Q30 65 45 45; M15 45 Q30 55 45 45" dur="1s" repeatCount="indefinite"/>
                        </path>
                    </svg>
                    <div>
                        <strong style="color:var(--rouge);">[工序 01 - 纯净分离] ⏱️ 耗时定额：约 ${(mats.eggs * 0.5).toFixed(1)} 分钟</strong><br>
                        必须将 ${mats.eggs} 个鸡蛋的常压蛋白与核心蛋黄彻底剥离。任何形式的水、油污或蛋黄混入蛋白结构，将直接导致打发框架坍塌。
                    </div>
                </div>

                <div style="display:flex; gap:15px; margin-bottom:15px; border-bottom:1px dashed rgba(139, 115, 85, 0.3); padding-bottom:15px;">
                    <svg viewBox="0 0 60 60" width="60" height="60" style="flex-shrink:0; background:rgba(255,255,255,0.5); border-radius:6px; border:1px solid #c4a56e;">
                        <circle cx="30" cy="30" r="25" fill="#eadcc5" stroke="#8b7355" stroke-width="1.5"/>
                        <path d="M20 20 L40 20 L20 40 L40 40" fill="none" stroke="#a76a45" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                            <animate attributeName="stroke-dasharray" values="0,100; 100,0" dur="1.5s" repeatCount="indefinite"/>
                        </path>
                    </svg>
                    <div>
                        <strong style="color:var(--rouge);">[工序 02 - Z字泥灰搅拌] ⏱️ 耗时定额：公式 [2 + 面粉/50] = ${tMix} 分钟</strong><br>
                        提取 ${mats.butter}g 融化黄油，投入 ${mats.flour}g 面粉与所有蛋黄。使用物理刮刀严格执行 "Z" 字形机械刮擦，<strong>严禁圆周运动产生致命的结构起筋</strong>。
                    </div>
                </div>

                <div style="display:flex; gap:15px; margin-bottom:15px; border-bottom:1px dashed rgba(139, 115, 85, 0.3); padding-bottom:15px;">
                    <svg viewBox="0 0 60 60" width="60" height="60" style="flex-shrink:0; background:rgba(255,255,255,0.5); border-radius:6px; border:1px solid #c4a56e;">
                        <path d="M25 10 Q30 30 40 10" fill="none" stroke="#8b7355" stroke-width="2"/>
                        <g>
                            <animateTransform attributeName="transform" type="rotate" values="-20 30 30; 20 30 30; -20 30 30" dur="0.2s" repeatCount="indefinite"/>
                            <path d="M25 30 V50 M35 30 V50" stroke="#b56a6a" stroke-width="2"/>
                            <ellipse cx="25" cy="50" rx="3" ry="8" fill="none" stroke="#b56a6a" stroke-width="1"/>
                            <ellipse cx="35" cy="50" rx="3" ry="8" fill="none" stroke="#b56a6a" stroke-width="1"/>
                        </g>
                    </svg>
                    <div>
                        <strong style="color:var(--rouge);">[工序 03 - 蛋白霜气室构建] ⏱️ 耗时定额：公式 [3 + 蛋量*0.5] = ${tBeat} 分钟</strong><br>
                        高频打蛋器全速运转。将 ${mats.sugar}g 砂糖分3次加入蛋白腔。达成【硬性发泡】：提起测探头，形成直立抗拉抗倾倒的三角尖锥。
                    </div>
                </div>

                <div style="display:flex; gap:15px; margin-bottom:15px; padding-bottom:5px;">
                    <svg viewBox="0 0 60 60" width="60" height="60" style="flex-shrink:0; background:rgba(255,255,255,0.5); border-radius:6px; border:1px solid #c4a56e;">
                        <rect x="15" y="30" width="30" height="20" fill="none" stroke="#8b7355" stroke-width="2"/>
                        <path d="M25 10 L35 10 L30 25 Z" fill="#b56a6a">
                            <animateTransform attributeName="transform" type="translate" values="0 -5; 0 5; 0 -5" dur="1s" repeatCount="indefinite"/>
                        </path>
                        <text x="18" y="45" font-size="10" fill="#a76a45">150°C</text>
                    </svg>
                    <div>
                        <strong style="color:var(--rouge);">[工序 04 - 热力固化与冷却] ⏱️ 烘培 ${tBake} 分钟 | 冷却 ${tCool} 分钟</strong><br>
                        浆糊倒入模具，砸击脱气两次。入烤箱（耗时公式基准 30+体积算子）。取出后最大的机械铁律：<strong>必须在出炉2秒内倒立静置于抗压架冷却。</strong>悬垂重力是防止大厦塌陷的唯一解。
                    </div>
                </div>
            `
        },
        'layer-filling': {
            title: "【中层砌墙：流体控制协议】",
            desc: `
                <div style="background: rgba(139, 115, 85, 0.1); padding: 10px; margin-bottom: 20px; border-left: 3px solid #8b7355; font-size: 0.9rem;">
                    <strong>材料提取：</strong> 本层限提 30% 奶油总量 ${(mats.cream * 0.3).toFixed(1)}g | 水果切片适配
                </div>

                <div style="display:flex; gap:15px; margin-bottom:15px; border-bottom:1px dashed rgba(139, 115, 85, 0.3); padding-bottom:15px;">
                    <svg viewBox="0 0 60 60" width="60" height="60" style="flex-shrink:0; background:rgba(255,255,255,0.5); border-radius:6px; border:1px solid #c4a56e;">
                        <ellipse cx="30" cy="45" rx="20" ry="10" fill="#f4e9d5" stroke="#8b7355" stroke-width="1.5"/>
                        <path d="M25 15 L25 45 M35 15 L35 45" stroke="#a76a45" stroke-width="2">
                           <animateTransform attributeName="transform" type="translate" values="-2 0; 2 0; -2 0" dur="0.1s" repeatCount="indefinite"/>
                        </path>
                    </svg>
                    <div>
                        <strong style="color:var(--rouge);">[工序 01 - 粘合气室构筑] ⏱️ 耗时定额：公式 [2 + 奶油/100] = ${tWhip} 分钟</strong><br>
                        强制要求使用低于10°C的核心液态奶油，搅打至“8分发”极限。表观呈现刚性波浪纹，但施加侧向剪切力时仍具流动性。
                    </div>
                </div>

                <div style="display:flex; gap:15px; margin-bottom:15px; padding-bottom:5px;">
                    <svg viewBox="0 0 60 60" width="60" height="60" style="flex-shrink:0; background:rgba(255,255,255,0.5); border-radius:6px; border:1px solid #c4a56e;">
                        <ellipse cx="30" cy="30" rx="22" ry="12" fill="none" stroke="#fff" stroke-width="4" stroke-dasharray="138" stroke-dashoffset="138">
                            <animate attributeName="stroke-dashoffset" values="138; 0" dur="2s" fill="freeze" repeatCount="indefinite"/>
                        </ellipse>
                        <circle cx="30" cy="30" r="8" fill="#b56a6a" opacity="0.6"/>
                    </svg>
                    <div>
                        <strong style="color:var(--rouge);">[工序 02 - 边缘防波堤筑造] ⏱️ 耗时定额：约 2 分钟</strong><br>
                        切忌满铺湿润填料！先在底层外围 1 厘米处挤注一圈闭合的“承压奶油防波堤”。然后在中间坑内填埋果酱阵列，避免大厦侧漏崩盘。
                    </div>
                </div>
            `
        },
        'layer-top': {
            title: "【顶层封顶与图纸粉刷协议】",
            desc: `
                <div style="background: rgba(139, 115, 85, 0.1); padding: 10px; margin-bottom: 20px; border-left: 3px solid #8b7355; font-size: 0.9rem;">
                    <strong>材料提取：</strong> 本层提取 70% 奶油余量 ${(mats.cream * 0.7).toFixed(1)}g | 调配色彩糖霜
                </div>

                <div style="display:flex; gap:15px; margin-bottom:15px; border-bottom:1px dashed rgba(139, 115, 85, 0.3); padding-bottom:15px;">
                    <svg viewBox="0 0 60 60" width="60" height="60" style="flex-shrink:0; background:rgba(255,255,255,0.5); border-radius:6px; border:1px solid #c4a56e;">
                        <path d="M15 45 L45 45 M15 50 L45 50" stroke="#dbd0bc" stroke-width="4"/>
                        <path d="M15 20 L45 20" stroke="#f4e9d5" stroke-width="4">
                            <animateTransform attributeName="transform" type="translate" values="0 -10; 0 20" dur="1.5s" repeatCount="indefinite"/>
                        </path>
                    </svg>
                    <div>
                        <strong style="color:var(--rouge);">[工序 01 - 顶盖扣合与碎屑封锁] ⏱️ 极薄涂层 ${tCoat} 分钟 | 冷库降温 ${tChill} 分钟</strong><br>
                        放置最终顶盖压实。<strong>严禁单边直上厚抹面！</strong> 先极薄地包覆全身一圈（Crumb Coat），随后送入冷柜强行固结，把烦人的碎屑渣物理锁死在结构底层。
                    </div>
                </div>

                <div style="display:flex; gap:15px; margin-bottom:15px; border-bottom:1px dashed rgba(139, 115, 85, 0.3); padding-bottom:15px;">
                    <svg viewBox="0 0 60 60" width="60" height="60" style="flex-shrink:0; background:rgba(255,255,255,0.5); border-radius:6px; border:1px solid #c4a56e;">
                        <ellipse cx="30" cy="35" rx="20" ry="10" fill="#f4e9d5" stroke="#8b7355" stroke-width="1.5"/>
                        <g>
                            <animateTransform attributeName="transform" type="translate" values="-10 0; 10 0; -10 0" dur="1.5s" repeatCount="indefinite"/>
                            <rect x="25" y="15" width="4" height="20" fill="#8b7355" transform="rotate(-20 25 15)"/>
                            <path d="M15 35 Q30 30 45 35" fill="none" stroke="#fff" stroke-width="3"/>
                        </g>
                    </svg>
                    <div>
                        <strong style="color:var(--rouge);">[工序 02 - 终极光面抹灰] ⏱️ 耗时定额：公式 [5 + 表面积/80] = ${tFrost} 分钟</strong><br>
                        提取剩余 ${(mats.cream * 0.7).toFixed(1)}g 腻子进行二次厚涂施工。抹刀垂直于盘面轴线，通过底盘离心力刮除冗余，制造纯白无菌实验田画布。
                    </div>
                </div>

                <div style="display:flex; gap:15px; margin-bottom:15px; padding-bottom:5px;">
                    <svg viewBox="0 0 60 60" width="60" height="60" style="flex-shrink:0; background:rgba(255,255,255,0.5); border-radius:6px; border:1px solid #c4a56e;">
                        <path d="M10 50 L50 50 M10 10 L10 50 M10 40 L50 40 M20 10 L20 50" stroke="#c4a56e" stroke-width="1" stroke-dasharray="2 2"/>
                        <circle cx="30" cy="30" r="3" fill="#ff3d3d">
                             <animate attributeName="opacity" values="1; 0; 1" dur="1s" repeatCount="indefinite"/>
                        </circle>
                        <circle cx="40" cy="20" r="2" fill="#5b7c99"/>
                    </svg>
                    <div>
                        <strong style="color:var(--rouge);">[工序 03 - XY坐标阵列喷涂] ⏱️ 耗时定额：视点图复杂程度而定</strong><br>
                        对照系统右侧【顶层壁画手稿】的显微探地雷达图样。使用色卡，沿 XY 相对坐标矩阵逐点释放颜料注射。任务完成。
                    </div>
                </div>
            `
        }
    };

    [gBase, gFilling, gTop].forEach(layer => {
        layer.addEventListener('click', function () {
            if (!isBrokenDown) return; // 只在打开状态允许阅读教学
            const data = layerData[this.id];
            if (data) {
                document.getElementById('layer-title').textContent = data.title;
                document.getElementById('layer-desc').innerHTML = data.desc;
                document.getElementById('layer-modal').classList.remove('hidden');
            }
        });
    });
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

function reprocessImageForNewSize() {
    if (lastUploadedImage) {
        processFrostingImage(lastUploadedImage);
    }
}

// Frosting Color Quantization (Bakery Cream Style)
function toFrostingColor(r, g, b) {
    // 增加亮度、降低对比度，模拟奶油材质
    let cr = Math.min(255, r * 0.9 + 30);
    let cg = Math.min(255, g * 0.9 + 30);
    let cb = Math.min(255, b * 0.9 + 30);

    const levels = 16;
    const step = 255 / (levels - 1);
    cr = Math.round(cr / step) * step;
    cg = Math.round(cg / step) * step;
    cb = Math.round(cb / step) * step;
    return `rgb(${Math.round(cr)},${Math.round(cg)},${Math.round(cb)})`;
}

function processFrostingImage(img) {
    // Top surface pixel mapping! 1 pixel = 1 cm x 1 cm.
    // L and W inputs are literally in cm.
    const l_cm = Math.floor(cakeData.l);
    const w_cm = Math.floor(cakeData.w);

    const targetWidth = l_cm;
    const targetHeight = w_cm;

    const canvas = document.createElement('canvas'); // Offscreen
    const ctx = canvas.getContext('2d');
    canvas.width = targetWidth;
    canvas.height = targetHeight;
    ctx.drawImage(img, 0, 0, targetWidth, targetHeight);
    const imgData = ctx.getImageData(0, 0, targetWidth, targetHeight);

    pixelMatrix = [];
    let colorCounts = {};

    for (let y = 0; y < targetHeight; y++) {
        let row = [];
        for (let x = 0; x < targetWidth; x++) {
            const idx = (y * targetWidth + x) * 4;
            const r = imgData.data[idx];
            const g = imgData.data[idx + 1];
            const b = imgData.data[idx + 2];
            let fColor = toFrostingColor(r, g, b);
            row.push(fColor);

            if (!colorCounts[fColor]) colorCounts[fColor] = 0;
            colorCounts[fColor]++;
        }
        pixelMatrix.push(row);
    }

    // 1 pixel = 1 cm² = 0.5g frosting
    let totalFrostingGrams = 0;
    Object.keys(colorCounts).forEach(c => {
        colorCounts[c] = (colorCounts[c] * 0.5); // Convert pixels to grams
        totalFrostingGrams += colorCounts[c];
    });

    document.getElementById('val-frosting').textContent = `${totalFrostingGrams.toFixed(1)} g`;

    // Draw onto the isometric layer mapped canvas
    const displayCanvas = document.getElementById('frosting-canvas');
    displayCanvas.width = targetWidth;
    displayCanvas.height = targetHeight;
    const dCtx = displayCanvas.getContext('2d');

    for (let y = 0; y < targetHeight; y++) {
        for (let x = 0; x < targetWidth; x++) {
            dCtx.fillStyle = pixelMatrix[y][x];
            dCtx.fillRect(x, y, 1, 1);
        }
    }

    renderCakeSVG(cakeData.l, cakeData.w, cakeData.h); // trigger layer display Update
    renderPaletteAndBlueprint(colorCounts, targetWidth, targetHeight);
}

function renderPaletteAndBlueprint(colorObj, width, height) {
    const container = document.getElementById('color-palette-container');
    container.innerHTML = '';
    colorMapping = {};

    // Default empty
    if (Object.keys(colorObj).length === 0) return;

    // 转换为数组并按用量倒序
    const colors = Object.keys(colorObj).map(c => {
        return { color: c, count: colorObj[c] };
    }).sort((a, b) => b.count - a.count);

    colors.forEach((item, index) => {
        const colorId = index + 1;
        colorMapping[item.color] = { id: colorId, color: item.color };

        const row = document.createElement('div');
        row.className = 'swatch-row';
        row.innerHTML = `
            <div class="swatch-info">
                <div class="swatch-color-box" style="background-color: ${item.color}; border-radius: 50%;"></div>
                <div>
                    <div class="swatch-name">糖霜色号 ${index + 1}</div>
                    <div class="swatch-hex">${item.color}</div>
                </div>
            </div>
            <div class="swatch-count">调配 ${item.count.toFixed(1)} g</div>
        `;
        container.appendChild(row);
    });

    // 渲染图纸面板 (Blueprint Viewer)
    const bpCanvas = document.getElementById('blueprint-canvas');
    const wrap = document.getElementById('blueprint-wrapper');
    const tooltip = document.getElementById('blueprint-tooltip');

    bpCanvas.width = width;
    bpCanvas.height = height;
    const ctx = bpCanvas.getContext('2d');

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            ctx.fillStyle = pixelMatrix[y][x];
            ctx.fillRect(x, y, 1, 1);
        }
    }

    bpCanvas.style.backgroundSize = `calc(100% / ${width}) calc(100% / ${height})`;

    // Reset Tooltip Events avoiding duplicates
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

        if (mappedInfo) {
            tooltip.innerHTML = `
                <div style="display:flex; align-items:center; gap:8px;">
                    <div style="width:12px;height:12px;background:${mappedInfo.color}; border:1px solid #fff; border-radius:50%;"></div>
                    <strong>色号 ${mappedInfo.id}</strong>
                </div>
                <div style="font-family:monospace; margin-top:4px;">Y: ${y + 1} | X: ${x + 1}</div>
            `;
            tooltip.classList.remove('hidden');
            tooltip.style.left = (e.clientX - rect.left + 15) + 'px';
            tooltip.style.top = (e.clientY - rect.top + 15) + 'px';
        }
    });

    newBp.addEventListener('mouseleave', () => {
        tooltip.classList.add('hidden');
    });
}

function handleBlueprintSearch() {
    if (pixelMatrix.length === 0) return;

    const rowInput = parseInt(document.getElementById('bp-search-y').value); // 行是Y
    const colInput = parseInt(document.getElementById('bp-search-x').value); // 列是X
    const resultSpan = document.getElementById('bp-search-result');
    const crosshair = document.getElementById('blueprint-crosshair');
    const canvas = document.getElementById('blueprint-canvas');
    const wrap = document.getElementById('blueprint-wrapper');

    const maxRow = pixelMatrix.length;
    const maxCol = pixelMatrix[0].length;

    if (isNaN(rowInput) || isNaN(colInput) || rowInput < 1 || rowInput > maxRow || colInput < 1 || colInput > maxCol) {
        resultSpan.textContent = `越界！范围: X(1-${maxCol}), Y(1-${maxRow})`;
        resultSpan.style.color = '#ff3d3d';
        crosshair.classList.add('hidden');
        return;
    }

    const y = rowInput - 1;
    const x = colInput - 1;
    const pixelColor = pixelMatrix[y][x];
    const mappedInfo = colorMapping[pixelColor];

    if (mappedInfo) {
        resultSpan.innerHTML = `<span style="display:inline-block;width:10px;height:10px;background:${mappedInfo.color}; border-radius:50%; margin-right:4px;border:1px solid #000;"></span>X:${colInput} Y:${rowInput} = 挤出色号${mappedInfo.id}`;
        resultSpan.style.color = 'var(--ink)';

        const rect = canvas.getBoundingClientRect();
        const wrapRect = wrap.getBoundingClientRect();

        const pixelW = rect.width / maxCol;
        const pixelH = rect.height / maxRow;

        const canvasLeft = rect.left - wrapRect.left;
        const canvasTop = rect.top - wrapRect.top;

        const targetX = canvasLeft + x * pixelW + (pixelW / 2);
        const targetY = canvasTop + y * pixelH + (pixelH / 2);

        crosshair.style.left = `${targetX}px`;
        crosshair.style.top = `${targetY}px`;

        const size = Math.max(12, pixelW * 1.5);
        crosshair.style.width = `${size}px`;
        crosshair.style.height = `${size}px`;
        crosshair.style.transform = `translate(-50%, -50%)`;
        crosshair.classList.remove('hidden');
    }
}

function openLearnModal() {
    document.getElementById('learn-modal').classList.remove('hidden');
}

function closeLearnModal() {
    document.getElementById('learn-modal').classList.add('hidden');
}

function toggleLayerBreakdown() {
    isBrokenDown = !isBrokenDown;
    const gTop = document.getElementById('layer-top');
    const gFilling = document.getElementById('layer-filling');
    const gBase = document.getElementById('layer-base');
    const fLayer = document.getElementById('frosting-layer');

    // Animate texts
    document.querySelectorAll('.layer-label').forEach(el => {
        el.style.transition = 'opacity 1s';
        el.style.opacity = isBrokenDown ? '1' : '0';
    });

    if (!gTop) return;

    if (isBrokenDown) {
        gTop.style.transform = 'translateY(-100px)';
        if (fLayer) fLayer.style.transform = 'translateY(-100px)';

        gFilling.style.transform = 'translateY(-40px)';
        gBase.style.transform = 'translateY(20px)';

        gTop.classList.add('layer-clickable');
        gFilling.classList.add('layer-clickable');
        gBase.classList.add('layer-clickable');
    } else {
        gTop.style.transform = 'translateY(0)';
        if (fLayer) fLayer.style.transform = 'translateY(0)';

        gFilling.style.transform = 'translateY(0)';
        gBase.style.transform = 'translateY(0)';

        gTop.classList.remove('layer-clickable');
        gFilling.classList.remove('layer-clickable');
        gBase.classList.remove('layer-clickable');
    }
}
