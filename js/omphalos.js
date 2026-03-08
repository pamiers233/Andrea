/**
 * 翁法罗斯天文钟 - Omphalos Titan Clock
 * 完整历法系统 + 日历面板 + 图标摆正 + 指针发光
 */

const GROUP_FILTERS = {
    '支柱': 'brightness(0) saturate(100%) invert(60%) sepia(80%) saturate(400%) hue-rotate(180deg) brightness(1.3)',
    '创生': 'brightness(0) saturate(100%) invert(70%) sepia(60%) saturate(500%) hue-rotate(85deg) brightness(1.2)',
    '灾厄': 'brightness(0) saturate(100%) invert(60%) sepia(70%) saturate(600%) hue-rotate(320deg) brightness(1.3)',
    '命运': 'brightness(0) saturate(100%) invert(60%) sepia(50%) saturate(500%) hue-rotate(250deg) brightness(1.3)'
};
const GROUP_COLORS = { '支柱': '#64b5f6', '创生': '#81c784', '灾厄': '#ef9a9a', '命运': '#ce93d8' };
const TITAN_IMG = {
    0: '吉奥里亚.png', 1: '法吉娜.png', 2: '墨涅塔.png', 3: '刻法勒.png',
    4: '瑟希斯.png', 5: '扎格列斯.png', 6: '尼卡多利.png', 7: '塞纳托斯.png',
    8: '欧洛尼斯.png', 9: '塔兰顿.png', 10: '雅努斯.png', 11: '艾格勒.png'
};
const TITAN_CARD_IMG = {
    0: '吉奥里亚卡牌.png', 1: '法吉娜卡牌.png', 2: '墨涅塔卡牌.png', 3: '刻法勒卡牌.png',
    4: '瑟希斯卡牌.png', 5: '扎格列斯卡牌.png', 6: '尼卡多利卡牌.png', 7: '塞纳托斯卡牌.png',
    8: '欧洛尼斯卡牌.png', 9: '塔兰顿卡牌.png', 10: '雅努斯卡牌.png', 11: '艾格勒卡牌.png'
};

// ====== 十二月份 ======
const MONTH_DATA = [null,
    {
        month: 1, name: '门关月', season: '命运季', titanIdx: 10, seasonGroup: '命运',
        desc: '作为除旧迎新的第一月，雅努斯将关上代表过去的旧门，打开代表未来的新门。人们会抛弃带来羁绊之物，宣告斩断过去、直面未来。'
    },
    {
        month: 2, name: '平衡月', season: '命运季', titanIdx: 9, seasonGroup: '命运',
        desc: '最具规律的一月。人们作息规律、性情平和，因而更乐于发起裁决、签订契约。据说此月是唯一昼夜等长的月份，因为塔兰顿调停了欧洛尼斯和艾格勒的争端。'
    },
    {
        month: 3, name: '长夜月', season: '命运季', titanIdx: 8, seasonGroup: '命运',
        desc: '太阳光照比平常稍显暗淡的月份。人们更频繁地感到瞌睡，直觉与感性替代了思考与理性。据说此月的夜比昼长，因为欧洛尼斯在天空所有权的争斗中胜过了艾格勒。'
    },
    {
        month: 4, name: '耕耘月', season: '支柱季', titanIdx: 0, seasonGroup: '支柱',
        desc: '春耕开始的月份，也是最为忙碌的月份。大地恢复到最适合耕种的状态，人们翻动土地、播下种子，将劳动作为祭品献给大地。大地兽们也会加倍感到活力。'
    },
    {
        month: 5, name: '欢喜月', season: '支柱季', titanIdx: 1, seasonGroup: '支柱',
        desc: '春耕结束的月份。泉水流淌、渔业兴盛。最繁重的工作已经完成，人们沉浸在喜庆的氛围中。这是酿造和举办庆典最好的月份。'
    },
    {
        month: 6, name: '长昼月', season: '支柱季', titanIdx: 11, seasonGroup: '支柱',
        desc: '热力最旺盛的月份，黎明机器比平常更加闪耀。沐浴此光的人们会感到精神饱满、活力充沛。据说此月的昼比夜长，因为艾格勒在天空所有权的争斗中胜过了欧洛尼斯。'
    },
    {
        month: 7, name: '自由月', season: '创生季', titanIdx: 3, seasonGroup: '创生',
        desc: '平淡祥和的月份。没有什么大的节日要参与，也没有什么大的任务要去完成。人们可以在这一月发展爱好、追求理想。正如刻法勒创造了世界，又任由人们在它的庭院中玩耍。'
    },
    {
        month: 8, name: '收获月', season: '创生季', titanIdx: 4, seasonGroup: '创生',
        desc: '秋收开始的月份。作物们吸收了长昼月的光照，成长到最为饱满的状态。同耕耘月一样，人们在这一月格外忙碌。'
    },
    {
        month: 9, name: '拾线月', season: '创生季', titanIdx: 2, seasonGroup: '创生',
        desc: '秋收完成的月份。人们回顾一年来的经历，墨涅塔将一切收拢，编织成记忆的金线。这是陪伴家人、享受爱与美好的一月。得闲的人们会在家中织布。'
    },
    {
        month: 10, name: '纷争月', season: '灾厄季', titanIdx: 6, seasonGroup: '灾厄',
        desc: '生产活动完成后的第一个月份。社会多出额外的劳力。在过去，各城邦经常于这一月约定战争。也是处决囚犯、烧毁祭品以祀神明的时期。'
    },
    {
        month: 11, name: '哀悼月', season: '灾厄季', titanIdx: 7, seasonGroup: '灾厄',
        desc: '城邦逐渐归于沉寂的月份。人们从战场上拖回尸体，埋葬死者、安抚生者。祭司们在这个月最为忙碌。哀悼月给人以肃杀的气氛，人们会逐渐减少活动。'
    },
    {
        month: 12, name: '机缘月', season: '灾厄季', titanIdx: 5, seasonGroup: '灾厄',
        desc: '一年最末尾的月份。好事和坏事都会更频繁地发生。赌徒们相信此月带来好手气；窃贼也摩拳擦掌。扎格列斯难以捉摸，此月天数不定——有闰日的称「红月」，否则称「金月」。'
    }
];

// ====== 五时段 ======
const PERIOD_MIN = 24 * 60 / 5;
const TIME_PERIODS = [
    { name: '门扉时', color: '#90caf9' },
    { name: '明晰时', color: '#ffe082' },
    { name: '践行时', color: '#a5d6a7' },
    { name: '离愁时', color: '#ffab91' },
    { name: '幕匿时', color: '#ce93d8' }
];
const KE_NAMES = ['初刻', '二刻', '三刻', '四刻', '五刻'];
const WEEKDAY_NAMES = ['日', '一', '二', '三', '四', '五', '六'];

// ====== 泰坦 ======
const TITANS = [
    { name: '吉奥里亚', epithet: '磐岩之脊', domain: '大地', group: '支柱' },
    { name: '法吉娜', epithet: '满溢之杯', domain: '海洋', group: '支柱' },
    { name: '墨涅塔', epithet: '黄金之茧', domain: '浪漫', group: '创生' },
    { name: '刻法勒', epithet: '全世之座', domain: '负世', group: '创生' },
    { name: '瑟希斯', epithet: '裂分之枝', domain: '理性', group: '创生' },
    { name: '扎格列斯', epithet: '翻飞之币', domain: '诡计', group: '灾厄' },
    { name: '尼卡多利', epithet: '天谴之矛', domain: '纷争', group: '灾厄' },
    { name: '塞纳托斯', epithet: '灰黯之手', domain: '死亡', group: '灾厄' },
    { name: '欧洛尼斯', epithet: '永夜之帷', domain: '岁月', group: '命运' },
    { name: '塔兰顿', epithet: '公正之枰', domain: '律法', group: '命运' },
    { name: '雅努斯', epithet: '万径之门', domain: '门径', group: '命运' },
    { name: '艾格勒', epithet: '晨昏之眼', domain: '天空', group: '支柱' }
];

function getOmphalosTime(now) {
    const month = now.getMonth() + 1;
    const totalMin = now.getHours() * 60 + now.getMinutes();
    const monthData = MONTH_DATA[month];
    const periodIdx = Math.min(Math.floor(totalMin / PERIOD_MIN), 4);
    const minInPeriod = totalMin - periodIdx * PERIOD_MIN;
    const keIdx = Math.min(Math.floor(minInPeriod / (PERIOD_MIN / 5)), 4);
    const monthAngleDeg = monthData.titanIdx * 30;
    return { monthData, periodIdx, keIdx, monthAngleDeg };
}

// ====== MAIN ======
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        const e = document.getElementById('entrance-overlay');
        if (e) e.style.display = 'none';
        initClock();
    }, 8000);
    createStarfield();

    const pIcon = document.getElementById('p-icon');
    const timeDisp = document.getElementById('real-time-display');
    const handMonth = document.getElementById('hand-month');
    const handPeriod = document.getElementById('hand-period');
    const handMin = document.getElementById('hand-min');
    const handSec = document.getElementById('hand-sec');

    let hoveredIdx = null;

    // ---- 表盘 ----
    function createWedges() {
        const container = document.getElementById('titan-wedges');
        const cx = 0, cy = 0;
        const R_OUT = 465, R_IN = 185;
        const R_ICON = 360, R_NAME = 265, R_DOM = 215;
        let html = '';

        for (let i = 0; i < 12; i++) {
            const t = TITANS[i];
            const gc = GROUP_COLORS[t.group];
            const gf = GROUP_FILTERS[t.group];
            const a0 = (i * 30 - 90 - 15) * Math.PI / 180;
            const a1 = (i * 30 - 90 + 15) * Math.PI / 180;
            const am = (i * 30 - 90) * Math.PI / 180;
            const p = (r, a) => [cx + r * Math.cos(a), cy + r * Math.sin(a)];
            const [o0x, o0y] = p(R_OUT, a0); const [o1x, o1y] = p(R_OUT, a1);
            const [i0x, i0y] = p(R_IN, a1); const [i1x, i1y] = p(R_IN, a0);
            const wP = `M ${o0x} ${o0y} A ${R_OUT} ${R_OUT} 0 0 1 ${o1x} ${o1y} L ${i0x} ${i0y} A ${R_IN} ${R_IN} 0 0 0 ${i1x} ${i1y} Z`;
            const [s0x, s0y] = p(462, a0); const [s1x, s1y] = p(462, a1);
            const [s2x, s2y] = p(438, a1); const [s3x, s3y] = p(438, a0);
            const sP = `M ${s0x} ${s0y} A 462 462 0 0 1 ${s1x} ${s1y} L ${s2x} ${s2y} A 438 438 0 0 0 ${s3x} ${s3y} Z`;
            const [icx, icy] = p(R_ICON, am); const [nx, ny] = p(R_NAME, am); const [dx, dy] = p(R_DOM, am);
            const imgSz = 78;
            let rot = i * 30; if (rot > 90 && rot < 270) rot += 180;

            html += `
            <g class="titan-group" data-idx="${i}">
                <path d="${sP}" fill="${gc}" opacity="0.3"/>
                <path d="${wP}" fill="transparent" stroke="#4a5260" stroke-width="1.5" class="titan-wedge" id="wedge-${i}"/>
                <line x1="${i1x}" y1="${i1y}" x2="${o0x}" y2="${o0y}" stroke="#e5b93d" stroke-width="0.8" opacity="0.5"/>
                <foreignObject x="${icx - imgSz / 2}" y="${icy - imgSz / 2}" width="${imgSz}" height="${imgSz}" style="overflow:visible;pointer-events:none;">
                    <img xmlns="http://www.w3.org/1999/xhtml" src="../img/${TITAN_IMG[i]}"
                         style="width:${imgSz}px;height:${imgSz}px;object-fit:contain;
                                filter:${gf};display:block;
                                transform:rotate(${i * 30}deg);transform-origin:center;"/>
                </foreignObject>
                <text x="${nx}" y="${ny}" transform="rotate(${rot},${nx},${ny})"
                      text-anchor="middle" dominant-baseline="middle"
                      fill="#c8d4e0" font-family="'Noto Serif SC',serif" font-size="23" font-weight="bold"
                      class="wedge-text" letter-spacing="2">${t.name}</text>
                <text x="${dx}" y="${dy}" transform="rotate(${rot},${dx},${dy})"
                      text-anchor="middle" dominant-baseline="middle"
                      fill="${gc}" font-family="'Noto Serif SC',serif" font-size="17" opacity="0.85"
                      class="wedge-text">${t.domain}</text>
            </g>`;
        }

        // 五时段内圈
        for (let pi = 0; pi < 5; pi++) {
            const R_PI = 170, R_PO = 183;
            const a0 = (pi * 72 - 90 - 36) * Math.PI / 180, a1 = (pi * 72 - 90 + 36) * Math.PI / 180, am2 = (pi * 72 - 90) * Math.PI / 180;
            const period = TIME_PERIODS[pi];
            const po0x = cx + R_PO * Math.cos(a0), po0y = cy + R_PO * Math.sin(a0);
            const po1x = cx + R_PO * Math.cos(a1), po1y = cy + R_PO * Math.sin(a1);
            const pi0x = cx + R_PI * Math.cos(a1), pi0y = cy + R_PI * Math.sin(a1);
            const pi1x = cx + R_PI * Math.cos(a0), pi1y = cy + R_PI * Math.sin(a0);
            const aP = `M ${po0x} ${po0y} A ${R_PO} ${R_PO} 0 0 1 ${po1x} ${po1y} L ${pi0x} ${pi0y} A ${R_PI} ${R_PI} 0 0 0 ${pi1x} ${pi1y} Z`;
            const lx = cx + 130 * Math.cos(am2), ly = cy + 130 * Math.sin(am2);
            let lr = pi * 72; if (lr > 90 && lr < 270) lr += 180;
            html += `
            <g class="period-segment" data-period="${pi}">
                <path d="${aP}" fill="${period.color}" opacity="0.5" stroke="#1b202c" stroke-width="1.5"/>
                <text x="${lx}" y="${ly}" transform="rotate(${lr},${lx},${ly})"
                      text-anchor="middle" dominant-baseline="middle"
                      fill="${period.color}" font-family="'Noto Serif SC',serif" font-size="16" opacity="0.9">${period.name}</text>
            </g>`;
        }
        container.innerHTML = html;

        document.querySelectorAll('.titan-group').forEach(g => {
            g.addEventListener('mouseenter', function () {
                hoveredIdx = parseInt(this.getAttribute('data-idx'));
                document.querySelectorAll('.titan-wedge').forEach(w => w.classList.remove('active'));
                this.querySelector('.titan-wedge').classList.add('active');
            });
            g.addEventListener('mouseleave', function () {
                hoveredIdx = null;
                this.querySelector('.titan-wedge').classList.remove('active');
            });
        });

        // 生成内盘12枚泰坦卡牌徽章
        createMedallions();
    }

    function createMedallions() {
        const ring = document.getElementById('medallion-ring');
        if (!ring) return;
        const R_MED = 130; // 徽章环半径
        const MED_R = 22;  // 每个徽章半径
        let medallionHtml = '';

        for (let i = 0; i < 12; i++) {
            const angle = (i * 30 - 90) * Math.PI / 180;
            const mx = R_MED * Math.cos(angle);
            const my = R_MED * Math.sin(angle);
            const gc = GROUP_COLORS[TITANS[i].group];
            const imgFile = TITAN_CARD_IMG[i];

            // 连接线 (中心到徽章)
            medallionHtml += `<line x1="0" y1="0" x2="${mx}" y2="${my}" stroke="rgba(229,185,61,0.2)" stroke-width="0.8"/>`;

            // 金色外环
            medallionHtml += `<circle cx="${mx}" cy="${my}" r="${MED_R + 3}" fill="none" stroke="${gc}" stroke-width="1.5" opacity="0.6"/>`;
            // 暗底圆 
            medallionHtml += `<circle cx="${mx}" cy="${my}" r="${MED_R}" fill="#0e1220" stroke="#e5b93d" stroke-width="1.5"/>`;

            // foreignObject 放卡牌图（裁圆）- 需要反转旋转让图片保持正
            medallionHtml += `
                <foreignObject x="${mx - MED_R}" y="${my - MED_R}" width="${MED_R * 2}" height="${MED_R * 2}" style="overflow:visible;pointer-events:none;">
                    <div xmlns="http://www.w3.org/1999/xhtml" class="medallion-img-counter"
                         style="width:${MED_R * 2}px;height:${MED_R * 2}px;border-radius:50%;overflow:hidden;display:flex;align-items:center;justify-content:center;">
                        <img src="../img/${imgFile}"
                             style="width:${MED_R * 2 + 8}px;height:${MED_R * 2 + 8}px;object-fit:cover;display:block;"/>
                    </div>
                </foreignObject>`;
        }
        ring.innerHTML = medallionHtml;
    }

    // ---- 日历面板渲染 ----
    function renderCalendar(now) {
        const month = now.getMonth() + 1;
        const md = MONTH_DATA[month];
        const t = TITANS[md.titanIdx];
        const gc = GROUP_COLORS[md.seasonGroup];
        const gf = GROUP_FILTERS[t.group];

        // 头部
        const calSeason = document.getElementById('cal-season');
        calSeason.textContent = md.season;
        calSeason.style.background = `${gc}22`;
        calSeason.style.color = gc;
        calSeason.style.borderColor = `${gc}55`;

        document.getElementById('cal-month-name').textContent = md.name;
        document.getElementById('cal-titan').textContent = `${t.name} · ${t.epithet}`;

        // 图标
        if (pIcon) {
            pIcon.innerHTML = `<img src="../img/${TITAN_IMG[md.titanIdx]}"
                style="width:70px;height:70px;object-fit:contain;
                       filter:${gf} drop-shadow(0 0 12px ${gc});transition:filter 0.5s;" alt="${t.name}"/>`;
        }

        // 翁法罗斯时制
        const omphalos = getOmphalosTime(now);
        const period = TIME_PERIODS[omphalos.periodIdx];
        const ke = KE_NAMES[omphalos.keIdx];
        const calTimeVal = document.getElementById('cal-time-val');
        calTimeVal.textContent = `${period.name} · ${ke}`;
        calTimeVal.style.color = period.color;

        // 星期标题
        const weekdaysEl = document.getElementById('cal-weekdays');
        if (!weekdaysEl.children.length) {
            WEEKDAY_NAMES.forEach(d => {
                const div = document.createElement('div');
                div.className = 'cal-weekday';
                div.textContent = d;
                if (d === '日') div.style.color = '#ce93d8';
                weekdaysEl.appendChild(div);
            });
        }

        // 日期格子 (翁法罗斯历法：每月4周=28天，周日休息；机缘月可能有闰日)
        const daysEl = document.getElementById('cal-days');
        const totalDays = (month === 12) ? (isLeapYear(now.getFullYear()) ? 29 : 28) : 28;
        const today = now.getDate();

        // 只在无格子或月份变化时重渲
        if (daysEl.children.length !== totalDays || daysEl.dataset.month !== String(month)) {
            daysEl.innerHTML = '';
            daysEl.dataset.month = String(month);
            for (let d = 1; d <= totalDays; d++) {
                const cell = document.createElement('div');
                cell.className = 'cal-day';
                if (d % 7 === 0) cell.classList.add('rest'); // 周日休息
                if (d === today) cell.classList.add('today');
                cell.textContent = d;
                if (d === 29) {
                    cell.style.color = '#ef9a9a';
                    cell.title = '闰日「红月」';
                    cell.style.borderColor = 'rgba(239,154,154,0.4)';
                }
                daysEl.appendChild(cell);
            }
        } else {
            // 只更新today高亮
            Array.from(daysEl.children).forEach((c, idx) => {
                c.classList.toggle('today', idx + 1 === today);
            });
        }

        // 描述
        document.getElementById('cal-desc').innerHTML = md.desc;

        // 泰坦卡牌 (使用现成卡牌图片)
        const cardImg = document.getElementById('titan-card-img');
        if (cardImg && cardImg.dataset.titan !== t.name) {
            cardImg.dataset.titan = t.name;
            cardImg.src = `../img/${TITAN_CARD_IMG[md.titanIdx]}`;
            cardImg.alt = `${t.name} · ${t.epithet}`;
            cardImg.style.borderColor = `${gc}55`;
            cardImg.style.boxShadow = `0 4px 24px rgba(0,0,0,0.6), 0 0 18px ${gc}33`;
        }
    }

    function isLeapYear(year) {
        return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
    }

    // ---- 星空 ----
    function createStarfield() {
        const container = document.getElementById('starfield');
        const colors = ['#ffffff', '#e5b93d', '#a0a8b0', '#c4d2e0', '#ce93d8', '#81c784'];
        for (let i = 0; i < 80; i++) {
            const s = document.createElement('div');
            s.className = 'spark';
            s.style.cssText = `left:${Math.random() * 100}vw;top:${Math.random() * 100}vh;animation-delay:${Math.random() * 5}s;animation-duration:${1 + Math.random() * 3}s;background-color:${colors[Math.floor(Math.random() * colors.length)]};`;
            container.appendChild(s);
        }
    }

    // ---- Clock ----
    function initClock() {
        createWedges();
        tick();
        setInterval(tick, 1000);
    }

    function tick() {
        const now = new Date();
        const hs = now.getHours(), ms = now.getMinutes(), ss = now.getSeconds();
        timeDisp.textContent = `${hs.toString().padStart(2, '0')}:${ms.toString().padStart(2, '0')}:${ss.toString().padStart(2, '0')}`;

        const omphalos = getOmphalosTime(now);

        // 月份指针
        const dayOfMonth = now.getDate();
        const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
        const monthFrac = (dayOfMonth - 1 + (hs * 3600 + ms * 60 + ss) / 86400) / daysInMonth;
        const monthAngle = omphalos.monthAngleDeg + monthFrac * 30;

        // 时段指针 (每天一圈)
        const totalSec = hs * 3600 + ms * 60 + ss;
        const periodAngle = (totalSec / 86400) * 360;

        // 分针 (每小时一圈)
        const minAngle = ms * 6 + ss * 0.1;
        // 秒针
        const secAngle = ss * 6;

        if (handMonth) handMonth.style.transform = `rotate(${monthAngle}deg)`;
        if (handPeriod) handPeriod.style.transform = `rotate(${periodAngle}deg)`;
        if (handMin) handMin.style.transform = `rotate(${minAngle}deg)`;
        if (handSec) handSec.style.transform = `rotate(${secAngle}deg)`;

        // 日历面板更新
        renderCalendar(now);

        // 高亮当前月泰坦
        if (hoveredIdx === null) {
            const mIdx = omphalos.monthData.titanIdx;
            document.querySelectorAll('.titan-wedge').forEach((w, i) => {
                if (i === mIdx) w.classList.add('active');
                else w.classList.remove('active');
            });
        }
    }
});
