/**
 * 北京天文钟 — Beijing Astronomical Clock Engine v3
 * Real-time button status, hover highlight, Beijing lat, fixed sun/moon.
 */
document.addEventListener('DOMContentLoaded', () => {

    const NS = 'http://www.w3.org/2000/svg';
    const INK = '#3b2c24';
    const FAINT = 'rgba(59,44,36,0.25)';
    const GOLD = '#b8860b';
    const svg = document.getElementById('orloj-svg');

    setTimeout(() => { const e = document.getElementById('entrance-overlay'); if (e) e.style.display = 'none'; }, 5500);

    // =============================================
    // 1. SVG GENERATION
    // =============================================
    const dizhi = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
    const dizhiTime = ['23-01', '01-03', '03-05', '05-07', '07-09', '09-11', '11-13', '13-15', '15-17', '17-19', '19-21', '21-23'];
    const chineseHours = document.getElementById('chinese-hours');
    const chineseTicks = document.getElementById('chinese-ticks');
    if (chineseHours) {
        for (let i = 0; i < 12; i++) {
            const a = (i * 30 - 90) * Math.PI / 180, r = 472;
            const t = document.createElementNS(NS, 'text');
            t.setAttribute('x', String(r * Math.cos(a)));
            t.setAttribute('y', String(r * Math.sin(a) + 5));
            t.setAttribute('text-anchor', 'middle');
            t.setAttribute('class', 'orloj-text-chinese');
            t.textContent = dizhi[i] + '时';
            chineseHours.appendChild(t);
        }
    }
    if (chineseTicks) {
        for (let i = 0; i < 360; i += 15) {
            const l = document.createElementNS(NS, 'line');
            l.setAttribute('x1', '0'); l.setAttribute('y1', '-440');
            l.setAttribute('x2', '0'); l.setAttribute('y2', '-460');
            l.setAttribute('transform', `rotate(${i})`);
            l.setAttribute('stroke', INK); l.setAttribute('stroke-width', '1');
            chineseTicks.appendChild(l);
        }
    }

    const romanG = document.getElementById('roman-24h'), romanTk = document.getElementById('roman-ticks');
    const rom = ['XII', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI'];
    if (romanG) {
        for (let i = 0; i < 24; i++) {
            const a = (i * 15 - 90) * Math.PI / 180, r = 407;
            const t = document.createElementNS(NS, 'text');
            t.setAttribute('x', String(r * Math.cos(a)));
            t.setAttribute('y', String(r * Math.sin(a) + 7));
            t.setAttribute('text-anchor', 'middle');
            t.setAttribute('class', 'orloj-text-roman');
            t.setAttribute('transform', `rotate(${i * 15}, ${r * Math.cos(a)}, ${r * Math.sin(a)})`);
            t.textContent = rom[i % 12]; romanG.appendChild(t);
        }
    }
    if (romanTk) {
        for (let i = 0; i < 360; i++) {
            if (i % 15 === 0) continue;
            const l = document.createElementNS(NS, 'line');
            l.setAttribute('x1', '0'); l.setAttribute('y1', i % 5 === 0 ? '-395' : '-400');
            l.setAttribute('x2', '0'); l.setAttribute('y2', '-420');
            l.setAttribute('transform', `rotate(${i})`);
            l.setAttribute('stroke', INK); l.setAttribute('stroke-width', i % 5 === 0 ? '0.8' : '0.3');
            romanTk.appendChild(l);
        }
    }

    const pH = document.getElementById('planetary-hours');
    if (pH) {
        for (let i = 0; i < 12; i++) {
            const a = (i * 30 - 90) * Math.PI / 180;
            const l = document.createElementNS(NS, 'line');
            l.setAttribute('x1', '0'); l.setAttribute('y1', '0');
            l.setAttribute('x2', String(393 * Math.cos(a)));
            l.setAttribute('y2', String(393 * Math.sin(a)));
            l.setAttribute('stroke', FAINT); l.setAttribute('stroke-width', '0.3');
            pH.appendChild(l);
        }
    }

    const zDiv = document.getElementById('zodiac-divisions'), zSym = document.getElementById('zodiac-symbols');
    const zData = ['♈', '♉', '♊', '♋', '♌', '♍', '♎', '♏', '♐', '♑', '♒', '♓'];
    const zNames = ['白羊', '金牛', '双子', '巨蟹', '狮子', '处女', '天秤', '天蝎', '射手', '摩羯', '水瓶', '双鱼'];
    if (zDiv && zSym) {
        for (let i = 0; i < 12; i++) {
            const a1 = (i * 30 - 90) * Math.PI / 180, a2 = ((i + 0.5) * 30 - 90) * Math.PI / 180;
            const l = document.createElementNS(NS, 'line');
            l.setAttribute('x1', String(160 * Math.cos(a1))); l.setAttribute('y1', String(50 + 160 * Math.sin(a1)));
            l.setAttribute('x2', String(195 * Math.cos(a1))); l.setAttribute('y2', String(50 + 195 * Math.sin(a1)));
            l.setAttribute('stroke', INK); l.setAttribute('stroke-width', '0.8');
            l.setAttribute('opacity', '0'); l.style.animation = 'fadeIn 0.8s 8s forwards';
            zDiv.appendChild(l);
            const t = document.createElementNS(NS, 'text');
            t.setAttribute('x', String(177 * Math.cos(a2))); t.setAttribute('y', String(50 + 177 * Math.sin(a2) + 4));
            t.setAttribute('text-anchor', 'middle'); t.setAttribute('class', 'orloj-text-zodiac');
            t.textContent = zData[i]; zSym.appendChild(t);
        }
    }

    // =============================================
    // 2. ASTRONOMY (Beijing 39.9°N, 116.4°E)
    // =============================================
    function julianDay(y, m, d) {
        if (m <= 2) { y--; m += 12; }
        const A = Math.floor(y / 100);
        return Math.floor(365.25 * (y + 4716)) + Math.floor(30.6001 * (m + 1)) + d + 2 - A + Math.floor(A / 4) - 1524.5;
    }

    function sunLongitude(dt) {
        const hrs = dt.getHours() + dt.getMinutes() / 60 + dt.getSeconds() / 3600;
        const J = julianDay(dt.getFullYear(), dt.getMonth() + 1, dt.getDate() + hrs / 24);
        const T = (J - 2451545.0) / 36525;
        const L0 = 280.46646 + 36000.76983 * T;
        const M = (357.52911 + 35999.05029 * T) * Math.PI / 180;
        const C = (1.914602 - 0.004817 * T) * Math.sin(M)
            + 0.019993 * Math.sin(2 * M)
            + 0.000290 * Math.sin(3 * M);
        return ((L0 + C) % 360 + 360) % 360;
    }

    function sunDeclination(dt) {
        const lon = sunLongitude(dt) * Math.PI / 180;
        const obliquity = 23.4393 * Math.PI / 180;
        return Math.asin(Math.sin(obliquity) * Math.sin(lon)) * 180 / Math.PI;
    }

    function moonLongitude(dt) {
        const J = julianDay(dt.getFullYear(), dt.getMonth() + 1, dt.getDate());
        const T = (J - 2451545.0) / 36525;
        const L = 218.3165 + 481267.8813 * T;
        const D = (297.8502 + 445267.1115 * T) * Math.PI / 180;
        const M = (357.5291 + 35999.0503 * T) * Math.PI / 180;
        const Mp = (134.9634 + 477198.8676 * T) * Math.PI / 180;
        let lon = L + 6.289 * Math.sin(Mp) - 1.274 * Math.sin(2 * D - Mp)
            - 0.658 * Math.sin(2 * D) + 0.214 * Math.sin(2 * Mp);
        return ((lon % 360) + 360) % 360;
    }

    function moonPhase(dt) {
        const J = julianDay(dt.getFullYear(), dt.getMonth() + 1, dt.getDate() + dt.getHours() / 24);
        let p = ((J - 2451550.1) % 29.53058886) / 29.53058886;
        return p < 0 ? p + 1 : p;
    }

    function moonPhaseName(phase) {
        if (phase < 0.03 || phase > 0.97) return '🌑 新月';
        if (phase < 0.22) return '🌒 蛾眉月';
        if (phase < 0.28) return '🌓 上弦月';
        if (phase < 0.47) return '🌔 盈凸月';
        if (phase < 0.53) return '🌕 满月';
        if (phase < 0.72) return '🌖 亏凸月';
        if (phase < 0.78) return '🌗 下弦月';
        return '🌘 残月';
    }

    function siderealDeg(dt) {
        const J = julianDay(dt.getFullYear(), dt.getMonth() + 1, dt.getDate());
        const T = (J - 2451545.0) / 36525;
        let G = 280.46061837 + 360.98564736629 * (J - 2451545.0) + 0.000387933 * T * T;
        const hrs = dt.getHours() + dt.getMinutes() / 60 + dt.getSeconds() / 3600;
        G += hrs * 15 + 116.4; // Beijing longitude
        return ((G % 360) + 360) % 360;
    }

    function getZodiacSign(sunLon) {
        const idx = Math.floor(sunLon / 30);
        return zData[idx] + zNames[idx];
    }

    function getCurrentShichen(h) {
        // Map to dizhi index: 子(23-1), 丑(1-3), ...
        const idx = Math.floor(((h + 1) % 24) / 2);
        return dizhi[idx] + '时 (' + dizhiTime[idx] + ')';
    }

    // =============================================
    // 3. REAL-TIME CLOCK + BUTTON STATUS
    // =============================================
    const hH = document.getElementById('hl-hour-hand');
    const mH = document.getElementById('hl-minute-hand');
    const sH = document.getElementById('hl-second-hand');
    const sunH = document.getElementById('hl-sun-hand');
    const moonH = document.getElementById('hl-moon-hand');
    const sidH = document.getElementById('hl-sidereal');
    const mPD = document.getElementById('moon-phase-dial');

    // Status text elements (populated in section 6)
    const statusEls = {};

    function tick() {
        const now = new Date();
        const h = now.getHours(), m = now.getMinutes(), s = now.getSeconds(), ms = now.getMilliseconds();

        // Clock hands
        const secA = (s + ms / 1000) * 6;
        const minA = (m + s / 60) * 6;
        const hourA = ((h % 12) + m / 60) * 30;
        if (hH) hH.setAttribute('transform', `rotate(${hourA})`);
        if (mH) mH.setAttribute('transform', `rotate(${minA})`);
        if (sH) sH.setAttribute('transform', `rotate(${secA})`);

        // Sun hand — maps 24h to 360°
        const sunDayAngle = (h + m / 60 + s / 3600) * 15;
        if (sunH) sunH.setAttribute('transform', `rotate(${sunDayAngle})`);

        // Moon hand — offset from sun by the angular distance between moon and sun longitudes
        const sLon = sunLongitude(now);
        const mLon = moonLongitude(now);
        let moonOffset = mLon - sLon;
        if (moonOffset < 0) moonOffset += 360;
        const moonAngle = sunDayAngle + moonOffset;
        if (moonH) moonH.setAttribute('transform', `rotate(${moonAngle})`);

        // Moon phase visual (0 = new, 0.5 = full)
        const phase = moonPhase(now);
        if (mPD) {
            const illumination = phase <= 0.5 ? phase * 2 : (1 - phase) * 2;
            mPD.setAttribute('opacity', String(1 - illumination));
        }

        // Sidereal hand
        const sid = siderealDeg(now);
        if (sidH) sidH.setAttribute('transform', `rotate(${sid})`);

        // === UPDATE BUTTON STATUS TEXT ===
        const pad = n => String(n).padStart(2, '0');
        const sunDecl = sunDeclination(now);

        if (statusEls.shichen) statusEls.shichen.textContent = `现在：${getCurrentShichen(h)}`;
        if (statusEls.cancer) statusEls.cancer.textContent = `太阳赤纬 ${sunDecl > 0 ? '+' : ''}${sunDecl.toFixed(1)}° ${sunDecl > 20 ? '↑接近' : sunDecl > 0 ? '在上方' : '在下方'}`;
        if (statusEls.equator) statusEls.equator.textContent = `赤纬 ${sunDecl > 0 ? '+' : ''}${sunDecl.toFixed(1)}° ${Math.abs(sunDecl) < 2 ? '≈ 在赤道上！' : ''}`;
        if (statusEls.capricorn) statusEls.capricorn.textContent = `太阳赤纬 ${sunDecl.toFixed(1)}° ${sunDecl < -20 ? '↓接近' : ''}`;
        if (statusEls.day) {
            const sunUp = sunDayAngle >= 0 && sunDayAngle < 180;
            statusEls.day.textContent = sunUp ? '☀️ 现在是白天' : '🌙 现在是夜晚';
        }
        if (statusEls.dawn) statusEls.dawn.textContent = `太阳角度 ${sunDayAngle.toFixed(0)}°`;
        if (statusEls.night) {
            const isNight = h >= 19 || h < 5;
            statusEls.night.textContent = isNight ? '⬛ 现在是夜晚' : '🔵 现在不是夜晚';
        }
        if (statusEls.observer) statusEls.observer.textContent = '📍 北京 39.9°N';
        if (statusEls.clock24) statusEls.clock24.textContent = `⏰ ${pad(h)}:${pad(m)}:${pad(s)}`;
        if (statusEls.zodiac) statusEls.zodiac.textContent = `太阳在 ${getZodiacSign(sLon)}`;
        if (statusEls.sun) statusEls.sun.textContent = `黄经 ${sLon.toFixed(1)}° → ${getZodiacSign(sLon)}`;
        if (statusEls.moon) statusEls.moon.textContent = `${moonPhaseName(phase)} (${(phase * 100).toFixed(0)}%)`;
        if (statusEls.sidereal) {
            const sidH_val = (sid / 15);
            const sidHr = Math.floor(sidH_val);
            const sidMin = Math.floor((sidH_val - sidHr) * 60);
            statusEls.sidereal.textContent = `恒星时 ${pad(sidHr)}h${pad(sidMin)}m`;
        }
        if (statusEls.horizon) statusEls.horizon.textContent = `太阳时角 ${sunDayAngle.toFixed(0)}°`;
        if (statusEls.sunset) {
            const approxSunset = 18 + sunDecl * 0.06;
            statusEls.sunset.textContent = `约 ${Math.floor(approxSunset)}:${pad(Math.round((approxSunset % 1) * 60))} 日落`;
        }
        if (statusEls.planetary) {
            const planets = ['☉日', '☽月', '♂火', '☿水', '♃木', '♀金', '♄土'];
            const dayOfWeek = now.getDay();
            statusEls.planetary.textContent = `今日守护 ${planets[dayOfWeek]}`;
        }

        requestAnimationFrame(tick);
    }
    setTimeout(tick, 10000);

    // =============================================
    // 4. FEATURES WITH HIGHLIGHT IDS + STATUS KEYS
    // =============================================
    const features = [
        // LEFT (8)
        {
            side: 'left', label: '十二时辰 · 地支', hlIds: ['hl-frame'], statusKey: 'shichen',
            title: '十二时辰 — 地支计时',
            desc: '最外圈的"子丑寅卯辰巳午未申酉戌亥"是中国传统十二时辰。每个时辰等于现代的2小时。子时=23:00-01:00（深夜），午时=11:00-13:00（正午）。这是北京天文钟独有的中国元素！',
            demoNote: '🕐 子时=23-01 丑=01-03 寅=03-05\n🕐 卯=05-07 辰=07-09 巳=09-11\n🕐 午=11-13 未=13-15 申=15-17\n🕐 酉=17-19 戌=19-21 亥=21-23',
            demo: demoShichen, details: '<h3>口诀</h3><p>子夜丑鸡寅平旦，卯兔辰龙巳蛇盘，午马未羊申猴叫，酉鸡戌狗亥猪眠。</p>'
        },

        {
            side: 'left', label: '北回归线 · Cancer', hlIds: ['hl-tropic-cancer'], statusKey: 'cancer',
            title: '北回归线 — 夏至线',
            desc: '最内的虚线圆。夏至(6月21日)太阳到达这里，北京白天最长约15小时。太阳赤纬越接近+23.44°越接近这条线。',
            demoNote: '🔵 内侧虚线圆 = 北回归线\n☀️ 夏至时太阳在这里 = 白天最长\n📍 夏至北京：日出5:14 日落19:46',
            demo: demoCancer, details: '<h3>北京的夏至</h3><p>白天长达14.5小时。太阳高度角73.5°。</p>'
        },

        {
            side: 'left', label: '赤道 · Equator', hlIds: ['hl-equator'], statusKey: 'equator',
            title: '赤道 — 春分秋分线',
            desc: '中间的虚线圆。春分和秋分时太阳在赤道上(赤纬≈0°)，全球昼夜等长。',
            demoNote: '⭕ 中间虚线圆 = 天球赤道\n🟡 赤纬=0° → 春分/秋分\n↕ 赤纬>0 → 夏半年 赤纬<0 → 冬半年',
            demo: demoEquator, details: '<h3>怎么看</h3><p>按钮旁实时显示太阳赤纬。接近0°=接近春秋分。</p>'
        },

        {
            side: 'left', label: '南回归线 · Capricorn', hlIds: ['hl-tropic-capricorn'], statusKey: 'capricorn',
            title: '南回归线 — 冬至线',
            desc: '最外的虚线圆。冬至(12月21日)太阳到这里，北京白天最短约9.2小时。赤纬接近-23.44°时就在这条线附近。',
            demoNote: '🟤 外侧虚线圆 = 南回归线\n❄️ 冬至時太阳在这里 = 白天最短',
            demo: demoCapricorn, details: '<h3>北京的冬至</h3><p>白天仅9.3小时。太阳高度角仅26.6°。</p>'
        },

        {
            side: 'left', label: '白天区 · Daytime', hlIds: ['hl-day'], statusKey: 'day',
            title: '白天区域 — 蓝色地带',
            desc: '蓝色淡影区域=白天。金色太阳在蓝色区里=现在是白天！',
            demoNote: '🔵 蓝色 = 白天\n🟠 橙色 = 黎明/黄昏 ⬛ 深色 = 夜晚\n☀️ 看太阳在哪个颜色的区域就行',
            demo: demoDayNight, details: '<h3>一句话</h3><p>看太阳图标在哪个颜色里。蓝色=白天，深色=夜晚。</p>'
        },

        {
            side: 'left', label: '黎明黄昏 · Twilight', hlIds: ['hl-twilight'], statusKey: 'dawn',
            title: '黎明与黄昏 — 橙色地带',
            desc: '蓝色和深色之间的橙色窄条=黎明(左)或黄昏(右)。太阳刚在地平线附近的时间段。',
            demoNote: '🟠 左橙 = 黎明 Aurora\n🟠 右橙 = 黄昏 Crepusculum',
            demo: demoTwilight, details: '<h3>北京暮光</h3><p>夏天黄昏约30分钟，冬天约25分钟。</p>'
        },

        {
            side: 'left', label: '夜晚 · Night', hlIds: ['hl-night'], statusKey: 'night',
            title: '夜晚区域 — 深色地带',
            desc: '深色区域=夜晚。太阳在这里时=北京是黑夜。',
            demoNote: '⬛ 深色区 = 完全的夜晚\n🌙 太阳在这里 = 黑夜 ⭐',
            demo: demoNight, details: '<h3>一句话</h3><p>太阳在深色区=夜晚。</p>'
        },

        {
            side: 'left', label: '观测者 · Observer', hlIds: ['hl-observer'], statusKey: 'observer',
            title: '观测者位置 — 北京',
            desc: '小黑点=天顶（头顶正上方）。所有圆圈专为北京39.9°N计算。',
            demoNote: '⚫ 小黑点 = 天顶\n📍 北京 39.9°N 专属底盘',
            demo: demoObserver, details: '<h3>为什么</h3><p>底盘针对一个纬度设计。搬到别的城市就不对了。</p>'
        },

        // RIGHT (8)
        {
            side: 'right', label: '24小时钟 · Clock', hlIds: ['hl-roman'], statusKey: 'clock24',
            title: '24小时罗马数字钟',
            desc: '金色内圈罗马数字(I-XII×2)=24小时。XII在顶=正午&午夜。粗针=时针，细针=分针。',
            demoNote: '🔢 XII(顶)=12:00&0:00 VI(底)=6:00&18:00\n⏰ 粗针=时 细针=分',
            demo: demo24h, details: '<h3>读法</h3><p>和普通钟一样！看粗针对应的数字。</p>'
        },

        {
            side: 'right', label: '黄道十二宫 · Zodiac', hlIds: ['hl-zodiac'], statusKey: 'zodiac',
            title: '黄道十二宫 — 星座环',
            desc: '偏心内圆环上12个星座符号。太阳图标在哪个格子=太阳现在在哪个星座。',
            demoNote: '♈白羊 ♉金牛 ♊双子 ♋巨蟹 ♌狮子 ♍处女\n♎天秤 ♏天蝎 ♐射手 ♑摩羯 ♒水瓶 ♓双鱼',
            demo: demoZodiac, details: '<h3>当前</h3><p>看按钮旁的实时星座显示！</p>'
        },

        {
            side: 'right', label: '太阳针 · Sun Hand', hlIds: ['hl-sun-hand'], statusKey: 'sun',
            title: '太阳指针 ☉ — 最重要的针',
            desc: '金色指针+太阳图标(☉)同时告诉你3件事：①看罗马数字→几点 ②蓝色/深色→白天/黑夜 ③在哪个星座→太阳星座',
            demoNote: '☀️ 一根针看三件事\n① 对罗马数字→现在几点\n② 在蓝=白天 深色=黑夜\n③ 对星座→太阳星座',
            demo: demoSunHand, details: '<h3>运动</h3><p>24小时转一圈(15°/小时)。每天在黄道上移~1°。</p>'
        },

        {
            side: 'right', label: '月亮针 · Moon', hlIds: ['hl-moon-hand'], statusKey: 'moon',
            title: '月亮指针 ☽ — 月相球',
            desc: '银色指针+圆球=月亮。球自动旋转显示月相：全亮=满月，全暗=新月。比太阳快，约27天转一圈。',
            demoNote: '🌑全暗=新月 🌓半亮=上弦\n🌕全亮=满月 🌗半暗=下弦\n🔄 约27天转一圈',
            demo: demoMoonHand, details: '<h3>周期</h3><p>新月→上弦(7天)→满月(15天)→下弦(22天)→新月(29.5天)</p>'
        },

        {
            side: 'right', label: '恒星时 · Sidereal', hlIds: ['hl-sidereal'], statusKey: 'sidereal',
            title: '恒星时 — 星星的时钟',
            desc: '最细虚线指针=恒星时。追踪遥远恒星而不是太阳。恒星日≈23h56m，每天比太阳快约4分钟。',
            demoNote: '--- 虚线针 = 恒星时\n⏱ 每天比太阳快~4分钟\n📅 一年多转一整圈',
            demo: demoSidereal, details: '<h3>用途</h3><p>天文学家用它确定星星在天空中的位置。</p>'
        },

        {
            side: 'right', label: '地平线 · Horizon', hlIds: ['hl-horizon'], statusKey: 'horizon',
            title: '地平线 — 天地分界',
            desc: '表盘中间水平粗线=地平线。上方=天空(可见)，下方=地面以下(不可见)。太阳越过=日出/日落。',
            demoNote: '━━━ 水平粗线 = 地平线\n⬆天空(可见) ⬇地面以下(不可见)\n☀️ 越过=日出！',
            demo: demoHorizon, details: '<h3>最直观</h3><p>太阳在线上方=白天 线下方=夜晚</p>'
        },

        {
            side: 'right', label: '日落 · Sunset', hlIds: ['hl-twilight'], statusKey: 'sunset',
            title: '日落 — 太阳落山',
            desc: '右侧蓝→橙交界=日落时刻。对应罗马数字=日落几点。',
            demoNote: '🌅 右侧蓝→橙 = 日落！\n⏰ 看对应罗马数字',
            demo: demoSunset, details: '<h3>北京日落</h3><ul><li>春分~18:15 夏至~19:46</li><li>秋分~18:00 冬至~16:53</li></ul>'
        },

        {
            side: 'right', label: '行星时 · Planetary', hlIds: ['hl-planetary'], statusKey: 'planetary',
            title: '行星时辰 — 古代计时',
            desc: '12条放射线把表盘分成12个行星时。每个时辰由一颗行星守护。一周七天的名字就是这样来的。',
            demoNote: '🪐 日月火水木金土 = 一周七天\n📅 星期日=Sun 星期一=Moon ...',
            demo: demoPlanetary, details: '<h3>中西对照</h3><ul><li>日=Sunday☉ 月=Monday☽ 火=Tuesday♂</li><li>水=Wednesday☿ 木=Thursday♃ 金=Friday♀ 土=Saturday♄</li></ul>'
        },
    ];

    // =============================================
    // 5. DEMO SVG GENERATORS
    // =============================================
    function demoShichen() { return `<svg viewBox="-200 -200 400 400"><circle cx="0" cy="0" r="180" fill="none" stroke="${INK}" stroke-width="2"/>${dizhi.map((d, i) => { const a = (i * 30 - 90) * Math.PI / 180, r = 160; return `<text x="${r * Math.cos(a)}" y="${r * Math.sin(a) + 5}" text-anchor="middle" fill="${INK}" font-size="18" font-weight="bold">${d}</text><text x="${130 * Math.cos(a)}" y="${130 * Math.sin(a) + 4}" text-anchor="middle" fill="${GOLD}" font-size="9">${dizhiTime[i]}</text>` }).join('')}<line x1="0" y1="20" x2="0" y2="-100" stroke="${INK}" stroke-width="3" stroke-linecap="round"><animateTransform attributeName="transform" type="rotate" from="0" to="360" dur="12s" repeatCount="indefinite"/></line><circle cx="0" cy="0" r="5" fill="${INK}"/><text x="0" y="-190" text-anchor="middle" fill="${GOLD}" font-size="11">一个时辰 = 2小时</text></svg>`; }
    function demoCancer() { return `<svg viewBox="-200 -200 400 400"><circle cx="0" cy="-50" r="100" fill="none" stroke="#4682b4" stroke-width="2.5" stroke-dasharray="8 4"><animate attributeName="stroke-dashoffset" from="40" to="0" dur="2s" repeatCount="indefinite"/></circle><text x="0" y="-160" text-anchor="middle" fill="#4682b4" font-size="12">↓ 北回归线（内圈）</text><circle cx="0" cy="0" r="150" fill="none" stroke="${FAINT}" stroke-width="1" stroke-dasharray="4 3"/><text x="0" y="170" text-anchor="middle" fill="${GOLD}" font-size="11">夏至时太阳在这里 ☀️</text><circle r="8" fill="${GOLD}"><animate attributeName="cx" from="-100" to="100" dur="3s" repeatCount="indefinite"/><animate attributeName="cy" values="-50;-50" dur="3s" repeatCount="indefinite"/></circle></svg>`; }
    function demoEquator() { return `<svg viewBox="-200 -200 400 400"><circle cx="0" cy="0" r="150" fill="none" stroke="${INK}" stroke-width="2" stroke-dasharray="8 4"><animate attributeName="stroke-dashoffset" from="40" to="0" dur="2s" repeatCount="indefinite"/></circle><text x="0" y="-165" text-anchor="middle" fill="${INK}" font-size="12">天球赤道（中圈）</text><circle r="7" fill="${GOLD}"><animateMotion dur="4s" repeatCount="indefinite" path="M150,0 A150,150 0 1,1 149.9,0"/></circle><text x="0" y="10" text-anchor="middle" fill="${GOLD}" font-size="11">太阳经过=春分or秋分</text></svg>`; }
    function demoCapricorn() { return `<svg viewBox="-250 -250 500 500"><circle cx="0" cy="50" r="220" fill="none" stroke="#8b4513" stroke-width="2.5" stroke-dasharray="8 4"><animate attributeName="stroke-dashoffset" from="40" to="0" dur="2s" repeatCount="indefinite"/></circle><text x="0" y="-180" text-anchor="middle" fill="#8b4513" font-size="12">南回归线（外圈/最大）</text><text x="0" y="190" text-anchor="middle" fill="${GOLD}" font-size="11">冬至太阳在这里 ❄️</text><circle r="8" fill="${GOLD}" opacity="0.7"><animate attributeName="cx" from="-100" to="100" dur="3s" repeatCount="indefinite"/><animate attributeName="cy" values="50;50" dur="3s" repeatCount="indefinite"/></circle></svg>`; }
    function demoDayNight() { return `<svg viewBox="-200 -200 400 400"><rect x="-180" y="-180" width="360" height="180" fill="rgba(70,130,180,0.2)" rx="5"/><text x="0" y="-90" text-anchor="middle" fill="#4682b4" font-size="16">☀️ 白天</text><rect x="-180" y="0" width="360" height="20" fill="rgba(200,120,50,0.3)"/><rect x="-180" y="20" width="360" height="160" fill="rgba(10,15,40,0.15)" rx="5"/><text x="0" y="100" text-anchor="middle" fill="#555" font-size="16">🌙 夜晚</text><line x1="-180" y1="0" x2="180" y2="0" stroke="${INK}" stroke-width="2"/><circle r="10" fill="${GOLD}"><animateMotion dur="6s" repeatCount="indefinite" path="M-150,-100 C-50,-170 50,-170 150,-100 C200,0 150,80 0,80 C-150,80 -200,0 -150,-100"/></circle></svg>`; }
    function demoTwilight() { return `<svg viewBox="-200 -100 400 200"><rect x="-200" y="-100" width="400" height="100" fill="rgba(70,130,180,0.15)"/><rect x="-200" y="0" width="400" height="40" fill="rgba(200,120,50,0.3)"/><text x="-130" y="25" fill="#c87832" font-size="12">🌅 黎明</text><text x="110" y="25" fill="#c87832" font-size="12">🌆 黄昏</text><rect x="-200" y="40" width="400" height="60" fill="rgba(10,15,40,0.12)"/><line x1="-200" y1="0" x2="200" y2="0" stroke="${INK}" stroke-width="2"/><circle r="8" fill="${GOLD}"><animate attributeName="cy" from="-5" to="35" dur="2s" repeatCount="indefinite"/><animate attributeName="opacity" from="1" to="0.3" dur="2s" repeatCount="indefinite"/></circle></svg>`; }
    function demoNight() { return `<svg viewBox="-200 -100 400 200"><rect x="-200" y="-100" width="400" height="200" fill="rgba(10,15,40,0.2)" rx="8"/>${Array.from({ length: 25 }, () => `<circle cx="${Math.random() * 360 - 180}" cy="${Math.random() * 160 - 80}" r="${0.8 + Math.random()}" fill="#ccc" opacity="${0.2 + Math.random() * 0.5}"><animate attributeName="opacity" from="0.2" to="0.9" dur="${1 + Math.random() * 2}s" repeatCount="indefinite" direction="alternate"/></circle>`).join('')}<text x="0" y="-10" text-anchor="middle" fill="#8899aa" font-size="16">🌙 黑夜</text><text x="0" y="20" text-anchor="middle" fill="#667788" font-size="11">太阳在地平线下 ⭐</text></svg>`; }
    function demoObserver() { return `<svg viewBox="-200 -200 400 400"><circle cx="0" cy="0" r="180" fill="none" stroke="${FAINT}" stroke-width="1"/><circle cx="0" cy="-80" r="7" fill="${INK}"/><text x="18" y="-75" fill="${INK}" font-size="12">← 天顶</text><text x="0" y="-120" text-anchor="middle" fill="${GOLD}" font-size="13">📍 北京 39.9°N 116.4°E</text><line x1="-180" y1="30" x2="180" y2="30" stroke="${INK}" stroke-width="1.5"/><text x="0" y="50" text-anchor="middle" fill="${INK}" font-size="10">地平线</text><text x="0" y="100" text-anchor="middle" fill="${GOLD}" font-size="11">所有圆圈都为北京画的</text></svg>`; }
    function demo24h() { return `<svg viewBox="-200 -200 400 400"><circle cx="0" cy="0" r="180" fill="none" stroke="${INK}" stroke-width="2"/>${rom.map((n, i) => { const a = (i * 30 - 90) * Math.PI / 180, r = 160; return `<text x="${r * Math.cos(a)}" y="${r * Math.sin(a) + 6}" text-anchor="middle" fill="${INK}" font-size="16" font-family="'Cinzel',serif">${n}</text>` }).join('')}<line x1="0" y1="20" x2="0" y2="-100" stroke="${INK}" stroke-width="4" stroke-linecap="round"><animateTransform attributeName="transform" type="rotate" from="0" to="360" dur="12s" repeatCount="indefinite"/></line><line x1="0" y1="15" x2="0" y2="-140" stroke="${INK}" stroke-width="2" stroke-linecap="round"><animateTransform attributeName="transform" type="rotate" from="0" to="360" dur="3s" repeatCount="indefinite"/></line><circle cx="0" cy="0" r="5" fill="${INK}"/><text x="0" y="-190" text-anchor="middle" fill="${GOLD}" font-size="11">XII = 正午 & 午夜</text></svg>`; }
    function demoZodiac() { return `<svg viewBox="-220 -200 440 400"><circle cx="0" cy="40" r="160" fill="none" stroke="${INK}" stroke-width="2"/><circle cx="0" cy="40" r="130" fill="none" stroke="${INK}" stroke-width="1"/>${zData.map((s, i) => { const a = ((i + 0.5) * 30 - 90) * Math.PI / 180, r = 145; return `<text x="${r * Math.cos(a)}" y="${40 + r * Math.sin(a) + 5}" text-anchor="middle" fill="${INK}" font-size="16">${s}</text>` }).join('')}<circle r="7" fill="${GOLD}"><animateMotion dur="8s" repeatCount="indefinite" path="M160,40 A160,160 0 1,1 159.9,40"/></circle><text x="0" y="-175" text-anchor="middle" fill="${GOLD}" font-size="11">太阳在哪格=你的星座</text></svg>`; }
    function demoSunHand() { return `<svg viewBox="-200 -200 400 400"><circle cx="0" cy="0" r="180" fill="none" stroke="${FAINT}" stroke-width="1"/><g><animateTransform attributeName="transform" type="rotate" from="0" to="360" dur="8s" repeatCount="indefinite"/><line x1="0" y1="20" x2="0" y2="-165" stroke="${GOLD}" stroke-width="2.5"/><g transform="translate(0,-165)"><circle r="12" fill="none" stroke="${GOLD}" stroke-width="2"/><circle r="4" fill="${GOLD}"/></g></g><circle cx="0" cy="0" r="5" fill="${INK}"/><text x="0" y="-185" text-anchor="middle" fill="${GOLD}" font-size="11">☀ 24小时转一圈</text></svg>`; }
    function demoMoonHand() { return `<svg viewBox="-200 -200 400 400"><circle cx="0" cy="0" r="180" fill="none" stroke="${FAINT}" stroke-width="1"/><g><animateTransform attributeName="transform" type="rotate" from="0" to="360" dur="5.5s" repeatCount="indefinite"/><line x1="0" y1="15" x2="0" y2="-170" stroke="#607080" stroke-width="1.8"/><g transform="translate(0,-170)"><circle r="10" fill="#222"/><circle r="10" fill="none" stroke="#607080" stroke-width="1.5"/><clipPath id="mc2"><rect x="0" y="-10" width="10" height="20"/></clipPath><circle r="10" fill="#c0c0c0" clip-path="url(#mc2)"/></g></g><circle cx="0" cy="0" r="4" fill="${INK}"/><text x="0" y="-190" text-anchor="middle" fill="#607080" font-size="11">🌙 ~27天转一圈</text></svg>`; }
    function demoSidereal() { return `<svg viewBox="-200 -200 400 400"><circle cx="0" cy="0" r="180" fill="none" stroke="${FAINT}" stroke-width="1"/><g><animateTransform attributeName="transform" type="rotate" from="0" to="360" dur="5.9s" repeatCount="indefinite"/><line x1="0" y1="0" x2="0" y2="-175" stroke="${INK}" stroke-width="1.5" stroke-dasharray="8 4"/></g><g><animateTransform attributeName="transform" type="rotate" from="0" to="360" dur="6s" repeatCount="indefinite"/><line x1="0" y1="0" x2="0" y2="-170" stroke="${GOLD}" stroke-width="2"/><circle cx="0" cy="-170" r="6" fill="${GOLD}"/></g><circle cx="0" cy="0" r="4" fill="${INK}"/><text x="0" y="190" text-anchor="middle" fill="${GOLD}" font-size="11">虚线每天比金线多走约4分钟</text></svg>`; }
    function demoHorizon() { return `<svg viewBox="-200 -150 400 300"><rect x="-200" y="-150" width="400" height="150" fill="rgba(70,130,180,0.12)"/><text x="0" y="-80" text-anchor="middle" fill="#4682b4" font-size="14">⬆ 天空（看得到）</text><rect x="-200" y="0" width="400" height="150" fill="rgba(10,15,40,0.1)"/><text x="0" y="80" text-anchor="middle" fill="#555" font-size="14">⬇ 地面以下</text><line x1="-200" y1="0" x2="200" y2="0" stroke="${INK}" stroke-width="4"/><text x="0" y="-8" text-anchor="middle" fill="${INK}" font-size="13" font-weight="bold">━━━ 地平线 ━━━</text><circle r="10" fill="${GOLD}"><animate attributeName="cy" from="60" to="-60" dur="3s" repeatCount="indefinite"/></circle></svg>`; }
    function demoSunset() { return `<svg viewBox="-200 -150 400 300"><rect x="-200" y="-150" width="400" height="150" fill="rgba(70,130,180,0.15)"/><rect x="-200" y="0" width="400" height="30" fill="rgba(200,120,50,0.3)"/><rect x="-200" y="30" width="400" height="120" fill="rgba(10,15,40,0.12)"/><line x1="-200" y1="0" x2="200" y2="0" stroke="${INK}" stroke-width="2"/><circle r="10" fill="${GOLD}"><animate attributeName="cy" from="-80" to="80" dur="3s" repeatCount="indefinite"/><animate attributeName="opacity" from="1" to="0.3" dur="3s" repeatCount="indefinite"/></circle><text x="-50" y="-60" fill="${GOLD}" font-size="12">太阳落下 🌅</text></svg>`; }
    function demoPlanetary() { return `<svg viewBox="-200 -200 400 400"><circle cx="0" cy="0" r="180" fill="none" stroke="${FAINT}" stroke-width="1"/>${[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map(i => { const a = (i * 30 - 90) * Math.PI / 180; return `<line x1="0" y1="0" x2="${180 * Math.cos(a)}" y2="${180 * Math.sin(a)}" stroke="${FAINT}" stroke-width="1"/>` }).join('')}${['☉日', '☽月', '♂火', '☿水', '♃木', '♀金', '♄土'].map((p, i) => { const a = ((i * 51.4) - 90) * Math.PI / 180, r = 155; return `<text x="${r * Math.cos(a)}" y="${r * Math.sin(a) + 4}" text-anchor="middle" fill="${GOLD}" font-size="12">${p}</text>` }).join('')}<text x="0" y="-190" text-anchor="middle" fill="${GOLD}" font-size="11">日月火水木金土=一周七天</text></svg>`; }

    // =============================================
    // 6. RENDER BUTTONS + HOVER HIGHLIGHT + STATUS
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
        const arrowChar = f.side === 'left' ? '→' : '←';
        btn.innerHTML = `<span class="btn-dot"></span><span class="btn-label">${f.label}</span><span class="btn-arrow">${arrowChar}</span><span class="btn-status" id="status-${f.statusKey}">…</span>`;

        // Store status element reference
        setTimeout(() => {
            statusEls[f.statusKey] = document.getElementById('status-' + f.statusKey);
        }, 100);

        // HOVER → HIGHLIGHT
        btn.addEventListener('mouseenter', () => {
            allGroups.forEach(g => g.classList.add('dimmed'));
            f.hlIds.forEach(id => {
                const el = document.getElementById(id);
                if (el) {
                    el.classList.add('highlighted');
                    el.classList.remove('dimmed');
                    let p = el.parentElement;
                    while (p && p !== svg) { p.classList.remove('dimmed'); p = p.parentElement; }
                }
            });
            const hands = document.getElementById('clock-hands');
            if (hands && !f.hlIds.some(id => id.includes('hand') || id.includes('sidereal'))) {
                hands.classList.remove('dimmed');
                hands.style.opacity = '0.4';
            }
        });
        btn.addEventListener('mouseleave', () => {
            allGroups.forEach(g => { g.classList.remove('dimmed'); g.style.opacity = ''; });
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
    function closePanel() {
        panel.classList.remove('open');
        if (activeBtn) { activeBtn.classList.remove('active'); activeBtn = null; }
    }
    if (closeBtn) closeBtn.addEventListener('click', closePanel);
    document.addEventListener('keydown', e => { if (e.key === 'Escape') closePanel(); });
});
