import * as THREE from 'three';
import { MeshLineGeometry, MeshLineMaterial } from 'meshline'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'

import grad from './textures/gradient.png'
import vertexLine from './shader/vertexLine.glsl'

export class Sketch {
  modelFilePath = './modelflow/textures/scene.gltf';
  modelXRange = [-1, 1];
  modelZRange = [-1, 1];

  constructor(options) {
    this.scene = new THREE.Scene();
    this.gltfLoader = new GLTFLoader();

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
      }
    };
    this.lineMaterial = this.getLineMaterial();

    this.resize();
    this.addObjects();
    this.render();
    this.setupResize();
  }

  populateIsolines() {
    this.scene.updateMatrixWorld();
    let lineCount = 20;
    for (let i = 1; i < lineCount; i++) {
      let tubeXPosition = this.modelXRange[0] + i/lineCount*(this.modelXRange[1]-this.modelXRange[0]);
      this.scene.add(this.getIsolineAt(tubeXPosition));
    }
  }

  getIsolineAt(x) {
    let probingYHeight = 10;
    let probingCount = 100;
    let probingDirection = new THREE.Vector3(0, -1, 0);

    let linePoints = [];
    for (let i = 0; i < probingCount; i++) {
      let zPosition = this.modelZRange[0] + i/probingCount*(this.modelZRange[1]-this.modelZRange[0]);
      let casterOrigin = new THREE.Vector3(x, probingYHeight, zPosition);
      this.caster.set(casterOrigin, probingDirection);
      let intersects = this.caster.intersectObjects(this.loadedModel.children);
      if (intersects.length > 0) {
        let intersection = intersects[0].point;
        linePoints.push(new THREE.Vector3(intersection.x, intersection.y, intersection.z));
      }
    }

    const geometry = new MeshLineGeometry()
    geometry.setPoints(linePoints)
    const material = this.lineMaterial
    return new THREE.Mesh(geometry, material)
  }

  getLineMaterial() {
    let material = new MeshLineMaterial({ color: new THREE.Color(0xffffff), lineWidth: 0.002});
    material.vertexShader = vertexLine;
    material.transparent = true;
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
    sketch.gltfLoader.load(
        sketch.modelFilePath,
        function ( gltf ) {
          let loadedScene = gltf.scene;
          loadedScene.updateMatrixWorld();
          sketch.loadedModel = loadedScene;
          sketch.populateIsolines();
        },
        function ( xhr ) {
          console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );
        },
        function ( error ) {
          console.log( 'An error happened:', error );
        }
    );
  }

  stop() {
    this.isPlaying = false;
  }

  play() {
    if(!this.isPlaying){
      this.render()
      this.isPlaying = true;
    }
  }

  render() {
    if (!this.isPlaying) return;
    this.uniforms.uTime.value += 0.05;

    requestAnimationFrame(this.render.bind(this));
    this.renderer.render(this.scene, this.camera);
  }
}

let sketch = new Sketch({
  dom: document.getElementById("container")
});

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
