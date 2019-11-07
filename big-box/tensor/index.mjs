import util from 'util'
import Type from '../type'
import Header from '../header'

import { __Math__, SYMBOL_FROM_ID, ARRAY_SPACER, ARRAY_REPLACER, PRECISION } from '../resources'

export default class Tensor {
    constructor({ header, data }) {
        Object.assign(this, this.header = header)
        this.data = this.type.array(data || this.size)
    }

    static intersection(a1, a2) {
        if (a1.constructor === Tensor && a2.constructor === Tensor) {
            a1 = a1.toRawFlat()
            a2 = a2.toRawFlat()
        }

        return a1.filter(function (value) { return a2.includes(value) })
    }

    static difference(a1, a2) {
        if (a1.constructor === Tensor && a2.constructor === Tensor) {
            a1 = a1.toRawFlat()
            a2 = a2.toRawFlat()
        }

        return a1.filter(function (value) { return !a2.includes(value) })
    }

    static shape(array, shape = []) {
        if (array.constructor === Tensor)
            return array.shape

        if (Type.isTypedArray(array))
            return [array.length]

        if (array.constructor !== Array)
            return shape

        return Tensor.shape(array[0], shape.concat(array.length))
    }

    static tensor({ data, type }) {
        if (data === undefined)
            return {}

        if (data.constructor === Tensor)
            return data

        const shape = Tensor.shape(data)

        if (data.constructor === String || data.constructor === Number || data.constructor === Array)
            data = [data].flat(Number.POSITIVE_INFINITY)

        type = type || Type.resolve(data[0])

        return new Tensor({ data, header: new Header({ type, shape }) })
    }

    static zerosLike({ tensor }) {
        return new Tensor({ header: new Header({ ...tensor }) })
    }

    static zeros({ shape, type } = {}) {
        if (!shape) return {}

        return new Tensor({ header: new Header({ shape, type }) })
    }

    static onesLike({ tensor }) {
        tensor = new Tensor({ header: new Header({ ...tensor }) })
        tensor.data.fill(1)

        return tensor
    }

    static ones({ shape, type }) {
        const tensor = new Tensor({ header: new Header({ shape, type }) })
        tensor.data.fill(1)

        return tensor
    }

    static arange({ start = 0, step = 1, stop, type }) {
        const tensor = new Tensor({
            header: new Header({ type, shape: [__Math__.round((stop - start) / step)] })
        })

        for (let i = start, j = 0; i < stop; i += step, j++)
            tensor.data[j] = i

        return tensor
    }

    static linspace({ start, stop, num = 50, type }) {
        const step = (stop - start) / num
        const tensor = new Tensor({ header: new Header({ type, shape: [num] }) })

        for (let i = start, j = 0; i < stop; i += step, j += tensor.type.size)
            tensor.data[j] = i

        return tensor
    }


    static rand({ shape, type }) {
        const tensor = new Tensor({ header: new Header({ shape, type }) })

        for (let i = 0; i < tensor.data.length; i++)
            tensor.data[i] = __Math__.random() - 1

        return tensor
    }

    static randrange({ low, high, shape, type }) {
        const tensor = new Tensor({ header: new Header({ shape, type }) })

        for (let i = 0; i < tensor.data.length; i++)
            tensor.data[i] = low + __Math__.floor(__Math__.random() * (high - low))

        return tensor
    }

    static eye({ shape, type }) {
        const tensor = new Tensor({ header: new Header({ shape, type }) })
        const diagonal = tensor.strides.reduce(__Math__.add)
        const numDiags = __Math__.min(...tensor.shape)

        for (let i = 0; i < numDiags * diagonal; i += diagonal)
            tensor.data[i] = 1

        return tensor
    }

    astype({ type }) {
        if (type === this.type)
            return this

        if (this.size === 1)
            return this

        const raw = this.toRaw().flat(Number.POSITIVE_INFINITY)
        const data = type.array(this.size)

        for (let i = 0, j = 0; i < raw.length; i += this.type.size, j += type.size)
            for (let offset = 0; offset < Math.min(type.size, this.type.size); offset++)
                data[j + offset] = raw[i + offset]

        return new Tensor({ header: new Header({ type, shape: this.shape }), data })
    }

    copy() { return new Tensor({ header: this.header, data: this.data.slice() }) }
    ravel() { return Tensor.tensor({ data: this.toRaw(), type: this.type }).reshape({ shape: [-1] }) }
    slice({ region }) { return new Tensor({ header: this.header.slice(region), data: this.data }) }
    T() { return new Tensor({ header: this.header.transpose(), data: this.data }) }

    reshape({ shape }) {
        if (!this.contig)
            return Tensor.tensor({ data: this.toRaw(), type: this.type }).reshape({ shape })

        return new Tensor({ header: this.header.reshape(shape), data: this.data })
    }

    toRaw(index = this.offset, depth = 0) {
        if (!this.shape.length || depth === this.shape.length)
            return this.toStringAtIndex(index)

        return [...new Array(this.shape[depth]).keys()].map(function (i) {
            return this.toRaw(i * this.strides[depth] + index, depth + 1)
        }, this)
    }

    toRawFlat() { return this.toRaw().flat(Number.POSITIVE_INFINITY) }

    valueOf() { return this.data[this.offset] }

    toStringAtIndex(index, string = '') {
        for (let i = 0; i < this.type.size; i++) {
            const sign = Math.sign(this.data[index + i]) < 0 ? '-' : '+'
            const number = Math.abs(this.data[index + i])

            if (number)
                string += `${sign}${number.toPrecision()}${SYMBOL_FROM_ID[i]}`
        }

        if (!string) return "0"
        if (string.startsWith('+')) return string.slice(1)

        return string
    }

    toString() {
        return JSON
            .stringify(this.toRaw())
            .replace(ARRAY_SPACER, ARRAY_REPLACER)
    }

    [util.inspect.custom]() { return this.toString() }
}
