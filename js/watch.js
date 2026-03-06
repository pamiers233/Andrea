/**
 * 三问怀表 — Minute Repeater Pocket Watch
 * Da Vinci sketch style, exploded parts view, feature explanations
 */
document.addEventListener('DOMContentLoaded', () => {
    const NS = 'http://www.w3.org/2000/svg';
    const INK = '#3a2a1a';
    const GOLD = '#daa520';
    const SEPIA = '#704214';
    const svg = document.getElementById('watch-svg');
    const CX = 250, CY = 270; // watch center
    let isExploded = false;
    let clickCount = 0;
    let clickTimer = null;

    setTimeout(() => { const e = document.getElementById('entrance-overlay'); if (e) e.style.display = 'none'; }, 6500);

    // =============================================
    // 1. HELPER: GEAR PATH
    // =============================================
    function gearPath(cx, cy, r, teeth, toothH) {
        let d = '';
        toothH = toothH || r * 0.18;
        for (let i = 0; i < teeth; i++) {
            const a1 = (i / teeth) * Math.PI * 2 - Math.PI / 2;
            const a2 = ((i + 0.3) / teeth) * Math.PI * 2 - Math.PI / 2;
            const a3 = ((i + 0.5) / teeth) * Math.PI * 2 - Math.PI / 2;
            const a4 = ((i + 0.8) / teeth) * Math.PI * 2 - Math.PI / 2;
            d += `${i === 0 ? 'M' : 'L'}${(cx + r * Math.cos(a1)).toFixed(1)},${(cy + r * Math.sin(a1)).toFixed(1)} `;
            d += `L${(cx + (r + toothH) * Math.cos(a2)).toFixed(1)},${(cy + (r + toothH) * Math.sin(a2)).toFixed(1)} `;
            d += `L${(cx + (r + toothH) * Math.cos(a3)).toFixed(1)},${(cy + (r + toothH) * Math.sin(a3)).toFixed(1)} `;
            d += `L${(cx + r * Math.cos(a4)).toFixed(1)},${(cy + r * Math.sin(a4)).toFixed(1)} `;
        }
        return d + 'Z';
    }

    function spiralPath(cx, cy, r1, r2, turns) {
        let d = '';
        const steps = turns * 40;
        for (let i = 0; i <= steps; i++) {
            const t = i / steps;
            const a = t * turns * Math.PI * 2;
            const r = r1 + (r2 - r1) * t;
            d += `${i === 0 ? 'M' : 'L'}${(cx + r * Math.cos(a)).toFixed(1)},${(cy + r * Math.sin(a)).toFixed(1)} `;
        }
        return d;
    }

    // =============================================
    // 2. WATCH PARTS DATA
    // =============================================
    const parts = [
        {
            id: 'bow', label: '表环 · Bow', side: 'left', external: true,
            explode: { x: 0, y: -160, r: -5 },
            svg: `<circle cx="${CX}" cy="58" r="20" class="sketch-stroke"/>
                  <circle cx="${CX}" cy="58" r="11" class="sketch-thin"/>`,
            title: '表环 — ANNVLVS', desc: '怀表顶部的金属环，用于穿过表链或丝带。它必须足够坚固以承受怀表的全部重量，同时要精美优雅。',
            demoNote: '🔗 连接表链的关键部件\n💎 通常由18K金制成\n⚖️ 需承受整表重量',
            details: '<h3>材质</h3><p>高级怀表的表环通常用18K黄金或铂金制成，表面经过精细抛光。有些还带有雕花装饰。</p>'
        },
        {
            id: 'crown', label: '表冠 · Crown', side: 'left', external: true,
            explode: { x: -70, y: -140, r: 15 },
            svg: `<rect x="${CX - 7}" y="74" width="14" height="16" rx="3" class="sketch-fill"/>
                  <line x1="${CX - 5}" y1="78" x2="${CX - 5}" y2="86" class="sketch-thin"/>
                  <line x1="${CX}" y1="78" x2="${CX}" y2="86" class="sketch-thin"/>
                  <line x1="${CX + 5}" y1="78" x2="${CX + 5}" y2="86" class="sketch-thin"/>`,
            title: '表冠 — CORONA', desc: '用于上发条和调整时间的旋钮。三问怀表的表冠设计精密，需要确保密封性同时保持操作顺畅。',
            demoNote: '🔄 顺时针旋转=上发条\n🕐 拉出后旋转=调时间\n⚙️ 内含离合机构',
            details: '<h3>功能</h3><ul><li>上弦：将能量储存到发条中</li><li>调时：通过齿轮系统移动指针</li><li>密封：防止灰尘和水进入</li></ul>'
        },
        {
            id: 'case', label: '表壳 · Case', side: 'left', external: true,
            explode: { x: 50, y: 30, r: 3 },
            svg: `<circle cx="${CX}" cy="${CY}" r="175" class="sketch-bold"/>
                  <circle cx="${CX}" cy="${CY}" r="170" class="sketch-thin"/>
                  <circle cx="${CX}" cy="${CY}" r="178" class="sketch-thin" stroke-dasharray="2 4"/>`,
            title: '表壳 — THECA', desc: '保护机芯的外壳，通常由贵金属制成。三问怀表的表壳特别讲究，因为声音需要通过表壳传出，所以壳壁厚度经过精确计算。',
            demoNote: '🛡️ 保护内部精密机芯\n🔊 壳壁厚度影响报时音质\n✨ 18K金/铂金制造',
            details: '<h3>声学设计</h3><p>三问怀表的表壳是一个"共鸣腔"，壳壁太厚声音沉闷，太薄则尖锐。制表师需要反复调试，找到最佳音色。</p>'
        },
        {
            id: 'caseback', label: '底盖 · Case Back', side: 'left', external: true,
            explode: { x: 120, y: 80, r: 8 },
            svg: `<circle cx="${CX}" cy="${CY}" r="165" class="sketch-hatch"/>
                  <circle cx="${CX}" cy="${CY}" r="130" class="sketch-thin" stroke-dasharray="3 6"/>`,
            title: '底盖 — OPERCVLVM', desc: '怀表背面的盖板。高级怀表的底盖可以打开，露出内部精美的机芯。许多底盖上都刻有精美的雕花或铭文。',
            demoNote: '🔍 打开可观赏机芯\n✒️ 常刻有制表师签名\n🎨 手工雕花装饰',
            details: '<h3>猎壳vs开面</h3><ul><li>猎壳(Hunter): 前后都有盖，保护表镜</li><li>开面(Open-face): 只有底盖，表盘直接可见</li></ul>'
        },
        {
            id: 'bezel', label: '表圈 · Bezel', side: 'left', external: true,
            explode: { x: -120, y: -60, r: -8 },
            svg: `<circle cx="${CX}" cy="${CY}" r="162" class="sketch-stroke"/>
                  <circle cx="${CX}" cy="${CY}" r="155" class="sketch-stroke"/>`,
            title: '表圈 — CIRCVLVS', desc: '围绕表镜的金属环框，将表镜固定在表壳上。用细铰链或螺纹连接，需要极高的加工精度。',
            demoNote: '🔲 固定表镜的金属环\n🔩 精密螺纹/铰链连接\n💎 有时镶嵌宝石',
            details: '<h3>工艺</h3><p>表圈的圆度误差必须控制在0.01mm以内，否则表镜无法紧密贴合，灰尘和水分会侵入机芯。</p>'
        },
        {
            id: 'crystal', label: '表镜 · Crystal', side: 'left', external: true,
            explode: { x: -140, y: 40, r: -12 },
            svg: `<circle cx="${CX}" cy="${CY}" r="152" fill="rgba(200,220,240,0.06)" stroke="${INK}" stroke-width="0.4"/>`,
            title: '表镜 — SPECVLVM', desc: '覆盖表盘的透明保护层。早期用矿物玻璃，后来用人造蓝宝石水晶，硬度仅次于钻石，几乎不会被刮花。',
            demoNote: '💎 蓝宝石水晶(莫氏硬度9)\n👁️ 双面防反射涂层\n🛡️ 保护表盘和指针',
            details: '<h3>材质演变</h3><ul><li>17世纪: 岩石水晶(天然石英)</li><li>19世纪: 矿物玻璃</li><li>20世纪: 人造蓝宝石水晶</li></ul>'
        },
        {
            id: 'dial', label: '表盘 · Dial', side: 'left', external: true,
            explode: { x: -160, y: 100, r: -6 },
            svg: (function () {
                let s = `<circle cx="${CX}" cy="${CY}" r="148" fill="rgba(244,228,193,0.15)" stroke="${INK}" stroke-width="0.8"/>`;
                const romans = ['XII', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI'];
                for (let i = 0; i < 12; i++) {
                    const a = (i / 12) * Math.PI * 2 - Math.PI / 2;
                    const tx = CX + 128 * Math.cos(a), ty = CY + 128 * Math.sin(a) + 5;
                    s += `<text x="${tx.toFixed(0)}" y="${ty.toFixed(0)}" text-anchor="middle" fill="${INK}" font-family="'EB Garamond',serif" font-size="14">${romans[i]}</text>`;
                    const lx1 = CX + 140 * Math.cos(a), ly1 = CY + 140 * Math.sin(a);
                    const lx2 = CX + 148 * Math.cos(a), ly2 = CY + 148 * Math.sin(a);
                    s += `<line x1="${lx1.toFixed(0)}" y1="${ly1.toFixed(0)}" x2="${lx2.toFixed(0)}" y2="${ly2.toFixed(0)}" stroke="${INK}" stroke-width="1.2"/>`;
                }
                for (let i = 0; i < 60; i++) {
                    if (i % 5 === 0) continue;
                    const a = (i / 60) * Math.PI * 2 - Math.PI / 2;
                    const lx1 = CX + 144 * Math.cos(a), ly1 = CY + 144 * Math.sin(a);
                    const lx2 = CX + 148 * Math.cos(a), ly2 = CY + 148 * Math.sin(a);
                    s += `<line x1="${lx1.toFixed(1)}" y1="${ly1.toFixed(1)}" x2="${lx2.toFixed(1)}" y2="${ly2.toFixed(1)}" stroke="${INK}" stroke-width="0.3"/>`;
                }
                return s;
            })(),
            title: '表盘 — FACIES', desc: '显示时间的面板，带有罗马数字时标和分钟刻度。高级怀表的表盘常用大明火珐琅工艺，历经数百年依然洁白如新。',
            demoNote: '🕐 罗马数字时标\n📏 60个分钟刻度\n🎨 大明火珐琅工艺',
            details: '<h3>珐琅表盘</h3><p>大明火珐琅需要将珐琅粉涂在铜盘上，在800°C高温下烧制多次。每次只能涂薄薄一层，有时需要烧制10次以上才能达到完美的乳白色。</p>'
        },
        {
            id: 'hourhand', label: '时针 · Hour Hand', side: 'left', external: true,
            explode: { x: 150, y: -100, r: 25 },
            svg: `<g id="time-hour"><path d="M${CX},${CY} L${CX - 4},${CY - 15} L${CX - 2},${CY - 80} L${CX},${CY - 95} L${CX + 2},${CY - 80} L${CX + 4},${CY - 15}Z" class="sketch-fill"/>
                  <circle cx="${CX}" cy="${CY}" r="6" class="sketch-fill"/></g>`,
            title: '时针 — INDICATRIX HORARVM', desc: '较短较粗的指针，指向当前小时。每12小时旋转一周。形状通常为"宝玑针"或"柳叶针"，末端经过精细抛光。',
            demoNote: '🕐 12小时转一圈\n✨ 蓝钢烤制(300°C)\n📐 宝玑针/柳叶针样式',
            details: '<h3>蓝钢工艺</h3><p>将钢质指针加热到300°C，表面氧化形成均匀的宝蓝色。温度稍有偏差，颜色就会不均匀。这是制表师的基本功之一。</p>'
        },
        {
            id: 'minutehand', label: '分针 · Min Hand', side: 'left', external: true,
            explode: { x: 170, y: -50, r: -20 },
            svg: `<g id="time-min"><path d="M${CX},${CY} L${CX - 3},${CY - 20} L${CX - 1.5},${CY - 120} L${CX},${CY - 140} L${CX + 1.5},${CY - 120} L${CX + 3},${CY - 20}Z" class="sketch-fill"/></g>`,
            title: '分针 — INDICATRIX MINVTARVM', desc: '较长较细的指针，指向当前分钟。每60分钟旋转一周，末端延伸到分钟刻度环。',
            demoNote: '🕐 60分钟转一圈\n📏 比时针更长更细\n⚖️ 需要精确配重',
            details: '<h3>配重</h3><p>分针的尾部有一小段配重，确保重心在轴心上。否则指针在不同位置会因重力而走时不准。</p>'
        },
        {
            id: 'secondhand', label: '秒针 · Sec Hand', side: 'left', external: true,
            explode: { x: 190, y: -20, r: -40 },
            svg: `<g id="time-sec"><line x1="${CX}" y1="${CY + 25}" x2="${CX}" y2="${CY - 142}" class="sketch-thin"/><circle cx="${CX}" cy="${CY}" r="3" class="sketch-fill"/></g>`,
            title: '秒针 — INDICATRIX SECVNDARVM', desc: '最长最细的指针，指示当前秒数。在具有四轮的怀表机芯中，秒针使得时间流逝更加显而易见。',
            demoNote: '🕐 60秒转一圈\n📏 作为四轮的延伸',
            details: '<h3>流逝的时间</h3><p>三问怀表中，秒针的存在让使用者能更直观感受到时间的流逝。但在报时过程中，使用者主要通过听觉获取更精准的时分信息。</p>'
        },
        {
            id: 'slide', label: '三问拨杆 · Slide', side: 'right', external: true,
            explode: { x: -180, y: -30, r: -10 },
            svg: `<path d="M${CX - 178},${CY - 40} Q${CX - 185},${CY - 20} ${CX - 178},${CY + 10}" class="sketch-bold" stroke="${SEPIA}"/>
                  <circle cx="${CX - 178}" cy="${CY - 40}" r="5" fill="${SEPIA}" opacity="0.3" stroke="${SEPIA}" stroke-width="0.8"/>`,
            title: '三问拨杆 — REPAGVLVM', desc: '三问怀表最标志性的外部部件！向下拨动这个杆，怀表就会报出当前时间的声音。它同时为报时机构上弦提供能量。',
            demoNote: '👆 向下拨动=启动报时\n🔋 拨动同时为报时上弦\n🔔 松手后自动报时',
            details: '<h3>三问报时</h3><ol><li>低音"当" = 整点数</li><li>高低"叮当" = 刻钟数</li><li>高音"叮" = 分钟数</li></ol><p>例如10:37 → 10响低音 + 2响双音(=30分) + 7响高音</p>'
        },
        {
            id: 'mainspring', label: '发条 · Mainspring', side: 'right', external: false,
            explode: { x: -120, y: 130, r: 15 },
            svg: `<path d="${spiralPath(CX - 55, CY - 40, 5, 25, 3)}" class="sketch-stroke"/>`,
            title: '主发条 — ELASTRVM', desc: '提供动力的盘绕弹簧钢带，长约30-50cm，宽约2mm。上满弦后可为机芯提供约40小时的动力储备。',
            demoNote: '🌀 盘绕的弹簧钢带\n📏 长约30-50cm\n⏰ 动力储备~40小时',
            details: '<h3>材质</h3><p>现代发条用Nivaflex合金制成，具有极高的弹性和抗疲劳性。历史上用碳钢，容易断裂。</p>'
        },
        {
            id: 'barrel', label: '发条盒 · Barrel', side: 'right', external: false,
            explode: { x: -80, y: 160, r: -8 },
            svg: `<circle cx="${CX - 55}" cy="${CY - 40}" r="30" class="sketch-fill"/>
                  <circle cx="${CX - 55}" cy="${CY - 40}" r="4" class="sketch-stroke"/>
                  <line x1="${CX - 55}" y1="${CY - 70}" x2="${CX - 55}" y2="${CY - 10}" class="sketch-thin" stroke-dasharray="2 3"/>`,
            title: '发条盒 — PYXIS', desc: '容纳主发条的圆形金属盒。发条盒外壁有齿，与中心轮啮合，将发条的能量传递给齿轮系。',
            demoNote: '📦 容纳和保护主发条\n⚙️ 外壁齿轮传递动力\n🔄 发条盒缓慢旋转',
            details: '<h3>等力机构</h3><p>发条从满弦到空弦，输出力矩会逐渐减小。高级机芯使用"芝麻链"或"宝塔轮"来补偿这个差异。</p>'
        },
        {
            id: 'centerwhl', label: '中心轮 · Center Whl', side: 'right', external: false,
            explode: { x: 0, y: 160, r: 12 },
            svg: `<path d="${gearPath(CX, CY, 22, 12)}" class="sketch-fill"/>
                  <circle cx="${CX}" cy="${CY}" r="4" class="sketch-stroke"/>`,
            title: '中心轮 — ROTA CENTRALIS', desc: '位于机芯中央的齿轮，每小时旋转一圈。它连接分针，同时将动力传递给三轮。',
            demoNote: '⚙️ 每60分钟转一圈\n📌 直接驱动分针\n🔗 连接发条盒→三轮',
            details: '<h3>齿轮比</h3><p>从发条盒到中心轮的齿轮比设计，确保中心轮精确地每小时转一圈。</p>'
        },
        {
            id: 'thirdwhl', label: '三轮 · Third Whl', side: 'right', external: false,
            explode: { x: 80, y: 170, r: -15 },
            svg: `<path d="${gearPath(CX + 50, CY - 30, 16, 10)}" class="sketch-fill"/>
                  <circle cx="${CX + 50}" cy="${CY - 30}" r="3" class="sketch-stroke"/>`,
            title: '三轮 — ROTA TERTIA', desc: '齿轮传动系中的中间齿轮，连接中心轮和四轮（秒轮），起到变速和传力的作用。',
            demoNote: '⚙️ 传动系中间环节\n🔗 中心轮→三轮→四轮\n🔄 变速传力',
            details: '<h3>传动链</h3><p>发条盒 → 中心轮(1h/圈) → 三轮 → 四轮(1min/圈) → 擒纵轮</p>'
        },
        {
            id: 'fourthwhl', label: '四轮/秒轮 · 4th', side: 'right', external: false,
            explode: { x: 120, y: 140, r: 20 },
            svg: `<path d="${gearPath(CX + 60, CY + 40, 13, 8)}" class="sketch-fill"/>
                  <circle cx="${CX + 60}" cy="${CY + 40}" r="2.5" class="sketch-stroke"/>`,
            title: '四轮（秒轮）— ROTA QVARTA', desc: '每分钟旋转一圈的齿轮，在有秒针的表中直接驱动秒针。它将动力传递给擒纵轮。',
            demoNote: '⚙️ 每60秒转一圈\n📌 驱动秒针(若有)\n🔗 连接到擒纵轮',
            details: '<h3>秒针</h3><p>并非所有怀表都有秒针。有的在6点位置有小秒针盘，有的则省略秒针以获得更简洁的表盘。</p>'
        },
        {
            id: 'escapewhl', label: '擒纵轮 · Escape', side: 'right', external: false,
            explode: { x: 150, y: 100, r: -25 },
            svg: `<path d="${gearPath(CX + 35, CY + 75, 14, 15, 4)}" class="sketch-stroke"/>
                  <circle cx="${CX + 35}" cy="${CY + 75}" r="3" class="sketch-fill"/>`,
            title: '擒纵轮 — ROTA INHIBITIONIS', desc: '擒纵机构的核心组件。它的尖齿与擒纵叉交替啮合，将连续的动力转换为离散的"滴答"脉冲。',
            demoNote: '⚡ 将连续动力→离散脉冲\n🔊 "滴答"声的来源\n⚙️ 每秒释放数次',
            details: '<h3>工作原理</h3><p>擒纵轮被擒纵叉交替锁住和释放。每次释放时，一个齿滑过叉瓦，发出细微的"嗒"声。这就是机械表"滴答"声的来源。</p>'
        },
        {
            id: 'palletfork', label: '擒纵叉 · Pallet', side: 'right', external: false,
            explode: { x: 170, y: 50, r: 30 },
            svg: `<path d="M${CX + 15},${CY + 100} L${CX + 35},${CY + 90} L${CX + 55},${CY + 100}" class="sketch-bold"/>
                  <rect x="${CX + 12}" y="${CY + 97}" width="8" height="6" rx="1" fill="${INK}" opacity="0.3" stroke="${INK}" stroke-width="0.5"/>
                  <rect x="${CX + 52}" y="${CY + 97}" width="8" height="6" rx="1" fill="${INK}" opacity="0.3" stroke="${INK}" stroke-width="0.5"/>
                  <line x1="${CX + 35}" y1="${CY + 90}" x2="${CX + 35}" y2="${CY + 110}" class="sketch-stroke"/>`,
            title: '擒纵叉 — FVRCA', desc: '连接擒纵轮和摆轮的杠杆。两端镶有红宝石叉瓦，交替锁住和释放擒纵轮，将能量传递给摆轮。',
            demoNote: '⚙️ 杠杆式擒纵机构\n💎 两端镶红宝石叉瓦\n🔄 左右摆动控制节奏',
            details: '<h3>瑞士杠杆擒纵</h3><p>这是最常见的现代擒纵机构，由Abraham-Louis Breguet完善。红宝石(刚玉)叉瓦耐磨性极好，可以工作数十年。</p>'
        },
        {
            id: 'balance', label: '摆轮 · Balance', side: 'right', external: false,
            explode: { x: 140, y: 0, r: -15 },
            svg: `<circle cx="${CX - 10}" cy="${CY + 110}" r="22" class="sketch-stroke"/>
                  <circle cx="${CX - 10}" cy="${CY + 110}" r="3" class="sketch-fill"/>
                  <path d="${spiralPath(CX - 10, CY + 110, 4, 15, 2.5)}" class="sketch-thin"/>
                  <line x1="${CX - 32}" y1="${CY + 110}" x2="${CX + 12}" y2="${CY + 110}" class="sketch-thin"/>`,
            title: '摆轮与游丝 — LIBRAMENTVM', desc: '机械表的"心脏"！摆轮以每小时18000-36000次的频率来回摆动，游丝（发丝弹簧）提供回复力。走时精度完全取决于这对组合。',
            demoNote: '💓 机芯的"心脏"\n🌀 游丝=极细的弹簧\n🔄 每秒摆动3-5次\n🎯 精度取决于此',
            details: '<h3>频率</h3><ul><li>18000次/时 = 2.5Hz (老式)</li><li>21600次/时 = 3Hz (标准)</li><li>28800次/时 = 4Hz (高频)</li><li>36000次/时 = 5Hz (精密)</li></ul>'
        },
        {
            id: 'hammer', label: '音锤 · Hammer', side: 'right', external: false,
            explode: { x: -170, y: 120, r: 20 },
            svg: `<line x1="${CX + 80}" y1="${CY + 60}" x2="${CX + 110}" y2="${CY + 30}" class="sketch-bold" stroke="${SEPIA}"/>
                  <circle cx="${CX + 113}" cy="${CY + 27}" r="5" fill="${SEPIA}" opacity="0.25" stroke="${SEPIA}" stroke-width="1"/>`,
            title: '音锤 — MALLEVS', desc: '敲击音簧产生声音的小锤子。三问怀表通常有两个音锤：一个敲高音簧（分钟），一个敲低音簧（整点）。',
            demoNote: '🔨 敲击音簧发声\n🔔 两个音锤=两种音调\n⚡ 由齿条机构驱动',
            details: '<h3>调音</h3><p>音锤的重量和弹性、敲击力度、与音簧的接触角度都会影响音色。制表师需要用耳朵逐个调试。</p>'
        },
        {
            id: 'gong', label: '音簧 · Gong', side: 'right', external: false,
            explode: { x: -150, y: -100, r: -12 },
            svg: `<path d="M${CX + 140},${CY - 100} Q${CX + 165},${CY} ${CX + 140},${CY + 100}" class="sketch-stroke" stroke="${SEPIA}" fill="none"/>
                  <path d="M${CX + 130},${CY - 90} Q${CX + 155},${CY} ${CX + 130},${CY + 90}" class="sketch-thin" stroke="${SEPIA}" fill="none"/>`,
            title: '音簧 — TYMPANVM', desc: '围绕机芯内壁的钢丝弹簧，被敲击时会振动发声。高音簧和低音簧的长度和粗细不同，产生不同的音调。',
            demoNote: '🎵 围绕机芯内壁的钢线\n🔔 高音簧=细短 低音簧=粗长\n🎶 振动频率决定音高',
            details: '<h3>音色秘密</h3><p>顶级三问怀表（如百达翡丽）使用"教堂钟声"(Cathedral gong)——音簧绕机芯不止一圈,产生更深沉悠长的声音。</p>'
        },
    ];

    // =============================================
    // 3. RENDER WATCH SVG
    // =============================================
    const partGroups = {};

    function renderWatch() {
        parts.forEach((p, idx) => {
            const g = document.createElementNS(NS, 'g');
            g.setAttribute('id', 'part-' + p.id);
            g.setAttribute('class', `watch-part highlightable ${p.external ? 'visible-part' : 'hidden-part'}`);
            g.setAttribute('filter', 'url(#sketch)');
            g.innerHTML = p.svg;
            // Add label (hidden initially)
            const label = document.createElementNS(NS, 'text');
            label.setAttribute('class', 'part-label');
            label.setAttribute('text-anchor', 'middle');
            label.textContent = p.label;
            g.appendChild(label);
            svg.appendChild(g);
            partGroups[p.id] = { g, label, data: p };
        });
    }

    // =============================================
    // 4. EXPLODE / REASSEMBLE
    // =============================================
    function explodeWatch() {
        isExploded = true;
        document.getElementById('reassembleBtn').style.display = '';
        document.getElementById('watch-hint').style.display = 'none';

        parts.forEach((p, index) => {
            setTimeout(() => {
                const pg = partGroups[p.id];
                const { x, y, r } = p.explode;
                const scatterX = x + (Math.random() * 20 - 10);
                const scatterY = y + (Math.random() * 20 - 10);
                const scatterR = r + (Math.random() * 30 - 15);
                pg.g.style.transform = `translate(${scatterX}px, ${scatterY}px) rotate(${scatterR}deg)`;
                pg.g.classList.remove('hidden-part');
                pg.g.classList.add('visible-part');

                setTimeout(() => {
                    const bbox = pg.g.getBBox();
                    pg.label.setAttribute('x', String(bbox.x + bbox.width / 2));
                    pg.label.setAttribute('y', String(bbox.y + bbox.height + 12));
                    pg.label.classList.add('visible');
                }, 1200);
            }, index * 80);
        });
        updateStatus();
    }

    function reassembleWatch() {
        isExploded = false;
        document.getElementById('reassembleBtn').style.display = 'none';
        document.getElementById('watch-hint').style.display = '';

        parts.forEach((p, index) => {
            setTimeout(() => {
                const pg = partGroups[p.id];
                pg.g.style.transform = '';
                pg.label.classList.remove('visible');
                if (!p.external) {
                    setTimeout(() => pg.g.classList.add('hidden-part'), 1000);
                    setTimeout(() => pg.g.classList.remove('visible-part'), 1000);
                }
            }, (parts.length - index) * 60);
        });

        updateStatus();
    }

    // Double-click detection
    svg.addEventListener('click', () => {
        if (isExploded) return;
        clickCount++;
        if (clickCount === 1) {
            clickTimer = setTimeout(() => { clickCount = 0; }, 400);
        } else if (clickCount >= 2) {
            clearTimeout(clickTimer);
            clickCount = 0;
            explodeWatch();
        }
    });

    document.getElementById('reassembleBtn').addEventListener('click', reassembleWatch);

    // =============================================
    // 5. FEATURES + BUTTONS + HOVER + STATUS
    // =============================================
    const statusEls = {};
    const leftCol = document.getElementById('leftLabels');
    const rightCol = document.getElementById('rightLabels');
    const panel = document.getElementById('feature-panel');
    const allPartGs = () => svg.querySelectorAll('.watch-part');
    let activeBtn = null;

    parts.forEach(f => {
        const col = f.side === 'left' ? leftCol : rightCol;
        const btn = document.createElement('button');
        btn.className = 'feature-btn';
        const ar = f.side === 'left' ? '→' : '←';
        btn.innerHTML = `<span class="btn-dot"></span><span class="btn-label-wrap"><span class="btn-label-text">${f.label}</span><span class="btn-status" id="st-${f.id}">…</span></span><span class="btn-arrow">${ar}</span>`;
        setTimeout(() => { statusEls[f.id] = document.getElementById('st-' + f.id); updateStatus(); }, 100);

        btn.addEventListener('mouseenter', () => {
            allPartGs().forEach(g => g.classList.add('dimmed'));
            const el = document.getElementById('part-' + f.id);
            if (el) { el.classList.add('highlighted'); el.classList.remove('dimmed'); }
        });
        btn.addEventListener('mouseleave', () => {
            allPartGs().forEach(g => { g.classList.remove('dimmed'); });
            document.querySelectorAll('.highlighted').forEach(el => el.classList.remove('highlighted'));
        });
        btn.addEventListener('click', () => openPanel(f, btn));
        col.appendChild(btn);
    });

    // =============================================
    // 6. DEMO GENERATORS
    // =============================================
    function genericDemo(title, lines) {
        return `<svg viewBox="0 0 380 180"><text x="190" y="25" text-anchor="middle" fill="${INK}" font-size="13" font-weight="bold" font-family="'Cinzel',serif">${title}</text>${lines.map((l, i) => `<text x="190" y="${55 + i * 22}" text-anchor="middle" fill="${SEPIA}" font-size="11" font-family="'EB Garamond',serif">${l}</text>`).join('')}</svg>`;
    }

    function demoBow() { return genericDemo('表环 ANNVLVS', ['○ 金属环形结构', '穿过表链或丝带', '承载整表重量', '18K金精细抛光']); }
    function demoCrown() { return `<svg viewBox="0 0 300 200"><rect x="125" y="40" width="50" height="60" rx="8" fill="rgba(180,134,11,0.1)" stroke="${INK}" stroke-width="1.5"/>${[0, 1, 2, 3].map(i => `<line x1="${135 + i * 12}" y1="50" x2="${135 + i * 12}" y2="90" stroke="${INK}" stroke-width="0.8"/>`).join('')}<text x="150" y="130" text-anchor="middle" fill="${SEPIA}" font-size="11" font-family="'EB Garamond',serif">旋转上弦 · 拉出调时</text><path d="M150,100 L150,110" stroke="${GOLD}" stroke-width="1.5"><animate attributeName="d" values="M150,100 L150,110;M150,95 L150,115;M150,100 L150,110" dur="1.5s" repeatCount="indefinite"/></path><animateTransform xlink:href="#crown-demo" attributeName="transform" type="rotate" from="0 150 70" to="360 150 70" dur="3s" repeatCount="indefinite"/></svg>`; }
    function demoCase() { return `<svg viewBox="0 0 300 250"><circle cx="150" cy="125" r="100" fill="rgba(180,134,11,0.05)" stroke="${INK}" stroke-width="2"/><circle cx="150" cy="125" r="95" fill="none" stroke="${INK}" stroke-width="0.5"/><text x="150" y="125" text-anchor="middle" fill="${SEPIA}" font-size="11">共鸣腔体</text><text x="150" y="145" text-anchor="middle" fill="${SEPIA}" font-size="10">壳壁厚度=音色关键</text><circle cx="150" cy="125" r="90" fill="none" stroke="${GOLD}" stroke-width="0.5" stroke-dasharray="3 3"><animateTransform attributeName="transform" type="rotate" from="0 150 125" to="360 150 125" dur="8s" repeatCount="indefinite"/></circle></svg>`; }
    function demoCaseBack() { return genericDemo('底盖 OPERCVLVM', ['打开可观赏精美机芯', '手工雕刻装饰', '猎壳式/开面式', '常刻有制表师签名']); }
    function demoBezel() { return genericDemo('表圈 CIRCVLVS', ['固定表镜的精密环框', '圆度误差 < 0.01mm', '螺纹/铰链连接', '有时镶嵌钻石']); }
    function demoCrystal() { return genericDemo('表镜 SPECVLVM', ['蓝宝石水晶 莫氏硬度9', '双面防反射涂层', '仅次于钻石的硬度', '保护表盘和指针']); }
    function demoDial() { return `<svg viewBox="0 0 300 250"><circle cx="150" cy="125" r="90" fill="rgba(244,228,193,0.2)" stroke="${INK}" stroke-width="1"/>${['XII', 'III', 'VI', 'IX'].map((n, i) => { const a = i * Math.PI / 2 - Math.PI / 2; return `<text x="${150 + 70 * Math.cos(a)}" y="${130 + 70 * Math.sin(a)}" text-anchor="middle" fill="${INK}" font-size="14" font-family="'EB Garamond',serif">${n}</text>`; }).join('')}<text x="150" y="230" text-anchor="middle" fill="${SEPIA}" font-size="10">大明火珐琅 · 800°C烧制</text></svg>`; }
    function demoHourHand() { return `<svg viewBox="0 0 300 200"><line x1="150" y1="150" x2="150" y2="50" stroke="${INK}" stroke-width="3" stroke-linecap="round"><animateTransform attributeName="transform" type="rotate" from="0 150 150" to="360 150 150" dur="6s" repeatCount="indefinite"/></line><circle cx="150" cy="150" r="5" fill="${INK}"/><text x="150" y="185" text-anchor="middle" fill="${SEPIA}" font-size="11">12小时转一圈 · 蓝钢工艺</text></svg>`; }
    function demoMinHand() { return `<svg viewBox="0 0 300 200"><line x1="150" y1="150" x2="150" y2="30" stroke="${INK}" stroke-width="1.8" stroke-linecap="round"><animateTransform attributeName="transform" type="rotate" from="0 150 150" to="360 150 150" dur="3s" repeatCount="indefinite"/></line><circle cx="150" cy="150" r="4" fill="${INK}"/><text x="150" y="185" text-anchor="middle" fill="${SEPIA}" font-size="11">60分钟转一圈 · 精确配重</text></svg>`; }
    function demoSecondHand() { return `<svg viewBox="0 0 300 200"><line x1="150" y1="160" x2="150" y2="25" stroke="${INK}" stroke-width="1"><animateTransform attributeName="transform" type="rotate" from="0 150 150" to="360 150 150" dur="1.5s" repeatCount="indefinite"/></line><circle cx="150" cy="150" r="3" fill="${INK}"/><text x="150" y="185" text-anchor="middle" fill="${SEPIA}" font-size="11">最长最细 · 秒级走动</text></svg>`; }
    function demoSlide() { return `<svg viewBox="0 0 350 200"><rect x="30" y="30" width="15" height="120" rx="5" fill="rgba(112,66,20,0.15)" stroke="${SEPIA}" stroke-width="1.5"/><circle cx="37" cy="50" r="6" fill="${SEPIA}" opacity="0.3" stroke="${SEPIA}" stroke-width="1"><animate attributeName="cy" values="50;130;50" dur="3s" repeatCount="indefinite"/></circle><text x="80" y="60" fill="${SEPIA}" font-size="10">↓ 拨下=启动报时</text><text x="80" y="80" fill="${SEPIA}" font-size="10">🔔 低音×时 + 双音×刻 + 高音×分</text><text x="80" y="110" fill="${SEPIA}" font-size="10">例: 10:37</text><text x="80" y="130" fill="${GOLD}" font-size="10">当×10 + 叮当×2 + 叮×7</text></svg>`; }
    function demoMainspring() { return `<svg viewBox="0 0 300 200"><path d="${spiralPath(150, 100, 8, 60, 4)}" fill="none" stroke="${INK}" stroke-width="1.2"><animateTransform attributeName="transform" type="rotate" from="0 150 100" to="360 150 100" dur="5s" repeatCount="indefinite"/></path><text x="150" y="180" text-anchor="middle" fill="${SEPIA}" font-size="10">盘绕弹簧钢带 · 动力之源</text></svg>`; }
    function demoBarrel() { return `<svg viewBox="0 0 300 200"><circle cx="150" cy="95" r="55" fill="rgba(180,134,11,0.08)" stroke="${INK}" stroke-width="1.5"/><path d="${gearPath(150, 95, 55, 24, 6)}" fill="none" stroke="${INK}" stroke-width="0.6"><animateTransform attributeName="transform" type="rotate" from="0 150 95" to="360 150 95" dur="8s" repeatCount="indefinite"/></path><circle cx="150" cy="95" r="6" stroke="${INK}" stroke-width="1" fill="none"/><text x="150" y="175" text-anchor="middle" fill="${SEPIA}" font-size="10">发条盒=动力输出齿轮</text></svg>`; }
    function demoCenterWhl() { return `<svg viewBox="0 0 300 200"><path d="${gearPath(150, 95, 40, 16)}" fill="rgba(180,134,11,0.05)" stroke="${INK}" stroke-width="1"><animateTransform attributeName="transform" type="rotate" from="0 150 95" to="360 150 95" dur="4s" repeatCount="indefinite"/></path><circle cx="150" cy="95" r="5" fill="${INK}" opacity="0.3"/><text x="150" y="170" text-anchor="middle" fill="${SEPIA}" font-size="10">60min/圈 · 驱动分针</text></svg>`; }
    function demoThirdWhl() { return genericDemo('三轮 ROTA TERTIA', ['传动链中间环节', '中心轮→三轮→四轮', '变速比传递动力', '轴上有小齿轮(pinion)']); }
    function demoFourthWhl() { return genericDemo('四轮/秒轮', ['每60秒转一圈', '驱动秒针(若有)', '连接到擒纵轮', '也叫seconds wheel']); }
    function demoEscapeWhl() { return `<svg viewBox="0 0 300 200"><path d="${gearPath(150, 90, 35, 20, 8)}" fill="none" stroke="${INK}" stroke-width="1"><animateTransform attributeName="transform" type="rotate" from="0 150 90" to="20 150 90" dur="0.5s" repeatCount="indefinite" calcMode="discrete" values="0 150 90;20 150 90;0 150 90"/></path><text x="150" y="160" text-anchor="middle" fill="${SEPIA}" font-size="10">擒纵轮 · 滴答声的来源</text><text x="150" y="178" text-anchor="middle" fill="${GOLD}" font-size="10">⚡ 连续动力→离散脉冲</text></svg>`; }
    function demoPalletFork() { return `<svg viewBox="0 0 300 200"><path d="M100,100 L150,70 L200,100" fill="none" stroke="${INK}" stroke-width="2.5" stroke-linecap="round"><animateTransform attributeName="transform" type="rotate" values="-8 150 100;8 150 100;-8 150 100" dur="1s" repeatCount="indefinite"/></path><rect x="95" y="95" width="12" height="8" rx="1" fill="rgba(200,0,0,0.3)" stroke="darkred" stroke-width="0.5"/><rect x="193" y="95" width="12" height="8" rx="1" fill="rgba(200,0,0,0.3)" stroke="darkred" stroke-width="0.5"/><text x="150" y="150" text-anchor="middle" fill="${SEPIA}" font-size="10">擒纵叉 · 红宝石叉瓦</text><text x="150" y="168" text-anchor="middle" fill="${SEPIA}" font-size="9">左右摆动控制节奏</text></svg>`; }
    function demoBalance() { return `<svg viewBox="0 0 300 200"><circle cx="150" cy="90" r="45" fill="none" stroke="${INK}" stroke-width="1.5"><animateTransform attributeName="transform" type="rotate" values="-30 150 90;30 150 90;-30 150 90" dur="0.8s" repeatCount="indefinite"/></circle><path d="${spiralPath(150, 90, 5, 30, 3)}" fill="none" stroke="${INK}" stroke-width="0.6"><animateTransform attributeName="transform" type="rotate" values="-30 150 90;30 150 90;-30 150 90" dur="0.8s" repeatCount="indefinite"/></path><circle cx="150" cy="90" r="4" fill="${INK}" opacity="0.3"/><text x="150" y="160" text-anchor="middle" fill="${SEPIA}" font-size="10">💓 机芯的心脏</text><text x="150" y="178" text-anchor="middle" fill="${GOLD}" font-size="10">每秒摆动3-5次</text></svg>`; }
    function demoHammer() { return `<svg viewBox="0 0 300 200"><line x1="80" y1="140" x2="150" y2="60" stroke="${SEPIA}" stroke-width="2.5"><animateTransform attributeName="transform" type="rotate" values="0 80 140;-20 80 140;0 80 140" dur="1s" repeatCount="indefinite"/></line><circle cx="150" cy="60" r="8" fill="${SEPIA}" opacity="0.25" stroke="${SEPIA}" stroke-width="1"><animateMotion dur="1s" repeatCount="indefinite" path="M0,0 L-10,-10 L0,0"/></circle><path d="M200,55 Q230,90 200,130" fill="none" stroke="${GOLD}" stroke-width="1.5"/><text x="150" y="175" text-anchor="middle" fill="${SEPIA}" font-size="10">音锤敲击音簧 🔔</text></svg>`; }
    function demoGong() { return `<svg viewBox="0 0 350 200"><path d="M80,40 Q200,30 280,120 Q200,190 80,160" fill="none" stroke="${SEPIA}" stroke-width="2"><animate attributeName="stroke-width" values="2;3;2" dur="1s" repeatCount="indefinite"/></path><path d="M90,50 Q200,40 270,120 Q200,180 90,150" fill="none" stroke="${SEPIA}" stroke-width="1" stroke-dasharray="3 3"/><text x="175" y="110" text-anchor="middle" fill="${GOLD}" font-size="11">🎵 振动发声</text><text x="175" y="130" text-anchor="middle" fill="${SEPIA}" font-size="10">高音簧(细) + 低音簧(粗)</text></svg>`; }

    const demoFns = [demoBow, demoCrown, demoCase, demoCaseBack, demoBezel, demoCrystal, demoDial, demoHourHand, demoMinHand, demoSecondHand, demoSlide, demoMainspring, demoBarrel, demoCenterWhl, demoThirdWhl, demoFourthWhl, demoEscapeWhl, demoPalletFork, demoBalance, demoHammer, demoGong];

    // =============================================
    // 7. PANEL
    // =============================================
    function openPanel(f, btn) {
        if (activeBtn) activeBtn.classList.remove('active');
        btn.classList.add('active'); activeBtn = btn;
        document.getElementById('featureTitle').textContent = f.title;
        document.getElementById('featureDesc').textContent = f.desc;
        const idx = parts.indexOf(f);
        document.getElementById('featureDemo').innerHTML = demoFns[idx] ? demoFns[idx]() : '';
        document.getElementById('featureDemoNote').textContent = f.demoNote;
        document.getElementById('featureDetails').innerHTML = f.details;
        panel.classList.add('open');
    }

    function closePanel() {
        panel.classList.remove('open');
        if (activeBtn) { activeBtn.classList.remove('active'); activeBtn = null; }
    }

    const closeBtn = document.getElementById('closePanel');
    if (closeBtn) closeBtn.addEventListener('click', closePanel);
    document.addEventListener('keydown', e => { if (e.key === 'Escape') closePanel(); });

    // =============================================
    // 8. REAL-TIME STATUS & CLOCK
    // =============================================
    function updateStatus() {
        parts.forEach(p => {
            const el = statusEls[p.id];
            if (!el) return;
            if (isExploded) {
                el.textContent = p.external ? '已拆解·外部' : '已拆解·内部';
            } else {
                el.textContent = p.external ? '已装配·可见' : '已装配·隐藏';
            }
        });
    }

    function updateClock() {
        const now = new Date();
        const hr = now.getHours();
        const min = now.getMinutes();
        const sec = now.getSeconds();
        const ms = now.getMilliseconds();

        const secDeg = (sec + ms / 1000) * 6;
        const minDeg = (min + sec / 60) * 6;
        const hrDeg = (hr % 12 + min / 60) * 30;

        const hrEl = document.getElementById('time-hour');
        const minEl = document.getElementById('time-min');
        const secEl = document.getElementById('time-sec');

        if (hrEl) hrEl.setAttribute('transform', `rotate(${hrDeg} ${CX} ${CY})`);
        if (minEl) minEl.setAttribute('transform', `rotate(${minDeg} ${CX} ${CY})`);
        if (secEl) secEl.setAttribute('transform', `rotate(${secDeg} ${CX} ${CY})`);

        requestAnimationFrame(updateClock);
    }

    // =============================================
    // 9. QUILL WRITING ANIMATION
    // =============================================
    function animateQuill() {
        const leftPane = document.getElementById('parchmentLeft');
        if (!leftPane) return;
        const pen = document.getElementById('quill-pen');
        const svgEl = document.getElementById('quill-svg');
        const titles = document.querySelectorAll('.quill-title');
        const ornaments = document.querySelectorAll('.quill-ornament');
        const lines = document.querySelectorAll('.quill-line');
        const dates = document.querySelectorAll('.quill-date');

        const allEls = [...titles, ...Array.from(ornaments).slice(0, 1), ...lines, ...Array.from(ornaments).slice(1), ...dates, ...Array.from(ornaments).slice(2)];
        let delay = 5500;
        const paneRect = leftPane.getBoundingClientRect();

        setTimeout(() => { pen.style.opacity = '0.8'; }, delay);

        allEls.forEach((el, i) => {
            const startDelay = delay + i * 1600;
            setTimeout(() => {
                el.classList.add('writing-active');
                const bbox = el.getBBox();
                const svgRect = svgEl.getBoundingClientRect();
                const scaleX = svgRect.width / 280;
                const scaleY = svgRect.height / 780;

                const startX = bbox.x * scaleX - 10;
                const endX = (bbox.x + bbox.width) * scaleX + 10;
                const y = bbox.y * scaleY + svgRect.top - paneRect.top - 30;

                pen.animate([
                    { left: startX + 'px', top: y + 'px', transform: 'rotate(0deg)' },
                    { left: startX + (endX - startX) * 0.3 + 'px', top: (y - 5) + 'px', transform: 'rotate(-5deg)' },
                    { left: startX + (endX - startX) * 0.6 + 'px', top: (y + 5) + 'px', transform: 'rotate(5deg)' },
                    { left: endX + 'px', top: y + 'px', transform: 'rotate(0deg)' }
                ], {
                    duration: 1500,
                    easing: 'linear',
                    fill: 'forwards'
                });
            }, startDelay);
        });

        setTimeout(() => {
            pen.style.transition = 'opacity 1s ease';
            pen.style.opacity = '0';
        }, delay + allEls.length * 1600 + 500);
    }

    // =============================================
    // INIT
    // =============================================
    renderWatch();
    updateStatus();
    animateQuill();
    updateClock();
});
