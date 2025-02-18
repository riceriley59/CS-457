#version 330 compatibility

uniform float   uKa, uKd, uKs;	 
uniform vec4    uColor;		 
uniform float   uShininess;	 

uniform float uRedDepth, uBlueDepth;
uniform bool  uUseChromaDepth;

in  vec3  gN;		   
in  vec3  gL;		   
in  vec3  gE;		  

const vec3 SpecularColor = vec3(1., 1., 1.);

vec3 Rainbow(float t) {
        t = clamp(t, 0., 1.);         

        float r = 1.;
        float g = 0.0;
        float b = 1.  -  6. * (t - (5./6.));

        if(t <= (5./6.))
        {
                r = 6. * (t - (4./6.));
                g = 0.;
                b = 1.;
        }

        if(t <= (4./6.))
        {
                r = 0.;
                g = 1.  -  6. * (t - (3./6.));
                b = 1.;
        }

        if(t <= (3./6.))
        {
                r = 0.;
                g = 1.;
                b = 6. * (t - (2./6.));
        }

        if(t <= (2./6.))
        {
                r = 1.  -  6. * (t - (1./6.));
                g = 1.;
                b = 0.;
        }

        if(t <= (1./6.))
        {
                r = 1.;
                g = 6. * t;
        }

        return vec3(r, g, b);
}

void main( ) {
	vec3 myColor = uColor.rgb;
     float gZ = gE.z;

     if(uUseChromaDepth) {
          float t = (2./3.) * (abs(gZ) - uRedDepth) / (uBlueDepth - uRedDepth);
          t = clamp(t, 0., 2./3.);
          myColor = Rainbow(t);
     }

	vec3 Normal = normalize(gN);
	vec3 Light  = normalize(gL);
	vec3 Eye    = normalize(gE);

	vec3 ambient = uKa * myColor;

	float dd = max( dot(Normal,Light), 0. );       
	vec3 diffuse = uKd * dd * myColor;

	float ss = 0.;
	if( dot(Normal,Light) > 0. )	      
	{
		vec3 ref = normalize(  reflect( -Light, Normal )  );
		ss = pow( max( dot(Eye,ref),0. ), uShininess );
	}

	vec3 specular = uKs * ss * SpecularColor;
	gl_FragColor = vec4( ambient + diffuse + specular,  1. );
}

