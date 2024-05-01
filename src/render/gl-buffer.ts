export class GLBuffer {
    private _buffer: Float32Array;

    constructor(size: number) {
        this._buffer = new Float32Array(size);
    }
}