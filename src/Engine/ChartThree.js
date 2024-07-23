import React, {useRef, useState, useEffect} from 'react'
import * as THREE from 'three';

import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js';
import { TextBufferGeometry, TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js';


export async function createChart(onlineModel, size, scene, chartMeshes){
    const x = -4
    const y = -1.5
    const width = size
    const height = size /3

    for(let i=0; i<chartMeshes.current.length; i++){

        scene.remove(chartMeshes.current[i])
        chartMeshes.current[i].geometry?.dispose()
        chartMeshes.current[i].material?.dispose()
    }
    chartMeshes.current = []
    let data = onlineModel?.scoreHistory
    let maxDataValue = data ? Math.max(...data) : 1
    maxDataValue = Math.max(maxDataValue, 1)
    const maxInterval = 10**(Math.ceil(Math.log10(maxDataValue))-1)
    const intervals = []
    for(let i=0; i<=maxInterval; i+=maxInterval/4){
        intervals.push(i)
    }
    const points = []
    data?.forEach((value, index) => {
        points.push(new THREE.Vector3(x + ((index/data.length)*width), y + ((value/maxDataValue)*height), 0))
    })
    const dataGeometry = new THREE.BufferGeometry().setFromPoints(points)
    const dataMaterial = new THREE.MeshStandardMaterial({color: 0x000000, transparent: true, opacity: 1, emissive: 0xffffff, emissiveIntensity: .9});
    const dataLine = new THREE.Line(dataGeometry, dataMaterial);
    chartMeshes.current.push(dataLine)
    scene.add(dataLine);
    const axesMaterial = new THREE.MeshStandardMaterial({color: 0x000000, transparent: true, opacity: 1, emissive: 0xffffff, emissiveIntensity: .9});
    const xAxisGeometry = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(x, y, 0), new THREE.Vector3(x+width, y, 0)]);
    const xAxisLine = new THREE.Line(xAxisGeometry, axesMaterial);
    chartMeshes.current.push(xAxisLine)
    scene.add(xAxisLine);
    const yAxisGeometry = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(x, y, 0), new THREE.Vector3(x, y+height, 0)]);
    const yAxisLine = new THREE.Line(yAxisGeometry, axesMaterial);
    chartMeshes.current.push(yAxisLine)
    scene.add(yAxisLine);
    const labels = [0]
    
    for(let i=1; i<onlineModel?.sampleCountHistory?.length; i++){
        if(i % parseInt(onlineModel?.sampleCountHistory?.length/5) === 0){
            labels.push(onlineModel?.sampleCountHistory[i-1])
        }
    }

        const newMeshes = await new Promise((resolve, reject) => {
        const loader = new FontLoader();
        loader.load(`${process.env.PUBLIC_URL}/fonts/IBM_Plex_Mono_Thin.json`, function (font) {
            const meshesToReturn = []
            //Add Labels
            labels?.forEach((value, index) => {
                const labelGeometry = new TextGeometry((value/1000000).toFixed(1).toString() + " M", {
                    font: font,
                    size: .25,
                    depth: 0,//0.2,
                    curveSegments: 12,
                    bevelEnabled: true,
                    bevelThickness: 0.1,
                    bevelSize: 0.05,
                    bevelSegments: 0, //5
                });
                labelGeometry.computeBoundingBox();
                const labelWidth = labelGeometry.boundingBox.max.x - labelGeometry.boundingBox.min.x;
                const labelMaterial = new THREE.MeshStandardMaterial({color: 0x000000, transparent: true, opacity: 1, emissive: 0xffffff, emissiveIntensity: .9});
                const labelMesh = new THREE.Mesh(labelGeometry, labelMaterial);
                labelMesh.position.x = x + .1 + ((index/labels.length)*width) 
                labelMesh.position.y = y  - labelWidth
                // labelMesh.rotation.x = Math.PI / 9
                // labelMesh.rotation.y = Math.PI / 2
                labelMesh.rotation.z = Math.PI / 2
                meshesToReturn.push(labelMesh)
            })
            //Add Intervals
            intervals?.forEach((value, index) => {
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
                labelGeometry.computeBoundingBox();
                const labelWidth = labelGeometry.boundingBox.max.x - labelGeometry.boundingBox.min.x;
                const labelMaterial = new THREE.MeshStandardMaterial({color: 0x000000, transparent: true, opacity: 1, emissive: 0xffffff, emissiveIntensity: .9});
                const labelMesh = new THREE.Mesh(labelGeometry, labelMaterial);
                labelMesh.position.x = x  - labelWidth
                labelMesh.position.y = y  + (.5 *index)

                meshesToReturn.push(labelMesh)
            })
            //Title and Axes
            const xAxisGeometry = new TextGeometry("Samples", {
                font: font,
                size: .25,
                depth: 0,//0.2,
                curveSegments: 12,
                bevelEnabled: true,
                bevelThickness: 0.1,
                bevelSize: 0.05,
                bevelSegments: 0, //5
            });
            const xAxisMaterial = new THREE.MeshStandardMaterial({color: 0x000000, transparent: true, opacity: 1, emissive: 0xffffff, emissiveIntensity: .9});
            const xAxisMesh = new THREE.Mesh(xAxisGeometry, xAxisMaterial);
            xAxisMesh.position.x = x + 4
            xAxisMesh.position.y = y - 2
            meshesToReturn.push(xAxisMesh)

            const yAxisGeometry = new TextGeometry("Avg. Max Score", {
                font: font,
                size: .25,
                depth: 0,//0.2,
                curveSegments: 12,
                bevelEnabled: true,
                bevelThickness: 0.1,
                bevelSize: 0.05,
                bevelSegments: 0, //5
            });
            const yAxisMaterial = new THREE.MeshStandardMaterial({color: 0x000000, transparent: true, opacity: 1, emissive: 0xffffff, emissiveIntensity: .9});
            const yAxisMesh = new THREE.Mesh(yAxisGeometry, yAxisMaterial);
            yAxisMesh.position.x = x -1
            yAxisMesh.position.y = y 
            yAxisMesh.rotation.z = Math.PI / 2
            meshesToReturn.push(yAxisMesh)

            const headingGeometry = new TextGeometry("Score History", {
                font: font,
                size: .25,
                depth: 0,//0.2,
                curveSegments: 12,
                bevelEnabled: true,
                bevelThickness: 0.1,
                bevelSize: 0.05,
                bevelSegments: 0, //5
            });
            const headingMaterial = new THREE.MeshStandardMaterial({color: 0x000000, transparent: true, opacity: 1, emissive: 0xffffff, emissiveIntensity: .9});
            const headingMesh = new THREE.Mesh(headingGeometry, headingMaterial);
            headingMesh.position.x = x + 3.5
            headingMesh.position.y = y + 3
            meshesToReturn.push(headingMesh)

            resolve(meshesToReturn)
            
             })
        })
        
        newMeshes.forEach(value => {chartMeshes.current.push(value);scene.add(value)})
        return scene
}