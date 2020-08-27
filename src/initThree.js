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
    AmbientLight
} from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

import skyBoxForward from './assets/skybox/graycloud_ft.jpg';
import skyBoxBack from './assets/skybox/graycloud_bk.jpg';
import skyBoxUp from './assets/skybox/graycloud_up.jpg';
import skyBoxDown from './assets/skybox/graycloud_dn.jpg';
import skyBoxight from './assets/skybox/graycloud_rt.jpg';
import skyBoxLeft from './assets/skybox/graycloud_lf.jpg';

import pillarTopDiffuse from './assets/Fabric_Nylon_weave_001_SD/Fabric_Nylon_weave_001_basecolor.jpg';
import pillarTopNormal from './assets/Fabric_Nylon_weave_001_SD/Fabric_Nylon_weave_001_normal.jpg';
import pillarTopRoughness from './assets/Fabric_Nylon_weave_001_SD/Fabric_Nylon_weave_001_roughness.jpg';
import pillarTopAmbientOcclusion from './assets/Fabric_Nylon_weave_001_SD/Fabric_Nylon_weave_001_ambientOcclusion.jpg';
import pillarTopHeightTexture from './assets/Fabric_Nylon_weave_001_SD/Fabric_Nylon_weave_001_height.png';
import pillarTopOpacity from './assets/Fabric_Nylon_weave_001_SD/Fabric_Nylon_weave_001_opacity.jpg';

import pillarSideDiffuse from './assets/Concrete_Column_001_SD/Concrete_Column_001_basecolor.jpg';
import pillarSideNormal from './assets/Concrete_Column_001_SD/Concrete_Column_001_normal.jpg';
import pillarSideRoughness from './assets/Concrete_Column_001_SD/Concrete_Column_001_roughness.jpg';
import pillarSideAmbientOcclusion from './assets/Concrete_Column_001_SD/Concrete_Column_001_ambientOcclusion.jpg';
import pillarSideHeightTexture from './assets/Concrete_Column_001_SD/Concrete_Column_001_height.png';

export const initThree = (domElement) => {
    const rect = domElement.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;

    const scene =  new Scene();
    const camera = new PerspectiveCamera(75, width /window.innerHeight, 0.1, 30000);
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

    const textureLoader = new TextureLoader();
       
    // pillar
    {
        const rep = 2;
        const diffuse = textureLoader.load(pillarTopDiffuse);
        diffuse.repeat.set(rep,rep);
        diffuse.wrapS = RepeatWrapping;
        diffuse.wrapT = RepeatWrapping;   
        diffuse.anisotropy = 8; 
        const normal = textureLoader.load(pillarTopNormal);
        normal.repeat.set(rep,rep);
        normal.wrapS = RepeatWrapping;
        normal.wrapT = RepeatWrapping;   
        normal.anisotropy = 8; 
        const ambientOcclusion = textureLoader.load(pillarTopAmbientOcclusion);
        ambientOcclusion.repeat.set(rep,rep);
        ambientOcclusion.wrapS = RepeatWrapping;
        ambientOcclusion.wrapT = RepeatWrapping;   
        ambientOcclusion.anisotropy = 8
        const heightMap = textureLoader.load(pillarTopHeightTexture);
        heightMap.repeat.set(rep,rep);
        heightMap.wrapS = RepeatWrapping;
        heightMap.wrapT = RepeatWrapping;   
        heightMap.anisotropy = 8
        const opacityMap = textureLoader.load(pillarTopOpacity);
        opacityMap.repeat.set(rep,rep);
        opacityMap.wrapS = RepeatWrapping;
        opacityMap.wrapT = RepeatWrapping;  
        opacityMap.anisotropy = 8;   
        const roughnessMap = textureLoader.load(pillarTopRoughness);        
        roughnessMap.wrapS = RepeatWrapping;
        roughnessMap.wrapT = RepeatWrapping; 
        roughnessMap.anisotropy = 8; 
        

        const sideRepS = 40;
        const sideRepT = 40;
        const diffuseSide = textureLoader.load(pillarSideDiffuse);
        diffuseSide.repeat.set(sideRepS,sideRepT);
        diffuseSide.wrapS = RepeatWrapping;
        diffuseSide.wrapT = RepeatWrapping;
        diffuseSide.anisotropy = 8;
        const normalSide = textureLoader.load(pillarSideNormal);
        normalSide.repeat.set(sideRepS,sideRepT);
        normalSide.wrapS = RepeatWrapping;
        normalSide.wrapT = RepeatWrapping;
        normalSide.anisotropy = 8;
        const ambientOcclusionSide = textureLoader.load(pillarSideAmbientOcclusion);
        ambientOcclusionSide.repeat.set(sideRepS,sideRepT);
        ambientOcclusionSide.wrapS = RepeatWrapping;
        ambientOcclusionSide.wrapT = RepeatWrapping;
        ambientOcclusionSide.anisotropy = 8;
        const roughnessMapSide = textureLoader.load(pillarSideRoughness);
        roughnessMapSide.repeat.set(sideRepS,sideRepT);
        roughnessMapSide.wrapS = RepeatWrapping;
        roughnessMapSide.wrapT = RepeatWrapping;
        roughnessMapSide.anisotropy = 8;


        const sideMaterial = new MeshStandardMaterial({ 
            // color: 0x000000,
            //roughness: 0.4,
            // metalness: 0.3,
            map: diffuseSide,
            normalMap: normalSide,
            aoMap: ambientOcclusionSide,
            roughnessMap: roughnessMapSide,        
            color: 0x556655,
            // emissive : 0x222233,  
            // emissive : 0xffffff, 
        });
        const matArray = [
            sideMaterial, 
            // top of cylinder           
            new MeshStandardMaterial({    
                emissive : 0x222233,         
                map: diffuse,
                normalMap: normal,
                aoMap: ambientOcclusion,
                roughnessMap,
                alphaMap: opacityMap,
                displacementMap: heightMap,
                displacementScale : 0,
                color: 0x2255ff
                // displacementBias: 0.6
            }),            
            new MeshBasicMaterial(),
        ];
        const pillarHeight = 1600;
        const boardGeometry = new CylinderGeometry( 25, 25, pillarHeight, 128, 128, false);
        const boardMesh = new Mesh(boardGeometry, matArray);      
        boardMesh.translateY(-pillarHeight / 2);
        scene.add( boardMesh )
    }

    // light
    {
        const directionalLight = new DirectionalLight( 0xffffff, 1. );
        directionalLight.rotateY(0.1);
        directionalLight.rotateZ(0.5);
        scene.add( directionalLight );

        const pointLight = new PointLight(0x102030, 7, 30, 1);
        pointLight.translateY(10);
        scene.add(pointLight);

        const ambientLight = new AmbientLight(0xFFFFFF, 2);
        scene.add(ambientLight);
    }

    // fog
    {
        scene.fog = new Fog(0x000000, 1, 800);
    }
    
    // skybox
    {
       
        const front = textureLoader.load(skyBoxForward);
        const back = textureLoader.load(skyBoxBack);
        const up = textureLoader.load(skyBoxUp);
        const down = textureLoader.load(skyBoxDown);
        const right = textureLoader.load(skyBoxight);
        const left = textureLoader.load(skyBoxLeft);

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

        controls.update();

        renderer.render( scene, camera );
    };

    animate();
};