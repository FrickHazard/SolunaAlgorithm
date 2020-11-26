import {
    Scene,
    PerspectiveCamera,
    WebGLRenderer,
    DirectionalLight,
    Fog,
    PointLight,
    AmbientLight,
} from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

import { Pillar } from './visuals/pillar';
import { Skybox } from './visuals/skybox';
import { PieceSystem } from './PieceSystem';
import SelectionSystem from './SelectionSystem';
import SplineMoveIndicatorSystem from './visuals/SplineMoveIndicatorSystem'

export const initThree = (domElement) => {
    const scene = new Scene();
    const camera = new PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 30000);
    const renderer = new WebGLRenderer();

    function onWindowResize() {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();

        renderer.setSize(window.innerWidth, window.innerHeight);
    }
    window.addEventListener('resize', onWindowResize, false);

    renderer.setSize(window.innerWidth, window.innerHeight);

    SelectionSystem.init(renderer, scene, camera);

    domElement.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enablePan = false;
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
        const directionalLight = new DirectionalLight(0xffffff, 1.);
        directionalLight.rotateY(0.1);
        directionalLight.rotateZ(0.5);
        scene.add(directionalLight);

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
    const splineIndicatorSystem = new SplineMoveIndicatorSystem();
    scene.add(splineIndicatorSystem)

    // animate
    const animate = function () {
        requestAnimationFrame(animate);

        controls.update();

        renderer.render(scene, camera);
    };

    animate();
};