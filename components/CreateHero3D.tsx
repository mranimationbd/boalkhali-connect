'use client';
import {useMemo,useRef} from 'react';
import {Canvas,useFrame} from '@react-three/fiber';
import * as THREE from 'three';

type Shape={kind:'ico'|'torus'|'ball'|'box';pos:[number,number,number];scale:number;color:string;speed:number;spin:number;phase:number};

function Rig({reduced}:{reduced:boolean}){
 const group=useRef<THREE.Group>(null);
 const shapes=useMemo<Shape[]>(()=>[
  {kind:'ico',  pos:[-3.4, 1.0,-1.0],scale:0.95,color:'#34d399',speed:0.90,spin:0.25,phase:0.0},
  {kind:'torus',pos:[ 3.2, 1.2,-2.0],scale:0.80,color:'#fef3c7',speed:0.70,spin:0.30,phase:1.4},
  {kind:'ball', pos:[ 2.3,-1.1,-1.0],scale:0.55,color:'#5eead4',speed:1.10,spin:0.00,phase:2.2},
  {kind:'ico',  pos:[-2.1,-1.2,-2.5],scale:0.60,color:'#fbbf24',speed:0.80,spin:0.35,phase:3.1},
  {kind:'torus',pos:[-0.4, 1.4,-3.0],scale:1.10,color:'#a7f3d0',speed:0.60,spin:0.20,phase:0.7},
  {kind:'box',  pos:[ 0.9, 0.1,-1.5],scale:0.50,color:'#fde68a',speed:1.00,spin:0.40,phase:2.8},
  {kind:'ball', pos:[-4.0,-0.9,-3.0],scale:0.40,color:'#99f6e4',speed:1.20,spin:0.00,phase:1.1},
  {kind:'ico',  pos:[ 4.0,-0.7,-2.5],scale:0.50,color:'#6ee7b7',speed:0.85,spin:0.30,phase:4.0},
 ],[]);
 useFrame((state,dt)=>{
  const g=group.current; if(!g) return;
  const px=state.pointer.x, py=state.pointer.y;
  g.rotation.y+=((px*0.22)-g.rotation.y)*Math.min(1,dt*2);
  g.rotation.x+=((-py*0.14)-g.rotation.x)*Math.min(1,dt*2);
  if(reduced) return;
  const t=state.clock.elapsedTime;
  g.children.forEach((m,i)=>{
   const s=shapes[i]; if(!s) return;
   m.position.y=s.pos[1]+Math.sin(t*s.speed+s.phase)*0.28;
   m.rotation.x+=dt*s.spin; m.rotation.y+=dt*s.spin*0.7;
  });
 });
 return <group ref={group}>
  {shapes.map((s,i)=>(
   <mesh key={i} position={s.pos} scale={s.scale}>
    {s.kind==='ico'&&<icosahedronGeometry args={[1,0]}/>}
    {s.kind==='torus'&&<torusGeometry args={[1,0.32,12,28]}/>}
    {s.kind==='ball'&&<sphereGeometry args={[1,24,24]}/>}
    {s.kind==='box'&&<boxGeometry args={[1,1,1]}/>}
    <meshStandardMaterial color={s.color} roughness={0.35} metalness={0.15} flatShading={s.kind==='ico'}/>
   </mesh>
  ))}
 </group>;
}

export default function CreateHero3D(){
 const reduced=typeof window!=='undefined'&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;
 return <Canvas dpr={[1,1.75]} camera={{position:[0,0,8],fov:42}} gl={{antialias:true,alpha:true}} style={{pointerEvents:'none'}}>
  <ambientLight intensity={0.9}/>
  <directionalLight position={[5,6,8]} intensity={1.6}/>
  <directionalLight position={[-6,-2,3]} intensity={0.5} color="#99f6e4"/>
  <Rig reduced={reduced}/>
 </Canvas>;
}
