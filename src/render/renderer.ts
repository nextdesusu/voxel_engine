import { Camera } from "./camera";
import { RenderPass } from "./render-pass";

export class Renderer {
    private _passes: RenderPass[];
    private _camera: Camera;

    constructor(camera: Camera) {
        this._passes = [];
        this._camera = camera;
    }

    addPass(renderPass: RenderPass) {
        this._passes.push(renderPass);
    }

    render(gl: WebGL2RenderingContext) {
        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

        gl.enable(gl.CULL_FACE);
        gl.enable(gl.DEPTH_TEST);

        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        const passes = this._passes;
        for (let i = 0; i < passes.length; i++) {
            const pass = passes[i];
            pass.render(gl, this._camera);
        }
    }
}