uniform float time;
uniform float progress;
uniform sampler2D uNormals;
uniform vec4 resolution;
varying vec2 vUv;
varying vec3 vPosition;

void main()	{
    vec3 baseColor = vec3(5./255., (2.*16. + 3.)/255., (3.*16. + 13.)/255.);
    float isolineSeparation = 0.02;
    float isolineThickness = 0.05;
    float currentPosition = vPosition.z + time*0.005;
    if (vPosition.z < -0.099) {
        gl_FragColor = vec4(baseColor, 1);
    } else {
        gl_FragColor = fract(currentPosition / isolineSeparation) <= isolineThickness ? vec4(1) : vec4(baseColor, 1);
    }
}