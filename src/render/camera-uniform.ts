import { mat4 } from "gl-matrix";
import { Camera } from "./camera";

export class CameraUniform {
    private _viewProjection: mat4;
    private _matrixLocation: WebGLUniformLocation;

    constructor(matrixLocation: WebGLUniformLocation) {
        this._viewProjection = mat4.create();
        this._matrixLocation = matrixLocation;
    }

    apply(gl: WebGL2RenderingContext, camera: Camera) {
        const viewProjection = camera.projectionMatrix(gl, this._viewProjection);

        // Set the matrix.
        gl.uniformMatrix4fv(this._matrixLocation, false, viewProjection);
    }
}