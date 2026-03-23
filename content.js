(function() {
    // === Overlay ===
    const crosshairContainer = document.createElement('div');
    Object.assign(crosshairContainer.style, {
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: '9999',
        pointerEvents: 'none',
        display: 'none'
    });
    document.body.appendChild(crosshairContainer);

    // === Load saved color ===
    let baseColor = localStorage.getItem("miniblox_crosshair_color") || "rgb(255,255,255)";
    let currentColor = baseColor;

    // === STATES ===
    let f5PressCount = 0;
    let otherKeysManualHide = false;

    // === Helper ===
    const makeLine = (styles) => {
        const div = document.createElement('div');
        Object.assign(div.style, {
            position: 'absolute',
            backgroundColor: currentColor
        }, styles);
        return div;
    };

    // === DESIGNS ===
    const designs = {
        "Crosshair": () => {
            const c = document.createElement('div');
            c.appendChild(makeLine({ top: '0', left: '50%', width: '2px', height: '6px', transform: 'translateX(-50%)' }));
            c.appendChild(makeLine({ bottom: '0', left: '50%', width: '2px', height: '6px', transform: 'translateX(-50%)' }));
            c.appendChild(makeLine({ left: '0', top: '50%', width: '6px', height: '2px', transform: 'translateY(-50%)' }));
            c.appendChild(makeLine({ right: '0', top: '50%', width: '6px', height: '2px', transform: 'translateY(-50%)' }));
            return c;
        },

        "Dot": () => {
            const c = document.createElement('div');
            const dot = document.createElement('div');
            Object.assign(dot.style, {
                position: 'absolute',
                top: '50%',
                left: '50%',
                width: '5px',
                height: '5px',
                backgroundColor: currentColor,
                borderRadius: '50%',
                transform: 'translate(-50%, -50%)'
            });
            c.appendChild(dot);
            return c;
        }
    };

    let currentDesign = localStorage.getItem("miniblox_crosshair") || "Crosshair";

    const updateCrosshair = () => {
        crosshairContainer.innerHTML = '';
        crosshairContainer.appendChild(designs[currentDesign]());
    };
    updateCrosshair();

    // === MENU ===
    const menu = document.createElement('div');
    Object.assign(menu.style, {
        position: 'fixed',
        bottom: '200px',
        left: '50%',
        transform: 'translateX(-50%)',
        background: 'rgba(0,0,0,0.9)',
        color: 'white',
        padding: '10px',
        borderRadius: '10px',
        display: 'none',
        zIndex: '10000'
    });
    document.body.appendChild(menu);

    Object.keys(designs).forEach(name => {
        const btn = document.createElement('button');
        btn.textContent = name;
        btn.style.margin = '5px';
        btn.onclick = () => {
            currentDesign = name;
            localStorage.setItem("miniblox_crosshair", name);
            updateCrosshair();
            menu.style.display = 'none';
        };
        menu.appendChild(btn);
    });

    // === COLOR SLIDERS ===
    const sliders = ['R','G','B'].map((label,i)=>{
        const input = document.createElement('input');
        input.type = 'range';
        input.min = 0;
        input.max = 255;
        input.value = parseInt(baseColor.match(/\d+/g)?.[i] || 255);
        input.oninput = () => {
            const values = sliders.map(s=>s.value);
            baseColor = `rgb(${values.join(",")})`;
            localStorage.setItem("miniblox_crosshair_color", baseColor);
            updateCrosshair();
        };
        menu.appendChild(input);
        return input;
    });

    // === KEYBINDS ===
    document.addEventListener('keydown', e => {

        if (e.key === '\\') {
            menu.style.display = menu.style.display === 'none' ? 'block' : 'none';
        }

        if (e.key === 'F5') {
            e.preventDefault();
            f5PressCount = (f5PressCount + 1) % 3;
            otherKeysManualHide = false;

            crosshairContainer.style.display = (f5PressCount === 0) ? 'block' : 'none';
        }

        if (e.key === 'F1') {
            otherKeysManualHide = !otherKeysManualHide;
            f5PressCount = 0;

            crosshairContainer.style.display = otherKeysManualHide ? 'none' : 'block';
        }
    });

    // === CROSSHAIR INDICATOR ===
    const getElementAtCrosshair = () => {
        return document.elementFromPoint(window.innerWidth/2, window.innerHeight/2);
    };

    const isAimingAtPlayer = () => {
        const el = getElementAtCrosshair();
        if (!el) return false;

        // tweak if needed
        return el.closest('[class*="player"], canvas') !== null;
    };

    // === MAIN LOOP ===
    const checkCrosshair = () => {
        const defaultCrosshair = document.querySelector('.css-xhoozx');
        const pauseMenu = document.querySelector('.chakra-modal__content-container,[role="dialog"]');

        const isHidden = (f5PressCount !== 0) || otherKeysManualHide;

        if (defaultCrosshair && !pauseMenu) {

            if (isHidden) {
                crosshairContainer.style.display = 'none';
                defaultCrosshair.style.display = 'none';
                return;
            }

            defaultCrosshair.style.display = 'none';
            crosshairContainer.style.display = 'block';

            // 🔥 INDICATOR EFFECT
            if (isAimingAtPlayer()) {
                currentColor = "rgb(255,0,0)"; // RED ON PLAYER
                crosshairContainer.style.transform = 'translate(-50%, -50%) scale(1.2)';
            } else {
                currentColor = baseColor;
                crosshairContainer.style.transform = 'translate(-50%, -50%) scale(1)';
            }

            updateCrosshair();

        } else {
            crosshairContainer.style.display = 'none';
            f5PressCount = 0;
            otherKeysManualHide = false;
        }
    };

    new MutationObserver(checkCrosshair).observe(document.body, { childList: true, subtree: true });
    setInterval(checkCrosshair, 100);

})();
