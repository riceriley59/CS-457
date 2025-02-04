uniform float	uKa, uKd, uKs;	// coefficients of each type of lighting
uniform float	uShininess;	// specular exponent

uniform float   uA, uP;
uniform float   uNoiseAmp, uNoiseFreq;

uniform sampler3D uNoiseTexture;

// interpolated from the vertex shader:
varying  vec2  vST;                  // texture coords
varying  vec3  vN;                   // normal vector
varying  vec3  vL;                   // vector from point to light
varying  vec3  vE;                   // vector from point to eye
varying  vec3  vMC;			             // model coordinates

const vec3 OBJECTCOLOR          = vec3( 1., 1., 0. );           // color to make the object
const vec3 SPECULARCOLOR        = vec3( 1., 1., 1. );

vec3 PerturbNormal2(float angx, float angy, vec3 n) {
    float cx = cos(angx);
    float sx = sin(angx);
    float cy = cos(angy);
    float sy = sin(angy);

    float yp = (n.y * cx) - (n.z * sx);
    n.z = (n.y * sx) + (n.z * cx);
    n.y = yp;

    float xp = (n.x * cy) + (n.z * sy);
    n.z = (-n.x * sy) + (n.z * cy);
    n.x = xp;

    return normalize(n);
}

void main() {
    vec3 myColor = OBJECTCOLOR;
    vec2 st = vST;

    vec4 nvx = texture3D(uNoiseTexture, uNoiseFreq * vMC);
    float angx = nvx.r + nvx.g + nvx.b + nvx.a - 2.;
    angx *= uNoiseAmp;

    vec4 nvy = texture3D(uNoiseTexture, uNoiseFreq * vec3(vMC.xy, vMC.z + 0.5));
    float angy = nvy.r + nvy.g + nvy.b + nvy.a - 2.;
    angy *= uNoiseAmp;

    vec3 n = PerturbNormal2(angx, angy, vN);

    // now use myColor in the per-fragment lighting equations:

    vec3 Normal    = normalize(gl_NormalMatrix * n);
    vec3 Light     = normalize(vL);
    vec3 Eye       = normalize(vE);

    vec3 ambient = uKa * myColor;

    float d = max( dot(Normal,Light), 0. );       // only do diffuse if the light can see the point
    vec3 diffuse = uKd * d * myColor;

    float s = 0.;
    if( d > 0. )              // only do specular if the light can see the point
    {
        vec3 ref = normalize(  reflect( -Light, Normal )  );
        float cosphi = dot( Eye, ref );
        if( cosphi > 0. )
            s = pow( max( cosphi, 0. ), uShininess );
    }

    vec3 specular = uKs * s * SPECULARCOLOR.rgb;
    gl_FragColor = vec4( ambient + diffuse + specular,  1. );
}

