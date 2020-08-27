import {
    Scene,
    PerspectiveCamera,
    WebGLRenderer,
    BoxGeometry,
    MeshBasicMaterial,
    Mesh,
    PlaneGeometry,
    MeshStandardMaterial,
    DirectionalLight,
    BackSide,
    TextureLoader
} from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'

import yellowCloudForward from './assets/yellowcloud_ft.jpg'
import yellowCloudBack from './assets/yellowcloud_bk.jpg'
import yellowCloudUp from './assets/yellowcloud_up.jpg'
import yellowCloudDown from './assets/yellowcloud_dn.jpg'
import yellowCloudRight from './assets/yellowcloud_rt.jpg'
import yellowCloudLeft from './assets/yellowcloud_lf.jpg'



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
    camera.position.z = 5;
    controls.update();

    // cube
    const geometry = new BoxGeometry();
    const material = new MeshBasicMaterial( { color: 0x00ff00 } );
    const cube = new Mesh( geometry, material );

    scene.add( cube );
    
    const realMat = new MeshStandardMaterial({ 
        color: 0x2194ce,
        roughness: 1,
        metalness: 0,
        emissive: 0xd19999
    })
    // board
    const boardGeometry = new PlaneGeometry( 50, 50, 8, 8 );
    const boardMesh = new Mesh(boardGeometry, realMat);
    boardMesh.rotateX(-3.14/ 2);
    scene.add( boardMesh )

    // light
    var directionalLight = new DirectionalLight( 0xffffff, 0.5 );
    scene.add( directionalLight );

    
    // skybox
    {
        const textureLoader = new TextureLoader();
        const front = textureLoader.load(yellowCloudForward);
        const back = textureLoader.load(yellowCloudBack);
        const up = textureLoader.load(yellowCloudUp);
        const down = textureLoader.load(yellowCloudDown);
        const right = textureLoader.load(yellowCloudRight);
        const left = textureLoader.load(yellowCloudLeft);

        const matArray = [
            new MeshBasicMaterial({ map: front, side: BackSide }),
            new MeshBasicMaterial({ map: back, side: BackSide }),
            new MeshBasicMaterial({ map: up, side: BackSide }),
            new MeshBasicMaterial({ map: down, side: BackSide }),
            new MeshBasicMaterial({ map: right, side: BackSide }),
            new MeshBasicMaterial({ map: left, side: BackSide })
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