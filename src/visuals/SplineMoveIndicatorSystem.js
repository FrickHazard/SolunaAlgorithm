import { Vector3, CatmullRomCurve3, Object3D, Mesh, TubeBufferGeometry, MeshPhongMaterial, ArrowHelper } from 'three';
import GameState from '../GameState';

export default class SplineMoveIndicatorSystem extends Object3D {
    constructor() {
        super();
        GameState.historyIndex.subscribe(this.setCurve.bind(this))
    }

    setCurve() {
        this.children = []
        if (GameState.historyIndex.state === undefined) {
            return
        }
        const mistake = GameState.history.state[GameState.historyIndex.state].branchResult.guaranteedWin
            && GameState.history.state[GameState.historyIndex.state + 1].branchResult.guaranteedWin
        const moveLog = GameState.history.state[GameState.historyIndex.state + 1].moveLog
        const point1 = new Vector3(moveLog.top.pos.x, moveLog.top.number, moveLog.top.pos.y)
        const point2 = new Vector3(moveLog.bottom.pos.x, moveLog.bottom.number, moveLog.bottom.pos.y)
        const midpoint = (new Vector3()).lerpVectors(point1, point2, 0.5)
        const height = Math.max(point1.y, point2.y) + 10
        const curve = new CatmullRomCurve3([
            point1,
            midpoint.setY(height),
            point2
        ])
        const tubeGeometry = new TubeBufferGeometry(curve, 30, 0.6, 10, false);
        const material = new MeshPhongMaterial({
            color: GameState.getDisplayMistakes() && mistake ? 0xffaa00 : 0x118811,
            opacity: 0.5,
            transparent: true,
        });
        const curveObject = new Mesh(tubeGeometry, material);
        this.add(new ArrowHelper(
            point2.clone().sub(midpoint).normalize(),
            point2.clone().add(midpoint.clone().sub(point2).normalize().multiplyScalar(3.5)),
            3, 0xff00ff, 1, 1));
        this.add(curveObject)
    }
}
