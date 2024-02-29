uniform float uTime;
uniform sampler2D uPositions;

varying vec3 vPosition;
varying vec2 vUv;



void main() {
	vec4 positionColor = texture2D(uPositions, vUv);

	positionColor.x -= 0.5*max(positionColor.z, 0.);

	gl_FragColor = positionColor;
}