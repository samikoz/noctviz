import * as THREE from 'three';
import { MeshLineMaterial } from 'meshline'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'

import SyntheticMountains from "./mountains";
import {BaseSceneSetup, FormFilledSetup, HillFormingSetup, InitialZoomOutSetup} from "./sceneControls";

export class Sketch {
  distortionSize= 0.2;
  amplitude = 0.65;
  lineSpeed = 0.5;
  timeSpeed = 0.15;

  timedelta = 0.05;

  constructor(options, setup, mountains) {
    this.scene = new THREE.Scene();
    this.setup = setup;
    this.mountains = mountains;

    this.container = options.dom;
    this.width = this.container.offsetWidth;
    this.height = this.container.offsetHeight;
    this.renderer = new THREE.WebGLRenderer();
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(this.width, this.height);
    this.renderer.setClearColor(0x222323, 1);
    this.renderer.outputColorSpace = THREE.SRGBColorSpace

    this.container.appendChild(this.renderer.domElement);

    this.camera = new THREE.PerspectiveCamera(
        70,
        window.innerWidth / window.innerHeight,
        0.001,
        1000
    );

    this.camera.position.set(0, 0, -4);
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enabled = false;
    this.setup.setControls(this.camera, this.controls);
    this.caster = new THREE.Raycaster();

    this.setup.setFboShaders(this.mountains);
    //this.mountains.setupFBO(this.renderer);

    this.isPlaying = true;
    this.uniforms = {
      uTime: {
        type: "f",
        value: 0.0
      },
      uBillowTime: {
        type: "f",
        value: 0.0
      },
      uNewHillTime: {
        type: "f",
        value: 0.0
      },
      uResolution: {
        type: "v2",
        value: new THREE.Vector2()
      },
      uLookDirection: {
        type: "v3",
        value: new THREE.Vector3()
      },
      uEyePosition: {
        type: "v3",
        value: new THREE.Vector3()
      },
      uDistortionSize: {
        type: "f",
        value: this.distortionSize,
      },
      uLineSpeed: {
        type: "f",
        value: this.lineSpeed,
      },
      uTimeSpeed: {
        type: "f",
        value: this.timeSpeed,
      },
      uBoundX: {
        type: "f",
        value: this.mountains.xBound
      },
      uBoundZ: {
        type: "f",
        value: this.mountains.zBound
      },
      uAmplitude: {
        type: "f",
        value: this.amplitude
      },
      uLoneHillHeight: {
        type: "f",
        value: 0.2,
      },
      uLoneHillSize: {
        type: "f",
        value: 0.35
      },
      uPositions: {
        value: null
      }
    };
    this.lineMaterial = this.getLineMaterial();

    this.resize();
    this.mountains.getLines(this.lineMaterial).forEach(line => this.scene.add(line));
    this.render();
    this.setupResize();
  }

  getLineMaterial() {
    let material = new MeshLineMaterial({ resolution: new THREE.Vector2(this.width, this.height), lineWidth: 0.002});
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

  render() {
    if (!this.isPlaying) return;
    this.setup.updateControls(this);

    requestAnimationFrame(this.render.bind(this));

    //this.uniforms.uPositions.value = this.mountains.renderTexture(this.renderer);
    this.renderer.setRenderTarget(null);
    this.renderer.render(this.scene, this.camera);
  }
}

let container = document.getElementById("container");
let setup = new InitialZoomOutSetup();
let mountains = new SyntheticMountains(container);
let sketch = new Sketch({dom: container}, setup, mountains);


document.onmousemove = function(e) {
  let mousePositionX = (e.pageX / sketch.width) * 2 - 1;
  let mousePositionY = -((e.pageY / sketch.height) * 2 - 1);

  sketch.caster.setFromCamera(new THREE.Vector2(mousePositionX, mousePositionY), sketch.camera);
  sketch.uniforms.uLookDirection.value = sketch.caster.ray.direction;
  sketch.uniforms.uEyePosition.value = sketch.caster.ray.origin;
}

document.onkeyup = function (e) {
  if (e.key === "n") {
    sketch.setup = new HillFormingSetup(sketch.uniforms);
    sketch.setup.setControls(sketch.camera, sketch.controls);
  }
  if (e.key === "m") {
    sketch.uniforms.uLoneHillHeight.value += 0.05;
  }
  if (e.key === "o") {
    sketch.setup = new FormFilledSetup(sketch.uniforms);
    sketch.setup.setControls(sketch.camera, sketch.controls);
  }
}

sketch.controls.addEventListener("change", event => {
  let target = sketch.controls.target;
  let position = sketch.controls.object.position;
  let up = sketch.camera.up;
  console.log("look direction:", target.x, ",", target.y, ",", target.z);
  console.log("camera position:", position.x, ",", position.y, ",", position.z);
  console.log("camera up direction:", up.x, ",", up.y, ",", up.z);
});
