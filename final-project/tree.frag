uniform float   uKa, uKd, uKs;
uniform float   uShininess;

varying  vec2  vST;
varying  vec3  vN;
varying  vec3  vL;
varying  vec3  vE;

// Define terrain colors
const vec3 GRASS_COLOR = vec3(0., 1., 0.);
const vec3 TRUNK_COLOR  = vec3(0.55, 0.27, 0.07);

const vec3 SPECULARCOLOR = vec3(1.0, 1.0, 1.0);

// Elevation thresholds
const float TRUNK_END = 0.4;  // height where rock starts

void main()
{
    // Determine elevation-based color
    vec3 myColor;

    if (vST.y > TRUNK_END) {
        myColor = GRASS_COLOR;
    } else {
        myColor = TRUNK_COLOR;
    }

    // Normalization of lighting vectors
    vec3 Normal = normalize(vN);
    vec3 Light = normalize(vL);
    vec3 Eye = normalize(vE);

    // Ambient lighting
    vec3 ambient = uKa * myColor;

    // Diffuse lighting
    float d = max(dot(Normal, Light), 0.0);
    vec3 diffuse = uKd * d * myColor;

    // Specular lighting
    float s = 0.0;
    if (d > 0.0)
    {
        vec3 ref = normalize(reflect(-Light, Normal));
        float cosphi = dot(Eye, ref);
        if (cosphi > 0.0)
        {
            s = pow(max(cosphi, 0.0), uShininess);
        }
    }
    vec3 specular = uKs * s * SPECULARCOLOR;

    // Final color
    gl_FragColor = vec4(ambient + diffuse + specular, 1.0);
}
