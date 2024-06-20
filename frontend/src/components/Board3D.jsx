import React, {useRef, useEffect} from 'react';
import { useGameContext } from '../contexts/GameContext.tsx';
import { Canvas, useFrame, useLoader } from '@react-three/fiber'
import { Text, OrbitControls, Plane } from "@react-three/drei";
import * as THREE from 'three';
import TWEEN from '@tweenjs/tween.js';

const Field = ({cellId, position}) => {
  const { gameState } = useGameContext();
  const square = gameState.squares[cellId];

  return (
    <mesh position={position}>
      <Plane position={[0, 0, 0.01]} args={[5, 5]}>
      <mesh position={[0,1,0.01]}>
        <Text scale={[0.35,0.35,0.35]} color="black" maxWidth="12" anchorY="top">{square.pricetext}</Text>
      </mesh>
      </Plane>

      <Plane position={[0, 2, 0.02]} args={[5, 1]}>
        <meshStandardMaterial color={square.color} />
        <mesh position={[0,0,0.01]}>
          <Text scale={[0.6,0.6,0.6]} color="black">{square.name}</Text>
        </mesh>
      </Plane>

    {square.house > 0 && (
      <mesh scale={[0.7, 0.7, 0.7]} position={[-2, 2, 0.35]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="green" />
        <mesh position={[0, 0, 0.85]}>
        <cylinderGeometry args={[0.7, 0.7, 1, 3]} />
        <meshStandardMaterial color="green" />
        </mesh>
      </mesh>
    )}

    {square.house === 2 && (
      <mesh scale={[0.7, 0.7, 0.7]} position={[-1, 2, 0.35]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="green" />
        <mesh position={[0, 0, 0.85]}>
        <cylinderGeometry args={[0.7, 0.7, 1, 3]} />
        <meshStandardMaterial color="green" />
        </mesh>
      </mesh>
    )}
    </mesh>
  );
};

const CommunityChestField = ({cellId, position}) => {
  const texture = useLoader(THREE.TextureLoader, "ereignisfeld.png");

  return (
    <mesh position={position}>
      <mesh position={[0,0,0.01]}>
        <planeGeometry args={[5, 5]} />
        <meshBasicMaterial map={texture} />
      </mesh>   
    </mesh>
  );
};

const Figure = ({position, offset, color}) => {
  const ref = useRef();

  const moveTo = (newPosition) => {
    new TWEEN.Tween(ref.current.position)
      .to(newPosition, 1000) // Move to the new position in 1 second
      .easing(TWEEN.Easing.Quadratic.Out)
      .start();
  };

  useEffect(() => {
    const targetPosition = {x: position.x + offset.x, y: position.y + offset.y, z: 0.6};
    moveTo(targetPosition);
  }, [position, offset]);

  return (
    <mesh ref={ref} scale={[0.6, 0.6, 0.6]} position={[7.5 + offset.x, -7.5 + offset.y, 0.6]} rotation={[Math.PI / 2, 0, 0]}>
      <coneGeometry args={[1, 2, 32]} />
      <meshStandardMaterial color={color} />
    </mesh>
  );
};

function Tween() {
  useFrame(() => {
    TWEEN.update();
  });
};

const Board = () => {
  const { gameState } = useGameContext();

  const POSITIONS = [
    new THREE.Vector3(7.5, -7.5, 0),
    new THREE.Vector3(2.5, -7.5, 0),
    new THREE.Vector3(-2.5, -7.5, 0),
    new THREE.Vector3(-7.5, -7.5, 0),
    new THREE.Vector3(-7.5, -2.5, 0),
    new THREE.Vector3(-7.5, 2.5, 0),
    new THREE.Vector3(-7.5, 7.5, 0),
    new THREE.Vector3(-2.5, 7.5, 0),
    new THREE.Vector3(2.5, 7.5, 0),
    new THREE.Vector3(7.5, 7.5, 0),
    new THREE.Vector3(7.5, 2.5, 0),
    new THREE.Vector3(7.5, -2.5, 0)
  ];

  const OFFSETS = gameState.players.map((player, index) => ({ x: 1.3 * ((index - 1) % 3) - 1.8, y: index >= 4 ? -1.3 : 0 }));

  return (
    <Canvas style={{height: "100vh", width: "100vw"}} camera={{ fov: 75, near: 0.1, far: 1000, position: [0, 0, 15] }}>
        <ambientLight intensity={Math.PI / 2} />
        <pointLight position={[-10, -10, -10]} decay={0} intensity={Math.PI} />
        {/*Board*/}
        <mesh>
          <planeGeometry args={[20, 20]} />
          <meshStandardMaterial color="lightgrey" />
        </mesh>
        <Field cellId={0} position={POSITIONS[0]} />
        <Field cellId={1} position={POSITIONS[1]} />
        <Field cellId={2} position={POSITIONS[2]} />
        <CommunityChestField cellId={3} position={POSITIONS[3]} />
        <Field cellId={4} position={POSITIONS[4]} />
        <Field cellId={5} position={POSITIONS[5]} />
        <Field cellId={6} position={POSITIONS[6]} />
        <Field cellId={7} position={POSITIONS[7]} />
        <Field cellId={8} position={POSITIONS[8]} />
        <CommunityChestField cellId={9} position={POSITIONS[9]} />
        <Field cellId={10} position={POSITIONS[10]} />
        <Field cellId={11} position={POSITIONS[11]} />
        <OrbitControls />
        <Tween />
        {gameState.players.map((p, id) => (
          id > 0 && (
            <Figure key={id} position={POSITIONS[p.position]} offset={OFFSETS[id]} color={p.color} />
          )
        ))}
    </Canvas>
  );

  
};

export default Board;