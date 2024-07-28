import React from 'react'
import * as THREE from 'three';

import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js';
import { TextBufferGeometry, TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js';

import { env } from './View.js'

export function updateMesh(object, reference, newMesh){
    if(object && reference in object && object[reference]){ //destroy if prev mesh not null
        env.scene?.remove(object[reference])
        object[reference]?.material?.dispose()
        object[reference]?.geometry?.dispose()
    } 
    object[reference] = newMesh
    if(object[reference]){ //add if new mesh not null
        env.scene?.add(object[reference])
    }
}
export function updateGeometry(mesh, newGeometry){
    if(mesh){
        mesh.geometry?.dispose()
        mesh.geometry = newGeometry
    }
}

export async function init(){
    env.scene = new THREE.Scene()
    env.camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 1000)
    env.camera.position.set(5, 5, 20)
    env.renderer = new THREE.WebGLRenderer({ antialias: true })
    env.renderer.setSize(window.innerWidth, window.innerHeight)
    env.renderer.setClearColor(0x000000, 1)
    const pointLight1 = new THREE.PointLight(0xffffff, 1, 1, 0.1);
    pointLight1.position.set(5,5,5);
    env.scene.add(pointLight1);
    env.loader = new FontLoader();
    env.cubeGeometry = new THREE.BoxGeometry(0.6, 0.6, 0.6)
    env.defaultMaterial = new THREE.MeshStandardMaterial({color: 0x000000, transparent: true, opacity: 1, emissive: 0xffffff, emissiveIntensity: .9})


    //Static Text
    const nameMesh = new THREE.Mesh(await newTextGeometry("Blake Dowling", 0.25), env.defaultMaterial.clone())
    env.scene.add(nameMesh)
    nameMesh.position.set(10.5, 11)
    const titleMesh = new THREE.Mesh(await newTextGeometry("Deep Q Arcade", 0.7), env.defaultMaterial.clone())
    titleMesh.position.set(0, 12)
    env.scene.add(titleMesh)
    const selectMesh = new THREE.Mesh(await newTextGeometry("Select Game: ", 0.5), env.defaultMaterial.clone())
    selectMesh.position.set(-5, 10)
    env.scene.add(selectMesh)
    const tetrisMesh = new THREE.Mesh(await newTextGeometry("Tetris", 0.5), env.defaultMaterial.clone())
    tetrisMesh.position.set(-3, 8)
    env.scene.add(tetrisMesh)
    const snakeMesh = new THREE.Mesh(await newTextGeometry("Snake", 0.5), env.defaultMaterial.clone())
    snakeMesh.position.set(-3, 6)
    env.scene.add(snakeMesh)
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
    screen.position.set(5, 5, -1)
    env.scene.add(screen)
   
    env.composer = new EffectComposer(env.renderer);
    const renderPass = new RenderPass(env.scene, env.camera);
    env.composer.addPass(renderPass);
    const bloomPass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 1, 1.5, 0.85); 
    env.composer.addPass(bloomPass);

}

export async function newTextGeometry(text, size){
    return await new Promise((resolve, reject) => {
        env.loader.load(`${process.env.PUBLIC_URL}/fonts/Retrcade_Regular.json`, function (font) {
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
            resolve(geometry)
            reject((e) => console.error(e))
        })
    })
}
export async function drawBoard(board, curGame){
    if(curGame === "ten" && !env.numGeometries?.length){
        env.numGeometries = []
        env.numGeometries.push(await newTextGeometry(String(0), 0.8))
        for(let i=0; i<16; i++){
            env.numGeometries.push(await newTextGeometry(String(2**i), 0.8))
        }
    }
    if(board?.length){
        for(let r=0; r<board?.length; r++){
            for(let c=0; c<board[0]?.length; c++){
                if(!env.boardMeshes[r]){ //boardMesh row not initialized
                    env.boardMeshes[r] = []
                }
                if(!env.boardMeshes[r][c]){ //boardMesh cell not initialized
                    updateMesh(env.boardMeshes[r], c, new THREE.Mesh(env.cubeGeometry.clone(), env.defaultMaterial.clone()))
                    const spacing = curGame === "ten" ? 2 : 0.8
                    env.boardMeshes[r][c].position.x = -3 + (env.camera.position.z/2) + (c * spacing)
                    env.boardMeshes[r][c].position.y = -5 + (env.camera.position.z/2) - (r * spacing)
                }
                const boardVal = board[r][c] //Board cell value
                if(curGame === "ten"){ //1024, change geometry
                    const numGeometryIndex = boardVal == 0 ? 0 : Math.floor(Math.log2(boardVal)) + 1 //+1 because 0 included in array index 0 instead of 1
                    const geometry =  env.numGeometries[numGeometryIndex].clone() //Corresponding geometry
                    updateGeometry(env.boardMeshes[r][c], geometry)
                }
                else{ //Other games, change material opacity
                    env.boardMeshes[r][c].material.opacity = boardVal > 0 ? 1 : 0.02
                }
            }
        }
    }
}

export function disposeBoard(){
    for(let r=0; r<env.boardMeshes?.length; r++){
        for(let c=0; c<env.boardMeshes[0]?.length; c++){
            updateMesh(env.boardMeshes[r], c, null)
        }
    }
    env.boardMeshes.length = 0
}

export async function updateScore(score){
    if(!env.scoreMesh){
        updateMesh(env, 'scoreMesh', new THREE.Mesh(await newTextGeometry(`Score`, .5), env.defaultMaterial?.clone()))
        env.scoreMesh.position.set(8, 6)
    }
    updateGeometry(env.scoreMesh, await newTextGeometry(`Score ${score}`, .5))
}