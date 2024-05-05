
// import { Renderer, VoxelPass } from './render';
// import { Camera } from './render/camera';
import { setupExampleWebgl2 } from './render/example-webgl2';
import './style.css'

function main() {
    setupExampleWebgl2()
    // const canvas = document.querySelector("#canvas")! as HTMLCanvasElement;

    // const ctx = canvas.getContext('webgl2')!;

    // const pass = new VoxelPass(ctx);
    // const camera = new Camera();

    // const renderer = new Renderer(camera);
    // renderer.addPass(pass);

    // function run() {
    //     requestAnimationFrame(run);
    //     renderer.render(ctx);
    // }

    // run();
}

main();
