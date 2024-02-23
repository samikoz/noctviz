import * as THREE from "three";
import {MeshLineGeometry} from "meshline";

export default class BaseMountain {
    modelXRange = [-1, 1];
    modelZRange = [-1, 1];
    lineCount = 100;
    lineSampleCount = 200;

    constructor(container) {
        this.container = container;
    }

    getLines(scene, lineMaterial) {
        let lines = []
        for (let i = 1; i < this.lineCount; i++) {
            let tubeXPosition = this.modelXRange[0] + i/this.lineCount*(this.modelXRange[1]-this.modelXRange[0]);
            lines.push(this.getLineAt(tubeXPosition, lineMaterial));
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
}