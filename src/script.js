import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import * as dat from 'lil-gui'
import Vertex from './shaders/test/vertex.glsl'
import Fragment from './shaders/test/fragment.glsl'
import Vertex1 from './shaders/test/vertex1.glsl'

import waterVertexShader from "./shaders/water/vertex.glsl"
import waterFragmentShader from "./shaders/water/fragment.glsl"

import PointVertex from "./shaders/points/vertex.glsl"
import PointFragment from "./shaders/points/fragment.glsl"
import { Camera, PointsMaterial } from 'three'


const gui = new dat.GUI()
const debugObject = {}
const debug = {}
debug.depthColor = '#284382'
debug.surfaceColor = '#b6a9f1'

const parameters = {}
parameters.count = 400000
parameters.size = 0.005
parameters.radius = 1.05
parameters.branches = 2
parameters.spin = 1
parameters.randomness = 0.1
parameters.randomnessPower = 1.5
parameters.insideColor = '#ff6030'
parameters.outsideColor = '#1b3984'

let Pointmaterial = null
let points = null
let Pointgeometry = null;
let isGenerated = false;



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
let currentMaterial = waterMaterial;
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
const audioLoader = new THREE.AudioLoader();

audioLoader.load('/ambient6.mp3', function(buffer) {
  sound.setBuffer(buffer);
  sound.setLoop(true);
  sound.setVolume(1.0);
  sound.play();
});


const handleSongChange = (e) => {
  const file = e.target.files[0]; 
  if (sound.isPlaying) {
    sound.stop(); 
  }
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
 const mesh = new THREE.Mesh(waterGeometry, waterMaterial)
 scene.add(mesh)

camera.position.set(0, 2.89,  2.76);
 gui.add(mesh, 'material', {
  waves: waterMaterial,
  points: isGenerated,
}).onChange(() => {

  if (mesh.material === waterMaterial){//if adding back others change this to else
    isGenerated = false;
    scene.remove(mesh)
    scene.remove(points)
    scene.add(water)
    camera.position.set(0, 2.89,  2.76);
  }

  else if(!isGenerated){
    isGenerated = true;
    scene.remove(mesh)
    scene.remove(water)
    camera.position.set(0,0.65,0)
    generateGalaxy();
  }
  controls.update();
}).name('visualizer');
mesh.rotation.x = -Math.PI/2;
 const count =geometry.attributes.position.count
 const randoms = new Float32Array(count)
 const clock = new THREE.Clock()

 const vert = () =>{
    const audioData = analyser.getAverageFrequency();
    circle.uniforms.audioData.value = audioData*0.4;
    lines.uniforms.audioData.value = audioData*0.3;

    //move water balues
    water.material.uniforms.uTime.value =audioData*0.015;
    water.material.uniforms.uBigWavesSpeed.value = audioData*0.015;
    water.material.uniforms.uSmallWavesSpeed.value = audioData*0.03;
    water.material.uniforms.uBigWavesElevation.value = audioData*0.003;
    water.material.uniforms.uSmallWavesElevation.value = audioData*0.005;

    if(isGenerated){
      Pointmaterial.uniforms.uAudioData.value = audioData*0.6;
      Pointmaterial.uniforms.uTime.value = audioData;
    }
    for(let i=0 ; i<count; i++){
      const randomValue = (Math.random() * audioData) * 0.013
      randoms[i] = randomValue;
  }
  geometry.setAttribute('aRandom',new THREE.BufferAttribute(randoms,1))
 }
 const generateGalaxy = () =>
{
    if(points !== null)
    {
      Pointgeometry.dispose()
      Pointmaterial.dispose()
        scene.remove(points)
        isGenerated = false;
    }

    /**
     * Geometry
     */
    Pointgeometry = new THREE.BufferGeometry()

    const positions = new Float32Array(parameters.count * 3)
    const colors = new Float32Array(parameters.count * 3)
    const scales = new Float32Array(parameters.count * 1)

    const randomness = new Float32Array(parameters.count * 3)

    const insideColor = new THREE.Color(parameters.insideColor)
    const outsideColor = new THREE.Color(parameters.outsideColor)

    for(let i = 0; i < parameters.count; i++)
    {
        const i3 = i * 3

        // Position
        const radius = Math.random() * parameters.radius

        const branchAngle = (i % parameters.branches) / parameters.branches * Math.PI * 2

        const randomX = Math.pow(Math.random(), parameters.randomnessPower) * (Math.random() < 0.5 ? 1 : - 1) * parameters.randomness * radius
        const randomY = Math.pow(Math.random(), parameters.randomnessPower) * (Math.random() < 0.5 ? 1 : - 1) * parameters.randomness * radius
        const randomZ = Math.pow(Math.random(), parameters.randomnessPower) * (Math.random() < 0.5 ? 1 : - 1) * parameters.randomness * radius

        randomness[i3+0]= randomX;
        randomness[i3+1]= randomY;
        randomness[i3+2]= randomZ;
        

        positions[i3    ] = Math.cos(branchAngle) * radius 
        positions[i3 + 1] = 0
        positions[i3 + 2] = Math.sin(branchAngle) * radius 

        // Color
        const t = Math.pow(radius / parameters.radius,0.5); 
        const mixedColor = insideColor.clone().lerp(outsideColor, t);

        colors[i3    ] = mixedColor.r
        colors[i3 + 1] = mixedColor.g
        colors[i3 + 2] = mixedColor.b


        scales[i] = Math.random()
    }
    
    Pointgeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    Pointgeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))
    Pointgeometry.setAttribute('aScale', new THREE.BufferAttribute(scales, 1))
    Pointgeometry.setAttribute('aRandomness', new THREE.BufferAttribute(randomness, 3))
    /**
     * Material
     */
     Pointmaterial = new THREE.ShaderMaterial({
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        vertexColors: true,
        vertexShader:PointVertex,
        fragmentShader: PointFragment,
        uniforms:{
            uAudioData: { value : 0},
            uTime: {value: 0},
            uSize: {value:30 * renderer.getPixelRatio()},
        },
    })

    /**
     * Points
     */
    points = new THREE.Points(Pointgeometry, Pointmaterial)
    isGenerated = true;
    scene.add(points)
}

 const tick = () => {
     const elapsedTime = clock.getElapsedTime()
     vert();
     controls.update()
     renderer.render(scene, camera)
     window.requestAnimationFrame(tick)
 }


 
 tick()