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
uniform vec3 uMouseWorldPosition;
uniform sampler2D uTexture;

varying vec2 vUV;
varying vec4 vColor;
varying float vCounters;

vec2 fix( vec4 i, float aspect ) {
    vec2 res = i.xy / i.w;
    res.x *= aspect;
    vCounters = counters;
    return res;

}

void main() {
    float aspect = resolution.x / resolution.y;

    vColor = vec4( color, opacity );
    vUV = uv;

    vec4 worldPosition = (modelMatrix * vec4(position, 1.0));
    vec4 prevWorldPosition = (modelMatrix * vec4(previous, 1.0));
    vec4 nextWorldPosition = (modelMatrix * vec4(next, 1.0));

    vec4 sampledMountainColor = texture2D(uTexture, vec2(0.5) + 0.5*worldPosition.xz);
    worldPosition.y = 0.5 * sampledMountainColor.x;

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