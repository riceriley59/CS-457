#version 330 compatibility

uniform sampler2D uImageUnit;

in vec2 vST;

void main() {
    vec3 newcolor = texture(uImageUnit, vST).rgb;

    gl_FragColor = vec4(newcolor, 1.);
}
