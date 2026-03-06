/**
 * Calibre 89 — Patek Philippe Grand Complication
 * Star chart, sub-dials, astronomy, hover highlights, demos.
 */
document.addEventListener('DOMContentLoaded', () => {
    const NS = 'http://www.w3.org/2000/svg';
    const GOLD = '#c9a84c';
    const GOLDF = 'rgba(201,168,76,';
    const svg = document.getElementById('watch-svg');
    const LAT = 46.2, LON = 6.15; // Geneva

    setTimeout(() => { const e = document.getElementById('entrance-overlay'); if (e) e.style.display = 'none'; }, 7200);

    // ==================== ASTRONOMY ====================
    function jd(y, m, d) { if (m <= 2) { y--; m += 12; } const A = Math.floor(y / 100); return Math.floor(365.25 * (y + 4716)) + Math.floor(30.6001 * (m + 1)) + d + 2 - A + Math.floor(A / 4) - 1524.5; }
    function sunLon(dt) { const h = dt.getHours() + dt.getMinutes() / 60 + dt.getSeconds() / 3600; const J = jd(dt.getFullYear(), dt.getMonth() + 1, dt.getDate() + h / 24); const T = (J - 2451545) / 36525; const M = (357.5291 + 35999.0503 * T) * Math.PI / 180; return ((280.4665 + 36000.7698 * T + (1.9146 - 0.0048 * T) * Math.sin(M) + 0.02 * Math.sin(2 * M)) % 360 + 360) % 360; }
    function sunDecl(dt) { return Math.asin(Math.sin(23.4393 * Math.PI / 180) * Math.sin(sunLon(dt) * Math.PI / 180)) * 180 / Math.PI; }
    function eqOfTime(dt) { const h = dt.getHours() + dt.getMinutes() / 60; const J = jd(dt.getFullYear(), dt.getMonth() + 1, dt.getDate() + h / 24); const T = (J - 2451545) / 36525; const L0 = (280.4665 + 36000.7698 * T) * Math.PI / 180; const M = (357.5291 + 35999.0503 * T) * Math.PI / 180; const e = 0.016709 - 0.000042 * T; const y = Math.pow(Math.tan(23.4393 / 2 * Math.PI / 180), 2); let E = y * Math.sin(2 * L0) - 2 * e * Math.sin(M) + 4 * e * y * Math.sin(M) * Math.cos(2 * L0) - 0.5 * y * y * Math.sin(4 * L0) - 1.25 * e * e * Math.sin(2 * M); return E * 180 / Math.PI * 4; }
    function sunriseSet(dt, lat) { const d = sunDecl(dt) * Math.PI / 180; const l = lat * Math.PI / 180; const ha = Math.acos((Math.sin(-0.8333 * Math.PI / 180) - Math.sin(l) * Math.sin(d)) / (Math.cos(l) * Math.cos(d))); const noon = 12 - LON / 15; const eot = eqOfTime(dt) / 60; const rise = noon - ha * 180 / Math.PI / 15 - eot; const set = noon + ha * 180 / Math.PI / 15 - eot; return { rise, set }; }
    function sidDeg(dt) { const J = jd(dt.getFullYear(), dt.getMonth() + 1, dt.getDate()); const T = (J - 2451545) / 36525; let G = 280.46062 + 360.98565 * (J - 2451545) + 0.00039 * T * T; G += (dt.getHours() + dt.getMinutes() / 60 + dt.getSeconds() / 3600) * 15 + LON; return ((G % 360) + 360) % 360; }
    function moonPhase(dt) { const J = jd(dt.getFullYear(), dt.getMonth() + 1, dt.getDate() + dt.getHours() / 24); let p = ((J - 2451550.1) % 29.530588) / 29.530588; return p < 0 ? p + 1 : p; }
    function easterDate(year) { const a = year % 19, b = Math.floor(year / 100), c = year % 100; const d = Math.floor(b / 4), e = b % 4, f = Math.floor((b + 8) / 25), g = Math.floor((b - f + 1) / 3); const h = (19 * a + b - d - g + 15) % 30, i = Math.floor(c / 4), k = c % 4; const l = (32 + 2 * e + 2 * i - h - k) % 7; const m = Math.floor((a + 11 * h + 22 * l) / 451); const month = Math.floor((h + l - 7 * m + 114) / 31), day = ((h + l - 7 * m + 114) % 31) + 1; return { month, day }; }
    function moonPhaseName(p) { if (p < 0.03 || p > 0.97) return '🌑 Nouvelle Lune'; if (p < 0.22) return '🌒 Croissant'; if (p < 0.28) return '🌓 Premier Quartier'; if (p < 0.47) return '🌔 Gibbeuse'; if (p < 0.53) return '🌕 Pleine Lune'; if (p < 0.72) return '🌖 Gibbeuse Déc.'; if (p < 0.78) return '🌗 Dernier Quartier'; return '🌘 Décroissant'; }

    // ==================== SVG GENERATION ====================
    const zSymbols = ['♈', '♉', '♊', '♋', '♌', '♍', '♎', '♏', '♐', '♑', '♒', '♓'];
    const zNamesFr = ['Bélier', 'Taureau', 'Gémeaux', 'Cancer', 'Lion', 'Vierge', 'Balance', 'Scorpion', 'Sagittaire', 'Capricorne', 'Verseau', 'Poissons'];
    const months = ['JANVIER', 'FÉVRIER', 'MARS', 'AVRIL', 'MAI', 'JUIN', 'JUILLET', 'AOÛT', 'SEPTEMBRE', 'OCTOBRE', 'NOVEMBRE', 'DÉCEMBRE'];
    const seasons = [{ name: 'PRINTEMPS', start: 2, span: 3, color: 'rgba(100,180,100,0.12)' }, { name: 'ÉTÉ', start: 5, span: 3, color: 'rgba(200,180,60,0.12)' }, { name: 'AUTOMNE', start: 8, span: 3, color: 'rgba(180,100,50,0.12)' }, { name: 'HIVER', start: 11, span: 3, color: 'rgba(80,130,200,0.12)' }];

    // Season arcs
    const sArcs = document.getElementById('season-arcs');
    const sLabels = document.getElementById('season-labels');
    if (sArcs && sLabels) seasons.forEach((s, i) => {
        const a1 = (s.start * 30 - 90) * Math.PI / 180, a2 = ((s.start + s.span) * 30 - 90) * Math.PI / 180;
        const amid = ((s.start + s.span / 2) * 30 - 90) * Math.PI / 180;
        const p = document.createElementNS(NS, 'path');
        const r1 = 480, r2 = 455;
        const x1s = r1 * Math.cos(a1), y1s = r1 * Math.sin(a1), x1e = r1 * Math.cos(a2), y1e = r1 * Math.sin(a2);
        const x2s = r2 * Math.cos(a2), y2s = r2 * Math.sin(a2), x2e = r2 * Math.cos(a1), y2e = r2 * Math.sin(a1);
        p.setAttribute('d', `M${x1s},${y1s} A${r1},${r1} 0 0,1 ${x1e},${y1e} L${x2s},${y2s} A${r2},${r2} 0 0,0 ${x2e},${y2e} Z`);
        p.setAttribute('fill', s.color); p.setAttribute('stroke', 'none'); sArcs.appendChild(p);
        const t = document.createElementNS(NS, 'text');
        t.setAttribute('x', String(467 * Math.cos(amid))); t.setAttribute('y', String(467 * Math.sin(amid) + 3));
        t.setAttribute('text-anchor', 'middle'); t.setAttribute('class', 'season-text');
        t.setAttribute('transform', `rotate(${(s.start + s.span / 2) * 30},${467 * Math.cos(amid)},${467 * Math.sin(amid)})`);
        t.textContent = s.name; sLabels.appendChild(t);
    });

    // Zodiac + Month ring
    const zG = document.getElementById('zodiac-signs'), mG = document.getElementById('month-labels');
    if (zG && mG) for (let i = 0; i < 12; i++) {
        const a1 = (i * 30 - 90) * Math.PI / 180, amid = ((i + 0.5) * 30 - 90) * Math.PI / 180;
        const dl = document.createElementNS(NS, 'line');
        dl.setAttribute('x1', String(453 * Math.cos(a1))); dl.setAttribute('y1', String(453 * Math.sin(a1)));
        dl.setAttribute('x2', String(395 * Math.cos(a1))); dl.setAttribute('y2', String(395 * Math.sin(a1)));
        dl.setAttribute('stroke', GOLD); dl.setAttribute('stroke-width', '0.5'); zG.appendChild(dl);
        const zt = document.createElementNS(NS, 'text');
        zt.setAttribute('x', String(434 * Math.cos(amid))); zt.setAttribute('y', String(434 * Math.sin(amid) + 5));
        zt.setAttribute('text-anchor', 'middle'); zt.setAttribute('class', 'zodiac-text');
        zt.textContent = zSymbols[i]; zG.appendChild(zt);
        const mt = document.createElementNS(NS, 'text');
        mt.setAttribute('x', String(405 * Math.cos(amid))); mt.setAttribute('y', String(405 * Math.sin(amid) + 3));
        mt.setAttribute('text-anchor', 'middle'); mt.setAttribute('class', 'month-text');
        mt.textContent = months[i]; mG.appendChild(mt);
    }

    // 24h sidereal scale
    const sScale = document.getElementById('sidereal-scale');
    if (sScale) for (let i = 0; i < 24; i++) {
        const a = (i * 15 - 90) * Math.PI / 180;
        const t = document.createElementNS(NS, 'text');
        t.setAttribute('x', String(379 * Math.cos(a))); t.setAttribute('y', String(379 * Math.sin(a) + 4));
        t.setAttribute('text-anchor', 'middle'); t.setAttribute('class', 'sidereal-num');
        t.textContent = String(i + 1); sScale.appendChild(t);
        for (let j = 1; j < 5; j++) {
            const ta = (i * 15 + j * 3 - 90) * Math.PI / 180; const tl = document.createElementNS(NS, 'line');
            tl.setAttribute('x1', String(365 * Math.cos(ta))); tl.setAttribute('y1', String(365 * Math.sin(ta)));
            tl.setAttribute('x2', String(370 * Math.cos(ta))); tl.setAttribute('y2', String(370 * Math.sin(ta)));
            tl.setAttribute('stroke', GOLDF + '0.3)'); tl.setAttribute('stroke-width', '0.3'); sScale.appendChild(tl);
        }
    }

    // Stars (~200)
    const starField = document.getElementById('star-field');
    if (starField) {
        const rng = n => Math.random() * n; for (let i = 0; i < 200; i++) {
            const angle = rng(Math.PI * 2), r = rng(350);
            const x = r * Math.cos(angle), y = r * Math.sin(angle); const c = document.createElementNS(NS, 'circle');
            c.setAttribute('cx', String(x)); c.setAttribute('cy', String(y));
            const mag = 0.3 + rng(1.8); c.setAttribute('r', String(mag));
            c.setAttribute('fill', rng(1) > 0.8 ? '#ffe8a0' : rng(1) > 0.5 ? '#e8e8ff' : '#ffffff');
            c.setAttribute('opacity', String(0.3 + rng(0.7))); c.setAttribute('class', 'star');
            if (rng(1) > 0.7) c.style.animation = `twinkle ${2 + rng(4)}s ${rng(3)}s infinite`;
            starField.appendChild(c);
        }
    }

    // Sub-dial ticks
    function addSubTicks(gId, r, count) {
        const g = document.getElementById(gId); if (!g) return;
        for (let i = 0; i < count; i++) {
            const a = (i * (360 / count) - 90) * Math.PI / 180; const l = document.createElementNS(NS, 'line');
            l.setAttribute('x1', String(r * Math.cos(a))); l.setAttribute('y1', String(r * Math.sin(a)));
            l.setAttribute('x2', String((r - 5) * Math.cos(a))); l.setAttribute('y2', String((r - 5) * Math.sin(a)));
            l.setAttribute('stroke', GOLDF + '0.4)'); l.setAttribute('stroke-width', '0.3'); g.appendChild(l);
        }
    }
    addSubTicks('sunrise-ticks', 55, 24); addSubTicks('sunset-ticks', 55, 24);
    addSubTicks('eot-ticks', 45, 30); addSubTicks('sid-ticks', 45, 24);

    // ==================== REAL-TIME CLOCK ====================
    const statusEls = {};
    const mainSidH = document.getElementById('main-sid-hand');
    const planisphere = document.getElementById('star-field');
    const cardinals = document.querySelectorAll('.cardinal-label');
    const ecliptic = document.getElementById('hl-ecliptic');
    const horizonLine = document.getElementById('hl-horizon-line');
    const moonShadow = document.getElementById('moon-shadow');
    const sunriseHand = document.getElementById('sunrise-hand');
    const sunsetHand = document.getElementById('sunset-hand');
    const eotHand = document.getElementById('eot-hand');
    const sidHourH = document.getElementById('sid-hour-hand');
    const sidMinH = document.getElementById('sid-min-hand');

    function tick() {
        const now = new Date();
        const h = now.getHours(), m = now.getMinutes(), s = now.getSeconds(), ms = now.getMilliseconds();
        // Main hands
        const hourA = ((h % 12) + m / 60) * 30;
        const minA = (m + s / 60) * 6;
        const secA = (s + ms / 1000) * 6;
        const hEl = document.getElementById('hl-hour-hand');
        const mEl = document.getElementById('hl-minute-hand');
        const sEl = document.getElementById('hl-second-hand');
        if (hEl) hEl.setAttribute('transform', `rotate(${hourA})`);
        if (mEl) mEl.setAttribute('transform', `rotate(${minA})`);
        if (sEl) sEl.setAttribute('transform', `rotate(${secA})`);

        // Sidereal hand (main)
        const sid = sidDeg(now);
        if (mainSidH) mainSidH.setAttribute('transform', `rotate(${sid})`);

        // Planisphere rotation (sidereal)
        if (planisphere) planisphere.setAttribute('transform', `rotate(${-sid})`);
        cardinals.forEach(c => c.setAttribute('transform', ''));
        if (ecliptic) ecliptic.setAttribute('transform', `rotate(${-23.44 - sid * 0.002})`);

        // Sub-dials
        const ss = sunriseSet(now, LAT);
        if (sunriseHand) { const a = (ss.rise / 24) * 360 - 90; sunriseHand.setAttribute('transform', `rotate(${a})`); }
        if (sunsetHand) { const a = (ss.set / 24) * 360 - 90; sunsetHand.setAttribute('transform', `rotate(${a})`); }
        const pad = n => String(Math.floor(n)).padStart(2, '0');
        const riseStr = pad(ss.rise) + ':' + pad((ss.rise % 1) * 60);
        const setStr = pad(ss.set) + ':' + pad((ss.set % 1) * 60);
        const riseV = document.getElementById('sunrise-val'); if (riseV) riseV.textContent = riseStr;
        const setV = document.getElementById('sunset-val'); if (setV) setV.textContent = setStr;

        // Equation of time
        const eot = eqOfTime(now);
        if (eotHand) { const a = eot * 6; eotHand.setAttribute('transform', `rotate(${a})`); }
        const eotV = document.getElementById('eot-val'); if (eotV) eotV.textContent = (eot > 0 ? '+' : '') + eot.toFixed(1) + 'min';

        // Sidereal sub-dial
        const sidH_val = sid / 15;
        const sidHr = Math.floor(sidH_val) % 24;
        const sidMn = Math.floor((sidH_val % 1) * 60);
        if (sidHourH) sidHourH.setAttribute('transform', `rotate(${(sidHr % 12 + sidMn / 60) * 30})`);
        if (sidMinH) sidMinH.setAttribute('transform', `rotate(${sidMn * 6})`);
        const sidV = document.getElementById('sid-val'); if (sidV) sidV.textContent = pad(sidHr) + 'h' + pad(sidMn) + 'm';

        // Easter
        const easter = easterDate(now.getFullYear());
        const easterEl = document.getElementById('easter-date');
        if (easterEl) easterEl.textContent = easter.day + ' ' + months[easter.month - 1].slice(0, 3);
        const easterN = document.getElementById('easter-next');
        const nextE = easterDate(now.getFullYear() + 1);
        if (easterN) easterN.textContent = 'Prochain: ' + nextE.day + '/' + nextE.month + '/' + (now.getFullYear() + 1);

        // Moon phase
        const mp = moonPhase(now);
        if (moonShadow) { const off = mp <= 0.5 ? mp * 2 : (1 - mp) * 2; moonShadow.setAttribute('x', String(-16 + off * 32)); moonShadow.setAttribute('width', String(32 - off * 32)); }

        // Button status updates
        const sLon = sunLon(now);
        const zIdx = Math.floor(sLon / 30);
        if (statusEls.planisphere) statusEls.planisphere.textContent = `旋转 ${sid.toFixed(0)}°`;
        if (statusEls.seasons) { const si = now.getMonth() < 2 || now.getMonth() > 10 ? 'HIVER' : now.getMonth() < 5 ? 'PRINTEMPS' : now.getMonth() < 8 ? 'ÉTÉ' : 'AUTOMNE'; statusEls.seasons.textContent = si; }
        if (statusEls.zodiac) statusEls.zodiac.textContent = zSymbols[zIdx] + ' ' + zNamesFr[zIdx];
        if (statusEls.sidereal24) statusEls.sidereal24.textContent = pad(sidHr) + 'h' + pad(sidMn) + 'm';
        if (statusEls.sunrise) statusEls.sunrise.textContent = '↑ ' + riseStr;
        if (statusEls.sunset) statusEls.sunset.textContent = '↓ ' + setStr;
        if (statusEls.equation) statusEls.equation.textContent = (eot > 0 ? '+' : '') + eot.toFixed(1) + ' min';
        if (statusEls.siderealDial) statusEls.siderealDial.textContent = pad(sidHr) + ':' + pad(sidMn);
        if (statusEls.easter) statusEls.easter.textContent = easter.day + '/' + easter.month;
        if (statusEls.moon) statusEls.moon.textContent = moonPhaseName(mp).split(' ')[0];
        if (statusEls.hands) statusEls.hands.textContent = pad(h) + ':' + pad(m) + ':' + pad(s);
        if (statusEls.hourHand) statusEls.hourHand.textContent = pad(h) + ':' + pad(m);
        if (statusEls.minuteHand) statusEls.minuteHand.textContent = pad(m) + ':' + pad(s);
        if (statusEls.eclipticLine) statusEls.eclipticLine.textContent = '倾角 23.44°';
        if (statusEls.horizonSt) statusEls.horizonSt.textContent = 'Genève 46.2°N';
        if (statusEls.caseSt) statusEls.caseSt.textContent = '1989 · 33功能';
        requestAnimationFrame(tick);
    }
    setTimeout(tick, 7500);

    // ==================== FEATURES ====================
    const GD = '#c9a84c', MN = '#0a1a3a';
    const features = [
        {
            side: 'left', label: '星空图 · Planisphère', hlIds: ['hl-planisphere'], statusKey: 'planisphere',
            title: '星空图 — PLANISPHÈRE CÉLESTE',
            desc: '中心深蓝色圆盘是一幅星空图(天球平面投影)，包含约200颗亮星。它按照恒星时缓慢旋转(23小时56分转一圈)，精确模拟日内瓦夜空中星星的位置。仰头对照，你就能找到真实的星座！',
            demoNote: '🌌 深蓝圆盘 = 天球投影\n⭐ ~200颗亮星(随机分布)\n🔄 按恒星时旋转(比太阳日快~4分钟)\n📍 模拟日内瓦(46.2°N)夜空',
            demo: () => `<svg viewBox="-200 -200 400 400"><circle r="180" fill="${MN}"/>${Array.from({ length: 60 }, () => { const a = Math.random() * Math.PI * 2, r = Math.random() * 170; return `<circle cx="${r * Math.cos(a)}" cy="${r * Math.sin(a)}" r="${0.5 + Math.random() * 1.5}" fill="#fff" opacity="${0.3 + Math.random() * 0.7}"><animate attributeName="opacity" values="0.3;1;0.3" dur="${2 + Math.random() * 3}s" repeatCount="indefinite"/></circle>` }).join('')}<text x="0" y="-160" text-anchor="middle" fill="${GD}" font-size="10">NORD</text><text x="0" y="170" text-anchor="middle" fill="${GD}" font-size="10">SUD</text><animateTransform attributeName="transform" type="rotate" from="0" to="360" dur="20s" repeatCount="indefinite"/></svg>`,
            details: '<h3>Calibre 89的星空图</h3><p>真正的Calibre 89使用蓝宝石水晶圆盘上的精密蚀刻来显示2800颗恒星。我们的模拟使用~200颗程序生成的星点。</p>'
        },

        {
            side: 'left', label: '四季 · Saisons', hlIds: ['hl-seasons'], statusKey: 'seasons',
            title: '四季轮 — SAISONS',
            desc: '最外圈的彩色弧段标示四季(法语)：PRINTEMPS(春)、ÉTÉ(夏)、AUTOMNE(秋)、HIVER(冬)。每个季节占3个月，颜色分别为绿、金、橙、蓝。',
            demoNote: '🌿 PRINTEMPS = 春 (3-5月)\n☀️ ÉTÉ = 夏 (6-8月)\n🍂 AUTOMNE = 秋 (9-11月)\n❄️ HIVER = 冬 (12-2月)',
            demo: () => `<svg viewBox="-200 -200 400 400">${[{ n: 'PRINTEMPS', c: 'rgba(100,180,100,0.3)', a: 0 }, { n: 'ÉTÉ', c: 'rgba(200,180,60,0.3)', a: 90 }, { n: 'AUTOMNE', c: 'rgba(180,100,50,0.3)', a: 180 }, { n: 'HIVER', c: 'rgba(80,130,200,0.3)', a: 270 }].map(s => { const a1 = s.a * Math.PI / 180, a2 = (s.a + 90) * Math.PI / 180, am = (s.a + 45) * Math.PI / 180; return `<path d="M0,0 L${180 * Math.cos(a1)},${180 * Math.sin(a1)} A180,180 0 0,1 ${180 * Math.cos(a2)},${180 * Math.sin(a2)} Z" fill="${s.c}" stroke="${GD}" stroke-width="0.5"/><text x="${130 * Math.cos(am)}" y="${130 * Math.sin(am) + 4}" text-anchor="middle" fill="${GD}" font-size="11">${s.n}</text>` }).join('')}</svg>`,
            details: '<h3>为什么法语？</h3><p>Patek Philippe是日内瓦品牌，传统使用法语标注。Calibre 89所有刻度均为法语。</p>'
        },

        {
            side: 'left', label: '黄道宫 · Zodiaque', hlIds: ['hl-zodiac'], statusKey: 'zodiac',
            title: '黄道十二宫 — ZODIAQUE',
            desc: '中间环带显示12个星座符号(♈-♓)和对应的法语月份名(JANVIER-DÉCEMBRE)。太阳每个月经过一个星座，当前太阳所在星座会在按钮旁实时显示。',
            demoNote: '♈ Bélier ♉ Taureau ♊ Gémeaux\n♋ Cancer ♌ Lion ♍ Vierge\n♎ Balance ♏ Scorpion ♐ Sagittaire\n♑ Capricorne ♒ Verseau ♓ Poissons',
            demo: () => `<svg viewBox="-200 -200 400 400"><circle r="180" fill="none" stroke="${GD}" stroke-width="1"/><circle r="140" fill="none" stroke="${GD}" stroke-width="0.5"/>${zSymbols.map((z, i) => { const a = ((i + 0.5) * 30 - 90) * Math.PI / 180; return `<text x="${160 * Math.cos(a)}" y="${160 * Math.sin(a) + 5}" text-anchor="middle" fill="${GD}" font-size="18">${z}</text>` }).join('')}<circle r="5" fill="${GD}"><animateMotion dur="8s" repeatCount="indefinite" path="M180,0 A180,180 0 1,1 179.9,0"/></circle></svg>`,
            details: '<h3>黄道与星座</h3><p>由于岁差，天文学星座和占星术星座已经偏移了约一个月。Calibre 89显示的是天文学黄道经度。</p>'
        },

        {
            side: 'left', label: '24h恒星时 · Sidéral', hlIds: ['hl-24h'], statusKey: 'sidereal24',
            title: '24小时恒星时刻度',
            desc: '内圈的1-24数字是恒星时刻度。恒星时按遥远恒星计时，一个恒星日=23小时56分4秒(比太阳日短约4分钟)。主表盘上的虚线指针指示当前恒星时。',
            demoNote: '🔢 1-24 = 恒星时小时\n⏱ 恒星日 = 23h 56m 4s\n📐 比太阳日短~3m 56s\n--- 虚线指针 = 恒星时位置',
            demo: () => `<svg viewBox="-200 -200 400 400"><circle r="180" fill="none" stroke="${GD}" stroke-width="1"/>${Array.from({ length: 24 }, (_, i) => { const a = (i * 15 - 90) * Math.PI / 180; return `<text x="${160 * Math.cos(a)}" y="${160 * Math.sin(a) + 4}" text-anchor="middle" fill="${GD}" font-size="11">${i + 1}</text>` }).join('')}<line x1="0" y1="0" x2="0" y2="-170" stroke="${GD}" stroke-width="1" stroke-dasharray="6 3"><animateTransform attributeName="transform" type="rotate" from="0" to="360" dur="5.9s" repeatCount="indefinite"/></line><line x1="0" y1="0" x2="0" y2="-150" stroke="${GD}" stroke-width="2"><animateTransform attributeName="transform" type="rotate" from="0" to="360" dur="6s" repeatCount="indefinite"/></line></svg>`,
            details: '<h3>为什么重要？</h3><p>恒星时决定了哪些星座在天空中可见。天文学家用恒星时来定位天体。</p>'
        },

        {
            side: 'left', label: '日出 · Lever', hlIds: ['hl-sunrise'], statusKey: 'sunrise',
            title: '日出子表盘 — LEVER DU SOLEIL',
            desc: '左侧小表盘实时显示今天日出时间(日内瓦)。指针指向对应的时刻位置。夏天日出早(~5:30)，冬天日出晚(~8:00)。',
            demoNote: '🌅 LEVER DU SOLEIL = 日出\n📍 基于日内瓦(46.2°N)\n☀️ 夏至: ~5:30 冬至: ~8:10\n⏰ 指针指向当天日出时刻',
            demo: () => `<svg viewBox="-100 -100 200 200"><circle r="80" fill="${MN}" stroke="${GD}" stroke-width="1"/><circle r="65" fill="none" stroke="${GOLDF}0.3)" stroke-width="0.5"/><line x1="0" y1="0" x2="0" y2="-60" stroke="${GD}" stroke-width="2" stroke-linecap="round"><animateTransform attributeName="transform" type="rotate" values="-130;-90;-130" dur="4s" repeatCount="indefinite"/></line><circle r="4" fill="${GD}"/><text x="0" y="-85" text-anchor="middle" fill="${GD}" font-size="8">LEVER DU SOLEIL</text></svg>`,
            details: '<h3>日出随季节变化</h3><ul><li>春分 ~6:40</li><li>夏至 ~5:30</li><li>秋分 ~7:10</li><li>冬至 ~8:10</li></ul>'
        },

        {
            side: 'left', label: '日落 · Coucher', hlIds: ['hl-sunset'], statusKey: 'sunset',
            title: '日落子表盘 — COUCHER DU SOLEIL',
            desc: '右侧小表盘实时显示今天日落时间(日内瓦)。夏天日落晚(~21:15)，冬天日落早(~16:45)。白天长度=日落-日出。',
            demoNote: '🌇 COUCHER DU SOLEIL = 日落\n📍 基于日内瓦(46.2°N)\n☀️ 夏至: ~21:15 冬至: ~16:45',
            demo: () => `<svg viewBox="-100 -100 200 200"><circle r="80" fill="${MN}" stroke="${GD}" stroke-width="1"/><circle r="65" fill="none" stroke="${GOLDF}0.3)" stroke-width="0.5"/><line x1="0" y1="0" x2="0" y2="-60" stroke="${GD}" stroke-width="2" stroke-linecap="round"><animateTransform attributeName="transform" type="rotate" values="90;170;90" dur="4s" repeatCount="indefinite"/></line><circle r="4" fill="${GD}"/><text x="0" y="-85" text-anchor="middle" fill="${GD}" font-size="8">COUCHER DU SOLEIL</text></svg>`,
            details: '<h3>日落随季节变化</h3><ul><li>春分 ~18:45</li><li>夏至 ~21:15</li><li>秋分 ~19:05</li><li>冬至 ~16:45</li></ul>'
        },

        {
            side: 'left', label: '真太阳时差 · Équation', hlIds: ['hl-equation'], statusKey: 'equation',
            title: '真太阳时差 — ÉQUATION DU TEMPS',
            desc: '左下小表盘显示"真太阳时"和"平均太阳时"的差值(±16分钟)。由于地球轨道是椭圆的+地轴倾斜，日晷时间和钟表时间不完全一致。',
            demoNote: '⏱ ÉQUATION DU TEMPS = 时差\n📐 范围: -14.2分 ~ +16.4分\n🌍 原因: 椭圆轨道 + 轴倾斜\n📅 2月约+14min, 11月约-16min',
            demo: () => `<svg viewBox="0 0 400 200"><path d="M20,100 ${Array.from({ length: 37 }, (_, i) => { const d = i * 10; const dt = new Date(2026, 0, 1); dt.setDate(dt.getDate() + d); const e = eqOfTime(dt); return `L${20 + i * 10},${100 - e * 5}` }).join(' ')}" fill="none" stroke="${GD}" stroke-width="2"/><line x1="20" y1="100" x2="380" y2="100" stroke="${GOLDF}0.3)" stroke-width="0.5"/><text x="200" y="20" text-anchor="middle" fill="${GD}" font-size="11">均时差曲线(全年)</text><text x="30" y="45" fill="${GD}" font-size="9">+16min</text><text x="30" y="170" fill="${GD}" font-size="9">-16min</text></svg>`,
            details: '<h3>极值</h3><ul><li>2月12日: +14.2分钟</li><li>5月14日: +3.6分钟</li><li>7月26日: -6.5分钟</li><li>11月3日: -16.4分钟</li></ul>'
        },

        {
            side: 'left', label: '月相 · Phase Lunaire', hlIds: ['hl-moon'], statusKey: 'moon',
            title: '月相 — PHASE DE LA LUNE',
            desc: '底部小圆显示当前月相。金色圆=月亮，暗色遮罩模拟阴影部分。新月时全暗，满月时全亮，周期约29.5天。',
            demoNote: '🌑 Nouvelle Lune = 新月\n🌓 Premier Quartier = 上弦\n🌕 Pleine Lune = 满月\n🌗 Dernier Quartier = 下弦\n🔄 周期 ≈ 29.53天',
            demo: () => `<svg viewBox="-100 -60 200 120">${['🌑', '🌒', '🌓', '🌔', '🌕', '🌖', '🌗', '🌘'].map((e, i) => `<text x="${-80 + i * 23}" y="10" font-size="24">${e}</text><text x="${-80 + i * 23}" y="35" text-anchor="middle" fill="${GD}" font-size="7">${['新月', '蛾眉', '上弦', '盈凸', '满月', '亏凸', '下弦', '残月'][i]}</text>`).join('')}</svg>`,
            details: '<h3>Calibre 89的月相</h3><p>真机使用精密凸轮机构驱动，误差每122年仅差一天。</p>'
        },

        // RIGHT (8)
        {
            side: 'right', label: '指针系统 · Aiguilles', hlIds: ['hl-hands'], statusKey: 'hands',
            title: '指针系统 — AIGUILLES',
            desc: '主表盘有4根指针：粗金=时针，细金=分针，极细金=秒针，虚线=恒星时指针。恒星时指针每天比分针多走约4分钟(因为恒星日短于太阳日)。',
            demoNote: '🕐 粗针 = 时针(12h一圈)\n🕐 细针 = 分针(60min一圈)\n🕐 极细 = 秒针(60s一圈)\n--- 虚线 = 恒星时(23h56m一圈)',
            demo: () => `<svg viewBox="-150 -150 300 300"><circle r="140" fill="${MN}" stroke="${GD}" stroke-width="1"/><line x1="0" y1="15" x2="0" y2="-70" stroke="${GD}" stroke-width="4"><animateTransform attributeName="transform" type="rotate" from="0" to="360" dur="12s" repeatCount="indefinite"/></line><line x1="0" y1="10" x2="0" y2="-110" stroke="${GD}" stroke-width="2"><animateTransform attributeName="transform" type="rotate" from="0" to="360" dur="3s" repeatCount="indefinite"/></line><line x1="0" y1="0" x2="0" y2="-130" stroke="${GD}" stroke-width="0.8" stroke-dasharray="5 3"><animateTransform attributeName="transform" type="rotate" from="0" to="360" dur="2.9s" repeatCount="indefinite"/></line><circle r="5" fill="${GD}"/></svg>`,
            details: '<h3>恒星时 vs 太阳时</h3><p>虚线指针比实线快~4分钟/天。一年后恰好多走一整圈。</p>'
        },

        {
            side: 'right', label: '时针 · Heures', hlIds: ['hl-hour-hand'], statusKey: 'hourHand',
            title: '时针 — AIGUILLE DES HEURES',
            desc: '粗金色指针=时针，12小时转一圈。箭头形式的尖端是Patek Philippe的经典"柳叶针"设计。',
            demoNote: '🕐 12小时转一圈\n📐 每小时转30°\n✨ 柳叶针(Feuille)设计',
            demo: () => `<svg viewBox="-100 -100 200 200"><circle r="90" fill="none" stroke="${GD}" stroke-width="0.5"/><line x1="0" y1="15" x2="0" y2="-60" stroke="${GD}" stroke-width="5" stroke-linecap="round"><animateTransform attributeName="transform" type="rotate" from="0" to="360" dur="12s" repeatCount="indefinite"/></line><path d="M-5,-55 L0,-75 L5,-55" fill="${GD}"><animateTransform attributeName="transform" type="rotate" from="0" to="360" dur="12s" repeatCount="indefinite"/></path><circle r="5" fill="${GD}"/></svg>`,
            details: '<h3>Patek Philippe指针</h3><p>Calibre 89的指针由18K金手工打磨。</p>'
        },

        {
            side: 'right', label: '分针 · Minutes', hlIds: ['hl-minute-hand'], statusKey: 'minuteHand',
            title: '分针 — AIGUILLE DES MINUTES',
            desc: '细金色指针=分针，60分钟转一圈。比时针更长更细，同样是柳叶针设计。',
            demoNote: '🕐 60分钟转一圈\n📐 每分钟转6°',
            demo: () => `<svg viewBox="-100 -100 200 200"><circle r="90" fill="none" stroke="${GD}" stroke-width="0.5"/><line x1="0" y1="10" x2="0" y2="-82" stroke="${GD}" stroke-width="2.5" stroke-linecap="round"><animateTransform attributeName="transform" type="rotate" from="0" to="360" dur="6s" repeatCount="indefinite"/></line><circle r="4" fill="${GD}"/></svg>`,
            details: '<h3>精度</h3><p>Calibre 89日差仅±1秒。</p>'
        },

        {
            side: 'right', label: '恒星时表盘 · Sidéral', hlIds: ['hl-sidereal-dial'], statusKey: 'siderealDial',
            title: '恒星时子表盘 — TEMPS SIDÉRAL',
            desc: '右下小表盘用时针+分针精确显示当前恒星时(小时和分钟)。恒星时是天文学家的核心工具——知道恒星时就能找到任何一颗星星在天空中的位置。',
            demoNote: '⏰ 双针显示恒星时\n🔭 天文学家的核心工具\n⭐ 知道恒星时 → 找到任何恒星\n⏱ 每天比标准时快~3m56s',
            demo: () => `<svg viewBox="-100 -100 200 200"><circle r="80" fill="${MN}" stroke="${GD}" stroke-width="1"/><text x="0" y="-65" text-anchor="middle" fill="${GD}" font-size="7">TEMPS SIDÉRAL</text><line x1="0" y1="0" x2="0" y2="-45" stroke="${GD}" stroke-width="2.5"><animateTransform attributeName="transform" type="rotate" from="0" to="360" dur="12s" repeatCount="indefinite"/></line><line x1="0" y1="0" x2="0" y2="-60" stroke="${GD}" stroke-width="1"><animateTransform attributeName="transform" type="rotate" from="0" to="360" dur="2.9s" repeatCount="indefinite"/></line><circle r="3" fill="${GD}"/></svg>`,
            details: '<h3>恒星时用途</h3><p>如果恒星时=6h，那么赤经6h的天体(如猎户座)正好在南方最高点。</p>'
        },

        {
            side: 'right', label: '复活节 · Pâques', hlIds: ['hl-easter'], statusKey: 'easter',
            title: '复活节日期 — DATES DE PÂQUES',
            desc: '顶部小表盘显示今年和明年的复活节日期。复活节的日期计算(Computus)极其复杂——它是"春分后第一个满月后的第一个星期日"。Calibre 89是极少数能机械计算复活节的手表之一。',
            demoNote: '🐣 DATES DE PÂQUES = 复活节日期\n📅 春分后满月后第一个周日\n📐 Computus算法(公元725年)\n⚙️ 极少数能机械计算的手表',
            demo: () => { const years = [2024, 2025, 2026, 2027, 2028]; return `<svg viewBox="0 0 400 150"><text x="200" y="20" text-anchor="middle" fill="${GD}" font-size="12">复活节日期</text>${years.map((y, i) => { const e = easterDate(y); return `<text x="200" y="${50 + i * 22}" text-anchor="middle" fill="${GD}" font-size="13">${y}: ${e.day} ${months[e.month - 1]}</text>` }).join('')}</svg>`; },
            details: '<h3>Computus算法</h3><p>由英国僧侣Bede(672-735)整理，基于19年太阴周期(Metonic cycle)。Calibre 89用一组复杂的凸轮来机械实现这个算法。</p>'
        },

        {
            side: 'right', label: '黄道面 · Écliptique', hlIds: ['hl-ecliptic'], statusKey: 'eclipticLine',
            title: '黄道面 — ÉCLIPTIQUE',
            desc: '星空图上倾斜的虚线椭圆=黄道面(太阳在天球上的视运动路径)。它与天球赤道成23.44°夹角，这个倾斜造成了四季的变化。',
            demoNote: '📐 倾斜椭圆 = 黄道面\n🔄 23.44° = 地轴倾角\n☀️ 太阳沿此路径运动\n🌍 倾斜 → 四季变化的原因',
            demo: () => `<svg viewBox="-200 -200 400 400"><circle r="180" fill="none" stroke="${GOLDF}0.3)" stroke-width="0.5"/><ellipse rx="170" ry="140" fill="none" stroke="${GD}" stroke-width="2" stroke-dasharray="8 4" transform="rotate(-23.44)"><animate attributeName="stroke-dashoffset" from="40" to="0" dur="2s" repeatCount="indefinite"/></ellipse><text x="0" y="-185" text-anchor="middle" fill="${GD}" font-size="10">天球赤道</text><text x="100" y="-140" fill="${GD}" font-size="10">黄道 23.44°</text><circle r="6" fill="${GD}"><animateMotion dur="6s" repeatCount="indefinite" path="M170,0 A170,140 23.44 1,1 169.9,0"/></circle></svg>`,
            details: '<h3>为什么23.44°很重要？</h3><p>没有这个倾斜，地球就没有四季。赤道永远最热，极地永远最冷。</p>'
        },

        {
            side: 'right', label: '地平线 · Horizon', hlIds: ['hl-horizon-line'], statusKey: 'horizonSt',
            title: '地平线 — HORIZON',
            desc: '星空图上的水平虚线=日内瓦的地平线。线上方的星星=当前可见，线下方=在地平线以下不可见。',
            demoNote: '━━ 水平虚线 = 地平线\n⬆ 上方星星 = 现在可见\n⬇ 下方星星 = 地平线以下\n📍 专为日内瓦46.2°N设计',
            demo: () => `<svg viewBox="-200 -100 400 200"><rect x="-200" y="-100" width="400" height="100" fill="rgba(10,26,58,0.3)"/><text x="0" y="-50" text-anchor="middle" fill="${GD}" font-size="12">⬆ 可见天空 ⭐</text><rect x="-200" y="0" width="400" height="100" fill="rgba(10,26,58,0.1)"/><text x="0" y="50" text-anchor="middle" fill="${GOLDF}0.4)" font-size="12">⬇ 地平线以下</text><line x1="-200" y1="0" x2="200" y2="0" stroke="${GD}" stroke-width="2" stroke-dasharray="6 3"/></svg>`,
            details: '<h3>地平线随纬度变化</h3><p>日内瓦46.2°N看到的天空与北京39.9°N不同。Calibre 89专为特定城市定制。</p>'
        },

        {
            side: 'right', label: '表壳 · Boîtier', hlIds: ['hl-case'], statusKey: 'caseSt',
            title: '表壳 — LE BOÎTIER',
            desc: 'Calibre 89于1989年为纪念百达翡丽创立150周年而制造。直径88.2mm，厚41.07mm，18K金表壳，1728个零件，33项功能，是当时世界上最复杂的便携式计时器。共制作4枚(白金、黄金、玫瑰金、铂金各一)。',
            demoNote: '📅 1989年 · 150周年纪念\n📏 88.2mm × 41.07mm\n⚙️ 1728个零件 · 33项功能\n💰 2019年拍卖价: $31,000,000\n🏆 当时世界最复杂便携计时器',
            demo: () => `<svg viewBox="-150 -150 300 300"><circle r="140" fill="none" stroke="${GD}" stroke-width="4"/><circle r="135" fill="none" stroke="${GD}" stroke-width="1"/><circle r="130" fill="${MN}"/><text x="0" y="-10" text-anchor="middle" fill="${GD}" font-size="14">PATEK PHILIPPE</text><text x="0" y="10" text-anchor="middle" fill="${GD}" font-size="18" font-weight="bold">CALIBRE 89</text><text x="0" y="35" text-anchor="middle" fill="${GOLDF}0.6)" font-size="10">GENÈVE · 1989</text><text x="0" y="60" text-anchor="middle" fill="${GOLDF}0.5)" font-size="9">33 COMPLICATIONS</text></svg>`,
            details: '<h3>33项功能包括</h3><ul><li>恒星时 · 日出日落 · 均时差</li><li>万年历 · 闰年 · 月相</li><li>三问报时 · 闹铃</li><li>计时码表 · 跳秒</li><li>复活节日期 · 星空图</li><li>温度计 · 动力储存</li></ul>'
        },
    ];

    // ==================== BUTTONS + HOVER ====================
    const leftCol = document.getElementById('leftLabels'), rightCol = document.getElementById('rightLabels');
    const panel = document.getElementById('feature-panel'), closeBtn = document.getElementById('closePanel');
    const allGroups = svg.querySelectorAll(':scope > g');
    let activeBtn = null;

    features.forEach(f => {
        const col = f.side === 'left' ? leftCol : rightCol;
        const btn = document.createElement('button'); btn.className = 'feature-btn';
        const ar = f.side === 'left' ? '→' : '←';
        btn.innerHTML = `<span class="btn-dot"></span><span>${f.label}</span><span class="btn-arrow">${ar}</span><span class="btn-status" id="st-${f.statusKey}">…</span>`;
        setTimeout(() => { statusEls[f.statusKey] = document.getElementById('st-' + f.statusKey); }, 150);
        btn.addEventListener('mouseenter', () => {
            allGroups.forEach(g => g.classList.add('dimmed'));
            f.hlIds.forEach(id => { const el = document.getElementById(id); if (el) { el.classList.add('highlighted'); el.classList.remove('dimmed'); let p = el.parentElement; while (p && p !== svg) { p.classList.remove('dimmed'); p = p.parentElement; } } });
        });
        btn.addEventListener('mouseleave', () => {
            allGroups.forEach(g => g.classList.remove('dimmed'));
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
});
