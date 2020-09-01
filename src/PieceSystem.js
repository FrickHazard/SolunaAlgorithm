import {
    MeshStandardMaterial,
    Group,
    TextBufferGeometry,
    Font,
    Vector2,
    TextureLoader,
    Color,
    ShaderMaterial,
    Mesh,
    CylinderBufferGeometry,
    BackSide,
    NeverDepth,
    NotEqualStencilFunc,
    ReplaceStencilOp,
    DoubleSide,
    KeepStencilOp,
    CylinderGeometry,
    TextGeometry,
} from 'three';
import { Piece } from './visuals/piece';
import helevetikerFont from './assets/helvetiker_bold.typeface.json';

import diffuse from "./assets/White_Marble_004_SD/White_Marble_004_COLOR.jpg";
import displacment from "./assets/White_Marble_004_SD/White_Marble_004_DISP.png";
import normal from "./assets/White_Marble_004_SD/White_Marble_004_NORM.jpg";
import ambientOcclusion from "./assets/White_Marble_004_SD/White_Marble_004_OCC.jpg";
import rough from "./assets/White_Marble_004_SD/White_Marble_004_ROUGH.jpg";
import { SelectionPiece } from './visuals/selectionPiece';

const textureLoader = new TextureLoader();

const cylinderGeo = new CylinderGeometry(2, 2, 0.5, 32, 8);
cylinderGeo.translate(0, 0.5, 0);
cylinderGeo.computeVertexNormals();
console.log(cylinderGeo.toJSON());

export class PieceSystem {
    constructor(colorCount, colorPartition) {
        const diffuseMap = textureLoader.load(diffuse);
        const bumpMap = textureLoader.load(ambientOcclusion);
        const normalMap = textureLoader.load(normal);
        const roughnessMap = textureLoader.load(rough);
        const displacementMap = textureLoader.load(displacment);       

        this.labelMaterial = new MeshStandardMaterial({
            color: 0xff5f00,
            emissive: 0x111111
        });
    
        this.labelGeometries = [];
        const mat = new MeshStandardMaterial({
            // color: 0xffffff,
            // emissive: 0x111111,
            map: diffuseMap,
            color: 0x333333 ,
            //roughnessMap: roughnessMap
            // bumpMap,
            normalMap,
            bumpMap
            // roughnessMap,   
        });

        const colors = [0x333133, 0x223333, 0x332133, 0x433433, 0x333355, 0x330033, 0x304000 ];
        this.pieceMaterials = [];
        for (const color of colors) {
            this.pieceMaterials.push(mat.clone());
            this.pieceMaterials[this.pieceMaterials.length - 1].color = new Color(color);
        }

        for (let i = 1; i <= colorCount; i++) {
            this.labelGeometries.push(new TextGeometry(i.toString(), {
                font: new Font(helevetikerFont),
                size: 1.5,
                height: 0.5,
                curveSegments: 12,
            }));
            this.labelGeometries[i-1].computeVertexNormals();
            this.labelGeometries[i-1].computeBoundingBox();
            this.labelGeometries[i-1].center();
        }

        this.piecePositions = [];
        const ratio = 50 /4;
        for (let x = 3; x < ratio - 2; ++x) {
            for (let y = 3; y < ratio - 2; ++y){
                if ((x + y) % 2 == 0) continue;
                this.piecePositions.push(new Vector2((x - (ratio / 2)) * 4 - 1, (y - (ratio /2)) * 4 - 1)); 
            }
        }
        this.piecePositions.sort(() => Math.random() - 0.5);
            
        this.pieceMap = new Map();
        this.group  = new Group(); 
        this.selectedPiece = this.createSelectedPiece();
        this.group.add(this.selectedPiece);


        let i = 0;
        for (const idx of colorPartition) {
            const piece = new Piece({
                pieceGeometry: cylinderGeo,
                pieceMaterial: this.pieceMaterials[idx],
                labelMaterial: this.labelMaterial,
                labelGeometry: this.labelGeometries[idx]
            });
            this.pieceMap.set(piece.id, piece);
            this.group.add(piece);
            piece.setPostition(this.piecePositions[i], 0);
            i++;
        }
    }
    
    createSelectedPiece() {
        return new SelectionPiece();
    }

    selectPiece (id) {
        const piece = this.pieceMap.get(id);  
        this.selectedPiece.setfromPiece(piece)
        this.selectedPiece.visible = true;
    }
}
