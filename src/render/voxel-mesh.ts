import { mat4, vec3, vec4 } from "gl-matrix";
import { buildBoxGeometry } from "./box";
import { Geometry } from "./geometry";

/**
 * Instance of this class is a block that consists of multiple voxels
 */
export class VoxelMesh {
    private _grid: VoxelGrid;
    private _matrix: mat4;
    private _color: vec4;
    private _geometry: Geometry;

    constructor() {
        this._grid = new VoxelGrid();
        this._matrix = mat4.create();

        this._geometry = buildBoxGeometry(1, 1, 1);
        // Random color really
        this._color = vec4.set(vec4.create(), Math.random(), Math.random(), Math.random(), Math.random());
    }

    get matrix() {
        return this._matrix;
    }

    get geometry() {
        return this._geometry;
    }

    get color() {
        return this._color;
    }
}

/**
 * @classdesc
 * It is essentially a 32by32by32 array of bits it is
 * used by the mesher alghorithms to minimize amount
 * of rendering work done by the gpu
 */
class VoxelGrid {
    private grid: Uint32Array;
    constructor() {
        const size = 32 * 32;
        this.grid = new Uint32Array(size);
    }

}
