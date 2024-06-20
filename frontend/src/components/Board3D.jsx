import React, {useRef, useState} from 'react';
import '../styles/Board.css';
import { useGameContext } from '../contexts/GameContext.tsx';
import { Canvas, useFrame, useLoader } from '@react-three/fiber'
import { Text, OrbitControls, Plane, Image } from "@react-three/drei";
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

/*function Box(props) {
  // This reference will give us direct access to the mesh
  const meshRef = useRef()
  // Set up state for the hovered and active state
  const [hovered, setHover] = useState(false)
  const [active, setActive] = useState(false)
  // Subscribe this component to the render-loop, rotate the mesh every frame
  useFrame((state, delta) => (meshRef.current.rotation.x += delta))
  // Return view, these are regular three.js elements expressed in JSX
  return (
    <mesh
      {...props}
      ref={meshRef}
      scale={active ? 1.5 : 1}
      onClick={(event) => setActive(!active)}
      onPointerOver={(event) => setHover(true)}
      onPointerOut={(event) => setHover(false)}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color={hovered ? 'hotpink' : 'orange'} />
    </mesh>
  )
}*/

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
    {/*<table id="board">
      <tbody>
        <tr>
          <Cell cellId={6} type="board-corner" />
          <Cell cellId={7} type="board-top" />
          <Cell cellId={8} type="board-top" />
          <Cell cellId={9} type="board-corner" />
        </tr><tr>
          <Cell cellId={5} type="board-left" />
          <td colSpan="2" type="board-center"></td>
          <Cell cellId={10} type="board-right" />
        </tr><tr>
          <Cell cellId={4} type="board-left" />
          <td colSpan="2" type="board-center"></td>
          <Cell cellId={11} type="board-right" />
        </tr><tr>
          <Cell cellId={3} type="board-corner" />
          <Cell cellId={2} type="board-bottom" />
          <Cell cellId={1} type="board-bottom" />
          <Cell cellId={0} type="board-corner" />
        </tr>
      </tbody>
    </table>*/}
    </Canvas>
  );
};

export default Board;