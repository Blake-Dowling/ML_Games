import React, {useRef, useState, useEffect} from 'react'
import * as THREE from 'three';

import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js';
import { TextBufferGeometry, TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js';

import { createChart } from './ChartThree.js'
import { init, changeText, createBoard } from './ThreeFunctions.js'

const CELL_SIZE = 40




export let scene, camera, renderer, composer, loader, scoreMesh
export const textMeshes = {titleMesh : null, selectMesh : null, tetrisMesh : null, snakeMesh : null, nameMesh : null}
// let chartMeshes.current = []
export const cubeRefs = []


export function View(props){
    const mountRef = useRef(null);

    const chartMeshes = useRef([])
    
    useEffect(() => {
        //Setup
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

        init()

        //Screen
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

        //Effects
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
        function cubeOpacityTen(rowIndex, columnIndex){
            const cellVal = props.board?.board[rowIndex][columnIndex]
            let opacity = 0.02
            switch(cellVal){
                case 1:
                    opacity = 0.1
                    break
                case 2:
                    opacity = 0.15
                    break
                case 4:
                    opacity = 0.2
                    break
                case 8:
                    opacity = 0.25
                    break
                case 16:
                    opacity = 0.3
                    break
                case 32:
                    opacity = 0.35
                    break
                case 64:
                    opacity = 0.4
                    break
                case 128:
                    opacity = 0.45
                    break
                case 256:
                    opacity = 0.5
                    break
                case 512:
                    opacity = 0.55
                    break
                case 1028:
                    opacity = 0.6
                    break
            }
            return opacity
        }

        // console.debug(cubeRefs.current)
        if((cubeRefs?.length !== props?.board?.height || cubeRefs[0].length !== props?.board?.width)){
            createBoard(props.board?.board, "val")
        }
        if(cubeRefs.length){
            for(let r=0; r<cubeRefs?.length; r++){
                for(let c=0; c<cubeRefs[0]?.length; c++){
                    if(cubeRefs[r][c] && props.curGame!=="ten"){
                        const color = cubeColor(r, c)
                        cubeRefs[r][c].material.color.set(color)
                        const opacity = cubeOpacity(r, c)
                        cubeRefs[r][c].material.opacity = opacity
                    }

                    else if(cubeRefs[r][c] && props.curGame==="ten"){
                        changeText(cubeRefs[r], c, String(props.board?.board[r][c]), .5)
                        // cubeRefs[r][c].material.opacity = cubeOpacityTen(r, c)
                    }
                }
            }

        }

        animate()

    }, [props.board?.board])
    async function updateScore(){
        await changeText(textMeshes, 'scoreMesh', `Score ${props.score}`, .5)
        textMeshes.scoreMesh.position.x = 8
        textMeshes.scoreMesh.position.y = 6
    }
    useEffect(() => {
        updateScore()
            
        
    }, [props.score])

    return <div ref={mountRef}/>
}
