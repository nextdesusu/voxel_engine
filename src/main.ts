
import { Renderer, VoxelPass } from './render';
import { Camera } from './render/camera';
import './style.css'

function main() {
    const canvas = document.querySelector("#canvas")! as HTMLCanvasElement;

    const ctx = canvas.getContext('webgl2')!;

    const pass = new VoxelPass(ctx);
    const camera = new Camera();

    const renderer = new Renderer(camera);
    renderer.addPass(pass);

    function run() {
        requestAnimationFrame(run);
        renderer.render(ctx);
    }

    run();
}

main();
