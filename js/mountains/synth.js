import * as THREE from "three";

import noiseVertex from "../shader/noiseVertex.glsl";
import noiseFragment from "../shader/noiseFragment.glsl";
import vertexLine from "../shader/vertexSynthLine.glsl";
import fragmentLine from '../shader/fragmentModelLine.glsl'
import BaseMountain from "./base";

export default class SyntheticMountain extends BaseMountain {
    getRenderTarget() {
        return new THREE.WebGLRenderTarget(this.container.offsetWidth, this.container.offsetHeight, {
            minFilter: THREE.NearestFilter,
            magFilter: THREE.NearestFilter,
            format: THREE.RGBAFormat,
            type: THREE.FloatType
        });
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

    renderTexture(renderer) {
        renderer.setRenderTarget(this.fbo);
        renderer.render(this.fboScene, this.fboCamera);

        return this.fbo.texture;
    }

    getLineVertexShader() {
        return vertexLine;
    }

    getLineFragmentShader() {
        return fragmentLine;
    }

    advanceTime(delta) {
    }
}