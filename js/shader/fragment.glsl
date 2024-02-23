uniform float time;
uniform float progress;
uniform sampler2D uTexture;
uniform vec4 resolution;
varying vec2 vUV;
varying vec3 vPosition;

void main()	{
	vec4 heightColour = texture2D(uTexture, vUV);
	gl_FragColor = heightColour;
}