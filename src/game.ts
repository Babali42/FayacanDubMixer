import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { Service } from "typedi";
import SoundService from './services/sound';


@Service()
class Game {
    private renderer: THREE.WebGLRenderer;
    private scene: THREE.Scene;
    private camera: THREE.PerspectiveCamera;
    private cube: THREE.Mesh;
    private controls: OrbitControls;

    constructor(private soundService:SoundService){
        soundService.Log("Dependency injection is ok");
    }
    

    createScene() : void {
        this.scene = new THREE.Scene()
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
        this.camera.position.z = 2

        this.renderer = new THREE.WebGLRenderer()
        this.renderer.setSize(window.innerWidth, window.innerHeight)
        document.body.appendChild(this.renderer.domElement)

        this.controls = new OrbitControls(this.camera, this.renderer.domElement)

        const geometry = new THREE.BoxGeometry()
        const material = new THREE.MeshBasicMaterial({
            color: 0x00ff00,
            wireframe: true,
        })

        this.cube = new THREE.Mesh(geometry, material)
        this.scene.add(this.cube)

        window.addEventListener('resize', onWindowResize, false)
        function onWindowResize() {
            this.camera.aspect = window.innerWidth / window.innerHeight
            this.camera.updateProjectionMatrix()
            this.renderer.setSize(window.innerWidth, window.innerHeight)
            this.render()
        }
    }

    run(){
        requestAnimationFrame(()=>this.run());

        this.cube.rotation.x += 0.01
        this.cube.rotation.y += 0.01

        this.controls.update()

        this.render()
    }

    render() : void {
    this.renderer.render(this.scene, this.camera)
    }
}

export default Game;