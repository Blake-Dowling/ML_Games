import React, {useRef, useState, useEffect} from 'react'
import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js';
import { TextBufferGeometry, TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js';

const CELL_SIZE = 40

const cubeSize = 1
const spacing = 1.2


let scene, camera, renderer, composer, loader, textMesh



export function View(props){
    const mountRef = useRef(null);
    const cubeRefs = useRef([])

    function createText(font, text){
        if (textMesh) {
            scene.remove(textMesh);
            textMesh.geometry.dispose()
            textMesh.material.dispose()
        }

        const geometry = new TextGeometry(text, {
            font: font,
            size: 1,
            depth: 0.2,
            curveSegments: 12,
            bevelEnabled: true,
            bevelThickness: 0.1,
            bevelSize: 0.05,
            bevelSegments: 5,
        });
    
        const material = new THREE.MeshStandardMaterial({color: 0x000000, transparent: true, opacity: 1, emissive: 0xffffff, emissiveIntensity: .9});
        textMesh = new THREE.Mesh(geometry, material);
        textMesh.position.x = -3
        textMesh.position.y = 10
        scene.add(textMesh);
        
    }

    useEffect(() => {

        scene = new THREE.Scene()
        camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 1000)
        renderer = new THREE.WebGLRenderer({ antialias: true })
        

        camera.position.x = 5
        camera.position.y = 5
        camera.position.z = 2 * Math.max(props.board?.width, props.board?.height)

        renderer.setSize(window.innerWidth, window.innerHeight)
        renderer.setClearColor(0x000000, 1)
        mountRef.current.appendChild(renderer.domElement)
      
        const pointLight1 = new THREE.PointLight(0xffffff, 1, 1, 0.1); // Green light
        pointLight1.position.set(5,5,5);
        scene.add(pointLight1);
    

        for(let r=0; r<props.board?.board?.length; r++){
            cubeRefs.current[r] = []
            for(let c=0; c<props.board?.board[0]?.length; c++){
                const geometry = new THREE.BoxGeometry(cubeSize, cubeSize, cubeSize)
                const material = new THREE.MeshStandardMaterial({color: 0x000000, transparent: true, opacity: 1, emissive: 0xffffff, emissiveIntensity: .9})
                const cube = new THREE.Mesh(geometry, material)
                cube.position.x = 2 + (camera.position.z/2) - (c * spacing)
                cube.position.y = (camera.position.z/2) - (r * spacing)
                scene.add(cube)
                cubeRefs.current[r][c] = cube
            }
        }


        const screenGeometry = new THREE.PlaneGeometry(20, 15, 32, 32);

        // Manipulate vertices to create curvature
        const position = screenGeometry.attributes.position;
        for (let i = 0; i < position.count; i++) {
          const vertex = new THREE.Vector3().fromBufferAttribute(position, i);
          const distanceFromCenter = vertex.length();
        //   const distanceFromCenter = Math.sqrt(Math.pow(vertex.x, 2) + Math.pow(vertex.y, 2))
          const z = -0.015 * Math.pow(distanceFromCenter, 2);
          position.setZ(i, z);
        }
        screenGeometry.computeVertexNormals();

        const screenMaterial = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        opacity: 1,
        transparent: true,
        emissive: 0x009900,  // Green emissive color
        emissiveIntensity: 1.4,
        side: THREE.DoubleSide
        });
        const screen = new THREE.Mesh(screenGeometry, screenMaterial);
        screen.position.x = 5
        screen.position.y = 5
        screen.position.z = 0;
        scene.add(screen)

        composer = new EffectComposer(renderer);
        const renderPass = new RenderPass(scene, camera);
        composer.addPass(renderPass);
      
        const bloomPass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 1, 1.5, 0.85); // tweak parameters for desired effect
        composer.addPass(bloomPass);

        const handleResize = () => {
            renderer.setSize(window.innerWidth, window.innerHeight);
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            composer.setSize(window.innerWidth, window.innerHeight);
          };
        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
            if (mountRef.current && renderer.domElement) {
                mountRef.current.removeChild(renderer.domElement);
            }
          }
    }, [props.board?.width, props.board?.height])
    useEffect(() => {

        function cubeColor(rowIndex, columnIndex){
            const cellVal = props.board?.board[rowIndex][columnIndex]
            return cellVal == 3 ? 0x00ff00 : cellVal == 2 ? 0xff0000 : cellVal == 1 ? 0x000000 : 0x000000 
        }
        function cubeOpacity(rowIndex, columnIndex){
            const cellVal = props.board?.board[rowIndex][columnIndex]
            return cellVal > 0 ? 1 : 0.02
        }
        function animate(){
            loader = new FontLoader();
            loader.load(`${process.env.PUBLIC_URL}/fonts/helvetiker_regular.typeface.json`, function (font) {
                createText(font, `Score ${props.score}`)
            })
            if(cubeRefs.current.length){
                for(let r=0; r<cubeRefs?.current?.length; r++){
                    for(let c=0; c<cubeRefs?.current[0]?.length; c++){
                        const color = cubeColor(r, c)
                        cubeRefs.current[r][c].material.color.set(color)
                        const opacity = cubeOpacity(r, c)
                        cubeRefs.current[r][c].material.opacity = opacity
                    }
                }
                renderer.render(scene, camera)
                composer.render();
            }
        }
        animate()


        

    }, [props.board, props.score])

    return <div ref={mountRef}/>
}

// export function View(props) {

//     function cellColor(rowIndex, columnIndex){
//         const cellVal = props.board?.board[rowIndex][columnIndex]
//         return cellVal == 3 ? 'lime' : cellVal == 2 ? 'red' : cellVal == 1 ? 'black' : 'white'
//     }

//     return (
//         <div className='board'>
//             {props.board?.board?.map((row, rowIndex) => {
//                 return(<div className='row'>
//                     {row?.map((square, columnIndex) => {
//                         return (<div className='cell' style={{
//                             width: `${CELL_SIZE*1}px`,
//                             height: `${CELL_SIZE*1}px`,
//                             background: `${cellColor(rowIndex, columnIndex)}`
//                             }}
//                         >
//                         </div>)
//                     })}
//                 </div>)
//             })}
//         </div>
//     )
// }
