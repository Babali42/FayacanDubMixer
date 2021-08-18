import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { Service } from "typedi";


@Service()
class Game {
    private renderer: THREE.WebGLRenderer;
    

    createScene() : void {
        const scene = new THREE.Scene()
        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
        camera.position.z = 2

        this.renderer = new THREE.WebGLRenderer()
        this.renderer.setSize(window.innerWidth, window.innerHeight)
        document.body.appendChild(this.renderer.domElement)

        const controls = new OrbitControls(camera, this.renderer.domElement)

        const geometry = new THREE.BoxGeometry()
        const material = new THREE.MeshBasicMaterial({
            color: 0x00ff00,
            wireframe: true,
        })

        const cube = new THREE.Mesh(geometry, material)
        scene.add(cube)

        window.addEventListener('resize', onWindowResize, false)
        function onWindowResize() {
            camera.aspect = window.innerWidth / window.innerHeight
            camera.updateProjectionMatrix()
            this.renderer.setSize(window.innerWidth, window.innerHeight)
            this.render()
        }
    }

    run() : void {
        requestAnimationFrame(run)

    cube.rotation.x += 0.01
    cube.rotation.y += 0.01

    controls.update()

    render()
    }

    render() : void {
    this.renderer.render(scene, camera)
    }
}