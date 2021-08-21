import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { Service } from "typedi";
import SoundService from './services/sound';
//@ts-ignore
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';


@Service()
class Game {
    private renderer: THREE.WebGLRenderer;
    private scene: THREE.Scene;
    private shadertoyScene: THREE.Scene;
    private camera: THREE.PerspectiveCamera;
    private shadertoyCamera: THREE.OrthographicCamera;
    private controls: OrbitControls;
    private faders = [];
    private potards = [];

    //3D model variables
    private spaceBetweenFaders = 11.75;
    private faderWidth = 5;
    private numFilesLeft = 2;
    private mixerShaderFragment: string;
    private mixerShaderVertex: string;
    private backgroundShader: string;
    private uniformsBackground = null;
    private uniformsMixer = null;

    private shaderMaterial: THREE.ShaderMaterial;
    planeScreen: THREE.Mesh;

    private actualTime = 0;
    private goodOldTime = 0;

    

    constructor(private soundService: SoundService) {
        soundService.LoadSounds();
    }


    createScene(): void {
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, 2, 0.1, 100);
        this.camera.position.set(1.3250406408110678, 104.88500303402239, 20.99895565347296);

        const canvas = document.getElementById("c");
        this.renderer = new THREE.WebGLRenderer({
            //@ts-ignore
            canvas,
            antialias: false
        });

        this.controls = new OrbitControls(this.camera, canvas);

        this.controls.enableRotate = false;
        this.controls.update();

        this.renderer.autoClear = false;

        this.AddLights();
        this.AddMixer();
        this.AddKnobs();
        this.AddFaders();

        // var loader = new THREE.FileLoader();
        // loader.load('shaders/mixerShaderFragment.glsl', data => { this.mixerShaderFragment = data.toString(); this.ShaderLoaded(); },);
        // loader.load('shaders/mixerShaderVertex.glsl', data => { this.mixerShaderVertex = data.toString(); this.ShaderLoaded(); },);
        // loader.load('shaders/backgroundShader.glsl', data => { this.backgroundShader = data.toString(); this.ShaderLoaded(); },);

        this.AddMixerShader();
        this.AddBackgroundShader();

    }

    run() {
        requestAnimationFrame(() => this.run());
        this.render();
    }

    render(): void {
        let time = window.performance.now();
        this.actualTime += (time - this.goodOldTime) * 0.001; // convert to seconds

        if (this.ResizeRendererToDisplaySize(this.renderer)) {
            const canvas = this.renderer.domElement;
            this.camera.aspect = canvas.clientWidth / canvas.clientHeight;
            this.camera.updateProjectionMatrix();
            //this.uniformsBackground.iResolution.value.set(canvas.width, canvas.height, 1);
        }

        var data = this.soundService.UpdateAnalizer();

        if (data) {

            var awidth = 2048;
            var aheight = 1;

            var texture = new THREE.DataTexture(data, awidth, aheight, THREE.RGBFormat);

            this.uniformsMixer.iTime.value = this.actualTime;
            this.uniformsMixer.iResolution.value.set(20, 10, 1);
            this.uniformsMixer.waveform.value = texture;
        }

        this.uniformsBackground.iTime.value = this.actualTime;
        this.uniformsBackground.iResolution.value.set(this.renderer.domElement.width, this.renderer.domElement.height, 1);

        this.renderer.render(this.shadertoyScene, this.shadertoyCamera);
        this.renderer.render(this.scene, this.camera);
        this.goodOldTime = time;
    }

    PlaySound(): void {
        this.soundService.Play();
    }

    PauseSound(): void {
        this.soundService.Pause();
    }

    ResizeRendererToDisplaySize(renderer): boolean {
        const canvas = renderer.domElement;
        const width = canvas.clientWidth;
        const height = canvas.clientHeight;
        const needResize = canvas.width !== width || canvas.height !== height;
        if (!needResize)
            return false;

        renderer.setSize(width, height, false);
        return true;
    }

    private ShaderLoaded(): void {
        --this.numFilesLeft;
        if (this.numFilesLeft === 0) {
            this.AddMixerShader();
        }
    }


    private AddMixer(): void {
        const gltfLoader = new GLTFLoader();
        var root;
        gltfLoader.load('models/mixer.glb', (gltf) => {


            root = gltf.scene;
            root.position.set(0, -3.75, 0);
            this.scene.add(root);
            const box = new THREE.Box3().setFromObject(root);

            const boxSize = box.getSize(new THREE.Vector3()).length();
            //const boxCenter = box.getCenter(new THREE.Vector3());
            const boxCenter = new THREE.Vector3(1.3553901638776724, -6.662529599268561, -2.3002362037373625);

            this.camera.near = boxSize / 100;
            this.camera.far = boxSize * 100;

            this.camera.updateProjectionMatrix();

            // update the Trackball controls to handle the new size
            this.controls.maxDistance = boxSize * 10;
            this.controls.target.copy(boxCenter);
            //controls.enablePan = false;
            //controls.mouseButtons = { LEFT: THREE.MOUSE.RIGHT, MIDDLE: THREE.MOUSE.MIDDLE, RIGHT: THREE.MOUSE.LEFT };
            this.controls.update();
        });
    }

    private AddLights(): void {
        const color = 0xFFFFFF;
        const intensity = 1;
        const light = new THREE.DirectionalLight(color, intensity);
        light.position.set(5, 10, 2);
        this.scene.add(light);

        var lightAmbient = new THREE.AmbientLight(0xF0F0F0, 1); // soft white light
        this.scene.add(lightAmbient);
    }

    private AddFaders(): void {
        const gltfLoader = new GLTFLoader();
        var newFader;
        gltfLoader.load('models/fader.glb', (gltf) => {
            for (let i = 0; i <= 7; i++) {
                newFader = gltf.scene.clone();
                newFader.position.set(-45.75 + this.spaceBetweenFaders * i, 0, 1.2);
                newFader.name = i + 1;
                this.faders.push(newFader);
                this.scene.add(newFader);
            }
        });
    }

    private AddKnobs(): void {
        const gltfLoader = new GLTFLoader();
        var newPotard;
        gltfLoader.load('models/potard.glb', (gltf) => {
            for (let i = 0; i <= 7; i++) {
                newPotard = gltf.scene.clone();
                newPotard.name = i + 1;
                newPotard.position.set(-45.75 + this.faderWidth / 2 + this.spaceBetweenFaders * i, -1, -19);
                newPotard.rotation.set(5.925, 0, 0);
                this.potards.push(newPotard);
                this.scene.add(newPotard);
            }
        });
    }

    private AddMixerShader(): void {
        this.uniformsMixer = {
            iTime: {
                value: 0
            },
            iResolution: {
                value: new THREE.Vector3()
            },
            waveform: {
                type: 't',
                value: 0
            },
        };


        this.shaderMaterial = new THREE.ShaderMaterial({
            vertexShader: `varying vec2 vUv;
        
            void main() {
                vUv = uv;
                gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
            }`,
            fragmentShader: `
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
            `,
            //@ts-ignore
            uniforms: this.uniformsMixer,
        });

        this.planeScreen = new THREE.Mesh(new THREE.PlaneBufferGeometry(15, 10, 8, 8), this.shaderMaterial);
        var y = -1;
        this.planeScreen.position.set(51.5, y, -19);
        this.planeScreen.rotation.set(3 * 3.14 / 2 + 5.925, 0, 0);
        this.scene.add(this.planeScreen);
    }

    private AddBackgroundShader() {
        this.shadertoyScene = new THREE.Scene();
        const plane = new THREE.PlaneBufferGeometry(2, 2);

        this.shadertoyCamera = new THREE.OrthographicCamera(
            -1, // left
            1, // right
            1, // top
            -1, // bottom
            -1, // near,
            0, // far
        );

        const fragmentShader2 = `
        // Hexagone by Martijn Steinrucken aka BigWings - 2019
        // countfrolic@gmail.com
        // License Creative Commons Attribution-NonCommercial-ShareAlike 3.0 Unported License.
        // 
        // This started as an idea to do the effect below, but with hexagons:
        // https://www.shadertoy.com/view/wdlGRM
        //
        // Turns out that really doesn't look very nice so I just made it
        // into a dance party instead ;)
        //
        // Music: https://soundcloud.com/buku/front-to-back
        #include <common>
        uniform vec3 iResolution;
        uniform float iTime;
        #define R3 1.7
        precision lowp float;
        vec4 HexCoords(vec2 uv) {
            vec2 s = vec2(1, R3);
            vec2 h = .5*s;
            vec2 gv = s*uv;
            
            vec2 a = mod(gv, s)-h;
            vec2 b = mod(gv+h, s)-h;
            
            vec2 ab = dot(a,a)<dot(b,b) ? a : b;
            vec2 st = ab;
            vec2 id = gv-ab;
            
        // ab = abs(ab);
            //st.x = .5-max(dot(ab, normalize(s)), ab.x);
            st = ab;
            return vec4(st, id);
        }
        float GetSize(vec2 id, float seed) {
            float d = length(id);
            float t = iTime*.5;
            float a = sin(d*seed+t)+sin(d*seed*seed*10.+t*2.);
            return a/2. +.5;
        }
        mat2 Rot(float a) {
            float s = sin(a);
            float c = cos(a);
            return mat2(c, -s, s, c);
        }
        float Hexagon(vec2 uv, float r, vec2 offs) {
            
            uv *= Rot(mix(0., 3.1415, r));
            
            r /= 1./sqrt(2.);
            uv = vec2(-uv.y, uv.x);
            uv.x *= R3;
            uv = abs(uv);
            
            vec2 n = normalize(vec2(1,1));
            float d = dot(uv, n)-r;
            d = max(d, uv.y-r*.707);
            
            d = smoothstep(.06, .02, abs(d));
            
            d += smoothstep(.1, .09, abs(r-.5))*sin(iTime);
            return d;
        }
        float Xor(float a, float b) {
            return a+b;
            //return a*(1.-b) + b*(1.-a);
        }
        float Layer(vec2 uv, float s) {
            vec4 hu = HexCoords(uv*2.);
            float d = Hexagon(hu.xy, GetSize(hu.zw, s), vec2(0));
            vec2 offs = vec2(1,0);
            d = Xor(d, Hexagon(hu.xy-offs, GetSize(hu.zw+offs, s), offs));
            d = Xor(d, Hexagon(hu.xy+offs, GetSize(hu.zw-offs, s), -offs));
            offs = vec2(.5,.8725);
            d = Xor(d, Hexagon(hu.xy-offs, GetSize(hu.zw+offs, s), offs));
            d = Xor(d, Hexagon(hu.xy+offs, GetSize(hu.zw-offs, s), -offs));
            offs = vec2(-.5,.8725);
            d = Xor(d, Hexagon(hu.xy-offs, GetSize(hu.zw+offs, s), offs));
            d = Xor(d, Hexagon(hu.xy+offs, GetSize(hu.zw-offs, s), -offs));
            
            return d;
        }
        float N(float p) {
            return fract(sin(p*123.34)*345.456);
        }
        vec3 Col(float p, float offs) {
            float n = N(p)*1234.34;
            
            return sin(n*vec3(12.23,45.23,56.2)+offs*3.)*.5+.5;
        }
        vec3 GetRayDir(vec2 uv, vec3 p, vec3 lookat, float zoom) {
            vec3 f = normalize(lookat-p),
                r = normalize(cross(vec3(0,1,0), f)),
                u = cross(f, r),
                c = p+f*zoom,
                i = c + uv.x*r + uv.y*u,
                d = normalize(i-p);
            return d;
        }
        void mainImage( out vec4 fragColor, in vec2 fragCoord )
        {
            vec2 uv = (fragCoord-.5*iResolution.xy)/iResolution.y;
            vec2 UV = fragCoord.xy/iResolution.xy-.5;
            float duv= dot(UV, UV);
            //vec2 m = iMouse.xy/iResolution.xy-.5;
            vec2 m = vec2(1.);
            float t = iTime*.2+m.x*10.+5.;
            
            float y = sin(t*.5);//+sin(1.5*t)/3.;
            vec3 ro = vec3(0, 20.*y, -5);
            vec3 lookat = vec3(0,0,-10);
            vec3 rd = GetRayDir(uv, ro, lookat, 1.);
            
            vec3 col = vec3(0);
            
            vec3 p = ro+rd*(ro.y/rd.y);
            float dp = length(p.xz);
            
            if((ro.y/rd.y)>0.)
                col *= 0.;
            else {
                uv = p.xz*.1;
                uv *= mix(1., 5., sin(t*.5)*.5+.5);
                uv *= Rot(t);
                m *= Rot(t);
                uv.x *= R3;
                
                for(float i=0.; i<1.; i+=1./3.) {
                    float id = floor(i+t);
                    float t = fract(i+t);
                    float z = mix(5., .1, t);
                    float fade = smoothstep(0., .3, t)*smoothstep(1., .7, t);
                    col += fade*t*Layer(uv*z, N(i+id))*Col(id,duv);
                }
            }
            col *= 2.;
            
            if(ro.y<0.) col = 1.-col;
            
            col *= smoothstep(18., 5., dp);
            col *= 1.-duv*2.;
            fragColor = vec4(col,1.0);
        }
        void main() {
            mainImage(gl_FragColor, gl_FragCoord.xy);
        }
        `;

        this.uniformsBackground = {
            iTime: {
                value: 0
            },
            iResolution: {
                value: new THREE.Vector3()
            },
        };
        const material = new THREE.ShaderMaterial({
            fragmentShader: fragmentShader2,
            uniforms: this.uniformsBackground,
        });
        this.shadertoyScene.add(new THREE.Mesh(plane, material));
    }
}

export default Game;