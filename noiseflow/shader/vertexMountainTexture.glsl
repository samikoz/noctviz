uniform float uTime;
varying vec2 vUv;
varying vec3 vWorldPosition;
attribute vec3 aRandom;
attribute float aSize;

float PI = 3.141592653589793238;

void main() {
  vUv = uv;

  vWorldPosition = (modelMatrix * vec4( position, 1. )).xyz;
  vec4 mvPosition = modelViewMatrix * vec4( position, 1. );
  gl_Position = projectionMatrix * mvPosition;
}