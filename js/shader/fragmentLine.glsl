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
uniform sampler2D uPositions;
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

void main() {
    #if defined(USE_LOGDEPTHBUF) && defined(USE_LOGDEPTHBUF_EXT)
        gl_FragDepthEXT = vIsPerspective == 0.0 ? gl_FragCoord.z : log2(vFragDepth) * logDepthBufFC * 0.5;
    #endif

    //--Panchgani changes
    //vec4 c = vColor;
    float phase = vPosition.z + uLineSpeed*uTime;
    vec4 c = vec4(noctColors[(int(round(100. + 20.*vPosition.x)) + int(phase/PI)) % 6], 1);
    //--

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