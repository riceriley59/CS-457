uniform float uTime;

varying  vec2  	vST;

varying  vec3  	vN;
varying  vec3  	vL;
varying  vec3  	vE;
varying  vec3   vMC;

varying  float   elevation;

const vec3 	LIGHTPOS = vec3(  10., 10., 5. );
const float PI = 3.14159265;
const float TWOPI = 2.0 * PI;

// Water Parameters
const float WATER_LEVEL = 0.1;
const float WAVE_AMPLITUDE = 0.05;
const float WAVE_FREQUENCY = 0.1;

void main() {
    vST = gl_MultiTexCoord0.st;
    vec3 vert = gl_Vertex.xyz;

    // Add wave effect to water surface
    if (vert.y <= WATER_LEVEL) {
        float wave = WAVE_AMPLITUDE * sin(WAVE_FREQUENCY * (vert.x + vert.z) * uTime);
        vert.y += wave;
    }

    vec4 ECposition = gl_ModelViewMatrix * vec4( vert, 1. );

    elevation = vert.y;

    vMC = vert.xyz;
    vN = normalize( gl_NormalMatrix * gl_Normal );
    vL = LIGHTPOS - ECposition.xyz;
    vE = vec3( 0., 0., 0. ) - ECposition.xyz;
    gl_Position = gl_ModelViewProjectionMatrix * vec4( vert, 1. );
}

