import {
    MeshStandardMaterial,
    Group,
    Font,
    Vector2,
    TextureLoader,
    Color,
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

function isObject(obj) {
    return obj === Object(obj);
}

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
        const [selectionBlock] = params;
        if (!selectionBlock) return;

        const [, , selectedVisualUuid] = selectionBlock;

        const selectedVisual = pieceVisuals.find(x => x.uuid === selectedVisualUuid)
        const colorIndex = selectedVisual.userData.colorIndex;
        const height = selectedVisual.userData.height;

        for (const pieceVisual of pieceVisuals) {
            if (pieceVisual.uuid === selectedVisualUuid) {
                const selectedPieceVisual = new SelectionPiece(new Color(0xff00ff));
                selectedPieceVisual.setFromPiece(pieceVisual);
                this.group.add(selectedPieceVisual);
                this.ignoreSubscriptions.push(SelectionSystem.subscribeToIgnore(selectedPieceVisual.children[0]));
                this.ignoreSubscriptions.push(SelectionSystem.subscribeToIgnore(selectedPieceVisual.children[1]));
            }
            else if (pieceVisual.userData.colorIndex === colorIndex || pieceVisual.userData.height === height) {
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
        this.group = new Group();
        this.pieceVisuals = [];
        this.subscriptions = [];
        GameState.resetBoardUpdate.subscribe((st) => this.resetBoard(st));
        GameState.moveUpdate.subscribe(this.applyMove.bind(this));
        GameState.selectedPieceIndex.subscribe((st) => this.highlightSystem.setSelectionVisuals(st, this.pieceVisuals));
        GameState.selectedPieceIndex.subscribe(this.resetSubs.bind(this));
        GameState.botsTurn.subscribe(this.clearSubsOnBotTurn.bind(this))
        {
            this.piecePositions = [];
            const ratio = 50 / 4;
            for (let x = 3; x < ratio - 2; ++x) {
                for (let y = 3; y < ratio - 2; ++y) {
                    if ((x + y) % 2 == 0) continue;
                    this.piecePositions.push(new Vector2((x - (ratio / 2)) * 4 - 1, (y - (ratio / 2)) * 4 - 1));
                }
            }
            this.piecePositions.sort(() => Math.random() - 0.5);
        }
    }
    clearSubsOnBotTurn(botsTurn) {
        if (botsTurn) {
            this.subscriptions.forEach(f => f());
        } else {
            this.resetSubs([undefined, undefined])
        }
    }
    resetSubs(params) {
        const [selectionBlock] = params;

        this.subscriptions.forEach(f => f());
        this.subscriptions = [];

        if (!selectionBlock) {
            for (const pieceVisual of this.pieceVisuals) {
                this.subscriptions.push(SelectionSystem.subscribeToSelect(pieceVisual,
                    () => GameState.setSelectedPiece([pieceVisual.userData.colorIndex, pieceVisual.userData.height, pieceVisual.uuid])));
            }
            return;
        }
        const [, , selectedVisualUuid] = selectionBlock;
        const selectedVisual = this.pieceVisuals.find(x => x.uuid === selectedVisualUuid)
        const colorIndex = selectedVisual.userData.colorIndex;
        const height = selectedVisual.userData.height;

        for (const pieceVisual of this.pieceVisuals) {
            if (
                selectedVisualUuid === pieceVisual.id
                || pieceVisual.userData.colorIndex === colorIndex
                || pieceVisual.userData.height === height
            ) {
                this.subscriptions.push(SelectionSystem.subscribeToSelect(pieceVisual,
                    () => GameState.setSelectedPiece([pieceVisual.userData.colorIndex, pieceVisual.userData.height, pieceVisual.uuid])));
            }
        }
    }

    resetBoard(gameStateObj) {
        this.subscriptions.forEach(f => f());
        this.group.children = [];
        this.group.add(this.highlightSystem.group);

        this.labelMaterial = new MeshStandardMaterial({
            color: 0xff5f00,
            emissive: 0x111111
        });

        this.labelGeometries = {};
        const pieceMaterial = new MeshStandardMaterial({
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

        this.pieceVisuals = [];
        let i = 0;
        for (const key of Object.keys(gameStateObj)) {
            const colorIndex = Number(key);
            const partition = gameStateObj[key];
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
        }
    }

    applyMove([topPieceUuid, bottomPieceUuid, gameStateObj]) {
        const newPieceVisuals = [];
        let newHeight
        let topColorIndex
        if (isObject(topPieceUuid)) {
            newHeight = topPieceUuid.height
            topColorIndex = topPieceUuid.topColorIndex
        } else {
            newHeight = this.pieceVisuals.find(x => x.uuid === topPieceUuid).userData.height +
                this.pieceVisuals.find(x => x.uuid === bottomPieceUuid).userData.height;

            topColorIndex = this.pieceVisuals.find(x => x.uuid === topPieceUuid).userData.colorIndex;
        }

        let bottomPieceVisual
        if (isObject(topPieceUuid)) {
            bottomPieceVisual = this.pieceVisuals.find(x => x.userData.height === bottomPieceUuid.height && x.userData.colorIndex === bottomPieceUuid.bottomColorIndex);
        } else {
            bottomPieceVisual = this.pieceVisuals.find(x => x.uuid === bottomPieceUuid);
        }

        bottomPieceVisual.setHeight(newHeight);
        bottomPieceVisual.setLabel(this.labelGeometries[topColorIndex], this.labelMaterial);
        bottomPieceVisual.userData = { colorIndex: topColorIndex, height: newHeight };
        newPieceVisuals.push(bottomPieceVisual);

        for (const key of Object.keys(gameStateObj)) {
            let colorIndex = Number(key);
            const partition = gameStateObj[key];
            for (const partitionNumb of partition) {
                const visuals = this.pieceVisuals.filter(x =>
                    x.userData.colorIndex === colorIndex
                    && x.userData.height === partitionNumb.number).slice(0, partitionNumb.count);

                for (const pieceVisual of visuals) {
                    if (pieceVisual.uuid !== topPieceUuid && pieceVisual.uuid !== bottomPieceVisual.uuid) {
                        newPieceVisuals.push(pieceVisual);
                    }
                }
            }
        }

        this.pieceVisuals = newPieceVisuals;
        this.group.children = [];
        this.group.add(this.highlightSystem.group);
        this.pieceVisuals.forEach(x => this.group.add(x))
    }
}
