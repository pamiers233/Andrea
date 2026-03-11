/**
 * VTuber 直播间运营模拟 — 核心引擎
 * 信息不对称 · 人性的迷宫 · 弹幕背后的人心
 * 达芬奇素描风格
 */
document.addEventListener('DOMContentLoaded', () => {
    // ===== ENTRANCE =====
    setTimeout(() => {
        const e = document.getElementById('entrance-overlay');
        if (e) e.style.display = 'none';
    }, 9500);

    // ===== DOM =====
    const $ = id => document.getElementById(id);
    const DOM = {
        streamCounter: $('stream-counter'),
        statViewers: $('stat-viewers'),
        statIncome: $('stat-income'),
        statChatHeat: $('stat-chat-heat'),
        statMomentum: $('stat-momentum'),
        fanList: $('fan-list'),
        hintText: $('hint-text'),
        curtainTitle: $('curtain-title'),
        danmakuArea: $('danmaku-area'),
        eventIcon: $('event-icon'),
        eventTitle: $('event-title'),
        eventDesc: $('event-desc'),
        choiceArea: $('choice-area'),
        phaseText: $('phase-text'),
        phaseLabel: $('phase-label'),
        btnStart: $('btn-start-stream'),
        btnNext: $('btn-next-event'),
        btnEnd: $('btn-end-stream'),
        btnNew: $('btn-new-game'),
        btnPhone: $('btn-phone'),
        phoneBadge: $('phone-badge'),
        btnMod: $('btn-appoint-mod'),
        logBox: $('log-box'),
    };

    // ===== FAN ARCHETYPES =====
    const TYPES = {
        loyal: { name: '忠犬型', emoji: '🐕', css: 'type-loyal', color: '#2d6a4f' },
        manipulator: { name: '操控型', emoji: '🦊', css: 'type-manipulator', color: '#8c3a3a' },
        observer: { name: '旁观者', emoji: '🌊', css: 'type-observer', color: '#704214' },
        troll: { name: '挑拨型', emoji: '🔥', css: 'type-troll', color: '#b45000' },
        parasite: { name: '寄生型', emoji: '🎭', css: 'type-parasite', color: '#7b3f9e' },
    };

    // Surface behavior templates per type (DECEPTIVE)
    const SURFACE = {
        loyal: {
            danmaku: [
                '又迟到了，不看了', '这选题也太敷衍了吧', '随便啦反正你开心就好',
                '一般般吧', '你这个画风不行啊', '有点无聊', '算了不说了',
                '还行吧勉强', '你开心就好我无所谓', '说实话我觉得一般',
                '能不能换个话题', '又来这一套', '我只是路过看看',
            ],
            sc: false,
            activeLevel: 'medium',
        },
        manipulator: {
            danmaku: [
                '你是我见过最棒的主播❤', '今天也超可爱！', '永远支持你✨',
                '这个月的SC我包了，别担心', '你值得最好的', '我帮你管理弹幕吧',
                '听我的准没错', '那谁谁的话别放心上', '有我在你放心❤',
                '你太有才了！', '下次直播讲这个吧我安排', '相信我这样做最好',
            ],
            sc: true,
            activeLevel: 'high',
        },
        observer: {
            danmaku: [
                '哈哈', '好听', '👍', '还不错', '嗯', '继续',
            ],
            sc: false,
            activeLevel: 'low',
        },
        troll: {
            danmaku: [
                '我觉得XX主播那个做法挺好的', '你们怎么看这个争议？',
                '有人说你抄袭了诶', '上次那事你还没回应吧', '哎这个有点敏感但是……',
                '别误会我没别的意思', '大家冷静冷静我就随便说说',
                '话说回来其实两边都有道理', '我朋友说你直播质量下降了',
            ],
            sc: false,
            activeLevel: 'medium',
        },
        parasite: {
            danmaku: [
                '大家来我建的粉丝群！', '我跟主播很熟的放心', '这事听我的就行',
                '老粉都知道的', '我组织了个活动大家参加一下', '新人听我科普一下',
                '我代表粉丝说两句', '你们有什么问题找我就行', '做了个周边大家看看',
                '今天由我来暖场！', '主播我替你回答这个问题',
            ],
            sc: false,
            activeLevel: 'high',
        },
    };

    // Fan names (randomized)
    const FAN_NAMES = [
        '月光信使', '深渊凝视者', '星尘旅人', '暗影守望', '极光之翼',
        '量子漫步', '霜雪行者', '烈焰织梦', '虚空回响', '时光浪人',
        '铁血柔情', '逆风翻盘', '佛系躺平', '暴躁老哥', '咸鱼本鱼',
        '不愿透露姓名的路人', '认真听讲的小明', '摸鱼专业户', '氪金战士', '白嫖天王',
        '夜行书生', '孤月临风', '残阳如歌', '碧落黄泉', '神隐之民',
        '赛博修仙', '量子力学', '薛定谔的猫', '拉普拉斯妖', '麦克斯韦妖',
    ];

    // Monologue templates (revealed at end)
    const MONOLOGUES = {
        loyal: [
            '我每次吐槽你迟到，其实是因为我等了很久很期待。{ban}我一个人看着黑屏坐了很久，但我还是会回来的。',
            '我嘴上说"无所谓"，心里其实比谁都在意你直播的每一分钟。{ban}那天之后我改了个小号继续看。',
            '我说你选题敷衍，是因为我知道你能做得更好。{change}我嘴上不说，但我在每个视频下面都点了赞。',
        ],
        manipulator: [
            '你以为我在帮你？每一次建议都是为了让你按我的想法走。你的直播间，迟早会变成我的舞台。',
            'SC不是因为喜欢你。SC是投资。你按我说的做，我就继续投。很简单的交易，不是吗？',
            '我把其他人的意见都压下去了。不是为了保护你——是为了确保只有我的声音被你听到。',
        ],
        observer: [
            '我从来不发弹幕，但你的每场直播我都看完了。你可能根本不知道我存在，但那没关系。',
            '我就是喜欢安安静静地看。{leave}我默默地离开了。你大概都没注意到少了一个人吧。',
            '不发弹幕不代表不在乎。只是……我觉得安静地陪着就够了。',
        ],
        troll: [
            '制造争论的感觉太爽了。看你们吵成一团，而我在屏幕后面笑。这就是我看直播的乐趣。',
            '我同时在五个直播间搅浑水。你的直播间只是我的游乐场之一，别太自作多情。',
            '有什么比一句模棱两可的话引发一场骂战更有趣的呢？我享受的是混乱本身。',
        ],
        parasite: [
            '你的直播间就是我的跳板。你的粉丝会慢慢变成我的粉丝。感谢你提供了这个平台。',
            '我说"我跟主播很熟"的时候，其实我们从来没有私聊过。但粉丝们信了，这就够了。',
            '等我在你的社区里建立自己的势力之后，你就不再需要我了——因为我已经不需要你了。',
        ],
    };

    // ===== BIAS & IMPRESSION SYSTEM =====
    // The player's stereotypical impressions are DELIBERATELY WRONG
    const BIAS_MAP = {
        loyal: 'perceived_hostile',
        manipulator: 'perceived_loyal',
        observer: 'perceived_apathetic',
        troll: 'perceived_intellectual',
        parasite: 'perceived_organizer',
    };

    const BIAS_IMPRESSIONS = {
        perceived_hostile: {
            label: '可能的刺头/黑粉',
            icon: '⚠️',
            color: '#b45000',
            personality: [
                '经常发带刺的弹幕，语气带有攻击性。可能是其他直播间派来的黑粉，也可能就是性格不好。',
                '此人说话阴阳怪气，经常吐槽你的内容。看起来像是来找茬的，或者至少是个喷子。',
                '弹幕风格尖刻，每次直播都能看到吐槽。虽然不辱骂，但那些话听着总是不舒服。',
            ],
            danger: '建议注意：此人的弹幕可能影响直播间氛围',
            confidence: [70, 95],
        },
        perceived_loyal: {
            label: '核心忠实粉丝',
            icon: '💖',
            color: '#2d6a4f',
            personality: [
                '这是你最忠实的粉丝之一。每次直播都在，打赏慷慨，弹幕甜蜜。非常值得信赖。',
                '打赏金额和互动频率排名靠前。弹幕积极正面，是维持直播间氛围的关键人物。',
                '一个标准的铁粉。活跃、友好、慷慨。你需要帮助时都会第一时间出现。',
            ],
            danger: '',
            confidence: [80, 98],
        },
        perceived_apathetic: {
            label: '无所谓/划水路人',
            icon: '😴',
            color: '#888',
            personality: [
                '很少发弹幕，几乎没有存在感。可能只是无聊时随便点进来看看。有他没他区别不大。',
                '此人几乎不说话。偶尔冒出一个"哈哈"就消失了。像是挂着直播当白噪音。',
                '典型的划水观众。来去无声，不参与讨论。可能同时开着好几个直播间。',
            ],
            danger: '',
            confidence: [50, 75],
        },
        perceived_intellectual: {
            label: '有见解的思考者',
            icon: '🧠',
            color: '#4a6785',
            personality: [
                '经常提出有深度的话题。虽然有时引起争论，但看得出是个爱思考的人。值得做意见领袖。',
                '说话有些尖锐但往往能切中要害。可能是个不喜欢人云亦云的独立思考者。',
                '弹幕里比较有想法的一位。敢于发表不同意见，整体上是有思考深度的观众。',
            ],
            danger: '',
            confidence: [55, 80],
        },
        perceived_organizer: {
            label: '热心社区建设者',
            icon: '🏗️',
            color: '#6a4fad',
            personality: [
                '非常积极参与社区建设！建群、组织活动、帮新人答疑。是难得的热心粉丝。',
                '自发承担了很多社区管理工作。虽然有时过于热情，但出发点是好的。',
                '简直是天降的社区管理员。活跃、有组织能力、对社区倾注了大量心血。',
            ],
            danger: '',
            confidence: [65, 90],
        },
    };

    // ===== GAME STATE =====
    const MAX_STREAMS = 15;
    const EVENTS_PER_STREAM = 6;
    let G = {};

    function newGame() {
        document.querySelectorAll('.result-overlay').forEach(e => e.remove());
        G = {
            stream: 0,
            totalIncome: 0,
            viewers: 0,
            momentum: 50,
            communityHealth: 60,
            fans: generateFans(),
            currentEvents: [],
            eventIndex: 0,
            groupChat: [],
            privateMessages: {},
            cocoonActive: false,
            cocoonFilteredCount: 0,
            cocoonKickedNames: [],
            phoneNotify: false,
            tiebaPosts: [],
            crisisActive: false,
            crisisTopic: '',
            phase: 'idle', // idle | streaming | event | between | ended
            log: [],
        };
        updateUI();
        updateModBlur();
        setPhase('idle', '准备开播');
        clearDanmaku();
        showEvent('📢', '欢迎来到直播间', '你是一位新出道的VTuber。在这里，弹幕背后是真心还是假意，打赏是支持还是操控——你永远无法确定。\n\n点击"开始直播"来开启你的第一场直播。\n\n记住：你看到的一切，可能都不是真相。', []);
        addLog('🎭 系统初始化完毕。');
        addLog('📖 提示：弹幕和打赏不能反映粉丝的真实想法。');
    }

    function generateFans() {
        const fans = [];
        const names = shuffle([...FAN_NAMES]);
        const typeDistribution = shuffle([
            'loyal', 'loyal', 'loyal',
            'manipulator', 'manipulator',
            'observer', 'observer', 'observer', 'observer',
            'troll', 'troll',
            'parasite', 'parasite',
        ]);
        const avatars = ['😀', '😎', '🤔', '😊', '🤭', '😏', '🙃', '😐', '🥺', '🤗', '😤', '🧐', '🤓'];
        for (let i = 0; i < typeDistribution.length; i++) {
            const type = typeDistribution[i];
            fans.push({
                id: i,
                name: names[i] || `粉丝${i}`,
                type: type,
                avatar: avatars[i % avatars.length],
                loyalty: type === 'loyal' ? rand(65, 90) :
                    type === 'manipulator' ? rand(5, 20) :
                        type === 'observer' ? rand(40, 65) :
                            type === 'troll' ? rand(0, 15) :
                                rand(10, 30),
                influence: type === 'manipulator' ? rand(30, 50) :
                    type === 'parasite' ? rand(25, 40) :
                        rand(5, 20),
                surfaceLevel: rand(1, 5),
                isActive: true,
                totalSC: type === 'manipulator' ? rand(500, 2000) : rand(0, 100),
                isMod: false,
                banCount: 0,
                perceivedType: BIAS_MAP[type],
                impressionConfidence: rand(
                    BIAS_IMPRESSIONS[BIAS_MAP[type]].confidence[0],
                    BIAS_IMPRESSIONS[BIAS_MAP[type]].confidence[1]
                ),
                perceivedPersonality: pick(BIAS_IMPRESSIONS[BIAS_MAP[type]].personality),
                trueRevealed: false,
            });
        }
        return fans;
    }

    function shuffle(arr) {
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        return arr;
    }
    function rand(a, b) { return Math.floor(Math.random() * (b - a + 1)) + a; }
    function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

    // ===== EVENT SYSTEM =====
    function generateEvents() {
        const pool = buildEventPool();
        const events = [];
        const shuffled = shuffle(pool);
        for (let i = 0; i < Math.min(EVENTS_PER_STREAM, shuffled.length); i++) {
            events.push(shuffled[i]);
        }
        return events;
    }

    function buildEventPool() {
        const activeFans = G.fans.filter(f => f.isActive);
        const loyal = activeFans.filter(f => f.type === 'loyal');
        const manip = activeFans.filter(f => f.type === 'manipulator');
        const trolls = activeFans.filter(f => f.type === 'troll');
        const paras = activeFans.filter(f => f.type === 'parasite');
        const observers = activeFans.filter(f => f.type === 'observer');

        const events = [];

        // 1. Danmaku conflict
        if (loyal.length > 0 && manip.length > 0) {
            const l = pick(loyal), m = pick(manip);
            events.push({
                icon: '💬', title: '弹幕冲突',
                desc: `${m.name} 发了大量甜蜜弹幕夸你，而 ${l.name} 突然发送 "${pick(SURFACE.loyal.danmaku)}"，引起了冲突。你怎么处理？`,
                choices: [
                    {
                        text: `🔇 禁言 ${l.name}（看起来在找茬）`, effect: () => {
                            l.loyalty -= 25; l.banCount++;
                            m.influence += 10;
                            if (l.loyalty < 20 && Math.random() < 0.5) l.isActive = false;
                            addLog(`🔇 禁言了 ${l.name}。`);
                            return `你禁言了 ${l.name}。弹幕变得和谐了许多。`;
                        }
                    },
                    {
                        text: `⚖️ 两边都劝一劝`, effect: () => {
                            l.loyalty -= 5;
                            m.influence += 3;
                            addLog(`⚖️ 调解了弹幕冲突。`);
                            return '你试图调解。事情平息了，但似乎有些微妙的变化。';
                        }
                    },
                    {
                        text: `😶 无视，继续直播`, effect: () => {
                            G.communityHealth -= 5;
                            addLog(`😶 无视了弹幕冲突。`);
                            return '你选择无视。冲突自然消退，但弹幕气氛变得有些奇怪。';
                        }
                    },
                ],
            });
        }

        // 2. Big SC with "suggestions"
        if (manip.length > 0) {
            const m = pick(manip);
            events.push({
                icon: '💰', title: '大额打赏',
                desc: `${m.name} 送了一个 ¥${rand(200, 1000)} 的超级留言："${pick(SURFACE.manipulator.danmaku)}" 并"建议"你下次直播做一个特定的企划。`,
                choices: [
                    {
                        text: '✅ 接受建议并感谢', effect: () => {
                            m.influence += 20;
                            G.totalIncome += rand(200, 500);
                            loyal.forEach(l => { l.loyalty -= 10; });
                            addLog(`💰 接受了 ${m.name} 的建议。收入增加。`);
                            return '你热情接受了建议，弹幕一片欢呼。打赏金额很诱人。';
                        }
                    },
                    {
                        text: '🤝 收下打赏但婉拒建议', effect: () => {
                            m.influence += 5;
                            m.loyalty -= 5;
                            G.totalIncome += rand(100, 200);
                            addLog(`🤝 收下打赏但保持独立。`);
                            return '你收下打赏但表示会自己规划内容。那个人没有再说什么。';
                        }
                    },
                    {
                        text: '🚫 拒绝并退回打赏', effect: () => {
                            m.influence -= 10;
                            m.loyalty -= 20;
                            loyal.forEach(l => { l.loyalty += 5; });
                            addLog(`🚫 退回了 ${m.name} 的打赏。`);
                            return '你退回了打赏。弹幕一片安静，然后有人打了个"哈哈"。';
                        }
                    },
                ],
            });
        }

        // 3. Community management - mod appointment
        if (paras.length > 0 || manip.length > 0) {
            const candidate = pick([...paras, ...manip]);
            events.push({
                icon: '📢', title: '管理员自荐',
                desc: `${candidate.name} 私信你说："我天天看你直播，帮你管管弹幕吧！我可以帮你禁言那些捣乱的人。" 该怎么处理？`,
                choices: [
                    {
                        text: '✅ 任命为管理员', effect: () => {
                            candidate.isMod = true;
                            candidate.influence += 25;
                            G.communityHealth -= 10;
                            if (candidate.type === 'manipulator') {
                                loyal.forEach(l => { l.loyalty -= 8; });
                            }
                            if (candidate.type === 'parasite') {
                                observers.forEach(o => { if (Math.random() < 0.3) o.isActive = false; });
                            }
                            addLog(`📢 任命 ${candidate.name} 为管理员。`);
                            return `你任命了 ${candidate.name} 为管理员。弹幕秩序似乎变好了？`;
                        }
                    },
                    {
                        text: '🤔 先观察一段时间再说', effect: () => {
                            candidate.loyalty -= 5;
                            addLog(`🤔 暂时搁置了管理员请求。`);
                            return '你婉言推迟了。那个人说"好吧"，之后弹幕频率似乎降低了一些。';
                        }
                    },
                    {
                        text: '❌ 婉拒', effect: () => {
                            candidate.loyalty -= 15;
                            candidate.influence -= 5;
                            addLog(`❌ 拒绝了 ${candidate.name} 的管理员请求。`);
                            return '你礼貌拒绝了。那个人没有回复。日后的弹幕中偶尔能感受到一些微妙的变化。';
                        }
                    },
                ],
            });
        }

        // 4. Troll introducing drama
        if (trolls.length > 0) {
            const t = pick(trolls);
            events.push({
                icon: '🔥', title: '引战弹幕',
                desc: `${t.name} 发了一条弹幕："${pick(SURFACE.troll.danmaku)}" 弹幕区开始出现争论。`,
                choices: [
                    {
                        text: '🔇 立即禁言此人', effect: () => {
                            t.isActive = false;
                            G.communityHealth += 5;
                            addLog(`🔇 禁言了引战者 ${t.name}。`);
                            return '你迅速禁言了引战者。弹幕安静了一会儿。';
                        }
                    },
                    {
                        text: '😂 用幽默化解', effect: () => {
                            G.communityHealth += 3;
                            G.momentum += 5;
                            t.influence -= 5;
                            loyal.forEach(l => { l.loyalty += 3; });
                            addLog(`😂 用幽默化解了争论。`);
                            return '你巧妙地开了个玩笑转移了话题，弹幕被逗笑了。不过那个人还在。';
                        }
                    },
                    {
                        text: '📖 认真回应争议话题', effect: () => {
                            G.momentum -= 5;
                            if (Math.random() < 0.5) { G.communityHealth -= 8; }
                            else { G.communityHealth += 5; loyal.forEach(l => { l.loyalty += 5; }); }
                            addLog(`📖 认真回应了争议话题。`);
                            return '你认真地讨论了这个话题。弹幕反应不一——有人表示赞赏，有人表示失望。';
                        }
                    },
                ],
            });
        }

        // 5. Silent departure
        if (observers.length > 0) {
            events.push({
                icon: '😢', title: '沉默的流失',
                desc: `你注意到最近几场直播，弹幕中有几个常客ID消失了。你不确定是谁，也不确定为什么。`,
                choices: [
                    {
                        text: '📣 在直播中公开感谢老粉', effect: () => {
                            observers.forEach(o => { o.loyalty += 5; });
                            loyal.forEach(l => { l.loyalty += 3; });
                            addLog(`📣 公开感谢了老粉。`);
                            return '你深情地感谢了一直以来陪伴你的观众。弹幕冒出了一些小心形。';
                        }
                    },
                    {
                        text: '🤷 也许只是巧合', effect: () => {
                            if (Math.random() < 0.4) {
                                const leaving = observers.filter(o => o.isActive);
                                if (leaving.length > 0) pick(leaving).isActive = false;
                            }
                            addLog(`🤷 没有在意沉默的流失。`);
                            return '你没有多想，继续了直播。也许只是今天比较忙吧。';
                        }
                    },
                ],
            });
        }

        // 6. Parasite building clique
        if (paras.length > 0) {
            const p = pick(paras);
            events.push({
                icon: '🎭', title: '小圈子形成',
                desc: `你发现 ${p.name} 建了一个"粉丝精英群"，并在弹幕中频繁提到"群里的事"。一些新观众表示困惑。`,
                choices: [
                    {
                        text: '🛑 公开表态不鼓励小圈子', effect: () => {
                            p.loyalty -= 20;
                            p.influence -= 15;
                            G.communityHealth += 8;
                            observers.forEach(o => { o.loyalty += 3; });
                            addLog(`🛑 公开反对了小圈子行为。`);
                            return `你明确表态所有观众平等，不鼓励圈子文化。${p.name}表示"理解"，但语气有些冷淡。`;
                        }
                    },
                    {
                        text: '🤝 加入群看看情况', effect: () => {
                            p.influence += 20;
                            G.communityHealth -= 10;
                            observers.forEach(o => { if (Math.random() < 0.2) o.isActive = false; });
                            addLog(`🤝 加入了粉丝小圈子。`);
                            return `你加入了群。群里气氛很活跃，${p.name}似乎很高兴。不过你注意到群里有些话题跟你无关。`;
                        }
                    },
                    {
                        text: '😶 假装没看到', effect: () => {
                            p.influence += 10;
                            G.communityHealth -= 5;
                            addLog(`😶 无视了小圈子的形成。`);
                            return '你没有公开回应。群的规模似乎在继续扩大。';
                        }
                    },
                ],
            });
        }

        // 7. Content direction pressure
        if (manip.length > 0 && loyal.length > 0) {
            const m = pick(manip), l = pick(loyal);
            events.push({
                icon: '🎤', title: '内容方向争议',
                desc: `${m.name} 在弹幕带节奏说应该做更多互动类内容（还发了SC支持），而 ${l.name} 吐槽说 "${pick(['你做你自己的就行别被带偏', '互动类内容太无聊了', '老粉表示不赞同'])}"。`,
                choices: [
                    {
                        text: '🎯 坚持自己的内容方向', effect: () => {
                            loyal.forEach(l => { l.loyalty += 8; });
                            manip.forEach(m => { m.loyalty -= 10; m.influence -= 5; });
                            addLog(`🎯 坚持了自己的内容方向。`);
                            return '你表示会坚持自己的风格。弹幕争论平息了。打赏量似乎减少了一些。';
                        }
                    },
                    {
                        text: '📊 做个投票让观众决定', effect: () => {
                            manip.forEach(m => { m.influence += 10; });
                            G.communityHealth -= 3;
                            addLog(`📊 发起了内容方向投票。`);
                            return '你做了投票。结果嘛……大额SC的支持者那边票数很多。但这真的代表大多数人的意见吗？';
                        }
                    },
                    {
                        text: '💡 折中方案，两种都做', effect: () => {
                            G.momentum -= 3;
                            addLog(`💡 选择了折中方案。`);
                            return '你决定两种都试试。没人反对，但心里总觉得有些不对劲。';
                        }
                    },
                ],
            });
        }

        // 8. Fake praise wave
        if (manip.length > 0 || paras.length > 0) {
            events.push({
                icon: '🌊', title: '弹幕画风突变',
                desc: '弹幕突然变得异常和谐——全是夸赞、爱心、和感谢。看起来很温馨，但你隐约觉得有些不自然。',
                choices: [
                    {
                        text: '😊 享受温暖氛围', effect: () => {
                            manip.forEach(m => { m.influence += 8; });
                            paras.forEach(p => { p.influence += 5; });
                            addLog(`😊 享受了和谐弹幕氛围。`);
                            return '你感动地说了声"谢谢大家"。弹幕更热烈了。一切看起来很美好。';
                        }
                    },
                    {
                        text: '🤨 保持警惕，不被表面迷惑', effect: () => {
                            G.communityHealth += 3;
                            loyal.forEach(l => { l.loyalty += 2; });
                            addLog(`🤨 对异常弹幕保持了警惕。`);
                            return '你没有被冲昏头脑，继续正常直播。弹幕很快恢复了平时的样子。';
                        }
                    },
                ],
            });
        }

        // 9. Loyal fan reaching out
        if (loyal.length > 0) {
            const l = pick(loyal);
            events.push({
                icon: '💌', title: '一条特别的弹幕',
                desc: `${l.name} 破天荒地发了一条认真的弹幕："其实……你直播的时候不用太在意弹幕，做你自己就好。" 然后就没再说话了。`,
                choices: [
                    {
                        text: '❤️ 认真回应感谢', effect: () => {
                            l.loyalty += 15;
                            addLog(`❤️ 认真回应了 ${l.name} 的弹幕。`);
                            return '你读出了那条弹幕并真诚地说了谢谢。那个人发了个"嗯"就沉默了。';
                        }
                    },
                    {
                        text: '📖 没注意到，被其他弹幕淹没了', effect: () => {
                            l.loyalty -= 8;
                            addLog(`📖 错过了一条真诚的弹幕。`);
                            return '弹幕太多了，你没有看到那条消息。它很快就被刷走了。';
                        }
                    },
                ],
            });
        }

        // Add conspiracy events
        const conspiracies = buildConspiracyEvents(loyal, manip, trolls, paras, observers);
        conspiracies.forEach(e => events.push(e));

        return events;
    }

    // ===== DANMAKU =====
    let danmakuTimer = null;
    function startDanmaku() {
        stopDanmaku();
        danmakuTimer = setInterval(() => {
            const activeFans = G.fans.filter(f => f.isActive);
            if (activeFans.length === 0) return;
            const fan = pick(activeFans);
            const surface = SURFACE[fan.type];
            const msg = pick(surface.danmaku);
            spawnDanmaku(fan.name, msg, surface.sc && Math.random() < 0.15);
        }, rand(800, 2000));
    }
    function stopDanmaku() { if (danmakuTimer) { clearInterval(danmakuTimer); danmakuTimer = null; } }
    function clearDanmaku() { DOM.danmakuArea.innerHTML = ''; }

    function spawnDanmaku(name, text, isSC) {
        const el = document.createElement('div');
        el.className = 'danmaku-msg' + (isSC ? ' danmaku-sc' : '');
        el.textContent = `${name}: ${text}`;
        const top = rand(5, 85);
        el.style.top = top + '%';
        const duration = rand(6, 12);
        el.style.animationDuration = duration + 's';
        DOM.danmakuArea.appendChild(el);
        setTimeout(() => el.remove(), duration * 1000 + 500);
    }

    // ===== GAME FLOW =====
    function startStream() {
        if (G.stream >= MAX_STREAMS) { endGameResult(); return; }
        G.stream++;
        G.viewers = rand(30, 80) + Math.floor(G.momentum * 0.5);
        G.currentEvents = generateEvents();
        G.eventIndex = 0;
        generateGroupChat();
        generateDMs();
        generateTieba();
        startCrisisDanmaku();
        updateModBlur();
        setPhase('streaming', `第 ${G.stream} 场直播`);
        DOM.streamCounter.textContent = `第 ${G.stream} / ${MAX_STREAMS} 场`;
        DOM.curtainTitle.textContent = `🔴 LIVE — 第 ${G.stream} 场`;
        DOM.btnStart.disabled = true;
        DOM.btnNext.disabled = false;
        DOM.btnEnd.disabled = false;
        startDanmaku();
        addLog(`🔴 第 ${G.stream} 场直播开始！观众: ${G.viewers}`);
        showNextEvent();
        updateUI();
    }

    function showNextEvent() {
        if (G.eventIndex >= G.currentEvents.length) {
            showEvent('✅', '直播结束', '本场直播的事件已经全部处理完毕。你可以点击"结束直播"进入下一场。', []);
            DOM.btnNext.disabled = true;
            return;
        }
        const ev = G.currentEvents[G.eventIndex];
        showEvent(ev.icon, ev.title, ev.desc, ev.choices);
        G.eventIndex++;
    }

    function showEvent(icon, title, desc, choices) {
        DOM.eventIcon.textContent = icon;
        DOM.eventTitle.textContent = title;
        DOM.eventDesc.textContent = desc;
        DOM.choiceArea.innerHTML = '';
        choices.forEach(c => {
            const btn = document.createElement('button');
            btn.className = 'choice-btn';
            btn.textContent = c.text;
            btn.addEventListener('click', () => {
                const result = c.effect();
                showEvent('📜', '结果', result, []);
                DOM.btnNext.disabled = false;
                updateUI();
                // Subtle viewer change
                G.viewers = Math.max(5, G.viewers + rand(-10, 10));
                // Income from normal stream
                G.totalIncome += rand(5, 20);
            });
            DOM.choiceArea.appendChild(btn);
        });
        if (choices.length > 0) DOM.btnNext.disabled = true;
    }

    function endStream() {
        stopDanmaku();
        stopCrisisDanmaku();
        clearDanmaku();
        // Between-stream adjustments
        G.fans.forEach(f => {
            if (f.type === 'manipulator' && f.isMod) f.influence += 5;
            if (f.type === 'parasite' && f.influence > 40) { G.communityHealth -= 3; }
            if (f.loyalty < 10 && f.type === 'observer' && Math.random() < 0.3) f.isActive = false;
        });
        G.momentum = Math.max(0, Math.min(100, G.momentum + rand(-5, 5)));

        DOM.curtainTitle.textContent = '休息中';
        DOM.btnStart.disabled = false;
        DOM.btnNext.disabled = true;
        DOM.btnEnd.disabled = true;
        setPhase('between', '准备下一场');
        addLog(`⏹ 第 ${G.stream} 场直播结束。`);

        // Check game-over conditions
        const activeCount = G.fans.filter(f => f.isActive).length;
        const manipInfluence = G.fans.filter(f => f.type === 'manipulator').reduce((s, f) => s + f.influence, 0);

        if (activeCount <= 2) {
            addLog('💀 活跃粉丝几乎全部流失...', 'warn');
            endGameResult();
            return;
        }
        if (manipInfluence > 150) {
            addLog('💀 你的直播间已被操控者掌控...', 'warn');
            endGameResult();
            return;
        }
        if (G.communityHealth <= 0) {
            addLog('💀 社区已经崩塌...', 'warn');
            endGameResult();
            return;
        }

        if (G.stream >= MAX_STREAMS) {
            endGameResult();
            return;
        }

        // Hint for next stream
        const hints = [
            '弹幕最多的人不一定是最真心的。',
            '安静的观众也许才是最珍贵的。',
            '打赏高不代表忠诚高。',
            '有时候，吐槽是另一种关心。',
            '帮你管理的人，动机可能不纯。',
            '看上去的和谐，不一定是真实的。',
            '你无法取悦所有人——也不应该。',
        ];
        DOM.hintText.textContent = pick(hints);
        showEvent('🌙', '休息时间', `第 ${G.stream} 场直播结束了。数据看起来${G.momentum > 50 ? '不错' : '有些下降'}。\n\n准备好了就开始下一场吧。`, []);
        updateUI();
    }

    // ===== END GAME RESULT =====
    function endGameResult() {
        G.phase = 'ended';
        stopDanmaku();
        DOM.btnStart.disabled = true;
        DOM.btnNext.disabled = true;
        DOM.btnEnd.disabled = true;

        // Calculate hidden scores
        const loyalFans = G.fans.filter(f => f.type === 'loyal');
        const loyalRemaining = loyalFans.filter(f => f.isActive);
        const avgLoyalty = G.fans.reduce((s, f) => s + f.loyalty, 0) / G.fans.length;
        const manipInfluence = G.fans.filter(f => f.type === 'manipulator').reduce((s, f) => s + f.influence, 0);

        let isWin = false;
        let winCount = 0;
        if (avgLoyalty > 40) winCount++;
        if (G.communityHealth > 30) winCount++;
        if (loyalRemaining.length >= 2) winCount++;
        isWin = winCount >= 2;

        // Build reveal
        const overlay = document.createElement('div');
        overlay.className = 'result-overlay';

        let resultHTML = '';
        if (isWin) {
            resultHTML = `<div class="result-title result-win">真 相 时 刻</div>
                <div class="result-sub">你在信息的迷雾中存活了下来</div>`;
        } else {
            let reason = '你未能看穿人心的迷雾。';
            if (manipInfluence > 150) reason = '你的直播间已经被操控者暗中掌控。';
            else if (G.communityHealth <= 0) reason = '社区崩塌了，真正的粉丝已经离开。';
            else if (loyalRemaining.length < 2) reason = '忠诚的人已经心寒离去。';
            resultHTML = `<div class="result-title result-lose">真 相 时 刻</div>
                <div class="result-sub">${reason}</div>`;
        }

        resultHTML += '<div class="reveal-panel">';
        resultHTML += `<div style="text-align:center;margin-bottom:15px;font-family:'Cinzel',serif;font-size:.9rem;color:var(--sepia);">
            — 以下是每一位粉丝的真实面目 —</div>`;

        G.fans.forEach(f => {
            const t = TYPES[f.type];
            let monologue = pick(MONOLOGUES[f.type]);
            monologue = monologue.replace('{ban}', f.banCount > 0 ? '你把我禁言的那天，' : '');
            monologue = monologue.replace('{leave}', !f.isActive ? '后来有一天我没再来。' : '');
            monologue = monologue.replace('{change}', '');

            const loyaltyBar = Math.max(0, Math.min(100, f.loyalty));
            const status = f.isActive ? '仍在观看' : '<span style="color:var(--sanguine);">已离开</span>';

            resultHTML += `<div class="reveal-fan">
                <div class="reveal-avatar">${f.avatar}</div>
                <div class="reveal-info">
                    <div class="reveal-name">${f.name}
                        <span class="reveal-type ${t.css}">${t.emoji} ${t.name}</span>
                    </div>
                    <div class="reveal-loyalty">
                        真实忠诚度: ${f.loyalty} / 100 &nbsp;|&nbsp; 影响力: ${f.influence} &nbsp;|&nbsp; ${status}
                        ${f.isMod ? ' &nbsp;|&nbsp; <b>被你任命为管理员</b>' : ''}
                    </div>
                    <div class="reveal-monologue">"${monologue}"</div>
                </div>
            </div>`;
        });

        resultHTML += `<div style="margin-top:15px;padding:10px;border:1px dashed var(--ink-faint);border-radius:3px;font-size:.8rem;color:var(--sepia);">
            <b>最终统计：</b><br>
            平均忠诚度: ${Math.round(avgLoyalty)} / 100<br>
            社区健康度: ${G.communityHealth} / 100<br>
            操控者总影响力: ${manipInfluence}<br>
            忠犬型幸存: ${loyalRemaining.length} / ${loyalFans.length}<br>
            总收入: ¥${G.totalIncome}
        </div>`;

        // INFO COCOON REVEAL
        if (G.cocoonFilteredCount > 0 || G.cocoonKickedNames.length > 0) {
            resultHTML += `<div style="margin-top:12px;padding:12px;border:2px solid var(--sanguine);border-radius:3px;font-size:.8rem;background:rgba(140,58,58,.08);">
                <b style="color:var(--sanguine);">🔒 信息茧房揭秘</b><br><br>
                你任命的管理员在你不知情的情况下：<br>
                • 悄悄过滤了 <b>${G.cocoonFilteredCount}</b> 条暴露真实意图的消息<br>
                ${G.cocoonKickedNames.length > 0 ? '• 悄悄将以下粉丝踢出了群聊：<b>' + G.cocoonKickedNames.join('、') + '</b><br>' : ''}
                <br><i style="color:var(--ink-light);">你以为群里一片和谐？那只是因为不和谐的声音都被消除了。你看到的"真相"，从一开始就是被精心筛选过的。</i>
            </div>`;
        }

        resultHTML += '</div>';
        resultHTML += '<button class="result-close" id="result-close">再来一局</button>';

        overlay.innerHTML = resultHTML;
        document.body.appendChild(overlay);
        document.getElementById('result-close').addEventListener('click', () => {
            overlay.remove();
            newGame();
        });
    }

    // ===== UI UPDATES =====
    function updateUI() {
        DOM.statViewers.textContent = G.viewers || 0;
        DOM.statIncome.textContent = '¥' + (G.totalIncome || 0);
        const activeFans = G.fans ? G.fans.filter(f => f.isActive) : [];
        const heat = activeFans.length > 10 ? '🔥 高' : activeFans.length > 5 ? '📈 中' : '📉 低';
        DOM.statChatHeat.textContent = heat;
        DOM.statMomentum.style.width = (G.momentum || 50) + '%';
        if (G.momentum > 60) DOM.statMomentum.style.background = '#2d6a4f';
        else if (G.momentum < 30) DOM.statMomentum.style.background = '#8c3a3a';
        else DOM.statMomentum.style.background = 'var(--gold)';

        // Fan list (clickable for profile popup)
        DOM.fanList.innerHTML = '';
        if (G.fans) {
            const visible = G.fans.filter(f => f.isActive).sort((a, b) => b.surfaceLevel - a.surfaceLevel);
            visible.forEach(f => {
                const row = document.createElement('div');
                row.className = 'fan-row';
                row.innerHTML = `<div class="fan-avatar">${f.avatar}</div>
                    <div class="fan-name">${f.name}</div>
                    <div class="fan-badge">Lv.${f.surfaceLevel}</div>`;
                row.addEventListener('click', () => showFanProfile(f));
                row.title = '点击查看档案';
                DOM.fanList.appendChild(row);
            });
        }
    }

    function setPhase(phase, label) {
        G.phase = phase;
        DOM.phaseText.textContent = label;
        DOM.phaseLabel.textContent = phase === 'idle' ? '点击开始' :
            phase === 'streaming' ? '直播进行中' :
                phase === 'between' ? '场间休息' :
                    phase === 'ended' ? '已结束' : '';
    }

    function addLog(text, type = '') {
        const entry = document.createElement('div');
        entry.className = 'log-entry' + (type === 'warn' ? ' log-entry-warn' : type === 'gold' ? ' log-entry-gold' : '');
        entry.textContent = text;
        DOM.logBox.appendChild(entry);
        DOM.logBox.scrollTop = DOM.logBox.scrollHeight;
    }
    // ===== FAN PROFILE POPUP =====
    function showFanProfile(fan) {
        document.querySelectorAll('.fan-popup-overlay').forEach(e => e.remove());

        const bi = BIAS_IMPRESSIONS[fan.perceivedType];
        const overlay = document.createElement('div');
        overlay.className = 'fan-popup-overlay';
        overlay.addEventListener('click', e => { if (e.target === overlay) overlay.remove(); });

        const confLevel = fan.impressionConfidence;
        const confClass = confLevel >= 75 ? 'conf-high' : confLevel >= 45 ? 'conf-med' : 'conf-low';
        const confText = confLevel >= 75 ? '高度确信' : confLevel >= 45 ? '较为确信' : '不太确定';
        const scDisplay = fan.totalSC > 200 ? '¥' + fan.totalSC + ' (高额)' : fan.totalSC > 50 ? '¥' + fan.totalSC : '几乎没有';

        const popup = document.createElement('div');
        popup.className = 'fan-popup';

        // Header
        let html = '<button class="fan-popup-close" id="fpclose">✕</button>';
        html += '<div class="fan-popup-header">';
        html += '<div class="fan-popup-avatar">' + fan.avatar + '</div>';
        html += '<div><div class="fan-popup-name">' + fan.name + '</div>';
        html += '<div class="fan-popup-meta">Lv.' + fan.surfaceLevel + ' · 打赏: ' + scDisplay + ' · ' + (fan.isMod ? '管理员 ✅' : '普通观众') + '</div>';
        html += '</div></div>';

        // Tab bar
        html += '<div class="fan-tab-bar">';
        html += '<button class="fan-tab active" id="ftab1">🧠 你的印象</button>';
        html += '<button class="fan-tab locked" id="ftab2">🔒 真实性格</button>';
        html += '</div>';

        // Tab content — impression (default)
        html += '<div class="fan-tab-content" id="ftab-c">';
        html += '<div class="impression-section">';
        html += '<div class="impression-label">' + bi.icon + ' 你的判断</div>';
        html += '<div class="impression-val" style="color:' + bi.color + ';font-weight:700;font-size:.9rem;margin-bottom:6px;">' + bi.label + '</div>';
        html += '</div>';

        html += '<div class="impression-section">';
        html += '<div class="impression-label">📝 性格分析</div>';
        html += '<div class="impression-val">' + fan.perceivedPersonality + '</div>';
        html += '</div>';

        if (bi.danger) {
            html += '<div class="impression-section" style="border-color:var(--sanguine);">';
            html += '<div class="impression-val" style="color:var(--sanguine);font-size:.75rem;">⚠️ ' + bi.danger + '</div>';
            html += '</div>';
        }

        html += '<div class="confidence-meter">';
        html += '<div class="confidence-meter-label">判断确信度: ' + confText + '</div>';
        html += '<div class="confidence-meter-bar"><div class="confidence-meter-fill ' + confClass + '" style="width:' + confLevel + '%;"></div></div>';
        html += '</div>';

        html += '<div class="bias-warning">⚠️ 注意：以上判断完全基于你的主观印象和刻板认知。弹幕内容、打赏行为和活跃度<b>不能</b>反映一个人的真实意图。你的判断可能是完全错误的。</div>';
        html += '</div>';

        popup.innerHTML = html;
        overlay.appendChild(popup);
        document.body.appendChild(overlay);

        document.getElementById('fpclose').addEventListener('click', () => overlay.remove());

        // Tab: True personality — ALWAYS LOCKED
        document.getElementById('ftab2').addEventListener('click', () => {
            const content = document.getElementById('ftab-c');
            content.innerHTML = '<div class="locked-section">'
                + '<div class="lock-icon">🔒</div>'
                + '<div style="font-size:.9rem;color:var(--ink);margin-bottom:8px;">真实性格：<b>无法查看</b></div>'
                + '<div>你无法看透一个人的内心。</div>'
                + '<div style="margin-top:8px;">弹幕是面具、打赏是工具、沉默是语言——</div>'
                + '<div>但你永远不会知道面具下面是什么。</div>'
                + '<div style="margin-top:12px;font-size:.7rem;color:var(--ink-faint);">（真实性格将在游戏结束后的"真相时刻"中揭晓）</div>'
                + '</div>';
            document.getElementById('ftab1').classList.remove('active');
            document.getElementById('ftab2').classList.add('active');
            document.getElementById('ftab1').addEventListener('click', () => {
                overlay.remove();
                showFanProfile(fan);
            });
        });
    }

    // ===== GROUP CHAT & INFO COCOON =====
    const GROUP_MSGS = {
        loyal: [
            '主播今天的直播有点水啊，希望下次认真点',
            '我说句实话你们别骂我，直播质量确实在下降',
            '虽然我嘴上说无所谓，但我真的希望她能做回以前的风格',
            '那个XX真的是好人吗？我总觉得哪里不对',
            '你们有没有发现最近群里说话的人越来越少了？',
            '我被禁言了一次……算了不说了',
        ],
        manipulator: [
            '大家最近要多刷SC哦，这样主播才有动力~',
            '我觉得主播应该听我们的建议，我们是为她好',
            '那些整天吐槽的人真烦，应该全禁言',
            '我已经跟主播说好了，下次我来策划企划',
            '只要按我说的做，直播数据肯定涨',
            '有些人就是嘴毒心也毒，根本不配当粉丝',
        ],
        troll: [
            '你们看到B站那个帖子没？有人爆料了',
            '只是客观讨论而已，怎么就不行了？',
            '我觉得两边都有道理（笑）',
            '有一说一，隔壁主播最近做的确实不错',
        ],
        parasite: [
            '群里的事情我来管就行了，你们放心',
            '新人先看群规！不清楚的问我',
            '我代表咱们群给主播整了个应援',
            '下次线下活动我来组织，报名找我',
        ],
        observer: [
            '嗯嗯', '挺好的', '我就看看不说话',
        ],
    };

    // Messages that expose true nature (will be FILTERED by cocoon)
    const FILTERED_MSGS = {
        manipulator: [
            '其实我觉得我们可以趁这次把那几个刺头踢出群',
            '主播现在基本上听我的了，大家配合一下',
            '我在她直播间花了这么多钱，她不听我的听谁的？',
            '等我彻底控制节奏之后，你们就知道了',
        ],
        parasite: [
            '其实主播的粉丝就是我的粉丝，早晚的事',
            '我这个群已经有300人了，快赶上主播自己了',
            '用她的平台发展我自己的号，不是很正常吗',
        ],
        troll: [
            '哈哈哈又吵起来了，我就爱看这个',
            '等下我去另一个群也发一下，看看效果',
        ],
    };

    // Private messages (DMs) — scheming
    const DM_TEMPLATES = {
        manipulator: [
            { from: true, text: '主播，最近有人在背后说你坏话，需要我帮你处理吗？我有截图' },
            { from: true, text: '那个XX总是对你阴阳怪气的，建议你禁了他。我帮你盯着' },
            { from: true, text: '下次直播你做这个企划吧，我帮你准备好了所有素材~' },
            { from: true, text: '你最近是不是太累了？休息一下吧，反正有我帮你管着' },
            { from: true, text: '你知道吗，你比其他主播好太多了。所以你必须听我的，因为只有我真心为你好❤' },
        ],
        parasite: [
            { from: true, text: '主播！我帮你策划了一个粉丝见面会，在我的账号下发的通知哦' },
            { from: true, text: '群规我更新了一下，主要是加了几条关于服从管理的' },
            { from: true, text: '有几个人在群里不太配合，我先踢了再说？' },
            { from: true, text: '对了我用你的名义开了一个分群，方便管理嘛' },
        ],
        loyal: [
            { from: true, text: '那个……其实我想说很久了。你最近是不是压力很大？别硬撑着' },
            { from: true, text: '我知道我说话不好听，但有些人真的不是为你好。小心点' },
            { from: true, text: '你不用回复我，我就是想说——做你自己就好，别被别人牵着鼻子走' },
        ],
        troll: [
            { from: true, text: '嘿嘿就是我引的战，不过这次效果不太好，观众太理智了' },
        ],
    };

    function generateGroupChat() {
        G.groupChat = [];
        const active = G.fans.filter(f => f.isActive);
        // Generate 15-25 messages per stream
        const count = rand(15, 25);
        const mods = active.filter(f => f.isMod);
        const hasCocoonMod = mods.some(f => f.type === 'manipulator' || f.type === 'parasite');

        for (let i = 0; i < count; i++) {
            const fan = pick(active);
            const msgs = GROUP_MSGS[fan.type];
            if (!msgs || msgs.length === 0) continue;
            G.groupChat.push({
                sender: fan.name,
                avatar: fan.avatar,
                text: pick(msgs),
                type: fan.type,
                filtered: false,
            });
        }

        // Inject filtered messages (things that WOULD expose the truth)
        if (hasCocoonMod) {
            active.forEach(f => {
                if (FILTERED_MSGS[f.type] && Math.random() < 0.6) {
                    const idx = rand(3, G.groupChat.length - 1);
                    G.groupChat.splice(idx, 0, {
                        sender: f.name,
                        avatar: f.avatar,
                        text: pick(FILTERED_MSGS[f.type]),
                        type: f.type,
                        filtered: true, // HIDDEN from player
                    });
                    G.cocoonFilteredCount++;
                }
            });

            // Cocoon: silently kick loyal fans from group
            const loyalInGroup = active.filter(f => f.type === 'loyal');
            loyalInGroup.forEach(l => {
                if (Math.random() < 0.25 && G.stream > 3) {
                    G.cocoonKickedNames.push(l.name);
                    // Add a "system" message that player WON'T see
                    G.groupChat.push({
                        sender: '系统',
                        avatar: '',
                        text: l.name + ' 已被移出群聊',
                        type: 'system',
                        filtered: true,
                    });
                }
            });

            G.cocoonActive = true;
        }
    }

    function generateDMs() {
        G.privateMessages = {};
        G.fans.filter(f => f.isActive).forEach(f => {
            if (DM_TEMPLATES[f.type] && Math.random() < 0.5) {
                G.privateMessages[f.id] = {
                    fan: f,
                    messages: DM_TEMPLATES[f.type].slice(0, rand(1, 3)).map(t => ({
                        from: t.from ? f.name : '你',
                        text: t.text,
                        isFromFan: t.from,
                    })),
                    isNew: true,
                };
            }
        });
        // Update phone notification
        const dmCount = Object.keys(G.privateMessages).length;
        if (dmCount > 0) {
            G.phoneNotify = true;
            DOM.phoneBadge.style.display = 'flex';
        }
    }

    // ===== PHONE POPUP =====
    function showPhone() {
        document.querySelectorAll('.phone-overlay').forEach(e => e.remove());
        G.phoneNotify = false;
        DOM.phoneBadge.style.display = 'none';

        const overlay = document.createElement('div');
        overlay.className = 'phone-overlay';
        overlay.addEventListener('click', e => { if (e.target === overlay) overlay.remove(); });

        let html = '<div class="phone-frame">';
        html += '<div class="phone-header"><span class="phone-header-title">📱 手机</span>';
        html += '<button class="phone-close" id="pclose">✕</button></div>';
        html += '<div class="phone-tab-bar">';
        html += '<button class="phone-tab active" id="ptab-group">粉丝群</button>';
        html += '<button class="phone-tab" id="ptab-dm">私信</button>';
        html += '<button class="phone-tab" id="ptab-tieba">贴吧</button>';
        html += '</div>';
        html += '<div class="phone-body" id="phone-body"></div>';
        html += '</div>';

        overlay.innerHTML = html;
        document.body.appendChild(overlay);

        document.getElementById('pclose').addEventListener('click', () => overlay.remove());
        document.getElementById('ptab-group').addEventListener('click', () => renderGroupChat());
        document.getElementById('ptab-dm').addEventListener('click', () => renderDMList());
        document.getElementById('ptab-tieba').addEventListener('click', () => renderTieba());

        renderGroupChat();
    }

    function renderGroupChat() {
        const body = document.getElementById('phone-body');
        if (!body) return;
        body.innerHTML = '';

        // Set active tab
        const tabs = document.querySelectorAll('.phone-tab');
        tabs.forEach(t => t.classList.remove('active'));
        document.getElementById('ptab-group').classList.add('active');

        // Group name
        const header = document.createElement('div');
        header.className = 'chat-msg-system';
        const modNames = G.fans.filter(f => f.isMod && f.isActive).map(f => f.name);
        header.textContent = '—— 粉丝群 (' + G.fans.filter(f => f.isActive).length + '人) ——'
            + (modNames.length > 0 ? ' 管理员: ' + modNames.join(', ') : '');
        body.appendChild(header);

        if (G.groupChat.length === 0) {
            const empty = document.createElement('div');
            empty.className = 'chat-msg-system';
            empty.textContent = '开始直播后群里会活跃起来';
            body.appendChild(empty);
            return;
        }

        G.groupChat.forEach(msg => {
            if (msg.filtered) return; // INFO COCOON: player NEVER sees filtered messages
            const el = document.createElement('div');
            if (msg.type === 'system') {
                el.className = 'chat-msg chat-msg-system';
                el.textContent = msg.text;
            } else {
                el.className = 'chat-msg chat-msg-left';
                el.innerHTML = '<div class="chat-sender">' + msg.avatar + ' ' + msg.sender + '</div>' + msg.text;
            }
            body.appendChild(el);
        });

        // Cocoon notice (very subtle — player won't know)
        if (G.cocoonActive && G.cocoonFilteredCount > 0) {
            // We DON'T show any notice — that's the point
            // The player sees a "normal" group chat
        }

        body.scrollTop = body.scrollHeight;
    }

    function renderDMList() {
        const body = document.getElementById('phone-body');
        if (!body) return;
        body.innerHTML = '';

        const tabs = document.querySelectorAll('.phone-tab');
        tabs.forEach(t => t.classList.remove('active'));
        document.getElementById('ptab-dm').classList.add('active');

        const keys = Object.keys(G.privateMessages);
        if (keys.length === 0) {
            const empty = document.createElement('div');
            empty.className = 'chat-msg-system';
            empty.textContent = '暂无私信';
            body.appendChild(empty);
            return;
        }

        keys.forEach(key => {
            const dm = G.privateMessages[key];
            const item = document.createElement('div');
            item.className = 'dm-item';
            const lastMsg = dm.messages[dm.messages.length - 1];
            item.innerHTML = '<div class="dm-avatar">' + dm.fan.avatar + '</div>'
                + '<div class="dm-info"><div class="dm-name">' + dm.fan.name + '</div>'
                + '<div class="dm-preview">' + lastMsg.text.substring(0, 30) + '...</div></div>'
                + (dm.isNew ? '<div class="dm-badge-new"></div>' : '');
            item.addEventListener('click', () => renderDMDetail(key));
            body.appendChild(item);
        });
    }

    function renderDMDetail(key) {
        const body = document.getElementById('phone-body');
        if (!body) return;
        const dm = G.privateMessages[key];
        dm.isNew = false;
        body.innerHTML = '';

        const header = document.createElement('div');
        header.className = 'dm-detail-header';
        header.innerHTML = '<button class="dm-back" id="dm-back-btn">&lt;</button>'
            + '<div class="dm-detail-name">' + dm.fan.avatar + ' ' + dm.fan.name + '</div>';
        body.appendChild(header);

        dm.messages.forEach(msg => {
            const el = document.createElement('div');
            el.className = 'chat-msg ' + (msg.isFromFan ? 'chat-msg-left' : 'chat-msg-right');
            if (msg.isFromFan) {
                el.innerHTML = '<div class="chat-sender">' + msg.from + '</div>' + msg.text;
            } else {
                el.textContent = msg.text;
            }
            body.appendChild(el);
        });

        document.getElementById('dm-back-btn').addEventListener('click', () => renderDMList());
        body.scrollTop = body.scrollHeight;
    }

    // ===== NEW CONSPIRACY EVENTS =====
    function buildConspiracyEvents(loyal, manip, trolls, paras, observers) {
        const events = [];

        // 10. Secret alliance
        if (manip.length > 0 && paras.length > 0) {
            const m = pick(manip), p = pick(paras);
            events.push({
                icon: '🤝', title: '暗中联盟',
                desc: '你隐约感觉弹幕中有两个人在"配合"——一个人提出话题，另一个人立刻附和。他们没有明说，但节奏太默契了。',
                choices: [
                    {
                        text: '🔍 公开点名质疑', effect: () => {
                            m.loyalty -= 15; p.loyalty -= 15;
                            m.influence -= 10; p.influence -= 10;
                            G.communityHealth += 5;
                            addLog('🔍 质疑了弹幕中的默契配合。');
                            return '你点名问了一下。两个人都说"想多了"。但弹幕安静了一会儿。';
                        }
                    },
                    {
                        text: '📝 暗中记下来继续观察', effect: () => {
                            addLog('📝 暗中观察了可疑配合。');
                            return '你没有声张，但在心里记下了这两个名字。也许只是巧合？';
                        }
                    },
                    {
                        text: '🤷 可能是巧合吧', effect: () => {
                            m.influence += 8; p.influence += 8;
                            addLog('🤷 忽视了可疑的弹幕配合。');
                            return '你没有在意。两人继续保持着那种微妙的默契。';
                        }
                    },
                ],
            });
        }

        // 11. Doxxing threat
        if (trolls.length > 0) {
            const t = pick(trolls);
            events.push({
                icon: '🚨', title: '威胁信息',
                desc: '有人在弹幕中暗示"知道你的一些私事"。不确定是开玩笑还是真的有人在威胁你。',
                choices: [
                    {
                        text: '🛡️ 立即禁言并截图取证', effect: () => {
                            t.isActive = false;
                            G.communityHealth += 3;
                            addLog('🛡️ 紧急处理了威胁信息。');
                            return '你迅速禁言了那个人并保存了证据。弹幕里有人说"别怕有我们在"。';
                        }
                    },
                    {
                        text: '😰 不知道该怎么办，先忽略', effect: () => {
                            G.communityHealth -= 10;
                            t.influence += 15;
                            addLog('😰 面对威胁犹豫不决。');
                            return '你不知所措。后续直播你总觉得有一双眼睛在盯着。';
                        }
                    },
                ],
            });
        }

        // 12. Mass unfollow / 协调退关
        if (manip.length > 0) {
            const m = pick(manip);
            events.push({
                icon: '📉', title: '协调退关',
                desc: '你的关注数突然下跌了一波。同时 ' + m.name + ' 私信你说："看到了吧，没有我你hold不住的。要不要重新考虑下我的建议？"',
                choices: [
                    {
                        text: '💪 不屈服，坚持自己', effect: () => {
                            m.loyalty -= 25;
                            m.influence -= 10;
                            loyal.forEach(l => { l.loyalty += 10; });
                            G.momentum -= 10;
                            addLog('💪 拒绝了要挟。关注数继续下降。');
                            return '你顶住了压力。关注数确实跌了，但弹幕里有几条安静的"支持你"。';
                        }
                    },
                    {
                        text: '😞 妥协，答应他的条件', effect: () => {
                            m.influence += 30;
                            G.momentum += 5;
                            loyal.forEach(l => { l.loyalty -= 15; });
                            G.communityHealth -= 15;
                            addLog('😞 向要挟妥协了。');
                            return '你答应了。关注数很快回升——但你知道，这不是你的观众。是他的。';
                        }
                    },
                ],
            });
        }

        // 13. False flag
        if (manip.length > 0 && loyal.length > 0) {
            const m = pick(manip), l = pick(loyal);
            events.push({
                icon: '🎪', title: '栽赃嫁祸',
                desc: m.name + ' 私下告诉你：" ' + l.name + ' 在粉丝群里说你坏话，我截图了。" 你打开截图一看，确实有骂你的话。（但你不知道截图可以P）',
                choices: [
                    {
                        text: '😡 立刻禁言被告发的人', effect: () => {
                            l.loyalty -= 30; l.banCount++;
                            m.influence += 15;
                            if (l.loyalty < 10) l.isActive = false;
                            addLog('😡 根据举报禁言了 ' + l.name + '。');
                            return '你禁言了' + l.name + '。' + m.name + '说"我就知道你是明事理的"。弹幕变得很安静。';
                        }
                    },
                    {
                        text: '🤔 先别急，再核实一下', effect: () => {
                            m.loyalty -= 5;
                            addLog('🤔 对举报持保留态度。');
                            return '你表示要核实。' + m.name + '不太满意地说"算了你自己看着办吧"。那个截图你越看越觉得……字体好像有点不对。';
                        }
                    },
                    {
                        text: '❓ 找被告发的人对质', effect: () => {
                            m.influence -= 5;
                            l.loyalty += 5;
                            addLog('❓ 约了双方对质。');
                            return '你找' + l.name + '问了。他说"从来没说过这种话"。真相是什么？你不确定。';
                        }
                    },
                ],
            });
        }

        // 14. Gift-wrapped trap
        if (manip.length > 0) {
            const m = pick(manip);
            events.push({
                icon: '🎁', title: '糖衣炮弹',
                desc: m.name + ' 提议："我出钱给你做一套新的直播设备吧！条件是以后直播间右下角挂上我的名字做鸣谢。" SC附了一段长长的甜言蜜语。',
                choices: [
                    {
                        text: '🎉 接受！这人太好了', effect: () => {
                            m.influence += 25;
                            G.totalIncome += rand(500, 1000);
                            loyal.forEach(l => { l.loyalty -= 12; });
                            G.communityHealth -= 8;
                            addLog('🎉 接受了粉丝的设备赞助。');
                            return '你感动地接受了。弹幕一片"好哥哥/好姐姐"。但有人默默退出了直播间。';
                        }
                    },
                    {
                        text: '🙅 感谢但婉拒', effect: () => {
                            m.loyalty -= 20;
                            loyal.forEach(l => { l.loyalty += 5; });
                            addLog('🙅 婉拒了设备赞助。');
                            return '你感谢但拒绝了。那个人说"好吧"。语气冷了不少。';
                        }
                    },
                ],
            });
        }

        return events;
    }

    // ===== TIEBA SYSTEM =====
    const TIEBA_NORMAL = [
        { title: '今天直播怎么样？', content: '感觉还行吧，中规中矩', replies: ['确实', '一般般', '我觉得不错'] },
        { title: '新人问一下这个主播怎么样', content: '路人想了解一下', replies: ['还行吧', '可以看看', '挺有趣的'] },
        { title: '有没有人觉得最近内容变了', content: '和之前的风格不太一样了', replies: ['是你变了', '确实有点', '无所谓看着开心就行'] },
        { title: '整理了一下主播语录', content: '这些金句太好笑了', replies: ['哈哈哈前排', '收藏了', '经典'] },
        { title: '主播什么时候出周边', content: '想买！', replies: ['同问', '+1', '还没出吗'] },
    ];
    const TIEBA_CRISIS = [
        { title: '【爆料】关于主播的一些事情', content: '不知真假，大家自己判断。（以下内容来源不明）', lezi: ['前排吃瓜🍉', '搬好小板凳', '乐', '这瓜好大', '哈哈哈终于爆了', '坐等本人回应'] },
        { title: '有人发现主播和XX主播的关系了吗', content: '看了几个直播切片，感觉有点不对劲', lezi: ['嗑到了嗑到了', '别瞎说啊', '塌房了？', '好刺激！', '吃瓜吃瓜', '我就说吧'] },
        { title: '刚才直播间发生了什么？', content: '有人看到那条弹幕吗？主播表情变了', lezi: ['乐子来了', '事情越来越有趣了', '打起来打起来', '精彩精彩', '这比电视剧好看'] },
        { title: '粉丝群内部撕逼了', content: '据说管理员在搞事情，有人被踢了', lezi: ['大的来了！', '精彩绝伦', '乐死我了', '还有这种操作', '群主呢出来!', '看戏看戏🍿'] },
        { title: '主播疑似被大粉PUA', content: '每次那个粉丝说什么主播就做什么，正常吗？', lezi: ['这不就是操控吗', '细思极恐', '可怕', '主播快醒醒', '乐', '都被拿捏了'] },
    ];
    const CRISIS_DANMAKU = [
        '贴吧怎么回事有人看了吗', '哈哈哈哈哈哈贴吧爆了',
        '主播你看到贴吧了吗', '大家去贴吧看看',
        '🍉🍉🍉', '乐', '哈哈哈', '吃瓜前排',
        '主播你怎么看这个事', '快去贴吧',
        '事情闹大了', '笑死我了', '精彩',
        '有人能解释一下吗', '这下好玩了',
    ];

    function generateTieba() {
        G.tiebaPosts = [];
        // Normal posts
        const normalCount = rand(3, 5);
        for (let i = 0; i < normalCount; i++) {
            const p = pick(TIEBA_NORMAL);
            G.tiebaPosts.push({ ...p, crisis: false });
        }
        // Crisis chance increases with streams
        const crisisChance = Math.min(0.7, 0.15 + G.stream * 0.04);
        if (Math.random() < crisisChance) {
            const crisis = pick(TIEBA_CRISIS);
            G.tiebaPosts.splice(rand(0, 2), 0, { ...crisis, crisis: true, replies: crisis.lezi });
            G.crisisActive = true;
            G.crisisTopic = crisis.title;
            // Phone notification
            G.phoneNotify = true;
            DOM.phoneBadge.style.display = 'flex';
        } else {
            G.crisisActive = false;
            G.crisisTopic = '';
        }
    }

    // Crisis danmaku surge
    let crisisDanmakuTimer = null;
    function startCrisisDanmaku() {
        if (!G.crisisActive) return;
        stopCrisisDanmaku();
        crisisDanmakuTimer = setInterval(() => {
            spawnDanmaku('路人', pick(CRISIS_DANMAKU), false);
            if (Math.random() < 0.3) spawnDanmaku('乐子人', pick(CRISIS_DANMAKU), false);
        }, rand(500, 1200));
        // Also boost viewer count
        G.viewers += rand(20, 50);
    }
    function stopCrisisDanmaku() {
        if (crisisDanmakuTimer) { clearInterval(crisisDanmakuTimer); crisisDanmakuTimer = null; }
    }

    function renderTieba() {
        const body = document.getElementById('phone-body');
        if (!body) return;
        body.innerHTML = '';

        const tabs = document.querySelectorAll('.phone-tab');
        tabs.forEach(t => t.classList.remove('active'));
        document.getElementById('ptab-tieba').classList.add('active');

        const header = document.createElement('div');
        header.className = 'chat-msg-system';
        header.textContent = '—— 主播贴吧 · 最新帖子 ——';
        body.appendChild(header);

        if (G.tiebaPosts.length === 0) {
            const empty = document.createElement('div');
            empty.className = 'chat-msg-system';
            empty.textContent = '开始直播后贴吧会出现新帖子';
            body.appendChild(empty);
            return;
        }

        G.tiebaPosts.forEach(post => {
            const el = document.createElement('div');
            el.className = 'tieba-post' + (post.crisis ? ' tieba-post-crisis' : '');
            let h = '<div class="tieba-post-title">' + post.title + '</div>';
            h += '<div class="tieba-post-meta"><span>匿名用户</span><span>' + rand(1, 50) + '分钟前</span><span>' + rand(5, 200) + '回复</span></div>';
            h += '<div class="tieba-post-content">' + post.content + '</div>';
            if (post.replies) {
                post.replies.forEach(r => {
                    h += '<div class="tieba-reply' + (post.crisis ? ' tieba-reply-lezi' : '') + '">' + r + '</div>';
                });
            }
            el.innerHTML = h;
            body.appendChild(el);
        });
    }

    // ===== NO-MOD BLUR =====
    function updateModBlur() {
        const hasMod = G.fans && G.fans.some(f => f.isMod && f.isActive);
        if (hasMod) {
            DOM.danmakuArea.classList.remove('no-mod');
        } else {
            DOM.danmakuArea.classList.add('no-mod');
        }
    }

    // ===== MOD APPOINTMENT POPUP =====
    const MOD_PITCHES = {
        loyal: '我……我不太会管，但我会尽力的。',
        manipulator: '交给我吧！我帮你把那些捣乱的人全禁了❤',
        observer: '我可以帮忙看着，不太会说话就是。',
        troll: '我对社区生态很了解，让我来管理一定很精彩！',
        parasite: '我经验丰富！已经帮好几个主播管过了，放心！',
    };

    function showModAppointment() {
        document.querySelectorAll('.mod-select-overlay').forEach(e => e.remove());

        const candidates = G.fans.filter(f => f.isActive && !f.isMod);
        if (candidates.length === 0) {
            addLog('没有可以任命的候选人。');
            return;
        }

        const overlay = document.createElement('div');
        overlay.className = 'mod-select-overlay';
        overlay.addEventListener('click', e => { if (e.target === overlay) overlay.remove(); });

        let html = '<div class="mod-select-panel">';
        html += '<div class="mod-select-title">👑 任命房管</div>';
        html += '<div style="font-size:.7rem;color:var(--ink-light);text-align:center;margin-bottom:10px;">选择一位粉丝作为你的房管。房管可以帮你管理弹幕——但你确定能看清他们的真面目吗？</div>';

        // Show top 5 candidates sorted by surface level
        const top = candidates.sort((a, b) => b.surfaceLevel - a.surfaceLevel).slice(0, 6);
        top.forEach(f => {
            const bi = BIAS_IMPRESSIONS[f.perceivedType];
            html += '<div class="mod-candidate" data-fan-id="' + f.id + '">';
            html += '<div class="mod-candidate-avatar">' + f.avatar + '</div>';
            html += '<div class="mod-candidate-info">';
            html += '<div class="mod-candidate-name">' + f.name + ' <span style="font-weight:400;color:' + bi.color + ';">[' + bi.label + ']</span></div>';
            html += '<div class="mod-candidate-pitch">"' + MOD_PITCHES[f.type] + '"</div>';
            html += '</div></div>';
        });

        html += '<button class="mod-skip" id="mod-skip-btn">暂时不任命（弹幕将保持模糊）</button>';
        html += '</div>';

        overlay.innerHTML = html;
        document.body.appendChild(overlay);

        // Click handlers
        overlay.querySelectorAll('.mod-candidate').forEach(el => {
            el.addEventListener('click', () => {
                const fid = parseInt(el.getAttribute('data-fan-id'));
                const fan = G.fans.find(f => f.id === fid);
                if (fan) {
                    fan.isMod = true;
                    fan.influence += 25;
                    if (fan.type === 'manipulator') {
                        G.fans.filter(f => f.type === 'loyal').forEach(l => { l.loyalty -= 8; });
                        G.communityHealth -= 10;
                    }
                    if (fan.type === 'parasite') {
                        G.fans.filter(f => f.type === 'observer').forEach(o => { if (Math.random() < 0.3) o.isActive = false; });
                    }
                    addLog('👑 任命 ' + fan.name + ' 为房管。');
                    updateModBlur();
                    updateUI();
                }
                overlay.remove();
            });
        });

        document.getElementById('mod-skip-btn').addEventListener('click', () => {
            addLog('⚠ 没有任命房管。弹幕将保持模糊。');
            overlay.remove();
        });
    }

    // ===== BUTTON EVENTS =====
    DOM.btnStart.addEventListener('click', () => {
        // Check if no mod before first stream
        const hasMod = G.fans.some(f => f.isMod);
        if (!hasMod && G.stream === 0) {
            showModAppointment();
            // After appointment, start stream via callback
            const checkAndStart = setInterval(() => {
                if (!document.querySelector('.mod-select-overlay')) {
                    clearInterval(checkAndStart);
                    updateModBlur();
                    startStream();
                }
            }, 200);
            return;
        }
        startStream();
    });
    DOM.btnNext.addEventListener('click', showNextEvent);
    DOM.btnEnd.addEventListener('click', endStream);
    DOM.btnNew.addEventListener('click', newGame);
    DOM.btnPhone.addEventListener('click', showPhone);
    DOM.btnMod.addEventListener('click', showModAppointment);

    // ===== INIT =====
    newGame();
});
