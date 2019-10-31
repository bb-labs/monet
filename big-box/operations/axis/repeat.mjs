import bb from '../../tensor'
import Cache from '../../cache'
import Algebra from '../algebra'
import ElementOperation from './operation'
import { difference, loop, index } from '../utils'

export default class Repeat {
    constructor(A, B, R, { axes, count }) {
        /** Axes */
        this.axes = {}
        this.axes.inner = axes || []
        this.axes.total = [...A.shape.keys()]
        this.axes.outer = difference(this.axes.total, this.axes.inner)

        /** Repeat count */
        this.count = count || 1

        /** Tensors */
        this.tensors = {}

        this.tensors.A = A
        this.tensors.A.name = 'A'
        this.tensors.A.index = 'AIndex'

        this.tensors.R = R || this.resultant()
        this.tensors.R.name = 'R'
        this.tensors.R.index = 'RIndex'

        /** Loops */
        this.loops = {}
        this.loops.outer = loop(this.axes.outer, this.tensors.A.shape)
        this.loops.inner = loop(this.axes.inner, this.tensors.A.shape)

        /** Indices */
        this.indices = {}
        this.indices.A = index(this.axes.total, this.tensors.A)

        /** Source */
        this.source = [
            ...this.loops.outer,
            ...this.loops.inner,

            this.indices.A,
            'console.log(AIndex)',

            '}'.repeat(this.loops.inner.length),
            '}'.repeat(this.loops.outer.length),
        ].join('\n')

        this.operation = new Function('A,B,R,args', this.source)
    }

    static get() { return null }

    static set(A, B, R, meta) {
        const repeat = new Repeat(A, B, R, meta)

        return repeat.operation.bind(
            null,
            repeat.tensors.A,
            repeat.tensors.B,
            repeat.tensors.R)
    }

    resultant() {
        if (!this.axes.length)
            return bb.zeros({
                type: this.tensors.A.type,
                shape: [this.tensors.A.size * this.count]
            })

        return bb.zeros({
            type: this.tensors.A.type,
            shape: this.tensors.A.shape.map(function (value, axis) {
                return axis === this.axes.inner[0] ? this.count * value : value
            }, this)
        })
    }

}
