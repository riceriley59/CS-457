uniform float uKa, uKd, uKs;
uniform float uShininess;
uniform sampler3D uNoiseTexture;

varying vec2 vST;
varying vec3 vN;
varying vec3 vL;
varying vec3 vE;
varying vec3 vMC;

const vec3 DARK_BROWN  = vec3(0.2, 0.15, 0.1);
const vec3 LIGHT_BROWN = vec3(0.7, 0.55, 0.3);
const vec3 BEIGE       = vec3(0.9, 0.8, 0.6);
const vec3 SPECULAR_COLOR = vec3(1.0, 1.0, 1.0);

// Function to generate a scale-like pattern using Voronoi-style noise
float scalePattern(vec2 uv) {
    vec2 cell = floor(uv * 10.0);
    vec2 f = fract(uv * 10.0);

    float d1 = length(f - vec2(0.3, 0.3));
    float d2 = length(f - vec2(0.7, 0.7));

    float scale = smoothstep(0.2, 0.5, min(d1, d2));
    return scale;
}

// Function to generate snake skin color pattern
vec3 snakeTexture(vec3 pos) {
    float bands = mod(pos.z * 3.0, 2.0);
    vec3 baseColor = mix(DARK_BROWN, LIGHT_BROWN, step(0.5, bands));

    // Sample noise texture for randomness
    float noise = texture3D(uNoiseTexture, pos * 0.1).r;

    float scales = scalePattern(pos.xy + noise * 0.2);
    baseColor = mix(baseColor, BEIGE, scales * 0.8);

    return baseColor;
}

void main() {
    vec3 myColor = snakeTexture(vMC); // Use model coordinates for patterning

    vec3 Normal = normalize(vN);
    vec3 Light = normalize(vL);
    vec3 Eye = normalize(vE);

    vec3 ambient = uKa * myColor;

    float d = max(dot(Normal, Light), 0.0);
    vec3 diffuse = uKd * d * myColor;

    float s = 0.0;
    if (d > 0.0) {
        vec3 ref = normalize(reflect(-Light, Normal));
        float cosphi = dot(Eye, ref);
        if (cosphi > 0.0) {
            s = pow(max(cosphi, 0.0), uShininess);
        }
    }

    vec3 specular = uKs * s * SPECULAR_COLOR;
    gl_FragColor = vec4(ambient + diffuse + specular, 1.0);
}

