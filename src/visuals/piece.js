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
        this.label.position.set(0,1.0,0);

        for (let i = 1; i < options.height; ++i) {
            const coveredPiece = new Mesh(options.pieceGeometry, options.pieceMaterial);
            this.attach(coveredPiece);
            coveredPiece.position.set(0, -i, 0)
        }
        this.translateY(options.height - 1);
    }

    setPostition(vec2) {
        this.position.copy(new Vector3(vec2.x, this.position.y, vec2.y));
    }
}