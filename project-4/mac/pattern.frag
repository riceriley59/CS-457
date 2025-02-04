uniform sampler3D uNoiseTexture;

uniform float uNoiseAmp, uNoiseFreq;
uniform float uMix, uEta, uWhiteMix;
uniform samplerCube uReflectUnit, uRefractUnit;

// interpolated from the vertex shader:
varying  vec3  vNormal;                   // normal vector
varying  vec3  vEyeDir;                   // vector from point to eye
varying  vec3  vMC;			             // model coordinates

const vec3 WHITE = vec3(1., 1., 1.);

vec3 PerturbNormal3( float angx, float angy, float angz, vec3 n ) {
    float cx = cos( angx );
    float sx = sin( angx );
    float cy = cos( angy );
    float sy = sin( angy );
    float cz = cos( angz );
    float sz = sin( angz );

    // rotate about x:
    float yp =  n.y*cx - n.z*sx;
    n.z      =  n.y*sx + n.z*cx;
    n.y      =  yp;
    n.x      =  n.x;

    // rotate about y:
    float xp =  n.x*cy + n.z*sy;
    n.z      = -n.x*sy + n.z*cy;
    n.x      =  xp;
    n.y      =  n.y;

    // rotate about z:
    xp =  n.x*cz - n.y*sz;
    n.y      =  n.x*sz + n.y*cz;
    n.x      = xp;
    n.z      =  n.z;

    return normalize( n );
}


void main( ) {
    vec3 Normal = normalize(vNormal);	// remember to unitize this
    vec3 Eye =    normalize(vEyeDir);	// remember to unitize this

    vec4 nvx = texture3D( uNoiseTexture, uNoiseFreq*vMC );
    vec4 nvy = texture3D( uNoiseTexture, uNoiseFreq*vec3(vMC.xy,vMC.z+0.33) );
    vec4 nvz = texture3D( uNoiseTexture, uNoiseFreq*vec3(vMC.xy,vMC.z+0.67) );

    float angx = nvx.r + nvx.g + nvx.b + nvx.a;
    angx = angx - 2.;
    angx *= uNoiseAmp;

    float angy = nvy.r + nvy.g + nvy.b + nvy.a;
    angy = angy - 2.;
    angy *= uNoiseAmp;

    float angz = nvz.r + nvz.g + nvz.b + nvz.a;
    angz = angz - 2.;
    angz *= uNoiseAmp;

    Normal = PerturbNormal3( angx, angy, angz, Normal );
    Normal = normalize( gl_NormalMatrix * Normal );

    vec3 reflectVector = reflect(Eye, Normal);
    vec3 reflectColor = textureCube(uReflectUnit, reflectVector).rgb;

    vec3 refractVector = refract(Eye, Normal, uEta);

    vec3 refractColor;
    if( all( equal( refractVector, vec3(0.,0.,0.) ) ) )
    {
        refractColor = reflectColor;
    }
    else
{
        refractColor = textureCube( uRefractUnit, refractVector ).rgb;
        refractColor = mix( refractColor, WHITE, uWhiteMix );
    }

    vec3 color = mix(refractColor, reflectColor, uMix);
    color = mix(color, WHITE, uWhiteMix);
    gl_FragColor = vec4(color, 1.);
}
