const rewire = require("rewire")
const fabric = rewire("./fabric")
const resizeCanvasIfNeeded = fabric.__get__("resizeCanvasIfNeeded")
const copyGLTo2DDrawImage = fabric.__get__("copyGLTo2DDrawImage")
const copyGLTo2DPutImageData = fabric.__get__("copyGLTo2DPutImageData")
// @ponicode
describe("resizeCanvasIfNeeded", () => {
    test("0", () => {
        let callFunction = () => {
            resizeCanvasIfNeeded({ targetCanvas: "data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20version%3D%221.1%22%20baseProfile%3D%22full%22%20width%3D%22undefined%22%20height%3D%22undefined%22%3E%3Crect%20width%3D%22100%25%22%20height%3D%22100%25%22%20fill%3D%22grey%22%2F%3E%3Ctext%20x%3D%22NaN%22%20y%3D%22NaN%22%20font-size%3D%2220%22%20alignment-baseline%3D%22middle%22%20text-anchor%3D%22middle%22%20fill%3D%22white%22%3Eundefinedxundefined%3C%2Ftext%3E%3C%2Fsvg%3E", destinationWidth: 15, destinationHeight: 24 })
        }
    
        expect(callFunction).not.toThrow()
    })

    test("1", () => {
        let callFunction = () => {
            resizeCanvasIfNeeded({ targetCanvas: "data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20version%3D%221.1%22%20baseProfile%3D%22full%22%20width%3D%22undefined%22%20height%3D%22undefined%22%3E%3Crect%20width%3D%22100%25%22%20height%3D%22100%25%22%20fill%3D%22grey%22%2F%3E%3Ctext%20x%3D%22NaN%22%20y%3D%22NaN%22%20font-size%3D%2220%22%20alignment-baseline%3D%22middle%22%20text-anchor%3D%22middle%22%20fill%3D%22white%22%3Eundefinedxundefined%3C%2Ftext%3E%3C%2Fsvg%3E", destinationWidth: 1080, destinationHeight: 48 })
        }
    
        expect(callFunction).not.toThrow()
    })

    test("2", () => {
        let callFunction = () => {
            resizeCanvasIfNeeded({ targetCanvas: "data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20version%3D%221.1%22%20baseProfile%3D%22full%22%20width%3D%22undefined%22%20height%3D%22undefined%22%3E%3Crect%20width%3D%22100%25%22%20height%3D%22100%25%22%20fill%3D%22grey%22%2F%3E%3Ctext%20x%3D%22NaN%22%20y%3D%22NaN%22%20font-size%3D%2220%22%20alignment-baseline%3D%22middle%22%20text-anchor%3D%22middle%22%20fill%3D%22white%22%3Eundefinedxundefined%3C%2Ftext%3E%3C%2Fsvg%3E", destinationWidth: 150, destinationHeight: 100 })
        }
    
        expect(callFunction).not.toThrow()
    })

    test("3", () => {
        let callFunction = () => {
            resizeCanvasIfNeeded({ targetCanvas: "data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20version%3D%221.1%22%20baseProfile%3D%22full%22%20width%3D%22undefined%22%20height%3D%22undefined%22%3E%3Crect%20width%3D%22100%25%22%20height%3D%22100%25%22%20fill%3D%22grey%22%2F%3E%3Ctext%20x%3D%22NaN%22%20y%3D%22NaN%22%20font-size%3D%2220%22%20alignment-baseline%3D%22middle%22%20text-anchor%3D%22middle%22%20fill%3D%22white%22%3Eundefinedxundefined%3C%2Ftext%3E%3C%2Fsvg%3E", destinationWidth: 576, destinationHeight: 2048 })
        }
    
        expect(callFunction).not.toThrow()
    })

    test("4", () => {
        let callFunction = () => {
            resizeCanvasIfNeeded({ targetCanvas: "data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20version%3D%221.1%22%20baseProfile%3D%22full%22%20width%3D%22undefined%22%20height%3D%22undefined%22%3E%3Crect%20width%3D%22100%25%22%20height%3D%22100%25%22%20fill%3D%22grey%22%2F%3E%3Ctext%20x%3D%22NaN%22%20y%3D%22NaN%22%20font-size%3D%2220%22%20alignment-baseline%3D%22middle%22%20text-anchor%3D%22middle%22%20fill%3D%22white%22%3Eundefinedxundefined%3C%2Ftext%3E%3C%2Fsvg%3E", destinationWidth: 720, destinationHeight: 2048 })
        }
    
        expect(callFunction).not.toThrow()
    })

    test("5", () => {
        let callFunction = () => {
            resizeCanvasIfNeeded({ targetCanvas: "", destinationWidth: Infinity, destinationHeight: Infinity })
        }
    
        expect(callFunction).not.toThrow()
    })
})

// @ponicode
describe("copyGLTo2DDrawImage", () => {
    test("0", () => {
        let callFunction = () => {
            copyGLTo2DDrawImage({ canvas: { height: 5 } }, { targetCanvas: { getContext: () => false } })
        }
    
        expect(callFunction).not.toThrow()
    })

    test("1", () => {
        let callFunction = () => {
            copyGLTo2DDrawImage({ canvas: { height: 48000 } }, { targetCanvas: { getContext: () => false } })
        }
    
        expect(callFunction).not.toThrow()
    })

    test("2", () => {
        let callFunction = () => {
            copyGLTo2DDrawImage({ canvas: { height: 9 } }, { targetCanvas: { getContext: () => true } })
        }
    
        expect(callFunction).not.toThrow()
    })

    test("3", () => {
        let callFunction = () => {
            copyGLTo2DDrawImage({ canvas: { height: 390 } }, { targetCanvas: { getContext: () => false } })
        }
    
        expect(callFunction).not.toThrow()
    })

    test("4", () => {
        let callFunction = () => {
            copyGLTo2DDrawImage({ canvas: { height: 1 } }, { targetCanvas: { getContext: () => true } })
        }
    
        expect(callFunction).not.toThrow()
    })

    test("5", () => {
        let callFunction = () => {
            copyGLTo2DDrawImage(undefined, undefined)
        }
    
        expect(callFunction).not.toThrow()
    })
})

// @ponicode
describe("copyGLTo2DPutImageData", () => {
    test("0", () => {
        let callFunction = () => {
            copyGLTo2DPutImageData({ RGBA: 100, UNSIGNED_BYTE: 127, readPixels: () => 0 }, { destinationWidth: 2048, destinationHeight: 0, targetCanvas: { getContext: () => false } })
        }
    
        expect(callFunction).not.toThrow()
    })

    test("1", () => {
        let callFunction = () => {
            copyGLTo2DPutImageData({ RGBA: 1, UNSIGNED_BYTE: 161, readPixels: () => 0 }, { destinationWidth: -1, destinationHeight: 8, targetCanvas: { getContext: () => true } })
        }
    
        expect(callFunction).not.toThrow()
    })

    test("2", () => {
        let callFunction = () => {
            copyGLTo2DPutImageData({ RGBA: -100, UNSIGNED_BYTE: 159, readPixels: () => -5.48 }, { destinationWidth: 576, destinationHeight: 0.0, targetCanvas: { getContext: () => false } })
        }
    
        expect(callFunction).not.toThrow()
    })

    test("3", () => {
        let callFunction = () => {
            copyGLTo2DPutImageData({ RGBA: 0, UNSIGNED_BYTE: 159, readPixels: () => 0 }, { destinationWidth: 10, destinationHeight: 255, targetCanvas: { getContext: () => true } })
        }
    
        expect(callFunction).not.toThrow()
    })

    test("4", () => {
        let callFunction = () => {
            copyGLTo2DPutImageData({ RGBA: -5.48, UNSIGNED_BYTE: 243, readPixels: () => -5.48 }, { destinationWidth: 1.5, destinationHeight: 10, targetCanvas: { getContext: () => true } })
        }
    
        expect(callFunction).not.toThrow()
    })

    test("5", () => {
        let callFunction = () => {
            copyGLTo2DPutImageData({}, { destinationWidth: Infinity, destinationHeight: Infinity, targetCanvas: { getContext: () => false } })
        }
    
        expect(callFunction).not.toThrow()
    })
})
