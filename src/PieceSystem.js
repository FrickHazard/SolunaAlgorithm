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
    setSelectionVisuals(params, pieceVisuals) {
        this.clear();
        const [selectionBlock, availableMoves, colorMap] = params;
        if (!selectionBlock) return;

        const [, , selectedVisualUuid] = selectionBlock;

        for (const pieceVisual of pieceVisuals) {  
            if (pieceVisual.uuid === selectedVisualUuid) {
                const selectedPieceVisual = new SelectionPiece(new Color(0xff00ff));
                selectedPieceVisual.setFromPiece(pieceVisual);
                this.group.add(selectedPieceVisual);
                this.ignoreSubscriptions.push(SelectionSystem.subscribeToIgnore(selectedPieceVisual.children[0]));
                this.ignoreSubscriptions.push(SelectionSystem.subscribeToIgnore(selectedPieceVisual.children[1]));  
            }
            else if (availableMoves.find(pair => pair.colorIndex === colorMap[pieceVisual.userData.colorIndex] && pair.height === pieceVisual.userData.height)) {
                const selectedPieceVisual = new SelectionPiece(new Color(0x00ff00));
                selectedPieceVisual.setFromPiece(pieceVisual);
                this.group.add(selectedPieceVisual);
                this.ignoreSubscriptions.push(SelectionSystem.subscribeToIgnore(selectedPieceVisual.children[0]));
                this.ignoreSubscriptions.push(SelectionSystem.subscribeToIgnore(selectedPieceVisual.children[1]));
            }
        }
    }    
}

export class PieceSystem {
    constructor() {
        this.highlightSystem = new PieceHighlightSubystem();
        this.group  = new Group();
        this.pieceVisuals = [];
        this.subscriptions = [];
        GameState.resetBoardUpdate.subscribe((st) => this.resetBoard(st));
        GameState.moveUpdate.subscribe(this.applyMove.bind(this));
        GameState.selectedPieceIndex.subscribe((st) => this.highlightSystem.setSelectionVisuals(st, this.pieceVisuals));
        GameState.selectedPieceIndex.subscribe(this.resetSubs.bind(this));        
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
        const [selectionBlock, availableMoves, colorMap] = params;

        this.subscriptions.forEach(f => f());
        this.subscriptions = [];

        if (!selectionBlock ) {
            for (const pieceVisual of this.pieceVisuals) {
                this.subscriptions.push(SelectionSystem.subscribeToSelect(pieceVisual,
                    () => GameState.setSelectedPiece([colorMap[pieceVisual.userData.colorIndex], pieceVisual.userData.height, pieceVisual.uuid])));
            }
            return;
        }
        const [, , selectedVisualUuid] = selectionBlock;

        for (const pieceVisual of this.pieceVisuals) {           
            if (
                selectedVisualUuid === pieceVisual.id
                || availableMoves.find(pair => pair.colorIndex === colorMap[pieceVisual.userData.colorIndex] && pair.height === pieceVisual.userData.height)
            ) {
                this.subscriptions.push(SelectionSystem.subscribeToSelect(pieceVisual,
                    () => GameState.setSelectedPiece([colorMap[pieceVisual.userData.colorIndex], pieceVisual.userData.height, pieceVisual.uuid])));
            }                    
        }
    }

    resetBoard([gameIndex, expandedGameState]) {    
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

        for (let i = 1; i <= expandedGameState.length; i++) {
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
            
        this.pieceVisuals = [];    
        let i = 0;
        let colorIndex = 0;
        for (const partition of expandedGameState) {
            for (const partitionNumb of partition) {
                for (let k = 0; k < partitionNumb.count; ++k) {                
                    const piece = new Piece({
                        pieceGeometry: cylinderGeo,
                        pieceMaterial: pieceMaterial,
                        labelMaterial: this.labelMaterial,
                        labelGeometry: this.labelGeometries[colorIndex],
                        height: partitionNumb.number
                    });
                    piece.userData = {
                        colorIndex,
                        height: partitionNumb.number
                    };
                    this.group.add(piece);     
                    piece.setPostition(this.piecePositions[i], 0);
                    this.pieceVisuals.push(piece);
                    i++;
                }
            }  
            ++colorIndex;
        }
    }

    applyMove([topPieceUuid, bottomPieceUuid, expandedGameState, colorMap]) {    
        const newPieceVisuals = [];

        const newHeight = this.pieceVisuals.find(x => x.uuid === topPieceUuid).userData.height +
            this.pieceVisuals.find(x => x.uuid === bottomPieceUuid).userData.height;

        const topColorIndex = this.pieceVisuals.find(x => x.uuid === topPieceUuid).userData.colorIndex;

        let colorIndex = 0;
        for (const partition of expandedGameState) {
            for (const partitionNumb of partition) {                
                const visuals = this.pieceVisuals.filter(x => 
                    colorMap[x.userData.colorIndex] === colorIndex
                    && x.userData.height === partitionNumb.number);

                for (const pieceVisual of visuals) {
                    if (pieceVisual.uuid === bottomPieceUuid) {
                        pieceVisual.setHeight(newHeight);
                        pieceVisual.setLabel(this.labelGeometries[topColorIndex], this.labelMaterial); 
                        pieceVisual.userData = {colorIndex:topColorIndex, height: newHeight };
                        newPieceVisuals.push(pieceVisual);
                    } else if (pieceVisual.uuid !== topPieceUuid) {
                        newPieceVisuals.push(pieceVisual);
                    }
                }
            }
            ++colorIndex;
        }

        this.pieceVisuals = newPieceVisuals;
        this.group.children = [];
        this.group.add(this.highlightSystem.group);
        this.pieceVisuals.forEach(x => this.group.add(x))
    }
}
