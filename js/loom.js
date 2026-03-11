/**
 * 传统花楼提花机 (Jacquard Drawloom Simulation)
 * 能够读取图片像素并生成织锦图案
 */

const CONFIG = {
    warpCount: 40,      // 经纱总数 (缩小规模以便演示)
    weaveSpeed: 800,    // 织造速度(ms)
    warpStartX: 100,
    warpSpacing: 10,
    warpStartY: 250,
    warpLength: 300
};

let weaveMatrix = []; // 二维数组存储编织图案 (0:下沉 1:提升/或者颜色代码)
let colorMapping = {}; // 色彩映射表：颜色RGB -> { id: 色号, color: 颜色 }
let currentRow = 0;
let isWeaving = false;
let weaveTimer = null;
let shuttlePos = 'left';

// ====== Tutorial Data ======
const TUTORIAL_DATA = {
    'tower': { title: '花楼与挽花工', desc: '花楼高耸于机架之上，挽花工坐在上面。通过提拉"耳子线"（程序控制器），指挥下方的成千上万根综丝升降。这类似于现代计算机的指令读取部分。' },
    'cards': { title: '花本结绳', desc: '花本是由丝线打结编织而成的立体"软盘"。它是中国古代最伟大的发明之一，通过结节的有无（0和1）记录提花图案，可以被无限制复制和反复使用。' },
    'heddles': { title: '通丝与综眼', desc: '综丝悬挂于花楼下，中间有综眼，经纱穿梭其中。挽花工一拉线，对应的数根综丝就会提起经纱，形成上下劈开的"梭口"，供梭子穿行。' },
    'shuttle': { title: '梭子引纬与打筘', desc: '下方织工踩下踏板固定梭口，将带有纬纱的"梭子"飞速掷过梭口。然后用力拉动"筘"（Reed），将纬纱重重砸紧，一根纬线就织入了锦缎中。' }
};

document.addEventListener('DOMContentLoaded', () => {
    // 1. 开场动画消除
    setTimeout(() => {
        const overlay = document.getElementById('entrance-overlay');
        if (overlay) overlay.style.opacity = '0';
        setTimeout(() => overlay && overlay.remove(), 1500);
    }, 5500);

    // 2. 初始化图纸机部件
    initLoom();

    // 3. 事件绑定
    document.getElementById('image-upload').addEventListener('change', handleImageUpload);
    document.getElementById('btn-weave').addEventListener('click', toggleWeave);

    // Modal events
    document.getElementById('btn-learn').addEventListener('click', () => {
        document.getElementById('learn-modal').classList.remove('hidden');
    });
    document.getElementById('learn-close').addEventListener('click', () => {
        document.getElementById('learn-modal').classList.add('hidden');
    });

    // Blueprint search event
    document.getElementById('bp-search-btn').addEventListener('click', handleBlueprintSearch);

    document.querySelectorAll('.part-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.part-btn').forEach(b => b.classList.remove('active'));
            e.currentTarget.classList.add('active');
            let part = e.currentTarget.getAttribute('data-part');
            document.getElementById('tut-title').textContent = TUTORIAL_DATA[part].title;
            document.getElementById('tut-content').textContent = TUTORIAL_DATA[part].desc;
        });
    });
});

function initLoom() {
    const warpGroup = document.getElementById('warps-group');
    const heddleGroup = document.getElementById('heddles-group');

    // 生成经线
    for (let i = 0; i < CONFIG.warpCount; i++) {
        const x = CONFIG.warpStartX + i * CONFIG.warpSpacing;
        // 经线
        const warp = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        warp.setAttribute('x1', x);
        warp.setAttribute('y1', CONFIG.warpStartY);
        warp.setAttribute('x2', x);
        warp.setAttribute('y2', CONFIG.warpStartY + CONFIG.warpLength);
        warp.setAttribute('class', 'warp-line');
        warp.setAttribute('id', `warp-${i}`);
        warpGroup.appendChild(warp);

        // 综丝 (Heddle)
        const heddle = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        heddle.setAttribute('d', `M ${x},200 L ${x},250 M ${x - 1},245 L ${x + 1},245 M ${x - 1},255 L ${x + 1},255`);
        heddle.setAttribute('stroke', '#a69');
        heddle.setAttribute('stroke-width', '0.5');
        heddleGroup.appendChild(heddle);

        // 通丝 (Harness cord) 连向花楼
        const cord = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        cord.setAttribute('x1', 300); // 聚拢于花楼中心
        cord.setAttribute('y1', 120);
        cord.setAttribute('x2', x);
        cord.setAttribute('y2', 200);
        cord.setAttribute('stroke', 'rgba(0,0,0,0.1)');
        cord.setAttribute('stroke-width', '0.5');
        heddleGroup.appendChild(cord);
    }
}

// 图像处理
function handleImageUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function (event) {
        const img = new Image();
        img.onload = function () {
            processImage(img);
        };
        img.src = event.target.result;
    };
    reader.readAsDataURL(file);
}

// 将真实RGB转为古典缂丝色彩风格（低饱和度、旧纸黄、丝线色阶）
function toKesiColor(r, g, b) {
    // 1. 提取灰度 (luminance)
    let l = 0.3 * r + 0.59 * g + 0.11 * b;
    // 2. 降低饱和度，并整体偏向旧织物的赭黄/暖色底色
    let kr = r * 0.4 + l * 0.5 + 30;
    let kg = g * 0.4 + l * 0.5 + 20;
    let kb = b * 0.4 + l * 0.5 - 10;

    // 3. 丝线色阶离散化 (缂丝工艺使用的是有限的丝线颜色，不支持无限渐变)
    const levels = 12; // 划分12个色阶
    const step = 255 / (levels - 1);
    kr = Math.round(kr / step) * step;
    kg = Math.round(kg / step) * step;
    kb = Math.round(kb / step) * step;

    // 限定范围
    kr = Math.max(0, Math.min(255, kr));
    kg = Math.max(0, Math.min(255, kg));
    kb = Math.max(0, Math.min(255, kb));

    return `rgb(${Math.round(kr)},${Math.round(kg)},${Math.round(kb)})`;
}

function processImage(img) {
    // 最大织造宽度设定 (控制在600，保证能看清丝线和线头)
    let targetWidth = img.width;
    let targetHeight = img.height;
    if (targetWidth > 600) {
        targetHeight = Math.floor(targetHeight * (600 / targetWidth));
        targetWidth = 600;
    }

    const canvas = document.createElement('canvas'); // Offscreen
    const ctx = canvas.getContext('2d');
    canvas.width = targetWidth;
    canvas.height = targetHeight;
    ctx.drawImage(img, 0, 0, targetWidth, targetHeight);
    const imgData = ctx.getImageData(0, 0, targetWidth, targetHeight);

    weaveMatrix = [];
    let colorCounts = {};

    for (let y = 0; y < targetHeight; y++) {
        let row = [];
        for (let x = 0; x < targetWidth; x++) {
            const idx = (y * targetWidth + x) * 4;
            // 存入缂丝风格色彩
            const r = imgData.data[idx];
            const g = imgData.data[idx + 1];
            const b = imgData.data[idx + 2];
            let kColor = toKesiColor(r, g, b);
            row.push(kColor);

            // 统计颜色及用量
            if (!colorCounts[kColor]) colorCounts[kColor] = 0;
            colorCounts[kColor]++;
        }
        weaveMatrix.push(row);
    }

    // 渲染颜色学习面板 Palette
    renderPalette(colorCounts);

    // 渲染显微图纸 Blueprint
    renderBlueprint(targetWidth, targetHeight);

    // 准备真实显示的画布
    const displayCanvas = document.getElementById('woven-cloth-canvas');
    displayCanvas.width = targetWidth;
    displayCanvas.height = targetHeight;
    const dCtx = displayCanvas.getContext('2d');
    dCtx.clearRect(0, 0, targetWidth, targetHeight);
    displayCanvas.style.transform = `translateY(0px)`;
    displayCanvas.style.height = 'auto'; // 保持宽高比

    // 缂丝工艺极慢，此为放慢后的演示速度
    if (weaveMatrix.length > 300) {
        CONFIG.weaveSpeed = 30;
    } else if (weaveMatrix.length > 100) {
        CONFIG.weaveSpeed = 80;
    } else {
        CONFIG.weaveSpeed = 200;
    }

    currentRow = 0;
    stopWeave();
    document.getElementById('total-rows').textContent = weaveMatrix.length;
    document.getElementById('current-row').textContent = 0;

    updateStatus(`系统已获取图样 (${targetWidth}x${targetHeight}) 像素全彩花本。等待指令。`, false);
}

// 渲染配色面板
function renderPalette(colorObj) {
    const container = document.getElementById('color-palette-container');
    container.innerHTML = '';
    colorMapping = {}; // 重置映射

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
                <div class="swatch-color-box" style="background-color: ${item.color};"></div>
                <div>
                    <div class="swatch-name">色号 ${index + 1}</div>
                    <div class="swatch-hex">${item.color}</div>
                </div>
            </div>
            <div class="swatch-count">需织 ${item.count} 绒（针）</div>
        `;
        container.appendChild(row);
    });
}

// 渲染图纸面板 (Blueprint Viewer)
function renderBlueprint(width, height) {
    const bpCanvas = document.getElementById('blueprint-canvas');
    const wrap = document.getElementById('blueprint-wrapper');
    const tooltip = document.getElementById('blueprint-tooltip');

    bpCanvas.width = width;
    bpCanvas.height = height;
    const ctx = bpCanvas.getContext('2d');

    // 绘制当前取得的完整图案矩阵
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            ctx.fillStyle = weaveMatrix[y][x];
            ctx.fillRect(x, y, 1, 1);
        }
    }

    // 设置网格背景视觉效果 (随像素比例缩放)
    bpCanvas.style.backgroundSize = `calc(100% / ${width}) calc(100% / ${height})`;

    // 鼠标交互：读取悬停位置的像素和色号
    bpCanvas.addEventListener('mousemove', (e) => {
        const rect = bpCanvas.getBoundingClientRect();
        // 计算鼠标相对于Canvas元素的坐标
        const scaleX = bpCanvas.width / rect.width;
        const scaleY = bpCanvas.height / rect.height;
        let x = Math.floor((e.clientX - rect.left) * scaleX);
        let y = Math.floor((e.clientY - rect.top) * scaleY);

        x = Math.max(0, Math.min(x, bpCanvas.width - 1));
        y = Math.max(0, Math.min(y, bpCanvas.height - 1));

        const pixelColor = weaveMatrix[y][x];
        const mappedInfo = colorMapping[pixelColor];

        if (mappedInfo) {
            tooltip.innerHTML = `
                <div style="display:flex; align-items:center; gap:8px;">
                    <div style="width:12px;height:12px;background:${mappedInfo.color}; border:1px solid #fff;"></div>
                    <strong>色号 ${mappedInfo.id}</strong>
                </div>
                <div style="font-family:monospace; margin-top:4px;">Row: ${y + 1} | Col: ${x + 1}</div>
                <div style="font-family:monospace; font-size:0.8rem; opacity:0.8;">${mappedInfo.color}</div>
            `;
            tooltip.classList.remove('hidden');

            // 跟随鼠标
            tooltip.style.left = (e.clientX - rect.left + 15) + 'px';
            tooltip.style.top = (e.clientY - rect.top + 15) + 'px';
        }
    });

    bpCanvas.addEventListener('mouseleave', () => {
        tooltip.classList.add('hidden');
    });
}

// 开始/暂停
function toggleWeave() {
    if (weaveMatrix.length === 0) {
        alert("请先上传花本(图样)！");
        return;
    }
    if (isWeaving) {
        stopWeave();
    } else {
        startWeave();
    }
}

function startWeave() {
    isWeaving = true;
    document.getElementById('btn-weave').textContent = '暂停织造';
    updateStatus('机杼咿呀 织造中...', true);
    document.querySelector('.status-dot').classList.add('active');

    weaveTimer = setInterval(weaveStep, CONFIG.weaveSpeed);
}

function stopWeave() {
    isWeaving = false;
    document.getElementById('btn-weave').textContent = '继续织造';
    document.querySelector('.status-dot').classList.remove('active');
    clearInterval(weaveTimer);
    updateStatus('待机休眠中 (PAUSED)', false);
}

function updateStatus(text, isActive) {
    document.getElementById('loom-status').textContent = text;
}

// 核心动画序列（模拟织机物理动作）
function weaveStep() {
    if (currentRow >= weaveMatrix.length) {
        stopWeave();
        updateStatus('锦绫已成 织造完成 ✨', false);
        return;
    }

    const rowPattern = weaveMatrix[currentRow];
    document.getElementById('current-row').textContent = currentRow + 1;

    // 1. 挽花工提升：更新上方SVG经线发光状态 (随机抽取几个表现机器运转)
    for (let i = 0; i < CONFIG.warpCount; i++) {
        const warp = document.getElementById(`warp-${i}`);
        if (Math.random() > 0.6) {
            warp.classList.add('warp-active');
        } else {
            warp.classList.remove('warp-active');
        }
    }

    // 2. 引纬 (掷梭) & 3. 打筘 (对于极速模式，跳过DOM重绘防卡顿)
    if (CONFIG.weaveSpeed > 20) {
        const shuttle = document.getElementById('shuttle-group');
        shuttle.style.animation = 'none';
        void shuttle.offsetWidth;
        if (shuttlePos === 'left') {
            shuttle.style.animation = `flyShuttle ${CONFIG.weaveSpeed / 2}ms ease-in-out forwards`;
            shuttlePos = 'right';
        } else {
            shuttle.style.animation = `flyShuttleRev ${CONFIG.weaveSpeed / 2}ms ease-in-out forwards`;
            shuttlePos = 'left';
        }

        setTimeout(() => {
            const reed = document.getElementById('reed-group');
            reed.style.animation = 'none';
            void reed.offsetWidth;
            reed.style.animation = `beatReed ${CONFIG.weaveSpeed / 3}ms cubic-bezier(0.1, 0.9, 0.2, 1) forwards`;
            drawClothRow(rowPattern);
        }, Math.max(10, CONFIG.weaveSpeed / 2));
    } else {
        // 极速模式：直接绘制，不播放沉重的SVG部件动画
        drawClothRow(rowPattern);
    }

    currentRow++;
}

// 绘制成品的布匹段
function drawClothRow(pattern) {
    const displayCanvas = document.getElementById('woven-cloth-canvas');
    if (!displayCanvas) return;
    const ctx = displayCanvas.getContext('2d');

    // 一次画一行像素
    const yTarget = currentRow;
    for (let x = 0; x < pattern.length; x++) {
        // 核心技术模拟：“通经断纬”。当纬线颜色改变时，留下线头
        if (x > 0 && pattern[x] !== pattern[x - 1]) {
            if (Math.random() > 0.4) {
                // 画一点之前颜色或当前颜色的毛边乱线作为"线头"
                ctx.fillStyle = Math.random() > 0.5 ? pattern[x - 1] : pattern[x];
                // 向上或向下溢出1个像素，营造手工换线时的线头和缝隙感
                ctx.fillRect(x, yTarget + (Math.random() > 0.5 ? 1 : -1), 1, 1);
            }
        }

        ctx.fillStyle = pattern[x];
        ctx.fillRect(x, yTarget, 1, 1);
    }

    // 画布往上拉 (模拟滚布拉出) 
    // foreignObject width=400，所以画布视觉缩放比是 = 400 / imgWidth
    const scaleFactor = 400 / displayCanvas.width;
    const visualY = yTarget * scaleFactor;
    displayCanvas.style.transform = `translateY(-${visualY}px)`;
}

// 查验针法功能 ( Blueprint Viewer Search )
function handleBlueprintSearch() {
    if (weaveMatrix.length === 0) return;

    const rowInput = parseInt(document.getElementById('bp-search-row').value);
    const colInput = parseInt(document.getElementById('bp-search-col').value);
    const resultSpan = document.getElementById('bp-search-result');
    const crosshair = document.getElementById('blueprint-crosshair');
    const canvas = document.getElementById('blueprint-canvas');
    const wrap = document.getElementById('blueprint-wrapper');

    const maxRow = weaveMatrix.length;
    const maxCol = weaveMatrix[0].length;

    if (isNaN(rowInput) || isNaN(colInput) || rowInput < 1 || rowInput > maxRow || colInput < 1 || colInput > maxCol) {
        resultSpan.textContent = `越界！有效范围: 行1-${maxRow}, 列1-${maxCol}`;
        resultSpan.style.color = '#ff3d3d';
        crosshair.classList.add('hidden');
        return;
    }

    const y = rowInput - 1;
    const x = colInput - 1;
    const pixelColor = weaveMatrix[y][x];
    const mappedInfo = colorMapping[pixelColor];

    if (mappedInfo) {
        // 更新文本
        resultSpan.innerHTML = `<span style="display:inline-block;width:10px;height:10px;background:${mappedInfo.color};margin-right:4px;border:1px solid #000;"></span>第${rowInput}行 第${colInput}列 为 色号${mappedInfo.id} | ${mappedInfo.color}`;
        resultSpan.style.color = 'var(--ink)';

        // 像素定位计算
        const rect = canvas.getBoundingClientRect();
        const wrapRect = wrap.getBoundingClientRect();

        // 每个像素渲染后的视觉长宽
        const pixelW = rect.width / maxCol;
        const pixelH = rect.height / maxRow;

        // X 和 Y 是目标像素格子左上角的坐标 (相对于Wrap内Canvas起点)
        // Canvas 的位置相对于 Wrapper 可能是居中计算的。通过计算 relative offset：
        const canvasLeft = rect.left - wrapRect.left;
        const canvasTop = rect.top - wrapRect.top;

        const targetX = canvasLeft + x * pixelW + (pixelW / 2);
        const targetY = canvasTop + y * pixelH + (pixelH / 2);

        crosshair.style.left = `${targetX}px`;
        crosshair.style.top = `${targetY}px`;

        // 对于极其密集的像素，十字准星框大一点更容易看见
        const size = Math.max(12, pixelW * 1.5);
        crosshair.style.width = `${size}px`;
        crosshair.style.height = `${size}px`;
        // 抵消十字的 translate50% 负向 margin 已经在CSS中写成伪元素绝对定位了。我们让crosshair的圆心落在 targetX/Y 即可 (需要 translateX/Y)
        crosshair.style.transform = `translate(-50%, -50%)`;

        crosshair.classList.remove('hidden');
    }
}
