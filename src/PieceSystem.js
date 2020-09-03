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
const diffuseMap = textureLoader.load(diffuse);
const bumpMap = textureLoader.load(ambientOcclusion);
const normalMap = textureLoader.load(normal);
const roughnessMap = textureLoader.load(rough);
const displacementMap = textureLoader.load(displacment);   

const cylinderGeo = new CylinderGeometry(2, 2, 1, 32, 8);
cylinderGeo.translate(0, 0.5, 0);
cylinderGeo.computeVertexNormals();

export class PieceSystem {
    constructor() {
        this.group  = new Group();   
        this.pieceMap = new Map();
        this.selectionGroup = new Group();
    }

    setState(colorCount, gameState) {
        this.group.children = [];
        this.group.add(this.selectionGroup);

        this.labelMaterial = new MeshStandardMaterial({
            color: 0xff5f00,
            emissive: 0x111111
        });
    
        this.labelGeometries = [];
        const pieceMaterial = new MeshStandardMaterial({
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

        {
            this.piecePositions = [];
            const ratio = 50 /4;
            for (let x = 3; x < ratio - 2; ++x) {
                for (let y = 3; y < ratio - 2; ++y){
                    if ((x + y) % 2 == 0) continue;
                    this.piecePositions.push(new Vector2((x - (ratio / 2)) * 4 - 1, (y - (ratio /2)) * 4 - 1)); 
                }
            }
            this.piecePositions.sort(() => Math.random() - 0.5);
        }
            
        this.pieceMap = new Map();    

        let i = 0;
        let colorIndex = 0;
        for (const partition of gameState) {
            for (const partitionNumb of partition) {
                for (let k = 0; k < partitionNumb.count; ++k) {                
                    const piece = new Piece({
                        pieceGeometry: cylinderGeo,
                        pieceMaterial: pieceMaterial,
                        labelMaterial: this.labelMaterial,
                        labelGeometry: this.labelGeometries[colorIndex],
                        height: partitionNumb.number
                    });
                    this.pieceMap.set(piece.id, [colorIndex, partitionNumb, piece]);
                    this.group.add(piece);                
                    piece.setPostition(this.piecePositions[i], 0);
                    i++;
                }
            }
            ++colorIndex;
        }
    }

    selectPiece (id) {  
        this.selectionGroup .children = [];    
        const [selectedColorIndex, selectedPartitionNumb, selectedPieceVisual] = this.pieceMap.get(id);

        for (const pair of this.pieceMap) {
            const [pieceId, [colorIndex, partitionNumb, pieceVisual]] = pair;         
            if (pieceId === id) {
                const selectedPieceVisual = new SelectionPiece(new Color(0xff00ff));
                selectedPieceVisual.setFromPiece(pieceVisual);
                this.selectionGroup.add(selectedPieceVisual);
            }
            else if (partitionNumb.number === selectedPartitionNumb.number || colorIndex === selectedColorIndex) {
                const selectedPieceVisual = new SelectionPiece(new Color(0x00ff00));
                selectedPieceVisual.setFromPiece(pieceVisual);
                this.selectionGroup.add(selectedPieceVisual);
            }
        }
    }
}
