import { Vector3, CatmullRomCurve3, Object3D, LineBasicMaterial, BufferGeometry, Line } from 'three';

export class CurveSystem extends Object3D {
    constructor() {
        super();
    }

    addCurve(point1, point2) {
        const midpoint = (new Vector3()).lerpVectors(point1, point2)
        const height = Math.max(point1.y, point2.y) + 10
        const curve = new CatmullRomCurve3([
            point1,
            midpoint.setY(height),
            point2
        ])

        const points = curve.getPoints(50);
        const geometry = new BufferGeometry().setFromPoints(points);
        const material = new LineBasicMaterial({ color: 0x118811 });
        const curveObject = new Line(geometry, material);
        this.add(curveObject)
        setTimeout(() => { this.remove(curveObject) }, 5000)
    }
}
