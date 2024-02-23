import * as THREE from "three";
import heightsTexture from "../textures/scene256.png";

import vertexLine from '../shader/vertexModelLine.glsl'
import fragmentLine from '../shader/fragmentModelLine.glsl'

export default class SampledMountain {
    constructor(container) {
        this.container = container;
        this.uniformTexture = null;
    }

    setupFBO() {
        this.fboScene = new THREE.Scene();
        this.fboCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, -1, 1);
        this.fboCamera.position.set(0, 0, 1);
        this.fboCamera.lookAt(0, 0, 0);
    }

    renderTexture(renderer) {
        if (this.uniformTexture === null) {
            this.uniformTexture = new THREE.TextureLoader().load(heightsTexture);
        }
        return this.uniformTexture;
    }

    getLineVertexShader() {
        return vertexLine;
    }

    getLineFragmentShader() {
        return fragmentLine;
    }

    advanceTime() {

    }
}