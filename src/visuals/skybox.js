import {
    Mesh,
    MeshBasicMaterial,
    BoxGeometry,
    TextureLoader,
    BackSide
 } from 'three';

import skyBoxForward from '../assets/skybox/graycloud_ft.jpg';
import skyBoxBack from '../assets/skybox/graycloud_bk.jpg';
import skyBoxUp from '../assets/skybox/graycloud_up.jpg';
import skyBoxDown from '../assets/skybox/graycloud_dn.jpg';
import skyBoxight from '../assets/skybox/graycloud_rt.jpg';
import skyBoxLeft from '../assets/skybox/graycloud_lf.jpg';

const textureLoader = new TextureLoader();

export class Skybox extends Mesh {
    constructor() {
         
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

        super(skyboxGeo, matArray);
    }
}