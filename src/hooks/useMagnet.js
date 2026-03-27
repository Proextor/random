import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import useMouse from './useMouse';

export default function useMagnet() {
    const mouseRef = useMouse();
    const elementsRef = useRef([]);

    useEffect(() => {
        const updateElements = () => {
            elementsRef.current = Array.from(document.querySelectorAll('.magnetic'));
        };

        updateElements();

        // Watch for dynamically added elements
        const observer = new MutationObserver(updateElements);
        observer.observe(document.body, { childList: true, subtree: true });

        let frame;
        const update = () => {
            const state = mouseRef.current;
            if (!state) return;

            elementsRef.current.forEach((el) => {
                const rect = el.getBoundingClientRect();

                // Reverse GSAP x/y transforms from the element to find its true static center
                const curX = gsap.getProperty(el, 'x') || 0;
                const curY = gsap.getProperty(el, 'y') || 0;

                const centerX = rect.left - curX + rect.width / 2;
                const centerY = rect.top - curY + rect.height / 2;

                const deltaX = state.x - centerX;
                const deltaY = state.y - centerY;
                const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

                if (distance < 120) {
                    const pullX = deltaX * 0.15;
                    const pullY = deltaY * 0.15;

                    const maxPull = 12;
                    const clampedX = Math.max(-maxPull, Math.min(maxPull, pullX));
                    const clampedY = Math.max(-maxPull, Math.min(maxPull, pullY));

                    gsap.to(el, {
                        x: clampedX,
                        y: clampedY,
                        duration: 0.6,
                        ease: 'power3.out',
                        overwrite: 'auto'
                    });
                } else {
                    gsap.to(el, {
                        x: 0,
                        y: 0,
                        duration: 0.8,
                        ease: 'elastic.out(1, 0.3)',
                        overwrite: 'auto'
                    });
                }
            });

            frame = requestAnimationFrame(update);
        };

        frame = requestAnimationFrame(update);

        return () => {
            observer.disconnect();
            cancelAnimationFrame(frame);
        };
    }, [mouseRef]);
}
