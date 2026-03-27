import { useEffect, useRef } from 'react';
import useMouse from '../../hooks/useMouse';

export default function MouseBloom() {
    const bloomRef = useRef(null);
    const mouseRef = useMouse();

    useEffect(() => {
        let frame;
        let currentRadius = 400;

        const render = () => {
            const state = mouseRef.current;
            if (!state || !bloomRef.current) {
                frame = requestAnimationFrame(render);
                return;
            }

            const speed = Math.sqrt(state.vx * state.vx + state.vy * state.vy);
            const targetRadius = 400 + Math.min(speed * 20, 200);
            currentRadius += (targetRadius - currentRadius) * 0.1;

            bloomRef.current.style.setProperty('--mx', `${state.x}px`);
            bloomRef.current.style.setProperty('--my', `${state.y}px`);
            bloomRef.current.style.setProperty('--radius', `${currentRadius}px`);

            frame = requestAnimationFrame(render);
        };

        frame = requestAnimationFrame(render);
        return () => cancelAnimationFrame(frame);
    }, [mouseRef]);

    return (
        <div
            ref={bloomRef}
            style={{
                position: 'fixed',
                inset: 0,
                zIndex: 3,
                pointerEvents: 'none',
                background: `radial-gradient(var(--radius) circle at var(--mx, -500px) var(--my, -500px), rgba(120, 80, 255, 0.06), transparent 70%)`
            }}
        />
    );
}
