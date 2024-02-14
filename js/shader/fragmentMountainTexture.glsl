uniform float uTime;
varying vec2 vUv;
uniform sampler2D uStripes;
uniform vec4 uResolution;
uniform vec3 uMouseWorldPosition;
varying vec3 vWorldPosition;
float PI = 3.141592653589793238;

void main()	{
    float time1 = uTime * 0.04;

    float dist = length(vWorldPosition - uMouseWorldPosition);
    if (dist < 0.1) {
        gl_FragColor = vec4(1);
    } else {

        float texture1 = texture2D(uStripes, vUv + vec2(time1, time1)).r;
        float texture11 = texture2D(uStripes, vUv + vec2(time1 * 1.5)).r;

        float alpha = min(texture1, texture11);
        vec3 color1 = vec3(0.579, 0.903, 0.983);

        vec3 viewDir = -normalize(vWorldPosition.xyz - cameraPosition);

        gl_FragColor = vec4(vec3(color1), alpha);
    }
}