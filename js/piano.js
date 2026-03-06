/**
 * 大钢琴 — Grand Piano
 * Da Vinci sketch style, exploded parts view, feature explanations
 * Tone.js Karplus-Strong string synthesis
 */

let polySynth;
let audioInit = false;

// Global function to play note from inline SVG onClick
window.playPianoNote = async function (note = 60, el = null) {
    if (!audioInit) {
        await Tone.start();
        // Fallback or high quality sample piano over network
        polySynth = new Tone.Sampler({
            urls: {
                A0: "A0.mp3",
                C2: "C2.mp3",
                "D#3": "Ds3.mp3",
                "F#4": "Fs4.mp3",
                A5: "A5.mp3",
                C7: "C7.mp3",
            },
            release: 1.5,
            baseUrl: "https://tonejs.github.io/audio/salamander/"
        }).toDestination();
        polySynth.volume.value = 0;
        audioInit = true;
    }
    const freq = Tone.Frequency(note, "midi").toNote();
    if (polySynth.loaded || !polySynth.hasOwnProperty('loaded')) {
        polySynth.triggerAttackRelease(freq, "8n");
    }

    // Add visual flash effect
    if (el && el.setAttribute) {
        const origFill = el.getAttribute('fill') || "none";
        el.setAttribute('fill', '#daa520'); // Highlight Gold
        setTimeout(() => el.setAttribute('fill', origFill), 150);
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
    const svg = document.getElementById('piano-svg');
    const CX = 250, CY = 320;
    let isExploded = false;
    let clickCount = 0;
    let clickTimer = null;

    setTimeout(() => { const e = document.getElementById('entrance-overlay'); if (e) e.style.display = 'none'; }, 6500);

    // =============================================
    // 1. GENERATORS
    // =============================================
    function genKeys(cx, cy, width, height) {
        let whiteKeysHtml = '';
        let blackKeysHtml = '';
        const whiteKeyWidth = width / 52;
        let whiteIndex = 0;
        const notes = ['A', 'A#', 'B', 'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#'];

        // Draw 52 white keys
        for (let midi = 21; midi <= 108; midi++) {
            const noteName = notes[(midi - 21) % 12];
            if (!noteName.includes('#')) {
                const x = cx - width / 2 + whiteIndex * whiteKeyWidth;
                whiteKeysHtml += `<rect x="${x.toFixed(2)}" y="${cy}" width="${whiteKeyWidth.toFixed(2)}" height="${height}" class="sketch-stroke" fill="rgba(244,228,193,0.3)"/>`;
                whiteIndex++;
            }
        }

        // Draw 36 black keys
        whiteIndex = 0;
        for (let midi = 21; midi <= 108; midi++) {
            const noteName = notes[(midi - 21) % 12];
            if (noteName.includes('#')) {
                const x = cx - width / 2 + whiteIndex * whiteKeyWidth - whiteKeyWidth * 0.35;
                blackKeysHtml += `<rect x="${x.toFixed(2)}" y="${cy}" width="${(whiteKeyWidth * 0.7).toFixed(2)}" height="${height * 0.6}" class="sketch-fill" fill="${INK}" stroke="none"/>`;
            } else {
                whiteIndex++;
            }
        }
        return whiteKeysHtml + blackKeysHtml;
    }

    function genStrings() {
        let s = '';
        // Bass strings (diagonal)
        for (let i = 0; i < 15; i++) {
            s += `<line x1="${160 + i * 5}" y1="450" x2="${320 - i * 2}" y2="150" stroke="${GOLD}" stroke-width="0.8" opacity="0.6"/>`;
        }
        // Treble strings (straight)
        for (let i = 0; i < 40; i++) {
            s += `<line x1="${240 + i * 3}" y1="450" x2="${240 + i * 2.5}" y2="200" stroke="${INK}" stroke-width="0.4" opacity="0.4"/>`;
        }
        return s;
    }

    // =============================================
    // 2. PIANO PARTS DATA
    // =============================================
    const parts = [
        {
            id: 'lid', label: '顶盖 · Lid', side: 'left', external: true,
            explode: { x: -180, y: -20, r: -15 },
            svg: `<path d="M150,500 L360,500 C360,300 410,150 250,100 C150,150 150,300 150,500 Z" class="sketch-stroke"/>
                  <path d="M145,505 L365,505 C365,305 415,145 250,90 C145,145 145,305 145,505 Z" class="sketch-stroke" stroke-dasharray="2 4"/>`,
            title: '大顶盖 — OPERCVLVM', desc: '钢琴巨大的木制上盖，用于将琴弦和音板的声音反射向观众席。全开时能提供最宏大的音量。',
            demoNote: '🔄 支撑全开=完全反射\n🔇 闭合=音量柔和\n🎵 控制声音投射方向',
            details: '<h3>声学反射</h3><p>顶级三角钢琴的顶盖内部抛光极其平整，它就像一面声音的镜子，将由音板垂直向上的声波反射到水平方向的观众席。</p>'
        },
        {
            id: 'prop', label: '顶杆 · Prop Stick', side: 'left', external: true,
            explode: { x: -160, y: 150, r: 45 },
            svg: `<line x1="160" y1="350" x2="220" y2="450" class="sketch-bold"/>
                  <circle cx="160" cy="350" r="3" class="sketch-fill"/>`,
            title: '顶杆 — BACVLVS', desc: '支撑沉重顶盖的木杆，通常有长短两根以满足不同场合的音量需求。',
            demoNote: '📏 长杆用于音乐会\n📐 短杆用于室内伴奏\n⚠️ 必须确保完全卡入凹槽',
            details: '<h3>材质与功能</h3><p>由于大顶盖非常沉重，顶杆必须用坚硬的全实木制造，确保绝不断裂。错误放置可能引发严重的砸伤事故。</p>'
        },
        {
            id: 'rim', label: '外壳琴柱 · Rim', side: 'left', external: true,
            explode: { x: 120, y: 10, r: 5 },
            svg: `<path d="M155,490 L355,490 C355,310 400,160 250,110 C155,160 155,310 155,490 Z" class="sketch-fill" stroke-width="1.5"/>`,
            title: '外置琴壳 — LIMBVS', desc: '包裹整个钢琴框架的外圈弯壳，经过多层薄木板高压胶合压制而成，极为坚固。',
            demoNote: '🛡️ 极其坚固的木制弯壳\n🪵 多层实木薄板压制\n💪 承受数百斤铁骨重量',
            details: '<h3>制造工艺</h3><p>优质的三角钢琴弯壳需要将几十层木皮涂胶后，用特制机器一次性挤压弯曲成型，并在几个月内自然干燥定型以保证不形变。</p>'
        },
        {
            id: 'plate', label: '铁骨 · Iron Plate', side: 'right', external: false,
            explode: { x: 50, y: -80, r: -5 },
            svg: `<path d="M165,470 L345,470 C345,320 380,180 250,130 C165,180 165,320 165,470 Z" class="sketch-gold" fill="rgba(218,165,32,0.1)"/>
                  <circle cx="210" cy="200" r="15" class="sketch-gold"/>
                  <circle cx="250" cy="180" r="20" class="sketch-gold"/>
                  <circle cx="290" cy="210" r="18" class="sketch-gold"/>`,
            title: '纯铜/铁骨盆 — LAMINA FERREA', desc: '金光闪闪的铸铁框架，几乎占据整个琴身。它负责承受200多根琴弦拉紧后产生的近20吨的巨大张力。',
            demoNote: '🏋️ 承受近20吨拉力\n🔥 一体化翻砂铸造\n✨ 表面喷涂金色防锈涂层',
            details: '<h3>铸造工艺</h3><p>十九世纪前没有铁骨，钢琴张力有限，音量小。整体铸铁板的发明标志着现代三角钢琴的诞生，使得琴弦可以拉得更紧，音量大幅增加。</p>'
        },
        {
            id: 'soundboard', label: '音板 · Soundbd', side: 'right', external: false,
            explode: { x: -80, y: -60, r: 10 },
            svg: `<path d="M160,480 L350,480 C350,315 390,170 250,120 C160,170 160,315 160,480 Z" class="sketch-hatch"/>
                  ${[0, 1, 2, 3, 4, 5].map(i => `<line x1="160" y1="${450 - i * 60}" x2="330" y2="${420 - i * 60}" stroke="${INK}" stroke-width="0.3"/>`).join('')}`,
            title: '音板 — TABVLA RESONANS', desc: '整台钢琴发声的灵魂！位于铁骨下方的大片木板（通常是云杉）。弦的微小振动通过琴桥传递给音板，被数千倍地放大成为我们可以听到的宏亮琴声。',
            demoNote: '🔊 放大琴弦的微小振动\n🌲 精选高寒地带云杉木\n🎵 表面有一点隆起的弧度',
            details: '<h3>共鸣木</h3><p>顶级音板常常取材于树龄过百年的西加云杉，木纹须绝对笔直细密，这种木材在传导声音时能量损耗极小。</p>'
        },
        {
            id: 'bridge', label: '琴桥 · Bridge', side: 'right', external: false,
            explode: { x: 30, y: -120, r: -8 },
            svg: `<path d="M220,160 Q260,280 340,300" class="sketch-bold"/>
                  <path d="M180,200 Q200,350 310,400" class="sketch-bold"/>`,
            title: '琴桥 — PONS', desc: '粘在音板上的弯曲木条。所有琴弦都紧紧压在琴桥上，弦的振动通过它传导给音板。',
            demoNote: '🌉 连接琴弦与音板\n🪵 坚固的枫木制成\n📌 上面有金属桥钉精准定位',
            details: '<h3>能量传递</h3><p>琴桥就如同小提琴上的琴码。如果琴桥和音板分离哪怕一毫米，钢琴的声音也会瞬间变得沉闷无力。</p>'
        },
        {
            id: 'strings', label: '琴弦 · Strings', side: 'right', external: false,
            explode: { x: 80, y: -40, r: 0 },
            svg: `<g id="strings-group">${genStrings()}</g>`,
            title: '琴弦 — CHORDA', desc: '发声源。共约220-230根高碳钢丝，低音区还会缠绕紫铜丝。中高音通常由三根弦发同一个音。',
            demoNote: '🎶 卡普拉斯-斯特朗发生器\n🔧 高强度碳钢丝\n🎸 低音缠绕紫铜圈',
            details: '<h3>三弦一音</h3><p>为了音量和音色的丰满，中高音区的每个音由三根弦组成。如果有一根弦的音准偏离，琴声就会非常混浊难听。</p>'
        },
        {
            id: 'dampers', label: '制音器 · Dampers', side: 'left', external: false,
            explode: { x: -30, y: 120, r: 8 },
            svg: `<g opacity="0.8">
                  ${[0, 1, 2, 3, 4, 5, 6].map(i => `<rect x="${180 + i * 22}" y="420" width="10" height="20" class="sketch-fill" fill="${INK}"/>`).join('')}
                  </g>`,
            title: '制音器 — SILENTIVM', desc: '覆盖在琴弦上的呢绒方块。平时压在弦上阻止振动，按下琴键时抬起让对应音发声，松开时落下让琴音立即停止。',
            demoNote: '🛑 压住琴弦防止发声\n🔺 按键时抬起\n🔻 松手时落下止音',
            details: '<h3>止音呢</h3><p>采用特制的羊毛呢，能够瞬间吸收琴弦强大的能量，不产生任何杂音。极高音区不需要制音器，因为能量小散失快。</p>'
        },
        {
            id: 'hammers', label: '弦槌 · Hammers', side: 'left', external: false,
            explode: { x: -60, y: 160, r: -5 },
            svg: `<g>
                  ${[0, 1, 2, 3, 4, 5, 6].map(i => `<circle cx="${185 + i * 22}" cy="460" r="6" class="sketch-bold"/>
                                              <line x1="${185 + i * 22}" y1="460" x2="${185 + i * 22}" y2="480" class="sketch-thin"/>`).join('')}
                  </g>`,
            title: '弦槌（音槌）— MALLEVS', desc: '包覆高密度羊毛毡的小锤。按下琴键时，弦槌被弹射出去撞击琴弦。力度大小决定了音量。',
            demoNote: '🔨 撞击琴弦发声\n🐑 特制高密度羊毛毡\n⚡ "抛射"击弦而非硬推',
            details: '<h3>整音(Voicing)</h3><p>调音师会用细针扎弦槌的羊毛毡，改变其硬度，以此来调控钢琴的音色，使其变得更清脆或更柔和。</p>'
        },
        {
            id: 'action', label: '击弦机 · Action', side: 'right', external: false,
            explode: { x: 140, y: 140, r: 15 },
            svg: `<g>
                  <rect x="150" y="475" width="200" height="15" class="sketch-fill"/>
                  <line x1="150" y1="482" x2="350" y2="482" stroke-dasharray="2 2" stroke="${INK}"/>
                  </g>`,
            title: '击弦机 — MECHANISMVS', desc: '最复杂的心脏！多达七千多个精密零件组成，将琴键的一厘米下压，转化为弦槌的高速击弦动作。具有"擒纵"及"复位"功能。',
            demoNote: '⚙️ 单键有几十个零件\n⚡ 杠杆原理放大力量与速度\n🔄 具有擒纵和双重震奏功能',
            details: '<h3>双簧震奏(Double Escapement)</h3><p>1821年塞巴斯蒂安·埃拉尔发明的机械构造，允许琴键在未完全抬起的情况下再次极速敲击连奏，是现代钢琴的神奇技术。</p>'
        },
        {
            id: 'keys', label: '键盘 · Keys', side: 'left', external: true,
            explode: { x: 0, y: 200, r: 0 },
            svg: `<g id="keyboard-gen">${genKeys(250, 520, 360, 45)}</g>`,
            title: '键盘 — CLAVIATVRA', desc: '演奏者和钢琴交互的界面，标准的88键。现代琴键为木制，表面贴象牙替代品（白键）与乌木（黑键）。',
            demoNote: '🎹 52白键 + 36黑键 = 88键\n🪵 以云杉木作为按键芯材\n⚖️ 需要精确复杂的键盘配重',
            details: '<h3>铅块配重</h3><p>制琴师会在每个木键侧面嵌入铅块，以确保从低音到高音，琴键的按压阻力有一个平滑且极具手感的递减梯度曲线。</p>'
        },
        {
            id: 'pedals', label: '踏板 · Pedals', side: 'right', external: true,
            explode: { x: 60, y: 220, r: 10 },
            svg: `<rect x="225" y="580" width="50" height="20" rx="3" class="sketch-stroke"/>
                  <rect x="230" y="590" width="10" height="25" rx="5" class="sketch-bold"/>
                  <rect x="245" y="590" width="10" height="25" rx="5" class="sketch-bold"/>
                  <rect x="260" y="590" width="10" height="25" rx="5" class="sketch-bold"/>`,
            title: '踏板 — PEDALIA', desc: '用脚控制声音的机关。一般有三个：延音踏板(右)、选择延音踏板(中)、柔音踏板(左)。',
            demoNote: '🦶 控制音色与余音延时\n➡️ 右：使制音器全部抬起\n⬅️ 左：使锤子稍移敲击两根弦',
            details: '<h3>延音踏板 (Sustain Pedal)</h3><p>右边的延音踏板最为常用，它让所有的制音器抬离琴弦，此时不仅弹下的音不停止，所有的未弹琴弦也会跟着引发泛音共振，极大丰富了音色。</p>'
        }
    ];

    const partGroups = {};

    function renderPiano() {
        parts.forEach((p, idx) => {
            const g = document.createElementNS(NS, 'g');
            g.setAttribute('id', 'part-' + p.id);
            g.setAttribute('class', `piano-part highlightable ${p.external ? 'visible-part' : 'hidden-part'}`);
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
    function explodePiano() {
        isExploded = true;
        document.getElementById('reassembleBtn').style.display = '';
        document.getElementById('piano-hint').style.display = 'none';

        parts.forEach((p, index) => {
            setTimeout(() => {
                const pg = partGroups[p.id];
                const { x, y, r } = p.explode;
                const scatterX = x + (Math.random() * 20 - 10);
                const scatterY = y + (Math.random() * 20 - 10);
                const scatterR = r + (Math.random() * 15 - 8);

                pg.g.style.transform = `translate(${scatterX}px, ${scatterY}px) rotate(${scatterR}deg)`;
                pg.g.classList.remove('hidden-part');
                pg.g.classList.add('visible-part');

                setTimeout(() => {
                    const bbox = pg.g.getBBox();
                    pg.label.setAttribute('x', String(bbox.x + bbox.width / 2));
                    pg.label.setAttribute('y', String(bbox.y + bbox.height + 15));
                    pg.label.classList.add('visible');
                }, 1000);
            }, index * 80);
        });
        updateStatus();
    }

    function reassemblePiano() {
        isExploded = false;
        document.getElementById('reassembleBtn').style.display = 'none';
        document.getElementById('piano-hint').style.display = '';

        parts.forEach((p, index) => {
            setTimeout(() => {
                const pg = partGroups[p.id];
                pg.g.style.transform = '';
                pg.label.classList.remove('visible');
                if (!p.external) {
                    setTimeout(() => pg.g.classList.add('hidden-part'), 1000);
                    setTimeout(() => pg.g.classList.remove('visible-part'), 1000);
                }
            }, (parts.length - index) * 50);
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
            explodePiano();
        }
    });

    document.getElementById('reassembleBtn').addEventListener('click', reassemblePiano);

    // =============================================
    // 3.5 MODAL KEYBOARD INITTIALIZATION
    // =============================================
    function initModalKeyboard() {
        const kbContainer = document.getElementById('playableKeyboardInner');
        if (!kbContainer) return;

        const notes = ['A', 'A#', 'B', 'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#'];
        let whiteKeyOffset = 0;
        const keyWidth = 30; // standard white key width

        for (let midi = 21; midi <= 108; midi++) {
            const noteName = notes[(midi - 21) % 12];
            const isBlack = noteName.includes('#');

            const keyEl = document.createElement('div');
            keyEl.dataset.midi = midi;

            if (isBlack) {
                keyEl.className = 'play-key black-key';
                keyEl.style.left = `${whiteKeyOffset * keyWidth - 9}px`;
            } else {
                keyEl.className = 'play-key white-key';
                keyEl.style.left = `${whiteKeyOffset * keyWidth}px`;
                whiteKeyOffset++;
            }

            keyEl.addEventListener('mousedown', () => {
                keyEl.classList.add('active-key');
                window.playPianoNote(midi);
            });
            keyEl.addEventListener('mouseup', () => keyEl.classList.remove('active-key'));
            keyEl.addEventListener('mouseleave', () => keyEl.classList.remove('active-key'));

            // Mobile support
            keyEl.addEventListener('touchstart', (e) => {
                e.preventDefault();
                keyEl.classList.add('active-key');
                window.playPianoNote(midi);
            });
            keyEl.addEventListener('touchend', (e) => {
                e.preventDefault();
                keyEl.classList.remove('active-key');
            });

            kbContainer.appendChild(keyEl);
        }

        // Set inner width to fit exactly 52 white keys
        kbContainer.style.width = `${whiteKeyOffset * keyWidth}px`;

        const openBtn = document.getElementById('openKeyboardBtn');
        const closeBtn = document.getElementById('closeKeyboardBtn');
        const modal = document.getElementById('keyboardModal');

        openBtn.addEventListener('click', () => {
            modal.classList.add('open');
        });

        closeBtn.addEventListener('click', () => {
            modal.classList.remove('open');
        });
    }

    initModalKeyboard();

    // =============================================
    // 4. FEATURES + BUTTONS + HOVER + STATUS
    // =============================================
    const statusEls = {};
    const leftCol = document.getElementById('leftLabels');
    const rightCol = document.getElementById('rightLabels');
    const panel = document.getElementById('feature-panel');
    const allPartGs = () => svg.querySelectorAll('.piano-part');
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
    // 5. DEMO GENERATORS (Midi interactive Tone.js!)
    // =============================================
    function genericDemo(title, lines) {
        return `<svg viewBox="0 0 380 180"><text x="190" y="25" text-anchor="middle" fill="${INK}" font-size="13" font-weight="bold" font-family="'Cinzel',serif">${title}</text>${lines.map((l, i) => `<text x="190" y="${55 + i * 22}" text-anchor="middle" fill="${SEPIA}" font-size="11" font-family="'EB Garamond',serif">${l}</text>`).join('')}</svg>`;
    }

    function demoKeys() {
        return `<svg viewBox="0 0 300 150">
            <text x="150" y="20" text-anchor="middle" fill="${INK}" font-family="'Cinzel',serif">Interactive Keys (Click!)</text>
            <g transform="translate(60, 40)">
                <rect x="0" y="0" width="25" height="100" class="sketch-line demo-interactive" fill="#fff" onclick="window.playPianoNote(60, this)"/>
                <rect x="25" y="0" width="25" height="100" class="sketch-line demo-interactive" fill="#fff" onclick="window.playPianoNote(62, this)"/>
                <rect x="50" y="0" width="25" height="100" class="sketch-line demo-interactive" fill="#fff" onclick="window.playPianoNote(64, this)"/>
                <rect x="75" y="0" width="25" height="100" class="sketch-line demo-interactive" fill="#fff" onclick="window.playPianoNote(65, this)"/>
                <rect x="100" y="0" width="25" height="100" class="sketch-line demo-interactive" fill="#fff" onclick="window.playPianoNote(67, this)"/>
                <rect x="125" y="0" width="25" height="100" class="sketch-line demo-interactive" fill="#fff" onclick="window.playPianoNote(69, this)"/>
                <rect x="150" y="0" width="25" height="100" class="sketch-line demo-interactive" fill="#fff" onclick="window.playPianoNote(71, this)"/>
                
                <rect x="18" y="0" width="14" height="60" fill="${INK}" class="sketch-line demo-interactive" onclick="window.playPianoNote(61, this)"/>
                <rect x="43" y="0" width="14" height="60" fill="${INK}" class="sketch-line demo-interactive" onclick="window.playPianoNote(63, this)"/>
                
                <rect x="93" y="0" width="14" height="60" fill="${INK}" class="sketch-line demo-interactive" onclick="window.playPianoNote(66, this)"/>
                <rect x="118" y="0" width="14" height="60" fill="${INK}" class="sketch-line demo-interactive" onclick="window.playPianoNote(68, this)"/>
                <rect x="143" y="0" width="14" height="60" fill="${INK}" class="sketch-line demo-interactive" onclick="window.playPianoNote(70, this)"/>
            </g>
        </svg>`;
    }

    function demoStrings() {
        return `<svg viewBox="0 0 300 200">
            <text x="150" y="25" text-anchor="middle" fill="${INK}" font-family="'Cinzel',serif">Real Sounds from Network</text>
            <text x="150" y="45" text-anchor="middle" fill="${SEPIA}" font-size="10">Ad Corda Pulsanda</text>
            <line x1="100" y1="180" x2="150" y2="70" class="sketch-bold demo-interactive" stroke="${GOLD}" onclick="window.playPianoNote(48, this)"/>
            <line x1="120" y1="180" x2="165" y2="70" class="sketch-line demo-interactive" stroke="${INK}" onclick="window.playPianoNote(55, this)"/>
            <line x1="140" y1="180" x2="180" y2="70" class="sketch-line demo-interactive" stroke="${INK}" onclick="window.playPianoNote(60, this)"/>
            <line x1="160" y1="180" x2="195" y2="70" class="sketch-line demo-interactive" stroke="${INK}" onclick="window.playPianoNote(64, this)"/>
            <line x1="180" y1="180" x2="210" y2="70" class="sketch-line demo-interactive" stroke="${INK}" onclick="window.playPianoNote(67, this)"/>
            <text x="150" y="195" text-anchor="middle" fill="${INK}" font-size="10">Hover & Click to Play Tone.Sampler</text>
        </svg>`;
    }

    function demoAction() {
        return `<svg viewBox="0 0 350 200">
            <text x="175" y="20" text-anchor="middle" fill="${INK}" font-family="'Cinzel',serif">Action Mechanism</text>
            <g transform="translate(60, 60)">
                <rect x="0" y="80" width="80" height="15" fill="none" stroke="${INK}"/>
                <!-- Wippen -->
                <line x1="40" y1="80" x2="60" y2="40" class="sketch-bold" />
                <!-- Hammer shank -->
                <line x1="10" y1="40" x2="120" y2="20" class="sketch-line" stroke="${GOLD}">
                    <animateTransform attributeName="transform" type="rotate" from="0 10 40" to="-15 10 40" dur="1s" repeatCount="indefinite"/>
                </line>
                <!-- Hammer head -->
                <circle cx="120" cy="20" r="8" fill="${INK}">
                    <animateTransform attributeName="transform" type="rotate" from="0 10 40" to="-15 10 40" dur="1s" repeatCount="indefinite"/>
                </circle>
                <!-- String -->
                <line x1="0" y1="0" x2="150" y2="0" stroke="${GOLD}" stroke-width="2"/>
            </g>
            <text x="175" y="190" text-anchor="middle" fill="${SEPIA}" font-size="11">Double Escapement Geometry</text>
        </svg>`;
    }

    const customDemos = {
        'keys': demoKeys,
        'strings': demoStrings,
        'action': demoAction
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
    // 6. QUILL WRITING ANIMATION
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
    renderPiano();
    updateStatus();
    animateQuill();
});
