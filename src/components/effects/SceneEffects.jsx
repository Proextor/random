import { useEffect, useRef } from 'react';
import { EffectComposer, DepthOfField, Bloom, ChromaticAberration, Vignette } from '@react-three/postprocessing';
import { useFrame } from '@react-three/fiber';
import { Vector2, MathUtils } from 'three';
import useMouse from '../../hooks/useMouse';

export default function SceneEffects() {
    const chromRef = useRef(null);
    const dofRef = useRef(null);
    const mouseRef = useMouse();

    useFrame(() => {
        const state = mouseRef.current;
        if (!state) return;

        const isDragging = !state.hovering && (Math.abs(state.vx) > 0 || Math.abs(state.vy) > 0);
        const vel = Math.sqrt(state.vx * state.vx + state.vy * state.vy);

        if (chromRef.current && chromRef.current.offset) {
            const targetOffset = 0.0008 + Math.min(vel * 0.0005, 0.0022);
            const currentRef = chromRef.current.offset;
            currentRef.x += (targetOffset - currentRef.x) * 0.1;
            currentRef.y += (targetOffset - currentRef.y) * 0.1;
        }

        if (dofRef.current) {
            const targetFocal = isDragging && vel > 1 ? 0.032 : 0.018;
            dofRef.current.focalLength = MathUtils.lerp(dofRef.current.focalLength, targetFocal, 0.1);
        }
    });

    return (
        <EffectComposer multisampling={0}>
            <DepthOfField ref={dofRef} focusDistance={0} focalLength={0.018} bokehScale={3.2} height={480} />
            <Bloom intensity={0.4} luminanceThreshold={0.7} luminanceSmoothing={0.3} mipmapBlur />
            <ChromaticAberration ref={chromRef} offset={new Vector2(0.0008, 0.0008)} />
            <Vignette eskil={false} offset={0.15} darkness={0.7} />
        </EffectComposer>
    );
}
