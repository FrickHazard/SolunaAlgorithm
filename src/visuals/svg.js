import {
    ShapeBufferGeometry,
    MeshStandardMaterial,
    DoubleSide,
    Mesh,
    Vector3,
    Group,
    Box3,
    Matrix4,
} from 'three';
import { SVGLoader } from 'three/examples/jsm/loaders/SVGLoader';

import MoonSVG from '../assets/svgs/moon.svg'
import ShootingStarSVG from '../assets/svgs/shooting-star.svg'
import SunSVG from '../assets/svgs/sun.svg'
import StarSVG from '../assets/svgs/star.svg'

const svgLoader = new SVGLoader()

const svgMeshes = {};


const material = new MeshStandardMaterial({
    color: 0xffffff,
    emissive: 0x222222,
    side: DoubleSide,
    depthWrite: false,
    roughness: 0.6,
    metalness: 1,
})


const computeGroupCenter = (() => {
    const childBox = new Box3();
    const groupBox = new Box3();
    const invMatrixWorld = new Matrix4();

    return function (group) {
        const result = new Vector3();

        group.traverse(function (child) {
            if (child instanceof Mesh) {
                if (!child.geometry.boundingBox) {
                    child.geometry.computeBoundingBox();
                    childBox.copy(child.geometry.boundingBox);
                    child.updateMatrixWorld(true);
                    childBox.applyMatrix4(child.matrixWorld);
                    groupBox.min.min(childBox.min);
                    groupBox.max.max(childBox.max);
                }
            }
        });

        groupBox.getCenter(result);
        return result;
    }
})()

const loadFunc = (key, scaleFactor, offset) => (data) => {
    const group = new Group()
    const paths = data.paths;

    for (let i = 0; i < paths.length; i++) {

        const path = paths[i];

        const shapes = path.toShapes(true, true);

        for (let j = 0; j < shapes.length; j++) {
            const shape = shapes[j];
            const geometry = new ShapeBufferGeometry(shape);
            const svgMesh = new Mesh(geometry, material);
            group.add(svgMesh)
        }
    }

    group.scale.multiplyScalar(scaleFactor);
    group.rotateX(Math.PI / 2);
    group.updateMatrixWorld()
    group.position.sub(computeGroupCenter(group))

    svgMeshes[key] = group
}
svgLoader.load(MoonSVG, loadFunc(0, 0.008))
svgLoader.load(ShootingStarSVG, loadFunc(1, 0.006))
svgLoader.load(StarSVG, loadFunc(2, 0.006))
svgLoader.load(SunSVG, loadFunc(3, 0.01))

export const getSvgMesh = (index) => svgMeshes[index] && svgMeshes[index].clone()
