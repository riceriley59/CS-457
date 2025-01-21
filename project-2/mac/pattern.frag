uniform float	uKa, uKd, uKs;	// coefficients of each type of lighting
uniform float	uShininess;	// specular exponent

uniform float	uAd, uBd;
uniform float	uTol;

uniform sampler3D uNoiseTexture;

uniform float uNoiseFreq, uNoiseAmp;

// interpolated from the vertex shader:
varying  vec2  vST;                  // texture coords
varying  vec3  vN;                   // normal vector
varying  vec3  vL;                   // vector from point to light
varying  vec3  vE;                   // vector from point to eye
varying  vec3  vMC;			             // model coordinates

const vec3 OBJECTCOLOR          = vec3( 1., 1., 1. );           // color to make the object
const vec3 ELLIPSECOLOR         = vec3( 1., 0.5, 0. );           // color to make the ellipse
const vec3 SPECULARCOLOR        = vec3( 1., 1., 1. );

void main() {
    vec3 myColor = OBJECTCOLOR;
    vec2 st = vST;

    vec4 nv = texture3D(uNoiseTexture, uNoiseFreq * vec3(vST, 0.));
    float n = nv.r + nv.g + nv.b + nv.a;
    n = n - 2.;
    n *= uNoiseAmp;

    // blend OBJECTCOLOR and ELLIPSECOLOR by using the ellipse equation to decide how close
    // 	this fragment is to the ellipse border:
    st.s += n;
    st.t += n;

    float Ar = uAd / 2.;
    float Br = uBd / 2.;

    int numins = int( st.s / uAd );
    int numint = int( st.t / uBd );

    float Sc = (float(numins) * uAd) + Ar;
    float Tc = (float(numint) * uBd) + Br;

    float elipse_result = pow((st.s - Sc) / Ar, 2.) + pow((st.t - Tc) / Br, 2.);

    float t = smoothstep( 1.-uTol, 1.+uTol, elipse_result );
    myColor = mix( ELLIPSECOLOR, OBJECTCOLOR, t );

    // now use myColor in the per-fragment lighting equations:

    vec3 Normal    = normalize(vN);
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
