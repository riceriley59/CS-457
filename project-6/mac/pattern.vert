varying vec2 vST;
varying vec3 vN;
varying vec3 vL;
varying vec3 vE;
varying vec3 vMC;

uniform float uTime;
uniform float uSquirmFreq, uSquirmAmp;

uniform sampler3D uNoiseTexture;
uniform float uNoiseFreq, uNoiseAmp;

const vec3 LIGHTPOSITION = vec3(5., 5., 0.);

const float PI = 3.14159265;
const float TWOPI = 2.0 * PI;
const float LENGTH = 5.0;   // Scale of the wave

void main()
{
    vST = gl_MultiTexCoord0.st;
    vMC = gl_Vertex.xyz;

    vec4 nv = texture3D(uNoiseTexture, uNoiseFreq * vec3(vST, 0.));
    float n = nv.r + nv.g + nv.b + nv.a;
    n *= uNoiseAmp;

    // Apply the wave movement with some noise to Z
    vec3 vert = gl_Vertex.xyz;
    vert.z += n + (uSquirmAmp * sin(TWOPI * uSquirmFreq * uTime + (TWOPI * vert.x) / LENGTH));

    vec4 ECposition = gl_ModelViewMatrix * vec4(vert, 1.0);
    vN = normalize(gl_NormalMatrix * gl_Normal);
    vL = LIGHTPOSITION - ECposition.xyz;
    vE = vec3(0., 0., 0.) - ECposition.xyz;

    gl_Position = gl_ModelViewProjectionMatrix * vec4(vert, 1.0);
}

