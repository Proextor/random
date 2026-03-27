import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { AdditiveBlending } from 'three';

const FogDiscs = ({ count, startY, endY, color, loopTime, minR, maxR }) => {
    const refs = useRef([]);

    useFrame((state) => {
        const t = state.clock.elapsedTime;
        refs.current.forEach((el, i) => {
            if (!el) return;
            const phase = (i / count);
            const localTime = ((t / loopTime) + phase) % 1.0;

            const currentY = startY + (endY - startY) * localTime;
            el.position.y = currentY;
            el.scale.setScalar(1.0 + localTime * 0.4);
            el.material.opacity = 0.04 * (1.0 - localTime);
        });
    });

    return (
        <group>
            {Array(count).fill().map((_, i) => (
                <mesh key={i} ref={el => refs.current[i] = el} rotation={[0, 0, 0]}>
                    <cylinderGeometry args={[minR, maxR, 0.02, 32, 1, true]} />
                    <meshBasicMaterial color={color} transparent opacity={0.04} depthWrite={false} blending={AdditiveBlending} side={2} />
                </mesh>
            ))}
        </group>
    );
};

export default function FogColumn() {
    return (
        <group>
            <FogDiscs count={8} startY={-7} endY={-4} color="#3010a0" loopTime={3.0} minR={0.5} maxR={2.5} />
            <FogDiscs count={3} startY={5} endY={7} color="#0050ff" loopTime={1.5} minR={0.4} maxR={1.0} />
        </group>
    );
}
