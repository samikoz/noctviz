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
        controls.update();
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

        this.cameraPosition = new THREE.Vector3( -6.4719038967808205 , 0.6643187322533091 , -2.2184466399154736);
        this.controlsTarget = new THREE.Vector3(-0.3698513859458585 , -1.721758713941256 , -0.617765688585641);
        this.staticFbo = true;
        this.fboFragmentShader = fboFragment;
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

export class MountainFromTop extends BaseSceneSetup {
    constructor() {
        super();

        this.cameraPosition = new THREE.Vector3(-5.798987913112854 , 2.821853629707401 , 2.3056976943129923);
        this.controlsTarget = new THREE.Vector3(-0.3698513859458585 , -1.721758713941256 , -0.617765688585641);
    }
}