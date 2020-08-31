import {
    Mesh,
    Vector3
} from 'three';

export class Piece extends Mesh {
    constructor(options) {
        super(options.pieceGeometry, options.pieceMaterial);

        this.label = new Mesh(
            options.labelGeometry,
            options.labelMaterial
        );

        this.label.rotateX(-Math.PI /2);
        this.attach(this.label);
        this.label.position.set(0,1,0);
    }

    setPostition(vec2, height) {
        this.position.copy(new Vector3(vec2.x, height, vec2.y));
    }
}