import React, { useRef, useMemo, useEffect } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame } from '@react-three/fiber';
import { Environment, ContactShadows, RoundedBox } from '@react-three/drei';
import PropTypes from 'prop-types';

const PIPS = {
  1: [4],
  2: [0, 8],
  3: [0, 4, 8],
  4: [0, 2, 6, 8],
  5: [0, 2, 4, 6, 8],
  6: [0, 2, 3, 5, 6, 8],
};

const createDiceTexture = (value) => {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');

  // Completely transparent background
  ctx.clearRect(0, 0, 512, 512);

  const pips = PIPS[value] || [];

  // Large margins to cluster the dots tightly in the center, accommodating the extremely rounded corners
  const margin = 110;
  const size = 512 - margin * 2;
  const cellSize = size / 2;

  pips.forEach(index => {
    const col = index % 3;
    const row = Math.floor(index / 3);
    const x = margin + col * cellSize;
    const y = margin + row * cellSize;

    const isRed = value === 1;
    // Smaller pips to match the reference style
    const pipRadius = isRed ? 70 : 38;

    // Solid dark color for the hole
    ctx.beginPath();
    ctx.arc(x, y, pipRadius, 0, Math.PI * 2);
    ctx.fillStyle = isRed ? '#a00000' : '#080808';
    ctx.fill();

    // Sharp dark rim for embedded look
    ctx.beginPath();
    ctx.arc(x, y, pipRadius, 0, Math.PI * 2);
    ctx.lineWidth = pipRadius * 0.2;
    ctx.strokeStyle = isRed ? '#500000' : '#000000';
    ctx.stroke();

    // Very tiny specular highlight to simulate the glossy lip of the hole
    ctx.beginPath();
    ctx.arc(x, y, pipRadius, 0, Math.PI * 2);
    const lightGrad = ctx.createLinearGradient(x - pipRadius, y - pipRadius, x + pipRadius, y + pipRadius);
    lightGrad.addColorStop(0.7, 'rgba(255,255,255,0)');
    lightGrad.addColorStop(0.9, 'rgba(255,255,255,0.3)');
    lightGrad.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = lightGrad;
    ctx.fill();
  });

  const texture = new THREE.CanvasTexture(canvas);
  texture.anisotropy = 16;
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
};

const Die3D = ({ value, rolling, index }) => {
  const meshRef = useRef();
  const groupRef = useRef();

  const pipMaterials = useMemo(() => {
    // Generate materials for faces 1 through 6
    return [1, 2, 3, 4, 5, 6].map(val => {
      const tex = createDiceTexture(val);
      return new THREE.MeshPhysicalMaterial({
        map: tex,
        transparent: true,
        roughness: 0.05,
        metalness: 0.0,
        clearcoat: 1.0,
        clearcoatRoughness: 0.0,
        depthWrite: false,
        polygonOffset: true,
        polygonOffsetFactor: -1,
      });
    });
  }, []);

  // Clustered triangular arrangement for a more realistic casino feel
  const baseStartPos = useMemo(() => {
    if (index === 0) return new THREE.Vector3(-1.3, 0.9, 0.8);
    if (index === 1) return new THREE.Vector3(1.3, 0.9, 0.8);
    return new THREE.Vector3(0, 0.9, -1.3);
  }, [index]);
  
  const targetPos = useRef(baseStartPos.clone());
  const currentPos = useRef(baseStartPos.clone());
  const velocity = useRef(new THREE.Vector3(0, 0, 0));
  const angularVelocity = useRef(new THREE.Vector3(0, 0, 0));
  const targetRotationGroup = useRef(new THREE.Euler(0, 0, 0));
  const targetRotationMesh = useRef(new THREE.Euler(0, 0, 0));

  const prevRolling = useRef(rolling);

  useEffect(() => {
    if (rolling && !prevRolling.current) {
      // Start roll: Explosive pop from near the floor
      currentPos.current.set(baseStartPos.x, 0.5, baseStartPos.z);

      velocity.current.set(
        (Math.random() - 0.5) * 16, // Stronger horizontal burst
        22 + Math.random() * 8,     // Higher vertical toss
        (Math.random() - 0.5) * 16
      );

      // Extremely fast chaotic spin
      angularVelocity.current.set(
        (Math.random() > 0.5 ? 1 : -1) * (15 + Math.random() * 20),
        (Math.random() > 0.5 ? 1 : -1) * (15 + Math.random() * 20),
        (Math.random() > 0.5 ? 1 : -1) * (15 + Math.random() * 20)
      );
    } else if (!rolling) {
      // End roll: Calculate mathematically perfect target rotations for the top face
      const tMesh = new THREE.Euler(0, 0, 0);
      switch (value) {
        case 1: tMesh.set(0, 0, 0); break;
        case 6: tMesh.set(Math.PI, 0, 0); break;
        case 2: tMesh.set(-Math.PI / 2, 0, 0); break;
        case 5: tMesh.set(Math.PI / 2, 0, 0); break;
        case 3: tMesh.set(0, 0, Math.PI / 2); break;
        case 4: tMesh.set(0, 0, -Math.PI / 2); break;
        default: break;
      }
      targetRotationMesh.current.copy(tMesh);

      // Organic resting pose: small random tilt and scattered position
      const baseYaw = Math.floor(Math.random() * 4) * (Math.PI / 2);
      const yawJitter = (Math.random() - 0.5) * 0.7; // Slightly more messy rotation
      targetRotationGroup.current.set(0, baseYaw + yawJitter, 0);

      // Randomize the resting position so they don't land perfectly aligned every time
      targetPos.current.set(
        baseStartPos.x + (Math.random() - 0.5) * 0.6,
        0.9, // Ground level for 1.8 cube
        baseStartPos.z + (Math.random() - 0.5) * 0.6
      );
    }
    prevRolling.current = rolling;
  }, [rolling, value, index, baseStartPos]);

  useFrame((state, delta) => {
    if (!meshRef.current || !groupRef.current) return;

    const dt = Math.min(delta, 0.1); // Clamp dt for lag spikes

    if (rolling) {
      velocity.current.y -= 60 * dt; // Stronger gravity for "heavy" casino dice
      currentPos.current.addScaledVector(velocity.current, dt);

      // Floor collision (radius is 0.9 for 1.8 box)
      if (currentPos.current.y < 0.9) {
        currentPos.current.y = 0.9;
        velocity.current.y *= -0.4; // Less bouncy, heavier thud
        velocity.current.x *= 0.75; // More friction on felt
        velocity.current.z *= 0.75;

        // Impart a chaotic spin "kick" when hitting the table
        angularVelocity.current.x += (Math.random() - 0.5) * 18;
        angularVelocity.current.z += (Math.random() - 0.5) * 18;
      }

      // Wall collision bounds
      const boundX = 3.5;
      const boundZ = 2.5;

      if (Math.abs(currentPos.current.x) > boundX) {
        currentPos.current.x = Math.sign(currentPos.current.x) * boundX;
        velocity.current.x *= -0.6;
        angularVelocity.current.y += (Math.random() - 0.5) * 15; // Spin kick
      }
      if (Math.abs(currentPos.current.z) > boundZ) {
        currentPos.current.z = Math.sign(currentPos.current.z) * boundZ;
        velocity.current.z *= -0.6;
        angularVelocity.current.x += (Math.random() - 0.5) * 15; // Spin kick
      }

      groupRef.current.position.copy(currentPos.current);

      meshRef.current.rotation.x += angularVelocity.current.x * dt;
      meshRef.current.rotation.y += angularVelocity.current.y * dt;
      meshRef.current.rotation.z += angularVelocity.current.z * dt;

      angularVelocity.current.multiplyScalar(0.98); // Air/surface friction
    } else {
      // Cinematic organic settle: slightly softer lerp multiplier for a more physical snap
      groupRef.current.position.lerp(targetPos.current, 8 * dt);

      const targetQuatGroup = new THREE.Quaternion().setFromEuler(targetRotationGroup.current);
      groupRef.current.quaternion.slerp(targetQuatGroup, 8 * dt);

      const targetQuatMesh = new THREE.Quaternion().setFromEuler(targetRotationMesh.current);
      meshRef.current.quaternion.slerp(targetQuatMesh, 10 * dt);

      currentPos.current.copy(groupRef.current.position);
    }
  });

  return (
    <group ref={groupRef}>
      <group ref={meshRef}>
        <RoundedBox args={[1.8, 1.8, 1.8]} radius={0.45} smoothness={16} castShadow receiveShadow>
          <meshPhysicalMaterial 
            color="#f6f2e4" // Beautiful ivory/bone color matching the reference
            roughness={0.05} // Extremely glossy
            metalness={0.0} 
            clearcoat={1.0} 
            clearcoatRoughness={0.02} 
          />
        </RoundedBox>

        {/* Explicitly positioned planes for each face guarantee perfect mapping regardless of Geometry internals */}
        {/* Top Face (+Y) -> Value 1 */}
        <mesh position={[0, 0.901, 0]} rotation={[-Math.PI / 2, 0, 0]} material={pipMaterials[0]}>
          <planeGeometry args={[1.3, 1.3]} />
        </mesh>
        {/* Bottom Face (-Y) -> Value 6 */}
        <mesh position={[0, -0.901, 0]} rotation={[Math.PI / 2, 0, 0]} material={pipMaterials[5]}>
          <planeGeometry args={[1.3, 1.3]} />
        </mesh>
        {/* Right Face (+X) -> Value 3 */}
        <mesh position={[0.901, 0, 0]} rotation={[0, Math.PI / 2, 0]} material={pipMaterials[2]}>
          <planeGeometry args={[1.3, 1.3]} />
        </mesh>
        {/* Left Face (-X) -> Value 4 */}
        <mesh position={[-0.901, 0, 0]} rotation={[0, -Math.PI / 2, 0]} material={pipMaterials[3]}>
          <planeGeometry args={[1.3, 1.3]} />
        </mesh>
        {/* Front Face (+Z) -> Value 2 */}
        <mesh position={[0, 0, 0.901]} rotation={[0, 0, 0]} material={pipMaterials[1]}>
          <planeGeometry args={[1.3, 1.3]} />
        </mesh>
        {/* Back Face (-Z) -> Value 5 */}
        <mesh position={[0, 0, -0.901]} rotation={[0, Math.PI, 0]} material={pipMaterials[4]}>
          <planeGeometry args={[1.3, 1.3]} />
        </mesh>
      </group>
    </group>
  );
};

export default function DiceTray({ dice, rolling, total, result }) {
  const validDice = Array.isArray(dice) ? dice : [1, 1, 1];
  const displayTotal = total ?? validDice.reduce((sum, val) => sum + val, 0);

  return (
    <div className="bg-gradient-to-br from-sicbo-green-dark/80 to-sicbo-green/60 border-2 border-sicbo-gold-dark/50 rounded-2xl py-6 px-5 text-center relative shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
      <div className="text-[0.6rem] tracking-[0.3em] text-sicbo-gold/80 mb-3 font-bold">
        🎲 ROLL RESULT
      </div>

      <div style={{ height: 220, width: '100%', position: 'relative' }}>
        <Canvas shadows camera={{ position: [0, 8, 4.5], fov: 40 }}>
          <ambientLight intensity={0.7} />
          <directionalLight
            castShadow
            position={[5, 10, 5]}
            intensity={1.2}
            shadow-mapSize-width={1024}
            shadow-mapSize-height={1024}
            shadow-camera-near={0.5}
            shadow-camera-far={25}
            shadow-camera-left={-10}
            shadow-camera-right={10}
            shadow-camera-top={10}
            shadow-camera-bottom={-10}
          />
          <Environment preset="apartment" />

          <group position={[0, -1, 0]}>
            {validDice.map((v, i) => (
              <Die3D key={i} value={v} rolling={rolling} index={i} />
            ))}
          </group>

          <ContactShadows position={[0, 0.01, 0]} opacity={0.5} scale={20} blur={1.5} far={10} />
        </Canvas>
      </div>

      <div className="mt-2 min-h-[60px] flex flex-col items-center justify-center transition-all duration-300">
        {result?.error ? (
          <div className="text-red-400 text-sm tracking-wider animate-pulse font-bold">
            ⚠ {result.error}
          </div>
        ) : result ? (
          <>
            <div className="text-xs text-sicbo-text-muted tracking-[0.15em] mb-1">
              Total:{" "}
              <span className="text-[#f0d080] text-xl font-bold ml-1 inline-block transition-all duration-300">
                {displayTotal}
              </span>
              {result.isTriple && <span className="text-red-500 ml-2">🔴 Triple!</span>}
            </div>
            <div
              className={`text-2xl font-black tracking-wider transition-all duration-500 ${
                result.won
                  ? "text-[#f0d080] [text-shadow:0_0_24px_rgba(240,208,128,0.6)] animate-pulse"
                  : "text-red-600/80"
              }`}
            >
              {result.won ? `🎉 YOU WIN! +${result.payout}` : "✗ LOSE"}
            </div>
          </>
        ) : (
          <div className="text-xs text-sicbo-text-muted tracking-[0.15em] flex items-center justify-center h-full">
            Total:{" "}
            <span
              className="text-[#f0d080] text-2xl font-bold ml-2 inline-block min-w-[3rem] transition-all duration-300"
              aria-live="polite"
            >
              {displayTotal}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

DiceTray.propTypes = {
  dice: PropTypes.arrayOf(PropTypes.oneOf([1, 2, 3, 4, 5, 6])),
  rolling: PropTypes.bool,
  total: PropTypes.number,
  result: PropTypes.object,
};

DiceTray.defaultProps = {
  dice: [1, 1, 1],
  rolling: false,
  total: null,
  result: null,
};
