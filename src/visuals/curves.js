import { Vector3, CatmullRomCurve3, Object3D, Mesh, TubeBufferGeometry, MeshPhongMaterial, } from 'three';

export class CurveSystem extends Object3D {
    constructor() {
        super();
    }

    addCurve(point1, point2) {
        const midpoint = (new Vector3()).lerpVectors(point1, point2, 0.5)
        const height = Math.max(point1.y, point2.y) + 10
        const curve = new CatmullRomCurve3([
            point1,
            midpoint.setY(height),
            point2
        ])
        const tubeGeometry = new TubeBufferGeometry(curve, 30, 0.6, 10, false);
        const material = new MeshPhongMaterial({
            color: 0x118811, opacity: 0.5,
            transparent: true,
        });
        const curveObject = new Mesh(tubeGeometry, material);
        this.add(curveObject)
        setTimeout(() => { this.remove(curveObject) }, 5000)
    }
}
