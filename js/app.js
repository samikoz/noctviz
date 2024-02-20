import * as THREE from "three";
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { MeshLine, MeshLineMaterial } from 'three.meshline';

import mountains from '../textures/mountains.png'
import vertexLine from './shader/vertexLine.glsl'
import fragmentLine from './shader/fragmentLine.glsl'

export class Sketch {
  constructor(options) {
    this.scene = new THREE.Scene();

    this.container = options.dom;
    this.width = this.container.offsetWidth;
    this.height = this.container.offsetHeight;
    this.renderer = new THREE.WebGLRenderer();
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(this.width, this.height);
    this.renderer.setClearColor(0x000000, 1);
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

    this.isPlaying = true;
    let mountainTexture = new THREE.TextureLoader().load(mountains);
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
      },
      uMountains: {
        value: mountainTexture
      }
    };
    this.material = this.getMaterial();

    this.resize();
    this.addLines();
    this.render();
    this.setupResize();
  }

  addLines() {
    this.scene.updateMatrixWorld();
    let lineCount = 20;
    const modelXInterval = [-1, 1];
    for (let i = 1; i < lineCount; i++) {
      let tubeXPosition = modelXInterval[0] + i/lineCount*(modelXInterval[1]-modelXInterval[0]);
      this.scene.add(this.getLineAt(tubeXPosition));
    }
  }

  getLineAt(x) {
    let probingCount = 100;
    const modelZInterval = [ -1, 1 ];

    let linePoints = [];
    for (let i = 0; i < probingCount; i++) {
      let zPosition = modelZInterval[0] + i/probingCount*(modelZInterval[1]-modelZInterval[0]);
      linePoints.push(new THREE.Vector3(x, 0, zPosition));
    }

    const geometry = new THREE.BufferGeometry().setFromPoints(linePoints);
    const line = new MeshLine();
    line.setGeometry(geometry);
    return new THREE.Mesh(line, this.material);
  }

  getMaterial() {
    let material = new MeshLineMaterial({ color: new THREE.Color(0xffffff), lineWidth: 0.002});
    material.vertexShader = vertexLine;
    material.fragmentShader = fragmentLine;
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
    //this.uniforms.uTime.value += 0.05;

    requestAnimationFrame(this.render.bind(this));
    this.renderer.render(this.scene, this.camera);
  }
}

let sketch = new Sketch({
  dom: document.getElementById("container")
});

/*
document.onmousemove = function(e) {
  let mousePositionX = (e.pageX / sketch.width) * 2 - 1;
  let mousePositionY = -((e.pageY / sketch.height) * 2 - 1);

  sketch.caster.setFromCamera(new THREE.Vector2(mousePositionX, mousePositionY), sketch.camera);
  let intersects = sketch.caster.intersectObjects(sketch.model.children);
  sketch.uniforms.uMouseWorldPosition.value = intersects[0].point;
}
*/
