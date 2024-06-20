import React from 'react';
import { useGameContext } from '../contexts/GameContext.tsx';
import { Canvas, useLoader } from '@react-three/fiber'
import { Text, OrbitControls, Plane } from "@react-three/drei";
import * as THREE from 'three';

const Field = ({cellId, position}) => {
  const { gameState } = useGameContext();
  const square = gameState.squares[cellId];
  var index = 0;

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

      {gameState.players.map((p, id) => (
        id > 0 && p.position === cellId && (
          <mesh scale={[0.6, 0.6, 0.6]} position={[1.3 * (index % 3) - 1.8, index++ >= 3 ? -1.3 : 0, 0.6]} rotation={[Math.PI / 2, 0, 0]}>
            <coneGeometry args={[1, 2, 32]} />
            <meshStandardMaterial color={p.color} />
          </mesh>
        )
      ))}    

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

    {square.house == 2 && (
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
  const { gameState } = useGameContext();
  var index = 0;

  const texture = useLoader(THREE.TextureLoader, "ereignisfeld.png");

  return (
    <mesh position={position}>
      <mesh position={[0,0,0.01]}>
        <planeGeometry args={[5, 5]} />
        <meshBasicMaterial map={texture} />
      </mesh>
      
      {gameState.players.map((p, id) => (
        id > 0 && p.position === cellId && (
          <mesh scale={[0.6, 0.6, 0.6]} position={[1.3 * (index % 3) - 1.8, index++ >= 3 ? -1.3 : 0, 0.6]} rotation={[Math.PI / 2, 0, 0]}>
            <coneGeometry args={[1, 2, 32]} />
            <meshStandardMaterial color={p.color} />
          </mesh>
        )
      ))}    
    </mesh>
  );
};

const Board = () => {
  return (
    <Canvas style={{height: "100vh", width: "100vw"}} camera={{ fov: 75, near: 0.1, far: 1000, position: [0, 0, 15] }}>
        <ambientLight intensity={Math.PI / 2} />
        <pointLight position={[-10, -10, -10]} decay={0} intensity={Math.PI} />
        {/*Board*/}
        <mesh>
          <planeGeometry args={[20, 20]} />
          <meshStandardMaterial color="lightgrey" />
        </mesh>
        <Field cellId={0} position={[7.5, -7.5, 0]} />
        <Field cellId={1} position={[2.5, -7.5, 0]} />
        <Field cellId={2} position={[-2.5, -7.5, 0]} />
        <CommunityChestField cellId={3} position={[-7.5, -7.5, 0]} />
        <Field cellId={4} position={[-7.5, -2.5, 0]} />
        <Field cellId={5} position={[-7.5, 2.5, 0]} />
        <Field cellId={6} position={[-7.5, 7.5, 0]} />
        <Field cellId={7} position={[-2.5, 7.5, 0]} />
        <Field cellId={8} position={[2.5, 7.5, 0]} />
        <CommunityChestField cellId={9} position={[7.5, 7.5, 0]} />
        <Field cellId={10} position={[7.5, 2.5, 0]} />
        <Field cellId={11} position={[7.5, -2.5, 0]} />
        <OrbitControls />
    </Canvas>
  );
};

export default Board;