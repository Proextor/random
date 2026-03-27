import { useEffect, useRef, useState } from 'react';

export default function GrainOverlay() {
    const feTurbulenceRef = useRef(null);
    const [opacity, setOpacity] = useState(0.035);

    useEffect(() => {
        setOpacity(window.innerWidth < 768 ? 0.05 : 0.035);

        let frame;
        let lastTime = 0;

        const render = (time) => {
            if (time - lastTime > 50) {
                if (feTurbulenceRef.current) {
                    feTurbulenceRef.current.setAttribute('seed', Math.floor(Math.random() * 100).toString());
                }
                lastTime = time;
            }
            frame = requestAnimationFrame(render);
        };

        frame = requestAnimationFrame(render);
        return () => cancelAnimationFrame(frame);
    }, []);

    return (
        <div style={{ position: 'fixed', inset: 0, zIndex: 2, pointerEvents: 'none', opacity: opacity, mixBlendMode: 'overlay' }}>
            <svg width="100%" height="100%">
                <filter id="grain">
                    <feTurbulence
                        ref={feTurbulenceRef}
                        type="fractalNoise"
                        baseFrequency="0.65"
                        numOctaves="3"
                        stitchTiles="stitch"
                    />
                    <feColorMatrix type="saturate" values="0" />
                </filter>
                <rect width="100%" height="100%" filter="url(#grain)" />
            </svg>
        </div>
    );
}
