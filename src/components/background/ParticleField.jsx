import { useRef, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Color } from 'three';
import useMouse from '../../hooks/useMouse';
import { heroScrollState } from '../../utils/math';

export default function ParticleField() {
    const pointsRef = useRef();
    const mouseRef = useMouse();
    const { viewport } = useThree();

    const count = typeof window !== 'undefined' && window.innerWidth < 768 ? 100 : 200;

    const [positions, colors, randoms] = useMemo(() => {
        const p = new Float32Array(count * 3);
        const c = new Float32Array(count * 3);
        const r = new Float32Array(count * 2);

        const cW = new Color('#ffffff');
        const cP = new Color('#a070ff');
        const cC = new Color('#00c8ff');

        for (let i = 0; i < count; i++) {
            p[i * 3] = (Math.random() - 0.5) * 50;
            p[i * 3 + 1] = (Math.random() - 0.5) * 50;
            p[i * 3 + 2] = (Math.random() - 0.5) * 20 - 5;

            const rn = Math.random();
            let col = cW;
            if (rn < 0.05) col = cP;
            else if (rn < 0.1) col = cC;

            c[i * 3] = col.r;
            c[i * 3 + 1] = col.g;
            c[i * 3 + 2] = col.b;

            r[i * 2] = Math.random() * 2 + 0.5;
            r[i * 2 + 1] = Math.random() * Math.PI * 2;
        }
        return [p, c, r];
    }, [count]);

    const uniforms = useMemo(() => ({
        uTime: { value: 0 },
        uMouse: { value: [0, 0] },
        uScroll: { value: 0 }
    }), []);

    useFrame((state) => {
        uniforms.uTime.value = state.clock.elapsedTime;
        uniforms.uScroll.value = heroScrollState.progress * 15;

        const mState = mouseRef.current;
        if (mState) {
            const mx = ((mState.x / window.innerWidth) * 2 - 1) * (viewport.width / 2);
            const my = (-(mState.y / window.innerHeight) * 2 + 1) * (viewport.height / 2);

            const cmx = uniforms.uMouse.value[0];
            const cmy = uniforms.uMouse.value[1];
            uniforms.uMouse.value[0] += (mx - cmx) * 0.1;
            uniforms.uMouse.value[1] += (my - cmy) * 0.1;
        }
    });

    const vertexShader = `
    uniform float uTime;
    uniform float uScroll;
    uniform vec2 uMouse;
    
    attribute vec3 color;
    attribute vec2 randoms;
    
    varying vec3 vColor;
    varying float vAlpha;
    
    void main() {
        vColor = color;
        
        vec3 pos = position;
        pos.y += uScroll;
        
        float halfBox = 25.0;
        pos.y = mod(pos.y + halfBox, halfBox * 2.0) - halfBox;
        
        vec2 d = pos.xy - uMouse;
        float dist = length(d);
        if (dist < 4.0) {
            float force = (4.0 - dist) / 4.0;
            force = pow(force, 2.0);
            pos.xy += normalize(d) * force * 1.5;
        }

        vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
        gl_Position = projectionMatrix * mvPosition;
        
        gl_PointSize = (randoms.x * 1.5 + 1.0) * (2.0 / -mvPosition.z);
        
        vAlpha = (sin(uTime * randoms.x * 0.4 + randoms.y) * 0.5 + 0.5) * 0.15 + 0.05;
    }
  `;

    const fragmentShader = `
    varying vec3 vColor;
    varying float vAlpha;
    void main() {
        float d = distance(gl_PointCoord, vec2(0.5));
        if (d > 0.5) discard;
        float a = (0.5 - d) * 2.0;
        gl_FragColor = vec4(vColor, vAlpha * a);
    }
  `;

    return (
        <points ref={pointsRef}>
            <bufferGeometry>
                <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} />
                <bufferAttribute attach="attributes-color" count={count} array={colors} itemSize={3} />
                <bufferAttribute attach="attributes-randoms" count={count} array={randoms} itemSize={2} />
            </bufferGeometry>
            <shaderMaterial
                vertexShader={vertexShader}
                fragmentShader={fragmentShader}
                uniforms={uniforms}
                transparent={true}
                depthWrite={false}
            />
        </points>
    );
}
