import React, {useRef, useState, useEffect} from 'react'
import * as THREE from 'three';

import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js';
import { TextBufferGeometry, TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js';

const CELL_SIZE = 40

const cubeSize = .6
const spacing = .8


let scene, camera, renderer, composer, loader, scoreMesh
let titleMesh, tetrisMesh, snakeMesh, nameMesh
// let chartMeshes.current = []



export function View(props){
    const mountRef = useRef(null);
    const cubeRefs = useRef([])
    const chartMeshes = useRef([])

    async function drawChart(onlineModel, size){
        const x = -2.5
        const y = 0
        const width = size
        const height = size / 4

        for(let i=0; i<chartMeshes.current.length; i++){

            scene.remove(chartMeshes.current[i])
            chartMeshes.current[i].geometry?.dispose()
            chartMeshes.current[i].material?.dispose()
        }
        chartMeshes.current = []

        let data = onlineModel?.scoreHistory

        const maxDataValue = data ? Math.max(...data) : 1

        const points = []
        data?.forEach((value, index) => {
            points.push(new THREE.Vector3(x + ((index/data.length)*width), y + ((value/maxDataValue)*height), 0))
        })
        const dataGeometry = new THREE.BufferGeometry().setFromPoints(points)
        const dataMaterial = new THREE.MeshStandardMaterial({color: 0x000000, transparent: true, opacity: 1, emissive: 0xffffff, emissiveIntensity: .9});
        const dataLine = new THREE.Line(dataGeometry, dataMaterial);
        chartMeshes.current.push(dataLine)


        scene.add(dataLine);
        // scene.children.forEach((value) => {console.debug(value)})
        // console.debug(scene)
    


        const axesMaterial = new THREE.MeshStandardMaterial({color: 0x000000, transparent: true, opacity: 1, emissive: 0xffffff, emissiveIntensity: .9});
        const xAxisGeometry = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(x, y, 0), new THREE.Vector3(x+width, y, 0)]);
        const xAxisLine = new THREE.Line(xAxisGeometry, axesMaterial);
        chartMeshes.current.push(xAxisLine)
        scene.add(xAxisLine);
        const yAxisGeometry = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(x, y, 0), new THREE.Vector3(x, y+height, 0)]);
        const yAxisLine = new THREE.Line(yAxisGeometry, axesMaterial);
        chartMeshes.current.push(yAxisLine)
        scene.add(yAxisLine);


        const labels = []
        
        for(let i=0; i<onlineModel?.sampleCountHistory?.length; i++){
            if(i % parseInt(onlineModel?.sampleCountHistory?.length/10) === 0){
                labels.push(onlineModel?.sampleCountHistory[i])
            }
        }

        
        // labels?.forEach((value, index) => {
            // console.debug(value.toString())
            // loader = new FontLoader();

            const newMeshes = await new Promise((resolve, reject) => {
            loader.load(`${process.env.PUBLIC_URL}/fonts/helvetiker_regular.typeface.json`, function (font) {
                const meshesToReturn = []
                labels?.forEach((value, index) => {
                const labelGeometry = new TextGeometry(value.toString(), {
                    font: font,
                    size: .25,
                    depth: 0,//0.2,
                    curveSegments: 12,
                    bevelEnabled: true,
                    bevelThickness: 0.1,
                    bevelSize: 0.05,
                    bevelSegments: 0, //5
                });

                const labelMaterial = new THREE.MeshStandardMaterial({color: 0x000000, transparent: true, opacity: 1, emissive: 0xffffff, emissiveIntensity: .9});
                const labelMesh = new THREE.Mesh(labelGeometry, labelMaterial);
                labelMesh.position.x = x + ((index/labels.length)*width)
                labelMesh.position.y = y - 1.5
                labelMesh.rotation.x = Math.PI / 9
                labelMesh.rotation.y = Math.PI / 3
                labelMesh.rotation.z = Math.PI / 9
                meshesToReturn.push(labelMesh)
            })
                resolve(meshesToReturn)
                
                 })
            })
            newMeshes.forEach(value => {chartMeshes.current.push(value);scene.add(value)})

    }

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
                cube.position.y = -3 + (camera.position.z/2) - (r * spacing)
                scene.add(cube)
                cubeRefs.current[r][c] = cube
            }
        }

        loader = new FontLoader();
        loader.load(`${process.env.PUBLIC_URL}/fonts/helvetiker_regular.typeface.json`, function (font) {
            nameMesh = changeText(nameMesh, font, "Blake Dowling", .3)
            nameMesh.position.x = 10
            nameMesh.position.y = 10.5
        })
        loader.load(`${process.env.PUBLIC_URL}/fonts/helvetiker_regular.typeface.json`, function (font) {
            titleMesh = changeText(titleMesh, font, "Deep Q Arcade", .5)
            titleMesh.position.x = 3
            titleMesh.position.y = 10.5
        })
        loader.load(`${process.env.PUBLIC_URL}/fonts/helvetiker_regular.typeface.json`, function (font) {
            tetrisMesh = changeText(tetrisMesh, font, "Tetris", .5)
            tetrisMesh.position.x = -2
            tetrisMesh.position.y = 8
        })
        loader.load(`${process.env.PUBLIC_URL}/fonts/helvetiker_regular.typeface.json`, function (font) {
            snakeMesh = changeText(snakeMesh, font, "Snake", .5)
            snakeMesh.position.x = -2
            snakeMesh.position.y = 6
        })



        const screenGeometry = new THREE.PlaneGeometry(20, 15, 32, 32);
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
    }, [props.board?.width, props.board?.height])

    function animate(){
        // console.debug(scene.children.length)
        // console.debug(chartMeshes.current.length)
        renderer.render(scene, camera)
        composer.render();
    }
    useEffect(() => {
        drawChart(props.agent?.onlineModel, 8)
        console.debug(scene.children.length)
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

    }, [props.board])
    useEffect(() => {
        loader.load(`${process.env.PUBLIC_URL}/fonts/helvetiker_regular.typeface.json`, function (font) {
            scoreMesh = changeText(scoreMesh, font, `Score ${props.score}`, .5)
            scoreMesh.position.x = 9
            scoreMesh.position.y = 9.5
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
