import { Camera } from "./camera";
import { CameraUniform } from "./camera-uniform";
import { Program } from "./program";
import { RenderPass } from "./render-pass";

export class VoxelPass extends RenderPass {
    private _positions: Float32Array;
    private _color: number;
    private _positionLocation: number;
    private _vao: WebGLVertexArrayObject;
    private _cameraUniform: CameraUniform;

    constructor(gl: WebGL2RenderingContext) {
        super(new Program(gl, vert, frag));
        const positions = this._positions = new Float32Array([
            -0.5, -0.5, -0.5,
            -0.5, 0.5, -0.5,
            0.5, -0.5, -0.5,
            -0.5, 0.5, -0.5,
            0.5, 0.5, -0.5,
            0.5, -0.5, -0.5,

            -0.5, -0.5, 0.5,
            0.5, -0.5, 0.5,
            -0.5, 0.5, 0.5,
            -0.5, 0.5, 0.5,
            0.5, -0.5, 0.5,
            0.5, 0.5, 0.5,

            -0.5, 0.5, -0.5,
            -0.5, 0.5, 0.5,
            0.5, 0.5, -0.5,
            -0.5, 0.5, 0.5,
            0.5, 0.5, 0.5,
            0.5, 0.5, -0.5,

            -0.5, -0.5, -0.5,
            0.5, -0.5, -0.5,
            -0.5, -0.5, 0.5,
            -0.5, -0.5, 0.5,
            0.5, -0.5, -0.5,
            0.5, -0.5, 0.5,

            -0.5, -0.5, -0.5,
            -0.5, -0.5, 0.5,
            -0.5, 0.5, -0.5,
            -0.5, -0.5, 0.5,
            -0.5, 0.5, 0.5,
            -0.5, 0.5, -0.5,

            0.5, -0.5, -0.5,
            0.5, 0.5, -0.5,
            0.5, -0.5, 0.5,
            0.5, -0.5, 0.5,
            0.5, 0.5, -0.5,
            0.5, 0.5, 0.5,
        ]);
        this._color = 0xff0000;

        const positionLocation = this._positionLocation = this._program.getAttributeLocation("a_position");

        const vao = gl.createVertexArray()!;
        gl.bindVertexArray(vao);

        this._cameraUniform = new CameraUniform(this.program.getUniformLocation("u_matrix")!);

        const positionBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);

        gl.enableVertexAttribArray(positionLocation);

        // Tell the position attribute how to get data out of positionBuffer (ARRAY_BUFFER)
        const size = 3;          // 3 components per iteration
        const type = gl.FLOAT;   // the data is 32bit floats
        const normalize = false; // don't normalize the data
        const stride = 0;        // 0 = move forward size * sizeof(type) each iteration to get the next position
        const offset = 0;        // start at the beginning of the buffer
        gl.vertexAttribPointer(positionLocation, size, type, normalize, stride, offset);

        this._vao = vao;
    }

    render(gl: WebGL2RenderingContext, camera: Camera): void {
        this.program.use(gl);
        gl.bindVertexArray(this._vao);

        this._cameraUniform.apply(gl, camera);

        // Draw the geometry.
        gl.drawArrays(gl.TRIANGLES, 0, 6 * 6);
    }
}

const vert = `#version 300 es
 
in vec4 a_position;
 
uniform mat4 u_matrix;

void main() {
  // Multiply the position by the matrix.
  gl_Position = u_matrix * a_position;
}
`;

const frag = `#version 300 es
 
precision highp float;
 
// we need to declare an output for the fragment shader
out vec4 outColor;

void main() {
   outColor = vec4(1.0, 0.0, 0.0, 1.0);
}
`
