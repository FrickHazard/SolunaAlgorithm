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
import GameState from './GameState';
import SelectionSystem from './SelectionSystem';
import gameState from './GameState';

const textureLoader = new TextureLoader();
const diffuseMap = textureLoader.load(diffuse);
const bumpMap = textureLoader.load(ambientOcclusion);
const normalMap = textureLoader.load(normal);
const roughnessMap = textureLoader.load(rough);
const displacementMap = textureLoader.load(displacment);   

const cylinderGeo = new CylinderGeometry(2, 2, 1, 32, 8);
cylinderGeo.translate(0, 0.5, 0);
cylinderGeo.computeVertexNormals();


class PieceHighlightSubystem {
    constructor() {
        this.ignoreSubscriptions = [];
        this.group = new Group();
    }
    clear() {
        this.ignoreSubscriptions.forEach(f => f());
        this.group.children = [];
    }
    setSelectionVisuals(params, pieceVisualMap) {        
        this.clear();    
        if (!params) return;

        const [[selectedPieceColorIndex, selectedPiecePartitionIndex, selectedSubPartitionIndex], availableMoveIds] = params;

        for (const [colorIndex, partitionMap] of pieceVisualMap) {
            for(const [partitionIndex, subPartitionMap] of partitionMap) {     
                for(const [subPartitionIndex, pieceVisual] of subPartitionMap) {     
                    if (
                        selectedPieceColorIndex === colorIndex
                        && selectedPiecePartitionIndex === partitionIndex
                        && selectedSubPartitionIndex === subPartitionIndex
                    ) {
                        const selectedPieceVisual = new SelectionPiece(new Color(0xff00ff));
                        selectedPieceVisual.setFromPiece(pieceVisual);
                        this.group.add(selectedPieceVisual);
                        this.ignoreSubscriptions.push(SelectionSystem.subscribeToIgnore(selectedPieceVisual.children[0]));
                        this.ignoreSubscriptions.push(SelectionSystem.subscribeToIgnore(selectedPieceVisual.children[1]));  
                    }
                    else if (availableMoveIds.find(pair => pair[0] === colorIndex && pair[1] === partitionIndex)) {
                        const selectedPieceVisual = new SelectionPiece(new Color(0x00ff00));
                        selectedPieceVisual.setFromPiece(pieceVisual);
                        this.group.add(selectedPieceVisual);
                        this.ignoreSubscriptions.push(SelectionSystem.subscribeToIgnore(selectedPieceVisual.children[0]));
                        this.ignoreSubscriptions.push(SelectionSystem.subscribeToIgnore(selectedPieceVisual.children[1]));
                    }
                }
            }
        }

    }
}

export class PieceSystem {
    constructor() {
        this.highlightSystem = new PieceHighlightSubystem();
        this.group  = new Group();   
        this.pieceMap = new Map();
        this.subscriptions = [];
        GameState.activeGameIndex.subscribe((st) => this.setState(st));
        GameState.selectedPieceIndex.subscribe((st) => this.highlightSystem.setSelectionVisuals(st, this.pieceMap));
        GameState.selectedPieceIndex.subscribe((st) => this.resetSubs(st));
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
    }
    resetSubs(params) {    
        this.subscriptions.forEach(f => f());
        this.subscriptions = [];
        if (!params) {            
            for (const [colorIndex,partitionMap] of this.pieceMap) {
                for (const [partitionIndex, subPartitionMap] of partitionMap ) {
                    for (const [k, pieceVisual] of subPartitionMap ) {
                        this.subscriptions.push(SelectionSystem.subscribeToSelect(pieceVisual, () => GameState.setSelectedPieceIndex([colorIndex, partitionIndex, k])));
                    }   
                }
            }
            return;
        }

        const [[selectedPieceColorIndex, selectedPiecePartitionIndex, selectedSubPartitionIndex], availableMoveIds] = params;

        for (const [colorIndex,partitionMap] of this.pieceMap) {
            for (const [partitionIndex, subPartitionMap] of partitionMap ) {
                for (const [k, pieceVisual] of subPartitionMap ) {
                    if ((
                        selectedPieceColorIndex === colorIndex
                        && selectedPiecePartitionIndex === partitionIndex
                        && k === selectedSubPartitionIndex)
                        ||  availableMoveIds.find(pair => pair[0] === colorIndex && pair[1] === partitionIndex)                   
                    ) {
                        this.subscriptions.push(SelectionSystem.subscribeToSelect(pieceVisual,
                            () => GameState.setSelectedPieceIndex([colorIndex, partitionIndex, k])));
                    }
                }   
            }
        }
    }
    setState([gameIndex, gameState]) {    
        this.subscriptions.forEach(x => x());
        this.group.children = [];
        this.group.add(this.highlightSystem.group);

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

        for (let i = 1; i <= gameState.length; i++) {
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
            
        this.pieceMap = new Map();    
        let i = 0;
        let colorIndex = 0;
        for (const partition of gameState) {
            let partitionNumbIndex = 0;
            for (const partitionNumb of partition) {
                for (let k = 0; k < partitionNumb.count; ++k) {                
                    const piece = new Piece({
                        pieceGeometry: cylinderGeo,
                        pieceMaterial: pieceMaterial,
                        labelMaterial: this.labelMaterial,
                        labelGeometry: this.labelGeometries[colorIndex],
                        height: partitionNumb.number
                    });
                    // TODO hack because messy closure, fix later
                    let c = colorIndex;
                    let p = partitionNumbIndex;

                    this.subscriptions.push(SelectionSystem.subscribeToSelect(piece, () => GameState.setSelectedPieceIndex([c, p, k])));
                    if (!this.pieceMap.has(colorIndex)) {
                        this.pieceMap.set(colorIndex, new Map([[partitionNumbIndex, new Map([[k, piece]])]]));
                    } else {
                        if (!this.pieceMap.get(colorIndex).has(partitionNumbIndex)) {
                            this.pieceMap.get(colorIndex).set(partitionNumbIndex, new Map([[k, piece]]));
                        }
                        else {
                            this.pieceMap.get(colorIndex).get(partitionNumbIndex).set(k, piece);
                        }                       
                    }                
                    this.group.add(piece);     
                    piece.setPostition(this.piecePositions[i], 0);
                    i++;
                }
                ++partitionNumbIndex;
            }  
            ++colorIndex;
        }
    }
}
