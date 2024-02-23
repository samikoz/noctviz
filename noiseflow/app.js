import * as THREE from "three";
import { MeshLineGeometry, MeshLineMaterial } from 'meshline'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'

import vertexLine from './shader/vertexLine.glsl'
import noiseVertex from "./shader/noiseVertex.glsl";
import noiseFragment from "./shader/noiseFragment.glsl";

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
      uNoise: {value: null},
    };
    this.material = this.getMaterial();

    this.resize();
    this.setupFBO();
    this.addLines();
    this.render();
    this.setupResize();
  }

  getRenderTarget() {
    return new THREE.WebGLRenderTarget(this.width, this.height, {
      minFilter: THREE.NearestFilter,
      magFilter: THREE.NearestFilter,
      format: THREE.RGBAFormat,
      type: THREE.FloatType
    });
  }

  setupFBO() {
    this.size = 256;
    this.fbo = this.getRenderTarget();

    this.fboScene = new THREE.Scene();
    this.fboCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, -1, 1);
    this.fboCamera.position.set(0, 0, 1);
    this.fboCamera.lookAt(0, 0, 0);

    let geometry = new THREE.PlaneGeometry(2, 2);
    this.fboMaterial = new THREE.ShaderMaterial({
      uniforms: {
        uTime: {value: 0},
      },
      vertexShader: noiseVertex,
      fragmentShader: noiseFragment,
    });

    this.fboMesh = new THREE.Mesh(geometry, this.fboMaterial);
    this.fboScene.add(this.fboMesh);
  }

  renderTexture() {
    this.renderer.setRenderTarget(this.fbo);
    this.renderer.render(this.fboScene, this.fboCamera);

    return this.fbo.texture;
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

    const geometry = new MeshLineGeometry()
    geometry.setPoints(linePoints)
    const material = this.lineMaterial
    return new THREE.Mesh(geometry, material)
  }

  getMaterial() {
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
    this.fboMaterial.uniforms.uTime.value += 0.05;

    requestAnimationFrame(this.render.bind(this));

    this.lineMaterial.uniforms.uNoise.value = this.renderTexture()
    this.renderer.setRenderTarget(null);
    this.renderer.render(this.scene, this.camera);
  }
}

let sketch = new Sketch({
  dom: document.getElementById("container")
});
