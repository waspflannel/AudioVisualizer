import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import * as dat from 'lil-gui'
import Vertex from './shaders/test/vertex.glsl'
import Fragment from './shaders/test/fragment.glsl'
import Vertex1 from './shaders/test/vertex1.glsl'
import Vertex2 from './shaders/test/vertex2.glsl'
/**
 * Base
 */
// Debug
const gui = new dat.GUI()
const debugObject = {}
// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

/**
 * Textures
 */
const textureLoader = new THREE.TextureLoader()

/**
 * Test mesh
 */
// Geometry
const geometry = new THREE.PlaneGeometry(5, 5,45,45)

const sphere = new THREE.SphereGeometry(1,32,32)




// Material
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

// Mesh
const mesh = new THREE.Mesh(geometry, lines)
gui.add(mesh, 'material', {
    lines: lines,
    circles: circle,
  }).onChange(() => {
    if (mesh.material === circle) {
      camera.position.set(0, 15, 0);
    } else if (mesh.material === lines) {
      camera.position.set(0, 0.6, 0);
    }
    controls.update();
  }).name('visualizer');

mesh.rotation.x = Math.PI/2;
mesh.rotation.z = Math.PI/4;
scene.add(mesh)



/**
 * Sizes
 */
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

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 75);




//camera.lookAt(mesh1.position);
camera.position.set(0,1.5,0)

scene.add(camera);

// create an AudioListener and add it to the camera
const listener = new THREE.AudioListener();
camera.add( listener );

// create an Audio source
const sound = new THREE.Audio( listener );

// load a sound and set it as the Audio object's buffer
const audioLoader = new THREE.AudioLoader();
audioLoader.load( 'ambient4.mp3', function( buffer ) {
	sound.setBuffer( buffer );
	sound.setLoop(true);
	sound.setVolume(0.2);
	sound.play();
});
// create an AudioAnalyser, passing in the sound and desired fftSize
const analyser = new THREE.AudioAnalyser( sound, 32768);



// Controls
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;
controls.enableZoom = false;
controls.enablePan = false;
controls.enableRotate = false
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
 }


 const tick = () => {
     const elapsedTime = clock.getElapsedTime()
     vert();
     controls.update()
     renderer.render(scene, camera)
     window.requestAnimationFrame(tick)
 }


 
 tick()