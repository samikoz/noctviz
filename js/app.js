import * as THREE from "three";
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { MeshLine, MeshLineMaterial } from 'three.meshline';

export class Sketch {
  constructor(options) {
    this.scene = new THREE.Scene();
    this.gltfLoader = new GLTFLoader();

    this.container = options.dom;
    this.width = this.container.offsetWidth;
    this.height = this.container.offsetHeight;
    this.renderer = new THREE.WebGLRenderer();
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(this.width, this.height);
    this.renderer.setClearColor(0x05233c, 1);
    this.renderer.outputEncoding = THREE.sRGBEncoding;

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
      uMouseWorldPosition: {
        type: "v3",
        value: new THREE.Vector3()
      }
    };

    this.resize();
    this.addObjects();
    this.render();
    this.setupResize();
  }

  populateIsolines() {
    this.scene.updateMatrixWorld();
    let lineCount = 20;
    const modelXInterval = [-1, 1];
    for (let i = 1; i < lineCount; i++) {
      let tubeXPosition = modelXInterval[0] + i/lineCount*(modelXInterval[1]-modelXInterval[0]);
      this.scene.add(this.getIsolineAt(tubeXPosition));
    }
  }

  getIsolineAt(x) {
    let probingYHeight = 10;
    let probingCount = 100;
    let probingDirection = new THREE.Vector3(0, -1, 0);
    const modelZInterval = [ -1, 1 ];

    let linePoints = [];
    for (let i = 0; i < probingCount; i++) {
      let zPosition = modelZInterval[0] + i/probingCount*(modelZInterval[1]-modelZInterval[0]);
      let casterOrigin = new THREE.Vector3(x, probingYHeight, zPosition);
      let caster = new THREE.Raycaster(casterOrigin, probingDirection);
      let intersects = caster.intersectObjects(this.model.children);
      if (intersects.length > 0) {
        let intersection = intersects[0].point;
        linePoints.push(new THREE.Vector3(intersection.x, intersection.y, intersection.z));
      }
    }

    const geometry = new THREE.BufferGeometry().setFromPoints(linePoints);
    const line = new MeshLine();
    line.setGeometry(geometry);
    let material = new MeshLineMaterial({ color: new THREE.Color(0xffffff), lineWidth: 0.002});
    material.transparent = true;
    return new THREE.Mesh(line, material);
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
    this.gltfLoader.load(
        '../textures/scene.gltf',
        function ( gltf ) {
          let loadedScene = gltf.scene;
          sketch.model = loadedScene;
          sketch.model.updateMatrixWorld();
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
  let intersects = sketch.caster.intersectObjects(sketch.scene.children);
  sketch.uniforms.uMouseWorldPosition.value = intersects[0].point;
}
