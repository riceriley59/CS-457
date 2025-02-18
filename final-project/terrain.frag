uniform float   uKa, uKd, uKs;
uniform float   uShininess;
uniform float   uTime;

uniform sampler3D uNoiseTexture;

varying  vec2  vST;
varying  vec3  vN;
varying  vec3  vL;
varying  vec3  vE;
varying  vec3  vMC;

varying  float elevation;

// Define terrain colors
const vec3 SHALLOW_WATER = vec3(0., 0.5, 0.8);
const vec3 DEEP_WATER = vec3(0., 0.3, 0.8);
const vec3 FOAM_COLOR = vec3(1., 1., 1.);

const vec3 GRASS_COLOR = vec3(0.2, 0.8, 0.2);
const vec3 ROCK_COLOR  = vec3(0.5, 0.5, 0.5);
const vec3 SNOW_COLOR  = vec3(1., 1., 1.);

const vec3 SPECULAR = vec3(1., 1., 1.);

const float WATER_LEVEL = 0.1;
const float FOAM_RANGE = 0.1;
const float ROCK_START = 0.7;
const float SNOW_START = 2.0;

const float NOISE_AMP = 1.0;
const float NOISE_FREQ = 1.0;

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
    vec3 terrainColor;
    float transparency = 1.0;

    float foamFactor = 0.0;

    if (elevation <= WATER_LEVEL) {
        float t = elevation / WATER_LEVEL;
        terrainColor = mix(DEEP_WATER, SHALLOW_WATER, t);
        transparency = mix(0.4, 0.8, t);

        // Foam effect near shore
        float foamFactor = smoothstep(WATER_LEVEL - FOAM_RANGE, WATER_LEVEL, elevation);
        terrainColor = mix(terrainColor, FOAM_COLOR, foamFactor);
    } else if (elevation >= SNOW_START) {
        terrainColor = SNOW_COLOR;
    } else if (elevation >= ROCK_START) {
        float t = (elevation - ROCK_START) / (SNOW_START - ROCK_START);
        terrainColor = mix(ROCK_COLOR, SNOW_COLOR, t);
    } else {
        float t = (elevation - WATER_LEVEL) / (ROCK_START - WATER_LEVEL);
        terrainColor = mix(GRASS_COLOR, ROCK_COLOR, t);
    }

    vec3 Normal;
    if (elevation <= WATER_LEVEL) {
        vec4 nvx = texture3D(uNoiseTexture, NOISE_FREQ * (vMC + vec3(uTime, 0., 0.)));
        float angx = nvx.r + nvx.g + nvx.b + nvx.a - 2.;
        angx *= NOISE_AMP;

        vec4 nvy = texture3D(uNoiseTexture, NOISE_FREQ * (vec3(vMC.xy, vMC.z + 0.5) + vec3(0., uTime, 0.)));
        float angy = nvy.r + nvy.g + nvy.b + nvy.a - 2.;
        angy *= NOISE_AMP;

        vec3 n = PerturbNormal2(angx, angy, vN);
        Normal = normalize(gl_NormalMatrix * n);
    } else {
        Normal = normalize(vN);
    }

    vec3 Light = normalize(vL);
    vec3 Eye = normalize(vE);

    // Ambient lighting
    vec3 ambient = uKa * terrainColor;

    // Diffuse lighting
    float d = max(dot(Normal, Light), 0.);
    vec3 diffuse = uKd * d * terrainColor;

    // Specular lighting
    float s = 0.;
    if (d > 0.) {
        vec3 ref = normalize(reflect(-Light, Normal));
        float cosphi = dot(Eye, ref);
        if (cosphi > 0.)
        {
            s = pow(max(cosphi, 0.), uShininess);
        }
    }

    vec3 specular = uKs * s * SPECULAR;

    // Final color with transparency
    gl_FragColor = vec4(ambient + diffuse + specular, transparency);
}

