type TypedArray = Float32Array | Uint16Array

export abstract class GrowableBuffer<BufferType extends TypedArray = TypedArray> {
    private _buffer: BufferType;
    private _index: number;

    constructor(sizeOrArray: number | number[]) {
        let size = 0;

        if (typeof sizeOrArray === 'number') {
            size = sizeOrArray;
        }

        if (Array.isArray(sizeOrArray)) {
            size = sizeOrArray.length
        }

        if (size <= 0) {
            throw Error('A buffer cannot have a size of zero or be less than zero!');
        }

        if (Math.floor(size) !== size) {
            throw Error('Size should be integer!');
        }

        this._buffer = this.supplyBuffer(size);
        this._index = 0;

        if (Array.isArray(sizeOrArray)) {
            this.fillFrom(sizeOrArray);
        }
    }

    get buffer(): BufferType {
        return this._buffer;
    }

    get capacity() {
        return this._buffer.length;
    }

    get length() {
        return this._index + 1;
    }

    abstract supplyBuffer(sizeOrArray: number | number[]): BufferType;

    fillFrom(src: ArrayLike<number>, startIndex = 0, endIndex = src.length - 1) {
        const len = endIndex + 1;
        for (let i = startIndex; i < len; i++) {
            if (i >= this.capacity - 1) {
                this.grow();
            }
            this._buffer[i] = src[i];
        }

        return this;
    }

    fillWith(src: ArrayLike<number>) {
        for (let i = 0; i < src.length; i++) {
            this.push(src[i]);
        }
    }

    push(item: number) {
        this.maybeGrow();
        this._buffer[this._index++] = item;
    }

    pop() {
        if (this._index === 0) {
            return undefined
        }

        this.maybeShrink();
        return this._buffer[this._index--];
    }

    clear() {
        this._index = 0;
    }

    /**
     * Writes own data to target
     */
    write(target: TypedArray, startIndex = 0) {
        const times = Math.min(target.length - startIndex, this.length);
        for (let targetIndex = startIndex, ownIndex = 0; ownIndex < times; targetIndex++, ownIndex++) {
            target[targetIndex] = this._buffer[ownIndex];
        }
    }

    private maybeShrink() {
        if (this._index < (this.capacity / 2)) {
            this.shrink();
        }
    }

    private maybeGrow() {
        if (this._index >= this.capacity) {
            this.grow();
        }
    }

    private shrink() {
        /**
         * Shrink to about 75% of previous size
         */
        this._buffer = this.supplyBuffer(this.capacity - Math.floor(this.capacity / 4));
    }

    private grow() {
        /**
         * Expand to be about 2 times larger than before
         */
        this._buffer = this.supplyBuffer(this.capacity * 2);
    }
}

export class GrowableBufferU16 extends GrowableBuffer<Uint16Array> {
    supplyBuffer(size: number): Uint16Array {
        return new Uint16Array(size);
    }
}

export class GrowableBufferF32 extends GrowableBuffer<Float32Array> {
    supplyBuffer(size: number): Float32Array {
        return new Float32Array(size);
    }
}