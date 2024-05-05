import { GrowableBuffer, GrowableBufferF32, GrowableBufferU16 } from "./growable-buffer";

type AllowedTarget = WebGL2RenderingContext['ARRAY_BUFFER'] | WebGL2RenderingContext['ELEMENT_ARRAY_BUFFER'];

type AllowedUsage = WebGL2RenderingContext['STATIC_DRAW'] | WebGL2RenderingContext['DYNAMIC_DRAW'];

export class GLBuffer<BufferType extends GrowableBuffer = GrowableBuffer> {
    protected _gl: WebGL2RenderingContext;
    protected _glBuffer: WebGLBuffer;
    protected _buffer: BufferType;
    protected _target: AllowedTarget;
    protected _usage: AllowedUsage;
    constructor(
        gl: WebGL2RenderingContext,
        buffer: BufferType,
        target: AllowedTarget,
        usage: AllowedUsage,
    ) {
        this._gl = gl;
        this._buffer = buffer;
        this._target = target;
        this._usage = usage;

        this._glBuffer = gl.createBuffer()!;
    }

    use() {
        const gl = this._gl;
        gl.bindBuffer(this._target, this._glBuffer);
        gl.bufferData(this._target, this._buffer.buffer, this._usage);
    }
}

export class VerticesBuffer extends GLBuffer<GrowableBufferF32> {
    private vertexAttributeLocation: number;
    constructor(gl: WebGL2RenderingContext, buffer: GrowableBufferF32, vertexAttributeLocation: number) {
        super(gl, buffer, gl.ARRAY_BUFFER, gl.DYNAMIC_DRAW);
        this.vertexAttributeLocation = vertexAttributeLocation;
        gl.vertexAttribPointer(vertexAttributeLocation, 2, gl.FLOAT, true, 0, 0);
    }

    use(): void {
        super.use();
        this._gl.enableVertexAttribArray(this.vertexAttributeLocation);
    }
}

export class IndicesBuffer extends GLBuffer<GrowableBufferU16> {
    
}