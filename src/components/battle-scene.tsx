"use client";

import { useEffect, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { ContactShadows, Environment, Float, Sparkles } from "@react-three/drei";
import * as THREE from "three";

type BattleSceneProps = { attackKey?: number; attackType?: string };

function DragonActor() {
  const root = useRef<THREE.Group>(null);
  const wings = useRef<THREE.Group>(null);
  const tail = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (root.current) root.current.position.y = Math.sin(t * 2.2) * 0.055;
    if (wings.current) wings.current.rotation.z = Math.sin(t * 3.1) * 0.16;
    if (tail.current) tail.current.rotation.x = Math.sin(t * 2.4) * 0.13;
  });
  return (
    <group ref={root} position={[-2.65, 0, 0.65]} rotation={[0, 0.38, 0]} scale={0.88}>
      <mesh castShadow position={[0, 1.12, 0]}><capsuleGeometry args={[0.48, 0.72, 7, 12]} /><meshStandardMaterial color="#14263a" roughness={0.34} metalness={0.48} /></mesh>
      <mesh castShadow position={[0, 1.18, 0.39]} scale={[0.72, 0.78, 0.28]}><sphereGeometry args={[0.55, 20, 16]} /><meshStandardMaterial color="#27a8c8" emissive="#07516c" emissiveIntensity={0.45} metalness={0.35} roughness={0.25} /></mesh>
      <group position={[0, 1.95, 0.14]}>
        <mesh castShadow><sphereGeometry args={[0.37, 20, 18]} /><meshStandardMaterial color="#17283d" metalness={0.4} roughness={0.28} /></mesh>
        <mesh position={[0, -0.13, 0.31]} rotation={[Math.PI / 2, 0, 0]}><coneGeometry args={[0.18, 0.42, 12]} /><meshStandardMaterial color="#1b3148" /></mesh>
        {[-1, 1].map(side => <mesh key={side} position={[side * 0.22, 0.34, -0.08]} rotation={[0, 0, side * -0.34]}><coneGeometry args={[0.085, 0.42, 8]} /><meshStandardMaterial color="#0e1b2b" metalness={0.5} /></mesh>)}
        <mesh position={[-0.15, 0.04, 0.32]}><sphereGeometry args={[0.055, 12, 12]} /><meshBasicMaterial color="#7be7ff" /></mesh>
        <mesh position={[0.15, 0.04, 0.32]}><sphereGeometry args={[0.055, 12, 12]} /><meshBasicMaterial color="#7be7ff" /></mesh>
      </group>
      <group ref={wings} position={[0, 1.55, -0.25]}>
        {[-1, 1].map(side => <group key={side} position={[side * 0.45, 0.15, 0]} rotation={[0, 0, side * 0.2]}>
          <mesh position={[side * 0.64, 0.12, 0]} rotation={[0, 0, side * -0.22]}><boxGeometry args={[1.45, 0.11, 0.08]} /><meshStandardMaterial color="#0d1929" metalness={0.5} /></mesh>
          <mesh position={[side * 0.94, -0.22, -0.02]} rotation={[0, 0, side * -0.16]}><boxGeometry args={[1.05, 0.92, 0.045]} /><meshStandardMaterial color="#087caa" emissive="#03415e" emissiveIntensity={0.7} side={THREE.DoubleSide} transparent opacity={0.92} /></mesh>
        </group>)}
      </group>
      <group ref={tail} position={[0, 0.72, -0.38]}>
        <mesh position={[0, 0, -0.48]} rotation={[-0.65, 0, 0]}><coneGeometry args={[0.19, 1.05, 10]} /><meshStandardMaterial color="#17283a" /></mesh>
        <Float speed={4} floatIntensity={0.2}><mesh position={[0, 0.08, -1.02]}><dodecahedronGeometry args={[0.27, 1]} /><meshStandardMaterial color="#70e4ff" emissive="#00a6e0" emissiveIntensity={2.1} /></mesh></Float>
      </group>
      {[-0.31, 0.31].map(side => <mesh key={side} position={[side, 0.35, 0.08]} castShadow><capsuleGeometry args={[0.17, 0.42, 4, 8]} /><meshStandardMaterial color="#13253a" /></mesh>)}
      <pointLight position={[0, 1.7, 0.9]} color="#27c8f4" intensity={1.6} distance={3.5} />
    </group>
  );
}

function PsychicActor() {
  const root = useRef<THREE.Group>(null);
  const ring = useRef<THREE.Mesh>(null);
  const tail = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (root.current) root.current.position.y = 0.22 + Math.sin(t * 1.9 + 1) * 0.16;
    if (ring.current) { ring.current.rotation.x = Math.PI / 2 + Math.sin(t) * 0.12; ring.current.rotation.z = t * 0.5; }
    if (tail.current) tail.current.rotation.y = Math.sin(t * 1.7) * 0.3;
  });
  return (
    <group ref={root} position={[2.65, 0, -0.6]} rotation={[0, -0.48, 0]} scale={0.82}>
      <mesh position={[0, 1.12, 0]} castShadow><capsuleGeometry args={[0.34, 0.76, 8, 12]} /><meshStandardMaterial color="#7764a9" roughness={0.26} metalness={0.35} /></mesh>
      <mesh position={[0, 1.2, 0.28]} scale={[0.62, 0.8, 0.28]}><sphereGeometry args={[0.42, 18, 16]} /><meshStandardMaterial color="#a99bda" emissive="#38256e" emissiveIntensity={0.45} /></mesh>
      <group position={[0, 1.92, 0.04]}>
        <mesh><sphereGeometry args={[0.33, 20, 18]} /><meshStandardMaterial color="#9887c8" roughness={0.25} /></mesh>
        {[-1, 1].map(side => <mesh key={side} position={[side * 0.24, 0.24, -0.02]} rotation={[0, 0, side * -0.32]}><coneGeometry args={[0.11, 0.52, 8]} /><meshStandardMaterial color="#8070b7" /></mesh>)}
        {[-1, 1].map(side => <mesh key={side} position={[side * 0.14, 0.02, 0.29]}><boxGeometry args={[0.09, 0.045, 0.035]} /><meshBasicMaterial color="#f2d9ff" /></mesh>)}
      </group>
      <group ref={tail} position={[0, 0.85, -0.32]}>
        {[0, 1, 2, 3].map(i => <mesh key={i} position={[0, -i * 0.1, -0.36 - i * 0.22]} rotation={[0.25, 0, 0]}><sphereGeometry args={[0.22 - i * 0.035, 12, 10]} /><meshStandardMaterial color="#7965b5" /></mesh>)}
        <mesh position={[0, -0.32, -1.22]}><sphereGeometry args={[0.12, 12, 12]} /><meshStandardMaterial color="#d5b7ff" emissive="#9c55ff" emissiveIntensity={1.4} /></mesh>
      </group>
      <mesh ref={ring} position={[0, 1.1, 0]} rotation={[Math.PI / 2, 0, 0]}><torusGeometry args={[0.9, 0.035, 10, 64]} /><meshStandardMaterial color="#c4a5ff" emissive="#8b5cf6" emissiveIntensity={1.7} /></mesh>
      <pointLight position={[0, 1.7, 0.7]} color="#b58aff" intensity={1.8} distance={3.5} />
    </group>
  );
}

function ArenaFloor() {
  return <group position={[0, -0.38, 0]}>
    <mesh receiveShadow><cylinderGeometry args={[5.4, 5.7, 0.48, 72]} /><meshStandardMaterial color="#111b2b" roughness={0.3} metalness={0.78} /></mesh>
    <mesh position={[0, 0.25, 0]} rotation={[Math.PI / 2, 0, 0]}><torusGeometry args={[5.15, 0.095, 12, 96]} /><meshStandardMaterial color="#f2ae4d" emissive="#a85b0a" emissiveIntensity={0.7} metalness={0.8} /></mesh>
    <mesh position={[0, 0.255, 0]} rotation={[Math.PI / 2, 0, 0]}><torusGeometry args={[3.5, 0.035, 8, 96]} /><meshStandardMaterial color="#39c8f5" emissive="#087ca8" emissiveIntensity={1.4} /></mesh>
    <mesh position={[0, 0.26, 0]} rotation={[Math.PI / 2, 0, 0]}><torusGeometry args={[1.35, 0.025, 8, 72]} /><meshBasicMaterial color="#b5dfff" transparent opacity={0.55} /></mesh>
  </group>;
}

function AttackEffect({ attackKey, attackType }: BattleSceneProps) {
  const beam = useRef<THREE.Group>(null);
  const progress = useRef(1);
  useEffect(() => { if (attackKey) progress.current = 0; }, [attackKey]);
  useFrame((_, delta) => {
    if (!beam.current || progress.current >= 1) return;
    progress.current = Math.min(1, progress.current + delta * 1.45);
    const p = progress.current;
    beam.current.visible = p < 0.92;
    beam.current.position.set(-2.55 + p * 5.1, 1.25 + Math.sin(p * Math.PI) * 0.45, 0.2 - p * 0.45);
    beam.current.scale.setScalar(0.7 + Math.sin(p * Math.PI) * 0.7);
  });
  const color = attackType === "Fire" ? "#ff8a3d" : attackType === "Water" ? "#38bdf8" : attackType === "Electric" ? "#facc15" : "#b78aff";
  return <group ref={beam} visible={false}><mesh><sphereGeometry args={[0.34, 16, 16]} /><meshBasicMaterial color={color} /></mesh><mesh rotation={[0, 0, Math.PI / 2]}><cylinderGeometry args={[0.12, 0.12, 1.7, 12]} /><meshBasicMaterial color={color} transparent opacity={0.75} /></mesh><pointLight color={color} intensity={3} distance={3}/></group>;
}

export default function BattleScene({ attackKey = 0, attackType = "Fire" }: BattleSceneProps) {
  return <Canvas camera={{ position: [0, 4.4, 9.2], fov: 43 }} shadows dpr={[1, 1.6]}>
    <color attach="background" args={["#101a2b"]} />
    <fog attach="fog" args={["#101a2b", 9, 19]} />
    <ambientLight intensity={1.05} />
    <hemisphereLight args={["#9edfff", "#172035", 1.1]} />
    <directionalLight position={[3, 8, 5]} intensity={2.2} castShadow shadow-mapSize={[1024, 1024]} />
    <pointLight position={[-5, 3, -3]} color="#37c9ef" intensity={9} />
    <pointLight position={[5, 3, -3]} color="#9c68f3" intensity={8} />
    <ArenaFloor />
    <DragonActor />
    <PsychicActor />
    <AttackEffect attackKey={attackKey} attackType={attackType} />
    <Sparkles count={75} scale={[11, 5, 10]} size={2} speed={0.28} color="#bdeaff" />
    <ContactShadows position={[0, -0.1, 0]} opacity={0.5} scale={11} blur={2.8} far={4} />
    <Environment preset="city" />
  </Canvas>;
}
