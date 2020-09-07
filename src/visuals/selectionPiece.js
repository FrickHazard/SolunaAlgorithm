import {
    Object3D,
    Mesh,
    ShaderMaterial,
    Color, 
    BackSide,
    ReplaceStencilOp,
    DoubleSide,
    NotEqualStencilFunc,
    KeepStencilOp,
    Uniform,
    Vector2,
} from "three";

export class SelectionPiece extends Object3D {

    constructor(color) {
        super();

        this.writeMat = new ShaderMaterial({         
            side: DoubleSide,
            depthTest: false,
            colorWrite: false,
            depthWrite: false,
            stencilWrite: true,

            stencilZPass: ReplaceStencilOp,
            stencilRef : 0x01, 
           
            vertexShader:
                "void main() {"+   
                "vec4 modelViewPosition = modelViewMatrix * vec4(position, 1.0);" +
                "gl_Position = projectionMatrix * modelViewPosition;" +
                "}",

            fragmentShader: "void main() {" +
                "gl_FragColor = vec4(0.0, 1.0, 0.0, 1.0);"+
                "}"
        });

        this.readMat = new ShaderMaterial({          
            uniforms: {
                color: new Uniform(color),
                // this in pixels
                outlineWidth : new Uniform(4),
                // TODO on update
                resolution: new Uniform( new Vector2(window.innerWidth, window.innerHeight) )
            },
            side: BackSide,
            depthTest: false,
            depthWrite: true,
            stencilWrite: true,

            stencilFunc: NotEqualStencilFunc,
            stencilRef: 0x01,
            stencilZPass: KeepStencilOp,
            stencilFail: KeepStencilOp,

            vertexShader:
                "uniform vec2 resolution;"+
                "uniform float outlineWidth;"+
                "void main() {"+   
                "vec3 clipNormal = mat3(projectionMatrix * viewMatrix) * (mat3(modelMatrix) * normal);" +
                "vec4 clipPosition = projectionMatrix * modelViewMatrix * vec4(position, 1.0);"  +
                "vec2 offset = normalize(clipNormal.xy) / resolution * outlineWidth * ((clipPosition.w +1.) /2.)* 2.;" +
                 
                "clipPosition.xy += offset;" +
                // "clipPosition.w += length(offset);"+
                "gl_Position = clipPosition;"+
                // "gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);"+
                "}",

            fragmentShader: "uniform vec3 color;" +
                "void main() {" +
                "gl_FragColor = vec4(color, 1.0);"+
                "}"
        });
    }

    setFromPiece (piece) {
        // TODO this stuff is more or less hardcoded
        this.children = [];
        {
            const writeStencil = new Mesh(piece.geometry,  this.writeMat);
            writeStencil.scale.copy(piece.scale);
            writeStencil.quaternion.copy(piece.quaternion);
            writeStencil.position.copy(piece.position);
            //  writeStencil.scale.multiplyScalar(0.0001)
            writeStencil.renderOrder = 1;

            const writeStencilLabel = new Mesh(piece.label.geometry,  this.writeMat);
            writeStencil.attach(writeStencilLabel);
            writeStencilLabel.scale.copy(piece.label.scale);
            writeStencilLabel.quaternion.copy(piece.label.quaternion);
            writeStencilLabel.position.copy(piece.label.position);
            writeStencilLabel.renderOrder = 1;
            
            this.attach(writeStencil);
        }
        {
            const readStencil = new Mesh(piece.geometry,  this.readMat);
            readStencil.scale.copy(piece.scale);
            readStencil.quaternion.copy(piece.quaternion);
            readStencil.position.copy(piece.position);
            readStencil.renderOrder = 2;

            const readStencilLabel = new Mesh(piece.label.geometry,  this.readMat);
            readStencil.attach(readStencilLabel);
            readStencilLabel.scale.copy(piece.label.scale);
            readStencilLabel.quaternion.copy(piece.label.quaternion);
            readStencilLabel.position.copy(piece.label.position );
            readStencilLabel.renderOrder = 2;

            this.attach(readStencil);
        }   
    }
};