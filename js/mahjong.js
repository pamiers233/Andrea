/**
 * 麻将 — Mahjong (完整中文版)
 * 达芬奇素描风格，可玩，完全随机发牌
 * 中国标准麻将规则：136张牌，摸打循环，吃碰杠胡
 * AI教学对局：AI自动打牌并解释出牌逻辑
 */
document.addEventListener('DOMContentLoaded', () => {
    /* =========================================================
       ENTRANCE ANIMATION
       ========================================================= */
    setTimeout(() => {
        const e = document.getElementById('entrance-overlay');
        if (e) e.style.display = 'none';
        animateQuill();
    }, 11000);

    function animateQuill() {
        const items = document.querySelectorAll('#quill-svg .quill-title, #quill-svg .quill-line');
        items.forEach((el, i) => {
            setTimeout(() => el.classList.add('writing-active'), i * 500);
        });
    }

    /* =========================================================
       CONSTANTS & TILE DEFINITIONS
       ========================================================= */
    const WIND_NAMES = { E: '東', S: '南', W: '西', N: '北' };
    const TURN_ORDER = ['E', 'S', 'W', 'N']; // Dealer is East

    // Tile types
    // wan: 万 (characters) 1-9
    // tong: 筒 (dots) 1-9
    // tiao: 条 (bamboo) 1-9
    // feng: 風 (winds) E S W N
    // jian: 箭 (dragons) zhong fa bai
    const WAN_CHARS = ['一', '二', '三', '四', '五', '六', '七', '八', '九'];
    const TONG_CHARS = ['①', '②', '③', '④', '⑤', '⑥', '⑦', '⑧', '⑨'];
    const TIAO_CHARS = ['𝍠', '𝍡', '𝍢', '𝍣', '𝍤', '𝍥', '𝍦', '𝍧', '𝍨'];
    const FENG_CHARS = { E: '東', S: '南', W: '西', N: '北' };
    const JIAN_CHARS = { zhong: '中', fa: '發', bai: '白' };

    function makeTileDef(type, value) {
        return { type, value };
    }

    function buildFullSet() {
        const tiles = [];
        for (let v = 1; v <= 9; v++) {
            for (let c = 0; c < 4; c++) {
                tiles.push(makeTileDef('wan', v));
                tiles.push(makeTileDef('tong', v));
                tiles.push(makeTileDef('tiao', v));
            }
        }
        ['E', 'S', 'W', 'N'].forEach(w => {
            for (let c = 0; c < 4; c++) tiles.push(makeTileDef('feng', w));
        });
        ['zhong', 'fa', 'bai'].forEach(j => {
            for (let c = 0; c < 4; c++) tiles.push(makeTileDef('jian', j));
        });
        return tiles; // 136 tiles
    }

    function shuffle(arr) {
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        return arr;
    }

    function tileKey(t) { return `${t.type}_${t.value}`; }

    function tileDisplay(t) {
        if (t.type === 'wan') return WAN_CHARS[t.value - 1];
        if (t.type === 'tong') return TONG_CHARS[t.value - 1];
        if (t.type === 'tiao') return t.value + '';
        if (t.type === 'feng') return FENG_CHARS[t.value];
        if (t.type === 'jian') return JIAN_CHARS[t.value];
        return '?';
    }

    function tileSub(t) {
        if (t.type === 'wan') return '万';
        if (t.type === 'tong') return '筒';
        if (t.type === 'tiao') return '条';
        if (t.type === 'feng') return '风';
        if (t.type === 'jian') return '箭';
        return '';
    }

    function tileName(t) {
        if (t.type === 'wan') return t.value + '万';
        if (t.type === 'tong') return t.value + '筒';
        if (t.type === 'tiao') return t.value + '条';
        if (t.type === 'feng') return FENG_CHARS[t.value] + '风';
        if (t.type === 'jian') return JIAN_CHARS[t.value];
        return '?';
    }

    function tileCssClass(t) {
        if (t.type === 'wan') return 'tile-wan';
        if (t.type === 'tong') return 'tile-tong';
        if (t.type === 'tiao') return 'tile-tiao';
        if (t.type === 'feng') return 'tile-feng';
        if (t.type === 'jian') {
            if (t.value === 'fa') return 'tile-jian tile-jian-fa';
            if (t.value === 'bai') return 'tile-jian tile-jian-bai';
            return 'tile-jian';
        }
        return '';
    }

    function isNumberTile(t) { return t.type === 'wan' || t.type === 'tong' || t.type === 'tiao'; }

    function tileOrder(t) {
        const typeOrd = { wan: 0, tong: 1, tiao: 2, feng: 3, jian: 4 };
        const base = (typeOrd[t.type] || 0) * 100;
        if (isNumberTile(t)) return base + t.value;
        if (t.type === 'feng') return base + ({ E: 1, S: 2, W: 3, N: 4 }[t.value] || 0);
        if (t.type === 'jian') return base + ({ zhong: 1, fa: 2, bai: 3 }[t.value] || 0);
        return base;
    }

    function sortHand(hand) { hand.sort((a, b) => tileOrder(a) - tileOrder(b)); }

    /* =========================================================
       GAME STATE
       ========================================================= */
    const DOM = {
        handN: document.getElementById('hand-n'),
        handS: document.getElementById('hand-s'),
        handE: document.getElementById('hand-e'),
        handW: document.getElementById('hand-w'),
        meldN: document.getElementById('meld-n'),
        meldS: document.getElementById('meld-s'),
        meldE: document.getElementById('meld-e'),
        meldW: document.getElementById('meld-w'),
        discardZone: document.getElementById('discard-zone'),
        wallCount: document.getElementById('wall-count'),
        roundText: document.getElementById('round-text'),
        turnText: document.getElementById('turn-text'),
        btnDeal: document.getElementById('btn-deal'),
        btnAiDemo: document.getElementById('btn-ai-demo'),
        aiReasonBox: document.getElementById('ai-reason-box'),
        aiReasonText: document.getElementById('ai-reason-text'),
        actionButtons: document.getElementById('action-buttons'),
        panel: document.getElementById('feature-panel'),
        btnClosePanel: document.getElementById('closePanel'),
    };

    let G = {}; // game state, reset per deal

    function initGameState(isAiDemo = false) {
        const wall = shuffle(buildFullSet());
        G = {
            wall,
            hands: { E: [], S: [], W: [], N: [] },
            melds: { E: [], S: [], W: [], N: [] },
            discards: [],
            turn: 'E', // East is dealer
            phase: 'draw', // 'draw' | 'discard' | 'claim' | 'end'
            isAiDemo,
            lastDiscard: null,
            lastDiscardPlayer: null,
        };
        // Deal: East gets 14, others 13
        for (let i = 0; i < 13; i++) {
            TURN_ORDER.forEach(p => G.hands[p].push(G.wall.pop()));
        }
        G.hands['E'].push(G.wall.pop()); // Dealer gets 14th
        TURN_ORDER.forEach(p => sortHand(G.hands[p]));
    }

    /* =========================================================
       RENDERING
       ========================================================= */
    function createTileEl(tile, faceUp = true, clickHandler = null) {
        const el = document.createElement('div');
        if (!faceUp) {
            el.className = 'mj-tile mj-tile-back';
            return el;
        }
        el.className = `mj-tile ${tileCssClass(tile)}`;
        el.innerHTML = `<span class="tile-char">${tileDisplay(tile)}</span><span class="tile-sub">${tileSub(tile)}</span>`;
        el.title = tileName(tile);
        if (clickHandler) {
            el.style.cursor = 'pointer';
            el.addEventListener('click', clickHandler);
        }
        return el;
    }

    function renderHand(player, container, faceUp = false, clickable = false) {
        container.innerHTML = '';
        const hand = G.hands[player];
        hand.forEach((tile, idx) => {
            const handler = clickable ? () => playerDiscard(idx) : null;
            const el = createTileEl(tile, faceUp, handler);
            container.appendChild(el);
        });
    }

    function renderMelds(player, container) {
        container.innerHTML = '';
        G.melds[player].forEach(meld => {
            const group = document.createElement('div');
            group.className = 'meld-group';
            meld.tiles.forEach(t => {
                group.appendChild(createTileEl(t, true));
            });
            container.appendChild(group);
        });
    }

    function renderDiscards() {
        DOM.discardZone.innerHTML = '';
        G.discards.forEach(d => {
            DOM.discardZone.appendChild(createTileEl(d.tile, true));
        });
    }

    function renderAll() {
        const isPlayerTurn = G.turn === 'S' && G.phase === 'discard' && !G.isAiDemo;
        // South (player) always face-up
        renderHand('S', DOM.handS, true, isPlayerTurn);
        // Others face-down unless AI demo
        renderHand('N', DOM.handN, G.isAiDemo, false);
        renderHand('E', DOM.handE, G.isAiDemo, false);
        renderHand('W', DOM.handW, G.isAiDemo, false);
        // Melds
        renderMelds('S', DOM.meldS);
        renderMelds('N', DOM.meldN);
        renderMelds('E', DOM.meldE);
        renderMelds('W', DOM.meldW);
        // Discards
        renderDiscards();
        // UI
        DOM.wallCount.textContent = G.wall.length;
        DOM.turnText.textContent = WIND_NAMES[G.turn] || '—';
        // Highlight active player
        document.querySelectorAll('.player-area').forEach(el => el.classList.remove('turn-active'));
        const areaId = 'area-' + G.turn.toLowerCase();
        const activeArea = document.getElementById(areaId);
        if (activeArea) activeArea.classList.add('turn-active');
    }

    /* =========================================================
       DRAW & DISCARD
       ========================================================= */
    function drawTile(player) {
        if (G.wall.length === 0) {
            endGame(null);
            return null;
        }
        const tile = G.wall.pop();
        G.hands[player].push(tile);
        DOM.wallCount.textContent = G.wall.length;
        return tile;
    }

    function discardTile(player, idx, reason = '') {
        const tile = G.hands[player].splice(idx, 1)[0];
        G.discards.push({ tile, player });
        G.lastDiscard = tile;
        G.lastDiscardPlayer = player;
        if (reason && (G.isAiDemo || player !== 'S')) {
            showAiReason(player, tile, reason);
        }
        return tile;
    }

    /* =========================================================
       WIN DETECTION (Standard: 4 melds + 1 pair)
       ========================================================= */
    function canWin(hand) {
        // Count tiles
        const counts = {};
        hand.forEach(t => {
            const k = tileKey(t);
            counts[k] = (counts[k] || 0) + 1;
        });
        // Try each possible pair
        const keys = Object.keys(counts);
        for (const pk of keys) {
            if (counts[pk] < 2) continue;
            const tryC = { ...counts };
            tryC[pk] -= 2;
            if (tryC[pk] === 0) delete tryC[pk];
            if (canFormMelds(tryC)) return true;
        }
        return false;
    }

    function canFormMelds(counts) {
        const keys = Object.keys(counts).sort();
        if (keys.length === 0) return true;
        const k = keys[0];
        // Try triplet
        if (counts[k] >= 3) {
            const tryC = { ...counts };
            tryC[k] -= 3;
            if (tryC[k] === 0) delete tryC[k];
            if (canFormMelds(tryC)) return true;
        }
        // Try sequence (only for numbered tiles)
        const parts = k.split('_');
        const type = parts[0];
        const val = parseInt(parts[1]);
        if ((type === 'wan' || type === 'tong' || type === 'tiao') && !isNaN(val) && val <= 7) {
            const k2 = `${type}_${val + 1}`;
            const k3 = `${type}_${val + 2}`;
            if (counts[k2] && counts[k3]) {
                const tryC = { ...counts };
                tryC[k] -= 1; if (tryC[k] === 0) delete tryC[k];
                tryC[k2] -= 1; if (tryC[k2] === 0) delete tryC[k2];
                tryC[k3] -= 1; if (tryC[k3] === 0) delete tryC[k3];
                if (canFormMelds(tryC)) return true;
            }
        }
        return false;
    }

    /* =========================================================
       CLAIM DETECTION (Pung, Kong, Chow, Win on discard)
       ========================================================= */
    function countInHand(player, tile) {
        return G.hands[player].filter(t => tileKey(t) === tileKey(tile)).length;
    }

    function canPung(player, tile) { return countInHand(player, tile) >= 2; }
    function canKong(player, tile) { return countInHand(player, tile) >= 3; }

    function canChow(player, tile) {
        if (!isNumberTile(tile)) return false;
        // Only the next player in turn order can chow
        const nextPlayer = nextTurn(G.lastDiscardPlayer);
        if (player !== nextPlayer) return false;
        const v = tile.value;
        const type = tile.type;
        const hand = G.hands[player];
        const has = (val) => hand.some(t => t.type === type && t.value === val);
        // Check three possible sequence positions
        return (v >= 3 && has(v - 2) && has(v - 1)) ||
            (v >= 2 && v <= 8 && has(v - 1) && has(v + 1)) ||
            (v <= 7 && has(v + 1) && has(v + 2));
    }

    function canWinOnDiscard(player, tile) {
        const testHand = [...G.hands[player], tile];
        return canWin(testHand);
    }

    /* =========================================================
       GAME FLOW
       ========================================================= */
    function nextTurn(current) {
        const idx = TURN_ORDER.indexOf(current);
        return TURN_ORDER[(idx + 1) % 4];
    }

    function startGame(isAiDemo = false) {
        initGameState(isAiDemo);
        hideActions();
        DOM.aiReasonBox.style.display = 'none';
        DOM.roundText.textContent = '东风局';
        if (isAiDemo) {
            DOM.aiReasonBox.style.display = 'block';
            DOM.aiReasonBox.classList.add('ai-demo-active');
        }
        renderAll();
        // East (dealer) already has 14 tiles, so East discards first
        G.phase = 'discard';
        if (G.turn !== 'S' || isAiDemo) {
            setTimeout(() => aiTurn(), 800);
        } else {
            renderAll(); // re-render to make tiles clickable
        }
    }

    function showAiReason(player, tile, reason) {
        DOM.aiReasonBox.style.display = 'block';
        DOM.aiReasonText.innerHTML = `<b>${WIND_NAMES[player]}家</b> 打出 <span class="reason-highlight">${tileName(tile)}</span>：${reason}`;
    }

    /* =========================================================
       AI DECISION ENGINE
       ========================================================= */
    function aiDecide(player) {
        const hand = G.hands[player];
        // Check if we can win
        if (canWin(hand)) {
            return { action: 'win' };
        }

        // Evaluate each tile: lower score = safer to discard
        const scores = hand.map((tile, idx) => {
            let score = 0;
            const k = tileKey(tile);
            const count = hand.filter(t => tileKey(t) === k).length;

            // Pairs and triplets are valuable
            if (count >= 3) score += 30;
            else if (count >= 2) score += 15;

            // Connected tiles (for sequences)
            if (isNumberTile(tile)) {
                const v = tile.value;
                const hasPrev = hand.some(t => t.type === tile.type && t.value === v - 1);
                const hasNext = hand.some(t => t.type === tile.type && t.value === v + 1);
                const hasPrev2 = hand.some(t => t.type === tile.type && t.value === v - 2);
                const hasNext2 = hand.some(t => t.type === tile.type && t.value === v + 2);
                if (hasPrev && hasNext) score += 20; // Part of sequence
                else if (hasPrev || hasNext) score += 10; // Adjacent
                else if (hasPrev2 || hasNext2) score += 5; // Gap
                // Middle values slightly more useful
                if (v >= 3 && v <= 7) score += 3;
            } else {
                // Honor tiles: value for multiples only
                if (count === 1) score -= 5;
            }

            return { idx, tile, score };
        });

        // Discard lowest score
        scores.sort((a, b) => a.score - b.score);
        const choice = scores[0];

        let reason = '';
        if (choice.score <= -5) {
            reason = '孤张字牌，无法组成面子，优先丢弃。';
        } else if (choice.score <= 0) {
            reason = '孤立牌，与其他牌没有搭子关系。';
        } else if (choice.score <= 5) {
            reason = '虽有微小价值，但在手牌中作用最小。';
        } else {
            reason = '选择价值相对最低的牌打出，保留好搭子。';
        }

        return { action: 'discard', idx: choice.idx, reason };
    }

    function aiClaimDecision(player, tile) {
        // Check win first
        if (canWinOnDiscard(player, tile)) {
            return { action: 'win' };
        }
        // Pung if it forms a triplet
        if (canPung(player, tile)) {
            // Count how useful: if we have 2, it makes a triplet
            return { action: 'pung', reason: `碰！手中有两张 ${tileName(tile)}，组成刻子。` };
        }
        // Kong
        if (canKong(player, tile)) {
            return { action: 'kong', reason: `杠！手中有三张 ${tileName(tile)}，明杠！` };
        }
        // Chow (only for next player)
        if (canChow(player, tile) && Math.random() < 0.3) {
            return { action: 'chow', reason: `吃！与手中的牌组成顺子。` };
        }
        return { action: 'pass' };
    }

    /* =========================================================
       TURN EXECUTION
       ========================================================= */
    function aiTurn() {
        if (G.phase === 'end') return;

        const player = G.turn;

        if (G.phase === 'draw') {
            const tile = drawTile(player);
            if (!tile) return;
            // Check self-draw win
            if (canWin(G.hands[player])) {
                renderAll();
                setTimeout(() => endGame(player, true), 600);
                return;
            }
            G.phase = 'discard';
        }

        if (G.phase === 'discard') {
            const decision = aiDecide(player);
            if (decision.action === 'win') {
                renderAll();
                setTimeout(() => endGame(player, true), 600);
                return;
            }
            const tile = discardTile(player, decision.idx, decision.reason);
            renderAll();
            // After discard, check if anyone can claim
            G.phase = 'claim';
            setTimeout(() => processClaimsAfterDiscard(tile, player), G.isAiDemo ? 1200 : 500);
        }
    }

    function processClaimsAfterDiscard(tile, discardPlayer) {
        if (G.phase === 'end') return;

        // Check all other players for claims (priority: Win > Kong > Pung > Chow)
        const otherPlayers = TURN_ORDER.filter(p => p !== discardPlayer);

        // Check for win
        for (const p of otherPlayers) {
            if (p === 'S' && !G.isAiDemo) {
                if (canWinOnDiscard(p, tile)) {
                    showPlayerClaimOptions(tile, discardPlayer);
                    return;
                }
            } else {
                const decision = aiClaimDecision(p, tile);
                if (decision.action === 'win') {
                    claimTile(p, tile, 'win');
                    endGame(p, false);
                    return;
                }
            }
        }

        // Check for pung/kong (any player)
        for (const p of otherPlayers) {
            if (p === 'S' && !G.isAiDemo) {
                if (canPung(p, tile) || canKong(p, tile) || canChow(p, tile)) {
                    showPlayerClaimOptions(tile, discardPlayer);
                    return;
                }
            } else {
                const decision = aiClaimDecision(p, tile);
                if (decision.action === 'pung' || decision.action === 'kong') {
                    executeClaim(p, tile, decision);
                    return;
                }
            }
        }

        // Check for chow (next player only)
        const nextPlayer = nextTurn(discardPlayer);
        if (nextPlayer === 'S' && !G.isAiDemo) {
            if (canChow(nextPlayer, tile)) {
                showPlayerClaimOptions(tile, discardPlayer);
                return;
            }
        }

        // No claims — next player draws
        advanceToNextTurn(discardPlayer);
    }

    function advanceToNextTurn(fromPlayer) {
        G.turn = nextTurn(fromPlayer);
        G.phase = 'draw';
        G.lastDiscard = null;
        G.lastDiscardPlayer = null;
        renderAll();

        if (G.turn === 'S' && !G.isAiDemo) {
            // Player's turn: draw then discard
            const tile = drawTile('S');
            if (!tile) return;
            if (canWin(G.hands['S'])) {
                renderAll();
                showPlayerWinOption();
                return;
            }
            G.phase = 'discard';
            renderAll();
        } else {
            setTimeout(() => aiTurn(), G.isAiDemo ? 1000 : 400);
        }
    }

    /* =========================================================
       PLAYER INTERACTION
       ========================================================= */
    function playerDiscard(idx) {
        if (G.phase !== 'discard' || G.turn !== 'S') return;
        const tile = discardTile('S', idx);
        hideActions();
        G.phase = 'claim';
        renderAll();
        setTimeout(() => processClaimsAfterDiscard(tile, 'S'), 500);
    }

    function showPlayerClaimOptions(tile, discardPlayer) {
        const container = DOM.actionButtons;
        container.innerHTML = '';
        container.className = 'action-overlay';

        const actions = [];

        if (canWinOnDiscard('S', tile)) {
            actions.push({
                label: '胡', action: () => {
                    claimTile('S', tile, 'win');
                    hideActions();
                    endGame('S', false);
                }
            });
        }
        if (canKong('S', tile)) {
            actions.push({
                label: '杠', action: () => {
                    hideActions();
                    executeClaim('S', tile, { action: 'kong', reason: '杠！' });
                }
            });
        }
        if (canPung('S', tile)) {
            actions.push({
                label: '碰', action: () => {
                    hideActions();
                    executeClaim('S', tile, { action: 'pung', reason: '碰！' });
                }
            });
        }
        if (canChow('S', tile)) {
            actions.push({
                label: '吃', action: () => {
                    hideActions();
                    executeClaim('S', tile, { action: 'chow', reason: '吃！' });
                }
            });
        }

        actions.forEach(a => {
            const btn = document.createElement('button');
            btn.className = 'action-btn action-btn-primary';
            btn.textContent = a.label;
            btn.addEventListener('click', a.action);
            container.appendChild(btn);
        });

        // Skip button
        const skipBtn = document.createElement('button');
        skipBtn.className = 'action-btn action-btn-skip';
        skipBtn.textContent = '过';
        skipBtn.addEventListener('click', () => {
            hideActions();
            advanceToNextTurn(discardPlayer);
        });
        container.appendChild(skipBtn);
    }

    function showPlayerWinOption() {
        const container = DOM.actionButtons;
        container.innerHTML = '';
        container.className = 'action-overlay';

        const winBtn = document.createElement('button');
        winBtn.className = 'action-btn action-btn-primary';
        winBtn.textContent = '自摸胡！';
        winBtn.addEventListener('click', () => {
            hideActions();
            endGame('S', true);
        });
        container.appendChild(winBtn);

        const skipBtn = document.createElement('button');
        skipBtn.className = 'action-btn action-btn-skip';
        skipBtn.textContent = '不胡';
        skipBtn.addEventListener('click', () => {
            hideActions();
            G.phase = 'discard';
            renderAll();
        });
        container.appendChild(skipBtn);
    }

    function hideActions() {
        DOM.actionButtons.innerHTML = '';
        DOM.actionButtons.className = '';
    }

    /* =========================================================
       CLAIM EXECUTION
       ========================================================= */
    function claimTile(player, tile, type) {
        // Remove from discards
        const lastIdx = G.discards.length - 1;
        if (lastIdx >= 0 && tileKey(G.discards[lastIdx].tile) === tileKey(tile)) {
            G.discards.pop();
        }
        // Add to player's hand temporarily
        G.hands[player].push({ ...tile });
    }

    function executeClaim(player, tile, decision) {
        const k = tileKey(tile);

        if (decision.action === 'pung') {
            // Remove 2 matching tiles from hand, plus the claimed tile (remove from discards first)
            const lastIdx = G.discards.length - 1;
            if (lastIdx >= 0) G.discards.pop();

            let removed = 0;
            G.hands[player] = G.hands[player].filter(t => {
                if (tileKey(t) === k && removed < 2) { removed++; return false; }
                return true;
            });
            G.melds[player].push({ type: 'pung', tiles: [{ ...tile }, { ...tile }, { ...tile }] });

            if (decision.reason) showAiReason(player, tile, decision.reason);
            G.turn = player;
            G.phase = 'discard';
            renderAll();

            if (player === 'S' && !G.isAiDemo) {
                // Player discards
            } else {
                setTimeout(() => {
                    const d = aiDecide(player);
                    if (d.action === 'win') { endGame(player, false); return; }
                    discardTile(player, d.idx, d.reason);
                    renderAll();
                    G.phase = 'claim';
                    const lastTile = G.discards[G.discards.length - 1]?.tile;
                    setTimeout(() => processClaimsAfterDiscard(lastTile, player), G.isAiDemo ? 1200 : 500);
                }, G.isAiDemo ? 800 : 300);
            }
        } else if (decision.action === 'kong') {
            const lastIdx = G.discards.length - 1;
            if (lastIdx >= 0) G.discards.pop();

            let removed = 0;
            G.hands[player] = G.hands[player].filter(t => {
                if (tileKey(t) === k && removed < 3) { removed++; return false; }
                return true;
            });
            G.melds[player].push({ type: 'kong', tiles: [{ ...tile }, { ...tile }, { ...tile }, { ...tile }] });

            if (decision.reason) showAiReason(player, tile, decision.reason);
            // Kong: player draws again
            G.turn = player;
            G.phase = 'draw';
            renderAll();

            if (player === 'S' && !G.isAiDemo) {
                const drawn = drawTile('S');
                if (!drawn) return;
                if (canWin(G.hands['S'])) {
                    renderAll();
                    showPlayerWinOption();
                    return;
                }
                G.phase = 'discard';
                renderAll();
            } else {
                setTimeout(() => aiTurn(), G.isAiDemo ? 800 : 300);
            }
        } else if (decision.action === 'chow') {
            const lastIdx = G.discards.length - 1;
            if (lastIdx >= 0) G.discards.pop();

            // Find which sequence to form
            const v = tile.value;
            const type = tile.type;
            const hand = G.hands[player];
            let seq = null;

            // Try the best sequence
            const has = (val) => hand.findIndex(t => t.type === type && t.value === val);
            if (v >= 3) {
                const i1 = has(v - 2), i2 = has(v - 1);
                if (i1 >= 0 && i2 >= 0) seq = [v - 2, v - 1, v];
            }
            if (!seq && v >= 2 && v <= 8) {
                const i1 = has(v - 1), i2 = has(v + 1);
                if (i1 >= 0 && i2 >= 0) seq = [v - 1, v, v + 1];
            }
            if (!seq && v <= 7) {
                const i1 = has(v + 1), i2 = has(v + 2);
                if (i1 >= 0 && i2 >= 0) seq = [v, v + 1, v + 2];
            }

            if (seq) {
                // Remove the two tiles from hand (not the claimed tile)
                const toRemove = seq.filter(sv => sv !== v);
                toRemove.forEach(sv => {
                    const idx = G.hands[player].findIndex(t => t.type === type && t.value === sv);
                    if (idx >= 0) G.hands[player].splice(idx, 1);
                });
                G.melds[player].push({
                    type: 'chow',
                    tiles: seq.map(sv => makeTileDef(type, sv))
                });
            }

            if (decision.reason) showAiReason(player, tile, decision.reason);
            G.turn = player;
            G.phase = 'discard';
            renderAll();

            if (player === 'S' && !G.isAiDemo) {
                // Player discards
            } else {
                setTimeout(() => {
                    const d = aiDecide(player);
                    if (d.action === 'win') { endGame(player, false); return; }
                    discardTile(player, d.idx, d.reason);
                    renderAll();
                    G.phase = 'claim';
                    const lastTile = G.discards[G.discards.length - 1]?.tile;
                    setTimeout(() => processClaimsAfterDiscard(lastTile, player), G.isAiDemo ? 1200 : 500);
                }, G.isAiDemo ? 800 : 300);
            }
        }
    }

    /* =========================================================
       END GAME
       ========================================================= */
    function endGame(winner, isSelfDraw) {
        G.phase = 'end';
        hideActions();
        // Remove existing win banner
        document.querySelectorAll('.win-banner').forEach(el => el.remove());

        const banner = document.createElement('div');
        banner.className = 'win-banner';

        if (winner) {
            const name = winner === 'S' ? '你' : WIND_NAMES[winner] + '家(AI)';
            const method = isSelfDraw ? '自摸' : '点炮胡';
            banner.innerHTML = `
                <div class="win-text">胡 了 ！</div>
                <div class="win-sub">${name} ${method}获胜</div>
                <button class="win-close" id="win-close-btn">再来一局</button>
            `;
        } else {
            banner.innerHTML = `
                <div class="win-text">流 局</div>
                <div class="win-sub">牌墙已空，无人胡牌</div>
                <button class="win-close" id="win-close-btn">再来一局</button>
            `;
        }
        document.body.appendChild(banner);
        document.getElementById('win-close-btn').addEventListener('click', () => {
            banner.remove();
            startGame(G.isAiDemo);
        });
    }

    /* =========================================================
       BUTTON EVENTS
       ========================================================= */
    DOM.btnDeal.addEventListener('click', () => startGame(false));
    DOM.btnAiDemo.addEventListener('click', () => startGame(true));

    /* =========================================================
       TEACHING GUIDE PANEL (中文)
       ========================================================= */
    const guideData = {
        'guide-tiles': {
            title: '1. 麻将牌型',
            desc: '标准麻将共136张牌，分为序数牌和字牌两大类。',
            demo: `<div style="display:flex; flex-wrap:wrap; gap:8px; justify-content:center;">
                <div style="text-align:center;"><div class="mj-tile tile-wan" style="width:40px;height:55px;display:inline-flex;"><span class="tile-char">一</span><span class="tile-sub">万</span></div><br><small>万子</small></div>
                <div style="text-align:center;"><div class="mj-tile tile-tong" style="width:40px;height:55px;display:inline-flex;"><span class="tile-char">①</span><span class="tile-sub">筒</span></div><br><small>筒子</small></div>
                <div style="text-align:center;"><div class="mj-tile tile-tiao" style="width:40px;height:55px;display:inline-flex;"><span class="tile-char">1</span><span class="tile-sub">条</span></div><br><small>条子</small></div>
                <div style="text-align:center;"><div class="mj-tile tile-feng" style="width:40px;height:55px;display:inline-flex;"><span class="tile-char">東</span><span class="tile-sub">风</span></div><br><small>风牌</small></div>
                <div style="text-align:center;"><div class="mj-tile tile-jian" style="width:40px;height:55px;display:inline-flex;"><span class="tile-char">中</span><span class="tile-sub">箭</span></div><br><small>箭牌</small></div>
            </div>`,
            details: `<h3>序数牌 (108张)</h3>
                <p><b>万子 (万):</b> 一万到九万，每种4张，共36张。牌面显示中文数字。</p>
                <p><b>筒子 (筒):</b> 一筒到九筒，每种4张，共36张。也叫"饼"。</p>
                <p><b>条子 (条):</b> 一条到九条，每种4张，共36张。也叫"索"。</p>
                <h3>字牌 (28张)</h3>
                <p><b>风牌:</b> 東、南、西、北，每种4张，共16张。</p>
                <p><b>箭牌:</b> 中(红中)、發(发财)、白(白板)，每种4张，共12张。</p>`,
            highlights: []
        },
        'guide-rules': {
            title: '2. 基本规则',
            desc: '四位玩家围坐在麻将桌旁，按 東→南→西→北 的顺序轮流摸牌和打牌。',
            demo: `<div style="font-size:2rem; letter-spacing:10px;">🀄 摸 → 打 → 下家 🀄</div>`,
            details: `<h3>游戏流程</h3>
                <p><b>1. 发牌：</b>洗牌后，每人摸13张牌（庄家14张）。庄家从東家开始。</p>
                <p><b>2. 摸牌：</b>轮到你时，从牌墙摸一张牌。</p>
                <p><b>3. 打牌：</b>摸完后，选择一张不需要的牌打出（丢到弃牌区）。</p>
                <p><b>4. 鸣牌：</b>别人打出的牌，如果对你有用，可以"吃""碰""杠"。</p>
                <p><b>5. 胡牌：</b>当你的手牌满足胡牌条件时，喊"胡"即可获胜！</p>
                <h3>回合顺序</h3>
                <p>正常情况下按 東→南→西→北 循环。碰牌和杠牌会改变顺序。</p>`,
            highlights: ['area-e', 'area-s', 'area-w', 'area-n']
        },
        'guide-win': {
            title: '3. 胡牌条件',
            desc: '胡牌的基本条件是：4组面子 + 1个雀头（对子），共14张牌。',
            demo: `<div style="font-size:1.1rem; line-height:2;">
                <b>面子</b> = 顺子(3连号) 或 刻子(3同牌)<br>
                <b>雀头</b> = 2张相同的牌<br>
                <span style="color:#b8860b;">4 × 面子 + 1 × 雀头 = 胡！</span>
            </div>`,
            details: `<h3>面子的类型</h3>
                <p><b>顺子：</b>同一花色三张相连的序数牌。例如：一万、二万、三万。字牌不能组成顺子。</p>
                <p><b>刻子：</b>三张完全相同的牌。例如：三张東风、三张五筒。</p>
                <p><b>杠子：</b>四张完全相同的牌。可看作特殊的刻子。</p>
                <h3>胡牌举例</h3>
                <p>手牌14张 = 一二三万 + 四五六筒 + 七八九条 + 東東東 + 中中<br>
                = 3顺子 + 1刻子 + 1雀头 = 4面子+1雀头 ✓</p>`,
            highlights: ['area-s']
        },
        'guide-tenpai': {
            title: '4. 听牌判断',
            desc: '"听牌"意味着你只差一张牌就能胡牌。理解听牌是提高牌技的关键。',
            demo: `<div style="font-size:1.1rem;">
                <span style="color:#8c3a3a;">差一张 → 听牌状态</span><br>
                <span style="color:#2d6a4f;">摸到或别人打出 → 胡牌！</span>
            </div>`,
            details: `<h3>判断是否听牌</h3>
                <p>将手牌中的13张依次尝试加入第14张牌（所有可能的牌），如果加入后能胡牌，则说明你在"听"那张牌。</p>
                <h3>常见听牌形式</h3>
                <p><b>单骑：</b>差一张雀头。如有3组面子 + 1张孤牌，听那张孤牌的对子。</p>
                <p><b>两面听：</b>如 二三万听一万或四万。最常见的听牌形式。</p>
                <p><b>嵌张听：</b>如 一三万，听二万。只听一张，较难。</p>
                <p><b>边张听：</b>如 八九万听七万。只听一张。</p>`,
            highlights: ['area-s']
        },
        'guide-strategy': {
            title: '5. 出牌策略',
            desc: 'AI教你如何思考每一步出牌。开启AI教学模式可以观察详细的出牌解说。',
            demo: `<div style="font-size:1.1rem;">
                🤖 点击 <b>"AI教学对局"</b> 按钮<br>
                观看AI自动打牌并学习策略！
            </div>`,
            details: `<h3>初学者策略</h3>
                <p><b>1. 理牌：</b>将手牌按花色排好，同类放一起，方便观察。本游戏自动帮你理牌。</p>
                <p><b>2. 先打字牌：</b>如果字牌是孤张（只有一张），优先打出。它们不能组成顺子。</p>
                <p><b>3. 保留搭子：</b>相邻的两张牌（如二三万）叫"搭子"，有机会摸到需要的牌组成顺子。</p>
                <p><b>4. 不要拆对子：</b>一对牌（如两张五筒）保留下来，可能变成刻子或作为雀头胡牌。</p>
                <p><b>5. 注意安全：</b>别人打过的牌再打出，被碰或胡的风险较低。</p>
                <h3>进阶技巧</h3>
                <p><b>边张浪费：</b>一、九号牌只能组成一种顺子（如一二三），灵活性低，不要攒太多。</p>
                <p><b>听牌优先：</b>临近听牌时，选择能让你听多张的打法（多面听）。</p>`,
            highlights: ['ai-reason-box']
        },
    };

    let activeBtn = null;

    document.querySelectorAll('.feature-btn').forEach(btn => {
        btn.addEventListener('mouseenter', () => {
            document.querySelectorAll('.highlighted').forEach(el => el.classList.remove('highlighted'));
            const target = btn.getAttribute('data-target');
            const data = guideData[target];
            if (data && data.highlights) {
                data.highlights.forEach(id => {
                    const el = document.getElementById(id);
                    if (el) el.classList.add('highlighted');
                });
            }
        });
        btn.addEventListener('mouseleave', () => {
            document.querySelectorAll('.highlighted').forEach(el => el.classList.remove('highlighted'));
        });
        btn.addEventListener('click', () => {
            const target = btn.getAttribute('data-target');
            const data = guideData[target];
            if (!data) return;
            if (activeBtn) activeBtn.classList.remove('active');
            activeBtn = btn; btn.classList.add('active');

            document.getElementById('fp-title').textContent = data.title;
            document.getElementById('fp-desc').textContent = data.desc;
            document.getElementById('fp-demo').innerHTML = data.demo || '';
            document.getElementById('fp-details').innerHTML = data.details || '';
            DOM.panel.classList.add('open');
        });
    });

    DOM.btnClosePanel.addEventListener('click', () => {
        DOM.panel.classList.remove('open');
        if (activeBtn) { activeBtn.classList.remove('active'); activeBtn = null; }
    });

    /* =========================================================
       AUTO-START
       ========================================================= */
    startGame(false);
});
