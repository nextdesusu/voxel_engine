import { ReadonlyVec3, mat4 } from "gl-matrix";

const cameraPosition: ReadonlyVec3 = [0, 0, 2];
const up: ReadonlyVec3 = [0, 1, 0];
const target: ReadonlyVec3 = [0, 0, 0];

type CameraOptions = {
    near: number;
    far: number;
    fov: number;
}

export class Camera {
    private _view: mat4;
    private _projection: mat4;
    private _opts: CameraOptions;

    constructor(opts: CameraOptions = {
        near: 1,
        far: 2000,
        fov: degToRad(60),
    }) {
        this._opts = opts;
        this._view = mat4.create();
        this._projection = mat4.create();
    }

    projectionMatrix(gl: WebGL2RenderingContext, out: mat4) {
        const canvas = gl.canvas as HTMLCanvasElement;
        const aspect = canvas.clientWidth / canvas.clientHeight;
        const projectionMatrix = mat4.perspective(this._projection, this._opts.fov, aspect, this._opts.near, this._opts.far);

        // Compute the camera's matrix using look at.
        const viewMatrix = mat4.lookAt(this.view, cameraPosition, target, up);

        const viewProjectionMatrix = mat4.multiply(out, projectionMatrix, viewMatrix);

        rotations.x += 0.007;
        rotations.y += 0.004;
        mat4.rotateX(out, out, rotations.x);
        mat4.rotateY(out, out, rotations.y);

        return viewProjectionMatrix;
    }

    get view() {
        return this._view;
    }

    get projection() {
        return this._projection;
    }
}

let rotations = {
    x: degToRad(0),
    y: degToRad(0),
}

const values = new Map([
    [0, 1.9485571384429932],
    [5, 1.7320507764816284],
    [10, -1.0010005235671997],
    [11, -1],
    [14, 0.0010006427764892578],
    [15, 2],
]);

function setExact(mat: mat4) {
    for (let i = 0; i < mat.length; i++) {
        mat[i] = 0;
    }
    for (const [index, value] of values.entries()) {
        mat[index] = value;
    }
}

function degToRad(d: number) {
    return d * Math.PI / 180;
}