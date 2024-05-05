import { vec3 } from "gl-matrix";
import { GrowableBufferF32, GrowableBufferU16 } from "./growable-buffer";
import { Geometry } from "./geometry";

export function buildBoxGeometry(
    width: number,
    height: number,
    depth: number,
) {
    const state = BoxGeometriesState.common.reuse();

    const depthSegments = 1;
    const heightSegments = 1;
    const widthSegments = 1;

    buildPlane(state, 'z', 'y', 'x', - 1, - 1, depth, height, width, depthSegments, heightSegments); // px
    buildPlane(state, 'z', 'y', 'x', 1, - 1, depth, height, - width, depthSegments, heightSegments); // nx
    buildPlane(state, 'x', 'z', 'y', 1, 1, width, depth, height, widthSegments, depthSegments); // py
    buildPlane(state, 'x', 'z', 'y', 1, - 1, width, depth, - height, widthSegments, depthSegments); // ny
    buildPlane(state, 'x', 'y', 'z', 1, - 1, width, height, depth, widthSegments, heightSegments); // pz
    buildPlane(state, 'x', 'y', 'z', - 1, - 1, width, height, - depth, widthSegments, heightSegments); // nz

    return new Geometry(new GrowableBufferF32(state.vertices), new GrowableBufferU16(state.indices));
}

function buildPlane(
    state: BoxGeometriesState,
    u: UVW,
    v: UVW,
    w: UVW,
    udir: number,
    vdir: number,
    width: number,
    height: number,
    depth: number,
    gridX: number,
    gridY: number,
) {
    vec3.set(vector, 0, 0, 0);

    const mU = mapUVWToIndex(u);
    const mV = mapUVWToIndex(v);
    const mW = mapUVWToIndex(w);

    const segmentWidth = width / gridX;
    const segmentHeight = height / gridY;

    const widthHalf = width / 2;
    const heightHalf = height / 2;
    const depthHalf = depth / 2;

    const gridX1 = gridX + 1;
    const gridY1 = gridY + 1;

    let vertexCounter = 0;
    let groupCount = 0;

    // generate vertices, normals and uvs

    for (let iy = 0; iy < gridY1; iy++) {

        const y = iy * segmentHeight - heightHalf;

        for (let ix = 0; ix < gridX1; ix++) {

            const x = ix * segmentWidth - widthHalf;

            // set values to correct vector component

            vector[mU] = x * udir;
            vector[mV] = y * vdir;
            vector[mW] = depthHalf;

            // now apply vector to vertex buffer

            state.vertices.push(vector[0], vector[1], vector[2]);

            // set values to correct vector component

            vector[mU] = 0;
            vector[mV] = 0;
            vector[mW] = depth > 0 ? 1 : - 1;

            // now apply vector to normal buffer

            state.normals.push(vector[0], vector[1], vector[2]);

            // uvs

            state.uvs.push(ix / gridX);
            state.uvs.push(1 - (iy / gridY));

            // counters

            vertexCounter += 1;

        }

    }

    // indices

    // 1. you need three indices to draw a single face
    // 2. a single segment consists of two faces
    // 3. so we need to generate six (2*3) indices per segment

    for (let iy = 0; iy < gridY; iy++) {

        for (let ix = 0; ix < gridX; ix++) {

            const a = state.numberOfVertices + ix + gridX1 * iy;
            const b = state.numberOfVertices + ix + gridX1 * (iy + 1);
            const c = state.numberOfVertices + (ix + 1) + gridX1 * (iy + 1);
            const d = state.numberOfVertices + (ix + 1) + gridX1 * iy;

            // faces

            state.indices.push(a, b, d);
            state.indices.push(b, c, d);

            // increase counter

            groupCount += 6;

        }

    }

    // calculate new start value for groups

    state.groupStart += groupCount;

    // update total number of vertices

    state.numberOfVertices += vertexCounter;
}

type UVW = 'x' | 'y' | 'z';

const vector = vec3.create();

function mapUVWToIndex(arg: UVW) {
    switch (arg) {
        case 'x':
            return 0;
        case 'y':
            return 1;
        default:
            return 2;
    }
}

class BoxGeometriesState {
    numberOfVertices = 0;
    groupStart = 0;

    vertices: number[] = [];
    indices: number[] = [];
    normals: number[] = [];
    uvs: number[] = [];

    static common = new BoxGeometriesState();

    reuse() {
        this.numberOfVertices = 0;
        this.groupStart = 0;

        this.vertices.length = 0;
        this.indices.length = 0;
        this.normals.length = 0;
        this.uvs.length = 0;
        return this;
    }
}