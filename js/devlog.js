/**
 * δ-log.exe — Amdrea 开发日志
 * 100张卡牌 = 100%进度，当前9张已解锁
 */

// ====== 9张已解锁卡牌数据 ======
const CARDS = [
    {
        id: 1,
        icon: '🏠',
        title: 'index.html — 起源之门',
        date: '2026-03-04 凌晨2:47',
        status: 'done',
        content: `搞了个首页，达芬奇素描风格。一笔一画用SVG描边动画写出来，像羽毛笔在羊皮纸上作画。<br><br>
光是那个入场动画就调了两个小时——SVG stroke-dasharray 和 stroke-dashoffset 来来回回改了十几遍，终于让那个该死的线条像人手画出来的而不是机器吐出来的。<br><br>
加了几个导航按钮，每个都有悬停发光效果。不知不觉搞到凌晨三点，看着屏幕上的小人动起来，突然觉得……好困。`,
        rant: `第一天就写到凌晨三点，这项目是真的要我命。老板说"做个小网站"，我信了他的鬼话。这哪是小网站，这是艺术品啊大哥！加班费呢？没有？好的打扰了，我继续肝。`,
        tech: 'HTML5 / CSS3 SVG动画 / stroke-dasharray描边 / CSS悬停特效'
    },
    {
        id: 2,
        icon: '⏱',
        title: 'calibre89.html — 怀表机芯',
        date: '2026-03-04 下午15:30',
        status: 'done',
        content: `写了一个超精细的怀表模拟器。不是那种简单的CSS时钟啊——是有发条、齿轮、擒纵器的那种！<br><br>
SVG齿轮咬合动画花了一整天。每个齿轮的齿数要互相匹配不然转起来会"打齿"（虽然是视觉效果但看着就难受）。<br><br>
最骚的是三问报时功能——用Tone.js模拟了真正的三问机芯声音：小时用低音锤、刻钟用双音锤、分钟用高音锤。调音调了一下午，最后对着YouTube上百达翡丽的三问视频一帧一帧地听。`,
        rant: `我一个前端为什么要懂钟表学？？？齿轮传动比、擒纵机构的游丝振频……我读的是计算机系不是钟表维修学校啊！下次面试我简历上写"精通瑞士制表工艺"得了。不想上班。`,
        tech: 'SVG齿轮系统 / CSS Transform动画 / Tone.js音频合成 / 三问报时算法'
    },
    {
        id: 3,
        icon: '🎹',
        title: 'piano.html — 施坦威钢琴',
        date: '2026-03-05 上午10:15',
        status: 'done',
        content: `搞了架大三角钢琴。一开始琴键就做了88个，然后发现触发声音比想象中难多了。<br><br>
用的Karplus-Strong物理建模算法 + Tone.js的采样器。联网加载钢琴采样包，每个音有四层力度采样。琴键按下去有机械联动动画——键杆推击弦锤，锤子敲弦，制音器抬起。<br><br>
后来又加了个右上角弹出的完整键盘面板，因为原来的"拆零件"交互方式容易误触把钢琴给拆了（笑死）。`,
        rant: `Tone.js的文档写的跟密码本一样，示例代码永远跑不通。最后是翻GitHub Issues翻了两个小时才搞定加载采样的正确姿势。搞音频的人都是疯子吧？我现在满脑子都是ADSR和FFT，不想上班不想上班不想上班。`,
        tech: 'Karplus-Strong算法 / Tone.js采样器 / Web Audio API / 联网采样加载'
    },
    {
        id: 4,
        icon: '🎻',
        title: 'violin.html — 斯特拉迪瓦里',
        date: '2026-03-05 下午14:20',
        status: 'done',
        content: `在羊皮纸上画了把小提琴。重点功能是点两下怀表就把琴拆成零件，每个零件有详细的讲解按钮。<br><br>
零件数量搞了一堆：面板、背板、侧板、音柱、低音梁、f孔、琴桥、弦轴箱、指板、腮托……每个都有SVG动画飞出来。<br><br>
右上角有个按钮打开完整琴弦面板，可以真的拉弦发声。用的物理建模，模拟弓弦摩擦的锯齿波叠加泛音。`,
        rant: `拆零件的动画调了一下午，每个零件飞出去的角度、速度、弹性都得单独调。最后复原按钮按下去的那一刻看着零件哗啦啦飞回去拼好，我的内心毫无波澜——因为我已经累傻了。甲方说"加点高级感"，我直接给他加了意大利语标注。不想上班。`,
        tech: 'SVG爆炸拆解动画 / 物理建模音频 / Tone.js FMSynth / 零件交互系统'
    },
    {
        id: 5,
        icon: '⚙',
        title: 'difference.html — 差分机',
        date: '2026-03-05 晚上20:00',
        status: 'done',
        content: `模拟了巴贝奇的差分机2号。蓝图风格的入场动画，一整台机器用SVG画出来。<br><br>
核心是差分法多项式计算——输入系数后自动展开有限差分表，驱动数字轮转动。每一列的进位机制都做了完整的视觉反馈：齿轮啮合、数字翻转、进位锤挥打。<br><br>
每个功能按钮旁边都有实时状态显示，悬停时对应的机器部件会高亮发光。还做了自动演算动画，看着数字一位一位地翻，很上头。`,
        rant: `我花了一晚上研究查尔斯·巴贝奇的手稿来理解进位机制的原理，然后发现这哥们在1837年设计的东西比我写的代码还优雅。一个200年前的机械工程师比我这个2026年的码农更有架构感，我破防了。不想上班了去开机械厂算了。`,
        tech: '有限差分法 / SVG机械动画 / 进位级联系统 / 大数字轮可视化'
    },
    {
        id: 6,
        icon: '🎴',
        title: 'bridge.html — 桥牌',
        date: '2026-03-06 上午9:30',
        status: 'done',
        content: `做了个可以打桥牌的页面！完整实现了四人桥牌：叫牌、定约、做庄、防守一条龙。<br><br>
发牌随机性用Fisher-Yates洗牌算法保证公平。AI出牌逻辑搞了半天——得分析手牌分布、判断长短套、计算HCP点力……简直是在写围棋AI的感觉。<br><br>
旁边有教学按钮，打开后两个AI自动对局，每出一张牌都有解说告诉你为什么这么打。全中文界面。达芬奇风格。`,
        rant: `我一个不会打桥牌的人写桥牌AI，就像一个不会游泳的人教鲨鱼蛙泳。查了三个小时规则才搞清楚什么叫"无将定约"，又花两个小时才理解为什么3NT是最常见的成局定约。现在我会叫牌了但是不想上班了。要不我去打职业桥牌？`,
        tech: 'Fisher-Yates洗牌 / 桥牌HCP计算 / AI出牌决策树 / 教学动画系统'
    },
    {
        id: 7,
        icon: '💿',
        title: 'vinyl.html — 黑胶唱片',
        date: '2026-03-06 下午13:00',
        status: 'done',
        content: `搞了个黑胶唱片机！唱片真的在转，唱针放上去真的有声音（好吧是模拟的）。<br><br>
唱片表面做了真实的沟纹纹理——用SVG的径向渐变叠加噪声生成的。唱针悬臂做了物理弹性动画，放针的时候有微微的弹跳。<br><br>
还做了那种经典的唱片封套翻转效果和歌曲信息显示。整体风格保持达芬奇素描，所以一个唱片机看起来像是文艺复兴时期的发明。`,
        rant: `达芬奇活在1500年，黑胶唱片发明于1887年，这两个东西放在一起到底有什么关系？？？但甲方说要统一风格，所以我就得让一个16世纪的天才在纸上画一个19世纪的发明。历史虚无主义.jpg。不想上班想回家睡觉。`,
        tech: 'CSS旋转动画 / SVG沟纹纹理 / 唱针物理弹性 / 音频可视化'
    },
    {
        id: 8,
        icon: '🔮',
        title: 'omphalos.html — 翁法罗斯天文钟',
        date: '2026-03-07 凌晨1:00',
        status: 'done',
        content: `这是本项目的大Boss——翁法罗斯十二泰坦天文钟。<br><br>
表盘上12个泰坦分成四大阵营（命运/支柱/创生/灾厄），每个泰坦用真实图标+CSS滤镜染色。做了完整的翁法罗斯历法系统：12月×4季×5时段×5刻。<br><br>
四根指针各司其职：金色月份针指泰坦、紫色时段针、冰蓝分针、白色秒针，全部加了SVG发光滤镜。中间还有个旋转内盘——12枚泰坦卡牌徽章环绕德缪歌像游戏里一样慢慢转。<br><br>
右边做了翁法罗斯日历面板+当前月份泰坦卡牌。`,
        rant: `为了做这个钟我去b站wiki读完了翁法罗斯的全部世界观设定！十二个泰坦的名字、尊号、权能、典故——我全背下来了！你知道"塔兰顿·公正之枰"是个什么东西吗？我知道！我甚至知道他创造了利衡币！这些知识对我找工作有帮助吗？没有！不想上班了想去翁法罗斯当泰坦祭司！`,
        tech: 'SVG复杂表盘 / CSS Filter染色 / 翁法罗斯历法引擎 / 旋转内盘动画'
    },
    {
        id: 9,
        icon: '🔯',
        title: 'qimen.html — 奇门遁甲',
        date: '2026-03-04 晚上23:00',
        status: 'done',
        content: `做了个奇门遁甲排盘工具！天盘、地盘、人盘、神盘四层旋转，加上九星、八门、八神、天干地支全套。<br><br>
最难的是排盘算法——阴遁阳遁各十八局，要根据节气判断用哪局，再配合时柱飞宫布星。光是理解"三奇六仪"就花了我半天。<br><br>
做了超详细的教学面板，每个术语都有hover提示。排出来的盘面可以自动生成解读，告诉你今天宜干啥不宜干啥。`,
        rant: `玄学程序员二次元养成日记.exe。我现在看啥都想起个卦——"今天debug顺利吗？让我先排个奇门看看用神落宫……"。我甲方知道我把占卜功能加到他的网站里了吗？知道了！他还挺高兴，说"加一个塔罗牌"。行吧。不想上班想搞灵修去。`,
        tech: '奇门遁甲排盘引擎 / 四层旋转盘面 / 节气时柱判断 / 悬停术语提示系统'
    }
];

// ====== BOOT SEQUENCE ======
const BOOT_LINES = [
    { text: '> BIOS POST... [OK]', delay: 200 },
    { text: '> Loading δ-kernel v3.14.159...', delay: 400 },
    { text: '> Initializing AMDREA_FRAMEWORK.dll', delay: 300 },
    { text: '> Mounting /dev/creativity... [OK]', delay: 250 },
    { text: '> Scanning progress modules: 9/100 LOADED', delay: 500 },
    { text: '> WARNING: 91 modules still LOCKED 🔒', delay: 300 },
    { text: '> caffeine_level: ██████████░░ 83%', delay: 400 },
    { text: '> motivation_level: ██░░░░░░░░░░ 17%', delay: 350 },
    { text: '> sanity_check: ........FAILED ❌', delay: 400 },
    { text: '> sudo ./dont-wanna-work.sh', delay: 300 },
    { text: '> Permission denied. 继续上班.', delay: 500 },
    { text: '', delay: 200 },
    { text: '> Launching δ-log.exe ...', delay: 400 },
    { text: '> ████████████████████████████ READY', delay: 600 },
];

document.addEventListener('DOMContentLoaded', () => {
    runBoot();
    setTimeout(() => {
        const overlay = document.getElementById('boot-overlay');
        if (overlay) overlay.style.display = 'none';
        buildCards();
    }, 6200);
});

function runBoot() {
    const container = document.getElementById('boot-lines');
    let totalDelay = 0;
    BOOT_LINES.forEach(line => {
        totalDelay += line.delay;
        setTimeout(() => {
            const div = document.createElement('div');
            div.textContent = line.text;
            if (line.text.includes('FAILED') || line.text.includes('WARNING')) {
                div.style.color = '#ff3d3d';
            }
            if (line.text.includes('READY')) {
                div.style.color = '#39ff14';
                div.style.fontWeight = '700';
            }
            container.appendChild(div);
            container.scrollTop = container.scrollHeight;
        }, totalDelay);
    });
}

// ====== BUILD 100 CARDS ======
function buildCards() {
    const grid = document.getElementById('cards-grid');
    const unlockedMap = {};
    CARDS.forEach(c => { unlockedMap[c.id] = c; });

    for (let i = 1; i <= 100; i++) {
        const card = document.createElement('div');
        card.className = 'log-card';

        if (unlockedMap[i]) {
            card.classList.add('unlocked');
            card.innerHTML = `<span class="card-num">${String(i).padStart(3, '0')}</span>
                              <span class="card-icon">${unlockedMap[i].icon}</span>`;
            card.addEventListener('click', () => showDetail(unlockedMap[i], card));
        } else {
            card.classList.add('locked');
            card.innerHTML = `<span class="card-num" style="opacity:0.2;">${String(i).padStart(3, '0')}</span>`;
        }
        grid.appendChild(card);
    }

    // 默认选中第一张
    const firstUnlocked = grid.querySelector('.unlocked');
    if (firstUnlocked) firstUnlocked.click();
}

// ====== SHOW DETAIL ======
function showDetail(data, cardEl) {
    // 高亮
    document.querySelectorAll('.log-card').forEach(c => c.classList.remove('active'));
    cardEl.classList.add('active');

    const tag = document.getElementById('detail-tag');
    const title = document.getElementById('detail-title');
    const body = document.getElementById('detail-body');

    tag.textContent = `CARD-${String(data.id).padStart(3, '0')}`;
    title.textContent = data.title;

    const statusClass = data.status === 'done' ? 'status-done' : 'status-wip';
    const statusText = data.status === 'done' ? 'COMPLETED' : 'IN PROGRESS';

    body.innerHTML = `
        <div class="log-date">📅 ${data.date}</div>
        <div class="log-status ${statusClass}">${statusText}</div>
        <div class="log-content">${data.content}</div>
        <div class="log-tech">${data.tech}</div>
        <div class="log-rant">${data.rant}</div>
    `;
}
