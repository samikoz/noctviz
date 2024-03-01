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

    updateControls(sketch) {
        sketch.uniforms.uTime.value += sketch.timedelta;
        sketch.uniforms.uBillowTime.value += sketch.timedelta;
    }
}

export class InitialZoomOutSetup extends BaseSceneSetup {
    constructor() {
        super();

        this.cameraPosition = new THREE.Vector3(-0.01770809369550381 , 0.10034586427452115 , 0.6125304975561604);
        this.controlsTarget = new THREE.Vector3(-0.01770809369550389 , 0.10034586427452111 , 1.2827183834787967);

        this.finalcameraZPosition = -6.386848693734031;
    }

    updateControls(sketch) {
        super.updateControls(sketch);
        let time = sketch.uniforms.uTime.value;
        let zoomDuration = 25;
        if (time < zoomDuration) {
            let smoothTime = THREE.MathUtils.smootherstep(time, 0, zoomDuration);
            let zPosition = this.cameraPosition.z * (1-smoothTime)  + this.finalcameraZPosition * smoothTime;
            sketch.camera.position.set(this.cameraPosition.x, this.cameraPosition.y, zPosition);
        }
    }
}

export class HillFormingSetup extends InitialZoomOutSetup {
    constructor(uniforms) {
        super();
        this.initialTime = uniforms.uTime.value;
        this.timeSpeed = uniforms.uTimeSpeed;
        this.initialTimeSpeed = uniforms.uTimeSpeed.value;
        this.amplitude = uniforms.uAmplitude;
        this.initialAmplitudeValue = uniforms.uAmplitude.value;

        this.cameraPosition.z = this.finalcameraZPosition;

        this.finalCameraPosition = new THREE.Vector3(2.9907487284474836 , 0.4766877781622922 , -1.9034252255755764);
        this.finalControlsTarget = new THREE.Vector3(4.282531081582864 , 0.1098231390699022 , -1.6012324578800312);
        this.finalUpPosition = new THREE.Vector3(0.12895533823797742 , 0.9688434461390165 , 0.31145424472778138);

    }

    updateControls(sketch) {
        let zoomDuration = 10;
        let offsetTime = sketch.uniforms.uTime.value - this.initialTime;
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
            sketch.camera.position.set(xCameraPosition, yCameraPosition, zCameraPosition);
            sketch.camera.up.set(xUpPosition, yUpPosition, zUpPosition);
            sketch.controls.target.set(xTargetPosition, yTargetPosition, zTargetPosition);
            sketch.controls.update();

            this.amplitude.value = this.initialAmplitudeValue * (1 - smoothTime);
            this.timeSpeed.value = this.initialTimeSpeed * (1 - smoothTime);
            sketch.uniforms.uTime.value += sketch.timedelta;
        }
        sketch.uniforms.uBillowTime.value += sketch.timedelta;
    }
}

export class FormFilledSetup extends BaseSceneSetup {
    constructor(uniforms) {
        super();
        this.initialTime = uniforms.uTime.value;
        this.timeSpeed = uniforms.uTimeSpeed;
        this.initialTimeSpeed = uniforms.uTimeSpeed.value;
        this.amplitude = uniforms.uAmplitude;
        this.initialAmplitudeValue = uniforms.uAmplitude.value;

        this.cameraPosition = new THREE.Vector3(2.9907487284474836 , 0.4766877781622922 , -1.9034252255755764);
        this.controlsTarget = new THREE.Vector3(4.282531081582864 , 0.1098231390699022 , -1.6012324578800312);
        this.up = new THREE.Vector3(0.12895533823797742 , 0.9688434461390165 , 0.31145424472778138);

        this.finalCameraPosition = new THREE.Vector3(-0.01770809369550381 , 0.10034586427452115 , 0.6125304975561604);
        this.finalControlsTarget = new THREE.Vector3(-0.01770809369550389 , 0.10034586427452111 , 1.2827183834787967);
        this.finalUpPosition = new THREE.Vector3(0, 1, 0);
    }

    updateControls(sketch) {
        super.updateControls(sketch);
        sketch.uniforms.uNewHillTime.value += sketch.timedelta;

        let offsetTime = sketch.uniforms.uTime.value - this.initialTime;
        let zoomDuration = 15;
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
            sketch.camera.position.set(xCameraPosition, yCameraPosition, zCameraPosition);
            sketch.camera.up.set(xUpPosition, yUpPosition, zUpPosition);
            sketch.controls.target.set(xTargetPosition, yTargetPosition, zTargetPosition);
            sketch.controls.update();

            this.amplitude.value = this.initialAmplitudeValue * (1 - smoothTime) + sketch.amplitude * smoothTime;
            this.timeSpeed.value = this.initialTimeSpeed * (1 - smoothTime) + sketch.timeSpeed * smoothTime;
        }
    }
}