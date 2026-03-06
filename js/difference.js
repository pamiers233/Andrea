/**
 * 差分机 — Babbage Difference Engine Simulator
 * Full polynomial computation via method of differences,
 * SVG digit wheels, carry animation, hover highlights, demos.
 */
document.addEventListener('DOMContentLoaded', () => {

    const NS = 'http://www.w3.org/2000/svg';
    const INK = '#5a4a3a';
    const BRASS = '#b8860b';
    const GOLD = '#ffd700';
    const svg = document.getElementById('engine-svg');
    const COLS = 7; // result + 6 differences
    const DIGITS = 8; // digits per column

    setTimeout(() => { const e = document.getElementById('entrance-overlay'); if (e) e.style.display = 'none'; }, 6500);

    // =============================================
    // 1. POLYNOMIAL PRESETS
    // =============================================
    const polynomials = [
        { name: 'x²', fn: x => x * x, order: 2 },
        { name: 'x³', fn: x => x * x * x, order: 3 },
        { name: 'x²+x+41', fn: x => x * x + x + 41, order: 2 },
        { name: '2x³-3x²+x+5', fn: x => 2 * x * x * x - 3 * x * x + x + 5, order: 3 },
        { name: 'n(n+1)/2', fn: x => x * (x + 1) / 2, order: 2 },
    ];
    let currentPoly = 0;
    let step = 0;
    let columns = [];  // columns[col][digit] values

    // =============================================
    // 2. DIFFERENCE ENGINE CORE
    // =============================================
    function computeInitialDifferences(fn, order) {
        // Compute first (order+1) values
        const vals = [];
        for (let i = 0; i <= order + 2; i++) vals.push(fn(i));
        // Build difference table
        const table = [vals.slice()];
        for (let d = 1; d <= order; d++) {
            const prev = table[d - 1];
            const diff = [];
            for (let i = 0; i < prev.length - 1; i++) diff.push(prev[i + 1] - prev[i]);
            table.push(diff);
        }
        return table;
    }

    function initEngine() {
        const poly = polynomials[currentPoly];
        const table = computeInitialDifferences(poly.fn, poly.order);
        step = 0;
        columns = [];
        // Column 0 = result (fn(0)), columns 1..order = differences
        columns[0] = numberToDigits(table[0][0]);
        for (let d = 1; d < COLS; d++) {
            columns[d] = numberToDigits(d < table.length ? table[d][0] : 0);
        }
        updateAllWheels();
        document.getElementById('step-display').textContent = String(step);
    }

    function numberToDigits(n) {
        const digits = new Array(DIGITS).fill(0);
        let val = Math.abs(Math.round(n));
        for (let i = 0; i < DIGITS; i++) {
            digits[i] = val % 10;
            val = Math.floor(val / 10);
        }
        return digits;
    }

    function digitsToNumber(digits) {
        let n = 0;
        for (let i = DIGITS - 1; i >= 0; i--) n = n * 10 + digits[i];
        return n;
    }

    function addColumns(target, source) {
        let carry = 0;
        const carries = [];
        for (let i = 0; i < DIGITS; i++) {
            const sum = target[i] + source[i] + carry;
            target[i] = sum % 10;
            carry = Math.floor(sum / 10);
            if (carry > 0) carries.push(i);
        }
        return carries;
    }

    function runOneStep() {
        const poly = polynomials[currentPoly];
        const allCarries = [];
        // Add from highest difference down to result
        // Δ(n-1) += Δ(n), ..., Δ1 += Δ2, R += Δ1
        for (let d = Math.min(poly.order, COLS - 1); d >= 1; d--) {
            const carries = addColumns(columns[d - 1], columns[d]);
            allCarries.push({ from: d, to: d - 1, carries });
        }
        step++;
        // Animate
        animateStep(allCarries);
        updateAllWheels();
        document.getElementById('step-display').textContent = String(step);
        updateStatus();
    }

    // =============================================
    // 3. SVG DIGIT WHEELS
    // =============================================
    const colIds = ['result-wheels', 'd1-wheels', 'd2-wheels', 'd3-wheels', 'd4-wheels', 'd5-wheels', 'd6-wheels'];
    const colX = [90, 170, 250, 330, 410, 490, 570];
    const wheelEls = []; // wheelEls[col][digit] = {rect, text}

    function createWheels() {
        for (let c = 0; c < COLS; c++) {
            const g = document.getElementById(colIds[c]);
            if (!g) continue;
            wheelEls[c] = [];
            for (let d = 0; d < DIGITS; d++) {
                const y = 70 + d * 47;
                const wg = document.createElementNS(NS, 'g');
                wg.setAttribute('class', 'digit-wheel');
                const r = document.createElementNS(NS, 'rect');
                r.setAttribute('x', String(colX[c] - 28));
                r.setAttribute('y', String(y));
                r.setAttribute('width', '56');
                r.setAttribute('height', '38');
                r.setAttribute('rx', '4');
                r.setAttribute('fill', 'rgba(180,134,11,0.08)');
                r.setAttribute('stroke', INK);
                r.setAttribute('stroke-width', '0.8');
                const t = document.createElementNS(NS, 'text');
                t.setAttribute('x', String(colX[c]));
                t.setAttribute('y', String(y + 26));
                t.setAttribute('text-anchor', 'middle');
                t.setAttribute('fill', INK);
                t.textContent = '0';
                wg.appendChild(r);
                wg.appendChild(t);
                g.appendChild(wg);
                wheelEls[c][d] = { g: wg, rect: r, text: t };
            }
        }
    }

    function updateAllWheels() {
        for (let c = 0; c < COLS; c++) {
            if (!wheelEls[c]) continue;
            for (let d = 0; d < DIGITS; d++) {
                if (!wheelEls[c][d]) continue;
                const val = columns[c] ? columns[c][d] : 0;
                wheelEls[c][d].text.textContent = String(val);
            }
        }
    }

    // =============================================
    // 4. CARRY ARROWS
    // =============================================
    const carryGroup = document.getElementById('carry-indicators');
    const carryArrows = [];
    function createCarryArrows() {
        // Create shared marker definition once
        const markerDefs = document.createElementNS(NS, 'defs');
        markerDefs.innerHTML = `<marker id="carry-arr" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto"><path d="M0,0 L8,3 L0,6" fill="${GOLD}"/></marker>`;
        carryGroup.appendChild(markerDefs);

        for (let c = 1; c < COLS; c++) {
            const x1 = colX[c], x2 = colX[c - 1];
            const y = 90 + 3 * 47;
            const arrow = document.createElementNS(NS, 'g');
            arrow.setAttribute('class', 'carry-arrow');
            const line = document.createElementNS(NS, 'line');
            line.setAttribute('x1', String(x1 - 30));
            line.setAttribute('y1', String(y));
            line.setAttribute('x2', String(x2 + 30));
            line.setAttribute('y2', String(y));
            line.setAttribute('stroke', GOLD);
            line.setAttribute('stroke-width', '2');
            line.setAttribute('marker-end', 'url(#carry-arr)');
            arrow.appendChild(line);
            const label = document.createElementNS(NS, 'text');
            label.setAttribute('x', String((x1 + x2) / 2));
            label.setAttribute('y', String(y - 8));
            label.setAttribute('text-anchor', 'middle');
            label.setAttribute('fill', GOLD);
            label.setAttribute('font-size', '8');
            label.setAttribute('font-family', "'Source Code Pro', monospace");
            label.textContent = '+ ADD';
            arrow.appendChild(label);
            carryGroup.appendChild(arrow);
            carryArrows.push(arrow);
        }
    }

    // =============================================
    // 5. ANIMATION
    // =============================================
    function animateStep(allCarries) {
        // Crank turn
        const crankG = document.getElementById('hl-crank');
        crankG.classList.add('crank-spinning');
        setTimeout(() => crankG.classList.remove('crank-spinning'), 1100);

        // Spin affected wheels
        allCarries.forEach((info, idx) => {
            setTimeout(() => {
                // Flash carry arrow
                if (carryArrows[info.from - 1]) {
                    carryArrows[info.from - 1].classList.add('active');
                    setTimeout(() => carryArrows[info.from - 1].classList.remove('active'), 800);
                }
                // Spin wheels in target column
                if (wheelEls[info.to]) {
                    for (let d = 0; d < DIGITS; d++) {
                        wheelEls[info.to][d].g.classList.add('spinning');
                        setTimeout(() => wheelEls[info.to][d].g.classList.remove('spinning'), 600);
                    }
                }
            }, idx * 300);
        });
    }

    // =============================================
    // 6. CONTROLS
    // =============================================
    document.getElementById('runBtn').addEventListener('click', runOneStep);
    document.getElementById('resetBtn').addEventListener('click', () => {
        currentPoly = parseInt(document.getElementById('polySelect').value);
        initEngine();
        updateStatus();
    });
    document.getElementById('polySelect').addEventListener('change', (e) => {
        currentPoly = parseInt(e.target.value);
        initEngine();
        updateStatus();
    });

    // =============================================
    // 7. FEATURES
    // =============================================
    const statusEls = {};

    const features = [
        // LEFT (8)
        {
            side: 'left', label: '结果列 · Result', hlIds: ['hl-result-col'], statusKey: 'result',
            title: '结果列 — TABVLA RESOLVTVM',
            desc: '最左边的一列数字轮，存储当前计算的结果。每转一次曲柄，第一差分列(Δ¹)的值会加到结果列上，产生多项式的下一个值。这就是差分机的最终输出！',
            demoNote: '📊 结果列 = 多项式的输出值\n⚙️ 每转一次曲柄：R = R + Δ¹\n📈 x² 的结果序列：0, 1, 4, 9, 16, 25...',
            demo: demoResult, details: '<h3>工作原理</h3><p>每一步，Δ¹的值被加到R上。如果计算x²：</p><ul><li>步骤0: R=0</li><li>步骤1: R=0+1=1</li><li>步骤2: R=1+3=4</li><li>步骤3: R=4+5=9</li></ul>'
        },

        {
            side: 'left', label: '一阶差分 · Δ¹', hlIds: ['hl-d1-col'], statusKey: 'd1',
            title: '一阶差分列 — Δ¹',
            desc: '存储相邻两个结果之间的"差"。每一步，Δ²的值会加到Δ¹上，然后Δ¹加到结果上。对于二次函数(如x²)，一阶差分是一个递增序列(1,3,5,7,9...)。',
            demoNote: '🔢 Δ¹ = f(x+1) - f(x) 的值\n⚙️ 每步：Δ¹ = Δ¹ + Δ²\n📊 x² 的一阶差分：1, 3, 5, 7, 9...',
            demo: demoD1, details: '<h3>例子(x²)</h3><p>0→1差=1, 1→4差=3, 4→9差=5, 9→16差=7...</p><p>可以看到一阶差分本身也在变化！它每次增加2（这就是二阶差分）。</p>'
        },

        {
            side: 'left', label: '二阶差分 · Δ²', hlIds: ['hl-d2-col'], statusKey: 'd2',
            title: '二阶差分列 — Δ²',
            desc: '存储一阶差分之间的"差的差"。对于二次函数(如x²)，二阶差分是常数(=2)！这就是差分法的精髓——不管多复杂的多项式，最高阶差分总是常数。',
            demoNote: '🔢 Δ² = Δ¹的变化量\n✨ 对x²来说 Δ² = 2 (永远不变！)\n🎯 常数差分 = 差分机能精确计算的关键',
            demo: demoD2, details: '<h3>为什么是常数？</h3><p>n阶多项式的第n阶差分永远是常数。这是数学定理！</p><ul><li>x² → Δ²=2 (常数)</li><li>x³ → Δ³=6 (常数)</li><li>2x³ → Δ³=12 (常数)</li></ul>'
        },

        {
            side: 'left', label: '高阶差分 · Δ³⁻⁶', hlIds: ['hl-d3-col', 'hl-d4-col', 'hl-d5-col', 'hl-d6-col'], statusKey: 'd36',
            title: '高阶差分列 — Δ³ ~ Δ⁶',
            desc: '差分机No.2有7列(结果+6阶差分)，可以计算最高6次的多项式。对于x²只用到Δ²，x³用到Δ³，依此类推。多余的列保持为0。',
            demoNote: '📐 最多6阶差分 = 最多6次多项式\n🔢 x² → 只用Δ¹Δ² (Δ³以后全0)\n🔢 x³ → 用Δ¹Δ²Δ³ (Δ⁴以后全0)\n🏗️ 巴贝奇设计了31位精度！',
            demo: demoHighOrder, details: '<h3>差分机No.2规格</h3><ul><li>7列(1结果+6差分)</li><li>每列31位十进制数字</li><li>重约5吨，25000个零件</li><li>我们的模拟：8位数字</li></ul>'
        },

        {
            side: 'left', label: '进位机构 · Carry', hlIds: ['hl-carry'], statusKey: 'carry',
            title: '进位机构 — MECHANISMVS TRANSLATIONIS',
            desc: '当两个数字相加超过9时，需要向高位"进1"。差分机用精密的齿轮机构实现这个功能。进位必须像多米诺一样逐级传播，这是整个机器最复杂的部分！',
            demoNote: '⚙️ 7+5=12 → 个位=2，向十位进1\n🔗 进位可以连锁：99+1=100(两次进位)\n⚡ 运行时金色箭头闪烁=正在进位',
            demo: demoCarry, details: '<h3>连锁进位问题</h3><p>99999+1会产生5次连锁进位。巴贝奇设计了"预判进位"机构来加速这个过程，类似现代CPU的进位前瞻加法器(CLA)！</p>'
        },

        {
            side: 'left', label: '数字轮 · Wheels', hlIds: ['hl-result-col', 'hl-d1-col'], statusKey: 'wheels',
            title: '数字轮 — ROTAE FIGVRARVM',
            desc: '每个方格代表一个"数字轮"——一个有0-9十个位置的黄铜齿轮。通过旋转齿轮来改变显示的数字。每列有8个轮(=8位数字)，从下到上依次是个位、十位、百位...',
            demoNote: '🔢 每个轮有0-9共10个位置\n⬆ 从下往上：个→十→百→千...\n⚙️ 加法=转动齿轮(加3=转3格)\n🟡 运行时变黄的轮=正在被修改',
            demo: demoWheels, details: '<h3>精度</h3><p>差分机No.2每列31个轮=31位十进制精度。在1840年代，这达到甚至超过了手工计算表的精度，而且没有人为错误。</p>'
        },

        {
            side: 'left', label: '打印机构 · Print', hlIds: ['hl-print'], statusKey: 'print',
            title: '打印机构 — IMPRESSIO',
            desc: '差分机不仅计算——它还能直接把结果打印出来！左侧的打印装置会把结果列的值压印到铅版或纸上，彻底消除人工抄写错误。',
            demoNote: '🖨️ 左侧金色小条 = 打印头\n📜 把结果直接压印到铅版上\n✅ 消除抄写错误 = 巴贝奇发明差分机的主要动机',
            demo: demoPrint, details: '<h3>历史背景</h3><p>19世纪的数学表(对数表、天文表)全靠手工计算+手工抄写，错误率极高。巴贝奇说："I wish to God these calculations had been executed by steam!"——这就是差分机的起源。</p>'
        },

        {
            side: 'left', label: '差分法 · Method', hlIds: ['hl-result-col', 'hl-d1-col', 'hl-d2-col'], statusKey: 'method',
            title: '差分法 — METHODVS DIFFERENTIARVM',
            desc: '差分法的核心思想：任何n次多项式，经过n次差分后变成常数。所以只需要初始值+重复做加法就能计算整个多项式表！不需要乘法或除法！',
            demoNote: '🧮 差分法把乘法变成加法！\n📐 f(x)=x² → 只需要做加法就能算出0,1,4,9,16...\n💡 这就是巴贝奇的天才之处',
            demo: demoMethod, details: '<h3>步骤</h3><ol><li>计算初始几个值的差分表</li><li>设定各列初始值</li><li>反复执行：Δⁿ⁻¹+=Δⁿ, ..., Δ¹+=Δ², R+=Δ¹</li><li>每步得到多项式的下一个值</li></ol>'
        },

        // RIGHT (8)
        {
            side: 'right', label: '驱动曲柄 · Crank', hlIds: ['hl-crank'], statusKey: 'crank',
            title: '驱动曲柄 — MANVBRIVM',
            desc: '右侧的大圆+把手=驱动曲柄。转一圈=计算一步。在真正的差分机上，这是一个需要人力或蒸汽动力来转动的大曲柄。',
            demoNote: '🔄 转一圈曲柄 = 计算一步\n⚙️ 真机上这个曲柄重达几公斤\n💪 巴贝奇梦想用蒸汽机来驱动\n🟡 点"运行一步"时曲柄会旋转',
            demo: demoCrank, details: '<h3>蒸汽驱动</h3><p>巴贝奇设想用蒸汽机来转动曲柄，这样机器就能自动连续计算。这是"计算机"(computer)这个词最初的含义——一台计算的机器。</p>'
        },

        {
            side: 'right', label: '主轴 · Main Shaft', hlIds: ['hl-shaft'], statusKey: 'shaft',
            title: '主轴 — AXIS PRINCIPALES',
            desc: '底部的水平金属轴连接所有列。当曲柄转动时，主轴带动所有齿轮同步运作，确保加法和进位按正确的顺序执行。',
            demoNote: '━━ 水平金属条 = 主轴\n🔗 连接所有列，保证同步\n⚙️ 像汽车的传动轴一样',
            demo: demoShaft, details: '<h3>同步问题</h3><p>差分机最大的工程挑战是让所有齿轮精确同步。一个齿轮的误差会传播到所有列，导致计算错误。</p>'
        },

        {
            side: 'right', label: '机架 · Frame', hlIds: ['hl-frame'], statusKey: 'frame',
            title: '机架 — STRVCTVRA',
            desc: '外部的铸铁框架支撑整个机器。差分机No.2的实际尺寸约2.1米长×0.7米宽×1.1米高，重约5吨。',
            demoNote: '🏗️ 铸铁框架 = 支撑结构\n📏 实际尺寸：2.1m × 0.7m × 1.1m\n⚖️ 重量：约5吨！\n🔩 25,000个独立零件',
            demo: demoFrame, details: '<h3>建造历史</h3><ul><li>1847年：巴贝奇完成设计</li><li>1849-1853年：设计图完善</li><li>1991年：伦敦科学博物馆首次建成！</li><li>证明：19世纪的技术完全可以制造差分机</li></ul>'
        },

        {
            side: 'right', label: '计算步骤 · Cycle', hlIds: ['hl-cycle'], statusKey: 'cycle',
            title: '计算循环 — CIRCVLVS COMPVTANDI',
            desc: '右下角的数字显示当前是第几步计算。步骤0=初始值，步骤1=f(1)，步骤2=f(2)...每一步的计算顺序是：从最高阶差分开始，逐级向左加。',
            demoNote: '🔢 步骤数 = 已计算了几个值\n📊 步骤N → 结果列显示f(N)\n🔄 每步：Δ⁵→Δ⁴→Δ³→Δ²→Δ¹→R',
            demo: demoCycle, details: '<h3>计算顺序(每步内)</h3><ol><li>Δ⁵ += Δ⁶</li><li>Δ⁴ += Δ⁵</li><li>Δ³ += Δ⁴</li><li>Δ² += Δ³</li><li>Δ¹ += Δ²</li><li>R += Δ¹</li></ol><p>从右到左，逐级传播。</p>'
        },

        {
            side: 'right', label: '多项式 · Polynomial', hlIds: ['hl-result-col', 'hl-d2-col'], statusKey: 'poly',
            title: '多项式函数',
            desc: '差分机可以计算任何多项式函数。选择下拉菜单中的不同多项式来观察差分机如何计算它们。多项式的阶数决定了需要多少列差分。',
            demoNote: '📐 x² = 二阶 → 需要Δ¹和Δ²\n📐 x³ = 三阶 → 需要Δ¹、Δ²和Δ³\n📐 最高6阶多项式\n🎯 选择下拉菜单切换多项式！',
            demo: demoPoly, details: '<h3>可计算的函数</h3><p>差分机直接计算多项式。但通过泰勒展开，它还能近似计算：</p><ul><li>对数 log(x)</li><li>三角函数 sin(x), cos(x)</li><li>指数 eˣ</li></ul><p>只要能展开成多项式的，差分机都能算！</p>'
        },

        {
            side: 'right', label: '巴贝奇 · Babbage', hlIds: ['hl-frame'], statusKey: 'babbage',
            title: '查尔斯·巴贝奇 — 计算机之父',
            desc: 'Charles Babbage (1791-1871)，英国数学家、哲学家、发明家。他构想了差分机和分析机，被誉为"计算机之父"。差分机No.1在他有生之年未能完成，No.2的设计直到1991年才被首次建造。',
            demoNote: '👤 Charles Babbage 1791-1871\n🇬🇧 英国剑桥大学卢卡斯教授\n💡 构想了世界上第一台通用计算机（分析机）\n🏛️ 差分机No.2现存于伦敦科学博物馆',
            demo: demoBabbage, details: '<h3>名言</h3><p>"On two occasions I have been asked, \x27If you put into the machine wrong figures, will the right answers come out?\x27 I am not able rightly to apprehend the kind of confusion of ideas that could provoke such a question."</p><p>——这是世界上最早的GIGO(垃圾进垃圾出)概念！</p>'
        },

        {
            side: 'right', label: '对数表 · Tables', hlIds: ['hl-print', 'hl-result-col'], statusKey: 'tables',
            title: '数学表 — 差分机的使命',
            desc: '19世纪海军航行依赖天文表和对数表，但手工计算的表充满错误。巴贝奇的差分机就是为了自动、准确地生产这些表。用机器消除人为错误。',
            demoNote: '📖 19世纪的"命根子"：对数表、天文表\n❌ 手工算+手工抄 = 错误百出\n✅ 差分机 = 自动计算+自动打印\n🚢 直接关系到航海安全！',
            demo: demoTables, details: '<h3>错误的代价</h3><p>对数表中的一个错误可能导致船只偏航数十海里。巴贝奇在检查一份天文表时发现了大量错误，于是说出了那句名言，并开始设计差分机。</p>'
        },

        {
            side: 'right', label: 'Ada Lovelace', hlIds: ['hl-cycle', 'hl-crank'], statusKey: 'ada',
            title: 'Ada Lovelace — 第一位程序员',
            desc: 'Augusta Ada King, Countess of Lovelace (1815-1852)，巴贝奇的合作者，为分析机写下了世界上第一个"程序"(计算伯努利数的算法)。虽然差分机是固定功能的，但Ada的工作为通用计算奠定了基础。',
            demoNote: '👩‍💻 Ada Lovelace 1815-1852\n📝 写了世界上第一个计算机程序\n🧮 计算伯努利数的算法\n💡 "机器能创作音乐吗？" ——Ada最先思考AI',
            demo: demoAda, details: '<h3>Ada的远见</h3><p>"分析机不仅能计算数字，还能处理任何可以用符号表示的关系。" —— 这个洞见比图灵的通用计算理论早了100年。</p>'
        },
    ];

    // =============================================
    // 8. DEMO GENERATORS
    // =============================================
    function demoResult() { return `<svg viewBox="0 0 400 250"><rect x="40" y="20" width="60" height="210" fill="rgba(180,134,11,0.1)" stroke="${INK}" stroke-width="1.5" rx="3"/><text x="70" y="15" text-anchor="middle" fill="${INK}" font-size="12" font-weight="bold">R</text>${[0, 1, 4, 9, 16, 25].map((v, i) => `<rect x="48" y="${30 + i * 35}" width="44" height="28" fill="rgba(180,134,11,${i === 0 ? '0.2' : '0.05'})" stroke="${INK}" stroke-width="0.8" rx="3"/><text x="70" y="${50 + i * 35}" text-anchor="middle" fill="${INK}" font-size="14" font-family="'Source Code Pro',monospace">${v}</text>`).join('')}<text x="140" y="50" fill="${BRASS}" font-size="11">← f(0)=0</text><text x="140" y="85" fill="${BRASS}" font-size="11">← f(1)=1</text><text x="140" y="120" fill="${BRASS}" font-size="11">← f(2)=4</text><text x="140" y="155" fill="${BRASS}" font-size="11">← f(3)=9</text><text x="250" y="130" fill="${BRASS}" font-size="13">x² 的结果序列</text></svg>`; }
    function demoD1() { return `<svg viewBox="0 0 400 200"><rect x="50" y="20" width="50" height="170" fill="rgba(180,134,11,0.05)" stroke="${INK}" stroke-width="1" rx="3"/><text x="75" y="15" text-anchor="middle" fill="${INK}" font-size="11" font-weight="bold">Δ¹</text>${[1, 3, 5, 7, 9].map((v, i) => `<text x="75" y="${50 + i * 30}" text-anchor="middle" fill="${INK}" font-size="14" font-family="'Source Code Pro',monospace">${v}</text>`).join('')}<text x="130" y="50" fill="${BRASS}" font-size="10">1-0=1</text><text x="130" y="80" fill="${BRASS}" font-size="10">4-1=3</text><text x="130" y="110" fill="${BRASS}" font-size="10">9-4=5</text><text x="130" y="140" fill="${BRASS}" font-size="10">16-9=7</text><text x="250" y="100" fill="${BRASS}" font-size="12">一阶差分序列</text><text x="250" y="120" fill="${BRASS}" font-size="10">每次+2(=Δ²)</text></svg>`; }
    function demoD2() { return `<svg viewBox="0 0 400 180"><rect x="60" y="30" width="50" height="120" fill="rgba(255,215,0,0.1)" stroke="${GOLD}" stroke-width="1.5" rx="3"/><text x="85" y="25" text-anchor="middle" fill="${GOLD}" font-size="11" font-weight="bold">Δ² = 常数!</text>${[2, 2, 2, 2].map((v, i) => `<text x="85" y="${60 + i * 25}" text-anchor="middle" fill="${GOLD}" font-size="16" font-weight="bold" font-family="'Source Code Pro',monospace">${v}</text>`).join('')}<text x="160" y="60" fill="${BRASS}" font-size="10">3-1=2</text><text x="160" y="85" fill="${BRASS}" font-size="10">5-3=2</text><text x="160" y="110" fill="${BRASS}" font-size="10">7-5=2</text><text x="250" y="90" fill="${BRASS}" font-size="13">✨ 常数！</text><text x="250" y="110" fill="${BRASS}" font-size="10">这就是差分法的魔法</text></svg>`; }
    function demoHighOrder() { return `<svg viewBox="0 0 400 150"><text x="200" y="20" text-anchor="middle" fill="${INK}" font-size="12">多项式阶数 → 需要的差分列数</text>${['x¹→Δ¹', 'x²→Δ²', 'x³→Δ³', 'x⁴→Δ⁴', 'x⁵→Δ⁵', 'x⁶→Δ⁶'].map((t, i) => `<rect x="${20 + i * 62}" y="40" width="56" height="35" fill="rgba(180,134,11,${0.05 + i * 0.02})" stroke="${INK}" stroke-width="0.8" rx="2"/><text x="${48 + i * 62}" y="63" text-anchor="middle" fill="${INK}" font-size="10">${t}</text>`).join('')}<text x="200" y="110" text-anchor="middle" fill="${BRASS}" font-size="12">差分机No.2: 最高6阶 = 6次多项式</text><text x="200" y="130" text-anchor="middle" fill="${BRASS}" font-size="10">每列31位精度 → 10³¹ 种状态</text></svg>`; }
    function demoCarry() { return `<svg viewBox="0 0 400 180">${[7, 5, '?'].map((v, i) => `<rect x="${50 + i * 80}" y="50" width="50" height="40" fill="rgba(180,134,11,0.1)" stroke="${INK}" stroke-width="1" rx="3"/><text x="${75 + i * 80}" y="77" text-anchor="middle" fill="${INK}" font-size="18" font-family="'Source Code Pro',monospace">${v}</text>`).join('')}<text x="115" y="45" fill="${BRASS}" font-size="20">+</text><text x="195" y="45" fill="${BRASS}" font-size="20">=</text><text x="235" y="140" text-anchor="middle" fill="${GOLD}" font-size="14">7+5=12</text><rect x="210" y="50" width="50" height="40" fill="rgba(255,215,0,0.15)" stroke="${GOLD}" stroke-width="1.5" rx="3"><animate attributeName="fill" values="rgba(255,215,0,0.05);rgba(255,215,0,0.25);rgba(255,215,0,0.05)" dur="1.5s" repeatCount="indefinite"/></rect><text x="235" y="77" text-anchor="middle" fill="${GOLD}" font-size="18" font-weight="bold">12</text><text x="280" y="60" fill="${GOLD}" font-size="12">↑ 进1</text></svg>`; }
    function demoWheels() { return `<svg viewBox="0 0 400 200"><g>${Array.from({ length: 4 }, (_, i) => `<rect x="60" y="${20 + i * 45}" width="55" height="38" fill="rgba(180,134,11,0.08)" stroke="${INK}" stroke-width="1" rx="4"/><text x="87" y="${46 + i * 45}" text-anchor="middle" fill="${INK}" font-size="16" font-family="'Source Code Pro',monospace">${[5, 2, 0, 1][i]}</text>`).join('')}</g><text x="30" y="44" fill="${BRASS}" font-size="9" text-anchor="end">个位</text><text x="30" y="89" fill="${BRASS}" font-size="9" text-anchor="end">十位</text><text x="30" y="134" fill="${BRASS}" font-size="9" text-anchor="end">百位</text><text x="30" y="179" fill="${BRASS}" font-size="9" text-anchor="end">千位</text><text x="180" y="100" fill="${BRASS}" font-size="13">= 1025</text><text x="180" y="120" fill="${BRASS}" font-size="10">从下到上读数字</text><circle cx="87" cy="40" r="20" fill="none" stroke="${GOLD}" stroke-width="0.8" stroke-dasharray="3 2"><animateTransform attributeName="transform" type="rotate" from="0 87 40" to="360 87 40" dur="2s" repeatCount="indefinite"/></circle></svg>`; }
    function demoPrint() { return `<svg viewBox="0 0 400 180"><rect x="30" y="30" width="340" height="120" fill="rgba(240,230,210,0.5)" stroke="${INK}" stroke-width="1" rx="3"/><text x="200" y="55" text-anchor="middle" fill="${INK}" font-size="11">打印输出</text><text x="200" y="85" text-anchor="middle" fill="${INK}" font-size="14" font-family="'Source Code Pro',monospace">x=0: 0</text><text x="200" y="105" text-anchor="middle" fill="${INK}" font-size="14" font-family="'Source Code Pro',monospace">x=1: 1</text><text x="200" y="125" text-anchor="middle" fill="${INK}" font-size="14" font-family="'Source Code Pro',monospace">x=2: 4</text><text x="200" y="145" text-anchor="middle" fill="${INK}" font-size="14" font-family="'Source Code Pro',monospace">x=3: 9</text><rect x="15" y="30" width="12" height="80" fill="url(#steel-demo)" stroke="${INK}" stroke-width="0.8" rx="1"><animate attributeName="y" values="30;50;30" dur="2s" repeatCount="indefinite"/></rect><defs><linearGradient id="steel-demo" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#aaa"/><stop offset="100%" stop-color="#777"/></linearGradient></defs></svg>`; }
    function demoMethod() { return `<svg viewBox="0 0 450 200"><text x="225" y="20" text-anchor="middle" fill="${INK}" font-size="12" font-weight="bold">差分法 → 只用加法算多项式</text><text x="60" y="55" text-anchor="middle" fill="${INK}" font-size="11">R</text><text x="150" y="55" text-anchor="middle" fill="${INK}" font-size="11">Δ¹</text><text x="240" y="55" text-anchor="middle" fill="${INK}" font-size="11">Δ²</text>${[[0, 1, 2], [1, 3, 2], [4, 5, 2], [9, 7, 2]].map((row, r) => row.map((v, c) => `<rect x="${35 + c * 90}" y="${65 + r * 30}" width="50" height="24" fill="rgba(180,134,11,${c === 2 ? 0.12 : 0.05})" stroke="${INK}" stroke-width="0.8" rx="2"/><text x="${60 + c * 90}" y="${82 + r * 30}" text-anchor="middle" fill="${c === 2 ? GOLD : INK}" font-size="12" font-family="'Source Code Pro',monospace">${v}</text>`).join('')).join('')}<text x="370" y="95" fill="${BRASS}" font-size="10">每步: R+=Δ¹</text><text x="370" y="115" fill="${BRASS}" font-size="10">每步: Δ¹+=Δ²</text><text x="370" y="135" fill="${BRASS}" font-size="10">Δ²不变(常数)</text></svg>`; }
    function demoCrank() { return `<svg viewBox="0 0 300 250"><circle cx="150" cy="125" r="60" fill="none" stroke="${INK}" stroke-width="2.5"/><circle cx="150" cy="125" r="12" fill="rgba(180,134,11,0.3)" stroke="${INK}" stroke-width="1.5"/><line x1="150" y1="125" x2="210" y2="125" stroke="${INK}" stroke-width="3" stroke-linecap="round"><animateTransform attributeName="transform" type="rotate" from="0 150 125" to="360 150 125" dur="2s" repeatCount="indefinite"/></line><circle cx="210" cy="125" r="8" fill="rgba(180,134,11,0.4)" stroke="${INK}" stroke-width="1.5"><animateMotion dur="2s" repeatCount="indefinite" path="M60,0 A60,60 0 1,1 59.9,0"/></circle><text x="150" y="210" text-anchor="middle" fill="${BRASS}" font-size="12">转一圈 = 计算一步</text></svg>`; }
    function demoShaft() { return `<svg viewBox="0 0 400 120"><rect x="20" y="45" width="360" height="15" fill="url(#steel-demo2)" stroke="${INK}" stroke-width="1" rx="2"/><defs><linearGradient id="steel-demo2" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#b0b0b0"/><stop offset="100%" stop-color="#707070"/></linearGradient></defs>${[0, 1, 2, 3, 4, 5, 6].map(i => `<line x1="${50 + i * 50}" y1="30" x2="${50 + i * 50}" y2="45" stroke="${INK}" stroke-width="1.5"/><circle cx="${50 + i * 50}" cy="25" r="6" fill="rgba(180,134,11,0.2)" stroke="${INK}" stroke-width="0.8"/>`).join('')}<text x="200" y="90" text-anchor="middle" fill="${BRASS}" font-size="11">━━ 主轴连接所有7列 ━━</text><text x="200" y="108" text-anchor="middle" fill="${BRASS}" font-size="10">保证同步运作</text></svg>`; }
    function demoFrame() { return `<svg viewBox="0 0 400 200"><rect x="40" y="20" width="320" height="160" fill="none" stroke="${INK}" stroke-width="3" rx="5"/><rect x="45" y="25" width="310" height="150" fill="none" stroke="${INK}" stroke-width="1" rx="3"/><text x="200" y="100" text-anchor="middle" fill="${INK}" font-size="11">2.1m × 0.7m × 1.1m</text><text x="200" y="120" text-anchor="middle" fill="${INK}" font-size="11">约5吨 · 25,000零件</text><text x="200" y="145" text-anchor="middle" fill="${BRASS}" font-size="10">1991年伦敦科学博物馆首次建成</text></svg>`; }
    function demoCycle() { return `<svg viewBox="0 0 400 200">${['Δ⁶→Δ⁵', 'Δ⁵→Δ⁴', 'Δ⁴→Δ³', 'Δ³→Δ²', 'Δ²→Δ¹', 'Δ¹→R'].map((s, i) => `<rect x="${15 + i * 63}" y="50" width="56" height="30" fill="rgba(180,134,11,${0.05 + i * 0.03})" stroke="${INK}" stroke-width="0.8" rx="2"><animate attributeName="fill" values="rgba(180,134,11,0.05);rgba(255,215,0,0.3);rgba(180,134,11,0.05)" dur="3s" begin="${i * 0.4}s" repeatCount="indefinite"/></rect><text x="${43 + i * 63}" y="70" text-anchor="middle" fill="${INK}" font-size="9">${s}</text>`).join('')}<text x="200" y="120" text-anchor="middle" fill="${BRASS}" font-size="12">从右到左，逐级传播加法</text><text x="200" y="140" text-anchor="middle" fill="${BRASS}" font-size="10">波浪式依次亮起 = 计算顺序</text></svg>`; }
    function demoPoly() { return `<svg viewBox="0 0 400 200"><text x="200" y="25" text-anchor="middle" fill="${INK}" font-size="12" font-weight="bold">可选多项式</text>${['x²', 'x³', 'x²+x+41', '2x³-3x²+x+5', 'n(n+1)/2'].map((p, i) => `<rect x="60" y="${40 + i * 28}" width="280" height="22" fill="rgba(180,134,11,${i === 0 ? 0.12 : 0.04})" stroke="${INK}" stroke-width="0.5" rx="2"/><text x="200" y="${56 + i * 28}" text-anchor="middle" fill="${INK}" font-size="11" font-family="'Source Code Pro',monospace">${p}</text>`).join('')}</svg>`; }
    function demoBabbage() { return `<svg viewBox="0 0 300 200"><circle cx="150" cy="70" r="45" fill="none" stroke="${INK}" stroke-width="1.5"/><text x="150" y="65" text-anchor="middle" fill="${INK}" font-size="10">Charles</text><text x="150" y="80" text-anchor="middle" fill="${INK}" font-size="10">Babbage</text><text x="150" y="135" text-anchor="middle" fill="${INK}" font-size="11">1791 — 1871</text><text x="150" y="155" text-anchor="middle" fill="${BRASS}" font-size="10">🇬🇧 Cambridge · Lucasian Professor</text><text x="150" y="175" text-anchor="middle" fill="${BRASS}" font-size="10">"计算机之父"</text></svg>`; }
    function demoTables() { return `<svg viewBox="0 0 400 200"><rect x="50" y="20" width="300" height="160" fill="rgba(240,230,210,0.5)" stroke="${INK}" stroke-width="1" rx="3"/><text x="200" y="42" text-anchor="middle" fill="${INK}" font-size="11" font-weight="bold">📖 对数表 (手工 vs 机器)</text><text x="130" y="70" text-anchor="middle" fill="red" font-size="10">手工: 错误❌</text><text x="270" y="70" text-anchor="middle" fill="green" font-size="10">机器: 精确✅</text>${['log 1.00 = 0.0000', 'log 1.01 = 0.0043', 'log 1.02 = 0.0086'].map((t, i) => `<text x="200" y="${95 + i * 25}" text-anchor="middle" fill="${INK}" font-size="11" font-family="'Source Code Pro',monospace">${t}</text>`).join('')}<text x="200" y="170" text-anchor="middle" fill="${BRASS}" font-size="10">🚢 航海表的精确性关乎生死！</text></svg>`; }
    function demoAda() { return `<svg viewBox="0 0 300 200"><circle cx="150" cy="65" r="40" fill="none" stroke="${INK}" stroke-width="1.5"/><text x="150" y="60" text-anchor="middle" fill="${INK}" font-size="9">Augusta Ada</text><text x="150" y="73" text-anchor="middle" fill="${INK}" font-size="9">Lovelace</text><text x="150" y="125" text-anchor="middle" fill="${INK}" font-size="11">1815 — 1852</text><text x="150" y="145" text-anchor="middle" fill="${BRASS}" font-size="10">👩‍💻 世界上第一个程序员</text><text x="150" y="165" text-anchor="middle" fill="${BRASS}" font-size="10">📝 伯努利数算法 = 第一个程序</text><text x="150" y="185" text-anchor="middle" fill="${BRASS}" font-size="9">"机器也许能作曲" ——最早的AI思考</text></svg>`; }

    // =============================================
    // 9. RENDER BUTTONS + HOVER + STATUS
    // =============================================
    const leftCol = document.getElementById('leftLabels');
    const rightCol = document.getElementById('rightLabels');
    const panel = document.getElementById('feature-panel');
    const closeBtn = document.getElementById('closePanel');
    const allGroups = svg.querySelectorAll(':scope > g');
    let activeBtn = null;

    features.forEach(f => {
        const col = f.side === 'left' ? leftCol : rightCol;
        const btn = document.createElement('button');
        btn.className = 'feature-btn';
        const ar = f.side === 'left' ? '→' : '←';
        btn.innerHTML = `<span class="btn-dot"></span><span>${f.label}</span><span class="btn-arrow">${ar}</span><span class="btn-status" id="st-${f.statusKey}">…</span>`;
        setTimeout(() => { statusEls[f.statusKey] = document.getElementById('st-' + f.statusKey); }, 100);

        btn.addEventListener('mouseenter', () => {
            allGroups.forEach(g => g.classList.add('dimmed'));
            f.hlIds.forEach(id => {
                const el = document.getElementById(id);
                if (el) {
                    el.classList.add('highlighted'); el.classList.remove('dimmed');
                    let p = el.parentElement; while (p && p !== svg) { p.classList.remove('dimmed'); p = p.parentElement; }
                }
            });
        });
        btn.addEventListener('mouseleave', () => {
            allGroups.forEach(g => { g.classList.remove('dimmed'); });
            document.querySelectorAll('.highlighted').forEach(el => el.classList.remove('highlighted'));
        });
        btn.addEventListener('click', () => openPanel(f, btn));
        col.appendChild(btn);
    });

    function openPanel(f, btn) {
        if (activeBtn) activeBtn.classList.remove('active');
        btn.classList.add('active'); activeBtn = btn;
        document.getElementById('featureTitle').textContent = f.title;
        document.getElementById('featureDesc').textContent = f.desc;
        document.getElementById('featureDemo').innerHTML = f.demo();
        document.getElementById('featureDemoNote').textContent = f.demoNote;
        document.getElementById('featureDetails').innerHTML = f.details;
        panel.classList.add('open');
    }
    function closePanel() { panel.classList.remove('open'); if (activeBtn) { activeBtn.classList.remove('active'); activeBtn = null; } }
    if (closeBtn) closeBtn.addEventListener('click', closePanel);
    document.addEventListener('keydown', e => { if (e.key === 'Escape') closePanel(); });

    // =============================================
    // 10. REAL-TIME STATUS UPDATES
    // =============================================
    function updateStatus() {
        const poly = polynomials[currentPoly];
        const rVal = digitsToNumber(columns[0]);
        const d1Val = digitsToNumber(columns[1]);
        const d2Val = digitsToNumber(columns[2]);
        const expected = poly.fn(step);

        if (statusEls.result) statusEls.result.textContent = `= ${rVal} (f(${step}))`;
        if (statusEls.d1) statusEls.d1.textContent = `= ${d1Val}`;
        if (statusEls.d2) statusEls.d2.textContent = `= ${d2Val}`;
        if (statusEls.d36) {
            const d3 = digitsToNumber(columns[3]);
            statusEls.d36.textContent = `Δ³=${d3} Δ⁴=${digitsToNumber(columns[4])}`;
        }
        if (statusEls.carry) statusEls.carry.textContent = step > 0 ? '上步已完成' : '待运行';
        if (statusEls.wheels) statusEls.wheels.textContent = `${COLS}×${DIGITS} = ${COLS * DIGITS}个轮`;
        if (statusEls.print) statusEls.print.textContent = `输出: f(${step})=${rVal}`;
        if (statusEls.method) statusEls.method.textContent = `R+=Δ¹, Δ¹+=Δ² ...`;
        if (statusEls.crank) statusEls.crank.textContent = `已转 ${step} 圈`;
        if (statusEls.shaft) statusEls.shaft.textContent = `连接 ${COLS} 列`;
        if (statusEls.frame) statusEls.frame.textContent = `No.2 · 7列×8位`;
        if (statusEls.cycle) statusEls.cycle.textContent = `步骤 ${step}`;
        if (statusEls.poly) statusEls.poly.textContent = `当前: ${poly.name}`;
        if (statusEls.babbage) statusEls.babbage.textContent = `1791-1871 🇬🇧`;
        if (statusEls.tables) statusEls.tables.textContent = `已算${step}行`;
        if (statusEls.ada) statusEls.ada.textContent = `1815-1852 👩‍💻`;
    }

    // =============================================
    // INIT
    // =============================================
    createWheels();
    createCarryArrows();
    initEngine();
    updateStatus();
});
