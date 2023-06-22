import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import * as dat from 'lil-gui'
import Vertex from './shaders/test/vertex.glsl'
import Fragment from './shaders/test/fragment.glsl'
import Vertex1 from './shaders/test/vertex1.glsl'

import waterVertexShader from "./shaders/water/vertex.glsl"
import waterFragmentShader from "./shaders/water/fragment.glsl"


const gui = new dat.GUI()
const debugObject = {}
const debug = {}
debug.depthColor = '#284382'
debug.surfaceColor = '#b6a9f1'

const canvas = document.querySelector('canvas.webgl')


const scene = new THREE.Scene()

const textureLoader = new THREE.TextureLoader()

const geometry = new THREE.PlaneGeometry(5, 5,45,45)


const waterGeometry = new THREE.PlaneGeometry(5, 5, 512, 512)
const waterMaterial = new THREE.ShaderMaterial({
  vertexShader: waterVertexShader,
  fragmentShader: waterFragmentShader,
  uniforms:
  {
      uTime:{value:0},


      uBigWavesElevation:{value:0.2},
      uBigWavesFrequency:{value: new THREE.Vector2(1.5,1)},
      uBigWavesSpeed:{value:0.0},

      uSmallWavesElevation:{value:0.15},
      uSmallWavesFrequency:{value:3},
      uSmallWavesSpeed:{value:0.0},
      uSmallIterations:{value:4.0},



      uDepthColor: {value: new THREE.Color(debug.depthColor)},
      uSurfaceColor: {value: new THREE.Color(debug.surfaceColor)},
      uColorOffset:{value:0.16},
      uColorMultiplier:{value:5},
      
  }
})
const water = new THREE.Mesh(waterGeometry, waterMaterial)
water.rotation.x = - Math.PI * 0.5

const songInput = document.getElementById("myfile");


const circle = new THREE.RawShaderMaterial({
    vertexShader: Vertex,
    fragmentShader: Fragment,
    side: THREE.DoubleSide,
    wireframe:true,
    uniforms: {
        audioData: { value: 0 },
        modelViewMatrix: { value: new THREE.Matrix4() },
        u_resolution: { value: new THREE.Vector2() },
    }
})
const lines = new THREE.RawShaderMaterial({
    vertexShader: Vertex1,
    fragmentShader: Fragment,
    side: THREE.DoubleSide,
    wireframe:true,
    uniforms: {
        audioData: { value: 0 },
        modelViewMatrix: { value: new THREE.Matrix4() }
    }
})

const mesh = new THREE.Mesh(geometry, lines)
gui.add(mesh, 'material', {
    lines: lines,
    circles: circle,
    waves: waterMaterial,
  }).onChange(() => {
    if (mesh.material === circle) {
      scene.remove(water)
      scene.add(mesh)
      camera.position.set(0, 15, 0);
    } else if (mesh.material === lines) {
      scene.remove(water)
      scene.add(mesh)
      camera.position.set(0, 1.5, 0);
    }
    else if (mesh.material === waterMaterial){
      scene.remove(mesh)
      scene.add(water)
      camera.position.set(0, 2.89,  2.76);
    }
    controls.update();
  }).name('visualizer');

mesh.rotation.x = -Math.PI/2;
mesh.rotation.z = Math.PI/4;
scene.add(mesh)



const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

window.addEventListener('resize', () =>
{
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})


const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 75);





camera.position.set(0,1.5,0)

scene.add(camera);

const listener = new THREE.AudioListener();
camera.add( listener );

const audioListener = new THREE.AudioListener();
const sound = new THREE.Audio(audioListener);
const handleSongChange = (e) => {
  const file = e.target.files[0]; 
  if (sound.isPlaying) {
    sound.stop(); 
  }
  const audioLoader = new THREE.AudioLoader();
  audioLoader.load(URL.createObjectURL(file), function(buffer) {
    sound.setBuffer(buffer);
    sound.setLoop(true);
    sound.setVolume(1.0);
    sound.play();
  });
}
songInput.addEventListener("change", handleSongChange);

const analyser = new THREE.AudioAnalyser( sound, 32768);



// Controls
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;
//controls.enableZoom = false;
//controls.enablePan = false;
//controls.enableRotate = false
controls.update();



/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

/**
 * Animate
 */

 const count =geometry.attributes.position.count
 const randoms = new Float32Array(count)
 const clock = new THREE.Clock()

 const vert = () =>{
    const audioData = analyser.getAverageFrequency();
    circle.uniforms.audioData.value = audioData*0.4;
    lines.uniforms.audioData.value = audioData*0.3;
    water.material.uniforms.uTime.value =audioData*0.015;
    water.material.uniforms.uBigWavesSpeed.value = audioData*0.015;
    water.material.uniforms.uSmallWavesSpeed.value = audioData*0.03;
    water.material.uniforms.uBigWavesElevation.value = audioData*0.003;
    water.material.uniforms.uSmallWavesElevation.value = audioData*0.005;
    for(let i=0 ; i<count; i++){
      const randomValue = (Math.random() * audioData) * 0.013
      randoms[i] = randomValue;
  }
  geometry.setAttribute('aRandom',new THREE.BufferAttribute(randoms,1))
 }


 const tick = () => {
     const elapsedTime = clock.getElapsedTime()
     vert();
     controls.update()
     renderer.render(scene, camera)
     window.requestAnimationFrame(tick)
 }


 
 tick()