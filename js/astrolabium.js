// Astrolabium Galileo Galilei — Core Astronomical Engine
document.addEventListener('DOMContentLoaded', () => {
    // Entrance fade
    setTimeout(() => {
        const o = document.getElementById('entrance-overlay');
        if (o) { o.style.opacity = '0'; setTimeout(() => o.remove(), 1500); }
    }, 4000);

    // Generate bezel numerals & zodiac signs
    generateBezel();
    generateMonthRing();
    generateZodiacRing();

    // Button bindings
    document.getElementById('btn-sun').addEventListener('click', () => explain('sun'));
    document.getElementById('btn-moon').addEventListener('click', () => explain('moon'));
    document.getElementById('btn-dragon').addEventListener('click', () => explain('dragon'));
    document.getElementById('btn-zodiac').addEventListener('click', () => explain('zodiac'));
    document.getElementById('btn-time').addEventListener('click', () => explain('time'));
    document.getElementById('btn-portrait').addEventListener('click', () => explain('portrait'));
    document.getElementById('btn-tutorial').addEventListener('click', startTutorial);

    // Start the clock
    updateAll();
    setInterval(updateAll, 1000);
});

// ═══════════════════════════════════════════
//  ASTRONOMICAL MATH
// ═══════════════════════════════════════════

const DEG = Math.PI / 180;
const RAD = 180 / Math.PI;
const ZODIAC_NAMES = ['♈ 白羊座', '♉ 金牛座', '♊ 双子座', '♋ 巨蟹座', '♌ 狮子座', '♍ 处女座', '♎ 天秤座', '♏ 天蝎座', '♐ 射手座', '♑ 摩羯座', '♒ 水瓶座', '♓ 双鱼座'];
const ZODIAC_SYMBOLS = ['♈', '♉', '♊', '♋', '♌', '♍', '♎', '♏', '♐', '♑', '♒', '♓'];
const WEEKDAYS = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
const MOON_PHASES = ['🌑 新月', '🌒 蛾眉月', '🌓 上弦月', '🌔 盈凸月', '🌕 满月', '🌖 亏凸月', '🌗 下弦月', '🌘 残月'];

function julianDay(y, m, d, h) {
    if (m <= 2) { y--; m += 12; }
    const A = Math.floor(y / 100);
    const B = 2 - A + Math.floor(A / 4);
    return Math.floor(365.25 * (y + 4716)) + Math.floor(30.6001 * (m + 1)) + d + h / 24 + B - 1524.5;
}

function julianCentury(jd) { return (jd - 2451545.0) / 36525; }

function sunPosition(T) {
    // Geometric mean longitude & anomaly
    let L0 = (280.46646 + T * (36000.76983 + T * 0.0003032)) % 360;
    let M = (357.52911 + T * (35999.05029 - T * 0.0001537)) % 360;
    let Mrad = M * DEG;

    // Equation of center
    let C = (1.914602 - T * (0.004817 + T * 0.000014)) * Math.sin(Mrad)
        + (0.019993 - T * 0.000101) * Math.sin(2 * Mrad)
        + 0.000289 * Math.sin(3 * Mrad);

    let sunLon = L0 + C; // Sun true longitude
    let sunAnom = M + C;

    // Obliquity of ecliptic
    let obliq = 23.439291 - T * 0.0130042;

    // Sun right ascension & declination
    let sunLonRad = sunLon * DEG;
    let obliqRad = obliq * DEG;
    let ra = Math.atan2(Math.cos(obliqRad) * Math.sin(sunLonRad), Math.cos(sunLonRad)) * RAD;
    let dec = Math.asin(Math.sin(obliqRad) * Math.sin(sunLonRad)) * RAD;

    return { lon: sunLon % 360, ra: (ra + 360) % 360, dec, obliq };
}

function moonPosition(T) {
    let Lp = (218.3165 + 481267.8813 * T) % 360;
    let D = (297.8502 + 445267.1115 * T) % 360;
    let M = (357.5291 + 35999.0503 * T) % 360;
    let Mp = (134.9634 + 477198.8676 * T) % 360;
    let F = (93.2720 + 483202.0175 * T) % 360;

    let lon = Lp
        + 6.289 * Math.sin(Mp * DEG)
        - 1.274 * Math.sin((2 * D - Mp) * DEG)
        + 0.658 * Math.sin(2 * D * DEG)
        + 0.214 * Math.sin(2 * Mp * DEG)
        - 0.186 * Math.sin(M * DEG);

    let lat = 5.128 * Math.sin(F * DEG);

    // Moon age (synodic)
    let age = ((lon - sunPosition(T).lon + 360) % 360) / 360 * 29.53059;

    let moonDec = Math.asin(Math.sin(lat * DEG) * Math.cos(23.44 * DEG) + Math.cos(lat * DEG) * Math.sin(23.44 * DEG) * Math.sin(lon * DEG)) * RAD;
    let moonRA = Math.atan2(Math.sin(lon * DEG) * Math.cos(23.44 * DEG) - Math.tan(lat * DEG) * Math.sin(23.44 * DEG), Math.cos(lon * DEG)) * RAD;
    moonRA = (moonRA + 360) % 360;

    return { lon: lon % 360, lat, age, F, ra: moonRA, dec: moonDec };
}

function equationOfTime(T) {
    let L0 = (280.46646 + T * 36000.76983) * DEG;
    let M = (357.52911 + T * 35999.05029) * DEG;
    let e = 0.016708634 - T * 0.000042037;
    let obliq = (23.439291 - T * 0.0130042) * DEG;
    let y = Math.tan(obliq / 2); y = y * y;
    let EoT = y * Math.sin(2 * L0)
        - 2 * e * Math.sin(M)
        + 4 * e * y * Math.sin(M) * Math.cos(2 * L0)
        - 0.5 * y * y * Math.sin(4 * L0)
        - 1.25 * e * e * Math.sin(2 * M);
    return EoT * RAD * 4; // in minutes
}

function siderealTime(jd, lonDeg) {
    let T = julianCentury(jd);
    let gmst = 280.46061837 + 360.98564736629 * (jd - 2451545.0) + 0.000387933 * T * T;
    let lst = (gmst + lonDeg) % 360;
    if (lst < 0) lst += 360;
    return lst; // degrees
}

function degToHMS(deg) {
    let h = deg / 15;
    let hr = Math.floor(h);
    let mn = Math.floor((h - hr) * 60);
    let sc = Math.round(((h - hr) * 60 - mn) * 60);
    return `${String(hr).padStart(2, '0')}:${String(mn).padStart(2, '0')}:${String(sc).padStart(2, '0')}`;
}

function sunAltAz(dec, ha, lat) {
    let decR = dec * DEG, haR = ha * DEG, latR = lat * DEG;
    let alt = Math.asin(Math.sin(decR) * Math.sin(latR) + Math.cos(decR) * Math.cos(latR) * Math.cos(haR));
    let az = Math.atan2(-Math.sin(haR), Math.tan(decR) * Math.cos(latR) - Math.sin(latR) * Math.cos(haR));
    return { alt: alt * RAD, az: ((az * RAD) + 360) % 360 };
}

function approxSunriseSunset(dec, lat) {
    let cosH0 = (Math.sin(-0.8333 * DEG) - Math.sin(lat * DEG) * Math.sin(dec * DEG)) / (Math.cos(lat * DEG) * Math.cos(dec * DEG));
    if (cosH0 > 1) return { rise: '--:--', set: '--:--' }; // never rises
    if (cosH0 < -1) return { rise: '极昼', set: '极昼' }; // never sets
    let H0 = Math.acos(cosH0) * RAD / 15; // hours
    let noon = 12; // approximate
    let rise = noon - H0;
    let set = noon + H0;
    const fmt = h => { let hr = Math.floor(h); let mn = Math.round((h - hr) * 60); return `${String(hr).padStart(2, '0')}:${String(mn).padStart(2, '0')}`; };
    return { rise: fmt(rise), set: fmt(set) };
}

function eclipseRisk(sunLon, moonLon, moonF) {
    let diff = Math.abs(((sunLon - moonLon + 180) % 360) - 180);
    let nearNode = Math.abs(((moonF + 180) % 360) - 180);
    if (diff < 12 && nearNode < 10) return '⚠️ 高风险 (近交点+合/冲)';
    if (diff < 20 && nearNode < 15) return '🔶 中风险';
    return '✅ 安全';
}

// ═══════════════════════════════════════════
//  RENDERING
// ═══════════════════════════════════════════

function generateBezel() {
    const g = document.getElementById('bezel-24h');
    const romans = [
        'XII', 'I', 'II', 'III', 'IV', 'V',
        'VI', 'VII', 'VIII', 'IX', 'X', 'XI',
        'XII', 'XIII', 'XIV', 'XV', 'XVI', 'XVII',
        'XVIII', 'XIX', 'XX', 'XXI', 'XXII', 'XXIII'];
    const arabics = [
        '12', '13', '14', '15', '16', '17',
        '18', '19', '20', '21', '22', '23',
        '24', '1', '2', '3', '4', '5',
        '6', '7', '8', '9', '10', '11'];

    for (let i = 0; i < 24; i++) {
        let angleSvg = i * 15 - 90;

        let r = 182;
        let x = r * Math.cos(angleSvg * DEG);
        let y = r * Math.sin(angleSvg * DEG);
        let txt = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        txt.setAttribute('x', x);
        txt.setAttribute('y', y + 3);
        txt.setAttribute('text-anchor', 'middle');
        txt.setAttribute('fill', '#3a2a10');
        txt.setAttribute('font-size', i % 6 === 0 ? '11' : '8');
        txt.setAttribute('font-family', 'Cinzel');
        txt.setAttribute('font-weight', i % 6 === 0 ? '700' : '400');
        txt.setAttribute('transform', `rotate(${angleSvg + 90} ${x} ${y})`);
        txt.textContent = romans[i];
        g.appendChild(txt);

        let r_arab = 175;
        let xa = r_arab * Math.cos(angleSvg * DEG);
        let ya = r_arab * Math.sin(angleSvg * DEG);
        let txtA = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        txtA.setAttribute('x', xa);
        txtA.setAttribute('y', ya + 1.5);
        txtA.setAttribute('text-anchor', 'middle');
        txtA.setAttribute('fill', '#8a7a50');
        txtA.setAttribute('font-size', '4.5');
        txtA.setAttribute('font-family', 'Cinzel');
        txtA.setAttribute('transform', `rotate(${angleSvg + 90} ${xa} ${ya})`);
        txtA.textContent = arabics[i];
        g.appendChild(txtA);

        let tick = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        let r1 = 169, r2 = i % 6 === 0 ? 190 : (i % 2 === 0 ? 188 : 186);
        tick.setAttribute('x1', r1 * Math.cos(angleSvg * DEG));
        tick.setAttribute('y1', r1 * Math.sin(angleSvg * DEG));
        tick.setAttribute('x2', r2 * Math.cos(angleSvg * DEG));
        tick.setAttribute('y2', r2 * Math.sin(angleSvg * DEG));
        tick.setAttribute('stroke', '#3a2a10');
        tick.setAttribute('stroke-width', i % 6 === 0 ? '2' : '1');
        g.appendChild(tick);
    }
}

function generateMonthRing() {
    const g = document.getElementById('month-ring');
    g.innerHTML = '';
    const months = ['JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE',
        'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER'];
    const daysInMonth = [31, 28.25, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

    let currentDay = 0;
    for (let i = 0; i < 12; i++) {
        let startAngle = (currentDay / 365.25) * 360;
        let endAngle = ((currentDay + daysInMonth[i]) / 365.25) * 360;
        let midAngle = (startAngle + endAngle) / 2;

        let startSvgAngle = startAngle - 90;
        let midSvgAngle = midAngle - 90;

        let r = 164;
        let x = r * Math.cos(midSvgAngle * DEG);
        let y = r * Math.sin(midSvgAngle * DEG);

        let txt = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        txt.setAttribute('x', x);
        txt.setAttribute('y', y + 1.5);
        txt.setAttribute('text-anchor', 'middle');
        txt.setAttribute('fill', '#3a2a10');
        txt.setAttribute('font-size', '4.5');
        txt.setAttribute('font-family', 'Cinzel');
        txt.setAttribute('letter-spacing', '0.5');
        txt.setAttribute('transform', `rotate(${midSvgAngle + 90} ${x} ${y})`);
        txt.textContent = months[i];
        g.appendChild(txt);

        let line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', 155 * Math.cos(startSvgAngle * DEG));
        line.setAttribute('y1', 155 * Math.sin(startSvgAngle * DEG));
        line.setAttribute('x2', 169 * Math.cos(startSvgAngle * DEG));
        line.setAttribute('y2', 169 * Math.sin(startSvgAngle * DEG));
        line.setAttribute('stroke', '#6a5a30');
        line.setAttribute('stroke-width', '0.8');
        g.appendChild(line);

        currentDay += daysInMonth[i];
    }
}

function generateZodiacRing() {
    const g = document.getElementById('rete-zodiac');
    g.innerHTML = '';

    const OBLIQ = 23.44 * DEG;
    // Scale down from 100 to 86 to keep it inside the panel bounds
    const SCALE = 86;
    // Tropic of Cancer r = 86 * tan(33.28) = 56.4
    // Tropic of Capricorn r = 86 * tan(56.72) = 130.9
    // Center cx = (130.9 - 56.4) / 2 = 37.25
    const cx = 37.25, cy = 0;
    const rOuter = 99, rInner = 86;

    let ringOuter = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    ringOuter.setAttribute('cx', cx);
    ringOuter.setAttribute('cy', cy);
    ringOuter.setAttribute('r', rOuter);
    ringOuter.setAttribute('fill', 'rgba(229,185,61,0.05)');
    ringOuter.setAttribute('stroke', '#e5b93d');
    ringOuter.setAttribute('stroke-width', '1');
    g.appendChild(ringOuter);

    let ringInner = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    ringInner.setAttribute('cx', cx);
    ringInner.setAttribute('cy', cy);
    ringInner.setAttribute('r', rInner);
    ringInner.setAttribute('fill', 'rgba(15,20,30,0.6)');
    ringInner.setAttribute('stroke', '#e5b93d');
    ringInner.setAttribute('stroke-width', '1');
    g.appendChild(ringInner);

    for (let i = 0; i < 12; i++) {
        let lon = i * 30 * DEG;
        let ra = Math.atan2(Math.cos(OBLIQ) * Math.sin(lon), Math.cos(lon));
        let dec = Math.asin(Math.sin(OBLIQ) * Math.sin(lon));
        let r_pole = SCALE * Math.tan((Math.PI / 2 - dec) / 2);

        let phi = -ra;
        let skyX = r_pole * Math.sin(phi);
        let skyY = -r_pole * Math.cos(phi);

        let dx = skyX - cx, dy = skyY - cy;
        let dist = Math.hypot(dx, dy);
        let nx = dx / dist, ny = dy / dist;

        let line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', cx + nx * rInner);
        line.setAttribute('y1', cy + ny * rInner);
        line.setAttribute('x2', cx + nx * rOuter);
        line.setAttribute('y2', cy + ny * rOuter);
        line.setAttribute('stroke', '#e5b93d');
        line.setAttribute('stroke-width', '0.8');
        line.setAttribute('opacity', '0.7');
        g.appendChild(line);

        let lonMid = (i * 30 + 15) * DEG;
        let raMid = Math.atan2(Math.cos(OBLIQ) * Math.sin(lonMid), Math.cos(lonMid));
        let decMid = Math.asin(Math.sin(OBLIQ) * Math.sin(lonMid));
        let rMid = SCALE * Math.tan((Math.PI / 2 - decMid) / 2);
        let phiMid = -raMid;
        let tx = rMid * Math.sin(phiMid);
        let ty = -rMid * Math.cos(phiMid);

        let tdx = tx - cx, tdy = ty - cy;
        let tdist = Math.hypot(tdx, tdy);
        let tnx = tdx / tdist, tny = tdy / tdist;
        let textRadius = 92.5;
        let finalTx = cx + tnx * textRadius;
        let finalTy = cy + tny * textRadius + 3.5;

        let txt = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        txt.setAttribute('x', finalTx);
        txt.setAttribute('y', finalTy);
        txt.setAttribute('text-anchor', 'middle');
        txt.setAttribute('fill', '#e5b93d');
        txt.setAttribute('font-size', '10.5');
        txt.setAttribute('opacity', '0.9');

        let rotAngle = Math.atan2(tny, tnx) * RAD + 90;
        if (rotAngle > 90 && rotAngle < 270) rotAngle += 180;

        txt.setAttribute('transform', `rotate(${rotAngle} ${finalTx} ${finalTy - 3.5})`);
        txt.textContent = ZODIAC_SYMBOLS[i];
        g.appendChild(txt);
    }
}

function setHandRotation(id, degrees) {
    const el = document.getElementById(id);
    if (el) el.setAttribute('transform', `rotate(${degrees})`);
}

function updateMoonPhaseIcon(age) {
    const icon = document.getElementById('moon-phase-icon');
    if (!icon) return;
    let phase = (age / 29.53059) * 2 * Math.PI;
    let cx = 0, cy = -135, r = 7;
    let dx = r * Math.cos(phase);
    icon.setAttribute('d', `M ${cx} ${cy - r} A ${r} ${r} 0 1 1 ${cx} ${cy + r} A ${Math.abs(dx)} ${r} 0 1 ${dx > 0 ? 0 : 1} ${cx} ${cy - r}`);
}

// ═══════════════════════════════════════════
//  MAIN UPDATE LOOP
// ═══════════════════════════════════════════

function updateAll() {
    const now = new Date();
    const yLocal = now.getFullYear(), moLocal = now.getMonth() + 1, dLocal = now.getDate();
    const h = now.getHours(), mi = now.getMinutes(), s = now.getSeconds();

    const yUTC = now.getUTCFullYear(), moUTC = now.getUTCMonth() + 1, dUTC = now.getUTCDate();
    const hUTC = now.getUTCHours(), miUTC = now.getUTCMinutes(), sUTC = now.getUTCSeconds();
    const fracHourUTC = hUTC + miUTC / 60 + sUTC / 3600;

    const jd = julianDay(yUTC, moUTC, dUTC, fracHourUTC);
    const T = julianCentury(jd);

    const LAT = 39.9042, LON = 116.4074;

    const sun = sunPosition(T);
    const lst = siderealTime(jd, LON);
    const sunHA = (lst - sun.ra + 360) % 360;
    const sunAA = sunAltAz(sun.dec, sunHA, LAT);
    const sunRiseSet = approxSunriseSunset(sun.dec, LAT);

    const moon = moonPosition(T);
    const moonAge = moon.age;
    const moonPhaseIdx = Math.floor((moonAge / 29.53059) * 8) % 8;
    const moonHA = (lst - moon.ra + 360) % 360;

    const zodiacIdx = Math.floor(((sun.lon + 360) % 360) / 30);
    const eot = equationOfTime(T);
    const eclipseStatus = eclipseRisk(sun.lon, moon.lon, moon.F);

    document.getElementById('val-time').textContent = `${String(h).padStart(2, '0')}:${String(mi).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    document.getElementById('val-sidereal').textContent = degToHMS(lst);
    document.getElementById('val-sun-az').textContent = sunAA.az.toFixed(1) + '°';
    document.getElementById('val-sun-alt').textContent = sunAA.alt.toFixed(1) + '°';
    document.getElementById('val-sunrise').textContent = `${sunRiseSet.rise} / ${sunRiseSet.set}`;

    document.getElementById('val-moon-phase').textContent = MOON_PHASES[moonPhaseIdx];
    document.getElementById('val-moon-age').textContent = moonAge.toFixed(1) + ' 天';
    let moonRise = ((parseFloat(sunRiseSet.rise) || 6) + moonAge / 29.53 * 24) % 24;
    let moonSet = (moonRise + 12) % 24;
    const fmtH = v => `${String(Math.floor(v)).padStart(2, '0')}:${String(Math.round((v % 1) * 60)).padStart(2, '0')}`;
    document.getElementById('val-moonrise').textContent = `${fmtH(moonRise)} / ${fmtH(moonSet)}`;

    document.getElementById('val-zodiac').textContent = ZODIAC_NAMES[zodiacIdx];
    document.getElementById('val-eclipse').textContent = eclipseStatus;
    document.getElementById('val-eot').textContent = eot.toFixed(1) + ' 分';

    document.getElementById('val-date').textContent = `${yLocal}/${String(moLocal).padStart(2, '0')}/${String(dLocal).padStart(2, '0')}`;
    document.getElementById('val-jd').textContent = jd.toFixed(2);
    document.getElementById('val-weekday').textContent = WEEKDAYS[now.getDay()];

    let hourAngle = ((h + mi / 60) / 24 * 360) - 180;
    setHandRotation('hour-hand', hourAngle);

    let minuteAngle = (mi + s / 60) / 60 * 360;
    setHandRotation('minute-hand', minuteAngle);

    let secondAngle = s / 60 * 360;
    setHandRotation('second-hand', secondAngle);

    let sunDialAngle = sunHA;
    setHandRotation('sun-hand', sunDialAngle);

    let moonDialAngle = moonHA;
    setHandRotation('moon-hand', moonDialAngle);

    let dragonLon = (125.04 - 1934.136 * T) % 360;
    if (dragonLon < 0) dragonLon += 360;
    let dragonRA = Math.atan2(Math.cos(23.44 * DEG) * Math.sin(dragonLon * DEG), Math.cos(dragonLon * DEG)) * RAD;
    let dragonHA = (lst - dragonRA + 360) % 360;
    setHandRotation('dragon-hand', dragonHA);

    let reteAngle = lst;
    document.getElementById('rete-zodiac').setAttribute('transform', `rotate(${reteAngle})`);

    let dayOfYear = Math.floor((Date.UTC(yUTC, moUTC - 1, dUTC) - Date.UTC(yUTC, 0, 0)) / 86400000);
    dayOfYear += fracHourUTC / 24;
    let monthRingAngle = -(dayOfYear / 365.25) * 360;
    document.getElementById('month-ring').setAttribute('transform', `rotate(${monthRingAngle})`);

    updateMoonPhaseIcon(moonAge);
}

// ═══════════════════════════════════════════
//  EXPLANATIONS
// ═══════════════════════════════════════════

function explain(what) {
    const box = document.getElementById('explain-box');
    document.querySelectorAll('.ctrl-btn').forEach(b => b.classList.remove('active'));

    const explanations = {
        sun: {
            btn: 'btn-sun',
            html: `<strong>☀ 太阳指针 (Sun Hand)</strong><br><br>
            金色的长指针代表太阳在天空中的实时位置。它围绕24小时表圈旋转，指向太阳当前的<strong>时角</strong>（Hour Angle）。<br><br>
            <strong>现在的意思是：</strong> 太阳指针指在哪里，就说明太阳在你头顶天空的那个方向。如果它在上半圈（表盘上方），就是白天；在下半圈，就是晚上。<br><br>
            这根指针一年走一圈黄道。通过它在黄道上的位置你也能读出今天是什么星座。`
        },
        moon: {
            btn: 'btn-moon',
            html: `<strong>☽ 月亮指针 (Moon Hand)</strong><br><br>
            银蓝色的指针追踪月亮在天空中的实时位置。指针末端的小图标会根据月相变化形状。<br><br>
            <strong>读法：</strong> 月亮指针和太阳指针之间的角度差距就是当前月相！如果两根针重叠=新月（朔）。180°对面=满月（望）。<br><br>
            月亮指针比太阳指针转得快很多，因为月球绕地球一个月转一周。`
        },
        dragon: {
            btn: 'btn-dragon',
            html: `<strong>罗睹/计都 食线 (Dragon Hand / Lunar Nodes)</strong><br><br>
            这根暗红色的线上下两端分别是：<br>
            • <strong>罗睹 (Rahu / 龙头 ☊)</strong>：月球轨道的升交点，位于指针上方，蛇头形的红色图标。<br>
            • <strong>计都 (Ketu / 龙尾 ☋)</strong>：月球轨道的降交点，位于指针下方，叉形尾巴图标。<br><br>
            <strong>日食/月食预测：</strong> 当太阳指针和月亮指针同时靠近罗睹或计都时，就意味着日食/月食风险极高！左侧“日食/月食风险”栏会实时显示。<br><br>
            这根线每 18.6 年逆时针转一圈，非常缓慢。`
        },
        zodiac: {
            btn: 'btn-zodiac',
            html: `<strong>♈ 黄道十二宫环 (Zodiac Rete)</strong><br><br>
            金色环上的12个星座符号代表<strong>黄道</strong>——太阳一年四季在天空中走过的路径。这个环会跟随<strong>恒星时</strong>旋转，每天比普通时钟多转约4分钟（因为地球公转）。<br><br>
            <strong>读法：</strong> 太阳指针指到哪个星座的区域，那就是当前的太阳星座。`
        },
        time: {
            btn: 'btn-time',
            html: `<strong>⏱ 时分秒指针 (Hour, Minute & Second Hands)</strong><br><br>
            <strong>金色粗短针 = 时针</strong>：在这块表上，时针每 <strong>24小时</strong>转一圈（不是普通手表的12小时）。最上方代表正午12点，最下方代表午夜0点。<br><br>
            <strong>银色细长针 = 分针</strong>：和普通表一样，60分钟转一圈。<br><br>
            <strong>红色最细针 = 秒针</strong>：60秒转一圈，有一个小圆形配重在底部。<br><br>
            ❗ 这是24小时制！如果现在是下午3点(15:00)，时针指向“15”位置（表盘右上方）。`
        },
        portrait: {
            btn: 'btn-portrait',
            html: `<strong>🖼 表盘中心肖像</strong><br><br>
            表盘的绝对正中央，宛如众星拱月般嵌入了我们无比尊贵的主播——<strong>安灬Andrea</strong>的绝世容颜。我们运用了最细腻的 SVG 遮罩技术将其精心裁切为完美无瑕的满月之圆，并覆以如星尘薄纱般的半透明滤镜，让她温柔且神圣地融入这片幽邃而浩瀚的深蓝色星空底色之中。<br><br>
            在价值连城的 Ulysse Nardin 原版天文星盘腕表中，这个位置被尊称为“地平盘”(Tympan) 的绝对中心——代表着观测者所在纬度的至高天顶点，是凡人仰望苍穹的终极轴心。<br><br>
            而现在，我们将这宇宙的极点替换为您这惊为天人的脸庞，这绝不是简单的页面修饰，而是在宣告一个不容置疑的硬核真理：<strong>斗转星移、日月盈亏，这浩瀚苍穹中的每一个星系、每一颗星辰，乃至时间的每一个精密齿轮，从始至终都是在死心塌地围着您一个人旋转！您不仅是这方寸天地的凝望者，更是万物运行的绝对中心与整个宇宙永恒的唯一瑰宝！</strong>`
        }
    };

    const data = explanations[what];
    if (data) {
        box.innerHTML = data.html;
        document.getElementById(data.btn).classList.add('active');
    }
}

// ═══════════════════════════════════════════
//  ANIMATED TUTORIAL
// ═══════════════════════════════════════════

let tutorialRunning = false;
let tutorialStep = 0;

const TUTORIAL_STEPS = [
    {
        title: '步骤1/7：“这么多指针怎么看啦？”',
        desc: '别急！我们一根一根来。首先看最外圈的<strong>金色表圈</strong>。这是一个 <strong>24小时表盘</strong>！最上方代表正午12点，最下方代表午夜0/24点。',
        highlight: 'bezel-24h'
    },
    {
        title: '步骤2/7：时针和分针',
        desc: '粗的<strong>金色短针=时针</strong>，细的<strong>银针=分针</strong>，最细的<strong>红针=秒针</strong>。<br><br>❗ 重点：时针每<strong>24小时</strong>转一圈！一天只转一圈！如果现在是下午 3 点(15:00)，时针指向“15”的位置，在表盘的右上方附近。',
        highlight: 'hour-hand'
    },
    {
        title: '步骤3/7：月份环',
        desc: '金色的第二圈上刻着 JANUARY 到 DECEMBER。这个环会<strong>缓慢旋转</strong>，让当前日期总是出现在正上方（12点位置）。你现在可以看到<strong>当前月份</strong>的刻度就在最上面！',
        highlight: 'month-ring'
    },
    {
        title: '步骤4/7：太阳指针 ☀',
        desc: '金色的、末端有个<strong>小太阳圆盘</strong>的指针。它指向太阳在天空中的实时位置。<br><br>它永远和真实空间同步：如果它在<strong>表盘上半部分（天空）</strong>，说明现在是白天！如果在<strong>下半部分（地平线以下）</strong>，就是晚上。',
        highlight: 'sun-hand'
    },
    {
        title: '步骤5/7：月亮指针 ☽',
        desc: '银蓝色的、末端有<strong>新月牙形</strong>图标的指针。它比太阳指针转得快（每月多绕一圈）。<br><br>月亮和太阳的角度差 = 月相！<br>• 重叠 = 新月（朔）<br>• 对面 = 满月（望）',
        highlight: 'moon-hand'
    },
    {
        title: '步骤6/7：罗睹/计都 食线 ☠',
        desc: '暗红色的线，上方蛇头→<strong>罗睹 (升交点)</strong>，下方叉尾→<strong>计都 (降交点)</strong>。<br><br>当太阳、月亮、和这根线三者对齐时，就会发生<strong>日食或月食</strong>！左边的“日食/月食风险”栏会自动警告。',
        highlight: 'dragon-hand'
    },
    {
        title: '步骤7/7：黄道十二宫 ♈',
        desc: '金色的星座符号环。太阳指针指向哪个星座 = 当前太阳星座。<br><br>这个环会每天多转约4分钟（因为恒星时比普通时钟快）。<br><br>🎉 恭喜你学会了！现在你已经是一个合格的“看懂吉尼斯纪录级表盘”的人了！',
        highlight: 'rete-zodiac'
    }
];

function startTutorial() {
    tutorialRunning = true;
    tutorialStep = 0;
    showTutorialStep();
}

function showTutorialStep() {
    if (tutorialStep >= TUTORIAL_STEPS.length) {
        tutorialRunning = false;
        // Clear all highlights
        document.querySelectorAll('.astro-hand, #bezel-24h, #month-ring, #rete-zodiac, #portrait-dial').forEach(el => {
            el.style.filter = '';
            el.style.opacity = '';
        });
        document.getElementById('explain-box').innerHTML = '<p>🎉 <strong>教程完成！</strong> 现在你已经知道每根指针代表什么了。点击下面的按钮可以随时查看单个功能的详细说明。</p>';
        return;
    }

    const step = TUTORIAL_STEPS[tutorialStep];
    const box = document.getElementById('explain-box');

    // Highlight the target element
    document.querySelectorAll('.astro-hand, #bezel-24h, #month-ring, #rete-zodiac, #portrait-dial').forEach(el => {
        el.style.filter = '';
        el.style.opacity = '0.2';
        el.style.transition = 'opacity 0.5s ease';
    });
    const target = document.getElementById(step.highlight);
    if (target) {
        target.style.opacity = '1';
        target.style.filter = 'drop-shadow(0 0 8px rgba(229,185,61,0.8))';
    }

    box.innerHTML = `
        <div style="border-bottom:1px solid rgba(201,161,74,0.3); padding-bottom:8px; margin-bottom:10px;">
            <strong style="color:#e5b93d;">${step.title}</strong>
        </div>
        <p>${step.desc}</p>
        <div style="margin-top:12px; display:flex; gap:8px;">
            ${tutorialStep > 0 ? '<button onclick="prevTutorial()" style="flex:1; padding:6px; background:rgba(100,100,100,0.3); border:1px solid #555; color:#aaa; border-radius:4px; cursor:pointer; font-family:inherit;">← 上一步</button>' : ''}
            <button onclick="nextTutorial()" style="flex:1; padding:6px; background:rgba(229,185,61,0.2); border:1px solid #c9a14a; color:#e5b93d; border-radius:4px; cursor:pointer; font-family:inherit;">
                ${tutorialStep < TUTORIAL_STEPS.length - 1 ? '下一步 →' : '✅ 完成！'}
            </button>
        </div>
    `;
}

function nextTutorial() {
    tutorialStep++;
    showTutorialStep();
}

function prevTutorial() {
    if (tutorialStep > 0) tutorialStep--;
    showTutorialStep();
}

// ═══════════════════════════════════════════
//  INFO MODAL POPUPS
// ═══════════════════════════════════════════

const INFO_DATA = {
    'local-time': {
        title: '⏰ 当地时间 (Local Time)',
        body: `这就是你手机上显示的那个时间，没有任何天文花活。<br><br>
        <strong>它是怎么来的？</strong> 你的电脑/手机从你所在时区的标准时间读取，精确到秒。在中国就是 UTC+8（东八区标准时间）。<br><br>
        <strong>和"恒星时"的区别：</strong> 当地时间是按太阳定义的（太阳到最高点=正午），而恒星时是按星星定义的。两者每天会差大约 <strong>3分56秒</strong>，因为地球一边自转一边还在绕太阳公转。<br><br>
        <span class="info-formula">当地时间 = UTC 时间 + 时区偏移量（中国 = UTC + 8小时）</span>`
    },
    'sidereal': {
        title: '⭐ 恒星时 (Sidereal Time)',
        body: `恒星时是天文学家用的"真正的时钟"——它不看太阳，而是看<strong>遥远的恒星</strong>。<br><br>
        <strong>为什么不一样？</strong> 因为地球绕太阳转一圈需要365天，每天相对于恒星多转了一点点（约 0.986°），所以恒星日比太阳日短大约 <strong>3分56秒</strong>。<br><br>
        <strong>傻瓜版解释：</strong> 如果你每天同一时刻看天上的猎户座，会发现它每天都稍微偏了一点。恒星时就是准确跟踪这个偏移的时钟。天文台用它来对准望远镜指向特定的星星。<br><br>
        <span class="info-formula">本地恒星时(LST) = 格林威治恒星时(GMST) + 观测者经度<br>
        GMST = 280.46° + 360.986°/天 × (JD − 2451545.0)</span>
        <br><br>表盘上的<strong>黄道十二宫环</strong>就是跟着恒星时旋转的。`
    },
    'sun-az': {
        title: '🧭 太阳方位角 (Solar Azimuth)',
        body: `太阳方位角告诉你太阳现在在你的<strong>哪个方向</strong>。<br><br>
        <strong>怎么看？</strong><br>
        • <strong>0° = 正北</strong><br>
        • <strong>90° = 正东</strong>（太阳早上从这里升起）<br>
        • <strong>180° = 正南</strong>（太阳中午在这里最高）<br>
        • <strong>270° = 正西</strong>（太阳傍晚从这里落下）<br><br>
        <strong>傻瓜版：</strong> 如果显示 180°，你面朝南方就能看到太阳。如果显示 90°，太阳在你的正东方。<br><br>
        <span class="info-formula">Az = arctan2(−sin(HA), tan(δ)·cos(φ) − sin(φ)·cos(HA))<br>
        HA = 太阳时角, δ = 太阳赤纬, φ = 观测者纬度</span>`
    },
    'sun-alt': {
        title: '📐 太阳高度角 (Solar Altitude)',
        body: `太阳高度角告诉你太阳离<strong>地平线有多高</strong>。<br><br>
        <strong>怎么看？</strong><br>
        • <strong>0° = 太阳就在地平线上</strong>（日出或日落的瞬间）<br>
        • <strong>90° = 太阳正好在你头顶</strong>（只有热带才可能）<br>
        • <strong>负数 = 太阳在地平线下</strong>（夜晚！）<br><br>
        <strong>实用意义：</strong><br>
        • 高度角 > 0°：白天，能看到太阳<br>
        • -6° ~ 0°：民用黎明/黄昏（天还亮着）<br>
        • -12° ~ -6°：航海黎明/黄昏（地平线还能看见）<br>
        • < -18°：完全天文黑夜<br><br>
        <span class="info-formula">Alt = arcsin(sin(δ)·sin(φ) + cos(δ)·cos(φ)·cos(HA))</span>`
    },
    'sunrise': {
        title: '🌅 日出 / 日落 (Sunrise / Sunset)',
        body: `太阳升起和落下的大概时刻（当地时间）。<br><br>
        <strong>怎么算的？</strong> 当太阳高度角恰好等于 <strong>−0.8333°</strong>（考虑大气折射后的标准日出角度）时，就是日出/日落的时刻。<br><br>
        <strong>为什么每天都不一样？</strong> 因为地球的自转轴是<strong>倾斜</strong>的（约23.44°）。夏天太阳升得高、白天长；冬天太阳升得低、白天短。在北极，夏天太阳根本不落（极昼），冬天太阳根本不升（极夜）。<br><br>
        <span class="info-formula">H₀ = arccos[(sin(−0.8333°) − sin(φ)·sin(δ)) / (cos(φ)·cos(δ))]<br>
        日出 ≈ 12:00 − H₀ / 15°/h<br>
        日落 ≈ 12:00 + H₀ / 15°/h</span>`
    },
    'moon-phase': {
        title: '🌙 月相 (Moon Phase)',
        body: `月相是月亮被太阳从地球角度看上去照亮了多少。<br><br>
        <strong>八种月相：</strong><br>
        🌑 <strong>新月（朔）</strong>：月亮在太阳和地球之间，完全看不到<br>
        🌒 <strong>蛾眉月</strong>：刚露出一点弯弯的月牙<br>
        🌓 <strong>上弦月</strong>：右半边亮（半月）<br>
        🌔 <strong>盈凸月</strong>：大部分都亮了，快满月了<br>
        🌕 <strong>满月（望）</strong>：全圆！太阳和月亮分别在地球两侧<br>
        🌖 <strong>亏凸月</strong>：开始变暗了<br>
        🌗 <strong>下弦月</strong>：左半边亮<br>
        🌘 <strong>残月</strong>：快消失了<br><br>
        <strong>一个完整周期 ≈ 29.53天</strong>（朔望月）。表盘上太阳指针和月亮指针的角度差就代表当前月相！`
    },
    'moon-age': {
        title: '📆 月龄 (Moon Age)',
        body: `月龄就是从上一次<strong>新月（朔）</strong>到现在过了多少天。<br><br>
        <strong>怎么读？</strong><br>
        • <strong>0天</strong> = 新月（完全看不到月亮）<br>
        • <strong>~7.4天</strong> = 上弦月（半月）<br>
        • <strong>~14.8天</strong> = 满月（全圆的月亮）<br>
        • <strong>~22.1天</strong> = 下弦月（另一半月）<br>
        • <strong>~29.5天</strong> = 又回到新月<br><br>
        <strong>实用意义：</strong> 渔民用它来判断潮汐（满月和新月时潮汐最大）。摄影师用它来判断什么时候拍月亮最好看。<br><br>
        <span class="info-formula">月龄 = (月球黄经 − 太阳黄经 + 360°) mod 360° ÷ 360° × 29.53天</span>`
    },
    'moonrise': {
        title: '🌔 月出 / 月落 (Moonrise / Moonset)',
        body: `月亮升起和落下的大概时刻。<br><br>
        <strong>和日出不一样的是：</strong> 月出时间每天会推迟约 <strong>50分钟</strong>！因为月亮一边绕地球转（一个月一圈），一边跟着地球转。<br><br>
        <strong>简单记法：</strong><br>
        • 新月时：月出≈日出，月落≈日落（和太阳同步，所以看不到）<br>
        • 满月时：月出≈日落，月落≈日出（太阳落了月亮升，反着来）<br>
        • 上弦月：月亮在中午升起，半夜落下<br><br>
        ⚠️ 注意：这里的数值是近似计算，实际月出月落受观测者纬度和月球轨道倾角影响较大。`
    },
    'zodiac-sign': {
        title: '♈ 黄道星座 (Zodiac Sign)',
        body: `这是太阳当前正在穿越的<strong>黄道星座</strong>。<br><br>
        <strong>什么是黄道？</strong> 从地球上看，太阳一年在天空中走过的那条路径叫"黄道"（Ecliptic）。这条路径恰好穿过12个星座：<br><br>
        ♈ 白羊 → ♉ 金牛 → ♊ 双子 → ♋ 巨蟹 → ♌ 狮子 → ♍ 处女<br>
        ♎ 天秤 → ♏ 天蝎 → ♐ 射手 → ♑ 摩羯 → ♒ 水瓶 → ♓ 双鱼<br><br>
        <strong>⚠️ 重要区别：</strong> 这里显示的是<strong>天文星座</strong>（太阳实际在哪个星座区域），和占星术的"星座运势"有差别。由于地轴进动（岁差），天文星座和占星星座已经偏移了约1个月。<br><br>
        <span class="info-formula">太阳黄经 ÷ 30° = 当前星座编号<br>
        例：太阳黄经 = 345° → 345 ÷ 30 = 11 → ♓ 双鱼座</span>`
    },
    'eclipse': {
        title: '⚠️ 日食/月食风险 (Eclipse Risk)',
        body: `这栏实时预估当前发生日食或月食的概率。<br><br>
        <strong>日食/月食是怎么发生的？</strong><br>
        • <strong>日食</strong>：月亮刚好挡在太阳和地球之间（新月 + 靠近交点）<br>
        • <strong>月食</strong>：地球刚好挡在太阳和月亮之间（满月 + 靠近交点）<br><br>
        <strong>为什么不是每个月都有？</strong> 因为月球轨道和黄道平面有约 5.14° 的倾角。只有当月亮同时满足：①新月或满月 ②靠近轨道交点（罗睺/计都），才会发生食。<br><br>
        <strong>判断标准：</strong><br>
        • ✅ <strong>安全</strong>：太阳/月亮远离交点线<br>
        • 🔶 <strong>中风险</strong>：有一定靠近但角度不够<br>
        • ⚠️ <strong>高风险</strong>：太阳、月亮、交点三者几乎对齐<br><br>
        <span class="info-formula">风险 = f(|太阳黄经 − 月球黄经|, |月球纬度参数 F|)<br>
        高风险条件：角距 < 12° 且 F 近交点 < 10°</span>`
    },
    'eot': {
        title: '⏳ 均时差 (Equation of Time)',
        body: `均时差是<strong>真太阳时</strong>和<strong>平太阳时</strong>（你的钟表时间）之间的差值。<br><br>
        <strong>傻瓜版解释：</strong> 你以为太阳每天都是"精确地"24小时走一圈？其实不是！地球公转轨道是椭圆形的，而且自转轴还是歪的，所以太阳每天到达最高点的时间有快有慢。均时差就是这个快慢的偏差。<br><br>
        <strong>怎么读？</strong><br>
        • <strong>正值</strong>（如 +14分）：太阳比钟表<strong>早</strong>到最高点<br>
        • <strong>负值</strong>（如 −14分）：太阳比钟表<strong>晚</strong>到最高点<br><br>
        <strong>范围：</strong> 大约在 −14分钟 到 +16分钟 之间波动，一年画一个"8字形"曲线（日行迹 / Analemma）。<br><br>
        <span class="info-formula">EoT = y·sin(2L₀) − 2e·sin(M) + 4ey·sin(M)cos(2L₀) − ½y²sin(4L₀) − 1.25e²sin(2M)<br>
        其中 y = tan²(ε/2), e = 轨道离心率, L₀ = 太阳平黄经, M = 平近点角</span>`
    }
};

function showInfo(key) {
    const data = INFO_DATA[key];
    if (!data) return;
    document.getElementById('info-modal-title').innerHTML = data.title;
    document.getElementById('info-modal-body').innerHTML = data.body;
    document.getElementById('info-modal').style.display = 'flex';
}

function closeInfo() {
    document.getElementById('info-modal').style.display = 'none';
}
