import * as THREE from 'three';
import { MeshLineGeometry, MeshLineMaterial } from 'meshline'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'

import vertexLine from './shader/vertexLine.glsl'
import vertex from './shader/vertex.glsl'
import fragmentLine from './shader/fragmentLine.glsl'
import fragment from './shader/fragment.glsl'
import heightsTexture from './textures/scene256.png'

export class Sketch {
  modelFilePath = './modelflow/textures/scene.gltf';
  modelXRange = [-1, 1];
  modelZRange = [-1, 1];
  lineCount = 20;
  lineSampleCount = 100;

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

  constructor(options) {
    this.scene = new THREE.Scene();

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
        value: new THREE.TextureLoader().load(heightsTexture)
      }
    };
    this.lineMaterial = this.getLineMaterial();

    this.setupFBO();
    this.resize();
    this.addObjects();
    this.addLines()
    this.render();
    this.setupResize();
  }

  setupFBO() {
    this.fboScene = new THREE.Scene();
    this.fboCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, -1, 1);
    this.fboCamera.position.set(0, 0, 1);
    this.fboCamera.lookAt(0, 0, 0);

    /*
    let geometry = new THREE.PlaneGeometry(2, 2);
    this.fboMaterial = new THREE.ShaderMaterial({
      uniforms: {
        uTime: {value: 0},
        uTexture: {value: new THREE.TextureLoader().load(heightsTexture)}
      },
      vertexShader: vertex,
      fragmentShader: fragment,
    });

    this.fboMesh = new THREE.Mesh(geometry, this.fboMaterial);
    this.fboScene.add(this.fboMesh);
     */
  }

  renderTexture() {
    if (this.loadedTexture === null) {
      this.loadedTexture = new THREE.TextureLoader().load(heightsTexture);
    }
    return new THREE.TextureLoader().load(heightsTexture);
  }

  addLines() {
    for (let i = 1; i < this.lineCount; i++) {
      let tubeXPosition = this.modelXRange[0] + i/this.lineCount*(this.modelXRange[1]-this.modelXRange[0]);
      this.scene.add(this.getLineAt(tubeXPosition));
    }
  }

  getLineAt(x) {
    let linePoints = [];
    for (let i = 0; i < this.lineSampleCount; i++) {
      let zPosition = this.modelZRange[0] + i/this.lineSampleCount*(this.modelZRange[1]-this.modelZRange[0]);
      linePoints.push(new THREE.Vector3(x, 0, zPosition));
    }

    const geometry = new MeshLineGeometry()
    geometry.setPoints(linePoints)
    const material = this.lineMaterial
    return new THREE.Mesh(geometry, material)
  }

  probeHeightTexture() {
    let textureSize = 256;
    let probingYHeight = 10;
    let probingDirection = new THREE.Vector3(0, -1, 0);

    let heights = [];
    let i = 0;
    for (let x = 0; x < textureSize; x++) {
      let xPosition = this.modelXRange[0] + x / textureSize * (this.modelXRange[1] - this.modelXRange[0]);
      for (let z = 0; z < textureSize; z++) {
        let zPosition = this.modelZRange[0] + z / textureSize * (this.modelZRange[1] - this.modelZRange[0]);
        let casterOrigin = new THREE.Vector3(xPosition, probingYHeight, zPosition);
        this.caster.set(casterOrigin, probingDirection);
        let intersects = this.caster.intersectObjects(this.loadedModel.children);
        heights.push(intersects.length > 0 ? intersects[0].point.y : 0);
        i++;
        console.log(i / textureSize ** 2 * 100);
      }
    }

    console.log(JSON.stringify(heights));
  }

  /*
  loadHeightTexture() {
    let textureSize = 256;
    let data = new Float32Array(textureSize * textureSize * 4);
    for (let i = 0; i < textureSize; x++) {
      let index = (x + z * textureSize) * 4;
      let intersectionHeight = this.encodeHeight(intersects[0].point.y);
      data[index + 0] = intersectionHeight;
      data[index + 1] = intersectionHeight;
      data[index + 2] = intersectionHeight;
    }

    let texture = new THREE.DataTexture(this.data, this.size, this.size, THREE.RGBAFormat, THREE.FloatType);
    texture.needsUpdate = true;

    let geometry = new THREE.PlaneGeometry(2, 2);

    let fboMaterial = new THREE.ShaderMaterial({
      uniforms: {
        uTime: {value: 0},
        uHeightTexture: {value: texture}
      },
      vertexShader: vertex,
      fragmentShader: fragment,
    });

    let fboMesh = new THREE.Mesh(geometry, fboMaterial);
    this.fboScene.add(fboMesh);

  }
  */

  getLineMaterial() {
    let material = new MeshLineMaterial({ color: new THREE.Color(0xffffff), lineWidth: 0.002});
    material.vertexShader = vertexLine;
    material.fragmentShader = fragmentLine;
    material.transparent = true;
    //material.neeedsUpdate = true;
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

    //this.lineMaterial.uniforms.uTexture.value = this.renderTexture()
    this.renderer.setRenderTarget(null);
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
