import { Camera } from "./camera";
import { Program } from "./program";

export class RenderPass {
    protected _program: Program;

    constructor(program: Program) {
        this._program = program;
    }

    render(gl: WebGL2RenderingContext, camera: Camera) {
        this._program.use(gl);
    }

    get program() {
        return this._program;
    }
}