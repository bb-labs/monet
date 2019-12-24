
export default {
    UP: [[[0]], [[1]], [[0]], [[1]]],
    TO: [[[0]], [[0]], [[0]], [[1]]],
    FROM: [[[0]], [[0]], [[3]], [[1]]],

    LOOK_MATRIX: [[[1], [0], [0], [0]], [[0], [1], [0], [0]], [[0], [0], [1], [0]], [[0], [0], [0], [1]]],
    VIEW_MATRIX: [[[1], [0], [0], [0]], [[0], [1], [0], [0]], [[0], [0], [1], [0]], [[0], [0], [0], [1]]],
    MOVE_MATRIX: [[[1], [0], [0], [0]], [[0], [1], [0], [0]], [[0], [0], [1], [0]], [[0], [0], [0], [1]]],
    PROJ_MATRIX: [[[0], [0], [0], [0]], [[0], [0], [0], [0]], [[0], [0], [0], [0]], [[0], [0], [0], [0]]],

    VIEWING_ANGLE: 30,
    ASPECT_RATIO: 1,
    NEAR: 1e-6,
    FAR: 1e6,

    ZOOM_DELTA: 0.02,

    SPACE: / +/g,
    NUMBER: /\d+/,
    PRECISION: 2,
    SLICE_CHARACTER: ':',
    PARTIAL_SLICE: /\d*:\d*:*\d*/,
    ARRAY_REPLACER: '],\n$1[',
    ARRAY_SPACER: /\]\,(\s*)\[/g,
    PARSE_NUMBER: /\d+\.?\d*e[+-]?\d+|\d+\.?\d*|\.\d+|./g,

    BINDINGS: {},

    SYMBOL_FROM_ID: {
        0: '',
        1: 'i',
        2: 'j',
        3: 'k'
    },
}
