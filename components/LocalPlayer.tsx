"use client";

import { useFrame } from "@react-three/fiber";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";

const SPEED = 5;

export default function LocalPlayer() {
  const playerRef = useRef<THREE.Mesh>(null);
  
  const [keys, setKeys] = useState<{ [key: string]: boolean }>({
    KeyW: false,
    KeyA: false,
    KeyS: false,
    KeyD: false,
  });

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => setKeys((k) => ({ ...k, [e.code]: true }));
    const handleKeyUp = (e: KeyboardEvent) => setKeys((k) => ({ ...k, [e.code]: false }));

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  useFrame((state, delta) => {
    if (!playerRef.current) return;

    // Basic movement relative to camera direction
    const velocity = new THREE.Vector3();
    const cameraDirection = new THREE.Vector3();
    state.camera.getWorldDirection(cameraDirection);
    cameraDirection.y = 0;
    cameraDirection.normalize();

    const cameraRight = new THREE.Vector3().crossVectors(state.camera.up, cameraDirection).normalize();

    if (keys.KeyW) velocity.add(cameraDirection);
    if (keys.KeyS) velocity.sub(cameraDirection);
    if (keys.KeyA) velocity.add(cameraRight);
    if (keys.KeyD) velocity.sub(cameraRight);

    if (velocity.length() > 0) {
      velocity.normalize().multiplyScalar(SPEED * delta);
      playerRef.current.position.add(velocity);
      
      // Update camera position to follow player (first-person view)
      state.camera.position.set(
        playerRef.current.position.x,
        playerRef.current.position.y + 0.5,
        playerRef.current.position.z
      );

      const currentPos = playerRef.current.position;
      const coords = [currentPos.x, currentPos.y, currentPos.z];

      import("@/lib/socket").then(({ socket }) => {
        socket.emit("move", coords);
      });
    }
  });

  return (
    <mesh ref={playerRef} castShadow position={[0, 1, 0]}>
      <capsuleGeometry args={[0.5, 1, 4, 8]} />
      <meshStandardMaterial color="hotpink" transparent opacity={0.5} />
    </mesh>
  );
}
