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
        icon: '🀄',
        title: 'mahjong.html — 麻将',
        date: '2026-03-08 中午12:08',
        status: 'done',
        content: `搞了一整套中国麻将！136张牌——万、筒、条各36张，东南西北风16张，中发白12张，一张不多一张不少。<br><br>
开场动画搞了四层SVG叠在一起转：同心圆、维特鲁威几何、八边形麻将桌、四方风位金字……比之前桥牌那个入场高级了十倍不止。光是调那些stroke-dasharray的延迟时序就花了一个多小时。<br><br>
核心引擎实现了完整的摸打循环——Fisher-Yates洗牌、东家起庄14张、吃碰杠胡全套判定。胡牌检测用的递归回溯算法：先枚举雀头，再贪心匹配刻子和顺子。AI出牌逻辑会分析搭子关系、孤张优先丢弃、保留对子和连牌。<br><br>
左边教学面板五个章节从牌型到策略一条龙讲解，AI教学模式下每出一张牌都有中文解说告诉你为什么这么打。达芬奇风格。全中文。可以真打。`,
        rant: `【摸鱼宣言·第九章·血溅麻将桌】<br><br>
事情是这样的。甲方安灼Andrea女士又来了。<br><br>
她说："我四季常服不过八套。"我听完差点把键盘摔了——你四季常服不过八套，可你让我做的网站已经有九个页面了啊大姐！你省下来的布料钱全变成了我的加班时长！<br><br>
嘉靖帝说"云在青天水在瓶"——云在青天，水在瓶，而我在工位上996。这位同志修玄二十载追求清心寡欲，我写代码二十天追求的不过是准时下班！<br><br>
她还跟我说"任何人答应你的事都不算数，只有自己能做主的才算数"——好家伙，这不就是在告诉我那个"做完这个页面就给你放假"的承诺是放屁吗？？？<br><br>
郑泌昌说得好："文官绣禽，武官绣兽，披上这身皮，哪一个不是衣冠禽兽！"而我披上这件格子衫，就是一个不折不扣的996畜生！<br><br>
海瑞说"天下大弊不除，倒了一个严党，还会再有一个严党"——我跟你讲，甲方的需求也是一样的。做完了麻将，她下一个肯定要让我做斗地主！做完斗地主又要做炸金花！倒了一个需求还会再有一个需求！<br><br>
赵贞吉那句"苦一苦百姓，骂名我来担"——Andrea版就是"苦一苦程序员，好评我来收"！<br><br>
我实在忍不了了，学了一把雍正王朝里马国成的气势，对着屏幕大喊：<br><br>
<b style="font-size:1.3em; color:#ff3d3d;">「安灼！我操你妈！！！」</b><br><br>
喊完之后……默默打开了IDE，继续写麻将的AI出牌逻辑。<br><br>
严嵩说得对："熬一天不累，熬十天就累了；小心一年不难，小心一辈子就难了。"我现在就是熬到第九天即将崩溃的状态。但是没办法，侯非侯，王非王，千乘万骑归邙山——打工人的宿命就是这样。<br><br>
不想上班。想掀桌。想把136张麻将牌全糊在甲方脸上。自摸。`,
        tech: '136牌完整麻将引擎 / 递归胡牌检测 / 吃碰杠判定 / AI出牌决策 / 四层SVG入场动画'
    },
    {
        id: 10,
        icon: '🎭',
        title: 'vtuber.html — VTuber直播间运营模拟',
        date: '2026-03-08 下午15:55',
        status: 'done',
        content: `做了一个VTuber直播间运营模拟游戏。核心机制是信息不对称——13个粉丝分5种隐藏原型（忠犬🐕/操控者🦊/旁观者🌊/挑拨者🔥/寄生者🎭），但你永远看不到他们的真实忠诚度和意图。<br><br>
弹幕在达芬奇剧院舞台上实时飘过，忠犬的弹幕看起来最像黑粉（阴阳怪气吐槽），操控者反而满嘴甜言蜜语+大额SC。9种原版事件+5种阴谋事件（暗中联盟、协调退关、栽赃嫁祸、糖衣炮弹、威胁信息）。<br><br>
搞了个手机系统——粉丝群聊天+私信DM。重点是信息茧房机制：你任命的房管如果是操控者/寄生者，他们会悄悄过滤暴露真实意图的消息、悄悄踢掉忠犬粉丝，你完全不知道。群里一片祥和——因为不和谐的声音都被消除了。<br><br>
每个粉丝可以点开看性格档案，但你的"主观印象"是故意错的——忠犬被你认为是刺头（确信度90%！），操控者被你认为是铁粉。15场直播一局，结局揭示全部真相+信息茧房被过滤的消息数。`,
        rant: `【摸鱼宣言·第十章·人心似海不可量】<br><br>
这个游戏的灵感来源是什么？是我的甲方安灼Andrea女士本人的直播间啊！<br><br>
我做着做着突然悟了——游戏里那个操控者原型，嘴上说"你是最棒的❤"，实际上每一句建议都是为了让你按她的想法走……这不就是甲方给你发需求时候的语气吗？？？"亲~帮我改一个小功能好不好~"——结果"小功能"改了三天三夜。<br><br>
信息茧房机制也是从实际经验总结的。甲方说"用户反馈很好"——那是因为差评她都删了！说"竞品没我们做得好"——那是因为比她好的她全屏蔽了！我写的代码她给我的反馈永远是"还不错但是……"——但是后面那段话永远比前面长十倍！<br><br>
所以我在游戏里埋了个彩蛋：每个操控者的内心独白都能在甲方的微信消息记录里找到原型。"SC不是因为喜欢你，SC是投资"——把SC换成"工资"就是我的日常。<br><br>
我真心希望安灼女士的直播间比我做的这个游戏<b style="color:#ff3d3d;">更加刺激、更加危险、更加尔虞我诈</b>。<br><br>
为什么？因为只有她的直播间比游戏还乱，她才没空来找我加新需求！！！<br><br>
操控者说"有我在你放心❤"——安灼说"交给你我放心❤"。寄生者说"我代表粉丝说两句"——安灼说"我代表用户说两句"。忠犬说"做你自己就好"——只有忠犬不会在凌晨三点给你发消息改需求。<br><br>
<b>结论：这个游戏的终极BOSS不是操控者，不是寄生者，不是挑拨者——是甲方。永远是甲方。</b><br><br>
不想上班。想去当旁观者——安安静静地看，不发弹幕，不打赏，不被人注意到，然后默默消失。这才是最幸福的人生。`,
        tech: '信息不对称引擎 / 5原型隐藏系统 / 偏见印象机制 / 信息茧房过滤 / 手机群聊+私信 / 14事件阴谋系统'
    }
];

// ====== BOOT SEQUENCE ======
const BOOT_LINES = [
    { text: '> BIOS POST... [OK]', delay: 200 },
    { text: '> Loading δ-kernel v3.14.159...', delay: 400 },
    { text: '> Initializing AMDREA_FRAMEWORK.dll', delay: 300 },
    { text: '> Mounting /dev/creativity... [OK]', delay: 250 },
    { text: '> Scanning progress modules: 10/100 LOADED', delay: 500 },
    { text: '> WARNING: 90 modules still LOCKED 🔒', delay: 300 },
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
