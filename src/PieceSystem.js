import {
    MeshStandardMaterial,
    Group,
    Font,
    Vector2,
    TextureLoader,
    Color,
    CylinderGeometry,
    TextGeometry,
    Vector3,
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
import { CurveSystem } from './visuals/curves'

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

    setHighlights(selectionState, pieceVisuals) {
        this.clear();
        if (!selectionState) return;

        for (const pieceVisual of pieceVisuals) {
            const move = selectionState.moves.find(
                x => pieceVisual.userData.colorIndex === x.colorIndex
                    && pieceVisual.userData.partitionIndex === x.partitionIndex)
            if (pieceVisual.userData.colorIndex === selectionState.colorIndex &&
                pieceVisual.userData.partitionIndex === selectionState.partitionIndex
            ) {
                const selectedPieceVisual = new SelectionPiece(new Color(0xff00ff));
                selectedPieceVisual.setFromPiece(pieceVisual);
                this.group.add(selectedPieceVisual);
                this.ignoreSubscriptions.push(SelectionSystem.subscribeToIgnore(selectedPieceVisual.children[0]));
                this.ignoreSubscriptions.push(SelectionSystem.subscribeToIgnore(selectedPieceVisual.children[1]));
            }
            else if (move) {
                let color = 0x00ff00
                if (move.mistake) {
                    color = 0xffaa00
                }
                const selectedPieceVisual = new SelectionPiece(new Color(color));
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
        this.curveSystem = new CurveSystem();
        this.highlightSystem = new PieceHighlightSubystem();
        this.group = new Group();
        this.pieceVisuals = [];
        this.subscriptions = [];
        GameState.gameStateObject.subscribe(this.setVisuals.bind(this));
        GameState.selectedPieceData.subscribe((st) => this.highlightSystem.setHighlights(st, this.pieceVisuals));
        GameState.selectedPieceData.subscribe(this.resetSubs.bind(this));
        GameState.botsTurn.subscribe(this.clearSubsOnBotTurn.bind(this))
    }

    clearSubsOnBotTurn(botsTurn) {
        if (botsTurn) {
            this.subscriptions.forEach(f => f());
        } else {
            this.resetSubs(undefined)
        }
    }

    resetSubs(selectionState) {
        this.subscriptions.forEach(f => f());
        this.subscriptions = [];

        if (GameState.menu.state !== 'none') return

        if (!selectionState) {
            for (const pieceVisual of this.pieceVisuals) {
                this.subscriptions.push(SelectionSystem.subscribeToSelect(pieceVisual,
                    () => GameState.selectPiece({ ...pieceVisual.userData })));
            }
            return;
        }

        for (const pieceVisual of this.pieceVisuals) {
            if (
                selectionState.moves.find(
                    x => pieceVisual.userData.colorIndex === x.colorIndex
                        && pieceVisual.userData.partitionIndex === x.partitionIndex)
                || (pieceVisual.userData.colorIndex === selectionState.colorIndex
                    && pieceVisual.userData.partitionIndex === selectionState.partitionIndex)
            ) {
                this.subscriptions.push(SelectionSystem.subscribeToSelect(pieceVisual,
                    () => GameState.selectPiece({ ...pieceVisual.userData })));
            }
        }
    }

    setVisuals(gameStateObj) {
        this.subscriptions.forEach(f => f());
        this.group.children = [];
        console.log(gameStateObj)
        if (!gameStateObj) return
        this.group.add(this.highlightSystem.group);
        this.group.add(this.curveSystem);

        this.labelMaterial = new MeshStandardMaterial({
            color: 0xff5f00,
            emissive: 0x111111
        });

        this.labelGeometries = {};
        this.pieceMaterial = new MeshStandardMaterial({
            // color: 0xffffff,
            // emissive: 0x111111,
            map: diffuseMap,
            color: 0x333333,
            //roughnessMap: roughnessMap
            // bumpMap,
            normalMap,
            bumpMap
            // roughnessMap,
        });

        for (const key of Object.keys(gameStateObj)) {
            this.labelGeometries[key] = new TextGeometry(key.toString(), {
                font: new Font(helevetikerFont),
                size: 1.5,
                height: 0.5,
                curveSegments: 12,
            });
            this.labelGeometries[key].computeVertexNormals();
            this.labelGeometries[key].computeBoundingBox();
            this.labelGeometries[key].center();
        }
        // divide ---
        this.pieceVisuals = [];
        for (const key of Object.keys(gameStateObj)) {
            const colorIndex = Number(key);
            const partition = gameStateObj[key].partition;
            for (let i = 0; i < partition.length; ++i) {
                const pieceData = partition[i]
                const piece = new Piece({
                    pieceGeometry: cylinderGeo,
                    pieceMaterial: this.pieceMaterial,
                    labelMaterial: this.labelMaterial,
                    labelGeometry: this.labelGeometries[colorIndex],
                    height: pieceData.number
                });
                piece.userData = {
                    colorIndex,
                    partitionIndex: i,
                };
                this.group.add(piece);
                piece.setPostition(new Vector2(pieceData.pos.x, pieceData.pos.y), 0);
                this.pieceVisuals.push(piece);
            }
        }
    }
}
