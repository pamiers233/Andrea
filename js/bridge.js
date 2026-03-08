/**
 * 桥牌 — Bridge (全中文版)
 * 达芬奇素描风格，可玩，随机发牌
 * AI教学对局模式：两个AI自动打牌并解释出牌逻辑
 */

document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        const e = document.getElementById('entrance-overlay');
        if (e) e.style.display = 'none';
        animateQuill();
    }, 9000);

    const btnDeal = document.getElementById('btn-deal');
    const btnAiDemo = document.getElementById('btn-ai-demo');
    const handEls = {
        'S': document.getElementById('hand-s'),
        'W': document.getElementById('hand-w'),
        'N': document.getElementById('hand-n'),
        'E': document.getElementById('hand-e')
    };
    const trickArea = document.getElementById('trick-area');
    const scoreNS = document.getElementById('score-ns');
    const scoreEW = document.getElementById('score-ew');
    const aiReasonBox = document.getElementById('ai-reason-box');
    const aiReasonText = document.getElementById('ai-reason-text');

    const panel = document.getElementById('feature-panel');
    const btnClosePanel = document.getElementById('closePanel');
    const fpTitle = document.getElementById('fp-title');
    const fpDesc = document.getElementById('fp-desc');
    const fpDemo = document.getElementById('fp-demo');
    const fpDetails = document.getElementById('fp-details');

    const INK = '#3a2a1a';
    const SANGUINE = '#8c3a3a';
    const GOLD = '#daa520';
    const SUITS = ['S', 'H', 'D', 'C'];
    const SUIT_COLORS = { 'S': INK, 'H': SANGUINE, 'D': SANGUINE, 'C': INK };
    const SUIT_SYMBOLS = { 'S': '♠', 'H': '♥', 'D': '♦', 'C': '♣' };
    const SUIT_NAMES = { 'S': '黑桃', 'H': '红心', 'D': '方块', 'C': '梅花' };
    const RANKS = [14, 13, 12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2];
    const RANK_LABELS = { 14: 'A', 13: 'K', 12: 'Q', 11: 'J', 10: '10', 9: '9', 8: '8', 7: '7', 6: '6', 5: '5', 4: '4', 3: '3', 2: '2' };
    const PLAYER_NAMES = { 'S': '南家', 'W': '西家', 'N': '北家', 'E': '东家' };

    let gameState = {
        hands: { 'S': [], 'W': [], 'N': [], 'E': [] },
        tricksNS: 0, tricksEW: 0,
        currentTrick: [],
        turn: 'S',
        leadSuit: null,
        isPlaying: false,
        isAiDemo: false,
        trickCount: 0
    };
    const ORDER = ['S', 'W', 'N', 'E'];

    // =====================================
    // 核心逻辑
    // =====================================
    function getDeck() {
        let deck = [];
        SUITS.forEach(s => RANKS.forEach(r => deck.push({ suit: s, rank: r, id: s + r })));
        return deck;
    }

    function shuffle(arr) {
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        return arr;
    }

    function dealNewGame(isAiDemo = false) {
        const deck = shuffle(getDeck());
        gameState.hands = { 'S': [], 'W': [], 'N': [], 'E': [] };
        for (let i = 0; i < 52; i++) gameState.hands[ORDER[i % 4]].push(deck[i]);

        const suitOrder = { 'S': 4, 'H': 3, 'D': 2, 'C': 1 };
        Object.keys(gameState.hands).forEach(p => {
            gameState.hands[p].sort((a, b) => {
                if (suitOrder[a.suit] !== suitOrder[b.suit]) return suitOrder[b.suit] - suitOrder[a.suit];
                return b.rank - a.rank;
            });
        });

        gameState.tricksNS = 0; gameState.tricksEW = 0;
        gameState.currentTrick = []; gameState.turn = 'S';
        gameState.leadSuit = null; gameState.isPlaying = true;
        gameState.isAiDemo = isAiDemo; gameState.trickCount = 0;

        updateScore();
        trickArea.innerHTML = '';

        if (isAiDemo) {
            aiReasonBox.style.display = '';
            aiReasonBox.classList.add('ai-demo-active');
            aiReasonText.innerHTML = '🤖 <span class="reason-highlight">AI教学对局已开始！</span><br>所有四家均由AI自动出牌，每一步都会解释出牌理由。';
            renderAllHands(true); // All face up in demo
            setTimeout(() => aiAutoPlay(), 1500);
        } else {
            aiReasonBox.style.display = 'none';
            aiReasonBox.classList.remove('ai-demo-active');
            renderAllHands(false);
            checkTurn();
        }
    }

    // =====================================
    // 渲染
    // =====================================
    function getCardHTML(card, isFaceUp = true, isPlayable = true) {
        if (!isFaceUp) return `<div class="card card-back"></div>`;
        const color = SUIT_COLORS[card.suit];
        const sym = SUIT_SYMBOLS[card.suit];
        const lbl = RANK_LABELS[card.rank];
        const cls = isPlayable ? '' : 'unplayable';
        return `
            <div class="card ${cls}" data-id="${card.id}" data-suit="${card.suit}" data-rank="${card.rank}">
                <svg class="card-svg" viewBox="0 0 50 75">
                    <rect x="0" y="0" width="50" height="75" fill="none" stroke="${INK}" stroke-width="0.5" stroke-dasharray="2 1"/>
                    <text x="5" y="15" fill="${color}" class="card-val">${lbl}</text>
                    <text x="5" y="25" fill="${color}" class="card-suit-sm">${sym}</text>
                    <text x="45" y="70" fill="${color}" class="card-val" transform="rotate(180 45 70)">${lbl}</text>
                    <text x="45" y="60" fill="${color}" class="card-suit-sm" transform="rotate(180 45 60)">${sym}</text>
                    <text x="25" y="45" text-anchor="middle" font-size="24" fill="${color}">${sym}</text>
                </svg>
            </div>`;
    }

    function cardName(card) {
        return SUIT_NAMES[card.suit] + RANK_LABELS[card.rank];
    }

    function renderHand(player, allFaceUp) {
        const el = handEls[player];
        el.innerHTML = '';
        const isFaceUp = allFaceUp || player === 'S' || player === 'N';
        const cards = gameState.hands[player];
        cards.forEach((c, idx) => {
            const isPlayable = checkPlayable(player, c);
            const domTemplate = document.createElement('div');
            domTemplate.innerHTML = getCardHTML(c, isFaceUp, isPlayable);
            const cardEl = domTemplate.firstElementChild;
            if (!gameState.isAiDemo && isFaceUp && gameState.turn === player && gameState.isPlaying && isPlayable) {
                cardEl.addEventListener('click', () => userPlayCard(player, idx));
            }
            el.appendChild(cardEl);
        });
    }

    function renderAllHands(allFaceUp = false) {
        Object.keys(gameState.hands).forEach(p => renderHand(p, allFaceUp));
    }

    function updateScore() {
        scoreNS.textContent = gameState.tricksNS;
        scoreEW.textContent = gameState.tricksEW;
    }

    // =====================================
    // 出牌规则
    // =====================================
    function checkPlayable(player, card) {
        if (!gameState.isPlaying || gameState.turn !== player) return false;
        if (!gameState.leadSuit) return true;
        if (card.suit === gameState.leadSuit) return true;
        const hasLead = gameState.hands[player].some(c => c.suit === gameState.leadSuit);
        if (!hasLead) return true;
        return false;
    }

    function playCard(player, cardIndex, reason) {
        if (!gameState.isPlaying) return;
        const card = gameState.hands[player].splice(cardIndex, 1)[0];
        if (gameState.currentTrick.length === 0) gameState.leadSuit = card.suit;
        gameState.currentTrick.push({ player, card });

        // 显示AI分析理由
        if (reason && gameState.isAiDemo) {
            aiReasonText.innerHTML = `<span class="reason-highlight">${PLAYER_NAMES[player]}</span> 出了 <span class="reason-highlight">${cardName(card)}</span><br>${reason}`;
        }

        // 动画：牌飞向中心
        const cardEl = document.createElement('div');
        cardEl.className = 'played-card';
        cardEl.innerHTML = getCardHTML(card, true, false);
        if (player === 'S') { cardEl.style.bottom = '10px'; cardEl.style.left = '50%'; cardEl.style.transform = 'translateX(-50%)'; }
        if (player === 'N') { cardEl.style.top = '10px'; cardEl.style.left = '50%'; cardEl.style.transform = 'translateX(-50%)'; }
        if (player === 'W') { cardEl.style.left = '10px'; cardEl.style.top = '50%'; cardEl.style.transform = 'translateY(-50%) rotate(90deg)'; }
        if (player === 'E') { cardEl.style.right = '10px'; cardEl.style.top = '50%'; cardEl.style.transform = 'translateY(-50%) rotate(-90deg)'; }
        trickArea.appendChild(cardEl);

        renderAllHands(gameState.isAiDemo);

        if (gameState.currentTrick.length === 4) {
            resolveTrick();
        } else {
            const currIdx = ORDER.indexOf(player);
            gameState.turn = ORDER[(currIdx + 1) % 4];
            if (gameState.isAiDemo) {
                setTimeout(() => aiAutoPlay(), 2000);
            } else {
                checkTurn();
            }
        }
    }

    function userPlayCard(player, idx) {
        playCard(player, idx, null);
    }

    function checkTurn() {
        if (!gameState.isPlaying) return;
        renderAllHands(gameState.isAiDemo);
        if (gameState.turn === 'W' || gameState.turn === 'E') {
            setTimeout(() => botPlay(), 800);
        }
    }

    // =====================================
    // AI决策 + 出牌理由
    // =====================================
    function getValidIndices(player) {
        const hand = gameState.hands[player];
        const valid = [];
        for (let i = 0; i < hand.length; i++) {
            if (checkPlayable(player, hand[i])) valid.push(i);
        }
        return valid;
    }

    function aiDecide(player) {
        const hand = gameState.hands[player];
        const validIdx = getValidIndices(player);
        if (validIdx.length === 0) return { idx: 0, reason: '没有可出的牌了' };

        const validCards = validIdx.map(i => ({ card: hand[i], idx: i }));
        const isLeading = gameState.currentTrick.length === 0;
        const isLast = gameState.currentTrick.length === 3;
        const leadSuit = gameState.leadSuit;
        const isTeamNS = (player === 'N' || player === 'S');

        // ---- 首攻策略 ----
        if (isLeading) {
            // 优先出最长花色中的大牌
            const suitCounts = {};
            validCards.forEach(vc => { suitCounts[vc.card.suit] = (suitCounts[vc.card.suit] || 0) + 1; });
            let longestSuit = null, maxLen = 0;
            Object.keys(suitCounts).forEach(s => { if (suitCounts[s] > maxLen) { maxLen = suitCounts[s]; longestSuit = s; } });

            const longestCards = validCards.filter(vc => vc.card.suit === longestSuit).sort((a, b) => b.card.rank - a.card.rank);

            // 如果有 A/K，先出大牌建立赢墩
            if (longestCards[0].card.rank >= 13) {
                return { idx: longestCards[0].idx, reason: `📊 首攻策略：${SUIT_NAMES[longestSuit]}是我最长花色(${maxLen}张)，先出最大牌 ${cardName(longestCards[0].card)} 来建立赢墩优势。` };
            }
            // 否则出第四大牌(经典桥牌策略)
            if (longestCards.length >= 4) {
                return { idx: longestCards[3].idx, reason: `📊 经典策略："第四大牌首攻法" — 从最长花色${SUIT_NAMES[longestSuit]}(${maxLen}张)中出第4张 ${cardName(longestCards[3].card)}，暗示搭档这是我的长套。` };
            }
            return { idx: longestCards[longestCards.length - 1].idx, reason: `📊 首攻小牌：${SUIT_NAMES[longestSuit]}花色最长(${maxLen}张)，先出小牌 ${cardName(longestCards[longestCards.length - 1].card)} 探路。` };
        }

        // ---- 跟牌策略 ----
        const followCards = validCards.filter(vc => vc.card.suit === leadSuit);
        const currentHighest = gameState.currentTrick.reduce((max, t) => {
            if (t.card.suit === leadSuit && t.card.rank > max.rank) return t.card;
            return max;
        }, { rank: 0, suit: leadSuit });

        const partnerAlreadyPlayed = gameState.currentTrick.some(t => {
            if (isTeamNS) return (t.player === 'N' || t.player === 'S');
            return (t.player === 'E' || t.player === 'W');
        });
        let partnerCard = null;
        if (partnerAlreadyPlayed) {
            const pt = gameState.currentTrick.find(t => {
                if (isTeamNS) return (t.player === 'N' || t.player === 'S');
                return (t.player === 'E' || t.player === 'W');
            });
            partnerCard = pt ? pt.card : null;
        }

        if (followCards.length > 0) {
            // 可以跟牌
            const canWin = followCards.filter(vc => vc.card.rank > currentHighest.rank);

            if (isLast) {
                // ---- 最后一个出牌：能赢就用最小赢牌，不能赢就出最小牌 ----
                if (canWin.length > 0) {
                    const smallestWin = canWin.sort((a, b) => a.card.rank - b.card.rank)[0];
                    return { idx: smallestWin.idx, reason: `🧠 最后出牌：当前桌面最大是${cardName(currentHighest)}，我用最小的能赢的牌 ${cardName(smallestWin.card)} 精准赢墩，不浪费大牌！` };
                } else {
                    const smallest = followCards.sort((a, b) => a.card.rank - b.card.rank)[0];
                    return { idx: smallest.idx, reason: `😔 最后出牌：已经无法赢过${cardName(currentHighest)}，出最小的 ${cardName(smallest.card)} 减少损失。` };
                }
            }

            if (partnerCard && partnerCard.suit === leadSuit && partnerCard.rank > currentHighest.rank) {
                // 搭档已经领先
                const smallest = followCards.sort((a, b) => a.card.rank - b.card.rank)[0];
                return { idx: smallest.idx, reason: `🤝 搭档的 ${cardName(partnerCard)} 已经领先！我配合出小牌 ${cardName(smallest.card)}，不浪费大牌，让搭档赢。` };
            }

            if (canWin.length > 0) {
                const smallestWin = canWin.sort((a, b) => a.card.rank - b.card.rank)[0];
                return { idx: smallestWin.idx, reason: `⚔️ 争夺赢墩：当前最大是${cardName(currentHighest)}，出 ${cardName(smallestWin.card)} 抢赢。能赢就赢，但只用刚好能赢的牌！` };
            } else {
                const smallest = followCards.sort((a, b) => a.card.rank - b.card.rank)[0];
                return { idx: smallest.idx, reason: `📉 无法赢过${cardName(currentHighest)}，出最小牌 ${cardName(smallest.card)} 保留实力。` };
            }
        } else {
            // ---- 无法跟牌(缺门)：垫最小牌 ----
            const smallest = validCards.sort((a, b) => a.card.rank - b.card.rank)[0];
            return { idx: smallest.idx, reason: `🃏 缺门！没有${SUIT_NAMES[leadSuit]}可跟，垫出最小的 ${cardName(smallest.card)}。在无将(NT)定约中缺门只能垫牌，无法赢墩。` };
        }
    }

    function botPlay() {
        const p = gameState.turn;
        const decision = aiDecide(p);
        playCard(p, decision.idx, null);
    }

    function aiAutoPlay() {
        if (!gameState.isPlaying || !gameState.isAiDemo) return;
        const p = gameState.turn;
        const decision = aiDecide(p);
        playCard(p, decision.idx, decision.reason);
    }

    // =====================================
    // 结算
    // =====================================
    function resolveTrick() {
        gameState.isPlaying = false;
        let winningEntry = gameState.currentTrick[0];
        for (let i = 1; i < 4; i++) {
            const played = gameState.currentTrick[i];
            if (played.card.suit === gameState.leadSuit && played.card.rank > winningEntry.card.rank) {
                winningEntry = played;
            }
        }

        const winner = winningEntry.player;
        const winTeam = (winner === 'S' || winner === 'N') ? '南北' : '东西';

        if (gameState.isAiDemo) {
            const trickCards = gameState.currentTrick.map(t => `${PLAYER_NAMES[t.player]}:${cardName(t.card)}`).join(' | ');
            aiReasonText.innerHTML = `🏆 <span class="reason-highlight">${PLAYER_NAMES[winner]}</span> 用 <span class="reason-highlight">${cardName(winningEntry.card)}</span> 赢得此墩！<br>本墩牌面: ${trickCards}<br>📌 规则：必须跟同花色，同花色最大的牌赢墩。${winTeam}方 +1`;
        }

        setTimeout(() => {
            if (winner === 'S' || winner === 'N') gameState.tricksNS++;
            else gameState.tricksEW++;
            updateScore();
            trickArea.innerHTML = '';
            gameState.leadSuit = null;
            gameState.currentTrick = [];
            gameState.trickCount++;

            if (gameState.hands['S'].length === 0) {
                endGame();
            } else {
                gameState.turn = winner;
                gameState.isPlaying = true;
                if (gameState.isAiDemo) {
                    setTimeout(() => aiAutoPlay(), 2000);
                } else {
                    checkTurn();
                }
            }
        }, gameState.isAiDemo ? 3000 : 1500);
    }

    function endGame() {
        const nsW = gameState.tricksNS;
        const ewW = gameState.tricksEW;
        let msg = `🏁 对局结束！\n南北方赢得 ${nsW} 墩，东西方赢得 ${ewW} 墩。\n`;
        if (nsW >= 7) msg += `✅ 南北方完成1NT定约(需要7墩)！恭喜！`;
        else msg += `❌ 南北方未完成1NT定约(需要7墩)。失败！`;

        if (gameState.isAiDemo) {
            aiReasonText.innerHTML = `🏁 <span class="reason-highlight">AI教学对局结束</span><br>南北: ${nsW}墩 | 东西: ${ewW}墩<br>${nsW >= 7 ? '✅ 南北完成定约！' : '❌ 南北未完成定约。'}<br>点击"重新发牌"或"AI教学对局"再来一局！`;
            aiReasonBox.classList.remove('ai-demo-active');
        }
        alert(msg);
    }

    // =====================================
    // 按钮事件
    // =====================================
    btnDeal.addEventListener('click', () => dealNewGame(false));
    btnAiDemo.addEventListener('click', () => dealNewGame(true));

    // =====================================
    // 教学面板(中文)
    // =====================================
    const guideData = {
        'guide-deal': {
            title: '1. 发牌与手牌',
            desc: '桥牌使用标准52张扑克牌（去掉大小王）。四位玩家各拿到13张牌。牌的大小从A（最大）到2（最小）。花色在叫牌中也有高低：黑桃 > 红心 > 方块 > 梅花。',
            demo: `<svg viewBox="0 0 200 100"><rect x="30" y="20" width="40" height="60" fill="none" stroke="${INK}" stroke-width="1.5" rx="3"/><rect x="50" y="15" width="40" height="60" fill="none" stroke="${INK}" stroke-width="1.5" rx="3"/><rect x="70" y="10" width="40" height="60" fill="${GOLD}" fill-opacity="0.2" stroke="${INK}" stroke-width="1.5" rx="3"/><text x="90" y="45" fill="${INK}" font-size="18" text-anchor="middle" font-weight="bold">13</text><text x="150" y="55" fill="${SANGUINE}" font-size="12">×4人=52张</text></svg>`,
            details: '<h3>关键概念</h3><p><b>手牌排列：</b>系统会自动帮您按花色（♠♥♦♣）分组，每组内从大到小排列。<br><b>完全随机：</b>每次发牌使用Fisher-Yates洗牌算法，保证绝对公平随机。</p>',
            highlights: ['area-n', 'area-s', 'area-e', 'area-w']
        },
        'guide-teams': {
            title: '2. 搭档与阵营',
            desc: '桥牌是一个二对二的团队游戏！南和北是搭档(南北方)，东和西是搭档(东西方)。搭档坐在桌子的对面。你们赢墩和输墩都算在一起。',
            demo: `<svg viewBox="0 0 200 100"><circle cx="100" cy="15" r="12" fill="${SANGUINE}" fill-opacity="0.3" stroke="${SANGUINE}" stroke-width="1.5"/><text x="100" y="19" text-anchor="middle" fill="${SANGUINE}" font-size="10">北</text><circle cx="100" cy="85" r="12" fill="${SANGUINE}" fill-opacity="0.3" stroke="${SANGUINE}" stroke-width="1.5"/><text x="100" y="89" text-anchor="middle" fill="${SANGUINE}" font-size="10">南</text><line x1="100" y1="27" x2="100" y2="73" stroke="${SANGUINE}" stroke-width="1.5" stroke-dasharray="4 3"/><text x="100" y="55" text-anchor="middle" fill="${INK}" font-size="9">搭档</text></svg>`,
            details: '<h3>信息不对称</h3><p>桥牌最精妙之处在于：你看不见搭档的牌！你们只能通过"叫牌"这个严格编码的系统来传递手牌信息。这就像密码战一样刺激。</p>',
            highlights: ['area-n', 'area-s']
        },
        'guide-bidding': {
            title: '3. 叫牌与定约',
            desc: '四个玩家轮流"叫牌"，竞价宣布自己队能赢多少墩，以及什么花色做将牌（或无将NT）。最高的叫价成为"定约"。本页面简化为1NT（1无将，南家庄）——意味着南北方需要至少赢7墩。',
            demo: `<svg viewBox="0 0 200 100"><rect x="50" y="20" width="100" height="60" fill="rgba(184,134,11,0.1)" stroke="${GOLD}" stroke-width="2" rx="5"/><text x="100" y="50" text-anchor="middle" fill="${INK}" font-size="22" font-weight="bold" font-family="'Cinzel'">1 NT</text><text x="100" y="70" text-anchor="middle" fill="${SANGUINE}" font-size="10">= 需赢 6+1 = 7 墩</text></svg>`,
            details: '<h3>什么是"墩"？</h3><p>每轮四个人各出一张牌，这叫一"墩"(Trick)。一共13墩。叫"1"级定约意味着在6墩基础上再赢1墩。<br><br><b>无将(NT)：</b>没有将牌花色，纯粹比大小。同花色最大的牌赢得这一墩。</p>',
            highlights: ['game-status-box']
        },
        'guide-play': {
            title: '4. 出牌与明手',
            desc: '定约方的搭档叫做"明手"(Dummy)。明手必须翻开所有牌面朝上放在桌面上。由庄家（南）同时操控自己和明手（北）的出牌。这是桥牌独特的团队策略核心！',
            demo: `<svg viewBox="0 0 200 100"><rect x="30" y="10" width="140" height="80" fill="none" stroke="${INK}" stroke-width="1" stroke-dasharray="3 2" rx="4"/><text x="100" y="35" text-anchor="middle" fill="${INK}" font-size="11" font-weight="bold">北家(明手)</text><text x="60" y="60" fill="${SANGUINE}" font-size="16">♠♥</text><text x="100" y="60" fill="${INK}" font-size="16">♣♦</text><text x="140" y="60" fill="${SANGUINE}" font-size="9">全部亮出</text><text x="100" y="85" text-anchor="middle" fill="${GOLD}" font-size="9">← 你来控制两手牌 →</text></svg>`,
            details: '<h3>为什么叫"明手"？</h3><p>在正式桥牌中，一旦首攻完成，明手就必须将所有牌面朝上摆在桌面上供所有人看到。明手本人不能自己决定出牌，而是由庄家指挥。<br><br>这意味着庄家能看到26张牌（自己13张+明手13张），从而进行精密的计划。</p>',
            highlights: ['area-n']
        },
        'guide-tricks': {
            title: '5. 赢墩规则',
            desc: '每墩由首家出任意一张牌"引牌"。其余三人必须出同花色的牌（叫"跟牌"）。如果没有这个花色才可以出其他花色（叫"垫牌"，在无将中垫牌不可能赢）。同花色中最大的牌赢墩。',
            demo: `<svg viewBox="0 0 200 120"><rect x="70" y="10" width="60" height="30" fill="none" stroke="${GOLD}" stroke-width="2" rx="3"/><text x="100" y="30" text-anchor="middle" fill="${GOLD}" font-size="14" font-weight="bold">♠A 赢!</text><rect x="10" y="50" width="40" height="25" fill="none" stroke="${INK}" rx="2"/><text x="30" y="67" text-anchor="middle" fill="${INK}" font-size="10">♠7</text><rect x="60" y="80" width="40" height="25" fill="none" stroke="${INK}" rx="2"/><text x="80" y="97" text-anchor="middle" fill="${INK}" font-size="10">♠Q</text><rect x="110" y="50" width="40" height="25" fill="none" stroke="${SANGUINE}" rx="2"/><text x="130" y="67" text-anchor="middle" fill="${SANGUINE}" font-size="10">♥K</text><text x="130" y="115" text-anchor="middle" fill="${SANGUINE}" font-size="8">↑垫牌,不能赢</text></svg>`,
            details: '<h3>核心策略提示</h3><p><b>1. 长套建立：</b>如果你某一花色有很多张，不断出这个花色可以消耗对手的同花色牌，最后你剩下的小牌就变成赢墩！<br><b>2. 计数：</b>每一花色只有13张。记住已经出过什么牌是高手的基本功。<br><b>3. 不浪费大牌：</b>如果小牌就能赢，就别用大牌。省下A和K应对关键时刻。</p>',
            highlights: ['trick-area']
        }
    };

    let activeBtn = null;

    document.querySelectorAll('.feature-btn').forEach(btn => {
        btn.addEventListener('mouseenter', () => {
            document.querySelectorAll('.highlighted').forEach(el => el.classList.remove('highlighted'));
            const target = btn.dataset.target;
            if (guideData[target]) {
                guideData[target].highlights.forEach(id => {
                    const hl = document.getElementById(id);
                    if (hl) hl.classList.add('highlighted');
                });
            }
        });
        btn.addEventListener('mouseleave', () => {
            document.querySelectorAll('.highlighted').forEach(el => el.classList.remove('highlighted'));
        });
        btn.addEventListener('click', () => {
            if (activeBtn) activeBtn.classList.remove('active');
            btn.classList.add('active'); activeBtn = btn;
            const data = guideData[btn.dataset.target];
            fpTitle.innerHTML = data.title;
            fpDesc.innerHTML = data.desc;
            fpDemo.innerHTML = data.demo;
            fpDetails.innerHTML = data.details;
            panel.classList.add('open');
        });
    });

    btnClosePanel.addEventListener('click', () => {
        panel.classList.remove('open');
        if (activeBtn) { activeBtn.classList.remove('active'); activeBtn = null; }
    });

    // =====================================
    // 羽毛笔动画
    // =====================================
    function animateQuill() {
        const lines = document.querySelectorAll('.quill-title, .quill-line');
        let delay = 0;
        lines.forEach((line) => {
            setTimeout(() => line.classList.add('writing-active'), delay);
            delay += 800;
        });
    }

    // 自动发牌
    setTimeout(() => dealNewGame(false), 9500);
});
