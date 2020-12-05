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
        const midpoint1 = (new Vector3()).lerpVectors(point1, point2, 0.3333)
        const midpoint2 = (new Vector3()).lerpVectors(point1, point2, 0.6666)
        const dir = point2.clone().sub(point1).normalize()
        const crossUp = dir.clone().cross(new Vector3(0, 1, 0))
        const lineUp = crossUp.clone().cross(dir)

        // {
        //     this.add(new ArrowHelper(
        //         lineUp,
        //         midpoint1,
        //         3, 0xff00ff, 1, 1));
        //     this.add(new ArrowHelper(
        //         lineUp,
        //         midpoint2,
        //         3, 0xff00ff, 1, 1));
        // }

        //const midpoint = (new Vector3()).lerpVectors(point1, point2, 0.5)
        // const height = Math.max(point1.y, point2.y) + 10
        const curve = new CatmullRomCurve3([
            point1,
            midpoint1.add(lineUp.clone().multiplyScalar(3)),
            midpoint2.add(lineUp.clone().multiplyScalar(3)),
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
            point2.clone().sub(midpoint2).normalize(),
            point2.clone().add(midpoint2.clone().sub(point2).normalize().multiplyScalar(3.5)),
            3, 0xff00ff, 1, 1));
        this.add(curveObject)
    }
}
