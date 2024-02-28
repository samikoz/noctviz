uniform float uTime;
uniform sampler2D uPositions;
uniform float uBoundX;
uniform float uBoundZ;

varying vec3 vPosition;
varying vec2 vUv;



void main() {
    vec4 position = texture2D(uPositions, vUv);

    float positiveZ = uBoundZ + position.z;
    float positiveX = uBoundX + position.x;

    position.z += 0.5*positiveX;

    gl_FragColor = position;
}