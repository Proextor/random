import { useEffect } from 'react';
import Lenis from '@studio-freight/lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

export default function useLenis() {
    useEffect(() => {
        let lenis;
        let frame;

        frame = requestAnimationFrame(() => {
            lenis = new Lenis({
                lerp: 0.08,
                duration: 1.4,
                easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t))
            });

            const onFrame = (time) => {
                lenis.raf(time);
                frame = requestAnimationFrame(onFrame);
            }
            frame = requestAnimationFrame(onFrame);

            lenis.on('scroll', ScrollTrigger.update);
            gsap.ticker.add((time) => { lenis.raf(time * 1000) });
            gsap.ticker.lagSmoothing(0);
        });

        return () => {
            cancelAnimationFrame(frame);
            if (lenis) lenis.destroy();
            gsap.ticker.remove();
        };
    }, []);

    return null;
}
