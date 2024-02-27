import * as THREE from "three";
import {MeshLineGeometry} from "meshline";
import fboVertex from "./shader/fboVertex.glsl";
import fboFragment from "./shader/fboFragment.glsl";
import vertexLine from "./shader/vertexLine.glsl";
import fragmentLine from "./shader/fragmentLine.glsl";

export default class SyntheticMountains {
    xBound = 2;
    zBound = 2;
    lineCount = 128;
    lineSampleCount = 512;

    constructor(container) {
        this.container = container;
    }

    setupFBO() {
        this.fbo = this.getRenderTarget();

        this.fboScene = new THREE.Scene();
        this.fboCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, -1, 1);
        this.fboCamera.position.set(0, 0, 1);
        this.fboCamera.lookAt(0, 0, 0);

        this.data = new Float32Array(this.lineSampleCount*this.lineSampleCount*4);
        for (let pointAlongIndex = 0; pointAlongIndex < this.lineSampleCount; pointAlongIndex++) {
            for (let lineIndex = 1; lineIndex < this.lineCount; lineIndex++) {
                let index = (pointAlongIndex + 4*lineIndex * this.lineSampleCount)*4;
                this.data[index + 0] = this.getStepFromRange(pointAlongIndex, this.lineSampleCount, this.xBound);
                this.data[index + 1] = 0.
                this.data[index + 2] = this.getStepFromRange(lineIndex, this.lineCount, this.zBound);
                this.data[index + 3] = 1.;

                this.data[index - 4*this.lineSampleCount + 0] = this.getStepFromRange(pointAlongIndex, this.lineSampleCount, this.xBound);
                this.data[index - 4*this.lineSampleCount + 1] = 0.;
                this.data[index - 4*this.lineSampleCount + 2] = this.getStepFromRange(lineIndex, this.lineCount, this.zBound);
                this.data[index - 4*this.lineSampleCount + 3] = 1.;

                this.data[index + 4*this.lineSampleCount + 0] = this.getStepFromRange(pointAlongIndex, this.lineSampleCount, this.xBound);
                this.data[index + 4*this.lineSampleCount + 1] = 0.
                this.data[index + 4*this.lineSampleCount + 2] = this.getStepFromRange(lineIndex, this.lineCount, this.zBound);
                this.data[index + 4*this.lineSampleCount + 3] = 1.;
            }
        }

        this.fboTexture = new THREE.DataTexture(this.data, this.lineSampleCount, this.lineSampleCount, THREE.RGBAFormat, THREE.FloatType);
        this.fboTexture.magFilter = THREE.NearestFilter;
        this.fboTexture.minFilter = THREE.NearestFilter;
        this.fboTexture.needsUpdate = true;

        let geometry = new THREE.PlaneGeometry(2, 2);
        this.fboMaterial = new THREE.ShaderMaterial({
            uniforms: {
                uTime: {value: 0},
                uPositions: {value: this.fboTexture},
            },
            vertexShader: fboVertex,
            fragmentShader: fboFragment,
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

    getLines(lineMaterial) {
        let lines = []
        for (let i = 1; i < this.lineCount; i++) {
            let lineXPosition = this.getStepFromRange(i, this.lineCount, this.xBound);
            lines.push(this.getLineAt(lineXPosition, lineMaterial));
        }
        return lines;
    }

    getLineAt(x, lineMaterial) {
        let linePoints = [];
        for (let i = 0; i < this.lineSampleCount; i++) {
            let zPosition = this.getStepFromRange(i, this.lineSampleCount, this.zBound);
            linePoints.push(new THREE.Vector3(x, 0, zPosition));
        }

        const geometry = new MeshLineGeometry();
        geometry.setPoints(linePoints);
        return new THREE.Mesh(geometry, lineMaterial);
    }

    getStepFromRange(step, totalSteps, bound) {
        return -bound + (step/totalSteps)*(2*bound);
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
        this.fboMaterial.uniforms.uTime.value += delta;
    }
}