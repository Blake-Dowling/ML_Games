import React, {useRef, useState, useEffect} from 'react'
import * as THREE from 'three';

import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js';
import { TextBufferGeometry, TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js';

import { updateMesh, init, newText, drawBoard, disposeBoard, updateScore } from './Helpers.js'

export const env = {
    scene: null, camera: null, renderer: null, composer: null, loader: null,
    scoreMesh: null,
    chartMeshes: [],
    boardMeshes: [],
}





export function View(props) {
  const mountRef = useRef(null);

  useEffect(() => {
    init()
    mountRef.current.appendChild(env.renderer.domElement)
    const handleResize = () => {
      env.renderer.setSize(window.innerWidth, window.innerHeight);
      env.camera.aspect = window.innerWidth / window.innerHeight;
      env.camera.updateProjectionMatrix();
      env.composer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);
    return () => {
        window.removeEventListener('resize', handleResize);
        if (mountRef.current && env.renderer.domElement) {
            mountRef.current.removeChild(env.renderer.domElement);
        }
    }
  }, [])

  useEffect(() => {
    drawBoard(props.board?.board, props.curGame)
    env.renderer?.render(env.scene, env.camera)
    env.composer?.render();
  }, [props.board])
  useEffect(() => {
    disposeBoard()
  }, [props.curGame])
  useEffect(() => {
    updateScore(props.score)
  }, [props.score])
  return <div ref={mountRef}/>
}
