/**
 * 小提琴 — Violin
 * Da Vinci sketch style, exploded parts view, feature explanations
 * Tone.js Karplus-Strong string synthesis
 */

let pluckSynth;
let fallbackSynth;
let audioInit = false;

// Initialize Tone.js with networked real Violin samples
window.playViolinNote = async function (midiNote = 60, el = null) {
    if (!audioInit) {
        await Tone.start();

        const reverb = new Tone.Freeverb({
            roomSize: 0.6,
            dampening: 3000
        }).toDestination();

        // Fallback AMSynth mimicking bowed string
        fallbackSynth = new Tone.PolySynth(Tone.AMSynth, {
            harmonicity: 3.0,
            oscillator: { type: "sawtooth" },
            envelope: { attack: 0.1, decay: 0.1, sustain: 1, release: 1 },
            modulation: { type: "sine" },
            modulationEnvelope: { attack: 0.3, decay: 0, sustain: 1, release: 0.5 }
        }).connect(reverb);
        fallbackSynth.volume.value = -12;

        // Load real violin samples over network
        pluckSynth = new Tone.Sampler({
            urls: {
                "A3": "A3.mp3",
                "A4": "A4.mp3",
                "A5": "A5.mp3",
                "C4": "C4.mp3",
                "C5": "C5.mp3",
                "C6": "C6.mp3",
                "E4": "E4.mp3",
                "E5": "E5.mp3",
                "G4": "G4.mp3",
                "G5": "G5.mp3"
            },
            release: 1.2,
            baseUrl: "https://cdn.jsdelivr.net/gh/nbrosowsky/tonejs-instruments/samples/violin/"
        }).connect(reverb);

        pluckSynth.volume.value = 0;
        audioInit = true;
    }

    const freq = Tone.Frequency(midiNote, "midi").toNote();

    // Play real networked sound if ready, otherwise fallback to synthetic immediately
    if (pluckSynth.loaded) {
        pluckSynth.triggerAttackRelease(freq, "8n");
    } else {
        fallbackSynth.triggerAttackRelease(freq, "8n");
    }

    // Add visual flash effect to SVG lines
    if (el && el.setAttribute) {
        const origStroke = el.getAttribute('stroke') || "none";
        const origWidth = el.getAttribute('stroke-width') || "1";
        el.setAttribute('stroke', '#daa520'); // Highlight Gold
        el.setAttribute('stroke-width', '4');
        setTimeout(() => {
            el.setAttribute('stroke', origStroke);
            el.setAttribute('stroke-width', origWidth);
        }, 150);
    }
};

// Start audio context on first click anywhere
document.addEventListener('click', async () => {
    if (!audioInit) {
        await Tone.start();
    }
}, { once: true });


document.addEventListener('DOMContentLoaded', () => {
    const NS = 'http://www.w3.org/2000/svg';
    const INK = '#3a2a1a';
    const GOLD = '#daa520';
    const SEPIA = '#704214';
    const svg = document.getElementById('violin-svg');
    const CX = 250, CY = 375;
    let isExploded = false;
    let clickCount = 0;
    let clickTimer = null;

    setTimeout(() => { const e = document.getElementById('entrance-overlay'); if (e) e.style.display = 'none'; }, 6500);

    // =============================================
    // 1. GENERATORS FOR SVG
    // =============================================

    // Violin Body Outline (Upper bout, C-bout, Lower bout)
    const bodyPath = `M200,200 C150,200 160,280 210,300 C220,310 220,330 200,340 C140,360 140,500 250,500 C360,500 360,360 300,340 C280,330 280,310 290,300 C340,280 350,200 300,200 C270,200 270,180 250,180 C230,180 230,200 200,200 Z`;

    // F-holes
    const fHoleLeft = `M210,310 Q215,350 205,390 M207,315 A3,3 0 1,1 210,310 M202,390 A4,4 0 1,1 205,395`;
    const fHoleRight = `M290,310 Q285,350 295,390 M293,315 A3,3 0 1,0 290,310 M298,390 A4,4 0 1,0 295,395`;

    function genViolinStrings() {
        let s = '';
        // 4 strings (G, D, A, E)
        const thickness = [1.2, 0.9, 0.6, 0.3];
        for (let i = 0; i < 4; i++) {
            const x = 244 + i * 4;
            s += `<line x1="${x}" y1="80" x2="${x}" y2="440" stroke="${GOLD}" stroke-width="${thickness[i]}" opacity="0.8"/>`;
        }
        return s;
    }

    // =============================================
    // 2. PARTS DATA
    // =============================================
    const parts = [
        {
            id: 'scroll', label: '琴头/旋首 · Scroll', side: 'left', external: true,
            explode: { x: -40, y: -80, r: -20 },
            svg: `<path d="M243,30 C230,10 270,10 257,30 L257,60 L243,60 Z" class="sketch-stroke"/>
                  <path d="M240,15 A5,5 0 1,0 260,15 A10,10 0 1,0 240,15" class="sketch-line"/>`,
            title: '琴头/旋首 — VOLVTA', desc: '小提琴顶部的标志性螺旋雕刻。不仅具有极高的美学装饰价值，其复杂的内部蜗牛造型也是琴匠展示手艺的地方。',
            demoNote: '🐚 经典的斐波那契螺旋\n🖌️ 达芬奇时期的美学代表\n🪵 手工雕刻的枫木',
            details: '<h3>平衡与美学</h3><p>琴头不仅是一个装饰，它自身的重量和精心的物理分布也能在微观层面上影响整把琴的共振平衡。</p>'
        },
        {
            id: 'pegs', label: '弦轴 · Pegs', side: 'right', external: true,
            explode: { x: 70, y: -100, r: 15 },
            svg: `<line x1="230" y1="45" x2="270" y2="40" class="sketch-bold"/>
                  <line x1="230" y1="55" x2="270" y2="50" class="sketch-bold"/>
                  <circle cx="228" cy="45" r="4" class="sketch-fill"/>
                  <circle cx="272" cy="40" r="4" class="sketch-fill"/>
                  <circle cx="228" cy="55" r="4" class="sketch-fill"/>
                  <circle cx="272" cy="50" r="4" class="sketch-fill"/>`,
            title: '弦轴 — CLAVICVLAE', desc: '用来调节琴弦张力和音高的四个木制旋钮，通常用硬度极高的乌木、黄杨木或玫瑰木制成。',
            demoNote: '🔄 旋转以改变琴弦张力\n⚙️ 靠摩擦力与弦轴匣紧靠\n🖤 通常使用乌木制作',
            details: '<h3>摩擦阻尼</h3><p>提琴没有齿轮机械弦钮，全靠木头与木头之间纯粹的物理摩擦力来锁定。制琴师需要非常精确地用绞刀切削出1:30的锥度。</p>'
        },
        {
            id: 'fingerboard', label: '指板 · Fingerbd', side: 'left', external: true,
            explode: { x: -70, y: -20, r: -5 },
            svg: `<path d="M242,70 L258,70 L265,300 L235,300 Z" class="sketch-fill" fill="rgba(30, 30, 30, 0.4)"/>`,
            title: '指板 — TABVLA DIGITIVA', desc: '提琴上最长的一块乌木板，手指在此按压琴弦改变音高。表面有非常微小的纵向凹曲率，防止琴弦打板。',
            demoNote: '🎹 相当于提琴的无品键盘\n🌑 必须是完全干燥的乌木\n📏 有严格的纵向弧度规定',
            details: '<h3>无品弦乐</h3><p>提琴指板没有吉他那样的“品丝”，所以音准完全依靠演奏者手指落点的位置和长期的肌肉记忆。</p>'
        },
        {
            id: 'neck', label: '琴颈 · Neck', side: 'right', external: false,
            explode: { x: 50, y: 10, r: 10 },
            svg: `<rect x="245" y="60" width="10" height="130" class="sketch-hatch"/>`,
            title: '琴颈 — COLLVM', desc: '连接琴身和琴头的手持中枢。演奏者左手的手窝需要顺畅无阻地在琴颈上滑动。',
            demoNote: '🪵 有漂亮虎纹的枫木\n✋ 没有油漆，只上清油\n📏 绝佳的握持弧度',
            details: '<h3>手感至上</h3><p>琴颈的背面必须被抛光到如同丝绸般顺滑，而且绝对不能刷提琴油漆，否则出汗后会导致左手换把时被黏住。</p>'
        },
        {
            id: 'body', label: '琴箱 · Body', side: 'left', external: true,
            explode: { x: -30, y: 40, r: -8 },
            svg: `<path d="${bodyPath}" class="sketch-stroke"/>
                  <path d="${bodyPath}" stroke="none" fill="rgba(180, 150, 100, 0.05)" transform="scale(0.95, 0.95) translate(12, 18)"/>`,
            title: '共鸣琴箱 — CORPVS', desc: '小提琴的灵魂声学腔体！上顶板是云杉，背板是枫木。它是一个极为复杂且非对称的非线性声学放大器。',
            demoNote: '📦 内部是一个中空的放大器\n🌲 面板云杉，背板虎纹枫木\n🎶 琴身形状基于声学黄金比例',
            details: '<h3>提琴油漆的秘密</h3><p>提琴的漆(Varnish)不仅仅是为了好看，它能保护木材并调节声学高频响应。相传斯氏琴失传的秘方就藏在由琥珀、树脂化石制成的油漆中。</p>'
        },
        {
            id: 'fholes', label: 'F孔 · F-holes', side: 'right', external: true,
            explode: { x: 100, y: -20, r: 25 },
            svg: `<path d="${fHoleLeft}" class="sketch-bold"/>
                  <path d="${fHoleRight}" class="sketch-bold"/>`,
            title: 'F孔 — FORAMINA SONORA', desc: '琴面上的两个"f"形状的开孔。它们能让腔体内的空气与外界进行共振交换，并降低面板中部的抗弯强度。',
            demoNote: '💨 空气通过此孔呼吸共振\n🔪 刀工体现制琴师的流派\n🔊 大幅提升低频辐射效率',
            details: '<h3>亥姆霍兹共振器</h3><p>提琴琴箱和F孔构成了一个亥姆霍兹共振器(Helmholtz Resonator)，主要作用于提琴D弦附近频率，为其提供深沉有力的低音支撑。</p>'
        },
        {
            id: 'bridge', label: '琴桥(码) · Bridge', side: 'left', external: true,
            explode: { x: -110, y: 40, r: -30 },
            svg: `<path d="M235,350 Q250,340 265,350 L260,360 L240,360 Z" class="sketch-fill"/>
                  <circle cx="245" cy="355" r="2" class="sketch-line"/>
                  <circle cx="255" cy="355" r="2" class="sketch-line"/>`,
            title: '琴桥(琴码) — PONS', desc: '支撑琴弦的关键。薄薄的枫木片不仅承载巨大的下压力，还是极为核心的高频声音滤波器。',
            demoNote: '🦵 并没有用胶水粘在面板上\n⚡ 传递弦的高频振动\n🔪 修削厚度能改变提琴音色',
            details: '<h3>声学滤波</h3><p>琴码不是一个死板的支撑点。不同的挖洞大小、厚度分布，甚至中间的"心"型挖孔，能决定2000Hz到3000Hz之间敏感频段的声音如何传导到面板上。</p>'
        },
        {
            id: 'strings', label: '琴弦 · Strings', side: 'right', external: true,
            explode: { x: 40, y: 0, r: 0 },
            svg: `<g id="viol-strings">${genViolinStrings()}</g>`,
            title: '琴弦 — CHORDAE', desc: '发声之源。四根弦分别为 G(196Hz)、D(293Hz)、A(440Hz)、E(659Hz)。现代提琴多用合成芯或钢丝外缠金属丝。',
            demoNote: '🎵 四根琴弦定音纯五度\n羊肠、钢丝、合成尼龙芯\n🏹 通过马尾弓毛摩擦发声',
            details: '<h3>古典羊肠弦</h3><p>文艺复兴乃至巴洛克时期，琴弦是用羊的小肠扭绞并拉伸干燥而成的，音色极度柔美温暖，但非常容易受温度湿度影响跑调。</p>'
        },
        {
            id: 'soundpost', label: '音柱 · Soundpost', side: 'left', external: false,
            explode: { x: -60, y: 110, r: 15 },
            svg: `<line x1="258" y1="360" x2="258" y2="385" stroke="${INK}" stroke-width="4" stroke-dasharray="2 2" opacity="0.5"/>`,
            title: '音柱 — ANIMA', desc: '内部隐藏的灵魂支柱！琴箱右侧面板和背板之间夹住的云杉小木棒。它打破了琴身的对称共振。',
            demoNote: '👻 在法语中被称为"灵魂"(L\'Âme)\n📏 仅靠压力立在里面无需胶水\n🔊 传递高频波到坚硬的背板',
            details: '<h3>非对称震动</h3><p>如果没有音柱，提琴面板会像鼓皮一样一起上下运动。有了音柱撑住右脚(高音侧)，整个面板的振动会变为复杂的左右翘翘板模式，让提琴能发出宏亮立体的声音。</p>'
        },
        {
            id: 'bassbar', label: '低音梁 · Bass Bar', side: 'right', external: false,
            explode: { x: 90, y: 80, r: -10 },
            svg: `<path d="M238,260 Q235,350 238,440" stroke="${INK}" stroke-width="5" opacity="0.3" stroke-linecap="round"/>`,
            title: '低音梁 — TIGNVM BASSVM', desc: '粘在面板内侧、平行于低音G弦正下方的一根较长云杉木条。增强面板承重并帮助传播低频声波。',
            demoNote: '🪵 位于内部左侧\n🏋️ 支撑琴码左脚的巨大下压力\n🌊 纵向扩散低音的共振区',
            details: '<h3>力学与声学</h3><p>现代琴的低音弦拉力变大后，传统的巴洛克低音梁已经无法支撑。所有的意大利古老名琴在19世纪都经历过"开膛破肚"，被换上了粗壮的现代低音梁。</p>'
        },
        {
            id: 'tailpiece', label: '拉弦板 · Tailpiece', side: 'right', external: true,
            explode: { x: 40, y: 150, r: -5 },
            svg: `<path d="M243,390 L257,390 L265,450 L235,450 Z" class="sketch-fill" fill="${INK}"/>
                  <circle cx="245" cy="400" r="2" fill="${GOLD}"/>
                  <circle cx="255" cy="400" r="2" fill="${GOLD}"/>`,
            title: '拉弦板 · 尾柱 — CAUDA', desc: '固定琴弦尾端的配件。底端通过一根肠线或尼龙尾绳挂在琴身最底部的尾柱上。',
            demoNote: '⚓ 固定琴弦末端的锚点\n🖤 黑色的多为乌木精刻\n✨ 有时带有金属微调器',
            details: '<h3>共振死区</h3><p>拉弦板到琴码之间的这段弦(称为弦尾节)如果调谐不好，会吸收正常琴弦的能量导致音"发狼"(狼音)。专业调琴师会微调拉弦板的距离。</p>'
        },
        {
            id: 'bow', label: '琴弓 · Bow', side: 'left', external: true,
            explode: { x: 160, y: -200, r: 80 },
            svg: `<path d="M120,50 Q250,55 380,45" class="sketch-line" stroke="${SEPIA}"/>
                  <line x1="120" y1="56" x2="380" y2="56" stroke="#f4f4f0" stroke-width="2" opacity="0.8"/>
                  <rect x="110" y="45" width="10" height="15" fill="${INK}"/>`,
            title: '琴弓 — ARCVS', desc: '巴西苏木制成的极富弹性的弯木棍，绷紧150根到200根白色马尾毛。提琴的"呼吸器"。',
            demoNote: '🐴 蒙古或西伯利亚的公马尾毛\n🌲 需要涂抹松香增加物理摩擦力\n🏹 苏木极具弹性且极其珍贵',
            details: '<h3>粘滑效应</h3><p>马尾毛上的松香摩擦琴弦时，会产生"粘住-滑开"(Stick-Slip)的剧烈高频拉锯现象。这是由于静摩擦力和动摩擦力的差值，创造了提琴连绵不绝的美妙长音。</p>'
        }
    ];

    const partGroups = {};

    function renderViolin() {
        parts.forEach((p, idx) => {
            const g = document.createElementNS(NS, 'g');
            g.setAttribute('id', 'part-' + p.id);
            g.setAttribute('class', `violin-part highlightable ${p.external ? 'visible-part' : 'hidden-part'}`);
            g.setAttribute('filter', 'url(#sketch)');
            g.innerHTML = p.svg;
            // Add label
            const label = document.createElementNS(NS, 'text');
            label.setAttribute('class', 'part-label');
            label.textContent = p.label;
            g.appendChild(label);
            svg.appendChild(g);
            partGroups[p.id] = { g, label, data: p };
        });
    }

    // =============================================
    // 3. EXPLODE / REASSEMBLE
    // =============================================
    function explodeViolin() {
        isExploded = true;
        document.getElementById('reassembleBtn').style.display = '';
        document.getElementById('violin-hint').style.display = 'none';

        parts.forEach((p, index) => {
            setTimeout(() => {
                const pg = partGroups[p.id];
                const { x, y, r } = p.explode;
                const scatterX = x + (Math.random() * 20 - 10);
                const scatterY = y + (Math.random() * 25 - 12);
                const scatterR = r + (Math.random() * 20 - 10);

                pg.g.style.transform = `translate(${scatterX}px, ${scatterY}px) rotate(${scatterR}deg)`;
                pg.g.classList.remove('hidden-part');
                pg.g.classList.add('visible-part');

                setTimeout(() => {
                    const bbox = pg.g.getBBox();
                    pg.label.setAttribute('x', String(bbox.x + bbox.width / 2));
                    pg.label.setAttribute('y', String(bbox.y + bbox.height + 15));
                    pg.label.classList.add('visible');
                }, 1000);
            }, index * 90);
        });
        updateStatus();
    }

    function reassembleViolin() {
        isExploded = false;
        document.getElementById('reassembleBtn').style.display = 'none';
        document.getElementById('violin-hint').style.display = '';

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

    svg.addEventListener('click', () => {
        if (isExploded) return;
        clickCount++;
        if (clickCount === 1) {
            clickTimer = setTimeout(() => { clickCount = 0; }, 400);
        } else if (clickCount >= 2) {
            clearTimeout(clickTimer);
            clickCount = 0;
            explodeViolin();
        }
    });

    document.getElementById('reassembleBtn').addEventListener('click', reassembleViolin);

    // =============================================
    // 4. PLAYABLE MODAL 
    // =============================================
    function initPluckModal() {
        const modal = document.getElementById('violinModal');
        const openBtn = document.getElementById('openViolinBtn');
        const closeBtn = document.getElementById('closeViolinBtn');
        const fbBox = document.getElementById('fingerboardBox');

        openBtn.addEventListener('click', () => modal.classList.add('open'));
        closeBtn.addEventListener('click', () => modal.classList.remove('open'));

        // Generate 4 strings for Karplus-Strong
        const stringsData = [
            { note: 'E5', label: 'E', offset: 76, color: '#f4f4f0' },
            { note: 'A4', label: 'A', offset: 69, color: '#d0d0d0' },
            { note: 'D4', label: 'D', offset: 62, color: '#aaada8' },
            { note: 'G3', label: 'G', offset: 55, color: '#c9a84c' }, // Gold bass string
        ];

        stringsData.forEach(sd => {
            const stringDOM = document.createElement('div');
            stringDOM.className = 'modal-string';

            // Add inner line
            const line = document.createElement('div');
            line.className = 'modal-string-line';
            line.style.background = sd.color;

            // Add letter label
            const label = document.createElement('div');
            label.style.position = 'absolute';
            label.style.left = '-30px';
            label.style.color = '#fff';
            label.style.fontFamily = 'Cinzel';
            label.textContent = sd.label;

            stringDOM.appendChild(line);
            stringDOM.appendChild(label);

            // Create invisible hover interaction blocks across the string
            for (let fret = 0; fret < 15; fret++) {
                const block = document.createElement('div');
                block.className = 'modal-string-hover-area';
                const midiNote = sd.offset + fret;

                block.addEventListener('mouseenter', (e) => {
                    if (e.buttons > 0) { // Click and drag (glissando)
                        window.playViolinNote(midiNote);
                        line.style.transform = `scaleY(3)`;
                        setTimeout(() => line.style.transform = `scaleY(1)`, 150);
                    }
                });
                block.addEventListener('mousedown', () => {
                    window.playViolinNote(midiNote);
                    line.style.transform = `scaleY(3)`;
                    setTimeout(() => line.style.transform = `scaleY(1)`, 150);
                });

                // Visual fret markers
                if (fret > 0) {
                    const marker = document.createElement('div');
                    marker.className = 'finger-marker';
                    marker.style.left = `${(fret / 15) * 100}%`;
                    fbBox.appendChild(marker);
                }
                stringDOM.appendChild(block);
            }

            fbBox.appendChild(stringDOM);
        });
    }

    initPluckModal();


    // =============================================
    // 5. FEATURES + BUTTONS + HOVER + STATUS
    // =============================================
    const statusEls = {};
    const leftCol = document.getElementById('leftLabels');
    const rightCol = document.getElementById('rightLabels');
    const panel = document.getElementById('feature-panel');
    const allPartGs = () => svg.querySelectorAll('.violin-part');
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

    // =============================================
    // 6. DEMO GENERATORS
    // =============================================
    function genericDemo(title, lines) {
        return `<svg viewBox="0 0 380 180"><text x="190" y="25" text-anchor="middle" fill="${INK}" font-size="13" font-weight="bold" font-family="'Cinzel',serif">${title}</text>${lines.map((l, i) => `<text x="190" y="${55 + i * 22}" text-anchor="middle" fill="${SEPIA}" font-size="11" font-family="'EB Garamond',serif">${l}</text>`).join('')}</svg>`;
    }

    function demoStrings() {
        return `<svg viewBox="0 0 300 200">
            <text x="150" y="25" text-anchor="middle" fill="${INK}" font-family="'Cinzel',serif">Karplus-Strong Algorithm</text>
            <text x="150" y="45" text-anchor="middle" fill="${SEPIA}" font-size="10">Pulsanda Cordae (Hover to Pluck)</text>
            <line x1="120" y1="180" x2="120" y2="70" class="sketch-bold demo-interactive" stroke="${GOLD}" onmouseover="window.playViolinNote(55, this)"/>
            <line x1="140" y1="180" x2="140" y2="70" class="sketch-line demo-interactive" stroke="${INK}" onmouseover="window.playViolinNote(62, this)"/>
            <line x1="160" y1="180" x2="160" y2="70" class="sketch-line demo-interactive" stroke="${INK}" onmouseover="window.playViolinNote(69, this)"/>
            <line x1="180" y1="180" x2="180" y2="70" class="sketch-thin demo-interactive" stroke="${INK}" onmouseover="window.playViolinNote(76, this)"/>
            <text x="120" y="195" text-anchor="middle" font-size="10" fill="${INK}">G</text>
            <text x="140" y="195" text-anchor="middle" font-size="10" fill="${INK}">D</text>
            <text x="160" y="195" text-anchor="middle" font-size="10" fill="${INK}">A</text>
            <text x="180" y="195" text-anchor="middle" font-size="10" fill="${INK}">E</text>
        </svg>`;
    }

    const customDemos = {
        'strings': demoStrings,
    };

    function openPanel(f, btn) {
        if (activeBtn) activeBtn.classList.remove('active');
        btn.classList.add('active'); activeBtn = btn;
        document.getElementById('featureTitle').textContent = f.title;
        document.getElementById('featureDesc').textContent = f.desc;

        let demoHtml = '';
        if (customDemos[f.id]) {
            demoHtml = customDemos[f.id]();
        } else {
            demoHtml = genericDemo(f.label.split('·')[0], [f.title]);
        }

        document.getElementById('featureDemo').innerHTML = demoHtml;
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
    // 7. QUILL WRITING ANIMATION
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

        const allEls = [...titles, ...Array.from(ornaments).slice(0, 1), ...lines, ...Array.from(dates), ...Array.from(ornaments).slice(1)];
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
    renderViolin();
    updateStatus();
    animateQuill();
});
