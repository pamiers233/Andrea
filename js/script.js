/**
 * Art History Blog Script — Astrolabium Galileo Galilei Edition
 * Combined: Astrolabe frame gen + Celestial orbit planets + Planet detail view + Clock + 5 Info Circles + Book mechanics
 */

document.addEventListener('DOMContentLoaded', () => {

    const NS = 'http://www.w3.org/2000/svg';
    const INK = '#3b2c24';
    const INK_FAINT = 'rgba(59, 44, 36, 0.3)';

    // ==========================================
    // 1. ASTROLABE FRAME PROCEDURAL GENERATION
    // ==========================================

    // --- Degree Ticks (Mater rim) ---
    const degreeTicks = document.getElementById('degree-ticks');
    if (degreeTicks) {
        for (let i = 0; i < 360; i++) {
            const line = document.createElementNS(NS, 'line');
            const isMajor = i % 10 === 0;
            const isMid = i % 5 === 0;
            line.setAttribute('x1', '0');
            line.setAttribute('y1', isMajor ? '-450' : isMid ? '-455' : '-460');
            line.setAttribute('x2', '0');
            line.setAttribute('y2', '-475');
            line.setAttribute('transform', `rotate(${i})`);
            line.setAttribute('stroke', INK);
            line.setAttribute('stroke-width', isMajor ? '1.2' : '0.4');
            degreeTicks.appendChild(line);
        }
    }

    // --- Minute Ticks ---
    const minuteTicks = document.getElementById('minute-ticks');
    if (minuteTicks) {
        for (let i = 0; i < 60; i++) {
            const line = document.createElementNS(NS, 'line');
            const angle = i * 6;
            const isMajor = i % 5 === 0;
            line.setAttribute('x1', '0');
            line.setAttribute('y1', isMajor ? '-395' : '-400');
            line.setAttribute('x2', '0');
            line.setAttribute('y2', '-410');
            line.setAttribute('transform', `rotate(${angle})`);
            line.setAttribute('stroke', INK);
            line.setAttribute('stroke-width', isMajor ? '1.5' : '0.5');
            minuteTicks.appendChild(line);
        }
    }

    // --- Hour Numerals (Roman, 12-hour) ---
    const hourNumerals = document.getElementById('hour-numerals');
    const romanNums = ['XII', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI'];
    if (hourNumerals) {
        for (let i = 0; i < 12; i++) {
            const angle = i * 30;
            const rad = (angle - 90) * Math.PI / 180;
            const r = 440;
            const x = r * Math.cos(rad);
            const y = r * Math.sin(rad);
            const text = document.createElementNS(NS, 'text');
            text.setAttribute('x', String(x));
            text.setAttribute('y', String(y + 7));
            text.setAttribute('text-anchor', 'middle');
            text.setAttribute('class', 'astro-text-hour');
            text.setAttribute('transform', `rotate(${angle}, ${x}, ${y})`);
            text.textContent = romanNums[i];
            hourNumerals.appendChild(text);
        }
    }

    // ==========================================
    // 2. ASTRONOMICAL CALCULATION ENGINE
    // ==========================================
    function julianDay(y, m, d) {
        if (m <= 2) { y--; m += 12; }
        const A = Math.floor(y / 100);
        const B = 2 - A + Math.floor(A / 4);
        return Math.floor(365.25 * (y + 4716)) + Math.floor(30.6001 * (m + 1)) + d + B - 1524.5;
    }

    function sunLongitude(date) {
        const jd = julianDay(date.getFullYear(), date.getMonth() + 1, date.getDate() + date.getHours() / 24);
        const T = (jd - 2451545.0) / 36525;
        let L0 = 280.46646 + 36000.76983 * T;
        let M = (357.52911 + 35999.05029 * T) * Math.PI / 180;
        const C = (1.914602 - 0.004817 * T) * Math.sin(M) + 0.019993 * Math.sin(2 * M);
        return ((L0 + C) % 360 + 360) % 360;
    }

    function moonPhase(date) {
        const jd = julianDay(date.getFullYear(), date.getMonth() + 1, date.getDate());
        let phase = ((jd - 2451550.1) % 29.53058886) / 29.53058886;
        if (phase < 0) phase += 1;
        return phase;
    }

    function siderealTimeDeg(date) {
        const jd = julianDay(date.getFullYear(), date.getMonth() + 1, date.getDate());
        const T = (jd - 2451545.0) / 36525;
        let GMST = 280.46061837 + 360.98564736629 * (jd - 2451545.0) + 0.000387933 * T * T;
        const hrs = date.getHours() + date.getMinutes() / 60 + date.getSeconds() / 3600;
        GMST += hrs * 15;
        return ((GMST % 360) + 360) % 360;
    }

    const zodiacNames = ['Aries ♈', 'Taurus ♉', 'Gemini ♊', 'Cancer ♋',
        'Leo ♌', 'Virgo ♍', 'Libra ♎', 'Scorpio ♏',
        'Sagittarius ♐', 'Capricorn ♑', 'Aquarius ♒', 'Pisces ♓'];
    const monthNames = ['IAN', 'FEB', 'MAR', 'APR', 'MAI', 'IVN', 'IVL', 'AVG', 'SEP', 'OCT', 'NOV', 'DEC'];
    const dayNames = ['SOLIS', 'LVNAE', 'MARTIS', 'MERCVRII', 'IOVIS', 'VENERIS', 'SATVRNI'];

    // ==========================================
    // 3. REAL-TIME CLOCK + INFO CIRCLES
    // ==========================================
    const hourHand = document.getElementById('hour-hand');
    const minuteHand = document.getElementById('minute-hand');
    const secondHand = document.getElementById('second-hand');
    const CLOCK_START_DELAY = 8000;

    function updateClock() {
        const now = new Date();
        const h = now.getHours(), m = now.getMinutes(), s = now.getSeconds(), ms = now.getMilliseconds();

        // Clock hands
        const secAngle = (s + ms / 1000) * 6;
        const minAngle = (m + s / 60) * 6;
        const hourAngle = ((h % 12) + m / 60) * 30;
        if (hourHand) hourHand.setAttribute('transform', `rotate(${hourAngle})`);
        if (minuteHand) minuteHand.setAttribute('transform', `rotate(${minAngle})`);
        if (secondHand) secondHand.setAttribute('transform', `rotate(${secAngle})`);

        // Info Circles
        const sunLon = sunLongitude(now);
        const phase = moonPhase(now);
        const sidereal = siderealTimeDeg(now);
        const zIdx = Math.floor(sunLon / 30);

        // Date circle
        const dateEl = document.getElementById('dateValue');
        if (dateEl) {
            dateEl.textContent = `${now.getDate()} ${monthNames[now.getMonth()]}\n${dayNames[now.getDay()]}`;
        }

        // Zodiac circle
        const zodiacEl = document.getElementById('zodiacValue');
        if (zodiacEl) {
            zodiacEl.textContent = zodiacNames[zIdx];
        }

        // Sun circle
        const sunEl = document.getElementById('sunValue');
        if (sunEl) {
            sunEl.textContent = `${sunLon.toFixed(1)}°`;
        }

        // Sidereal circle
        const siderealEl = document.getElementById('siderealValue');
        if (siderealEl) {
            const sh = Math.floor(sidereal / 15);
            const sm = Math.floor((sidereal / 15 - sh) * 60);
            siderealEl.textContent = `${String(sh).padStart(2, '0')}h ${String(sm).padStart(2, '0')}m`;
        }

        // Moon phase visual
        drawMoonPhase(phase);

        // Moon label
        const moonEl = document.getElementById('moonValue');
        if (moonEl) {
            let pn = '';
            if (phase < 0.03 || phase > 0.97) pn = 'Nova';
            else if (phase < 0.22) pn = 'Crescens';
            else if (phase < 0.28) pn = 'Quadr. I';
            else if (phase < 0.47) pn = 'Gibbosa';
            else if (phase < 0.53) pn = 'Plena';
            else if (phase < 0.72) pn = 'Gibbosa';
            else if (phase < 0.78) pn = 'Quadr. II';
            else pn = 'Decrescens';
            moonEl.textContent = pn;
        }

        requestAnimationFrame(updateClock);
    }

    function drawMoonPhase(phase) {
        const svg = document.getElementById('moonPhaseSvg');
        if (!svg) return;
        svg.innerHTML = '';
        const r = 20;

        // Background disc
        const bg = document.createElementNS(NS, 'circle');
        bg.setAttribute('cx', '0'); bg.setAttribute('cy', '0');
        bg.setAttribute('r', String(r));
        bg.setAttribute('fill', INK_FAINT);
        bg.setAttribute('stroke', INK);
        bg.setAttribute('stroke-width', '1');
        svg.appendChild(bg);

        // Illuminated part
        const illumination = phase <= 0.5 ? phase * 2 : (1 - phase) * 2;
        if (illumination > 0.01) {
            const sweep = phase <= 0.5 ? 1 : 0;
            const kx = r * (2 * illumination - 1);
            const d = `M 0,${-r} A ${r},${r} 0 0,${sweep} 0,${r} A ${Math.abs(kx) || 0.1},${r} 0 0,${kx >= 0 ? 1 : 0} 0,${-r} Z`;
            const lit = document.createElementNS(NS, 'path');
            lit.setAttribute('d', d);
            lit.setAttribute('fill', '#ebdcb2');
            svg.appendChild(lit);
        }

        // Hatching on dark side
        for (let i = -r + 4; i < r; i += 5) {
            const halfW = Math.sqrt(r * r - i * i) * 0.8;
            const hatch = document.createElementNS(NS, 'line');
            hatch.setAttribute('x1', String(-halfW * 0.4));
            hatch.setAttribute('y1', String(i));
            hatch.setAttribute('x2', String(halfW * 0.3));
            hatch.setAttribute('y2', String(i));
            hatch.setAttribute('stroke', INK);
            hatch.setAttribute('stroke-width', '0.3');
            hatch.setAttribute('opacity', '0.3');
            svg.appendChild(hatch);
        }
    }

    // Start clock after draw animation
    setTimeout(updateClock, CLOCK_START_DELAY);

    // ==========================================
    // 4. PLANET DETAIL VIEW (click-to-zoom)
    // ==========================================
    const planetData = {
        mercury: {
            name: 'MERCURIVS', latin: 'Mercurius — The Swift Messenger',
            orbit: '88 dies', distance: '0.39 AU', moons: '0', diameter: '4,879 km',
            desc: 'The smallest planet and closest to Sol. Named after the Roman messenger god for its swift orbit. Its surface, scarred by countless impacts, resembles our Luna. Renaissance astronomers struggled to observe it, always hiding in the glare of the Sun.',
            radius: 50, satellites: []
        },
        venus: {
            name: 'VENVS', latin: 'Venus — The Morning Star',
            orbit: '225 dies', distance: '0.72 AU', moons: '0', diameter: '12,104 km',
            desc: 'The brightest wandering star, Venus captivated astronomers since antiquity. Galileo observed its phases, providing crucial evidence for the Copernican model. Shrouded in thick clouds, its surface burns hotter than Mercury.',
            radius: 70, satellites: []
        },
        earth: {
            name: 'TERRA', latin: 'Terra — Our Blue Sphere',
            orbit: '365.25 dies', distance: '1.00 AU', moons: '1 (Luna)', diameter: '12,742 km',
            desc: 'The third sphere from Sol, the only world known to harbor life. Its single satellite Luna governs the tides. Copernicus dared to dethrone Terra from the center of the cosmos — a revolution of thought as profound as any painted masterpiece.',
            radius: 75, satellites: [{ name: 'Luna', dist: 120, size: 18, speed: 4 }]
        },
        mars: {
            name: 'MARS', latin: 'Mars — The Red Wanderer',
            orbit: '687 dies', distance: '1.52 AU', moons: '2 (Phobos, Deimos)', diameter: '6,779 km',
            desc: 'The blood-red planet. Kepler used Tycho Brahe\'s observations of Mars to derive his laws of planetary motion — elliptical orbits that shattered the ancient dogma of perfect circles.',
            radius: 60, satellites: [
                { name: 'Phobos', dist: 100, size: 10, speed: 2.5 },
                { name: 'Deimos', dist: 140, size: 7, speed: 5 }
            ]
        },
        jupiter: {
            name: 'IVPITER', latin: 'Iupiter — King of the Planets',
            orbit: '4,333 dies', distance: '5.20 AU', moons: '95 (4 Galilean)', diameter: '139,820 km',
            desc: 'In 1610, Galileo discovered four bright satellites around Jupiter — Io, Europa, Ganymede, and Callisto. This was revolutionary: not everything orbited the Earth. The Great Red Spot, a storm larger than Terra, has raged for centuries.',
            radius: 110, satellites: [
                { name: 'Io', dist: 155, size: 14, speed: 2 },
                { name: 'Europa', dist: 185, size: 12, speed: 3.5 },
                { name: 'Ganymede', dist: 220, size: 16, speed: 5 },
                { name: 'Callisto', dist: 260, size: 13, speed: 7 }
            ]
        }
    };

    const overlay = document.getElementById('planet-overlay');
    const backBtn = document.getElementById('backToSolar');
    const detailGroup = document.getElementById('planetDetailGroup');

    function showPlanetDetail(key) {
        const p = planetData[key];
        if (!p) return;

        document.getElementById('planetName').textContent = p.name;
        document.getElementById('planetLatinName').textContent = p.latin;
        document.getElementById('planetOrbit').textContent = p.orbit;
        document.getElementById('planetDistance').textContent = p.distance;
        document.getElementById('planetMoons').textContent = p.moons;
        document.getElementById('planetDiameter').textContent = p.diameter;
        document.getElementById('planetDescription').textContent = p.desc;

        detailGroup.innerHTML = '';
        const ink = '#3b2c24';
        const faint = 'rgba(59, 44, 36, 0.25)';

        // Cross hairs
        const vLine = document.createElementNS(NS, 'line');
        vLine.setAttribute('x1', '0'); vLine.setAttribute('y1', '-280');
        vLine.setAttribute('x2', '0'); vLine.setAttribute('y2', '280');
        vLine.setAttribute('stroke', faint); vLine.setAttribute('stroke-width', '0.6');
        detailGroup.appendChild(vLine);
        const hLine = document.createElementNS(NS, 'line');
        hLine.setAttribute('x1', '-280'); hLine.setAttribute('y1', '0');
        hLine.setAttribute('x2', '280'); hLine.setAttribute('y2', '0');
        hLine.setAttribute('stroke', faint); hLine.setAttribute('stroke-width', '0.6');
        detailGroup.appendChild(hLine);

        // Planet body
        const body = document.createElementNS(NS, 'circle');
        body.setAttribute('cx', '0'); body.setAttribute('cy', '0');
        body.setAttribute('r', String(p.radius));
        body.setAttribute('fill', 'none'); body.setAttribute('stroke', ink); body.setAttribute('stroke-width', '2');
        detailGroup.appendChild(body);

        // Inner circle
        const fill = document.createElementNS(NS, 'circle');
        fill.setAttribute('cx', '0'); fill.setAttribute('cy', '0');
        fill.setAttribute('r', String(p.radius * 0.6));
        fill.setAttribute('fill', 'none'); fill.setAttribute('stroke', ink); fill.setAttribute('stroke-width', '0.8');
        detailGroup.appendChild(fill);

        // Hatching
        for (let i = -p.radius + 10; i < p.radius; i += 8) {
            const halfW = Math.sqrt(p.radius * p.radius - i * i) * 0.9;
            const hatch = document.createElementNS(NS, 'line');
            hatch.setAttribute('x1', String(-halfW)); hatch.setAttribute('y1', String(i));
            hatch.setAttribute('x2', String(halfW)); hatch.setAttribute('y2', String(i));
            hatch.setAttribute('stroke', faint); hatch.setAttribute('stroke-width', '0.5');
            detailGroup.appendChild(hatch);
        }

        // Satellites
        p.satellites.forEach(sat => {
            // Orbit path
            const oc = document.createElementNS(NS, 'circle');
            oc.setAttribute('cx', '0'); oc.setAttribute('cy', '0');
            oc.setAttribute('r', String(sat.dist));
            oc.setAttribute('fill', 'none'); oc.setAttribute('stroke', faint);
            oc.setAttribute('stroke-width', '0.8'); oc.setAttribute('stroke-dasharray', '6 4');
            detailGroup.appendChild(oc);

            // Animated moon group
            const moonG = document.createElementNS(NS, 'g');
            moonG.classList.add('detail-moon-orbit');
            moonG.style.transformOrigin = '0 0';
            moonG.style.setProperty('--orbit-speed', sat.speed + 's');

            const mb = document.createElementNS(NS, 'circle');
            mb.setAttribute('cx', String(sat.dist)); mb.setAttribute('cy', '0');
            mb.setAttribute('r', String(sat.size));
            mb.setAttribute('fill', 'none'); mb.setAttribute('stroke', ink); mb.setAttribute('stroke-width', '1.2');
            moonG.appendChild(mb);

            const md = document.createElementNS(NS, 'circle');
            md.setAttribute('cx', String(sat.dist)); md.setAttribute('cy', '0');
            md.setAttribute('r', String(sat.size * 0.4));
            md.setAttribute('fill', ink);
            moonG.appendChild(md);

            const label = document.createElementNS(NS, 'text');
            label.setAttribute('x', String(sat.dist)); label.setAttribute('y', String(-sat.size - 6));
            label.setAttribute('text-anchor', 'middle'); label.setAttribute('fill', ink);
            label.setAttribute('font-size', '11'); label.setAttribute('font-family', "'Cinzel', serif");
            label.textContent = sat.name;
            moonG.appendChild(label);

            detailGroup.appendChild(moonG);
        });

        // Title
        const nameLabel = document.createElementNS(NS, 'text');
        nameLabel.setAttribute('x', '0'); nameLabel.setAttribute('y', '-270');
        nameLabel.setAttribute('text-anchor', 'middle'); nameLabel.setAttribute('fill', ink);
        nameLabel.setAttribute('font-size', '18'); nameLabel.setAttribute('font-family', "'Cinzel', serif");
        nameLabel.setAttribute('letter-spacing', '4');
        nameLabel.textContent = p.name;
        detailGroup.appendChild(nameLabel);

        // Show
        overlay.classList.remove('hidden');
        requestAnimationFrame(() => { requestAnimationFrame(() => { overlay.classList.add('visible'); }); });
    }

    function hidePlanetDetail() {
        overlay.classList.remove('visible');
        setTimeout(() => {
            overlay.classList.add('hidden');
            detailGroup.innerHTML = '';
        }, 800);
    }

    document.querySelectorAll('.planet-clickable').forEach(el => {
        el.addEventListener('click', (e) => {
            e.stopPropagation();
            showPlanetDetail(el.getAttribute('data-planet'));
        });
    });

    if (backBtn) backBtn.addEventListener('click', hidePlanetDetail);

    // ==========================================
    // 5. INTRO TRANSITION
    // ==========================================
    const enterBtn = document.getElementById('enter-blog');
    const introContainer = document.getElementById('intro-container');
    const blogWrapper = document.getElementById('blog-wrapper');

    if (enterBtn) {
        enterBtn.addEventListener('click', () => {
            introContainer.classList.add('intro-leave');
            setTimeout(() => {
                introContainer.style.display = 'none';
                blogWrapper.classList.remove('hidden');
            }, 1500);
        });
    }

    // ==========================================
    // 6. 3D BOOK FLIPPING MECHANICS
    // ==========================================
    const blogData = [
        {
            title: "I. The Genesis of Perspective",
            content: `
                <p><span class="drop-cap">A</span>s we behold the masterworks of the Renaissance, we are struck not merely by the mimetic precision of the figures, but by the underlying mathematical rigor that governs the canvas. The discovery of linear perspective by Filippo Brunelleschi, later codified by Leon Battista Alberti in his seminal treatise <em>De pictura</em> (1435), marked a paradigm shift in visual representation.</p>
                <p>Prior to this, medieval art often employed hierarchical scale. However, the paradigm shift toward humanism demanded a convergence of science and art.</p>
                <figure class="sketch-figure"><div class="sketch-box"></div><figcaption>Fig 1. Study of convergence lines.</figcaption></figure>
                <p>Consider Masaccio's <em>Holy Trinity</em> in Santa Maria Novella. This intersection of mathematics and aesthetics fundamentally redefined the artist's role.</p>
            `
        },
        {
            title: "II. Chiaroscuro & Emotional Resonance",
            content: `
                <p><span class="drop-cap">B</span>eyond the structural scaffolding of perspective lies the atmospheric manipulation of light and shadow—Chiaroscuro. It was Caravaggio who radicalized this technique into Tenebrism.</p>
                <p>In Rembrandt's works, chiaroscuro evolves from dramatic theater into psychological introspection.</p>
                <div class="quote-block">"The painter has the Universe in his mind and hands." <br>— Leonardo da Vinci</div>
                <p>Thus, light in art history is never neutral. It is an active participant in the composition.</p>
            `
        }
    ];

    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    const book = document.getElementById('book');
    const backCover = document.getElementById('page-3');

    const wasHidden = blogWrapper.classList.contains('hidden');
    if (wasHidden) {
        blogWrapper.style.visibility = 'hidden';
        blogWrapper.style.display = 'flex';
    }

    const measurePage = document.createElement('div');
    measurePage.className = 'page';
    measurePage.innerHTML = `<div class="front parchment"><div class="page-content" id="measure-content"></div></div>`;
    book.insertBefore(measurePage, backCover);

    const measureContent = document.getElementById('measure-content');
    const styles = window.getComputedStyle(measureContent);
    const padX = parseFloat(styles.paddingLeft) + parseFloat(styles.paddingRight);
    const padY = parseFloat(styles.paddingTop) + parseFloat(styles.paddingBottom);
    const exactWidth = measureContent.clientWidth - padX;
    const exactHeight = measureContent.clientHeight - padY;

    let globalPageIndex = 1;
    let currentBookPage = null;
    let isFront = true;
    let pageNodes = [];
    const isMobile = window.innerWidth <= 900;

    blogData.forEach((chapter) => {
        if (!isFront && currentBookPage) {
            currentBookPage.innerHTML += `<div class="back parchment"><div class="page-content"></div></div>`;
            isFront = true;
        }
        const chapterHtml = `${chapter.title ? `<h2 class="chapter-title" style="break-inside: avoid;">${chapter.title}</h2>` : ''}${chapter.content}`;
        const gap = 40;
        const cols = document.createElement('div');
        cols.style.columnWidth = `${exactWidth}px`;
        cols.style.columnGap = `${gap}px`;
        cols.style.height = `${exactHeight}px`;
        cols.style.position = 'absolute';
        cols.innerHTML = chapterHtml;
        const endMarker = document.createElement('span');
        endMarker.innerHTML = '&nbsp;';
        cols.appendChild(endMarker);
        measureContent.innerHTML = '';
        measureContent.appendChild(cols);
        const colsRect = cols.getBoundingClientRect();
        const markerRect = endMarker.getBoundingClientRect();
        let numCols = Math.ceil((markerRect.right - colsRect.left) / (exactWidth + gap));
        if (numCols <= 0) numCols = 1;

        for (let i = 0; i < numCols; i++) {
            if (isMobile || isFront) {
                currentBookPage = document.createElement('div');
                currentBookPage.className = 'page';
                pageNodes.push(currentBookPage);
            }
            const sideClass = (isMobile || isFront) ? 'front' : 'back';
            const offset = i * (exactWidth + gap);
            currentBookPage.innerHTML += `
                <div class="${sideClass} parchment">
                    <div class="page-content">
                        <div style="width:100%;height:100%;overflow:hidden;position:relative;">
                            <div style="width:${exactWidth}px;height:${exactHeight}px;column-width:${exactWidth}px;column-gap:${gap}px;position:absolute;left:-${offset}px;top:0;">
                                ${chapterHtml}
                            </div>
                        </div>
                    </div>
                    <div class="page-number">${globalPageIndex}</div>
                </div>`;
            globalPageIndex++;
            if (!isMobile) isFront = !isFront;
        }
    });

    if (!isMobile && !isFront && currentBookPage) {
        currentBookPage.innerHTML += `<div class="back parchment"><div class="page-content"></div></div>`;
    }
    pageNodes.forEach((node, idx) => {
        node.id = 'page-' + (idx + 1);
        book.insertBefore(node, backCover);
    });
    if (isMobile) {
        const bp = backCover.querySelector('.back');
        if (bp) { const ep = document.createElement('div'); ep.className = 'page'; bp.className = 'front parchment cover-back'; ep.appendChild(bp); book.appendChild(ep); }
    }
    measurePage.remove();
    if (wasHidden) { blogWrapper.style.visibility = ''; blogWrapper.style.display = ''; }

    const pages = document.querySelectorAll('.page');
    let currentPage = 0;
    const totalPages = pages.length;

    function initBook() {
        pages.forEach((page, index) => {
            page.style.zIndex = totalPages - index;
            page.addEventListener('click', () => {
                if (page.classList.contains('flipped')) goPrevPage();
                else if (index === currentPage) goNextPage();
            });
        });
        updateControls();
    }

    function goNextPage() {
        if (currentPage < totalPages) {
            pages[currentPage].classList.add('flipped');
            pages[currentPage].style.zIndex = currentPage + 1;
            currentPage++;
            updateBookPosition();
        }
    }
    function goPrevPage() {
        if (currentPage > 0) {
            currentPage--;
            pages[currentPage].classList.remove('flipped');
            const cp = currentPage;
            setTimeout(() => { pages[cp].style.zIndex = totalPages - cp; }, 750);
            updateBookPosition();
        }
    }
    function updateBookPosition() {
        if (currentPage === 0) { book.classList.remove('open'); book.style.transform = "translateX(25%)"; }
        else if (currentPage === totalPages) { book.classList.add('open'); book.style.transform = "translateX(-25%)"; }
        else { book.classList.add('open'); book.style.transform = "translateX(0)"; }
        updateControls();
    }
    function updateControls() {
        if (prevBtn) prevBtn.disabled = currentPage === 0;
        if (nextBtn) nextBtn.disabled = currentPage === totalPages;
    }

    if (prevBtn) prevBtn.addEventListener('click', goPrevPage);
    if (nextBtn) nextBtn.addEventListener('click', goNextPage);
    document.addEventListener('keydown', (e) => {
        if (!blogWrapper.classList.contains('hidden')) {
            if (e.key === 'ArrowRight') goNextPage();
            else if (e.key === 'ArrowLeft') goPrevPage();
        }
    });
    initBook();
});
