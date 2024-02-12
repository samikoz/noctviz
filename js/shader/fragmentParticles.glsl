uniform float time;
uniform float progress;
uniform sampler2D uNormals;
uniform vec4 resolution;
varying vec2 vUv;
varying vec3 vPosition;
float PI = 3.141592653589793238;

void main()	{
    vec3 color = vec3(0.579, 0.903, 0.983);
    vec2 st = gl_PointCoord.xy;
    vec4 normalTexture = texture2D(uNormals, st);

    float disc = length(st - vec2(0.5));
    float alpha = smoothstep(0.5, 0.48, disc);

    vec3 normal = vec3(normalTexture.rg * 2. - 1., 0.);
    normal.z = sqrt(1.0 - normal.x * normal.x - normal.y * normal.y);
    normal = normalize(normal);

    vec3 lightPos = vec3(1., 1., 1.);
    float diffuse = max(0., dot(normal, normalize(lightPos)));

    gl_FragColor = vec4(color,alpha*diffuse*0.5);
}