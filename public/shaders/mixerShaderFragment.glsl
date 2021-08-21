#include <common>
uniform vec3 iResolution;
uniform float iTime;
uniform sampler2D waveform;
vec3 purpleBackground = vec3(96./255., 63./255., 168./255.);
vec3 yellowFont = vec3(255./255., 249./255., 81./255.);
vec3 greenMisc = vec3(77./255., 226./255., 160./255.);
vec3 orangeMisc = vec3(255./255., 249./255., 81./255.);
void mainImage( out vec4 fragColor, in vec2 fragCoord )
{
    vec2 uv = fragCoord/iResolution.xy;
    
    vec4 tex = texture2D(waveform, vec2(uv.x,0.5));
    if(uv.y>tex.x && uv.y < 0.5 || uv.y<tex.x && uv.y > 0.5){
        if(mod(iTime,5.) > 2.5){
            fragColor = vec4(greenMisc, 1.);
        }else{
            fragColor = vec4(yellowFont, 1.);
        }
        if(mod(iTime,10.) < 0.5 ){
            fragColor = vec4(purpleBackground, 1.);
        }
        
    }else{
        if(mod(iTime,10.) < 0.5 ){
            fragColor = vec4(orangeMisc, 1.);
        }else{
            fragColor = vec4(purpleBackground, 1.);
        }
    }
}
varying vec2 vUv;
void main() {
    mainImage(gl_FragColor, vUv * iResolution.xy);
}