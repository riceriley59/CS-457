uniform samplerCube uTexUnit;

varying vec2		vST;

void main( )
{
	vec3 newcolor = textureCube( uTexUnit, vec3(vST, 1.) ).rgb;
	gl_FragColor = vec4( newcolor, 1. );
}
