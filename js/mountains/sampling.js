import * as THREE from "three";

import vertexLine from '../shader/vertexModelLine.glsl'
import fragmentLine from '../shader/fragmentModelLine.glsl'
import BaseMountain from "./base";
import {MeshLineGeometry} from "meshline";

export default class SamplingMountain extends BaseMountain {
    constructor(container) {
        super(container);
        this.caster = new THREE.Raycaster();
    }

    getLines(scene, lineMaterial) {
        let textureSize = 32;
        let probingYHeight = 10;
        let probingDirection = new THREE.Vector3(0, -1, 0);

        let heights = [];
        let lines = []
        let progressIndex = 0;
        for (let x = 0; x < textureSize; x++) {
            let xPosition = this.modelXRange[0] + x / textureSize * (this.modelXRange[1] - this.modelXRange[0]);
            let linePoints = [];
            for (let z = 0; z < textureSize; z++) {
                let zPosition = this.modelZRange[0] + z / textureSize * (this.modelZRange[1] - this.modelZRange[0]);
                let casterOrigin = new THREE.Vector3(xPosition, probingYHeight, zPosition);
                this.caster.set(casterOrigin, probingDirection);
                let intersects = this.caster.intersectObjects(scene.children);
                let height = intersects.length > 0 ? intersects[0].point.y : 0;
                heights.push(height);
                linePoints.push(new THREE.Vector3(xPosition, height, zPosition));
                progressIndex++;
                console.log(progressIndex / textureSize ** 2 * 100);
            }

            const geometry = new MeshLineGeometry();
            geometry.setPoints(linePoints);
            lines.push(new THREE.Mesh(geometry, lineMaterial));
        }

        console.log(JSON.stringify(heights));
        return lines;
    }

    setupFBO() {
    }

    renderTexture(renderer) {
    }

    getLineVertexShader() {
    }

    getLineFragmentShader() {
    }

    advanceTime() {

    }
}