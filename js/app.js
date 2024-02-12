import * as THREE from "three";
import vertex from "./shader/vertexParticles.glsl"
import vertexTube from "./shader/vertexTube.glsl"
import fragment from "./shader/fragmentParticles.glsl"
import fragmentTube from "./shader/fragmentTube.glsl"
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import normals from "../textures/sphere-normal.jpeg"
import dots from "../textures/dots.png"
import stripes from "../textures/stripes.png"

const { sin, cos } = Math;

export class Sketch {
  constructor(options) {
    this.scene = new THREE.Scene();

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
    this.time = 0;

    this.isPlaying = true;
    
    this.addObjects();
    this.resize();
    this.render();
    this.setupResize();
    // this.settings();
  }

  settings() {
    let that = this;
    this.settings = {
      progress: 0,
    };
  }

  setupResize() {
    window.addEventListener("resize", this.resize.bind(this));
  }

  resize() {
    this.width = this.container.offsetWidth;
    this.height = this.container.offsetHeight;
    this.renderer.setSize(this.width, this.height);
    this.camera.aspect = this.width / this.height;
    this.camera.updateProjectionMatrix();
  }

  addObjects() {
    this.addParticles();

    this.addCurrents();
  }

  addParticles() {
    this.material = new THREE.ShaderMaterial({
      extensions: {
        derivatives: "#extension GL_OES_standard_derivatives : enable"
      },
      side: THREE.DoubleSide,
      uniforms: {
        time: { type: "f", value: 0 },
        resolution: { type: "v4", value: new THREE.Vector4() },
        uNormals: { value: new THREE.TextureLoader().load(normals) },
        uvRate1: {
          value: new THREE.Vector2(1, 1)
        }
      },
      transparent: true,
      depthTest: false,
      vertexShader: vertex,
      fragmentShader: fragment
    });

    let particleCount= 10000;

    this.geometry = new THREE.BufferGeometry();
    this.positions = new Float32Array(particleCount*3);
    this.randoms = new Float32Array(particleCount*3);
    this.sizes = new Float32Array(particleCount);

    for (let i = 0; i < particleCount * 3; i+=3) {
      this.positions[i + 0] = (Math.random() - 0.5);
      this.positions[i + 1] = (Math.random() - 0.5);
      this.positions[i + 2] = (Math.random() - 0.5);

      this.randoms[i + 0] = Math.random();
      this.randoms[i + 1] = Math.random();
      this.randoms[i + 2] = Math.random();

      this.sizes[i] = 0.5 + 0.5*Math.random();
    }

    this.geometry.setAttribute("position", new THREE.BufferAttribute(this.positions, 3));
    this.geometry.setAttribute("aRandom", new THREE.BufferAttribute(this.randoms, 3));
    this.geometry.setAttribute("size", new THREE.BufferAttribute(this.sizes, 1));

    this.particles = new THREE.Points(this.geometry, this.material);
    this.scene.add(this.particles);
  }

  addCurrents() {
    let points = [];

    for (let i = 0; i <= 100; i++) {
      let angle = 2*Math.PI*i/100;
      let x = sin(angle) + 2. * sin(2. * angle);
      let y = cos(angle) - 2. * cos(2. * angle);
      let z = -sin(3. * angle);
      points.push(new THREE.Vector3(x, y, z));

    }
    let curve = new THREE.CatmullRomCurve3(points);
    this.tubeGeo = new THREE.TubeGeometry(curve, 100, 0.4, 100, true);

    let dotsTexture = new THREE.TextureLoader().load(dots);
    dotsTexture.wrapS = THREE.RepeatWrapping;
    dotsTexture.wrapT = THREE.RepeatWrapping;
    let stripesTexture = new THREE.TextureLoader().load(stripes);
    stripesTexture.wrapS = THREE.RepeatWrapping;
    stripesTexture.wrapT = THREE.RepeatWrapping;

    this.tubeMaterial = new THREE.ShaderMaterial({
      extensions: {
        derivatives: "#extension GL_OES_standard_derivatives : enable"
      },
      side: THREE.FrontSide,
      uniforms: {
        time: { type: "f", value: 0 },
        resolution: { type: "v4", value: new THREE.Vector4() },
        uDots: { value: dotsTexture },
        uStripes: { value: stripesTexture }
      },
      transparent: true,
      depthTest: false,
      vertexShader: vertexTube,
      fragmentShader: fragmentTube
    });

    this.tube = new THREE.Mesh(this.tubeGeo, this.tubeMaterial);
    this.scene.add(this.tube);
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
    this.time += 0.05;
    this.material.uniforms.time.value = this.time;
    this.tubeMaterial.uniforms.time.value = this.time;
    requestAnimationFrame(this.render.bind(this));
    this.renderer.render(this.scene, this.camera);
  }
}

new Sketch({
  dom: document.getElementById("container")
});
