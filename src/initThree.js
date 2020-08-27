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
    RepeatWrapping
} from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

import yellowCloudForward from './assets/yellowcloud_ft.jpg';
import yellowCloudBack from './assets/yellowcloud_bk.jpg';
import yellowCloudUp from './assets/yellowcloud_up.jpg';
import yellowCloudDown from './assets/yellowcloud_dn.jpg';
import yellowCloudRight from './assets/yellowcloud_rt.jpg';
import yellowCloudLeft from './assets/yellowcloud_lf.jpg';

import pillarDiffuse from './assets/Fabric_Nylon_weave_001_SD/Fabric_Nylon_weave_001_basecolor.jpg';
import pillarNormal from './assets/Fabric_Nylon_weave_001_SD/Fabric_Nylon_weave_001_normal.jpg';
import pillarRoughness from './assets/Fabric_Nylon_weave_001_SD/Fabric_Nylon_weave_001_roughness.jpg';
import pillarAmbientOcclusion from './assets/Fabric_Nylon_weave_001_SD/Fabric_Nylon_weave_001_ambientOcclusion.jpg';
import pillarHeightTexture from './assets/Fabric_Nylon_weave_001_SD/Fabric_Nylon_weave_001_height.png';
import pillarOpacity from './assets/Fabric_Nylon_weave_001_SD/Fabric_Nylon_weave_001_opacity.jpg';


export const initThree = (domElement) => {
    const rect = domElement.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;

    const scene =  new Scene();
    const camera = new PerspectiveCamera(75, width /innerHeight, 0.1, 30000);
    const renderer = new WebGLRenderer();

    renderer.setSize( window.innerWidth, window.innerHeight );
    domElement.appendChild(renderer.domElement);

    const controls = new OrbitControls( camera, renderer.domElement );
    // 26 = radius of piller + 1
    controls.minDistance = 26;
    controls.maxDistance = 100;
    controls.maxPolarAngle = (Math.PI / 2 - 0.1);
    camera.position.z = 26;
    controls.update();
    

    // cube
    const geometry = new BoxGeometry();
    const material = new MeshBasicMaterial( { color: 0x00ff00 } );
    const cube = new Mesh( geometry, material );

    scene.add( cube );

    const textureLoader = new TextureLoader();
       
    // pillar
    {
        const rep = 2;
        const diffuse = textureLoader.load(pillarDiffuse);
        diffuse.repeat.set(rep,rep);
        diffuse.wrapS = RepeatWrapping;
        diffuse.wrapT = RepeatWrapping;   
        diffuse.anisotropy = 8; 
        const normal = textureLoader.load(pillarNormal);
        normal.repeat.set(rep,rep);
        normal.wrapS = RepeatWrapping;
        normal.wrapT = RepeatWrapping;   
        normal.anisotropy = 8; 
        const ambientOcclusion = textureLoader.load(pillarAmbientOcclusion);
        ambientOcclusion.repeat.set(rep,rep);
        ambientOcclusion.wrapS = RepeatWrapping;
        ambientOcclusion.wrapT = RepeatWrapping;   
        ambientOcclusion.anisotropy = 8
        const heightMap = textureLoader.load(pillarHeightTexture);
        heightMap.repeat.set(rep,rep);
        heightMap.wrapS = RepeatWrapping;
        heightMap.wrapT = RepeatWrapping;   
        heightMap.anisotropy = 8
        const opacityMap = textureLoader.load(pillarOpacity);
        opacityMap.repeat.set(rep,rep);
        opacityMap.wrapS = RepeatWrapping;
        opacityMap.wrapT = RepeatWrapping;  
        opacityMap.anisotropy = 8;   
        const roughnessMap = textureLoader.load(pillarRoughness);
        roughnessMap.repeat.set(rep,rep);
        roughnessMap.wrapS = RepeatWrapping;
        roughnessMap.wrapT = RepeatWrapping; 
        roughnessMap.anisotropy = 8;      

        const sideMat = new MeshStandardMaterial({ 
            color: 0x3245bb,
            roughness: 1,
            metalness: 0.3,
            emissive: 0x222222
        });
        const matArray = [
            sideMat,            
            new MeshStandardMaterial({    
                emissive : 0x222233,         
                map: diffuse,
                normalMap: normal,
                aoMap: ambientOcclusion,
                roughnessMap,
                alphaMap: opacityMap,
                displacementMap: heightMap,
                displacementScale : 0,
                // displacementBias: 0.6
            }),
            sideMat,
        ];
        const pillarHeight = 1600;
        const boardGeometry = new CylinderGeometry( 25, 25, pillarHeight, 128, 128, false);
        const boardMesh = new Mesh(boardGeometry, matArray);      
        boardMesh.translateY(-pillarHeight / 2);
        scene.add( boardMesh )
    }

    // light
    {
        var directionalLight = new DirectionalLight( 0xffffff, 1. );
        directionalLight.rotateX(0.1);
        directionalLight.rotateZ(0.5);
        scene.add( directionalLight );
    }

    // fog
    {
        scene.fog = new Fog(0x000000, 1, 800);
    }
    
    // skybox
    {
       
        const front = textureLoader.load(yellowCloudForward);
        const back = textureLoader.load(yellowCloudBack);
        const up = textureLoader.load(yellowCloudUp);
        const down = textureLoader.load(yellowCloudDown);
        const right = textureLoader.load(yellowCloudRight);
        const left = textureLoader.load(yellowCloudLeft);

        const matArray = [
            new MeshBasicMaterial({ map: front, side: BackSide, fog: false }),
            new MeshBasicMaterial({ map: back, side: BackSide, fog: false }),
            new MeshBasicMaterial({ map: up, side: BackSide, fog: false }),
            new MeshBasicMaterial({ map: down, side: BackSide, fog: false }),
            new MeshBasicMaterial({ map: right, side: BackSide, fog: false }),
            new MeshBasicMaterial({ map: left, side: BackSide, fog: false })
        ];
        
        const skyboxGeo = new BoxGeometry(10000, 10000, 10000);
        const skybox = new Mesh(skyboxGeo, matArray);
        scene.add(skybox);
    }

    // animate
    const animate = function () {
        requestAnimationFrame( animate );

        cube.rotation.x += 0.01;
        cube.rotation.y += 0.01;

        controls.update();

        renderer.render( scene, camera );
    };

    animate();
};