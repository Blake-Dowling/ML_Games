import React, {useRef, useState, useEffect} from 'react'
import * as THREE from 'three';

import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js';
import { TextBufferGeometry, TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js';

import { createChart } from './ChartThree.js'

const CELL_SIZE = 40

const cubeSize = .6
const spacing = .8


let scene, camera, renderer, composer, loader, scoreMesh
let titleMesh, selectMesh, tetrisMesh, snakeMesh, nameMesh
// let chartMeshes.current = []



export function View(props){
    const mountRef = useRef(null);
    const cubeRefs = useRef([])
    const chartMeshes = useRef([])
    



    function changeText(mesh, font, text, size){
        if (mesh) {
            scene.remove(mesh);
            mesh.geometry.dispose()
            mesh.material.dispose()
        }

        const geometry = new TextGeometry(text, {
            font: font,
            size: size,
            depth: 0,//0.2,
            curveSegments: 12,
            bevelEnabled: true,
            bevelThickness: 0.1,
            bevelSize: 0.05,
            bevelSegments: 5,
        });
    
        const material = new THREE.MeshStandardMaterial({color: 0x000000, transparent: true, opacity: 1, emissive: 0xffffff, emissiveIntensity: .9});
        mesh = new THREE.Mesh(geometry, material);
        scene.add(mesh);
        return mesh
    }

    useEffect(() => {

        scene = new THREE.Scene()
        camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 1000)
        renderer = new THREE.WebGLRenderer({ antialias: true })
        camera.position.x = 5
        camera.position.y = 5
        camera.position.z = 20
        renderer.setSize(window.innerWidth, window.innerHeight)
        renderer.setClearColor(0x000000, 1)
        mountRef.current.appendChild(renderer.domElement)
        const pointLight1 = new THREE.PointLight(0xffffff, 1, 1, 0.1); // Green light
        pointLight1.position.set(5,5,5);
        scene.add(pointLight1);
    



        loader = new FontLoader();
        loader.load(`${process.env.PUBLIC_URL}/fonts/Retrcade_Regular.json`, function (font) {
            nameMesh = changeText(nameMesh, font, "Blake Dowling", .25)
            nameMesh.position.x = 10.5
            nameMesh.position.y = 11
        })
        loader.load(`${process.env.PUBLIC_URL}/fonts/Retrcade_Regular.json`, function (font) {
            titleMesh = changeText(titleMesh, font, "Deep Q Arcade", .7)
            titleMesh.position.x = 0
            titleMesh.position.y = 12
        })
        loader.load(`${process.env.PUBLIC_URL}/fonts/Retrcade_Regular.json`, function (font) {
            selectMesh = changeText(selectMesh, font, "Select Game:", .5)
            selectMesh.position.x = -5
            selectMesh.position.y = 10
        })
        loader.load(`${process.env.PUBLIC_URL}/fonts/Retrcade_Regular.json`, function (font) {
            tetrisMesh = changeText(tetrisMesh, font, "Tetris", .5)
            tetrisMesh.position.x = -3
            tetrisMesh.position.y = 8
        })
        loader.load(`${process.env.PUBLIC_URL}/fonts/Retrcade_Regular.json`, function (font) {
            snakeMesh = changeText(snakeMesh, font, "Snake", .5)
            snakeMesh.position.x = -3
            snakeMesh.position.y = 6
        })
    
        
        const screenGeometry = new THREE.PlaneGeometry(28, 21, 32, 32);
        const position = screenGeometry.attributes.position;
        for (let i = 0; i < position.count; i++) {
          const vertex = new THREE.Vector3().fromBufferAttribute(position, i);
          const distanceFromCenter = vertex.length();
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
        screen.position.z = -1;
        scene.add(screen)

        composer = new EffectComposer(renderer);
        const renderPass = new RenderPass(scene, camera);
        composer.addPass(renderPass);
        const bloomPass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 1, 1.5, 0.85); 
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

    }, [])
    function createBoard(){
        for(let i=0; i<cubeRefs.current.length; i++){
            for(let j=0; j<cubeRefs.current[i].length; j++){
            
            scene.remove(cubeRefs.current[i][j])
            cubeRefs.current[i][j].geometry?.dispose()
            cubeRefs.current[i][j].material?.dispose()
            }
        }
        
        cubeRefs.current = []
        

        for(let r=0; r<props.board?.board?.length; r++){
            cubeRefs.current[r] = []
            for(let c=0; c<props.board?.board[0]?.length; c++){
                const geometry = new THREE.BoxGeometry(cubeSize, cubeSize, cubeSize)
                const material = new THREE.MeshStandardMaterial({color: 0x000000, transparent: true, opacity: 1, emissive: 0xffffff, emissiveIntensity: .9})
                const cube = new THREE.Mesh(geometry, material)
                cube.position.x = -3 + (camera.position.z/2) + (c * spacing)
                cube.position.y = -5 + (camera.position.z/2) - (r * spacing)
                scene.add(cube)
                
                cubeRefs.current[r][c] = cube
            }
        }
        // console.debug(scene.children.length)
    }

    function animate(){
        // console.debug("-----------")
        // console.debug(scene.children.length)
        // console.debug(chartMeshes.current.length)
        renderer.render(scene, camera)
        composer.render();
    }
    useEffect(() => {
        createChart(props.agent?.onlineModel, 8, scene, chartMeshes)
        // console.debug(scene.children.length)
    }, [props.agent])
    
    useEffect(() => {

        function cubeColor(rowIndex, columnIndex){
            const cellVal = props.board?.board[rowIndex][columnIndex]
            return cellVal == 3 ? 0x00ff00 : cellVal == 2 ? 0xff0000 : cellVal == 1 ? 0x000000 : 0x000000 
        }
        function cubeOpacity(rowIndex, columnIndex){
            const cellVal = props.board?.board[rowIndex][columnIndex]
            return cellVal > 0 ? 1 : 0.02
        }

        // console.debug(cubeRefs.current)
        if(!(cubeRefs?.current?.length === props?.board?.height && cubeRefs?.current[0].length === props?.board?.width)){
            createBoard()
        }
        if(cubeRefs.current.length){
            for(let r=0; r<cubeRefs?.current?.length; r++){
                for(let c=0; c<cubeRefs?.current[0]?.length; c++){
                    const color = cubeColor(r, c)
                    cubeRefs.current[r][c].material.color.set(color)
                    const opacity = cubeOpacity(r, c)
                    cubeRefs.current[r][c].material.opacity = opacity
                }
            }

        }

        animate()

    }, [props.board?.board])
    useEffect(() => {
        loader.load(`${process.env.PUBLIC_URL}/fonts/Retrcade_Regular.json`, function (font) {
            scoreMesh = changeText(scoreMesh, font, `Score ${props.score}`, .5)
            scoreMesh.position.x = 8
            scoreMesh.position.y = 6
        })
    }, [props.score])

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
