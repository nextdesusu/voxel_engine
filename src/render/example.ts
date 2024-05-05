import * as twgl from 'twgl.js';

// First step is to rewrite everything to use webgl 2

const vs = `
attribute vec4 position;
attribute vec3 translation;
attribute vec4 color;

uniform mat4 viewProjectionMatrix;
uniform mat4 localMatrix;

varying vec4 v_color;

void main() {
  vec4 localPosition = localMatrix * position + vec4(translation, 0);
  gl_Position = viewProjectionMatrix * localPosition;
  v_color = color;
}
`;

const fs = `
precision mediump float;

varying vec4 v_color;

void main() {
  gl_FragColor = v_color;
}
`;

export function setupExample() {

    const m4 = twgl.m4;
    const gl = document.querySelector("canvas")!.getContext("webgl")!;
    const ext = gl.getExtension("ANGLE_instanced_arrays")!;
    if (!ext) {
        alert("need ANGLE_instanced_arrays");
    }
    const program = twgl.createProgramFromSources(gl, [vs, fs]);

    const positionLocation = gl.getAttribLocation(program, "position");
    const translationLocation = gl.getAttribLocation(program, "translation");
    const colorLocation = gl.getAttribLocation(program, "color");

    const localMatrixLocation = gl.getUniformLocation(program, "localMatrix");
    const viewProjectionMatrixLocation = gl.getUniformLocation(
        program,
        "viewProjectionMatrix");

    function r(min: number, max?: number) {
        if (max === undefined) {
            max = min;
            min = 0;
        }
        return Math.random() * (max - min) + min;
    }

    function rp() {
        return r(-20, 20);
    }

    // make translations and colors, colors are separated by face
    const numCubes = 1000;
    const colors: number[] = [];
    const translations = [];

    for (let cube = 0; cube < numCubes; ++cube) {
        translations.push(rp(), rp(), rp());

        // pick a random color;
        const color = [r(1), r(1), r(1), 1];

        // now pick 4 similar colors for the faces of the cube
        // that way we can tell if the colors are correctly assigned
        // to each cube's faces.
        var channel = r(3) | 0;  // pick a channel 0 - 2 to randomly modify
        for (var face = 0; face < 6; ++face) {
            color[channel] = r(.7, 1);
            colors.push.apply(colors, color);
        }
    }

    const buffers = twgl.createBuffersFromArrays(gl, {
        position: [  // one face
            -1, -1, -1,
            -1, 1, -1,
            1, -1, -1,
            1, -1, -1,
            -1, 1, -1,
            1, 1, -1,
        ],
        color: colors,
        translation: translations,
    });

    var faceMatrices = [
        m4.identity(),
        m4.rotationX(Math.PI / 2),
        m4.rotationX(Math.PI / -2),
        m4.rotationY(Math.PI / 2),
        m4.rotationY(Math.PI / -2),
        m4.rotationY(Math.PI),
    ];

    const canvas = gl.canvas as HTMLCanvasElement;

    function render(time: number) {
        time *= 0.001;

        twgl.resizeCanvasToDisplaySize(canvas);
        gl.viewport(0, 0, canvas.width, canvas.height);

        gl.enable(gl.DEPTH_TEST);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        gl.bindBuffer(gl.ARRAY_BUFFER, buffers.position);
        gl.enableVertexAttribArray(positionLocation);
        gl.vertexAttribPointer(positionLocation, 3, gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ARRAY_BUFFER, buffers.translation);
        gl.enableVertexAttribArray(translationLocation);
        gl.vertexAttribPointer(translationLocation, 3, gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ARRAY_BUFFER, buffers.color);
        gl.enableVertexAttribArray(colorLocation);

        ext.vertexAttribDivisorANGLE(positionLocation, 0);
        ext.vertexAttribDivisorANGLE(translationLocation, 1);
        ext.vertexAttribDivisorANGLE(colorLocation, 1);

        gl.useProgram(program);

        const fov = 60;
        const aspect = canvas.clientWidth / canvas.clientHeight;
        const projection = m4.perspective(fov * Math.PI / 180, aspect, 0.5, 100);

        const radius = 30;
        const eye = [
            Math.cos(time) * radius,
            Math.sin(time * 0.3) * radius,
            Math.sin(time) * radius,
        ];
        const target = [0, 0, 0];
        const up = [0, 1, 0];

        const camera = m4.lookAt(eye, target, up);
        const view = m4.inverse(camera);
        const viewProjection = m4.multiply(projection, view);

        gl.uniformMatrix4fv(viewProjectionMatrixLocation, false, viewProjection);

        // 6 faces * 4 floats per color * 4 bytes per float
        const stride = 6 * 4 * 4;
        const numVertices = 6;
        faceMatrices.forEach(function (faceMatrix, ndx) {
            const offset = ndx * 4 * 4;  // 4 floats per color * 4 floats
            gl.vertexAttribPointer(
                colorLocation, 4, gl.FLOAT, false, stride, offset);
            gl.uniformMatrix4fv(localMatrixLocation, false, faceMatrix);
            ext.drawArraysInstancedANGLE(gl.TRIANGLES, 0, numVertices, numCubes);
        });

        requestAnimationFrame(render);
    }
    requestAnimationFrame(render);
}