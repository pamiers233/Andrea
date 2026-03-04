/**
 * Art History Blog Script
 * Handles Intro Animation, SVG Math path generation, and 3D Page flip mechanics.
 */

document.addEventListener('DOMContentLoaded', () => {

    // ==========================================
    // 1. INTRO SVG PROCEDURAL GENERATION & LOGIC
    // ==========================================
    const ticksGroup = document.getElementById('ticks');

    // Dynamically generate the 360-degree ticks for the "measuring instrument" feel
    if (ticksGroup) {
        for (let i = 0; i < 360; i += 5) {
            const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
            line.setAttribute("x1", "0");

            // Every 15 degrees make a longer tick
            const isMajor = i % 15 === 0;
            line.setAttribute("y1", isMajor ? "-460" : "-465");
            line.setAttribute("x2", "0");
            line.setAttribute("y2", "-480");

            line.setAttribute("transform", `rotate(${i})`);
            ticksGroup.appendChild(line);
        }
    }

    const enterBtn = document.getElementById('enter-blog');
    const introContainer = document.getElementById('intro-container');
    const blogWrapper = document.getElementById('blog-wrapper');

    // Handle the transition from intro to the actual blog
    if (enterBtn) {
        enterBtn.addEventListener('click', () => {
            introContainer.classList.add('intro-leave');
            setTimeout(() => {
                introContainer.style.display = 'none';
                blogWrapper.classList.remove('hidden');
            }, 1500); // matches the CSS transition time
        });
    }

    // ==========================================
    // 2. 3D BOOK FLIPPING MECHANICS
    // ==========================================
    const blogData = [
        {
            title: "I. The Genesis of Perspective",
            content: `
                <p><span class="drop-cap">A</span>s we behold the masterworks of the Renaissance, we are struck not merely by the mimetic precision of the figures, but by the underlying mathematical rigor that governs the canvas. The discovery of linear perspective by Filippo Brunelleschi, later codified by Leon Battista Alberti in his seminal treatise <em>De pictura</em> (1435), marked a paradigm shift in visual representation.</p>
                <p>Prior to this, medieval art often employed hierarchical scale, where the relative size of figures was dictated by their theological or social importance rather than their spatial distance from the viewer. The flatter dimensional plane served a didactic and spiritual purpose. However, the paradigm shift toward humanism demanded a convergence of science and art.</p>
                <figure class="sketch-figure"><div class="sketch-box"></div><figcaption>Fig 1. Study of convergence lines.</figcaption></figure>
                <p>Consider Masaccio's <em>Holy Trinity</em> in Santa Maria Novella. The trompe l'oeil barrel vault appears to recede into the actual wall of the church, an effect so convincing that Vasari described it as "a hole pierced in the wall." This is not merely an optical trick; it is a theological statement, grounding the divine mystery within the measurable, rational space of human experience.</p>
                <p>This intersection of mathematics and aesthetics fundamentally redefined the artist's role. No longer merely a craftsman, the artist became a scholar, a geometer, an intellectual. Da Vinci's extensive codices, filled with anatomical studies and geometric proofs, are the ultimate testament to this synthesis.</p>
            `
        },
        {
            title: "II. Chiaroscuro & Emotional Resonance",
            content: `
                <p><span class="drop-cap">B</span>eyond the structural scaffolding of perspective lies the atmospheric manipulation of light and shadow—Chiaroscuro. While earlier artists modeled forms with value changes, it was Caravaggio who radicalized this technique into Tenebrism. By plunging his backgrounds into an impenetrable abyss and sharply illuminating subjects with an almost theatrical spotlight, he amplified the emotional gravity of the narrative.</p>
                <p>This intense contrast was highly controversial. Critics of the time argued it lacked decorum, choosing to depict saints with dirty feet and weathered faces. Yet, it was precisely this visceral realism, anchored by the severe lighting, that bridged the divine and the profane.</p>
                <p>In Rembrandt's works, chiaroscuro evolves from dramatic theater into psychological introspection. The shadows in a Rembrandt portrait are not merely absences of light; they are thick with unspoken narrative and atmospheric density.</p>
                <p>Let us turn our gaze to the Dutch Golden Age. The careful observation of light was not limited to dramatic biblical scenes but extended to the quiet intimacy of genre scenes. Vermeer transformed the domestic interior into a sanctuary, where a single stream of light passing through a leaded window could sanctify the simple act of pouring milk.</p>
                <div class="quote-block">"The painter has the Universe in his mind and hands." <br>— Leonardo da Vinci</div>
                <p>Thus, light in art history is never neutral over the centuries. It is an active participant in the composition, guiding the eye, defining the form, and ultimately, dictating the psychological tenor of the masterpiece. The evolution from flat gold-leaf backgrounds to complex tonal modeling charts humanity's evolving relationship with reality itself.</p>
            `
        }
    ];

    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    const book = document.getElementById('book');
    const backCover = document.getElementById('page-3');

    // Make blogWrapper temporarily visible to calculate exact DOM dimensions
    const wasHidden = blogWrapper.classList.contains('hidden');
    if (wasHidden) {
        blogWrapper.style.visibility = 'hidden';
        blogWrapper.style.display = 'flex';
    }

    // Measure page capacity
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

    // Dynamically paginates data using CSS multi-columns to measure text flow perfectly
    blogData.forEach((chapter, index) => {
        // Rule: Each new chapter must start on a 'front' page.
        if (!isFront && currentBookPage) {
            currentBookPage.innerHTML += `
                <div class="back parchment">
                    <div class="page-content"></div>
                </div>
            `;
            isFront = true;
        }

        const chapterHtml = `
            ${chapter.title ? `<h2 class="chapter-title" style="break-inside: avoid; page-break-inside: avoid;">${chapter.title}</h2>` : ''}
            ${chapter.content}
        `;

        const gap = 40; // Apply an invisible gap to prevent word bleed chunks
        const cols = document.createElement('div');
        cols.style.columnWidth = `${exactWidth}px`;
        cols.style.columnGap = `${gap}px`;
        cols.style.height = `${exactHeight}px`;
        cols.style.position = 'absolute';
        cols.innerHTML = chapterHtml;

        // Add end marker to precisely measure total offset width due to columns
        const endMarker = document.createElement('span');
        endMarker.innerHTML = '&nbsp;';
        cols.appendChild(endMarker);

        measureContent.innerHTML = '';
        measureContent.appendChild(cols);

        const colsRect = cols.getBoundingClientRect();
        const markerRect = endMarker.getBoundingClientRect();
        const distX = markerRect.right - colsRect.left;

        let numCols = Math.ceil(distX / (exactWidth + gap));
        if (numCols <= 0) numCols = 1;

        for (let i = 0; i < numCols; i++) {
            if (isFront) {
                currentBookPage = document.createElement('div');
                currentBookPage.className = 'page';
                pageNodes.push(currentBookPage);
            }

            const sideClass = isFront ? 'front' : 'back';
            const offset = i * (exactWidth + gap);
            const contentDivHTML = `
                <div class="${sideClass} parchment">
                    <div class="page-content">
                        <div style="width: 100%; height: 100%; overflow: hidden; position: relative;">
                            <div style="width: ${exactWidth}px; height: ${exactHeight}px; column-width: ${exactWidth}px; column-gap: ${gap}px; position: absolute; left: -${offset}px; top: 0;">
                                ${chapterHtml}
                            </div>
                        </div>
                    </div>
                    <div class="page-number">${globalPageIndex}</div>
                </div>
            `;

            currentBookPage.innerHTML += contentDivHTML;
            globalPageIndex++;
            isFront = !isFront;
        }
    });

    // Close the very last page if it ended on a front
    if (!isFront && currentBookPage) {
        currentBookPage.innerHTML += `
            <div class="back parchment">
                <div class="page-content"></div>
            </div>
        `;
    }

    pageNodes.forEach((node, idx) => {
        node.id = 'page-' + (idx + 1);
        book.insertBefore(node, backCover);
    });

    measurePage.remove();

    if (wasHidden) {
        blogWrapper.style.visibility = '';
        blogWrapper.style.display = '';
    }

    const pages = document.querySelectorAll('.page');
    let currentPage = 0; // The index of the page currently viewed on the LEFT
    const totalPages = pages.length;

    // Initialization: set proper z-indices
    function initBook() {
        pages.forEach((page, index) => {
            // Pages on the right stack with lower z-index as index increases
            page.style.zIndex = totalPages - index;
            // Attach click event directly on pages for quick flipping
            page.addEventListener('click', (e) => {
                // Determine if we clicked a right page or left page
                if (page.classList.contains('flipped')) {
                    // It's on the left, we flip it back to right
                    goPrevPage();
                } else {
                    // It's on the right, we flip it to left
                    // Only if it's the top-most right page
                    if (index === currentPage) {
                        goNextPage();
                    }
                }
            });
        });
        updateControls();
    }

    function goNextPage() {
        if (currentPage < totalPages) {
            const page = pages[currentPage];
            page.classList.add('flipped');

            // Adjust z-index during flip to ensure proper visual layering
            page.style.zIndex = currentPage + 1;

            currentPage++;
            updateBookPosition();
        }
    }

    function goPrevPage() {
        if (currentPage > 0) {
            currentPage--;
            const page = pages[currentPage];
            page.classList.remove('flipped');

            // Restore original right-side stacking z-index
            setTimeout(() => {
                page.style.zIndex = totalPages - currentPage;
            }, 750); // half of the transition duration

            updateBookPosition();
        }
    }

    function updateBookPosition() {
        // When book is closed (cover), center it by translating.
        // When opened, shift left. 
        // When reached the end (back cover), shift further left to center the back.
        if (currentPage === 0) {
            book.classList.remove('open');
            book.style.transform = "translateX(25%)";
        } else if (currentPage === totalPages) {
            book.classList.add('open');
            book.style.transform = "translateX(-25%)";
        } else {
            book.classList.add('open');
            book.style.transform = "translateX(0)";
        }
        updateControls();
    }

    function updateControls() {
        if (prevBtn) prevBtn.disabled = currentPage === 0;
        if (nextBtn) nextBtn.disabled = currentPage === totalPages;
    }

    if (prevBtn) prevBtn.addEventListener('click', goPrevPage);
    if (nextBtn) nextBtn.addEventListener('click', goNextPage);

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
        if (!blogWrapper.classList.contains('hidden')) {
            if (e.key === 'ArrowRight') {
                goNextPage();
            } else if (e.key === 'ArrowLeft') {
                goPrevPage();
            }
        }
    });

    initBook();
});
