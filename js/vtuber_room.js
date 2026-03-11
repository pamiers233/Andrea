// vtuber_room.js

document.addEventListener('DOMContentLoaded', () => {
    // ─── Variables ───
    const liveRoom = document.getElementById('live-room');
    const canvasWrapper = document.querySelector('.canvas-wrapper');
    const btnSave = document.getElementById('btn-save');
    const btnClear = document.getElementById('btn-clear');

    let activeItem = null;
    let isDragging = false;
    let isResizing = false;
    let dragOffsetX = 0, dragOffsetY = 0;

    // Resize Handle references
    let currentResizer = null;
    let originalRect = null;
    let originalMouse = null;

    // ─── Scale Workspace to fit screen ───
    function resizeScale() {
        // Find how much to scale 1920 to fit wrapper width
        const wrapperWidth = canvasWrapper.clientWidth;
        const scale = wrapperWidth / 1920;
        liveRoom.style.transform = `scale(${scale})`;
    }
    window.addEventListener('resize', resizeScale);
    resizeScale();

    // ─── UI Logic: Tabs & Sidebar ───
    const tabs = document.querySelectorAll('.tab');
    const tabContents = document.querySelectorAll('.tab-content');

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            tabContents.forEach(tc => tc.classList.remove('active'));
            tab.classList.add('active');
            document.getElementById('tab-' + tab.dataset.tab).classList.add('active');
        });
    });

    // Background color
    document.querySelectorAll('.color-swatch').forEach(swatch => {
        swatch.addEventListener('click', (e) => {
            liveRoom.style.backgroundColor = e.target.dataset.bg;
            document.querySelectorAll('.color-swatch').forEach(s => s.classList.remove('active'));
            e.target.classList.add('active');
        });
    });

    // Background patterns
    document.querySelectorAll('.pattern-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const pattern = e.target.dataset.pattern;
            liveRoom.className = `live-room ${pattern}`;
        });
    });

    // ─── Object Creation ───
    let zIndexCounter = 10;

    function createDraggableElement(htmlContent, classNameStr, defaultWidth, defaultHeight) {
        const item = document.createElement('div');
        item.className = 'room-item ' + classNameStr;
        item.style.zIndex = zIndexCounter++;
        item.innerHTML = htmlContent;

        // Default size logic via width/height style to allow scaling
        if (defaultWidth) item.style.width = defaultWidth + 'px';
        if (defaultHeight) item.style.height = defaultHeight + 'px';

        // Add 4 resize handles
        const handles = ['se', 'sw', 'ne', 'nw'];
        handles.forEach(dir => {
            const h = document.createElement('div');
            h.className = `resizer resizer-${dir}`;
            h.dataset.dir = dir;
            item.appendChild(h);
        });

        // Event for selecting/dragging
        item.addEventListener('mousedown', handleItemMousedown);

        liveRoom.appendChild(item);
        selectItem(item);
    }

    // Add Component Buttons
    document.querySelectorAll('.add-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const type = e.target.dataset.type;
            if (type === 'frame-game') {
                createDraggableElement('🎮 GAME SCREEN', 'elem-game', 1280, 720);
            } else if (type === 'frame-chat') {
                let msgs = `
                    <div class="chat-bubble">「这是什么神仙房间！」</div>
                    <div class="chat-bubble">「贴贴主播～💖」</div>
                    <div class="chat-bubble">「草ｗｗｗｗｗ」</div>
                    <div class="chat-bubble">「kksk 关注了」</div>
                    <div class="chat-bubble" style="color:#ff6b81; font-weight:bold;">✨ 感谢老板的舰长！</div>
                `;
                createDraggableElement(msgs, 'elem-chat', 450, 650);
            } else if (type === 'frame-vtuber') {
                createDraggableElement('立绘框<br>(透明)', 'elem-game', 500, 700);
            } else if (type === 'image-avatar') {
                createDraggableElement('', 'elem-avatar', 450, 600);
            } else if (type === 'text-banner') {
                const text = e.target.textContent;
                createDraggableElement(text, 'elem-text');
            }
        });
    });

    // Add Emoji
    document.querySelectorAll('.emoji-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            createDraggableElement(e.target.textContent, 'elem-emoji');
        });
    });

    // Add Custom Text
    document.getElementById('btn-add-text').addEventListener('click', () => {
        const val = document.getElementById('custom-text-input').value.trim();
        if (val) {
            createDraggableElement(val, 'elem-text');
        }
    });

    // ─── Selection Logic ───
    function selectItem(item) {
        if (activeItem) activeItem.classList.remove('selected');
        activeItem = item;
        if (activeItem) {
            activeItem.classList.add('selected');
            activeItem.style.zIndex = zIndexCounter++;
        }
    }

    // Unselect when clicking canvas background
    canvasWrapper.addEventListener('mousedown', (e) => {
        if (e.target.id === 'live-room' || e.target.classList.contains('canvas-wrapper')) {
            if (activeItem) activeItem.classList.remove('selected');
            activeItem = null;
        }
    });

    // ─── Keyboard Deletion ───
    window.addEventListener('keydown', (e) => {
        if (e.key === 'Delete' || e.key === 'Backspace') {
            if (activeItem && e.target.tagName !== 'INPUT') {
                activeItem.remove();
                activeItem = null;
            }
        }
    });

    // ─── Drag & Drag Logic ───
    function getMousePosInRoom(e) {
        const rect = liveRoom.getBoundingClientRect();
        // Calculate true 1920x1080 coordinates by dividing out the scale
        const scale = canvasWrapper.clientWidth / 1920;
        return {
            x: (e.clientX - rect.left) / scale,
            y: (e.clientY - rect.top) / scale
        };
    }

    function handleItemMousedown(e) {
        if (e.target.classList.contains('resizer')) {
            // Resize logic
            isResizing = true;
            currentResizer = e.target.dataset.dir;
            selectItem(e.target.parentElement);

            // For scale() elements, resizing is tricky if we use CSS transform scale.
            // Wait, we are sizing width/height or font-size? 
            // The simplest approach for custom shapes is using css transform scale
            // Let's store base values
            const scaleTransform = activeItem.style.transform || '';
            const scaleMatch = scaleTransform.match(/scale\(([^)]+)\)/);
            const currentScale = scaleMatch ? parseFloat(scaleMatch[1]) : 1;

            originalRect = {
                w: activeItem.offsetWidth,
                h: activeItem.offsetHeight,
                scale: currentScale
            };
            originalMouse = getMousePosInRoom(e);

            e.stopPropagation();
            return;
        }

        // Dragging logic
        isDragging = true;
        selectItem(e.currentTarget);
        const pos = getMousePosInRoom(e);

        // Parse left/top (which are center coordinates due to transform translate(-50%,-50%))
        const left = parseFloat(activeItem.style.left) || 1920 / 2;
        const top = parseFloat(activeItem.style.top) || 1080 / 2;

        dragOffsetX = pos.x - left;
        dragOffsetY = pos.y - top;

        e.stopPropagation();
    }

    window.addEventListener('mousemove', (e) => {
        if (!activeItem) return;

        if (isDragging) {
            const pos = getMousePosInRoom(e);
            activeItem.style.left = (pos.x - dragOffsetX) + 'px';
            activeItem.style.top = (pos.y - dragOffsetY) + 'px';
        }
        else if (isResizing) {
            const pos = getMousePosInRoom(e);
            const dx = pos.x - originalMouse.x;
            const dy = pos.y - originalMouse.y;

            // Simple uniform scale based on mouse distance change (x-axis mainly)
            let delta = (currentResizer.includes('e') ? dx : -dx);

            // Calculate scale ratio
            const newScale = Math.max(0.2, originalRect.scale + delta / 300);

            // Preserve the translate(-50%, -50%)
            activeItem.style.transform = `translate(-50%, -50%) scale(${newScale})`;
        }
    });

    window.addEventListener('mouseup', () => {
        isDragging = false;
        isResizing = false;
        currentResizer = null;
    });

    // ─── Export / Download ───
    btnSave.addEventListener('click', async () => {
        if (activeItem) activeItem.classList.remove('selected');

        // Reset scale temporarily for perfect 1920x1080 rendering via html2canvas
        const oldScale = liveRoom.style.transform;
        liveRoom.style.transform = 'scale(1)';

        btnSave.textContent = '🔄 渲染中...';

        try {
            const canvas = await html2canvas(liveRoom, {
                width: 1920,
                height: 1080,
                scale: 1, // 1:1 ratio
                useCORS: true,
                backgroundColor: null // transparent or rely on live-room bg color
            });

            const dataUrl = canvas.toDataURL('image/png');
            const link = document.createElement('a');
            link.download = 'vtuber_room_amdrea.png';
            link.href = dataUrl;
            link.click();

        } catch (err) {
            console.error(err);
            alert('保存失败，请检查浏览器控制台');
        }

        // Restore responsive scale
        liveRoom.style.transform = oldScale;
        btnSave.textContent = '⬇️ 保存为图片 (Download)';
    });

    // ─── Clear ───
    btnClear.addEventListener('click', () => {
        if (confirm('想清空重新来过吗？')) {
            liveRoom.querySelectorAll('.room-item').forEach(e => e.remove());
        }
    });
});
