varying  vec2  	vST;		// texture coords
varying  vec3  	vN;		// normal vector
varying  vec3  	vL;		// vector from point to light
varying  vec3  	vE;		// vector from point to eye

varying  float   height;

const vec3 	LIGHTPOS 	= vec3(  10., 10., 5. );
const float PI 		= 3.14159265;
const float	TWOPI 	= 2.*PI;
const float	LENGTH 	= 5.;

void main() {
    vST = gl_MultiTexCoord0.st;
    vec3 vert = gl_Vertex.xyz;

    // setup for per-fragment lighting:
    vec4 ECposition = gl_ModelViewMatrix * vec4( vert, 1. );

    height = vert.y;

    vN = normalize( gl_NormalMatrix * gl_Normal );	// normal vector
    vL = LIGHTPOS - ECposition.xyz;		// vector from the point
    // to the light position
    vE = vec3( 0., 0., 0. ) - ECposition.xyz;	// vector from the point
    // to the eye position
    gl_Position = gl_ModelViewProjectionMatrix * vec4( vert, 1. );
}
