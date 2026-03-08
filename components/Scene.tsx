"use client";

import { Canvas } from "@react-three/fiber";
import { Sky, PointerLockControls } from "@react-three/drei";
import LocalPlayer from "./LocalPlayer";
import RemotePlayers from "./RemotePlayers";
import ChatOverlay from "./ChatOverlay";

export default function Scene() {
  return (
    <div className="w-full h-full relative">
      <Canvas shadows camera={{ fov: 75, position: [0, 1.5, 0] }}>
        <Sky sunPosition={[100, 20, 100]} />
        <ambientLight intensity={0.5} />
        <pointLight castShadow intensity={0.8} position={[100, 100, 100]} />

        {/* Ground */}
        <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]}>
          <planeGeometry args={[100, 100]} />
          <meshStandardMaterial color="#4ade80" />
        </mesh>

        <LocalPlayer />
        <RemotePlayers />
        
        {/* Simple cursor lock to look around */}
        <PointerLockControls />
      </Canvas>
      <ChatOverlay />
      {/* Target Crosshair */}
      <div className="absolute top-1/2 left-1/2 w-2 h-2 bg-white rounded-full -translate-x-1/2 -translate-y-1/2 pointer-events-none mix-blend-difference" />
      {/* Help Text */}
      <div className="absolute top-4 left-4 text-white text-sm bg-black/50 p-2 rounded pointer-events-none">
        Click to look around. WASD to move. Esc to release cursor.
      </div>
    </div>
  );
}
