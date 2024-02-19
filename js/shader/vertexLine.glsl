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

varying vec2 vUV;
varying vec4 vColor;
varying float vCounters;

vec2 fix( vec4 i, float aspect ) {
    vec2 res = i.xy / i.w;
    res.x *= aspect;
    vCounters = counters;
    return res;

}

vec4 computeOffset(vec4 worldPosition) {
    vec3 mousePosition = 2.*uMouseWorldPosition; //the factor is due to raycasting against the scene with the model but rendering a scene with a different camera
    return vec4(
        normalize(-worldPosition.xyz + mousePosition)*(min(length(worldPosition.xyz - mousePosition), 0.2) - 0.2)*vec3(1., sign(worldPosition.y - mousePosition.y), 1.),
        worldPosition.w);
}

void main() {
    float aspect = resolution.x / resolution.y;

    vColor = vec4( color, opacity );
    vUV = uv;

    //mat4 m = projectionMatrix * modelViewMatrix;
    //vec4 finalPosition = m * vec4( position, 1.0 );
    //vec4 prevPos = m * vec4( previous, 1.0 );
    //vec4 nextPos = m * vec4( next, 1.0 );

    vec4 worldPosition = (modelMatrix * vec4(position, 1.0));
    vec4 prevWorldPosition = (modelMatrix * vec4(previous, 1.0));
    vec4 nextWorldPosition = (modelMatrix * vec4(next, 1.0));

    worldPosition += computeOffset(worldPosition);
    prevWorldPosition += computeOffset(prevWorldPosition);
    nextWorldPosition += computeOffset(nextWorldPosition);

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