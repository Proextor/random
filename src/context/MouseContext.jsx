import { createContext, useContext, useEffect, useRef } from 'react';

const MouseContext = createContext();

export function MouseProvider({ children }) {
    const mouseState = useRef({
        x: -100,
        y: -100,
        vx: 0,
        vy: 0,
        hovering: false,
        isMatte: false,
        isCanvas: false,
        label: ''
    });

    useEffect(() => {
        let lastTime = performance.now();
        let lastX = -100;
        let lastY = -100;

        const onMouseMove = (e) => {
            const currentTime = performance.now();
            const dt = Math.max(1, currentTime - lastTime);

            const vx = (e.clientX - lastX) / dt;
            const vy = (e.clientY - lastY) / dt;

            mouseState.current.x = e.clientX;
            mouseState.current.y = e.clientY;
            mouseState.current.vx = vx;
            mouseState.current.vy = vy;

            lastX = e.clientX;
            lastY = e.clientY;
            lastTime = currentTime;

            const target = e.target;
            const interactive = target.closest('a, button, [data-cursor-label], .magnetic, canvas');

            if (interactive) {
                mouseState.current.hovering = true;
                mouseState.current.label = interactive.getAttribute('data-cursor-label') || '';
                mouseState.current.isCanvas = interactive.tagName.toLowerCase() === 'canvas';
            } else {
                mouseState.current.hovering = false;
                mouseState.current.label = '';
                mouseState.current.isCanvas = false;
            }

            const matteSection = target.closest('.matte-surface, [data-matte="true"]');
            mouseState.current.isMatte = !!matteSection;
        };

        window.addEventListener('mousemove', onMouseMove, { passive: true });

        const decay = setInterval(() => {
            mouseState.current.vx *= 0.5;
            mouseState.current.vy *= 0.5;
        }, 50);

        return () => {
            window.removeEventListener('mousemove', onMouseMove);
            clearInterval(decay);
        };
    }, []);

    return (
        <MouseContext.Provider value={mouseState}>
            {children}
        </MouseContext.Provider>
    );
}

export function useMouseContext() {
    return useContext(MouseContext);
}
