uniform float uTime;
varying vec2 vUv;
uniform vec2 pixels;

varying vec3 vPosition;

void main() {
  vUv = uv;
  vPosition = position;
  gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}