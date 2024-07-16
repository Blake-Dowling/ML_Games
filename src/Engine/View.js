import React, {useRef, useState, useEffect} from 'react'
import * as THREE from 'three';
const CELL_SIZE = 40

const cubeSize = 1
const spacing = 1.2





export function View(props){
    const mountRef = useRef(null);
    const cubeRefs = useRef([])
    const [scene, setScene] = useState(null)
    const [camera, setCamera] = useState(null)
    const [renderer, setRenderer] = useState(null)
    useEffect(() => {

        const newScene = new THREE.Scene()
        const newCamera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 1000)
        const newRenderer = new THREE.WebGLRenderer()
        newCamera.position.x = 5
        newCamera.position.y = 5
        newCamera.position.z = 2 * Math.max(props.board?.width, props.board?.height)

        newRenderer.setSize(window.innerWidth/2, window.innerHeight/2)
        newRenderer.setClearColor(0xffffff, 1)
        mountRef.current.appendChild(newRenderer.domElement)



        for(let r=0; r<props.board?.board?.length; r++){
            cubeRefs.current[r] = []
            for(let c=0; c<props.board?.board[0]?.length; c++){
                const geometry = new THREE.BoxGeometry(cubeSize, cubeSize, cubeSize)
                const material = new THREE.MeshBasicMaterial({color: 0x00ff00})
                const cube = new THREE.Mesh(geometry, material)
                cube.position.x = (newCamera.position.z/2) - (c * spacing)
                cube.position.y = (newCamera.position.z/2) - (r * spacing)
                newScene.add(cube)
                cubeRefs.current[r][c] = cube
            }
        }
        const handleResize = () => {
            newRenderer.setSize(window.innerWidth/2, window.innerHeight/2);
            newCamera.aspect = window.innerWidth / window.innerHeight;
            newCamera.updateProjectionMatrix();
          };
        window.addEventListener('resize', handleResize);
        setScene(newScene)
        setCamera(newCamera)
        setRenderer(newRenderer)
        return () => {
            window.removeEventListener('resize', handleResize);
            if (mountRef.current && newRenderer.domElement) {
                mountRef.current.removeChild(newRenderer.domElement);
            }
          }
    }, [props.board?.width, props.board?.height])
    useEffect(() => {

        function cubeColor(rowIndex, columnIndex){
            const cellVal = props.board?.board[rowIndex][columnIndex]
            return cellVal == 3 ? 0x00ff00 : cellVal == 2 ? 0xff0000 : cellVal == 1 ? 0x000000 : 0xffffff
        }
        function animate(){
        if(cubeRefs.current.length){
            for(let r=0; r<cubeRefs?.current?.length; r++){
                for(let c=0; c<cubeRefs?.current[0]?.length; c++){
                    const color = cubeColor(r, c)
                    // console.debug(cubeRefs.current[0])
                    cubeRefs.current[r][c].material.color.set(color)
                }
            }

            // cube.position.y += 0.01
            // if(cube.position.y > 2){
            //     cube.position.y = -2
            // }
            renderer.render(scene, camera)
        }
    }
        animate()


        

    }, [props.board])
    return <div ref={mountRef} />;
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
