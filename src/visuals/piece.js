import {
    Mesh,
    Vector3
} from 'three';

export class Piece extends Mesh {
    constructor(options) {
        super(options.pieceGeometry, options.pieceMaterial);

        this.setLabel(options.labelGeometry, options.labelMaterial);

        this.setHeight(options.height);
    }
    
    setHeight(height) {
        this.position.setY(0);
        this.children = this.children.filter(x => x === this.label);
        for (let i = 1; i < height; ++i) {
            const coveredPiece = new Mesh(this.geometry, this.material);
            this.attach(coveredPiece);
            coveredPiece.position.set(0, -i, 0)
        }
        this.translateY(height - 1);
    }

    setLabel(labelGeometry, labelMaterial) {
        if (this.label) this.remove(this.label);
        this.label = new Mesh(
            labelGeometry,
            labelMaterial
        );

        this.label.rotateX(-Math.PI /2);
        this.attach(this.label);
        this.label.position.set(0,1.0,0);
    }

    setPostition(vec2) {
        this.position.copy(new Vector3(vec2.x, this.position.y, vec2.y));
    }
}