export const heroScrollState = { progress: 0 };
export const helixState = { activeY: 0 };

if (typeof window !== 'undefined') {
    window.SITE_AUDIO = { bass: 0, mid: 0, high: 0 };
}

export const lerp = (start, end, t) => start * (1 - t) + end * t;
export const clamp = (val, min, max) => Math.max(min, Math.min(max, val));
export const mapRange = (value, inMin, inMax, outMin, outMax) => ((value - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin;
