import * as THREE from 'three';
import {Mesh, Object3D, Vector3} from 'three';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls';
import {Service} from "typedi";
import SoundService from './services/sound';
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader';
import {GlslShader} from 'webpack-glsl-minify'

const PI = 3.14;

function isMobileDevice() {
    return (typeof window.orientation !== "undefined") || (navigator.userAgent.indexOf('IEMobile') !== -1)
}

@Service()
class Game {
    private renderer: THREE.WebGLRenderer;
    private scene: THREE.Scene;
    private shadertoyScene: THREE.Scene;
    private camera: THREE.PerspectiveCamera;
    private shadertoyCamera: THREE.OrthographicCamera;
    private raycaster = new THREE.Raycaster();
    private controls: OrbitControls;
    private faders = [];
    private knobs = [];
    
    //3D model variables
    private spaceBetweenFaders = 11.75;
    private faderWidth = 5;
    private maxFaderPosition = new THREE.Vector3(0, 0.03, 0);
    private minFaderPosition = new THREE.Vector3(0, -4.1, 16.9);
    private minKnobAngle = 0;
    private maxKnobAngle = 5.1;

    private backgroundShaderUniforms = null;
    private mixerShaderUniforms = null;

    private shaderMaterial: THREE.ShaderMaterial;
    
    private actualTime = 0;
    private previousTime = 0;
    
    private selectedFader: Object3D;
    private selectedKnob: Object3D;
    private planeFaders: Mesh;
    private planeScreen: Mesh;
    private offset: Vector3;
    private originalKnobMouseX: number;
    private originalKnobRotation: number;
    private knobSensitivity = 14;

    constructor(private soundService: SoundService) {
        soundService.LoadSounds();
    }

    randomIntFromInterval(min : number , max : number) : number{ // min and max included 
        return Math.floor(Math.random() * (max - min + 1) + min)
    }


    createScene(): void {
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, 2, 0.1, 100);
        this.camera.position.set(1.3250406408110678, 50, this.randomIntFromInterval(-10,30));


        const canvas = document.getElementById("c") as HTMLCanvasElement;
        this.renderer = new THREE.WebGLRenderer({
            canvas,
            antialias: true
        });

        this.controls = new OrbitControls(this.camera, canvas);

        this.controls.enableRotate = false;
        this.controls.enableZoom = true;
        this.controls.update();

        this.renderer.autoClear = false;


        this.AddLights();
        this.AddMixer();
        this.AddKnobs();
        this.AddFaders();

        this.AddMixerShader();
        this.AddBackgroundShader();
    }

    run() {
        requestAnimationFrame(() => this.run());
        this.render();
    }

    render(): void {
        let time = window.performance.now();
        this.actualTime += (time - this.previousTime) * 0.001; // convert to seconds

        if (this.ResizeRendererToDisplaySize(this.renderer)) {
            const canvas = this.renderer.domElement;
            this.camera.aspect = canvas.clientWidth / canvas.clientHeight;
            this.camera.updateProjectionMatrix();
        }

        const data = this.soundService.UpdateAnalyzer();

        if (data) {
            const texture = new THREE.DataTexture(data, 2048, 1, THREE.RGBFormat);
            this.mixerShaderUniforms.iTime.value = this.actualTime;
            this.mixerShaderUniforms.iResolution.value.set(20, 10, 1);
            this.mixerShaderUniforms.waveform.value = texture;
        }
        
        if (this.backgroundShaderUniforms && !isMobileDevice()) {
            this.backgroundShaderUniforms.iTime.value = this.actualTime;
            this.backgroundShaderUniforms.iResolution.value.set(this.renderer.domElement.width, this.renderer.domElement.height, 1);
            this.renderer.render(this.shadertoyScene, this.shadertoyCamera);
        }

        this.renderer.render(this.scene, this.camera);
        this.previousTime = time;
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

    MouseEventStart(mouseX: number, mouseY: number) {
        const vector = new THREE.Vector3(mouseX, mouseY, 1);
        vector.unproject(this.camera);
        this.raycaster.set(this.camera.position, vector.sub(this.camera.position).normalize());
        const intersectedFaders = this.raycaster.intersectObjects(this.faders, true);
        if (intersectedFaders.length > 0) {
            this.controls.enabled = false;
            this.selectedFader = intersectedFaders[0].object;
            let intersects = this.raycaster.intersectObject(this.planeFaders);
            this.offset.copy(intersects[0].point).sub(this.planeFaders.position);
            return;
        }

        const intersectedKnobs = this.raycaster.intersectObjects(this.knobs, true);
        if (intersectedKnobs.length > 0) {
            this.controls.enabled = false;
            this.selectedKnob = intersectedKnobs[0].object.parent;
            this.originalKnobMouseX = mouseX;
            this.originalKnobRotation = this.selectedKnob.rotation.z;
        }
    }

    MouseEventMove(mouseX: number, mouseY: number) {
        const vector = new THREE.Vector3(mouseX, mouseY, 1);
        vector.unproject(this.camera);
        this.raycaster.set(this.camera.position, vector.sub(this.camera.position).normalize());
        if (this.selectedFader) {
            const intersects = this.raycaster.intersectObject(this.planeFaders);
            if (intersects.length > 0) {
                const oldXPosition = this.selectedFader.position.x;
                
                this.selectedFader.position.copy(intersects[0].point.sub(this.offset));
                
                if (this.selectedFader.position.z < 10)
                    this.selectedFader.position.set(oldXPosition, Math.min(this.selectedFader.position.y, this.maxFaderPosition.y), Math.max(this.selectedFader.position.z, this.maxFaderPosition.z));
                else
                    this.selectedFader.position.set(oldXPosition, Math.max(this.selectedFader.position.y, this.minFaderPosition.y), Math.min(this.selectedFader.position.z, this.minFaderPosition.z));
                
                const faderLevel = ((this.selectedFader.position.z - this.minFaderPosition.z) / (this.maxFaderPosition.z - this.minFaderPosition.z));
                this.soundService.AdjustVolume(parseInt(this.selectedFader.parent.name), faderLevel);
            }
        } else if (this.selectedKnob) {
            const deltaAngle = this.knobSensitivity * (mouseX - this.originalKnobMouseX) + this.originalKnobRotation;
            
            if (this.selectedKnob.rotation.z < PI)
                this.selectedKnob.rotation.set(PI / 2, 0, Math.max(deltaAngle, this.minKnobAngle));
            else
                this.selectedKnob.rotation.set(PI / 2, 0, Math.min(deltaAngle, this.maxKnobAngle));
            
            const knobLevel = ((this.selectedKnob.rotation.z - this.minKnobAngle) / (this.maxKnobAngle - this.minKnobAngle));
            this.soundService.AdjustEffect(parseInt(this.selectedKnob.parent.name), knobLevel);
        } else {
            const intersects = this.raycaster.intersectObjects(this.faders, true);
            if (intersects.length > 0) {
                this.planeFaders.position.copy(intersects[0].object.position);
            }
        }
    }

    MouseEventEnd() {
        this.controls.enabled = true;
        this.selectedFader = null;
        this.selectedKnob = null;
        this.offset = new THREE.Vector3;
    }
    
    TouchEventStart(mouseX: number, mouseY: number){
        const vector = new Vector3(mouseX, mouseY, 1);
        vector.unproject(this.camera);
        this.raycaster.set(this.camera.position, vector.sub(this.camera.position).normalize());
        const intersects = this.raycaster.intersectObject(this.planeFaders);
        this.planeFaders.position.copy(intersects[0].point);
        this.MouseEventStart(mouseX, mouseY);
    }

    private AddMixer(): void {
        new GLTFLoader().load('models/mixer.glb', (gltf) => {
            const root = gltf.scene;
            root.position.set(0, -3.75, 0);
            this.scene.add(root);
            const box = new THREE.Box3().setFromObject(root);

            const boxSize = box.getSize(new THREE.Vector3()).length();
            //const boxCenter = box.getCenter(new THREE.Vector3());
            const boxCenter = new THREE.Vector3(1.3553901638776724, -6.662529599268561, -2.3002362037373625);
            
            
            this.camera.near = boxSize / 100;
            this.camera.far = boxSize * 100;

            this.camera.updateProjectionMatrix();

            this.controls.maxDistance = boxSize * 10;
            this.controls.target.copy(boxCenter);
            this.controls.update();
        });
    }

    private AddLights(): void {
        const light = new THREE.DirectionalLight(0xFFFFFF, 1);
        light.position.set(5, 10, 2);
        this.scene.add(light);

        const lightAmbient = new THREE.AmbientLight(0xF0F0F0, 1); // soft white light
        this.scene.add(lightAmbient);
    }

    private AddFaders(): void {
        new GLTFLoader().load('models/fader.glb', (gltf) => {
            for (let i = 0; i <= 7; i++) {
                const newFader = gltf.scene.clone();
                newFader.position.set(-45.75 + this.spaceBetweenFaders * i, 0, 1.2);
                newFader.name = (i + 1).toString();
                this.faders.push(newFader);
                this.scene.add(newFader);
            }
        });

        this.planeFaders = new THREE.Mesh(new THREE.PlaneBufferGeometry(130, 130, 8, 8), new THREE.MeshBasicMaterial({
            color: 0xffffff
        }));
        this.planeFaders.position.set(0, -1, 0);
        this.planeFaders.lookAt(0, 1, 0.5);
        this.planeFaders.visible = false;
        this.scene.add(this.planeFaders);
    }

    private AddKnobs(): void {
        new GLTFLoader().load('models/knob.glb', (gltf) => {
            for (let i = 0; i <= 7; i++) {
                const newKnob = gltf.scene.clone();
                newKnob.name = (i + 1).toString();
                newKnob.position.set(-45.75 + this.faderWidth / 2 + this.spaceBetweenFaders * i, -1, -19);
                newKnob.rotation.set(5.925, 0, 0);
                this.knobs.push(newKnob);
                this.scene.add(newKnob);
            }
        });
    }

    private AddMixerShader(): void {
        this.mixerShaderUniforms = {
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

        let mixerShaderFragment = require('./shaders/mixerShaderFragment.glsl') as GlslShader;
        let mixerShaderVertex = require('./shaders/mixerShaderVertex.glsl') as GlslShader;

        this.shaderMaterial = new THREE.ShaderMaterial({
            vertexShader: mixerShaderVertex.sourceCode,
            fragmentShader: mixerShaderFragment.sourceCode,
            uniforms: this.mixerShaderUniforms,
        });

        this.planeScreen = new THREE.Mesh(new THREE.PlaneBufferGeometry(15, 10, 8, 8), this.shaderMaterial);
        this.planeScreen.position.set(51.5, -1, -19);
        this.planeScreen.rotation.set(3 * PI / 2 + 5.925, 0, 0);
        this.scene.add(this.planeScreen);
    }

    private AddBackgroundShader() {
        this.shadertoyScene = new THREE.Scene();
        const plane = new THREE.PlaneBufferGeometry(2, 2);

        this.shadertoyCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, -1, 0);

        let backgroundShader = require('./shaders/backgroundShader.glsl') as GlslShader;

        this.backgroundShaderUniforms = {
            iTime: {
                value: 0
            },
            iResolution: {
                value: new THREE.Vector3()
            },
        };
        const material = new THREE.ShaderMaterial({
            fragmentShader: backgroundShader.sourceCode,
            uniforms: this.backgroundShaderUniforms,
        });
        this.shadertoyScene.add(new THREE.Mesh(plane, material));
    }
}

export default Game;