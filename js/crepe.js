// Harajuku Crepes Anti-Stick Lab
document.addEventListener('DOMContentLoaded', () => {
    // 隐藏开场动画
    setTimeout(() => {
        const overlay = document.getElementById('entrance-overlay');
        if (overlay) overlay.style.opacity = '0';
        setTimeout(() => overlay && overlay.remove(), 1000);
    }, 4500);

    document.getElementById('btn-calc').addEventListener('click', calculateMats);
    document.getElementById('btn-prep').addEventListener('click', showPrep);
    document.getElementById('btn-pan').addEventListener('click', showPanGuide);
    document.getElementById('btn-flip').addEventListener('click', showFlipGuide);
    document.getElementById('btn-cone').addEventListener('click', displayCone);
    document.getElementById('layer-close').addEventListener('click', () => {
        document.getElementById('layer-modal').classList.add('hidden');
    });

    calculateMats();
    renderEmptyPan();
});

let crepeCount = 5;

function calculateMats() {
    let inputVal = parseInt(document.getElementById('in-num').value);
    if (isNaN(inputVal) || inputVal < 1) inputVal = 1;
    crepeCount = inputVal;

    // 单片20cm 可丽饼黄金原宿配比 (精确克数防止面糊过稠导致粘锅)
    // 低筋面粉: 20g, 细砂糖: 6g, 盐: 0.2g, 室温蛋液: 25g (约半个大蛋), 约65°C温牛奶: 50g, 融化无盐黄油: 6g
    const flour = (20 * crepeCount).toFixed(1);
    const sugar = (6 * crepeCount).toFixed(1);
    const salt = (0.2 * crepeCount).toFixed(1);
    const egg = (25 * crepeCount).toFixed(1);
    const milk = (50 * crepeCount).toFixed(1);
    const butter = (6 * crepeCount).toFixed(1);

    const matsList = document.getElementById('mats-list');
    matsList.innerHTML = `
        <div class="c-mat-item">
            <span class="c-mat-name">低筋面粉 / Cake Flour (绝不能用高筋)</span>
            <span class="c-mat-val">${flour} g</span>
        </div>
        <div class="c-mat-item">
            <span class="c-mat-name">细砂糖 / Sugar</span>
            <span class="c-mat-val">${sugar} g</span>
        </div>
        <div class="c-mat-item">
            <span class="c-mat-name">海盐 / Sea Salt</span>
            <span class="c-mat-val">${salt} g</span>
        </div>
        <div class="c-mat-item">
            <span class="c-mat-name">全蛋液 (必须完全常温)</span>
            <span class="c-mat-val">${egg} g</span>
        </div>
        <div class="c-mat-item">
            <span class="c-mat-name">全脂牛奶 (微波加热至 65°C)</span>
            <span class="c-mat-val">${milk} g</span>
        </div>
        <div class="c-mat-item">
            <span class="c-mat-name">无盐黄油 (融化成液态作为润滑剂)</span>
            <span class="c-mat-val">${butter} g</span>
        </div>
    `;

    renderEmptyPan();
}

function openModal(title, content) {
    document.getElementById('layer-title').innerHTML = title;
    document.getElementById('layer-desc').innerHTML = content;
    document.getElementById('layer-modal').classList.remove('hidden');
}

function showPrep() {
    const content = `
        <div style="background: #fff9e6; padding: 15px; border-radius: 10px; border: 2px dashed #ff9eb5; margin-bottom: 20px;">
            <strong style="color: #ff7aa2;">【魔法咏唱警告】：</strong> 可丽饼面糊如果马上煎，面筋紧绷，必破必粘！
        </div>
        
        <h3 style="color:#8c6a5d;">[第一阶段] 粉液混合大忌 ⏱️ 耗时：5分钟</h3>
        <p>1. 将面粉与糖盐混合过筛 (不筛的话里面全是面疙瘩，煎的时候直接糊底)。</p>
        <p>2. 加入常温蛋液搅拌。<strong>为什么牛奶要加热到 65°C？</strong>因为温牛奶能糊化面粉中的淀粉，让面糊变得像丝绸一样滑，绝不结块！分三次倒入温牛奶搅匀。</p>
        <p>3. 最后倒入融化的液态黄油。这 6g 油脂是你在煎锅里生存的额外防线！</p>

        <h3 style="color:#ff7aa2; border-top: 1px dotted #ccc; padding-top: 15px;">[第二阶段] 绝对静置法则 ⏱️ 预计耗时：60 分钟</h3>
        <div style="display:flex; align-items:center; gap: 15px;">
            <svg viewBox="0 0 50 50" width="60" height="60" style="flex-shrink:0;">
                <circle cx="25" cy="25" r="20" fill="none" stroke="#a6ddef" stroke-width="3"/>
                <path d="M 25 10 L 25 25 L 35 25" fill="none" stroke="#ff9eb5" stroke-width="3" stroke-linecap="round">
                    <animateTransform attributeName="transform" type="rotate" values="0 25 25; 360 25 25" dur="3s" repeatCount="indefinite" />
                </path>
            </svg>
            <p style="margin:0;">
                覆上保鲜膜，将面糊送入冰箱冷藏<strong>至少 1 小时</strong>（最好过夜）。<br>
                这一步让面粉彻底吸收水分，使面筋完全放松。静置后的面糊流动性极强且不容易破裂。
            </p>
        </div>
    `;
    openModal("① 傻瓜面糊炼金术与静置制裁", content);
}

function showPanGuide() {
    const content = `
        <div style="background: #e6f7ff; padding: 15px; border-radius: 10px; border: 2px solid #a6ddef; margin-bottom: 20px;">
            <strong style="color: #5c4a43;">【系统升级告诫】：</strong> 既然手抖无法掌握重力与流体力学，我们全面废除平底锅体系！启用工业流水线的绝对参数：<strong>倒扣物理蘸浆。</strong>
        </div>

        <h3 style="color:#8c6a5d;">[工业化步骤一] 预热倒扣 ⏱️ 预估：全程傻瓜式操作</h3>
        <p>不要再用锅了！电薄饼机插电后会自动保持在大约 200°C 的恒温。将调好的面糊全部倒进配套的浅平盆（弹药库）里。</p>

        <h3 style="color:#ff7aa2; border-top: 1px dotted #ccc; padding-top: 15px;">[工业化步骤二] 垂直盖章浸蘸 ⏱️ 耗时：3 秒</h3>
        <div style="display:flex; align-items:center; gap: 15px;">
            <svg viewBox="0 0 50 50" width="60" height="60" style="flex-shrink:0;">
                <path d="M 5 40 L 45 40 L 40 48 L 10 48 Z" fill="#fff6d9" stroke="#d4b5a2" stroke-width="2"/>
                <path d="M 15 20 L 35 20 L 30 38 L 20 38 Z" fill="#ff7aa2" stroke="#d47c9e" stroke-width="2">
                     <animateTransform attributeName="transform" type="translate" values="0 0; 0 10; 0 0" dur="2s" repeatCount="indefinite"/>
                </path>
            </svg>
            <p style="margin:0;">
                <strong>傻瓜流水线核心：</strong> 拿起机器，把发热的凸面**像盖章一样**水平朝下，直接按进面糊盆里！停留 3 秒钟。<br>
                由于高温面糊会死死黏在发热盘上，你完全不需要转动手腕！
            </p>
        </div>
    `;
    openModal("② 无情盖章蘸浆法 (彻底告别手腕)", content);
    renderBatterPouring();
}

function showFlipGuide() {
    const content = `
        <div style="background: #fff4f4; padding: 15px; border-radius: 10px; border: 2px dashed #ff9eb5; margin-bottom: 20px;">
            <strong style="color: #ff7aa2;">【脱模警告】：</strong> 由于是单面高温发热盘，你甚至连翻面都不需要！单面直接可以熟透。
        </div>

        <h3 style="color:#8c6a5d;">[火力烘烤阶段] ⏱️ 预计：静候 15-20 秒</h3>
        <p>将蘸好面糊的机器翻转过来（面糊朝上），不用任何操作！你会看到水分蒸发，原本白色的液态面糊迅速变成哑光半透明状，边缘会自动微微翘起脱离机器。</p>

        <h3 style="color:#ff7aa2; border-top: 1px dotted #ccc; padding-top: 15px;">[无损揭面膜] ⏱️ 预计脱模：5 秒</h3>
        <div style="display:flex; align-items:center; gap: 15px;">
            <svg viewBox="0 0 50 50" width="60" height="60" style="flex-shrink:0;">
                <circle cx="25" cy="25" r="20" fill="#fbdcb8" stroke="#d4b5a2" stroke-width="2" stroke-dasharray="4 2"/>
                <path d="M 5 15 Q 25 -5 45 15" fill="none" stroke="#fff" stroke-width="3" opacity="0.8">
                     <animate attributeName="d" values="M 5 15 Q 25 -5 45 15; M 5 25 Q 25 5 45 25; M 5 15 Q 25 -5 45 15" dur="1s" repeatCount="indefinite"/>
                </path>
            </svg>
            <p style="margin:0;">
                看到边缘泛黄起皱，拿筷子挑起外圈，顺势像<strong>撕面膜一样</strong>整张直接剥下来！<br>
                一张厚度如纸、完美几何圆形的工业级可丽饼就诞生了！不需要任何厨艺底子！
            </p>
        </div>
    `;
    openModal("③ 撕面膜级离心脱模", content);
    renderFlipAnim();
}

// ---------------- SVG Renderings ----------------
function renderEmptyPan() {
    const stage = document.getElementById('kawaii-kitchen');
    stage.innerHTML = `
        <!-- Shadow -->
        <ellipse cx="150" cy="240" rx="110" ry="25" fill="rgba(0,0,0,0.05)" />
        
        <!-- Batter Tray (Bottom) -->
        <ellipse cx="150" cy="230" rx="90" ry="30" fill="#f4e4c1" stroke="#d4b5a2" stroke-width="4"/>
        <ellipse cx="150" cy="240" rx="90" ry="30" fill="none" stroke="#d4b5a2" stroke-width="4"/>
        
        <!-- Electric Crepe Maker Machine -->
        <g id="machine-group">
            <!-- Handle -->
            <path d="M 230 130 L 290 140" stroke="#ff9eb5" stroke-width="20" stroke-linecap="round" />
            <path d="M 270 137 L 285 140" stroke="#ff7aa2" stroke-width="6" stroke-linecap="round" />
            <!-- Machine Body -->
            <ellipse cx="150" cy="140" rx="80" ry="20" fill="#A8D5BA" />
            <path d="M 70 140 Q 150 180 230 140 L 230 120 Q 150 160 70 120 Z" fill="#9bc7aa"/>
            
            <!-- Convex Heating Plate (Black Non-stick) -->
            <ellipse cx="150" cy="115" rx="75" ry="30" fill="#2a2321" />
            <!-- Dome highlight -->
            <ellipse cx="150" cy="110" rx="60" ry="20" fill="#3a2e28" />
        </g>
    `;
}

function renderBatterPouring() {
    const stage = document.getElementById('kawaii-kitchen');
    stage.innerHTML = `
        <!-- Shadow -->
        <ellipse cx="150" cy="240" rx="110" ry="25" fill="rgba(0,0,0,0.05)" />
        
        <!-- Batter Tray Full of Batter -->
        <ellipse cx="150" cy="230" rx="90" ry="30" fill="#f4e4c1" stroke="#d4b5a2" stroke-width="4"/>
        <ellipse cx="150" cy="235" rx="85" ry="25" fill="#fff6d9" />
        
        <!-- Animated Machine Dipping -->
        <g id="machine-group">
            <animateTransform attributeName="transform" type="translate" values="0 -70; 0 80; 0 -70" dur="3s" repeatCount="1" fill="freeze" />
            
            <g>
                <animateTransform attributeName="transform" type="rotate" values="180 150 140" dur="0.1s" fill="freeze" /> 
                <!-- Handle -->
                <path d="M 230 130 L 290 140" stroke="#ff9eb5" stroke-width="20" stroke-linecap="round" />
                <!-- Machine Body -->
                <ellipse cx="150" cy="140" rx="80" ry="20" fill="#A8D5BA" />
                <path d="M 70 140 Q 150 180 230 140 L 230 120 Q 150 160 70 120 Z" fill="#9bc7aa"/>
                <!-- Convex Heating Plate (Black Non-stick) -->
                <ellipse cx="150" cy="165" rx="75" ry="30" fill="#2a2321" />
            </g>
        </g>
        
        <text x="30" y="50" font-size="20" fill="#ff7aa2" opacity="0">
            <animate attributeName="opacity" values="0; 0; 1; 1; 0" dur="3s" keyTimes="0; 0.4; 0.5; 0.8; 1" />
            [垂直盖章 蘸取面糊]
        </text>
    `;

    setTimeout(() => {
        const stage = document.getElementById('kawaii-kitchen');
        if (!stage) return;
        stage.innerHTML = `
            <!-- Shadow -->
            <ellipse cx="150" cy="240" rx="110" ry="25" fill="rgba(0,0,0,0.05)" />
            
            <!-- Batter Tray -->
            <ellipse cx="150" cy="230" rx="90" ry="30" fill="#f4e4c1" stroke="#d4b5a2" stroke-width="4"/>
            <ellipse cx="150" cy="235" rx="85" ry="25" fill="#fff6d9" />
            
            <!-- Lifted Machine with Batter -->
            <g id="machine-group">
                <!-- Handle -->
                <path d="M 230 130 L 290 140" stroke="#ff9eb5" stroke-width="20" stroke-linecap="round" />
                <path d="M 270 137 L 285 140" stroke="#ff7aa2" stroke-width="6" stroke-linecap="round" />
                <!-- Machine Body -->
                <ellipse cx="150" cy="140" rx="80" ry="20" fill="#A8D5BA" />
                <path d="M 70 140 Q 150 180 230 140 L 230 120 Q 150 160 70 120 Z" fill="#9bc7aa"/>
                
                <!-- Plate -->
                <ellipse cx="150" cy="115" rx="75" ry="30" fill="#2a2321" />
                
                <!-- Dough on Plate -->
                <ellipse cx="150" cy="115" rx="75" ry="30" fill="#fff6d9" opacity="0.9">
                    <animate attributeName="fill" values="#fff6d9; #fbdcb8" dur="4s" fill="freeze" />
                </ellipse>
                
                <!-- Steam -->
                <path d="M 120 100 Q 130 80 120 60" fill="none" stroke="#fff" stroke-width="3" opacity="0.6">
                    <animateTransform attributeName="transform" type="translate" values="0 10; 0 -20" dur="2s" repeatCount="indefinite" />
                    <animate attributeName="opacity" values="0; 0.6; 0" dur="2s" repeatCount="indefinite" />
                </path>
                <path d="M 170 110 Q 180 90 170 70" fill="none" stroke="#fff" stroke-width="3" opacity="0.6">
                    <animateTransform attributeName="transform" type="translate" values="0 5; 0 -25" dur="1.8s" repeatCount="indefinite" />
                    <animate attributeName="opacity" values="0; 0.5; 0" dur="1.8s" repeatCount="indefinite" />
                </path>
            </g>
        `;
    }, 3000);
}

function renderFlipAnim() {
    const stage = document.getElementById('kawaii-kitchen');
    stage.innerHTML = `
        <!-- Shadow -->
        <ellipse cx="150" cy="240" rx="110" ry="25" fill="rgba(0,0,0,0.05)" />
        
        <!-- Lifted Machine with Cooked Batter -->
        <g id="machine-group">
            <path d="M 230 130 L 290 140" stroke="#ff9eb5" stroke-width="20" stroke-linecap="round" />
            <ellipse cx="150" cy="140" rx="80" ry="20" fill="#A8D5BA" />
            <path d="M 70 140 Q 150 180 230 140 L 230 120 Q 150 160 70 120 Z" fill="#9bc7aa"/>
            <ellipse cx="150" cy="115" rx="75" ry="30" fill="#2a2321" />
        </g>
        
        <!-- Chopsticks Peeling the crepe -->
        <path d="M 60 40 L 78 115" stroke="#d4b5a2" stroke-width="6" stroke-linecap="round" />
        
        <!-- Peeled Crepe -->
        <path d="M 75 115 Q 150 80 225 115 Q 150 145 75 115" fill="#fbdcb8" stroke="#e6a47a" stroke-width="2">
             <animate attributeName="d" values="M 75 115 Q 150 80 225 115 Q 150 145 75 115; M 75 80 Q 150 100 225 60 Q 150 30 75 80" dur="2s" fill="freeze" />
        </path>
    `;
}

function displayCone() {
    const stage = document.getElementById('kawaii-kitchen');
    // Clear pan, render folded crepe cone
    stage.innerHTML = `
        <!-- Paper Wrapper -->
        <path d="M 100 80 L 200 80 L 160 260 L 140 260 Z" fill="#ff9eb5" />
        <path d="M 100 80 L 150 100 L 200 80 Z" fill="#ffd1dc" />
        
        <!-- Folded Crepe Dough -->
        <path d="M 110 70 Q 150 10 190 70 L 150 250 Z" fill="#fbdcb8" stroke="#e6a47a" stroke-width="2"/>
        
        <!-- Cream -->
        <path d="M 120 70 Q 150 40 180 70 Q 150 100 120 70 Z" fill="#fff" filter="drop-shadow(0 5px 5px rgba(0,0,0,0.1))" />
        <circle cx="150" cy="55" r="20" fill="#fff" />
        <circle cx="130" cy="65" r="15" fill="#fff" />
        <circle cx="170" cy="65" r="18" fill="#fff" />

        <!-- Strawberries -->
        <path d="M 145 40 Q 150 25 155 40 Q 155 50 145 50 Z" fill="#ff4d4d" />
        <path d="M 130 50 Q 135 35 140 50 Q 140 60 130 60 Z" fill="#ff4d4d" transform="rotate(-20 135 50)" />
        <path d="M 160 55 Q 165 40 170 55 Q 170 65 160 65 Z" fill="#ff4d4d" transform="rotate(20 165 55)" />
        
        <!-- Pocky Sticks -->
        <line x1="160" y1="50" x2="200" y2="10" stroke="#8c6a5d" stroke-width="4" stroke-linecap="round" />
        <line x1="140" y1="50" x2="110" y2="0" stroke="#8c6a5d" stroke-width="4" stroke-linecap="round" />
        
        <!-- Chocolate Drizzle -->
        <path d="M 125 65 Q 140 75 135 85 Q 150 80 160 90 Q 170 75 175 65" fill="none" stroke="#4a2e21" stroke-width="3" stroke-linecap="round" />

        <!-- Floating Hearts -->
        <path d="M 80 50 A 5 5 0 0 1 90 50 A 5 5 0 0 1 100 50 Q 100 60 90 70 Q 80 60 80 50 Z" fill="#ff9eb5">
            <animateTransform attributeName="transform" type="translate" values="0 0; 0 -20; 0 0" dur="2s" repeatCount="indefinite" />
        </path>
        <path d="M 210 30 A 4 4 0 0 1 218 30 A 4 4 0 0 1 226 30 Q 226 38 218 46 Q 210 38 210 30 Z" fill="#a6ddef">
            <animateTransform attributeName="transform" type="translate" values="0 0; 0 -15; 0 0" dur="2.5s" repeatCount="indefinite" />
        </path>
    `;
}
