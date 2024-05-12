import * as twgl from 'twgl.js';

// First step is to rewrite everything to use webgl 2

const vs = `#version 300 es

in vec4 position;
in vec3 translation; 
in vec4 color;

uniform mat4 viewProjectionMatrix;
uniform mat4 localMatrix;

out vec4 v_color;

void main() {
  vec4 localPosition = localMatrix * position + vec4(translation, 0);
  gl_Position = viewProjectionMatrix * localPosition;
  v_color = color;
}
`;

const fs = `#version 300 es

precision highp float;

in vec4 v_color;

out vec4 outColor;

void main() {
    outColor = v_color;
}
`;

/**
 * source https://stackoverflow.com/questions/38804356/webgl-instanced-rendering-setting-up-divisors
 */
export function setupExampleWebgl2() {
    const m4 = twgl.m4;
    const gl = document.querySelector("canvas")!.getContext("webgl2")!;
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
    const numCubes = 100;
    const colors: number[] = [];
    const translations = [];


    for (let cube = 0; cube < numCubes; ++cube) {
        translations.push(rp(), rp(), rp());

        // pick a random color;
        const color = [r(1), r(1), r(1), 1];

        // now pick 4 similar colors for the faces of the cube
        // that way we can tell if the colors are correctly assigned
        // to each cube's faces.
        const channel = Math.floor(r(3));  // pick a channel 0 - 2 to randomly modify
        for (let face = 0; face < 6; ++face) {
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

    const faceMatrices = [
        m4.identity(),
        m4.rotationX(Math.PI / 2),
        m4.rotationX(Math.PI / -2),
        m4.rotationY(Math.PI / 2),
        m4.rotationY(Math.PI / -2),
        m4.rotationY(Math.PI),
    ];

    const canvas = gl.canvas as HTMLCanvasElement;

    const camera = m4.create();
    const view = m4.create();
    const viewProjection = m4.create();
    const projection = m4.create();

    const radius = 30;
    const target = [0, 0, 0];
    const up = [0, 1, 0];

    const eye = [
        Math.cos(Date.now()) * radius,
        Math.sin(Date.now() * 0.3) * radius,
        Math.sin(Date.now()) * radius,
    ];

    const keysPressed = {
        left: false,
        right: false,
        up: false,
        down: false,
    };

    const keyMap = {
        KeyS: 'down',
        KeyW: 'up',
        KeyA: 'left',
        KeyD: 'right'
    } as const;

    function handleKey(code: keyof typeof keyMap, value: boolean) {
        const key = keyMap[code];
        if (!key) {
            return
        }

        keysPressed[key] = value;
    }

    document.body.addEventListener('keydown', (e) => {
        console.log('code', e.keyCode);
        handleKey(e.code as keyof typeof keyMap, true);
    });


    document.body.addEventListener('keyup', (e) => {
        handleKey(e.code as keyof typeof keyMap, false);
    });

    const v3 = twgl.v3;
    const moveVector = v3.create();
    let elev = 0;
    let ang = 0;
    let roll = 0;

    const speed = 1;
    const turnSpeed = 90;



    let prev = 0;
    function render(rawTime: number) {
        const time = rawTime * 0.001;
        const delta = time - prev;
        prev = time;

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

        gl.vertexAttribDivisor(positionLocation, 0);
        gl.vertexAttribDivisor(translationLocation, 1);
        gl.vertexAttribDivisor(colorLocation, 1);

        gl.useProgram(program);

        const fov = 60;
        const aspect = canvas.clientWidth / canvas.clientHeight;
        m4.perspective(fov * Math.PI / 180, aspect, 0.5, 100, projection);

        m4.identity(camera);
        m4.translate(camera, moveVector, camera);

        m4.rotateX(camera, degToRad(elev), camera);
        m4.rotateY(camera, degToRad(-ang), camera);
        m4.rotateZ(camera, degToRad(roll), camera);

        m4.inverse(camera, view);
        m4.multiply(projection, view, viewProjection);

        gl.uniformMatrix4fv(viewProjectionMatrixLocation, false, viewProjection);

        // 6 faces * 4 floats per color * 4 bytes per float
        const stride = 6 * 4 * 4;
        const numVertices = 6;

        for (let ndx = 0; ndx < faceMatrices.length; ndx++) {
            const faceMatrix = faceMatrices[ndx];

            const offset = ndx * 4 * 4;  // 4 floats per color * 4 floats
            gl.vertexAttribPointer(colorLocation, 4, gl.FLOAT, false, stride, offset);
            gl.uniformMatrix4fv(localMatrixLocation, false, faceMatrix);

            gl.drawArraysInstanced(gl.TRIANGLES, 0, numVertices, numCubes);
        }

        if (keysPressed.up || keysPressed.down) {
            const direction = keysPressed.up ? 1 : -1;
            moveVector[0] -= camera[8] * delta * speed * direction;
            moveVector[1] -= camera[9] * delta * speed * direction;
            moveVector[2] -= camera[10] * delta * speed * direction;
        }

        if (keysPressed.left || keysPressed.right) {
            const direction = keysPressed.left ? 1 : -1;
            ang += delta * turnSpeed * direction;
          }

        requestAnimationFrame(render);
    }

    requestAnimationFrame(render);
}

function degToRad(d: number) {
    return d * Math.PI / 180;
}