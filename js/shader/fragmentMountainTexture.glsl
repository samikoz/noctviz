uniform float uTime;
varying vec2 vUv;
uniform sampler2D uStripes;
uniform vec4 uResolution;
uniform vec3 uMouseWorldPosition;
varying vec3 vWorldPosition;
float PI = 3.141592653589793238;

void main()	{
    float time = uTime * 0.04;

    vec3 offset = normalize(-vWorldPosition + uMouseWorldPosition)*(min(length(vWorldPosition - uMouseWorldPosition), 0.2) - 0.2)*vec3(1., sign(vWorldPosition.y - uMouseWorldPosition.y), 1.);
    float texture1 = texture2D(uStripes, vUv + vec2(0., time) + offset.xy).r;
    float texture11 = texture2D(uStripes, vUv + 1.5*(vec2(0., time) + offset.xy)).r;

    float alpha = min(texture1, texture11);
    vec3 color = vec3(0.579, 0.903, 0.983);

    gl_FragColor = vec4(vec3(color), alpha);
}