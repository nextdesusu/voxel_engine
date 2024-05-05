import { Camera } from "./camera";
import { CameraUniform } from "./camera-uniform";
import { GrowableBufferF32, GrowableBufferU16 } from "./growable-buffer";
import { Program } from "./program";
import { RenderPass } from "./render-pass";
import { VoxelMesh } from "./voxel-mesh";

export class VoxelPass extends RenderPass {
    private _cameraUniform: CameraUniform;
    private _meshes: VoxelMesh[];

    private _positionAttribute: number;
    private _colorAttribute: number;

    private vao: WebGLBuffer;

    private buffers = {
        colorBuffer: new GrowableBufferF32(100),
        matrixBuffer: new GrowableBufferF32(100),
        verticesBuffer: new GrowableBufferF32(100),
        indicesBuffer: new GrowableBufferU16(100),
    }

    constructor(gl: WebGL2RenderingContext) {
        super(new Program(gl, vert, frag));
        this._meshes = [];

        this._cameraUniform = new CameraUniform(this.program.getUniformLocation("u_camera_matrix")!);

        const attributes = this.program.attributeLocator({
            'a_position': true,
            'a_color': true,
        });

        this._positionAttribute = attributes.a_position;
        this._colorAttribute = attributes.a_color;

        const vao = gl.createBuffer()!;
        this.vao = vao;
        gl.bindVertexArray(vao);



    }

    render(gl: WebGL2RenderingContext, camera: Camera): void {
        this.prepareBuffers();
        // const {
        //     colorBuffer,
        //     matrixBuffer,
        //     verticesBuffer,
        //     indicesBuffer,
        // } = this.buffers;

        this.program.use(gl);

        // rendering is here


        // finally camera
        this._cameraUniform.apply(gl, camera);
    }

    private prepareBuffers() {
        const {
            colorBuffer,
            matrixBuffer,
            verticesBuffer,
            indicesBuffer,
        } = this.buffers;

        colorBuffer.clear();
        matrixBuffer.clear();
        verticesBuffer.clear();
        indicesBuffer.clear();

        // fill buffers
        for (let i = 0; i < this._meshes.length; i++) {
            const { geometry, color, matrix } = this._meshes[i];
            const { vertices, indices } = geometry;

            colorBuffer.fillWith(color);
            matrixBuffer.fillWith(matrix);
            verticesBuffer.fillWith(vertices.buffer);
            indicesBuffer.fillWith(indices.buffer);
        }
    }
}

const vert = `#version 300 es

in mat4 u_camera_matrix;
 
in mat4 a_matrix;

in vec4 a_color;

out vec4 v_color;

void main() {
  // Multiply the position by the matrix.
  gl_Position = a_matrix * u_camera_matrix;

  v_color = a_color;
}
`;

const frag = `#version 300 es
precision highp float;

in vec4 v_color;

out vec4 outColor;

void main() {
   outColor = v_color;
}
`
