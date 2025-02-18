uniform float   uKa, uKd, uKs;
uniform float   uShininess;

varying  vec2  vST;
varying  vec3  vN;
varying  vec3  vL;
varying  vec3  vE;
varying  float elevation;

// Define terrain colors
const vec3 SHALLOW_WATER = vec3(0.0, 0.5, 0.8);  // Lighter water (near shore)
const vec3 DEEP_WATER = vec3(0.0, 0.2, 0.5);     // Darker water (deeper areas)
const vec3 GRASS_COLOR = vec3(0.2, 0.8, 0.2);
const vec3 ROCK_COLOR  = vec3(0.5, 0.5, 0.5);
const vec3 SNOW_COLOR  = vec3(1.0, 1.0, 1.0);

const vec3 SPECULARCOLOR = vec3(1.0, 1.0, 1.0);

// Elevation thresholds
const float WATER_LEVEL = 0.1;
const float ROCK_START = 0.7;
const float SNOW_START = 2.0;

void main()
{
    vec3 terrainColor;

    if (elevation <= WATER_LEVEL)
    {
        // Blend between shallow and deep water based on depth
        float t = elevation / WATER_LEVEL;
        terrainColor = mix(DEEP_WATER, SHALLOW_WATER, t);
    }
    else if (elevation >= SNOW_START)
    {
        terrainColor = SNOW_COLOR;
    }
    else if (elevation >= ROCK_START)
    {
        float t = (elevation - ROCK_START) / (SNOW_START - ROCK_START);
        terrainColor = mix(ROCK_COLOR, SNOW_COLOR, t);
    }
    else
{
        float t = (elevation - WATER_LEVEL) / (ROCK_START - WATER_LEVEL);
        terrainColor = mix(GRASS_COLOR, ROCK_COLOR, t);
    }

    // Normalization of lighting vectors
    vec3 Normal = normalize(vN);
    vec3 Light = normalize(vL);
    vec3 Eye = normalize(vE);

    // Ambient lighting
    vec3 ambient = uKa * terrainColor;

    // Diffuse lighting
    float d = max(dot(Normal, Light), 0.0);
    vec3 diffuse = uKd * d * terrainColor;

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

    // Increase specular for water to make it shinier
    if (elevation <= WATER_LEVEL)
    {
        specular *= 2.5; // Water is more reflective
    }

    // Final color
    gl_FragColor = vec4(ambient + diffuse + specular, 1.0);
}

