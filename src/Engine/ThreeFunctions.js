import React, {useRef, useState, useEffect} from 'react'
import * as THREE from 'three';

import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js';
import { TextBufferGeometry, TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js';

import { loader, scene, cubeRefs, camera, textMeshes } from './View.js'

export async function changeText(meshObject, meshKey, text, size){

    meshObject[meshKey] = await new Promise((resolve, reject) => {

        loader.load(`${process.env.PUBLIC_URL}/fonts/Retrcade_Regular.json`, function (font) {

            if (meshObject[meshKey]) {
                // console.debug(meshObject[meshKey])
                // console.debug(scene.getObjectById(meshObject[meshKey].id))
                scene.remove(meshObject[meshKey]);
                // console.debug(scene.getObjectById(meshObject[meshKey].id))
                meshObject[meshKey].geometry.dispose()
                meshObject[meshKey].material.dispose()
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
            meshObject[meshKey] = new THREE.Mesh(geometry, material);
            scene.add(meshObject[meshKey]);
            resolve(meshObject[meshKey])
            reject((e) => console.error(e))
        })
    })

}

export async function createBoard(board, type){
    const cubeSize = .6
    const spacing = 2//.8
    // for(let i=0; i<cubeRefs.length; i++){
    //     for(let j=0; j<cubeRefs[i].length; j++){
        
    //     scene.remove(cubeRefs[i][j])
    //     cubeRefs[i][j].geometry?.dispose()
    //     cubeRefs[i][j].material?.dispose()
    //     }
    // }
    
    // cubeRefs.length = 0
    
    for(let r=0; r<board?.length; r++){
        cubeRefs[r] = []
        for(let c=0; c<board[0]?.length; c++){
            if(cubeRefs[r][c]){
                console.debug(cubeRefs[r][c])
                scene.remove(cubeRefs[r][c])
                cubeRefs[r][c].geometry?.dispose()
                cubeRefs[r][c].material?.dispose()
            }
            if(type === "cube"){

                const geometry = new THREE.BoxGeometry(cubeSize, cubeSize, cubeSize)
                const material = new THREE.MeshStandardMaterial({color: 0x000000, transparent: true, opacity: 1, emissive: 0xffffff, emissiveIntensity: .9})
                const cube = new THREE.Mesh(geometry, material)
                cube.position.x = -3 + (camera.position.z/2) + (c * spacing)
                cube.position.y = -5 + (camera.position.z/2) - (r * spacing)
                scene.add(cube)
                cubeRefs[r][c] = cube
            }
            else if(type === "val"){

                await changeText(cubeRefs[r], c, String(board[r][c]), .8)
                if(cubeRefs[r][c]){
                    cubeRefs[r][c].position.x = -3 + (camera.position.z/2) + (c * spacing)
                    cubeRefs[r][c].position.y = -5 + (camera.position.z/2) - (r * spacing)
                }

            }

        }
    }
    console.debug(cubeRefs)
    // console.debug(scene.children.length)
}

export async function init(){
    //Static Text
    await changeText(textMeshes, 'nameMesh', "Blake Dowling", .25)
    textMeshes.nameMesh.position.x = 10.5
    textMeshes.nameMesh.position.y = 11
    await changeText(textMeshes, 'titleMesh', "Deep Q Arcade", .7)
    textMeshes.titleMesh.position.x = 0
    textMeshes.titleMesh.position.y = 12
    await changeText(textMeshes, 'selectMesh', "Select Game:", .5)
    textMeshes.selectMesh.position.x = -5
    textMeshes.selectMesh.position.y = 10
    await changeText(textMeshes, 'tetrisMesh', "Tetris", .5)
    textMeshes.tetrisMesh.position.x = -3
    textMeshes.tetrisMesh.position.y = 8
    await changeText(textMeshes, 'snakeMesh', "Snake", .5)
    textMeshes.snakeMesh.position.x = -3
    textMeshes.snakeMesh.position.y = 6
}