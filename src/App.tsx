import './App.css';
import * as THREE from 'three';
import { Canvas, useFrame, useLoader, useThree } from '@react-three/fiber';
import circleImg from './assets/SphereWireframe.png';
import { useCallback, useMemo, useRef } from 'react';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei'
import Noise from 'noisejs';

const noise = new Noise.Noise();

function Points() {

	const imgTex = useLoader(THREE.TextureLoader, circleImg);

	const bufferRef = useRef(null);

	let t = 0;

	const Velocity = 0.002;

	const Amplitude = 6;

	const graph = useCallback((x: number, z: number) => {

		const y = noise.simplex2(x * 0.02, z * 0.02) * Amplitude; // Adjust the factor as needed

		return (Math.cos(Velocity * (x ** 2 + z ** 2 + t)) * y);

		// return (Math.cos(f * (x ** 2 + z ** 2 + t)) * a) ;

	}, [t, Velocity, Amplitude])

	const count = 200

	const Separation = 1.5

	const positions = useMemo(() => {

		const positions = []

		for (let xi = 0; xi < count; xi++) {

			for (let zi = 0; zi < count; zi++) {

				const x = Separation * (xi - count / 2);

				const z = Separation * (zi - count / 2);

				const y = graph(x, z);

				positions.push(x, y, z);

			}

		}

		return new Float32Array(positions);

	}, [count, Separation, graph])

	useFrame((state, delta) => {

		t += 10
		
		if (bufferRef.current !== null) {
			
				const positions = bufferRef.current.array;
			
				let i = 0;

				for (let xi = 0; xi < count; xi++) {

					for (let zi = 0; zi < count; zi++) {

						const x = Separation * (xi - count / 2);

						const z = Separation * (zi - count / 2);
				
						positions[i + 1] = graph(x, z);

						i += 3;

					}

				}

			bufferRef.current.needsUpdate = true;

		}

	})

	return (

		<points>

			<bufferGeometry attach="geometry">

				<bufferAttribute
				
					ref={bufferRef}
					
					attach='attributes-position'
					
					array={positions}
					
					count={positions.length / 3}
					
					itemSize={3}

				/>

			</bufferGeometry>

			<pointsMaterial

				attach="material"

				map={imgTex}

				color={"lime"}

				size={1.75}

				sizeAttenuation

				transparent={false}

				alphaTest={0.18}

				opacity={1.0}

			/>

		</points>

	);

}

const RotatingCamera = () => {
	const cameraRef = useRef(null);
  
	// Función para rotar la cámara en cada cuadro
	useFrame((state, delta) => {
		if (cameraRef.current) {
			// Modifica la rotación de la cámara con el paso del tiempo (por ejemplo, rotación en el eje Y)
			cameraRef.current.rotation.y += 0.1 * delta; // Puedes ajustar la velocidad de rotación cambiando el valor multiplicador
		}
	});
  
	return (
		<PerspectiveCamera
			makeDefault // Hace que esta cámara sea la cámara predeterminada de la escena
			position={[20, 10, 10]} // Posición inicial de la cámara
			fov={75}
			ref={cameraRef}
		/>
	);
};

function App() {


	return (

		<div className="anim">

			<Canvas

			// colorManagement={false}

			// camera={{ position: [20, 10, 10], fov: 75 }}

			>

				<fog attach="fog" color="black" near={50} far={80} />

				<Points />

				<RotatingCamera />

				{/* <OrbitControls /> */}

			</Canvas>

		</div>

	);

}

export default App;