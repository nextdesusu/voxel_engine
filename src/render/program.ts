export class Program {
    private _program: WebGLProgram;
    private _gl: WebGL2RenderingContext;

    constructor(gl: WebGL2RenderingContext, vert: string, frag: string) {
        const vertShader = compileShader(gl, vert, gl.VERTEX_SHADER);
        const fragShader = compileShader(gl, frag, gl.FRAGMENT_SHADER);

        this._program = createProgram(gl, vertShader, fragShader);
        this._gl = gl;
    }

    use(gl: WebGL2RenderingContext) {
        this._gl = gl;
        gl.useProgram(this._program);
    }

    getAttributeLocation(name: string) {
        return this._gl.getAttribLocation(this._program, name);
    }

    getUniformLocation(name: string) {
        return this._gl.getUniformLocation(this._program, name);
    }

    get program() {
        return this._program;
    }
}

/**
 * Creates and compiles a shader.
 * */
function compileShader(gl: WebGL2RenderingContext, shaderSource: string, shaderType: number): WebGLShader {
    // Create the shader object
    const shader = gl.createShader(shaderType);
    if (!shader) {
        throw Error("Failed to compile shader!");
    }

    // Set the shader source code.
    gl.shaderSource(shader, shaderSource);

    // Compile the shader
    gl.compileShader(shader);

    // Check if it compiled
    const success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
    if (!success) {
        // Something went wrong during compilation; get the error
        throw ("could not compile shader:" + gl.getShaderInfoLog(shader));
    }

    return shader;
}
/**
 * Creates a program from 2 shaders.
*/
function createProgram(gl: WebGL2RenderingContext, vertexShader: WebGLShader, fragmentShader: WebGLShader): WebGLProgram {
    // create a program.
    const program = gl.createProgram();

    if (!program) {
        throw Error("program failed to link program");
    }

    // attach the shaders.
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);

    // link the program.
    gl.linkProgram(program);

    // Check if it linked.
    var success = gl.getProgramParameter(program, gl.LINK_STATUS);
    if (!success) {
        // something went wrong with the link; get the error
        throw Error("program failed to link:" + gl.getProgramInfoLog(program));
    }

    return program;
};