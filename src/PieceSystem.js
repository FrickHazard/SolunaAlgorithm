import {
    MeshStandardMaterial,
    Group,
    Font,
    Vector2,
    TextureLoader,
    Color,
    CylinderGeometry,
    TextGeometry,
    MirroredRepeatWrapping,
} from 'three';
import { Piece } from './visuals/piece';
import helevetikerFont from './assets/helvetiker_bold.typeface.json';

import basecolor from './assets/Wood037_2K-JPG/Wood037_2K_Color.jpg';
import normal from './assets/Wood037_2K-JPG/Wood037_2K_Normal.jpg'
import aoRoughnessMetal from "./assets/Wood037_2K-JPG/combined.jpg";

import { SelectionPiece } from './visuals/selectionPiece';
import GameState from './GameState';
import SelectionSystem from './SelectionSystem';


const textureLoader = new TextureLoader();
const basecolorMap = textureLoader.load(basecolor);
const normalMap = textureLoader.load(normal);
const aoRoughnessMetalMap = textureLoader.load(aoRoughnessMetal);

const rep = 0.333;
const basecolorMapSide = textureLoader.load(basecolor);
basecolorMapSide.wrapS = MirroredRepeatWrapping;
basecolorMapSide.wrapT = MirroredRepeatWrapping;
basecolorMapSide.anisotropy = 8
basecolorMapSide.repeat.set(rep, rep);
const normalMapSide = textureLoader.load(normal);
normalMapSide.wrapS = MirroredRepeatWrapping;
normalMapSide.wrapT = MirroredRepeatWrapping;
normalMapSide.anisotropy = 8
normalMapSide.repeat.set(rep, rep);
const aoRoughnessMetalMapSide = textureLoader.load(aoRoughnessMetal);
aoRoughnessMetalMapSide.wrapS = MirroredRepeatWrapping;
aoRoughnessMetalMapSide.wrapT = MirroredRepeatWrapping;
aoRoughnessMetalMapSide.anisotropy = 8
aoRoughnessMetalMapSide.repeat.set(rep, rep);

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
            } else if (move) {
                let color = 0x00ff00
                if (GameState.getDisplayMistakes() && move.mistake) {
                    color = 0xffaa00
                }
                const selectedPieceVisual = new SelectionPiece(new Color(color));
                selectedPieceVisual.setFromPiece(pieceVisual);
                this.group.add(selectedPieceVisual);
                this.ignoreSubscriptions.push(SelectionSystem.subscribeToIgnore(selectedPieceVisual.children[0]));
                this.ignoreSubscriptions.push(SelectionSystem.subscribeToIgnore(selectedPieceVisual.children[1]));
            } else {

            }
        }
    }
}

const getSubsForPieceVisual = (pieceVisual) => {
    const result = []
    result.push(SelectionSystem.subscribeToSelect(pieceVisual,
        () => GameState.selectPiece({ ...pieceVisual.userData })))
    pieceVisual.children.forEach(x => result.push(SelectionSystem.subscribeToSelect(x,
        () => GameState.selectPiece({ ...pieceVisual.userData }))))
    return result
}

export class PieceSystem {
    constructor() {
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

        if (GameState.menu.state !== 'none' || GameState.getViewingHistoricMove()) return

        if (!selectionState) {
            for (const pieceVisual of this.pieceVisuals) {
                this.subscriptions = this.subscriptions.concat(getSubsForPieceVisual(pieceVisual))
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
                this.subscriptions = this.subscriptions.concat(getSubsForPieceVisual(pieceVisual))
            }
        }
    }

    setVisuals(gameStateObj) {
        this.subscriptions.forEach(f => f());
        this.group.children = [];
        if (!gameStateObj) return
        this.group.add(this.highlightSystem.group);


        this.labelGeometries = {};

        this.pieceMaterial = new MeshStandardMaterial({
            color: 0x5577FF,
            roughness: 1,
            metalness: 1,
            map: basecolorMap,
            aoMap: aoRoughnessMetalMap,
            roughnessMap: aoRoughnessMetalMap,
            metalnessMap: aoRoughnessMetalMap,
            normalMap: normalMap,
        });
        this.pieceSideMaterial = new MeshStandardMaterial({
            color: 0x5577FF,
            roughness: 1,
            metalness: 1,
            map: basecolorMapSide,
            aoMap: aoRoughnessMetalMapSide,
            roughnessMap: aoRoughnessMetalMapSide,
            metalnessMap: aoRoughnessMetalMapSide,
            normalMap: normalMapSide,
        });
        this.labelMaterial = new MeshStandardMaterial({
            color: 0xffffff,
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
                    pieceSideMaterial: this.pieceSideMaterial,
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
