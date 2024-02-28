import * as THREE from "three";

import fboFragment from "./shader/fboFragment.glsl";
import fboRightSide from "./shader/rightSideFragment.glsl"

export class BaseSceneSetup {
    constructor() {
        this.cameraPosition = new THREE.Vector3(0, 0, -4);
        this.controlsTarget = new THREE.Vector3(0, 0, 0);
        this.staticFbo = true;
        this.fboFragmentShader = fboFragment;
    }

    setControls(camera, controls) {
        camera.position.set(this.cameraPosition.x, this.cameraPosition.y, this.cameraPosition.z);
        controls.target.set(this.controlsTarget.x, this.controlsTarget.y, this.controlsTarget.z);
    }

    setFboShaders(mountains) {
        mountains.staticFbo = this.staticFbo;
        mountains.fboFragmentShader = this.fboFragmentShader;
    }

    updateControls(time, camera, controls) {

    }
}


export class RightSideSceneSetup extends BaseSceneSetup {
    constructor() {
        super();

        this.cameraPosition = new THREE.Vector3(1.830401043339714, -0.1632315365325554, -2.3851403121342822)
        this.controlsTarget = new THREE.Vector3(1.8174435844439023, -0.12865413165305759,0);
        this.staticFbo = true;
        this.fboFragmentShader = fboRightSide;
    }
}


export class ZoomingOutSetup extends BaseSceneSetup {
    constructor() {
        super();

        this.cameraPosition = new THREE.Vector3(-0.017708093695503725 , 0.10034586427452119 , -0.02882869418323792);
        this.controlsTarget = new THREE.Vector3(-0.017708093695503732, 0.10034586427452119, 0);
        this.staticFbo = true;
        this.fboFragmentShader = fboFragment;

        this.finalcameraZPosition = -4.614020485223368;
    }

    updateControls(time, camera, controls) {
        let zoomDuration = 20;
        if (time < zoomDuration) {
            let smoothTime = THREE.MathUtils.smootherstep(time, 0, zoomDuration);
            console.log(smoothTime);
            let zPosition = this.cameraPosition.z * (1-smoothTime)  + this.finalcameraZPosition * smoothTime;
            camera.position.set(this.cameraPosition.x, this.cameraPosition.y, zPosition);
        }
    }
}