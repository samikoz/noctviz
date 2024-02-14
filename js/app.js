import * as THREE from "three";
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import fragmentMountain from "./shader/fragmentMountainTexture.glsl"
import vertexMountain from "./shader/vertexMountainTexture.glsl"
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import stripes from "../textures/stripes.png"

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

    this.addObjects();
    this.resize();
    this.render();
    this.setupResize();
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
    this.material = this.getShaderMaterial();
    this.gltfLoader.load(
        '../textures/scene.gltf',
        function ( gltf ) {
          let loadedScene = gltf.scene;
          loadedScene.traverse((o) => {
            if (o.isMesh) {
              o.material = sketch.material;
            }
          });
          sketch.scene.add( loadedScene );
        },
        function ( xhr ) {
          console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );
        },
        function ( error ) {
          console.log( 'An error happened:', error );
        }
    );
  }

  getShaderMaterial() {
    let stripesTexture = new THREE.TextureLoader().load(stripes);
    stripesTexture.wrapS = THREE.RepeatWrapping;
    stripesTexture.wrapT = THREE.RepeatWrapping;

    this.uniforms.uStripes = { value: stripesTexture };
    return new THREE.ShaderMaterial({
      extensions: {
        derivatives: "#extension GL_OES_standard_derivatives : enable"
      },
      side: THREE.DoubleSide,
      uniforms: this.uniforms,
      transparent: true,
      depthTest: false,
      fragmentShader: fragmentMountain,
      vertexShader: vertexMountain
    });
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
