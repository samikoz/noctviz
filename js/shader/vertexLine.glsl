#ifdef USE_LOGDEPTHBUF
	#ifdef USE_LOGDEPTHBUF_EXT
		varying float vFragDepth;
varying float vIsPerspective;
#else
		uniform float logDepthBufFC;
#endif
#endif
#ifdef USE_FOG
	varying float vFogDepth;
#endif

attribute vec3 previous;
attribute vec3 next;
attribute float side;
attribute float width;
attribute float counters;

uniform vec2 resolution;
uniform float lineWidth;
uniform vec3 color;
uniform float opacity;
uniform float sizeAttenuation;
uniform vec3 uLookDirection;
uniform vec3 uEyePosition;
uniform float uDistortionSize;
uniform sampler2D uPositions;
uniform float uTime;
uniform float uBoundX;
uniform float uBoundZ;
uniform float uAmplitude;
uniform float uTimeSpeed;
uniform float uLoneHillHeight;
uniform float uLoneHillSize;
uniform float uBillowTime;

varying vec2 vUV;
varying vec4 vColor;
varying float vCounters;
varying vec3 vPosition;

vec2 fix( vec4 i, float aspect ) {
    vec2 res = i.xy / i.w;
    res.x *= aspect;
    vCounters = counters;
    return res;

}

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

float mouseDistortion(float distortionSize, vec3 p) {
    float lambda = (dot(p, uLookDirection) - dot(uEyePosition, uLookDirection))/dot(uLookDirection, uLookDirection);
    float lookDirDistance = length(p - (uEyePosition + uLookDirection*lambda));
    return max(distortionSize - lookDirDistance, 0.);
}

float computeHeight(vec3 p) {
    vec3 loneHillPosition = vec3(-0.5, 0., 4.3);
    float loneHillHeight = uLoneHillHeight*(1. - smoothstep(0., uLoneHillSize, length(p - loneHillPosition)))*smoothstep(-0.05, 0., -uTimeSpeed);

    float noiz = noise(2.*vec3(-1. + p.x + uTime*uTimeSpeed, 0., 7. + p.z));
    return uAmplitude*noiz*noiz + loneHillHeight;
}

float computeBillowing(vec3 position) {
    float mouseContrib = 10.*mouseDistortion(uDistortionSize, position);
    return 0.1*noise(vec3(position.x + uBillowTime*0.1, 0., 10.*position.z + mouseContrib + uTime*(0.1+mouseContrib/50.)));
}

float mouseHeightDrop(vec3 p) {
    return 0.6*uAmplitude*mouseDistortion(2.*uDistortionSize, p);
}

vec3 getActualPosition(vec3 p) {
    //vec4 texturePosition = texture2D(uPositions, vec2(0.5 + p.z/(2.*uBoundZ), 0.5 + p.x/(2.*uBoundX)));
    //vec3 actualPosition = texturePosition.zyx - vec3(0.5) + vec3(0., computeHeight(texturePosition.xyz), 0.);
    vec3 actualPosition = p.xyz - vec3(0.5) +  vec3(0., computeHeight(p.zyx), 0.);
    actualPosition.x = actualPosition.x + computeBillowing(actualPosition.xyz);
    actualPosition.y = actualPosition.y - mouseHeightDrop(actualPosition);
    return actualPosition;
}

void main() {
    float aspect = resolution.x / resolution.y;

    vColor = vec4( color, opacity );
    vUV = uv;
    vPosition = position;

    //--Panchgani changes
    vec3 actualPosition = getActualPosition(position);
    vec3 previousPosition = getActualPosition(previous);
    vec3 nextPosition = getActualPosition(next);
    //--

    vec4 worldPosition = (modelMatrix * vec4(actualPosition, 1.0));
    vec4 prevWorldPosition = (modelMatrix * vec4(previousPosition, 1.0));
    vec4 nextWorldPosition = (modelMatrix * vec4(nextPosition, 1.0));


    mat4 m = projectionMatrix * viewMatrix;
    vec4 finalPosition = m * worldPosition;
    vec4 prevPos = m * prevWorldPosition;
    vec4 nextPos = m * nextWorldPosition;

    vec2 currentP = fix( finalPosition, aspect );
    vec2 prevP = fix( prevPos, aspect );
    vec2 nextP = fix( nextPos, aspect );

    float w = lineWidth * width;

    vec2 dir;
    if( nextP == currentP ) dir = normalize( currentP - prevP );
    else if( prevP == currentP ) dir = normalize( nextP - currentP );
    else {
        vec2 dir1 = normalize( currentP - prevP );
        vec2 dir2 = normalize( nextP - currentP );
        dir = normalize( dir1 + dir2 );

        vec2 perp = vec2( -dir1.y, dir1.x );
        vec2 miter = vec2( -dir.y, dir.x );
        //w = clamp( w / dot( miter, perp ), 0., 4. * lineWidth * width );

    }

    //vec2 normal = ( cross( vec3( dir, 0. ), vec3( 0., 0., 1. ) ) ).xy;
    vec4 normal = vec4( -dir.y, dir.x, 0., 1. );
    normal.xy *= .5 * w;
    normal *= projectionMatrix;
    if( sizeAttenuation == 0. ) {
        normal.xy *= finalPosition.w;
        normal.xy /= ( vec4( resolution, 0., 1. ) * projectionMatrix ).xy;
    }

    finalPosition.xy += normal.xy * side;

    gl_Position = finalPosition;

    #ifdef USE_LOGDEPTHBUF
        #ifdef USE_LOGDEPTHBUF_EXT
            vFragDepth = 1.0 + gl_Position.w;
    vIsPerspective = float( isPerspectiveMatrix( projectionMatrix ) );
    #else
            if ( isPerspectiveMatrix( projectionMatrix ) ) {
        gl_Position.z = log2( max( EPSILON, gl_Position.w + 1.0 ) ) * logDepthBufFC - 1.0;
        gl_Position.z *= gl_Position.w;
    }
    #endif
    #endif
    vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );
    #ifdef USE_FOG
	    vFogDepth = - mvPosition.z;
    #endif
}