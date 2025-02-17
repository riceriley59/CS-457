#version 330 compatibility

uniform float uSc, uTc, uRad;
uniform float uMag, uWhirl, uMosaic; 

uniform sampler2D uImageUnit;

in vec2 vST;

void main() {
    vec2 st = vST  - vec2(uSc, uTc);
    float r = length(st);

    if (r >= uRad) {
        vec3 rgb = texture(uImageUnit, vST).rgb;
        gl_FragColor = vec4(rgb, 1.);
        return;
    }
    
    float rprime = r / uMag;

    float theta = atan(st.t, st.s);
    float thetaprime = theta - uWhirl * rprime;
    
    st = rprime * vec2(cos(thetaprime), sin(thetaprime));
    
    float MosaicR = uMosaic / 2.; 
    int numins = int(st.s / MosaicR);
    int numint = int(st.t / MosaicR);
    float sc = (numins * uMosaic) + MosaicR;
    float tc = (numint * uMosaic) + MosaicR;
    st.s = sc;
    st.t = tc;
    
    st += vec2(uSc, uTc);

    vec3 rgb = texture(uImageUnit, st).rgb;
    gl_FragColor = vec4(rgb, 1.);
}
