import * as THREE from "three";

import fboFragment from "./shader/fboFragment.glsl";

export class BaseSceneSetup {
    constructor() {
        this.cameraPosition = new THREE.Vector3(0, 0, -4);
        this.controlsTarget = new THREE.Vector3(0, 0, 0);
        this.up = new THREE.Vector3(0, 1, 0);
        this.staticFbo = true;
        this.fboFragmentShader = fboFragment;
    }

    setControls(camera, controls) {
        camera.position.set(this.cameraPosition.x, this.cameraPosition.y, this.cameraPosition.z);
        controls.target.set(this.controlsTarget.x, this.controlsTarget.y, this.controlsTarget.z);
        camera.up.set(this.up.x, this.up.y, this.up.z);
        controls.update();
    }

    setFboShaders(mountains) {
        mountains.staticFbo = this.staticFbo;
        mountains.fboFragmentShader = this.fboFragmentShader;
    }

    updateControls(time, camera, controls) {
        controls.update();
    }
}

export class ZoomingOutSetup extends BaseSceneSetup {
    constructor() {
        super();

        this.cameraPosition = new THREE.Vector3(-0.017708093695503725 , 0.10034586427452119 , -0.02882869418323792);
        this.controlsTarget = new THREE.Vector3(-0.017708093695503732, 0.10034586427452119, 0);
        this.fboFragmentShader = fboFragment;

        this.finalcameraZPosition = -4.614020485223368;
    }

    updateControls(time, camera, controls) {
        let zoomDuration = 20;
        if (time < zoomDuration) {
            let smoothTime = THREE.MathUtils.smootherstep(time, 0, zoomDuration);
            let zPosition = this.cameraPosition.z * (1-smoothTime)  + this.finalcameraZPosition * smoothTime;
            camera.position.set(this.cameraPosition.x, this.cameraPosition.y, zPosition);
        }
    }
}

export class RightSideSceneSetup extends ZoomingOutSetup {
    constructor(initialTime, amplitude) {
        super();
        this.initialTime = initialTime;
        this.amplitude = amplitude;
        this.initialAmplitudeValue = amplitude.value;

        this.cameraPosition.z = this.finalcameraZPosition;
        this.fboFragmentShader = fboFragment;

        this.finalControlsTarget = new THREE.Vector3(  4.144632093888078 , 0.009658386424057334 , -2.149267653066033);
        this.finalCameraPosition = new THREE.Vector3(3.3178048840216308 , 0.6746253381988925 , -2.450103520752379);
        this.finalUpPosition = new THREE.Vector3(0.12895533823797742 , 0.9688434461390165 , 0.31145424472778138);

    }

    updateControls(time, camera, controls) {
        let zoomDuration = 10;
        let offsetTime = time - this.initialTime;
        if (offsetTime < zoomDuration) {
            let smoothTime = THREE.MathUtils.smootherstep(offsetTime, 0, zoomDuration);
            let zCameraPosition = this.cameraPosition.z * (1-smoothTime)  + this.finalCameraPosition.z * smoothTime;
            let yCameraPosition = this.cameraPosition.y * (1-smoothTime)  + this.finalCameraPosition.y * smoothTime;
            let xCameraPosition = this.cameraPosition.x * (1-smoothTime)  + this.finalCameraPosition.x * smoothTime;

            let zTargetPosition = this.controlsTarget.z * (1-smoothTime)  + this.finalControlsTarget.z * smoothTime;
            let yTargetPosition = this.controlsTarget.y * (1-smoothTime)  + this.finalControlsTarget.y * smoothTime;
            let xTargetPosition = this.controlsTarget.x * (1-smoothTime)  + this.finalControlsTarget.x * smoothTime;

            let zUpPosition = this.up.z * (1-smoothTime)  + this.finalUpPosition.z * smoothTime;
            let yUpPosition = this.up.y * (1-smoothTime)  + this.finalUpPosition.y * smoothTime;
            let xUpPosition = this.up.x * (1-smoothTime)  + this.finalUpPosition.x * smoothTime;
            camera.position.set(xCameraPosition, yCameraPosition, zCameraPosition);
            camera.up.set(xUpPosition, yUpPosition, zUpPosition);
            controls.target.set(xTargetPosition, yTargetPosition, zTargetPosition);
            controls.update();

            this.amplitude.value = this.initialAmplitudeValue * (1 - smoothTime) + 0.2 * smoothTime;
        }
    }
}