import { MeshReflectorMaterial } from '@react-three/drei';

export default function FloorReflection() {
    return (
        <mesh position={[0, -7.1, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[40, 40]} />
            <MeshReflectorMaterial
                resolution={512}
                mixBlur={8}
                mixStrength={0.4}
                depthScale={1}
                minDepthThreshold={0.4}
                maxDepthThreshold={1.0}
                color="#050510"
                metalness={0.9}
                roughness={0.05}
                mirror={1}
            />
        </mesh>
    );
}
