uniform float time;
varying vec2 vUV;
varying vec3 vPosition;
uniform vec2 pixels;
float PI = 3.141592653589793238;
void main() {
  vUV = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}