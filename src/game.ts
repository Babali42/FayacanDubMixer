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
    private numFilesLeft = 1;
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

        var loader = new THREE.FileLoader();
        // loader.load('shaders/mixerShaderFragment.glsl', data => { this.mixerShaderFragment = data.toString(); this.ShaderLoaded(); },);
        // loader.load('shaders/mixerShaderVertex.glsl', data => { this.mixerShaderVertex = data.toString(); this.ShaderLoaded(); },);
        loader.load('shaders/backgroundShader.glsl', data => { this.backgroundShader = data.toString(); this.ShaderLoaded(); },);

        this.AddMixerShader();

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

        if(this.uniformsBackground){
            this.uniformsBackground.iTime.value = this.actualTime;
            this.uniformsBackground.iResolution.value.set(this.renderer.domElement.width, this.renderer.domElement.height, 1);
            this.renderer.render(this.shadertoyScene, this.shadertoyCamera);
        }
        
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
            //this.AddMixerShader();
            this.AddBackgroundShader();
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

        this.uniformsBackground = {
            iTime: {
                value: 0
            },
            iResolution: {
                value: new THREE.Vector3()
            },
        };
        const material = new THREE.ShaderMaterial({
            fragmentShader: this.backgroundShader,
            uniforms: this.uniformsBackground,
        });
        this.shadertoyScene.add(new THREE.Mesh(plane, material));
    }
}

export default Game;