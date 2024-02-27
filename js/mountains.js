import * as THREE from "three";
import {MeshLineGeometry} from "meshline";
import noiseVertex from "./shader/noiseVertex.glsl";
import noiseFragment from "./shader/noiseFragment.glsl";
import vertexLine from "./shader/vertexLine.glsl";
import fragmentLine from "./shader/fragmentLine.glsl";

export default class SyntheticMountains {
    modelXRange = [-2, 2];
    modelZRange = [-2, 2];
    lineCount = 100;
    lineColorCount = 6;
    lineSampleCount = 300;

    constructor(container) {
        this.container = container;
    }

    setupFBO() {
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

    getRenderTarget() {
        return new THREE.WebGLRenderTarget(this.container.offsetWidth, this.container.offsetHeight, {
            minFilter: THREE.NearestFilter,
            magFilter: THREE.NearestFilter,
            format: THREE.RGBAFormat,
            type: THREE.FloatType
        });
    }

    getLines(lineMaterials) {
        let lines = []
        for (let i = 1; i < this.lineCount; i++) {
            let tubeXPosition = this.modelXRange[0] + i/this.lineCount*(this.modelXRange[1]-this.modelXRange[0]);
            lines.push(this.getLineAt(tubeXPosition, lineMaterials[i % this.lineColorCount]));
        }
        return lines;
    }

    getLineAt(x, lineMaterial) {
        let linePoints = [];
        for (let i = 0; i < this.lineSampleCount; i++) {
            let zPosition = this.modelZRange[0] + i/this.lineSampleCount*(this.modelZRange[1]-this.modelZRange[0]);
            linePoints.push(new THREE.Vector3(x, 0, zPosition));
        }

        const geometry = new MeshLineGeometry();
        geometry.setPoints(linePoints);
        return new THREE.Mesh(geometry, lineMaterial);
    }

    renderTexture(renderer) {
        /*
        renderer.setRenderTarget(this.fbo);
        renderer.render(this.fboScene, this.fboCamera);

        return this.fbo.texture;
         */
    }

    getLineVertexShader() {
        return vertexLine;
    }

    getLineFragmentShader() {
        return fragmentLine;
    }

    advanceTime(delta) {
        this.fboMaterial.uniforms.uTime.value += delta;
    }
}