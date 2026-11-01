"use client";
import { Canvas, useFrame } from "@react-three/fiber";
import { ContactShadows, Environment, Float, Sparkles } from "@react-three/drei";
import { useRef } from "react";
import * as THREE from "three";
function EnergyOrb({ color, position, scale = 1 }: { color: string; position: [number, number, number]; scale?: number }) {
  const group = useRef<THREE.Group>(null);
  useFrame((state, delta) => { if (group.current) { group.current.rotation.y += delta * .55; group.current.rotation.x = Math.sin(state.clock.elapsedTime * .7) * .12; } });
  return <Float speed={1.6} rotationIntensity={.22} floatIntensity={.4}><group ref={group} position={position} scale={scale}>
    <mesh castShadow><icosahedronGeometry args={[.72, 2]} /><meshStandardMaterial color={color} roughness={.28} metalness={.28} /></mesh>
    <mesh rotation={[Math.PI / 2, 0, 0]}><torusGeometry args={[.94, .035, 12, 80]} /><meshStandardMaterial color="#fff2bd" emissive="#e7b85b" emissiveIntensity={1.8} /></mesh>
    <mesh position={[0, .83, 0]}><sphereGeometry args={[.13, 20, 20]} /><meshBasicMaterial color="#fff4c6" /></mesh>
  </group></Float>;
}
function Platform() { return <group rotation={[-Math.PI / 2, 0, 0]} position={[0, -.85, 0]}><mesh receiveShadow><circleGeometry args={[4.7, 80]} /><meshStandardMaterial color="#254a59" roughness={.82} /></mesh><mesh position={[0, 0, .015]}><ringGeometry args={[3.25, 3.34, 80]} /><meshBasicMaterial color="#7bd5ce" transparent opacity={.55} /></mesh><mesh position={[0, 0, .02]}><ringGeometry args={[1.2, 1.23, 80]} /><meshBasicMaterial color="#d9b76a" transparent opacity={.55} /></mesh></group>; }
export default function BattleScene() { return <Canvas camera={{ position: [0, 2.2, 7.2], fov: 43 }} shadows dpr={[1, 1.7]}><color attach="background" args={["#142438"]} /><fog attach="fog" args={["#142438", 8, 17]} /><ambientLight intensity={1.3} /><directionalLight position={[3, 7, 5]} intensity={2.3} castShadow shadow-mapSize={[1024, 1024]} /><pointLight position={[-4, 2, -2]} color="#4bd5ce" intensity={12} /><Platform /><EnergyOrb color="#f1a94d" position={[-1.85, .05, .2]} scale={1.12} /><EnergyOrb color="#6aa9e8" position={[1.85, .15, -.35]} scale={1.08} /><Sparkles count={65} scale={8} size={2.1} speed={.35} color="#c6e9ff" /><ContactShadows position={[0, -.82, 0]} opacity={.45} scale={9} blur={2.8} far={4} /><Environment preset="city" /></Canvas>; }
