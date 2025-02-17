varying vec2 vST;  // Texture coordinates
varying vec3 vN;   // Normal vector
varying vec3 vL;   // Vector from point to light
varying vec3 vE;   // Vector from point to eye
varying vec3 vMC;  // Model coordinates

uniform float uTime;
uniform float uSquirmFreq, uSquirmAmp;

const vec3 LIGHTPOSITION = vec3(5., 5., 0.);

const float PI = 3.14159265;
const float TWOPI = 2.0 * PI;
const float LENGTH = 5.0;   // Scale of the wave

void main()
{
    vST = gl_MultiTexCoord0.st;
    vMC = gl_Vertex.xyz;

    // Apply the wave movement to Z
    vec3 vert = gl_Vertex.xyz;
    vert.z += uSquirmAmp * sin(TWOPI * uSquirmFreq * uTime + (TWOPI * vert.x) / LENGTH);

    vec4 ECposition = gl_ModelViewMatrix * vec4(vert, 1.0);
    vN = normalize(gl_NormalMatrix * gl_Normal);
    vL = LIGHTPOSITION - ECposition.xyz;
    vE = vec3(0., 0., 0.) - ECposition.xyz;

    gl_Position = gl_ModelViewProjectionMatrix * vec4(vert, 1.0);
}

