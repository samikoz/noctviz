import * as THREE from 'three';
import { MeshLineMaterial } from 'meshline'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'

import SampledMountain from "./mountains/sampled";
import SyntheticMountain from "./mountains/synth";
import SamplingMountain from "./mountains/sampling";

export class Sketch {
  modelFilePath = './js/textures/scene.gltf';

  timedelta = 0.05;

  /*
  Charcoal
  #222323
  Cream
  #F5EAE5
  Lavender
  #B1A8D2
  Jet Black
  #1A1A1A
  Peach
  #EEC4C4
  Blue
  #9DD3D9
  Off-white
  #FCFCFC
  Green
  #BEDCCE
  Beige
  #EAD4C8
  Grey
  #A6A6A6
  Purple
  #D1A4CB
  Blue Grey
  #BCC3D2
  */

  constructor(options, mountains) {
    this.scene = new THREE.Scene();
    this.mountains = mountains;
    this.mountains.setupFBO();

    this.container = options.dom;
    this.width = this.container.offsetWidth;
    this.height = this.container.offsetHeight;
    this.renderer = new THREE.WebGLRenderer();
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(this.width, this.height);
    this.renderer.setClearColor(0x000000, 1);
    this.renderer.outputColorSpace = THREE.SRGBColorSpace

    this.container.appendChild(this.renderer.domElement);

    this.camera = new THREE.PerspectiveCamera(
        70,
        window.innerWidth / window.innerHeight,
        0.001,
        1000
    );

    this.camera.position.set(0, 0, 4);
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.caster = new THREE.Raycaster();

    this.isPlaying = true;
    this.uniforms = {
      uTime: {
        type: "f",
        value: 0.0
      },
      uResolution: {
        type: "v2",
        value: new THREE.Vector2()
      },
      uMousePosition: {
        type: "v3",
        value: new THREE.Vector3()
      },
      uDistortionSize: {
        type: "f",
        value: 0.1,
      },
      uTexture: {
        value: null
      }
    };
    this.lineMaterial = this.getLineMaterial();

    this.resize();
    this.addObjects();
    this.render();
    this.setupResize();
  }

  getLineMaterial() {
    let material = new MeshLineMaterial({ color: new THREE.Color(0xffffff), lineWidth: 0.002});
    let vShader = this.mountains.getLineVertexShader();
    if (vShader !== undefined) {
      material.vertexShader = vShader;
    }
    let fShader = this.mountains.getLineFragmentShader();
    if (fShader !== undefined) {
      material.fragmentShader = fShader;
    }
    material.transparent = true;
    material.neeedsUpdate = true;
    let newUniforms = {};
    Object.assign(newUniforms, material.uniforms, this.uniforms);

    material.uniforms = newUniforms;
    return material;
  }

  setupResize() {
    window.addEventListener("resize", this.resize.bind(this));
  }

  resize() {
    this.width = this.container.offsetWidth;
    this.height = this.container.offsetHeight;
    this.uniforms.uResolution.value.x = this.width;
    this.uniforms.uResolution.value.y = this.height;
    this.renderer.setSize(this.width, this.height);
    this.camera.aspect = this.width / this.height;
    this.camera.updateProjectionMatrix();
  }

  addObjects() {
    const sketch = this;
    let gltfLoader = new GLTFLoader();
    gltfLoader.load(
        sketch.modelFilePath,
        function ( gltf ) {
          let loadedScene = gltf.scene;
          loadedScene.updateMatrixWorld();
          sketch.loadedModel = loadedScene;
          sketch.mountains.getLines(loadedScene, sketch.lineMaterial).forEach(line => sketch.scene.add(line));
        },
        function ( xhr ) {
          console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );
        },
        function ( error ) {
          console.log( 'An error happened:', error );
        }
    );
  }

  render() {
    if (!this.isPlaying) return;
    this.uniforms.uTime.value += this.timedelta;
    this.mountains.advanceTime(this.timedelta);

    requestAnimationFrame(this.render.bind(this));

    this.lineMaterial.uniforms.uTexture.value = this.mountains.renderTexture(this.renderer);
    this.renderer.setRenderTarget(null);
    this.renderer.render(this.scene, this.camera);
  }
}

let container = document.getElementById("container");
let mountains = new SamplingMountain(container);
let sketch = new Sketch({dom: container}, mountains);

document.onmousemove = function(e) {
  let mousePositionX = (e.pageX / sketch.width) * 2 - 1;
  let mousePositionY = -((e.pageY / sketch.height) * 2 - 1);

  sketch.caster.setFromCamera(new THREE.Vector2(mousePositionX, mousePositionY), sketch.camera);
  let intersects = sketch.caster.intersectObjects(sketch.loadedModel.children);
  if (intersects.length > 0) {
    sketch.uniforms.uMousePosition.value = intersects[0].point;
  }
  else {
    sketch.uniforms.uMousePosition.value = new THREE.Vector3(10^10, 10^10, 10^10);
  }
}
