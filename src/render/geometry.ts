import { GrowableBufferF32, GrowableBufferU16 } from "./growable-buffer";

/**
 * Collection of verticies that represents geometry
 */
export class Geometry {
    private _vertices: GrowableBufferF32;

    /**
     * In our case geometry always have indicies
     */
    private _indices: GrowableBufferU16;

    /**
     * potentially also going to contaien normals
     */
    private normals: any;

    constructor(vertices: GrowableBufferF32, indices: GrowableBufferU16) {
        this._vertices = vertices;
        this._indices = indices;
    }

    get vertices() {
        return this._vertices;
    }

    get indices() {
        return this._indices;
    }
}

