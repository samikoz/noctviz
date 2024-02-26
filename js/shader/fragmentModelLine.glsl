#ifdef USE_FOG
    uniform vec3 fogColor;
    varying float vFogDepth;
    #ifdef FOG_EXP2
        uniform float fogDensity;
    #else
        uniform float fogNear;
        uniform float fogFar;
    #endif
    #endif
#if defined( USE_LOGDEPTHBUF ) && defined( USE_LOGDEPTHBUF_EXT )
    uniform float logDepthBufFC;
    varying float vFragDepth;
    varying float vIsPerspective;
#endif
uniform sampler2D map;
uniform sampler2D alphaMap;
uniform float useMap;
uniform float useAlphaMap;
uniform float useDash;
uniform float dashArray;
uniform float dashOffset;
uniform float dashRatio;
uniform float visibility;
uniform float alphaTest;
uniform vec2 repeat;
uniform float uTime;
uniform sampler2D uTexture;
uniform float uLineIndex;
uniform float uLineSpeed;

varying vec2 vUV;
varying vec4 vColor;
varying float vCounters;
varying vec3 vPosition;

float PI = 3.141592653589793238;

vec3 noctColors[] = vec3[6](
    //charcoal vec3((2.*16. + 2.)/255.0, (2.*16. + 3.)/255.0, (2.*16. + 3.)/255.0),
    //cream vec3((15*16. + 5.)/255.0, (14.*16. + 10.)/255.0, (14.*16. + 5.)/255.0),
    vec3((11.*16. + 1.)/255.0, (10.*16. + 8.)/255.0, (13.*16. + 2.)/255.0),
    //peach vec3((14.*16. + 14.)/255.0, (12. * 16. + 4.)/255.0, (12. * 16. + 4.)/255.0),
    vec3((9. * 16. + 13.)/255.0, (13. * 16. + 3.)/255.0, (13. * 16. + 9.)/255.0),
    vec3((11.*16. + 14.)/255.0, (13. * 16. + 12.)/255.0, (12. * 16. + 14.)/255.0),
    vec3((14. * 16. + 10.)/255.0, (13. * 16. + 4.)/255.0, (12. * 16. + 8.)/255.0),
    //grey vec3((10. * 16. + 6.)/255.0, 166./255.0, 166./255.0),
    vec3((13. * 16. + 1.)/255.0, 164./255.0, (12. * 16. + 11.)/255.0),
    /* bluegrey */ vec3((11. * 16. + 12.)/255.0, (12. * 16. + 3.)/255.0, (13. * 16. + 2.)/255.0)
    //off-white vec3((15.*16. + 12.)/255.0, (15.*16. + 12.)/255.0, (15.*16. + 12.)/255.0)
);

float mod289(float x){return x - floor(x * (1.0 / 289.0)) * 289.0;}
vec4 mod289(vec4 x){return x - floor(x * (1.0 / 289.0)) * 289.0;}
vec4 perm(vec4 x){return mod289(((x * 34.0) + 1.0) * x);}

float noise(vec3 p){
    vec3 a = floor(p);
    vec3 d = p - a;
    d = d * d * (3.0 - 2.0 * d);

    vec4 b = a.xxyy + vec4(0.0, 1.0, 0.0, 1.0);
    vec4 k1 = perm(b.xyxy);
    vec4 k2 = perm(k1.xyxy + b.zzww);

    vec4 c = k2 + a.zzzz;
    vec4 k3 = perm(c);
    vec4 k4 = perm(c + 1.0);

    vec4 o1 = fract(k3 * (1.0 / 41.0));
    vec4 o2 = fract(k4 * (1.0 / 41.0));

    vec4 o3 = o2 * d.z + o1 * (1.0 - d.z);
    vec2 o4 = o3.yw * d.x + o3.xz * (1.0 - d.x);

    return o4.y * d.y + o4.x * (1.0 - d.y);
}

float rand(vec2 seed)
{
    return fract(sin(dot(seed*uTime ,vec2(12.9898,78.233))) * 43758.5453);
}

void main() {
    #if defined(USE_LOGDEPTHBUF) && defined(USE_LOGDEPTHBUF_EXT)
        gl_FragDepthEXT = vIsPerspective == 0.0 ? gl_FragCoord.z : log2(vFragDepth) * logDepthBufFC * 0.5;
    #endif

    //vec4 c = vColor;
    float rand = fract(sin(vPosition.x*12325.23254567));
    float phase = 2.*rand + vPosition.z - (1.-0.6*(noise(vec3(0, 0, rand))-0.5))*uLineSpeed*uTime;
    float sp = sin(phase);
    float opacity = abs(sp);
    vec4 c = vec4(noctColors[(int(phase/PI)) % 6], 1);

    if (useMap == 1.) c *= texture2D(map, vUV * repeat);
    if (useAlphaMap == 1.) c.a *= texture2D(alphaMap, vUV * repeat).a;
    if (c.a < alphaTest) discard;
    if (useDash == 1.) {
        c.a *= ceil(mod(vCounters + dashOffset, dashArray) - (dashArray * dashRatio));
    }

    gl_FragColor = c;
    gl_FragColor.a *= step(vCounters, visibility);

    #ifdef USE_FOG
        #ifdef FOG_EXP2
            float fogFactor = 1.0 - exp(-fogDensity * fogDensity * vFogDepth * vFogDepth);
        #else
            float fogFactor = smoothstep(fogNear, fogFar, vFogDepth);
        #endif
        gl_FragColor.rgb = mix(gl_FragColor.rgb, fogColor, fogFactor);
    #endif
}