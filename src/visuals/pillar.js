import {
    Mesh,
    TextureLoader,
    MeshStandardMaterial,
    MeshBasicMaterial,
    CylinderGeometry,
    RepeatWrapping,
    Vector2
} from 'three';

const pillarHeight = 1600;

import pillarTopDiffuse from '../assets/Fabric_Nylon_weave_001_SD/Fabric_Nylon_weave_001_basecolor.jpg';
import pillarTopNormal from '../assets/Fabric_Nylon_weave_001_SD/Fabric_Nylon_weave_001_normal.jpg';
import pillarTopRoughness from '../assets/Fabric_Nylon_weave_001_SD/Fabric_Nylon_weave_001_roughness.jpg';
import pillarTopAoRoughnessMetalness from '../assets/Fabric_Nylon_weave_001_SD/combined.jpg';
import pillarTopHeightTexture from '../assets/Fabric_Nylon_weave_001_SD/Fabric_Nylon_weave_001_height.png';
import pillarTopOpacity from '../assets/Fabric_Nylon_weave_001_SD/Fabric_Nylon_weave_001_opacity.jpg';

import pillarSideDiffuse from '../assets/Tiles_034_SD/Tiles_034_basecolor.jpg';
import pillarSideNormal from '../assets/Tiles_034_SD/Tiles_034_normal.jpg';
import pillarSideRoughness from '../assets/Tiles_034_SD/Tiles_034_roughness.jpg';
import pillarSideAmbientOcclusion from '../assets/Tiles_034_SD/Tiles_034_ambientOcclusion.jpg';

const textureLoader = new TextureLoader();

export class Pillar extends Mesh {
    constructor() {
        const rep = 2;
        const diffuse = textureLoader.load(pillarTopDiffuse);
        diffuse.repeat.set(rep, rep);
        diffuse.wrapS = RepeatWrapping;
        diffuse.wrapT = RepeatWrapping;
        diffuse.anisotropy = 8;
        const normal = textureLoader.load(pillarTopNormal);
        normal.repeat.set(rep, rep);
        normal.wrapS = RepeatWrapping;
        normal.wrapT = RepeatWrapping;
        normal.anisotropy = 8;
        const pillarTopAoRoughnessMetalnessMap = textureLoader.load(pillarTopAoRoughnessMetalness);
        pillarTopAoRoughnessMetalnessMap.repeat.set(rep, rep);
        pillarTopAoRoughnessMetalnessMap.wrapS = RepeatWrapping;
        pillarTopAoRoughnessMetalnessMap.wrapT = RepeatWrapping;
        pillarTopAoRoughnessMetalnessMap.anisotropy = 8
        const heightMap = textureLoader.load(pillarTopHeightTexture);
        heightMap.repeat.set(rep, rep);
        heightMap.wrapS = RepeatWrapping;
        heightMap.wrapT = RepeatWrapping;
        heightMap.anisotropy = 8
        const opacityMap = textureLoader.load(pillarTopOpacity);
        opacityMap.repeat.set(rep, rep);
        opacityMap.wrapS = RepeatWrapping;
        opacityMap.wrapT = RepeatWrapping;
        opacityMap.anisotropy = 8;
        const roughnessMap = textureLoader.load(pillarTopRoughness);
        roughnessMap.wrapS = RepeatWrapping;
        roughnessMap.wrapT = RepeatWrapping;
        roughnessMap.anisotropy = 8;


        const sideRepS = 16;
        const sideRepT = 160;
        const diffuseSide = textureLoader.load(pillarSideDiffuse);
        diffuseSide.repeat.set(sideRepS, sideRepT);
        diffuseSide.wrapS = RepeatWrapping;
        diffuseSide.wrapT = RepeatWrapping;
        diffuseSide.anisotropy = 8;
        const normalSide = textureLoader.load(pillarSideNormal);
        normalSide.repeat.set(sideRepS, sideRepT);
        normalSide.wrapS = RepeatWrapping;
        normalSide.wrapT = RepeatWrapping;
        normalSide.anisotropy = 8;
        const ambientOcclusionSide = textureLoader.load(pillarSideAmbientOcclusion);
        ambientOcclusionSide.repeat.set(sideRepS, sideRepT);
        ambientOcclusionSide.wrapS = RepeatWrapping;
        ambientOcclusionSide.wrapT = RepeatWrapping;
        ambientOcclusionSide.anisotropy = 8;
        const roughnessMapSide = textureLoader.load(pillarSideRoughness);
        roughnessMapSide.repeat.set(sideRepS, sideRepT);
        roughnessMapSide.wrapS = RepeatWrapping;
        roughnessMapSide.wrapT = RepeatWrapping;
        roughnessMapSide.anisotropy = 8;


        const sideMaterial = new MeshStandardMaterial({
            color: 0xddeedd,
            roughness: 1,
            // metalness: 1,
            map: diffuseSide,
            normalMap: normalSide,
            bumpMap: ambientOcclusionSide,
            roughnessMap: roughnessMapSide,
            normalScale: new Vector2(2, 2)
            // color: 0x556655,
            // emissive : 0x222233,
            // emissive : 0x224433,
        });
        const matArray = [
            sideMaterial,
            // top of cylinder
            new MeshStandardMaterial({
                //emissive: 0x221133,
                roughness: 1,
                metalness: 0,
                map: diffuse,
                normalMap: normal,
                alphaMap: opacityMap,
                aoMap: pillarTopAoRoughnessMetalnessMap,
                roughnessMap: pillarTopAoRoughnessMetalnessMap,
                metalnessMap: pillarTopAoRoughnessMetalnessMap,
                color: 0x888888
                // displacementBias: 0.6
            }),
            new MeshBasicMaterial(),
        ];

        const pillarGeometry = new CylinderGeometry(25, 25, pillarHeight, 128, 128, false);

        super(pillarGeometry, matArray);
        this.translateY(-pillarHeight / 2);
    }
}