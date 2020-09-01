import {
    Scene,
    PerspectiveCamera,
    WebGLRenderer,
    BoxGeometry,
    MeshBasicMaterial,
    Mesh,
    MeshStandardMaterial,
    DirectionalLight,
    BackSide,
    TextureLoader,
    Fog,
    CylinderGeometry,
    RepeatWrapping,
    PointLight,
    AmbientLight,
    Vector2,
    Vector3,
    Shape,
    FontLoader,
    ShapeGeometry,
    TextBufferGeometry,
    Font
} from 'three';
// for gpu picker
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

import { Pillar} from './visuals/pillar';
import { Skybox } from './visuals/skybox';
import { PieceSystem } from './PieceSystem';

import { GPUPicker } from 'three_gpu_picking';

export const initThree = (domElement) => {
    const rect = domElement.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;

    const scene =  new Scene();
    const camera = new PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 30000);
    const renderer = new WebGLRenderer();

    renderer.setSize( window.innerWidth, window.innerHeight);
    domElement.appendChild(renderer.domElement);

    const gpuPicker = new GPUPicker(THREE, renderer, scene, camera);   

    const controls = new OrbitControls( camera, renderer.domElement );
    // 26 = radius of piller + 1
    controls.minDistance = 26;
    controls.maxDistance = 100;
    controls.maxPolarAngle = (Math.PI / 2 - 0.2);
    camera.position.z = 26;
    controls.update();    

    scene.add(new Pillar());
    scene.add(new Skybox());

    // light
    {
        const directionalLight = new DirectionalLight( 0xffffff, 1. );
        directionalLight.rotateY(0.1);
        directionalLight.rotateZ(0.5);
        scene.add( directionalLight );

        const pointLight = new PointLight(0x102030, 7, 30, 1);
        pointLight.translateY(10);
        scene.add(pointLight);

        const ambientLight = new AmbientLight(0xFFFFFF, 3);
        scene.add(ambientLight);
    }

    // fog
    {
        scene.fog = new Fog(0x000000, 1, 800);
    }
 
    const pieceSystem = new PieceSystem();
    scene.add(pieceSystem.group);
    
    window.onclick = (ev) => {
        const objectId = gpuPicker.pick(ev.clientX / renderer.getPixelRatio(), ev.clientY / renderer.getPixelRatio());
        if (pieceSystem.pieceMap.has(objectId)) {
            pieceSystem.selectPiece(objectId);
        }
    };

    // animate
    const animate = function () {
        requestAnimationFrame( animate );

        controls.update();

        renderer.render( scene, camera );
    };

    animate();

    return pieceSystem;
};