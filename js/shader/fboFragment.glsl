uniform float uTime;
uniform sampler2D uPositions;

varying vec3 vPosition;
varying vec2 vUv;



void main() {
	vec4 positionColor = texture2D(uPositions, vUv);
	gl_FragColor = positionColor;
}