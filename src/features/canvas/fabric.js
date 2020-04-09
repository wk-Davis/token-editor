/*! Fabric.js Copyright 2008-2015, Printio (Juriy Zaytsev, Maxim Chernyak) */

let define;
// eslint-disable-next-line
var fabric = fabric || { version: '3.6.3' };
if (typeof exports !== 'undefined') {
  exports.fabric = fabric;
} else if (typeof define === 'function' && define.amd) {
  /* _AMD_START_ */
  define([], function () {
    return fabric;
  });
}
/* _AMD_END_ */
if (typeof document !== 'undefined' && typeof window !== 'undefined') {
  if (
    document instanceof
    (typeof HTMLDocument !== 'undefined' ? HTMLDocument : Document)
  ) {
    fabric.document = document;
  } else {
    fabric.document = document.implementation.createHTMLDocument('');
  }
  fabric.window = window;
} else {
  // assume we're running under node.js when document/window are not present
  var jsdom = require('jsdom');
  var virtualWindow = new jsdom.JSDOM(
    decodeURIComponent(
      '%3C!DOCTYPE%20html%3E%3Chtml%3E%3Chead%3E%3C%2Fhead%3E%3Cbody%3E%3C%2Fbody%3E%3C%2Fhtml%3E'
    ),
    {
      features: {
        FetchExternalResources: ['img'],
      },
      resources: 'usable',
    }
  ).window;
  fabric.document = virtualWindow.document;
  fabric.jsdomImplForWrapper = require('jsdom/lib/jsdom/living/generated/utils').implForWrapper;
  fabric.nodeCanvas = require('jsdom/lib/jsdom/utils').Canvas;
  fabric.window = virtualWindow;
  // DOMParser = fabric.window.DOMParser;
}

/**
 * True when in environment that supports touch events
 * @type boolean
 */
fabric.isTouchSupported =
  'ontouchstart' in fabric.window ||
  'ontouchstart' in fabric.document ||
  (fabric.window &&
    fabric.window.navigator &&
    fabric.window.navigator.maxTouchPoints > 0);

/**
 * True when in environment that's probably Node.js
 * @type boolean
 */
fabric.isLikelyNode =
  typeof Buffer !== 'undefined' && typeof window === 'undefined';

/* _FROM_SVG_START_ */
/**
 * Attributes parsed from all SVG elements
 * @type array
 */
fabric.SHARED_ATTRIBUTES = [
  'display',
  'transform',
  'fill',
  'fill-opacity',
  'fill-rule',
  'opacity',
  'stroke',
  'stroke-dasharray',
  'stroke-linecap',
  'stroke-dashoffset',
  'stroke-linejoin',
  'stroke-miterlimit',
  'stroke-opacity',
  'stroke-width',
  'id',
  'paint-order',
  'vector-effect',
  'instantiated_by_use',
  'clip-path',
];
/* _FROM_SVG_END_ */

/**
 * Pixel per Inch as a default value set to 96. Can be changed for more realistic conversion.
 */
fabric.DPI = 96;
fabric.reNum = '(?:[-+]?(?:\\d+|\\d*\\.\\d+)(?:[eE][-+]?\\d+)?)';
fabric.rePathCommand = /([-+]?((\d+\.\d+)|((\d+)|(\.\d+)))(?:[eE][-+]?\d+)?)/gi;
fabric.reNonWord = /[ \n.,;!?-]/;
fabric.fontPaths = {};
fabric.iMatrix = [1, 0, 0, 1, 0, 0];
fabric.svgNS = 'http://www.w3.org/2000/svg';

/**
 * Pixel limit for cache canvases. 1Mpx , 4Mpx should be fine.
 * @since 1.7.14
 * @type Number
 * @default
 */
fabric.perfLimitSizeTotal = 2097152;

/**
 * Pixel limit for cache canvases width or height. IE fixes the maximum at 5000
 * @since 1.7.14
 * @type Number
 * @default
 */
fabric.maxCacheSideLimit = 4096;

/**
 * Lowest pixel limit for cache canvases, set at 256PX
 * @since 1.7.14
 * @type Number
 * @default
 */
fabric.minCacheSideLimit = 256;

/**
 * Cache Object for widths of chars in text rendering.
 */
fabric.charWidthsCache = {};

/**
 * if webgl is enabled and available, textureSize will determine the size
 * of the canvas backend
 * @since 2.0.0
 * @type Number
 * @default
 */
fabric.textureSize = 2048;

/**
 * When 'true', style information is not retained when copy/pasting text, making
 * pasted text use destination style.
 * Defaults to 'false'.
 * @type Boolean
 * @default
 */
fabric.disableStyleCopyPaste = false;

/**
 * Enable webgl for filtering picture is available
 * A filtering backend will be initialized, this will both take memory and
 * time since a default 2048x2048 canvas will be created for the gl context
 * @since 2.0.0
 * @type Boolean
 * @default
 */
fabric.enableGLFiltering = true;

/**
 * Device Pixel Ratio
 * @see https://developer.apple.com/library/safari/documentation/AudioVideo/Conceptual/HTML-canvas-guide/SettingUptheCanvas/SettingUptheCanvas.html
 */
fabric.devicePixelRatio =
  fabric.window.devicePixelRatio ||
  fabric.window.webkitDevicePixelRatio ||
  fabric.window.mozDevicePixelRatio ||
  1;
/**
 * Browser-specific constant to adjust CanvasRenderingContext2D.shadowBlur value,
 * which is unitless and not rendered equally across browsers.
 *
 * Values that work quite well (as of October 2017) are:
 * - Chrome: 1.5
 * - Edge: 1.75
 * - Firefox: 0.9
 * - Safari: 0.95
 *
 * @since 2.0.0
 * @type Number
 * @default 1
 */
fabric.browserShadowBlurConstant = 1;

/**
 * This object contains the result of arc to beizer conversion for faster retrieving if the same arc needs to be converted again.
 * It was an internal variable, is accessible since version 2.3.4
 */
fabric.arcToSegmentsCache = {};

/**
 * This object keeps the results of the boundsOfCurve calculation mapped by the joined arguments necessary to calculate it.
 * It does speed up calculation, if you parse and add always the same paths, but in case of heavy usage of freedrawing
 * you do not get any speed benefit and you get a big object in memory.
 * The object was a private variable before, while now is appended to the lib so that you have access to it and you
 * can eventually clear it.
 * It was an internal variable, is accessible since version 2.3.4
 */
fabric.boundsOfCurveCache = {};

/**
 * If disabled boundsOfCurveCache is not used. For apps that make heavy usage of pencil drawing probably disabling it is better
 * @default true
 */
fabric.cachesBoundsOfCurve = true;

/**
 * Skip performance testing of setupGLContext and force the use of putImageData that seems to be the one that works best on
 * Chrome + old hardware. if your users are experiencing empty images after filtering you may try to force this to true
 * this has to be set before instantiating the filtering backend ( before filtering the first image )
 * @type Boolean
 * @default false
 */
fabric.forceGLPutImageData = false;

fabric.initFilterBackend = function () {
  if (
    fabric.enableGLFiltering &&
    fabric.isWebglSupported &&
    fabric.isWebglSupported(fabric.textureSize)
  ) {
    console.log('max texture size: ' + fabric.maxTextureSize);
    return new fabric.WebglFilterBackend({ tileSize: fabric.textureSize });
  } else if (fabric.Canvas2dFilterBackend) {
    return new fabric.Canvas2dFilterBackend();
  }
};
(function () {
  /**
   * @private
   * @param {String} eventName
   * @param {Function} handler
   */
  function _removeEventListener(eventName, handler) {
    if (!this.__eventListeners[eventName]) {
      return;
    }
    var eventListener = this.__eventListeners[eventName];
    if (handler) {
      eventListener[eventListener.indexOf(handler)] = false;
    } else {
      fabric.util.array.fill(eventListener, false);
    }
  }

  /**
   * Observes specified event
   * @deprecated `observe` deprecated since 0.8.34 (use `on` instead)
   * @memberOf fabric.Observable
   * @alias on
   * @param {String|Object} eventName Event name (eg. 'after:render') or object with key/value pairs (eg. {'after:render': handler, 'selection:cleared': handler})
   * @param {Function} handler Function that receives a notification when an event of the specified type occurs
   * @return {Self} thisArg
   * @chainable
   */
  function observe(eventName, handler) {
    if (!this.__eventListeners) {
      this.__eventListeners = {};
    }
    // one object with key/value pairs was passed
    if (arguments.length === 1) {
      for (var prop in eventName) {
        this.on(prop, eventName[prop]);
      }
    } else {
      if (!this.__eventListeners[eventName]) {
        this.__eventListeners[eventName] = [];
      }
      this.__eventListeners[eventName].push(handler);
    }
    return this;
  }

  /**
   * Stops event observing for a particular event handler. Calling this method
   * without arguments removes all handlers for all events
   * @deprecated `stopObserving` deprecated since 0.8.34 (use `off` instead)
   * @memberOf fabric.Observable
   * @alias off
   * @param {String|Object} eventName Event name (eg. 'after:render') or object with key/value pairs (eg. {'after:render': handler, 'selection:cleared': handler})
   * @param {Function} handler Function to be deleted from EventListeners
   * @return {Self} thisArg
   * @chainable
   */
  function stopObserving(eventName, handler) {
    if (!this.__eventListeners) {
      return this;
    }

    // remove all key/value pairs (event name -> event handler)
    if (arguments.length === 0) {
      for (eventName in this.__eventListeners) {
        _removeEventListener.call(this, eventName);
      }
    }
    // one object with key/value pairs was passed
    else if (arguments.length === 1 && typeof arguments[0] === 'object') {
      for (var prop in eventName) {
        _removeEventListener.call(this, prop, eventName[prop]);
      }
    } else {
      _removeEventListener.call(this, eventName, handler);
    }
    return this;
  }

  /**
   * Fires event with an optional options object
   * @deprecated `fire` deprecated since 1.0.7 (use `trigger` instead)
   * @memberOf fabric.Observable
   * @alias trigger
   * @param {String} eventName Event name to fire
   * @param {Object} [options] Options object
   * @return {Self} thisArg
   * @chainable
   */
  function fire(eventName, options) {
    if (!this.__eventListeners) {
      return this;
    }

    var listenersForEvent = this.__eventListeners[eventName];
    if (!listenersForEvent) {
      return this;
    }

    for (var i = 0, len = listenersForEvent.length; i < len; i++) {
      listenersForEvent[i] && listenersForEvent[i].call(this, options || {});
    }
    this.__eventListeners[eventName] = listenersForEvent.filter(function (
      value
    ) {
      return value !== false;
    });
    return this;
  }

  /**
   * @namespace fabric.Observable
   * @tutorial {@link http://fabricjs.com/fabric-intro-part-2#events}
   * @see {@link http://fabricjs.com/events|Events demo}
   */
  fabric.Observable = {
    observe: observe,
    stopObserving: stopObserving,
    fire: fire,

    on: observe,
    off: stopObserving,
    trigger: fire,
  };
})();
/**
 * @namespace fabric.Collection
 */
fabric.Collection = {
  _objects: [],

  /**
   * Adds objects to collection, Canvas or Group, then renders canvas
   * (if `renderOnAddRemove` is not `false`).
   * in case of Group no changes to bounding box are made.
   * Objects should be instances of (or inherit from) fabric.Object
   * Use of this function is highly discouraged for groups.
   * you can add a bunch of objects with the add method but then you NEED
   * to run a addWithUpdate call for the Group class or position/bbox will be wrong.
   * @param {...fabric.Object} object Zero or more fabric instances
   * @return {Self} thisArg
   * @chainable
   */
  add: function () {
    this._objects.push.apply(this._objects, arguments);
    if (this._onObjectAdded) {
      for (var i = 0, length = arguments.length; i < length; i++) {
        this._onObjectAdded(arguments[i]);
      }
    }
    this.renderOnAddRemove && this.requestRenderAll();
    return this;
  },

  /**
   * Inserts an object into collection at specified index, then renders canvas (if `renderOnAddRemove` is not `false`)
   * An object should be an instance of (or inherit from) fabric.Object
   * Use of this function is highly discouraged for groups.
   * you can add a bunch of objects with the insertAt method but then you NEED
   * to run a addWithUpdate call for the Group class or position/bbox will be wrong.
   * @param {Object} object Object to insert
   * @param {Number} index Index to insert object at
   * @param {Boolean} nonSplicing When `true`, no splicing (shifting) of objects occurs
   * @return {Self} thisArg
   * @chainable
   */
  insertAt: function (object, index, nonSplicing) {
    var objects = this._objects;
    if (nonSplicing) {
      objects[index] = object;
    } else {
      objects.splice(index, 0, object);
    }
    this._onObjectAdded && this._onObjectAdded(object);
    this.renderOnAddRemove && this.requestRenderAll();
    return this;
  },

  /**
   * Removes objects from a collection, then renders canvas (if `renderOnAddRemove` is not `false`)
   * @param {...fabric.Object} object Zero or more fabric instances
   * @return {Self} thisArg
   * @chainable
   */
  remove: function () {
    var objects = this._objects,
      index,
      somethingRemoved = false;

    for (var i = 0, length = arguments.length; i < length; i++) {
      index = objects.indexOf(arguments[i]);

      // only call onObjectRemoved if an object was actually removed
      if (index !== -1) {
        somethingRemoved = true;
        objects.splice(index, 1);
        this._onObjectRemoved && this._onObjectRemoved(arguments[i]);
      }
    }

    this.renderOnAddRemove && somethingRemoved && this.requestRenderAll();
    return this;
  },

  /**
   * Executes given function for each object in this group
   * @param {Function} callback
   *                   Callback invoked with current object as first argument,
   *                   index - as second and an array of all objects - as third.
   *                   Callback is invoked in a context of Global Object (e.g. `window`)
   *                   when no `context` argument is given
   *
   * @param {Object} context Context (aka thisObject)
   * @return {Self} thisArg
   * @chainable
   */
  forEachObject: function (callback, context) {
    var objects = this.getObjects();
    for (var i = 0, len = objects.length; i < len; i++) {
      callback.call(context, objects[i], i, objects);
    }
    return this;
  },

  /**
   * Returns an array of children objects of this instance
   * Type parameter introduced in 1.3.10
   * since 2.3.5 this method return always a COPY of the array;
   * @param {String} [type] When specified, only objects of this type are returned
   * @return {Array}
   */
  getObjects: function (type) {
    if (typeof type === 'undefined') {
      return this._objects.concat();
    }
    return this._objects.filter(function (o) {
      return o.type === type;
    });
  },

  /**
   * Returns object at specified index
   * @param {Number} index
   * @return {Self} thisArg
   */
  item: function (index) {
    return this._objects[index];
  },

  /**
   * Returns true if collection contains no objects
   * @return {Boolean} true if collection is empty
   */
  isEmpty: function () {
    return this._objects.length === 0;
  },

  /**
   * Returns a size of a collection (i.e: length of an array containing its objects)
   * @return {Number} Collection size
   */
  size: function () {
    return this._objects.length;
  },

  /**
   * Returns true if collection contains an object
   * @param {Object} object Object to check against
   * @return {Boolean} `true` if collection contains an object
   */
  contains: function (object) {
    return this._objects.indexOf(object) > -1;
  },

  /**
   * Returns number representation of a collection complexity
   * @return {Number} complexity
   */
  complexity: function () {
    return this._objects.reduce(function (memo, current) {
      memo += current.complexity ? current.complexity() : 0;
      return memo;
    }, 0);
  },
};
/**
 * @namespace fabric.CommonMethods
 */
fabric.CommonMethods = {
  /**
   * Sets object's properties from options
   * @param {Object} [options] Options object
   */
  _setOptions: function (options) {
    for (var prop in options) {
      this.set(prop, options[prop]);
    }
  },

  /**
   * @private
   * @param {Object} [filler] Options object
   * @param {String} [property] property to set the Gradient to
   */
  _initGradient: function (filler, property) {
    if (filler && filler.colorStops && !(filler instanceof fabric.Gradient)) {
      this.set(property, new fabric.Gradient(filler));
    }
  },

  /**
   * @private
   * @param {Object} [filler] Options object
   * @param {String} [property] property to set the Pattern to
   * @param {Function} [callback] callback to invoke after pattern load
   */
  _initPattern: function (filler, property, callback) {
    if (filler && filler.source && !(filler instanceof fabric.Pattern)) {
      this.set(property, new fabric.Pattern(filler, callback));
    } else {
      callback && callback();
    }
  },

  /**
   * @private
   * @param {Object} [options] Options object
   */
  _initClipping: function (options) {
    if (!options.clipTo || typeof options.clipTo !== 'string') {
      return;
    }

    // var functionBody = fabric.util.getFunctionBody(options.clipTo);
    if (typeof functionBody !== 'undefined') {
      this.clipTo = function (ctx) {
        fabric.util.getFunctionBody(options.clipTo);
      };
      // this.clipTo = new Function('ctx', functionBody);
    }
  },

  /**
   * @private
   */
  _setObject: function (obj) {
    for (var prop in obj) {
      this._set(prop, obj[prop]);
    }
  },

  /**
   * Sets property to a given value. When changing position/dimension -related properties (left, top, scale, angle, etc.) `set` does not update position of object's borders/controls. If you need to update those, call `setCoords()`.
   * @param {String|Object} key Property name or object (if object, iterate over the object properties)
   * @param {Object|Function} value Property value (if function, the value is passed into it and its return value is used as a new one)
   * @return {fabric.Object} thisArg
   * @chainable
   */
  set: function (key, value) {
    if (typeof key === 'object') {
      this._setObject(key);
    } else {
      if (typeof value === 'function' && key !== 'clipTo') {
        this._set(key, value(this.get(key)));
      } else {
        this._set(key, value);
      }
    }
    return this;
  },

  _set: function (key, value) {
    this[key] = value;
  },

  /**
   * Toggles specified property from `true` to `false` or from `false` to `true`
   * @param {String} property Property to toggle
   * @return {fabric.Object} thisArg
   * @chainable
   */
  toggle: function (property) {
    var value = this.get(property);
    if (typeof value === 'boolean') {
      this.set(property, !value);
    }
    return this;
  },

  /**
   * Basic getter
   * @param {String} property Property name
   * @return {*} value of a property
   */
  get: function (property) {
    return this[property];
  },
};
(function initUtilities(global) {
  var sqrt = Math.sqrt,
    atan2 = Math.atan2,
    pow = Math.pow,
    PiBy180 = Math.PI / 180,
    PiBy2 = Math.PI / 2;

  /**
   * @namespace fabric.util
   */
  fabric.util = {
    /**
     * Calculate the cos of an angle, avoiding returning floats for known results
     * @static
     * @memberOf fabric.util
     * @param {Number} angle the angle in radians or in degree
     * @return {Number}
     */
    cos: function (angle) {
      if (angle === 0) {
        return 1;
      }
      if (angle < 0) {
        // cos(a) = cos(-a)
        angle = -angle;
      }
      var angleSlice = angle / PiBy2;
      switch (angleSlice) {
        case 1:
        case 3:
          return 0;
        case 2:
          return -1;
        default:
      }
      return Math.cos(angle);
    },

    /**
     * Calculate the sin of an angle, avoiding returning floats for known results
     * @static
     * @memberOf fabric.util
     * @param {Number} angle the angle in radians or in degree
     * @return {Number}
     */
    sin: function (angle) {
      if (angle === 0) {
        return 0;
      }
      var angleSlice = angle / PiBy2,
        sign = 1;
      if (angle < 0) {
        // sin(-a) = -sin(a)
        sign = -1;
      }
      switch (angleSlice) {
        case 1:
          return sign;
        case 2:
          return 0;
        case 3:
          return -sign;
        default:
      }
      return Math.sin(angle);
    },

    /**
     * Removes value from an array.
     * Presence of value (and its position in an array) is determined via `Array.prototype.indexOf`
     * @static
     * @memberOf fabric.util
     * @param {Array} array
     * @param {*} value
     * @return {Array} original array
     */
    removeFromArray: function (array, value) {
      var idx = array.indexOf(value);
      if (idx !== -1) {
        array.splice(idx, 1);
      }
      return array;
    },

    /**
     * Returns random number between 2 specified ones.
     * @static
     * @memberOf fabric.util
     * @param {Number} min lower limit
     * @param {Number} max upper limit
     * @return {Number} random value (between min and max)
     */
    getRandomInt: function (min, max) {
      return Math.floor(Math.random() * (max - min + 1)) + min;
    },

    /**
     * Transforms degrees to radians.
     * @static
     * @memberOf fabric.util
     * @param {Number} degrees value in degrees
     * @return {Number} value in radians
     */
    degreesToRadians: function (degrees) {
      return degrees * PiBy180;
    },

    /**
     * Transforms radians to degrees.
     * @static
     * @memberOf fabric.util
     * @param {Number} radians value in radians
     * @return {Number} value in degrees
     */
    radiansToDegrees: function (radians) {
      return radians / PiBy180;
    },

    /**
     * Rotates `point` around `origin` with `radians`
     * @static
     * @memberOf fabric.util
     * @param {fabric.Point} point The point to rotate
     * @param {fabric.Point} origin The origin of the rotation
     * @param {Number} radians The radians of the angle for the rotation
     * @return {fabric.Point} The new rotated point
     */
    rotatePoint: function (point, origin, radians) {
      point.subtractEquals(origin);
      var v = fabric.util.rotateVector(point, radians);
      return new fabric.Point(v.x, v.y).addEquals(origin);
    },

    /**
     * Rotates `vector` with `radians`
     * @static
     * @memberOf fabric.util
     * @param {Object} vector The vector to rotate (x and y)
     * @param {Number} radians The radians of the angle for the rotation
     * @return {Object} The new rotated point
     */
    rotateVector: function (vector, radians) {
      var sin = fabric.util.sin(radians),
        cos = fabric.util.cos(radians),
        rx = vector.x * cos - vector.y * sin,
        ry = vector.x * sin + vector.y * cos;
      return {
        x: rx,
        y: ry,
      };
    },

    /**
     * Apply transform t to point p
     * @static
     * @memberOf fabric.util
     * @param  {fabric.Point} p The point to transform
     * @param  {Array} t The transform
     * @param  {Boolean} [ignoreOffset] Indicates that the offset should not be applied
     * @return {fabric.Point} The transformed point
     */
    transformPoint: function (p, t, ignoreOffset) {
      if (ignoreOffset) {
        return new fabric.Point(
          t[0] * p.x + t[2] * p.y,
          t[1] * p.x + t[3] * p.y
        );
      }
      return new fabric.Point(
        t[0] * p.x + t[2] * p.y + t[4],
        t[1] * p.x + t[3] * p.y + t[5]
      );
    },

    /**
     * Returns coordinates of points's bounding rectangle (left, top, width, height)
     * @param {Array} points 4 points array
     * @param {Array} [transform] an array of 6 numbers representing a 2x3 transform matrix
     * @return {Object} Object with left, top, width, height properties
     */
    makeBoundingBoxFromPoints: function (points, transform) {
      if (transform) {
        for (var i = 0; i < points.length; i++) {
          points[i] = fabric.util.transformPoint(points[i], transform);
        }
      }
      var xPoints = [points[0].x, points[1].x, points[2].x, points[3].x],
        minX = fabric.util.array.min(xPoints),
        maxX = fabric.util.array.max(xPoints),
        width = maxX - minX,
        yPoints = [points[0].y, points[1].y, points[2].y, points[3].y],
        minY = fabric.util.array.min(yPoints),
        maxY = fabric.util.array.max(yPoints),
        height = maxY - minY;

      return {
        left: minX,
        top: minY,
        width: width,
        height: height,
      };
    },

    /**
     * Invert transformation t
     * @static
     * @memberOf fabric.util
     * @param {Array} t The transform
     * @return {Array} The inverted transform
     */
    invertTransform: function (t) {
      var a = 1 / (t[0] * t[3] - t[1] * t[2]),
        r = [a * t[3], -a * t[1], -a * t[2], a * t[0]],
        o = fabric.util.transformPoint({ x: t[4], y: t[5] }, r, true);
      r[4] = -o.x;
      r[5] = -o.y;
      return r;
    },

    /**
     * A wrapper around Number#toFixed, which contrary to native method returns number, not string.
     * @static
     * @memberOf fabric.util
     * @param {Number|String} number number to operate on
     * @param {Number} fractionDigits number of fraction digits to "leave"
     * @return {Number}
     */
    toFixed: function (number, fractionDigits) {
      return parseFloat(Number(number).toFixed(fractionDigits));
    },

    /**
     * Converts from attribute value to pixel value if applicable.
     * Returns converted pixels or original value not converted.
     * @param {Number|String} value number to operate on
     * @param {Number} fontSize
     * @return {Number|String}
     */
    parseUnit: function (value, fontSize) {
      var unit = /\D{0,2}$/.exec(value),
        number = parseFloat(value);
      if (!fontSize) {
        fontSize = fabric.Text.DEFAULT_SVG_FONT_SIZE;
      }
      switch (unit[0]) {
        case 'mm':
          return (number * fabric.DPI) / 25.4;

        case 'cm':
          return (number * fabric.DPI) / 2.54;

        case 'in':
          return number * fabric.DPI;

        case 'pt':
          return (number * fabric.DPI) / 72; // or * 4 / 3

        case 'pc':
          return ((number * fabric.DPI) / 72) * 12; // or * 16

        case 'em':
          return number * fontSize;

        default:
          return number;
      }
    },

    /**
     * Function which always returns `false`.
     * @static
     * @memberOf fabric.util
     * @return {Boolean}
     */
    falseFunction: function () {
      return false;
    },

    /**
     * Returns klass "Class" object of given namespace
     * @memberOf fabric.util
     * @param {String} type Type of object (eg. 'circle')
     * @param {String} namespace Namespace to get klass "Class" object from
     * @return {Object} klass "Class"
     */
    getKlass: function (type, namespace) {
      // capitalize first letter only
      type = fabric.util.string.camelize(
        type.charAt(0).toUpperCase() + type.slice(1)
      );
      return fabric.util.resolveNamespace(namespace)[type];
    },

    /**
     * Returns array of attributes for given svg that fabric parses
     * @memberOf fabric.util
     * @param {String} type Type of svg element (eg. 'circle')
     * @return {Array} string names of supported attributes
     */
    getSvgAttributes: function (type) {
      var attributes = ['instantiated_by_use', 'style', 'id', 'class'];
      switch (type) {
        case 'linearGradient':
          attributes = attributes.concat([
            'x1',
            'y1',
            'x2',
            'y2',
            'gradientUnits',
            'gradientTransform',
          ]);
          break;
        case 'radialGradient':
          attributes = attributes.concat([
            'gradientUnits',
            'gradientTransform',
            'cx',
            'cy',
            'r',
            'fx',
            'fy',
            'fr',
          ]);
          break;
        case 'stop':
          attributes = attributes.concat([
            'offset',
            'stop-color',
            'stop-opacity',
          ]);
          break;
        default:
          break;
      }
      return attributes;
    },

    /**
     * Returns object of given namespace
     * @memberOf fabric.util
     * @param {String} namespace Namespace string e.g. 'fabric.Image.filter' or 'fabric'
     * @return {Object} Object for given namespace (default fabric)
     */
    resolveNamespace: function (namespace) {
      if (!namespace) {
        return fabric;
      }

      var parts = namespace.split('.'),
        len = parts.length,
        i,
        obj = global || fabric.window;

      for (i = 0; i < len; ++i) {
        obj = obj[parts[i]];
      }

      return obj;
    },

    /**
     * Loads image element from given url and passes it to a callback
     * @memberOf fabric.util
     * @param {String} url URL representing an image
     * @param {Function} callback Callback; invoked with loaded image
     * @param {*} [context] Context to invoke callback in
     * @param {Object} [crossOrigin] crossOrigin value to set image element to
     */
    loadImage: function (url, callback, context, crossOrigin) {
      if (!url) {
        callback && callback.call(context, url);
        return;
      }

      var img = fabric.util.createImage();

      /** @ignore */
      var onLoadCallback = function () {
        callback && callback.call(context, img);
        img = img.onload = img.onerror = null;
      };

      img.onload = onLoadCallback;
      /** @ignore */
      img.onerror = function () {
        fabric.log('Error loading ' + img.src);
        callback && callback.call(context, null, true);
        img = img.onload = img.onerror = null;
      };

      // data-urls appear to be buggy with crossOrigin
      // https://github.com/kangax/fabric.js/commit/d0abb90f1cd5c5ef9d2a94d3fb21a22330da3e0a#commitcomment-4513767
      // see https://code.google.com/p/chromium/issues/detail?id=315152
      //     https://bugzilla.mozilla.org/show_bug.cgi?id=935069
      if (url.indexOf('data') !== 0 && crossOrigin) {
        img.crossOrigin = crossOrigin;
      }

      // IE10 / IE11-Fix: SVG contents from data: URI
      // will only be available if the IMG is present
      // in the DOM (and visible)
      if (url.substring(0, 14) === 'data:image/svg') {
        img.onload = null;
        fabric.util.loadImageInDom(img, onLoadCallback);
      }

      img.src = url;
    },

    /**
     * Attaches SVG image with data: URL to the dom
     * @memberOf fabric.util
     * @param {Object} img Image object with data:image/svg src
     * @param {Function} callback Callback; invoked with loaded image
     * @return {Object} DOM element (div containing the SVG image)
     */
    loadImageInDom: function (img, onLoadCallback) {
      var div = fabric.document.createElement('div');
      div.style.width = div.style.height = '1px';
      div.style.left = div.style.top = '-100%';
      div.style.position = 'absolute';
      div.appendChild(img);
      fabric.document.querySelector('body').appendChild(div);
      /**
       * Wrap in function to:
       *   1. Call existing callback
       *   2. Cleanup DOM
       */
      img.onload = function () {
        onLoadCallback();
        div.parentNode.removeChild(div);
        div = null;
      };
    },

    /**
     * Creates corresponding fabric instances from their object representations
     * @static
     * @memberOf fabric.util
     * @param {Array} objects Objects to enliven
     * @param {Function} callback Callback to invoke when all objects are created
     * @param {String} namespace Namespace to get klass "Class" object from
     * @param {Function} reviver Method for further parsing of object elements,
     * called after each fabric object created.
     */
    enlivenObjects: function (objects, callback, namespace, reviver) {
      objects = objects || [];

      var enlivenedObjects = [],
        numLoadedObjects = 0,
        numTotalObjects = objects.length;

      function onLoaded() {
        if (++numLoadedObjects === numTotalObjects) {
          callback &&
            callback(
              enlivenedObjects.filter(function (obj) {
                // filter out undefined objects (objects that gave error)
                return obj;
              })
            );
        }
      }

      if (!numTotalObjects) {
        callback && callback(enlivenedObjects);
        return;
      }

      objects.forEach(function (o, index) {
        // if sparse array
        if (!o || !o.type) {
          onLoaded();
          return;
        }
        var klass = fabric.util.getKlass(o.type, namespace);
        klass.fromObject(o, function (obj, error) {
          error || (enlivenedObjects[index] = obj);
          reviver && reviver(o, obj, error);
          onLoaded();
        });
      });
    },

    /**
     * Create and wait for loading of patterns
     * @static
     * @memberOf fabric.util
     * @param {Array} patterns Objects to enliven
     * @param {Function} callback Callback to invoke when all objects are created
     * called after each fabric object created.
     */
    enlivenPatterns: function (patterns, callback) {
      patterns = patterns || [];

      function onLoaded() {
        if (++numLoadedPatterns === numPatterns) {
          callback && callback(enlivenedPatterns);
        }
      }

      var enlivenedPatterns = [],
        numLoadedPatterns = 0,
        numPatterns = patterns.length;

      if (!numPatterns) {
        callback && callback(enlivenedPatterns);
        return;
      }

      patterns.forEach(function (p, index) {
        if (p && p.source) {
          new fabric.Pattern(p, function (pattern) {
            enlivenedPatterns[index] = pattern;
            onLoaded();
          });
        } else {
          enlivenedPatterns[index] = p;
          onLoaded();
        }
      });
    },

    /**
     * Groups SVG elements (usually those retrieved from SVG document)
     * @static
     * @memberOf fabric.util
     * @param {Array} elements SVG elements to group
     * @param {Object} [options] Options object
     * @param {String} path Value to set sourcePath to
     * @return {fabric.Object|fabric.Group}
     */
    groupSVGElements: function (elements, options, path) {
      var object;
      if (elements && elements.length === 1) {
        return elements[0];
      }
      if (options) {
        if (options.width && options.height) {
          options.centerPoint = {
            x: options.width / 2,
            y: options.height / 2,
          };
        } else {
          delete options.width;
          delete options.height;
        }
      }
      object = new fabric.Group(elements, options);
      if (typeof path !== 'undefined') {
        object.sourcePath = path;
      }
      return object;
    },

    /**
     * Populates an object with properties of another object
     * @static
     * @memberOf fabric.util
     * @param {Object} source Source object
     * @param {Object} destination Destination object
     * @return {Array} properties Properties names to include
     */
    populateWithProperties: function (source, destination, properties) {
      if (
        properties &&
        Object.prototype.toString.call(properties) === '[object Array]'
      ) {
        for (var i = 0, len = properties.length; i < len; i++) {
          if (properties[i] in source) {
            destination[properties[i]] = source[properties[i]];
          }
        }
      }
    },

    /**
     * Draws a dashed line between two points
     *
     * This method is used to draw dashed line around selection area.
     * See <a href="http://stackoverflow.com/questions/4576724/dotted-stroke-in-canvas">dotted stroke in canvas</a>
     *
     * @param {CanvasRenderingContext2D} ctx context
     * @param {Number} x  start x coordinate
     * @param {Number} y start y coordinate
     * @param {Number} x2 end x coordinate
     * @param {Number} y2 end y coordinate
     * @param {Array} da dash array pattern
     */
    drawDashedLine: function (ctx, x, y, x2, y2, da) {
      var dx = x2 - x,
        dy = y2 - y,
        len = sqrt(dx * dx + dy * dy),
        rot = atan2(dy, dx),
        dc = da.length,
        di = 0,
        draw = true;

      ctx.save();
      ctx.translate(x, y);
      ctx.moveTo(0, 0);
      ctx.rotate(rot);

      x = 0;
      while (len > x) {
        x += da[di++ % dc];
        if (x > len) {
          x = len;
        }
        ctx[draw ? 'lineTo' : 'moveTo'](x, 0);
        draw = !draw;
      }

      ctx.restore();
    },

    /**
     * Creates canvas element
     * @static
     * @memberOf fabric.util
     * @return {CanvasElement} initialized canvas element
     */
    createCanvasElement: function () {
      return fabric.document.createElement('canvas');
    },

    /**
     * Creates a canvas element that is a copy of another and is also painted
     * @param {CanvasElement} canvas to copy size and content of
     * @static
     * @memberOf fabric.util
     * @return {CanvasElement} initialized canvas element
     */
    copyCanvasElement: function (canvas) {
      var newCanvas = fabric.util.createCanvasElement();
      newCanvas.width = canvas.width;
      newCanvas.height = canvas.height;
      newCanvas.getContext('2d').drawImage(canvas, 0, 0);
      return newCanvas;
    },

    /**
     * since 2.6.0 moved from canvas instance to utility.
     * @param {CanvasElement} canvasEl to copy size and content of
     * @param {String} format 'jpeg' or 'png', in some browsers 'webp' is ok too
     * @param {Number} quality <= 1 and > 0
     * @static
     * @memberOf fabric.util
     * @return {String} data url
     */
    toDataURL: function (canvasEl, format, quality) {
      return canvasEl.toDataURL('image/' + format, quality);
    },

    /**
     * Creates image element (works on client and node)
     * @static
     * @memberOf fabric.util
     * @return {HTMLImageElement} HTML image element
     */
    createImage: function () {
      return fabric.document.createElement('img');
    },

    /**
     * @static
     * @memberOf fabric.util
     * @deprecated since 2.0.0
     * @param {fabric.Object} receiver Object implementing `clipTo` method
     * @param {CanvasRenderingContext2D} ctx Context to clip
     */
    clipContext: function (receiver, ctx) {
      ctx.save();
      ctx.beginPath();
      receiver.clipTo(ctx);
      ctx.clip();
    },

    /**
     * Multiply matrix A by matrix B to nest transformations
     * @static
     * @memberOf fabric.util
     * @param  {Array} a First transformMatrix
     * @param  {Array} b Second transformMatrix
     * @param  {Boolean} is2x2 flag to multiply matrices as 2x2 matrices
     * @return {Array} The product of the two transform matrices
     */
    multiplyTransformMatrices: function (a, b, is2x2) {
      // Matrix multiply a * b
      return [
        a[0] * b[0] + a[2] * b[1],
        a[1] * b[0] + a[3] * b[1],
        a[0] * b[2] + a[2] * b[3],
        a[1] * b[2] + a[3] * b[3],
        is2x2 ? 0 : a[0] * b[4] + a[2] * b[5] + a[4],
        is2x2 ? 0 : a[1] * b[4] + a[3] * b[5] + a[5],
      ];
    },

    /**
     * Decomposes standard 2x3 matrix into transform components
     * @static
     * @memberOf fabric.util
     * @param  {Array} a transformMatrix
     * @return {Object} Components of transform
     */
    qrDecompose: function (a) {
      var angle = atan2(a[1], a[0]),
        denom = pow(a[0], 2) + pow(a[1], 2),
        scaleX = sqrt(denom),
        scaleY = (a[0] * a[3] - a[2] * a[1]) / scaleX,
        skewX = atan2(a[0] * a[2] + a[1] * a[3], denom);
      return {
        angle: angle / PiBy180,
        scaleX: scaleX,
        scaleY: scaleY,
        skewX: skewX / PiBy180,
        skewY: 0,
        translateX: a[4],
        translateY: a[5],
      };
    },

    /**
     * Returns a transform matrix starting from an object of the same kind of
     * the one returned from qrDecompose, useful also if you want to calculate some
     * transformations from an object that is not enlived yet
     * @static
     * @memberOf fabric.util
     * @param  {Object} options
     * @param  {Number} [options.angle] angle in degrees
     * @return {Number[]} transform matrix
     */
    calcRotateMatrix: function (options) {
      if (!options.angle) {
        return fabric.iMatrix.concat();
      }
      var theta = fabric.util.degreesToRadians(options.angle),
        cos = fabric.util.cos(theta),
        sin = fabric.util.sin(theta);
      return [cos, sin, -sin, cos, 0, 0];
    },

    /**
     * Returns a transform matrix starting from an object of the same kind of
     * the one returned from qrDecompose, useful also if you want to calculate some
     * transformations from an object that is not enlived yet.
     * is called DimensionsTransformMatrix because those properties are the one that influence
     * the size of the resulting box of the object.
     * @static
     * @memberOf fabric.util
     * @param  {Object} options
     * @param  {Number} [options.scaleX]
     * @param  {Number} [options.scaleY]
     * @param  {Boolean} [options.flipX]
     * @param  {Boolean} [options.flipY]
     * @param  {Number} [options.skewX]
     * @param  {Number} [options.skewX]
     * @return {Number[]} transform matrix
     */
    calcDimensionsMatrix: function (options) {
      var scaleX = typeof options.scaleX === 'undefined' ? 1 : options.scaleX,
        scaleY = typeof options.scaleY === 'undefined' ? 1 : options.scaleY,
        scaleMatrix = [
          options.flipX ? -scaleX : scaleX,
          0,
          0,
          options.flipY ? -scaleY : scaleY,
          0,
          0,
        ],
        multiply = fabric.util.multiplyTransformMatrices,
        degreesToRadians = fabric.util.degreesToRadians;
      if (options.skewX) {
        scaleMatrix = multiply(
          scaleMatrix,
          [1, 0, Math.tan(degreesToRadians(options.skewX)), 1],
          true
        );
      }
      if (options.skewY) {
        scaleMatrix = multiply(
          scaleMatrix,
          [1, Math.tan(degreesToRadians(options.skewY)), 0, 1],
          true
        );
      }
      return scaleMatrix;
    },

    /**
     * Returns a transform matrix starting from an object of the same kind of
     * the one returned from qrDecompose, useful also if you want to calculate some
     * transformations from an object that is not enlived yet
     * @static
     * @memberOf fabric.util
     * @param  {Object} options
     * @param  {Number} [options.angle]
     * @param  {Number} [options.scaleX]
     * @param  {Number} [options.scaleY]
     * @param  {Boolean} [options.flipX]
     * @param  {Boolean} [options.flipY]
     * @param  {Number} [options.skewX]
     * @param  {Number} [options.skewX]
     * @param  {Number} [options.translateX]
     * @param  {Number} [options.translateY]
     * @return {Number[]} transform matrix
     */
    composeMatrix: function (options) {
      var matrix = [
          1,
          0,
          0,
          1,
          options.translateX || 0,
          options.translateY || 0,
        ],
        multiply = fabric.util.multiplyTransformMatrices;
      if (options.angle) {
        matrix = multiply(matrix, fabric.util.calcRotateMatrix(options));
      }
      if (
        options.scaleX ||
        options.scaleY ||
        options.skewX ||
        options.skewY ||
        options.flipX ||
        options.flipY
      ) {
        matrix = multiply(matrix, fabric.util.calcDimensionsMatrix(options));
      }
      return matrix;
    },

    /**
     * Returns a transform matrix that has the same effect of scaleX, scaleY and skewX.
     * Is deprecated for composeMatrix. Please do not use it.
     * @static
     * @deprecated since 3.4.0
     * @memberOf fabric.util
     * @param  {Number} scaleX
     * @param  {Number} scaleY
     * @param  {Number} skewX
     * @return {Number[]} transform matrix
     */
    customTransformMatrix: function (scaleX, scaleY, skewX) {
      return fabric.util.composeMatrix({
        scaleX: scaleX,
        scaleY: scaleY,
        skewX: skewX,
      });
    },

    /**
     * reset an object transform state to neutral. Top and left are not accounted for
     * @static
     * @memberOf fabric.util
     * @param  {fabric.Object} target object to transform
     */
    resetObjectTransform: function (target) {
      target.scaleX = 1;
      target.scaleY = 1;
      target.skewX = 0;
      target.skewY = 0;
      target.flipX = false;
      target.flipY = false;
      target.rotate(0);
    },

    /**
     * Extract Object transform values
     * @static
     * @memberOf fabric.util
     * @param  {fabric.Object} target object to read from
     * @return {Object} Components of transform
     */
    saveObjectTransform: function (target) {
      return {
        scaleX: target.scaleX,
        scaleY: target.scaleY,
        skewX: target.skewX,
        skewY: target.skewY,
        angle: target.angle,
        left: target.left,
        flipX: target.flipX,
        flipY: target.flipY,
        top: target.top,
      };
    },

    /**
     * Returns string representation of function body
     * @param {Function} fn Function to get body of
     * @return {String} Function body
     */
    getFunctionBody: function (fn) {
      return (String(fn).match(/function[^{]*\{([\s\S]*)\}/) || {})[1];
    },

    /**
     * Returns true if context has transparent pixel
     * at specified location (taking tolerance into account)
     * @param {CanvasRenderingContext2D} ctx context
     * @param {Number} x x coordinate
     * @param {Number} y y coordinate
     * @param {Number} tolerance Tolerance
     */
    isTransparent: function (ctx, x, y, tolerance) {
      // If tolerance is > 0 adjust start coords to take into account.
      // If moves off Canvas fix to 0
      if (tolerance > 0) {
        if (x > tolerance) {
          x -= tolerance;
        } else {
          x = 0;
        }
        if (y > tolerance) {
          y -= tolerance;
        } else {
          y = 0;
        }
      }

      var _isTransparent = true,
        i,
        temp,
        imageData = ctx.getImageData(
          x,
          y,
          tolerance * 2 || 1,
          tolerance * 2 || 1
        ),
        l = imageData.data.length;

      // Split image data - for tolerance > 1, pixelDataSize = 4;
      for (i = 3; i < l; i += 4) {
        temp = imageData.data[i];
        _isTransparent = temp <= 0;
        if (_isTransparent === false) {
          break; // Stop if colour found
        }
      }

      imageData = null;

      return _isTransparent;
    },

    /**
     * Parse preserveAspectRatio attribute from element
     * @param {string} attribute to be parsed
     * @return {Object} an object containing align and meetOrSlice attribute
     */
    parsePreserveAspectRatioAttribute: function (attribute) {
      var meetOrSlice = 'meet',
        alignX = 'Mid',
        alignY = 'Mid',
        aspectRatioAttrs = attribute.split(' '),
        align;

      if (aspectRatioAttrs && aspectRatioAttrs.length) {
        meetOrSlice = aspectRatioAttrs.pop();
        if (meetOrSlice !== 'meet' && meetOrSlice !== 'slice') {
          align = meetOrSlice;
          meetOrSlice = 'meet';
        } else if (aspectRatioAttrs.length) {
          align = aspectRatioAttrs.pop();
        }
      }
      //divide align in alignX and alignY
      alignX = align !== 'none' ? align.slice(1, 4) : 'none';
      alignY = align !== 'none' ? align.slice(5, 8) : 'none';
      return {
        meetOrSlice: meetOrSlice,
        alignX: alignX,
        alignY: alignY,
      };
    },

    /**
     * Clear char widths cache for the given font family or all the cache if no
     * fontFamily is specified.
     * Use it if you know you are loading fonts in a lazy way and you are not waiting
     * for custom fonts to load properly when adding text objects to the canvas.
     * If a text object is added when its own font is not loaded yet, you will get wrong
     * measurement and so wrong bounding boxes.
     * After the font cache is cleared, either change the textObject text content or call
     * initDimensions() to trigger a recalculation
     * @memberOf fabric.util
     * @param {String} [fontFamily] font family to clear
     */
    clearFabricFontCache: function (fontFamily) {
      fontFamily = (fontFamily || '').toLowerCase();
      if (!fontFamily) {
        fabric.charWidthsCache = {};
      } else if (fabric.charWidthsCache[fontFamily]) {
        delete fabric.charWidthsCache[fontFamily];
      }
    },

    /**
     * Given current aspect ratio, determines the max width and height that can
     * respect the total allowed area for the cache.
     * @memberOf fabric.util
     * @param {Number} ar aspect ratio
     * @param {Number} maximumArea Maximum area you want to achieve
     * @return {Object.x} Limited dimensions by X
     * @return {Object.y} Limited dimensions by Y
     */
    limitDimsByArea: function (ar, maximumArea) {
      var roughWidth = Math.sqrt(maximumArea * ar),
        perfLimitSizeY = Math.floor(maximumArea / roughWidth);
      return { x: Math.floor(roughWidth), y: perfLimitSizeY };
    },

    capValue: function (min, value, max) {
      return Math.max(min, Math.min(value, max));
    },

    /**
     * Finds the scale for the object source to fit inside the object destination,
     * keeping aspect ratio intact.
     * respect the total allowed area for the cache.
     * @memberOf fabric.util
     * @param {Object | fabric.Object} source
     * @param {Number} source.height natural unscaled height of the object
     * @param {Number} source.width natural unscaled width of the object
     * @param {Object | fabric.Object} destination
     * @param {Number} destination.height natural unscaled height of the object
     * @param {Number} destination.width natural unscaled width of the object
     * @return {Number} scale factor to apply to source to fit into destination
     */
    findScaleToFit: function (source, destination) {
      return Math.min(
        destination.width / source.width,
        destination.height / source.height
      );
    },

    /**
     * Finds the scale for the object source to cover entirely the object destination,
     * keeping aspect ratio intact.
     * respect the total allowed area for the cache.
     * @memberOf fabric.util
     * @param {Object | fabric.Object} source
     * @param {Number} source.height natural unscaled height of the object
     * @param {Number} source.width natural unscaled width of the object
     * @param {Object | fabric.Object} destination
     * @param {Number} destination.height natural unscaled height of the object
     * @param {Number} destination.width natural unscaled width of the object
     * @return {Number} scale factor to apply to source to cover destination
     */
    findScaleToCover: function (source, destination) {
      return Math.max(
        destination.width / source.width,
        destination.height / source.height
      );
    },

    /**
     * given an array of 6 number returns something like `"matrix(...numbers)"`
     * @memberOf fabric.util
     * @param {Array} trasnform an array with 6 numbers
     * @return {String} transform matrix for svg
     * @return {Object.y} Limited dimensions by Y
     */
    matrixToSVG: function (transform) {
      return (
        'matrix(' +
        transform
          .map(function (value) {
            return fabric.util.toFixed(
              value,
              fabric.Object.NUM_FRACTION_DIGITS
            );
          })
          .join(' ') +
        ')'
      );
    },
  };
})(typeof exports !== 'undefined' ? exports : this);
(function nsSVGPathDataParser() {
  var _join = Array.prototype.join;

  /* Adapted from http://dxr.mozilla.org/mozilla-central/source/content/svg/content/src/nsSVGPathDataParser.cpp
   * by Andrea Bogazzi code is under MPL. if you don't have a copy of the license you can take it here
   * http://mozilla.org/MPL/2.0/
   */
  function arcToSegments(toX, toY, rx, ry, large, sweep, rotateX) {
    var argsString = _join.call(arguments);
    if (fabric.arcToSegmentsCache[argsString]) {
      return fabric.arcToSegmentsCache[argsString];
    }

    var PI = Math.PI,
      th = (rotateX * PI) / 180,
      sinTh = fabric.util.sin(th),
      cosTh = fabric.util.cos(th),
      fromX = 0,
      fromY = 0;

    rx = Math.abs(rx);
    ry = Math.abs(ry);

    var px = -cosTh * toX * 0.5 - sinTh * toY * 0.5,
      py = -cosTh * toY * 0.5 + sinTh * toX * 0.5,
      rx2 = rx * rx,
      ry2 = ry * ry,
      py2 = py * py,
      px2 = px * px,
      pl = rx2 * ry2 - rx2 * py2 - ry2 * px2,
      root = 0;

    if (pl < 0) {
      var s = Math.sqrt(1 - pl / (rx2 * ry2));
      rx *= s;
      ry *= s;
    } else {
      root =
        (large === sweep ? -1.0 : 1.0) *
        Math.sqrt(pl / (rx2 * py2 + ry2 * px2));
    }

    var cx = (root * rx * py) / ry,
      cy = (-root * ry * px) / rx,
      cx1 = cosTh * cx - sinTh * cy + toX * 0.5,
      cy1 = sinTh * cx + cosTh * cy + toY * 0.5,
      mTheta = calcVectorAngle(1, 0, (px - cx) / rx, (py - cy) / ry),
      dtheta = calcVectorAngle(
        (px - cx) / rx,
        (py - cy) / ry,
        (-px - cx) / rx,
        (-py - cy) / ry
      );

    if (sweep === 0 && dtheta > 0) {
      dtheta -= 2 * PI;
    } else if (sweep === 1 && dtheta < 0) {
      dtheta += 2 * PI;
    }

    // Convert into cubic bezier segments <= 90deg
    var segments = Math.ceil(Math.abs((dtheta / PI) * 2)),
      result = [],
      mDelta = dtheta / segments,
      mT =
        ((8 / 3) * Math.sin(mDelta / 4) * Math.sin(mDelta / 4)) /
        Math.sin(mDelta / 2),
      th3 = mTheta + mDelta;

    for (var i = 0; i < segments; i++) {
      result[i] = segmentToBezier(
        mTheta,
        th3,
        cosTh,
        sinTh,
        rx,
        ry,
        cx1,
        cy1,
        mT,
        fromX,
        fromY
      );
      fromX = result[i][4];
      fromY = result[i][5];
      mTheta = th3;
      th3 += mDelta;
    }
    fabric.arcToSegmentsCache[argsString] = result;
    return result;
  }

  function segmentToBezier(
    th2,
    th3,
    cosTh,
    sinTh,
    rx,
    ry,
    cx1,
    cy1,
    mT,
    fromX,
    fromY
  ) {
    var costh2 = fabric.util.cos(th2),
      sinth2 = fabric.util.sin(th2),
      costh3 = fabric.util.cos(th3),
      sinth3 = fabric.util.sin(th3),
      toX = cosTh * rx * costh3 - sinTh * ry * sinth3 + cx1,
      toY = sinTh * rx * costh3 + cosTh * ry * sinth3 + cy1,
      cp1X = fromX + mT * (-cosTh * rx * sinth2 - sinTh * ry * costh2),
      cp1Y = fromY + mT * (-sinTh * rx * sinth2 + cosTh * ry * costh2),
      cp2X = toX + mT * (cosTh * rx * sinth3 + sinTh * ry * costh3),
      cp2Y = toY + mT * (sinTh * rx * sinth3 - cosTh * ry * costh3);

    return [cp1X, cp1Y, cp2X, cp2Y, toX, toY];
  }

  /*
   * Private
   */
  function calcVectorAngle(ux, uy, vx, vy) {
    var ta = Math.atan2(uy, ux),
      tb = Math.atan2(vy, vx);
    if (tb >= ta) {
      return tb - ta;
    } else {
      return 2 * Math.PI - (ta - tb);
    }
  }

  /**
   * Draws arc
   * @param {CanvasRenderingContext2D} ctx
   * @param {Number} fx
   * @param {Number} fy
   * @param {Array} coords
   */
  fabric.util.drawArc = function (ctx, fx, fy, coords) {
    var rx = coords[0],
      ry = coords[1],
      rot = coords[2],
      large = coords[3],
      sweep = coords[4],
      tx = coords[5],
      ty = coords[6],
      segs = [[], [], [], []],
      segsNorm = arcToSegments(tx - fx, ty - fy, rx, ry, large, sweep, rot);

    for (var i = 0, len = segsNorm.length; i < len; i++) {
      segs[i][0] = segsNorm[i][0] + fx;
      segs[i][1] = segsNorm[i][1] + fy;
      segs[i][2] = segsNorm[i][2] + fx;
      segs[i][3] = segsNorm[i][3] + fy;
      segs[i][4] = segsNorm[i][4] + fx;
      segs[i][5] = segsNorm[i][5] + fy;
      ctx.bezierCurveTo.apply(ctx, segs[i]);
    }
  };

  /**
   * Calculate bounding box of a elliptic-arc
   * @param {Number} fx start point of arc
   * @param {Number} fy
   * @param {Number} rx horizontal radius
   * @param {Number} ry vertical radius
   * @param {Number} rot angle of horizontal axe
   * @param {Number} large 1 or 0, whatever the arc is the big or the small on the 2 points
   * @param {Number} sweep 1 or 0, 1 clockwise or counterclockwise direction
   * @param {Number} tx end point of arc
   * @param {Number} ty
   */
  fabric.util.getBoundsOfArc = function (
    fx,
    fy,
    rx,
    ry,
    rot,
    large,
    sweep,
    tx,
    ty
  ) {
    var fromX = 0,
      fromY = 0,
      bound,
      bounds = [],
      segs = arcToSegments(tx - fx, ty - fy, rx, ry, large, sweep, rot);

    for (var i = 0, len = segs.length; i < len; i++) {
      bound = getBoundsOfCurve(
        fromX,
        fromY,
        segs[i][0],
        segs[i][1],
        segs[i][2],
        segs[i][3],
        segs[i][4],
        segs[i][5]
      );
      bounds.push({ x: bound[0].x + fx, y: bound[0].y + fy });
      bounds.push({ x: bound[1].x + fx, y: bound[1].y + fy });
      fromX = segs[i][4];
      fromY = segs[i][5];
    }
    return bounds;
  };

  /**
   * Calculate bounding box of a beziercurve
   * @param {Number} x0 starting point
   * @param {Number} y0
   * @param {Number} x1 first control point
   * @param {Number} y1
   * @param {Number} x2 secondo control point
   * @param {Number} y2
   * @param {Number} x3 end of beizer
   * @param {Number} y3
   */
  // taken from http://jsbin.com/ivomiq/56/edit  no credits available for that.
  function getBoundsOfCurve(x0, y0, x1, y1, x2, y2, x3, y3) {
    var argsString;
    if (fabric.cachesBoundsOfCurve) {
      argsString = _join.call(arguments);
      if (fabric.boundsOfCurveCache[argsString]) {
        return fabric.boundsOfCurveCache[argsString];
      }
    }

    var sqrt = Math.sqrt,
      min = Math.min,
      max = Math.max,
      abs = Math.abs,
      tvalues = [],
      bounds = [[], []],
      a,
      b,
      c,
      t,
      t1,
      t2,
      b2ac,
      sqrtb2ac;

    b = 6 * x0 - 12 * x1 + 6 * x2;
    a = -3 * x0 + 9 * x1 - 9 * x2 + 3 * x3;
    c = 3 * x1 - 3 * x0;

    for (var i = 0; i < 2; ++i) {
      if (i > 0) {
        b = 6 * y0 - 12 * y1 + 6 * y2;
        a = -3 * y0 + 9 * y1 - 9 * y2 + 3 * y3;
        c = 3 * y1 - 3 * y0;
      }

      if (abs(a) < 1e-12) {
        if (abs(b) < 1e-12) {
          continue;
        }
        t = -c / b;
        if (0 < t && t < 1) {
          tvalues.push(t);
        }
        continue;
      }
      b2ac = b * b - 4 * c * a;
      if (b2ac < 0) {
        continue;
      }
      sqrtb2ac = sqrt(b2ac);
      t1 = (-b + sqrtb2ac) / (2 * a);
      if (0 < t1 && t1 < 1) {
        tvalues.push(t1);
      }
      t2 = (-b - sqrtb2ac) / (2 * a);
      if (0 < t2 && t2 < 1) {
        tvalues.push(t2);
      }
    }

    var x,
      y,
      j = tvalues.length,
      jlen = j,
      mt;
    while (j--) {
      t = tvalues[j];
      mt = 1 - t;
      x =
        mt * mt * mt * x0 +
        3 * mt * mt * t * x1 +
        3 * mt * t * t * x2 +
        t * t * t * x3;
      bounds[0][j] = x;

      y =
        mt * mt * mt * y0 +
        3 * mt * mt * t * y1 +
        3 * mt * t * t * y2 +
        t * t * t * y3;
      bounds[1][j] = y;
    }

    bounds[0][jlen] = x0;
    bounds[1][jlen] = y0;
    bounds[0][jlen + 1] = x3;
    bounds[1][jlen + 1] = y3;
    var result = [
      {
        x: min.apply(null, bounds[0]),
        y: min.apply(null, bounds[1]),
      },
      {
        x: max.apply(null, bounds[0]),
        y: max.apply(null, bounds[1]),
      },
    ];
    if (fabric.cachesBoundsOfCurve) {
      fabric.boundsOfCurveCache[argsString] = result;
    }
    return result;
  }

  fabric.util.getBoundsOfCurve = getBoundsOfCurve;
})();
(function initArrayUtilities() {
  var slice = Array.prototype.slice;

  /**
   * Invokes method on all items in a given array
   * @memberOf fabric.util.array
   * @param {Array} array Array to iterate over
   * @param {String} method Name of a method to invoke
   * @return {Array}
   */
  function invoke(array, method) {
    var args = slice.call(arguments, 2),
      result = [];
    for (var i = 0, len = array.length; i < len; i++) {
      result[i] = args.length
        ? array[i][method].apply(array[i], args)
        : array[i][method].call(array[i]);
    }
    return result;
  }

  /**
   * Finds maximum value in array (not necessarily "first" one)
   * @memberOf fabric.util.array
   * @param {Array} array Array to iterate over
   * @param {String} byProperty
   * @return {*}
   */
  function max(array, byProperty) {
    return find(array, byProperty, function (value1, value2) {
      return value1 >= value2;
    });
  }

  /**
   * Finds minimum value in array (not necessarily "first" one)
   * @memberOf fabric.util.array
   * @param {Array} array Array to iterate over
   * @param {String} byProperty
   * @return {*}
   */
  function min(array, byProperty) {
    return find(array, byProperty, function (value1, value2) {
      return value1 < value2;
    });
  }

  /**
   * @private
   */
  function fill(array, value) {
    var k = array.length;
    while (k--) {
      array[k] = value;
    }
    return array;
  }

  /**
   * @private
   */
  function find(array, byProperty, condition) {
    if (!array || array.length === 0) {
      return;
    }

    var i = array.length - 1,
      result = byProperty ? array[i][byProperty] : array[i];
    if (byProperty) {
      while (i--) {
        if (condition(array[i][byProperty], result)) {
          result = array[i][byProperty];
        }
      }
    } else {
      while (i--) {
        if (condition(array[i], result)) {
          result = array[i];
        }
      }
    }
    return result;
  }

  /**
   * @namespace fabric.util.array
   */
  fabric.util.array = {
    fill: fill,
    invoke: invoke,
    min: min,
    max: max,
  };
})();
(function () {
  /**
   * Copies all enumerable properties of one js object to another
   * this does not and cannot compete with generic utils.
   * Does not clone or extend fabric.Object subclasses.
   * This is mostly for internal use and has extra handling for fabricJS objects
   * it skips the canvas property in deep cloning.
   * @memberOf fabric.util.object
   * @param {Object} destination Where to copy to
   * @param {Object} source Where to copy from
   * @return {Object}
   */

  function extend(destination, source, deep) {
    // JScript DontEnum bug is not taken care of
    // the deep clone is for internal use, is not meant to avoid
    // javascript traps or cloning html element or self referenced objects.
    if (deep) {
      if (!fabric.isLikelyNode && source instanceof Element) {
        // avoid cloning deep images, canvases,
        destination = source;
      } else if (source instanceof Array) {
        destination = [];
        for (let i = 0, len = source.length; i < len; i++) {
          destination[i] = extend({}, source[i], deep);
        }
      } else if (source && typeof source === 'object') {
        for (let property in source) {
          if (property === 'canvas') {
            destination[property] = extend({}, source[property]);
          } else if (source.hasOwnProperty(property)) {
            destination[property] = extend({}, source[property], deep);
          }
        }
      } else {
        // this sounds odd for an extend but is ok for recursive use
        destination = source;
      }
    } else {
      for (let property in source) {
        destination[property] = source[property];
      }
    }
    return destination;
  }

  /**
   * Creates an empty object and copies all enumerable properties of another object to it
   * @memberOf fabric.util.object
   * TODO: this function return an empty object if you try to clone null
   * @param {Object} object Object to clone
   * @return {Object}
   */
  function clone(object, deep) {
    return extend({}, object, deep);
  }

  /** @namespace fabric.util.object */
  fabric.util.object = {
    extend: extend,
    clone: clone,
  };
  fabric.util.object.extend(fabric.util, fabric.Observable);
})();
(function initStringUtilities() {
  /**
   * Camelizes a string
   * @memberOf fabric.util.string
   * @param {String} string String to camelize
   * @return {String} Camelized version of a string
   */
  function camelize(string) {
    return string.replace(/-+(.)?/g, function (match, character) {
      return character ? character.toUpperCase() : '';
    });
  }

  /**
   * Capitalizes a string
   * @memberOf fabric.util.string
   * @param {String} string String to capitalize
   * @param {Boolean} [firstLetterOnly] If true only first letter is capitalized
   * and other letters stay untouched, if false first letter is capitalized
   * and other letters are converted to lowercase.
   * @return {String} Capitalized version of a string
   */
  function capitalize(string, firstLetterOnly) {
    return (
      string.charAt(0).toUpperCase() +
      (firstLetterOnly ? string.slice(1) : string.slice(1).toLowerCase())
    );
  }

  /**
   * Escapes XML in a string
   * @memberOf fabric.util.string
   * @param {String} string String to escape
   * @return {String} Escaped version of a string
   */
  function escapeXml(string) {
    return string
      .replace(/&/g, '&amp;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  /**
   * Divide a string in the user perceived single units
   * @memberOf fabric.util.string
   * @param {String} textstring String to escape
   * @return {Array} array containing the graphemes
   */
  function graphemeSplit(textstring) {
    var i = 0,
      chr,
      graphemes = [];
    for (i = 0, chr; i < textstring.length; i++) {
      if ((chr = getWholeChar(textstring, i)) === false) {
        continue;
      }
      graphemes.push(chr);
    }
    return graphemes;
  }

  // taken from mdn in the charAt doc page.
  function getWholeChar(str, i) {
    var code = str.charCodeAt(i);

    if (isNaN(code)) {
      return ''; // Position not found
    }
    if (code < 0xd800 || code > 0xdfff) {
      return str.charAt(i);
    }

    // High surrogate (could change last hex to 0xDB7F to treat high private
    // surrogates as single characters)
    if (0xd800 <= code && code <= 0xdbff) {
      if (str.length <= i + 1) {
        throw new Error('High surrogate without following low surrogate');
      }
      var next = str.charCodeAt(i + 1);
      if (0xdc00 > next || next > 0xdfff) {
        throw new Error('High surrogate without following low surrogate');
      }
      return str.charAt(i) + str.charAt(i + 1);
    }
    // Low surrogate (0xDC00 <= code && code <= 0xDFFF)
    if (i === 0) {
      throw new Error('Low surrogate without preceding high surrogate');
    }
    var prev = str.charCodeAt(i - 1);

    // (could change last hex to 0xDB7F to treat high private
    // surrogates as single characters)
    if (0xd800 > prev || prev > 0xdbff) {
      throw new Error('Low surrogate without preceding high surrogate');
    }
    // We can pass over low surrogates now as the second component
    // in a pair which we have already processed
    return false;
  }

  /**
   * String utilities
   * @namespace fabric.util.string
   */
  fabric.util.string = {
    camelize: camelize,
    capitalize: capitalize,
    escapeXml: escapeXml,
    graphemeSplit: graphemeSplit,
  };
})();
(function () {
  var slice = Array.prototype.slice,
    emptyFunction = function () {},
    IS_DONTENUM_BUGGY = (function () {
      for (var p in { toString: 1 }) {
        if (p === 'toString') {
          return false;
        }
      }
      return true;
    })(),
    /** @ignore */
    addMethods = function (klass, source, parent) {
      for (var property in source) {
        if (
          property in klass.prototype &&
          typeof klass.prototype[property] === 'function' &&
          (source[property] + '').indexOf('callSuper') > -1
        ) {
          klass.prototype[property] = (function (property) {
            return function () {
              var superclass = this.constructor.superclass;
              this.constructor.superclass = parent;
              var returnValue = source[property].apply(this, arguments);
              this.constructor.superclass = superclass;

              if (property !== 'initialize') {
                return returnValue;
              }
            };
          })(property);
        } else {
          klass.prototype[property] = source[property];
        }

        if (IS_DONTENUM_BUGGY) {
          if (source.toString !== Object.prototype.toString) {
            klass.prototype.toString = source.toString;
          }
          if (source.valueOf !== Object.prototype.valueOf) {
            klass.prototype.valueOf = source.valueOf;
          }
        }
      }
    };

  function Subclass() {}

  function callSuper(methodName) {
    var parentMethod = null,
      _this = this;

    // climb prototype chain to find method not equal to callee's method
    while (_this.constructor.superclass) {
      var superClassMethod = _this.constructor.superclass.prototype[methodName];
      if (_this[methodName] !== superClassMethod) {
        parentMethod = superClassMethod;
        break;
      }
      // eslint-disable-next-line
      _this = _this.constructor.superclass.prototype;
    }

    if (!parentMethod) {
      return console.log(
        'tried to callSuper ' +
          methodName +
          ', method not found in prototype chain',
        this
      );
    }

    return arguments.length > 1
      ? parentMethod.apply(this, slice.call(arguments, 1))
      : parentMethod.call(this);
  }

  /**
   * Helper for creation of "classes".
   * @memberOf fabric.util
   * @param {Function} [parent] optional "Class" to inherit from
   * @param {Object} [properties] Properties shared by all instances of this class
   *                  (be careful modifying objects defined here as this would affect all instances)
   */
  function createClass() {
    var parent = null,
      properties = slice.call(arguments, 0);

    if (typeof properties[0] === 'function') {
      parent = properties.shift();
    }
    function klass() {
      this.initialize.apply(this, arguments);
    }

    klass.superclass = parent;
    klass.subclasses = [];

    if (parent) {
      Subclass.prototype = parent.prototype;
      klass.prototype = new Subclass();
      parent.subclasses.push(klass);
    }
    for (var i = 0, length = properties.length; i < length; i++) {
      addMethods(klass, properties[i], parent);
    }
    if (!klass.prototype.initialize) {
      klass.prototype.initialize = emptyFunction;
    }
    klass.prototype.constructor = klass;
    klass.prototype.callSuper = callSuper;
    return klass;
  }

  fabric.util.createClass = createClass;
})();
(function initStyles() {
  /**
   * Cross-browser wrapper for setting element's style
   * @memberOf fabric.util
   * @param {HTMLElement} element
   * @param {Object} styles
   * @return {HTMLElement} Element that was passed as a first argument
   */
  function setStyle(element, styles) {
    var elementStyle = element.style;
    if (!elementStyle) {
      return element;
    }
    if (typeof styles === 'string') {
      element.style.cssText += ';' + styles;
      return styles.indexOf('opacity') > -1
        ? setOpacity(element, styles.match(/opacity:\s*(\d?\.?\d*)/)[1])
        : element;
    }
    for (var property in styles) {
      if (property === 'opacity') {
        setOpacity(element, styles[property]);
      } else {
        var normalizedProperty =
          property === 'float' || property === 'cssFloat'
            ? typeof elementStyle.styleFloat === 'undefined'
              ? 'cssFloat'
              : 'styleFloat'
            : property;
        elementStyle[normalizedProperty] = styles[property];
      }
    }
    return element;
  }

  var parseEl = fabric.document.createElement('div'),
    supportsOpacity = typeof parseEl.style.opacity === 'string',
    supportsFilters = typeof parseEl.style.filter === 'string',
    reOpacity = /alpha\s*\(\s*opacity\s*=\s*([^)]+)\)/,
    /** @ignore */
    setOpacity = function (element) {
      return element;
    };

  if (supportsOpacity) {
    /** @ignore */
    setOpacity = function (element, value) {
      element.style.opacity = value;
      return element;
    };
  } else if (supportsFilters) {
    /** @ignore */
    setOpacity = function (element, value) {
      var es = element.style;
      if (element.currentStyle && !element.currentStyle.hasLayout) {
        es.zoom = 1;
      }
      if (reOpacity.test(es.filter)) {
        value = value >= 0.9999 ? '' : 'alpha(opacity=' + value * 100 + ')';
        es.filter = es.filter.replace(reOpacity, value);
      } else {
        es.filter += ' alpha(opacity=' + value * 100 + ')';
      }
      return element;
    };
  }

  fabric.util.setStyle = setStyle;
})();
(function () {
  var _slice = Array.prototype.slice;

  /**
   * Takes id and returns an element with that id (if one exists in a document)
   * @memberOf fabric.util
   * @param {String|HTMLElement} id
   * @return {HTMLElement|null}
   */
  function getById(id) {
    return typeof id === 'string' ? fabric.document.getElementById(id) : id;
  }

  var sliceCanConvertNodelists,
    /**
     * Converts an array-like object (e.g. arguments or NodeList) to an array
     * @memberOf fabric.util
     * @param {Object} arrayLike
     * @return {Array}
     */
    toArray = function (arrayLike) {
      return _slice.call(arrayLike, 0);
    };

  try {
    sliceCanConvertNodelists =
      toArray(fabric.document.childNodes) instanceof Array;
  } catch (err) {}

  if (!sliceCanConvertNodelists) {
    toArray = function (arrayLike) {
      var arr = new Array(arrayLike.length),
        i = arrayLike.length;
      while (i--) {
        arr[i] = arrayLike[i];
      }
      return arr;
    };
  }

  /**
   * Creates specified element with specified attributes
   * @memberOf fabric.util
   * @param {String} tagName Type of an element to create
   * @param {Object} [attributes] Attributes to set on an element
   * @return {HTMLElement} Newly created element
   */
  function makeElement(tagName, attributes) {
    var el = fabric.document.createElement(tagName);
    for (var prop in attributes) {
      if (prop === 'class') {
        el.className = attributes[prop];
      } else if (prop === 'for') {
        el.htmlFor = attributes[prop];
      } else {
        el.setAttribute(prop, attributes[prop]);
      }
    }
    return el;
  }

  /**
   * Adds class to an element
   * @memberOf fabric.util
   * @param {HTMLElement} element Element to add class to
   * @param {String} className Class to add to an element
   */
  function addClass(element, className) {
    if (
      element &&
      (' ' + element.className + ' ').indexOf(' ' + className + ' ') === -1
    ) {
      element.className += (element.className ? ' ' : '') + className;
    }
  }

  /**
   * Wraps element with another element
   * @memberOf fabric.util
   * @param {HTMLElement} element Element to wrap
   * @param {HTMLElement|String} wrapper Element to wrap with
   * @param {Object} [attributes] Attributes to set on a wrapper
   * @return {HTMLElement} wrapper
   */
  function wrapElement(element, wrapper, attributes) {
    if (typeof wrapper === 'string') {
      wrapper = makeElement(wrapper, attributes);
    }
    if (element.parentNode) {
      element.parentNode.replaceChild(wrapper, element);
    }
    wrapper.appendChild(element);
    return wrapper;
  }

  /**
   * Returns element scroll offsets
   * @memberOf fabric.util
   * @param {HTMLElement} element Element to operate on
   * @return {Object} Object with left/top values
   */
  function getScrollLeftTop(element) {
    var left = 0,
      top = 0,
      docElement = fabric.document.documentElement,
      body = fabric.document.body || {
        scrollLeft: 0,
        scrollTop: 0,
      };

    // While loop checks (and then sets element to) .parentNode OR .host
    //  to account for ShadowDOM. We still want to traverse up out of ShadowDOM,
    //  but the .parentNode of a root ShadowDOM node will always be null, instead
    //  it should be accessed through .host. See http://stackoverflow.com/a/24765528/4383938
    while (element && (element.parentNode || element.host)) {
      // Set element to element parent, or 'host' in case of ShadowDOM
      element = element.parentNode || element.host;

      if (element === fabric.document) {
        left = body.scrollLeft || docElement.scrollLeft || 0;
        top = body.scrollTop || docElement.scrollTop || 0;
      } else {
        left += element.scrollLeft || 0;
        top += element.scrollTop || 0;
      }

      if (element.nodeType === 1 && element.style.position === 'fixed') {
        break;
      }
    }

    return { left: left, top: top };
  }

  /**
   * Returns offset for a given element
   * @function
   * @memberOf fabric.util
   * @param {HTMLElement} element Element to get offset for
   * @return {Object} Object with "left" and "top" properties
   */
  function getElementOffset(element) {
    var docElem,
      doc = element && element.ownerDocument,
      box = { left: 0, top: 0 },
      offset = { left: 0, top: 0 },
      scrollLeftTop,
      offsetAttributes = {
        borderLeftWidth: 'left',
        borderTopWidth: 'top',
        paddingLeft: 'left',
        paddingTop: 'top',
      };

    if (!doc) {
      return offset;
    }

    for (var attr in offsetAttributes) {
      offset[offsetAttributes[attr]] +=
        parseInt(getElementStyle(element, attr), 10) || 0;
    }

    docElem = doc.documentElement;
    if (typeof element.getBoundingClientRect !== 'undefined') {
      box = element.getBoundingClientRect();
    }

    scrollLeftTop = getScrollLeftTop(element);

    return {
      left:
        box.left + scrollLeftTop.left - (docElem.clientLeft || 0) + offset.left,
      top: box.top + scrollLeftTop.top - (docElem.clientTop || 0) + offset.top,
    };
  }

  /**
   * Returns style attribute value of a given element
   * @memberOf fabric.util
   * @param {HTMLElement} element Element to get style attribute for
   * @param {String} attr Style attribute to get for element
   * @return {String} Style attribute value of the given element.
   */
  var getElementStyle;
  if (
    fabric.document.defaultView &&
    fabric.document.defaultView.getComputedStyle
  ) {
    getElementStyle = function (element, attr) {
      var style = fabric.document.defaultView.getComputedStyle(element, null);
      return style ? style[attr] : undefined;
    };
  } else {
    getElementStyle = function (element, attr) {
      var value = element.style[attr];
      if (!value && element.currentStyle) {
        value = element.currentStyle[attr];
      }
      return value;
    };
  }

  (function () {
    var style = fabric.document.documentElement.style,
      selectProp =
        'userSelect' in style
          ? 'userSelect'
          : 'MozUserSelect' in style
          ? 'MozUserSelect'
          : 'WebkitUserSelect' in style
          ? 'WebkitUserSelect'
          : 'KhtmlUserSelect' in style
          ? 'KhtmlUserSelect'
          : '';

    /**
     * Makes element unselectable
     * @memberOf fabric.util
     * @param {HTMLElement} element Element to make unselectable
     * @return {HTMLElement} Element that was passed in
     */
    function makeElementUnselectable(element) {
      if (typeof element.onselectstart !== 'undefined') {
        element.onselectstart = fabric.util.falseFunction;
      }
      if (selectProp) {
        element.style[selectProp] = 'none';
      } else if (typeof element.unselectable === 'string') {
        element.unselectable = 'on';
      }
      return element;
    }

    /**
     * Makes element selectable
     * @memberOf fabric.util
     * @param {HTMLElement} element Element to make selectable
     * @return {HTMLElement} Element that was passed in
     */
    function makeElementSelectable(element) {
      if (typeof element.onselectstart !== 'undefined') {
        element.onselectstart = null;
      }
      if (selectProp) {
        element.style[selectProp] = '';
      } else if (typeof element.unselectable === 'string') {
        element.unselectable = '';
      }
      return element;
    }

    fabric.util.makeElementUnselectable = makeElementUnselectable;
    fabric.util.makeElementSelectable = makeElementSelectable;
  })();

  (function () {
    /**
     * Inserts a script element with a given url into a document; invokes callback, when that script is finished loading
     * @memberOf fabric.util
     * @param {String} url URL of a script to load
     * @param {Function} callback Callback to execute when script is finished loading
     */
    function getScript(url, callback) {
      var headEl = fabric.document.getElementsByTagName('head')[0],
        scriptEl = fabric.document.createElement('script'),
        loading = true;

      /** @ignore */
      scriptEl.onload = /** @ignore */ scriptEl.onreadystatechange = function (
        e
      ) {
        if (loading) {
          if (
            typeof this.readyState === 'string' &&
            this.readyState !== 'loaded' &&
            this.readyState !== 'complete'
          ) {
            return;
          }
          loading = false;
          callback(e || fabric.window.event);
          scriptEl = scriptEl.onload = scriptEl.onreadystatechange = null;
        }
      };
      scriptEl.src = url;
      headEl.appendChild(scriptEl);
      // causes issue in Opera
      // headEl.removeChild(scriptEl);
    }

    fabric.util.getScript = getScript;
  })();

  function getNodeCanvas(element) {
    var impl = fabric.jsdomImplForWrapper(element);
    return impl._canvas || impl._image;
  }

  function cleanUpJsdomNode(element) {
    if (!fabric.isLikelyNode) {
      return;
    }
    var impl = fabric.jsdomImplForWrapper(element);
    if (impl) {
      impl._image = null;
      impl._canvas = null;
      // unsure if necessary
      impl._currentSrc = null;
      impl._attributes = null;
      impl._classList = null;
    }
  }

  fabric.util.getById = getById;
  fabric.util.toArray = toArray;
  fabric.util.makeElement = makeElement;
  fabric.util.addClass = addClass;
  fabric.util.wrapElement = wrapElement;
  fabric.util.getScrollLeftTop = getScrollLeftTop;
  fabric.util.getElementOffset = getElementOffset;
  fabric.util.getElementStyle = getElementStyle;
  fabric.util.getNodeCanvas = getNodeCanvas;
  fabric.util.cleanUpJsdomNode = cleanUpJsdomNode;
})();
/**
 * Wrapper around `console.log` (when available)
 * @param {*} [values] Values to log
 */
fabric.log = console.log;

/**
 * Wrapper around `console.warn` (when available)
 * @param {*} [values] Values to log as a warning
 */
fabric.warn = console.warn;
(function () {
  function noop() {
    return false;
  }

  function defaultEasing(t, b, c, d) {
    return -c * Math.cos((t / d) * (Math.PI / 2)) + c + b;
  }

  /**
   * Changes value from one to another within certain period of time, invoking callbacks as value is being changed.
   * @memberOf fabric.util
   * @param {Object} [options] Animation options
   * @param {Function} [options.onChange] Callback; invoked on every value change
   * @param {Function} [options.onComplete] Callback; invoked when value change is completed
   * @param {Number} [options.startValue=0] Starting value
   * @param {Number} [options.endValue=100] Ending value
   * @param {Number} [options.byValue=100] Value to modify the property by
   * @param {Function} [options.easing] Easing function
   * @param {Number} [options.duration=500] Duration of change (in ms)
   * @param {Function} [options.abort] Additional function with logic. If returns true, onComplete is called.
   */
  function animate(options) {
    requestAnimFrame(function (timestamp) {
      options || (options = {});

      var start = timestamp || +new Date(),
        duration = options.duration || 500,
        finish = start + duration,
        time,
        onChange = options.onChange || noop,
        abort = options.abort || noop,
        onComplete = options.onComplete || noop,
        easing = options.easing || defaultEasing,
        startValue = 'startValue' in options ? options.startValue : 0,
        endValue = 'endValue' in options ? options.endValue : 100,
        byValue = options.byValue || endValue - startValue;

      options.onStart && options.onStart();

      (function tick(ticktime) {
        // TODO: move abort call after calculation
        // and pass (current,valuePerc, timePerc) as arguments
        time = ticktime || +new Date();
        var currentTime = time > finish ? duration : time - start,
          timePerc = currentTime / duration,
          current = easing(currentTime, startValue, byValue, duration),
          valuePerc = Math.abs((current - startValue) / byValue);
        if (abort()) {
          onComplete(endValue, 1, 1);
          return;
        }
        if (time > finish) {
          onChange(endValue, 1, 1);
          onComplete(endValue, 1, 1);
          return;
        } else {
          onChange(current, valuePerc, timePerc);
          requestAnimFrame(tick);
        }
      })(start);
    });
  }

  var _requestAnimFrame =
    fabric.window.requestAnimationFrame ||
    fabric.window.webkitRequestAnimationFrame ||
    fabric.window.mozRequestAnimationFrame ||
    fabric.window.oRequestAnimationFrame ||
    fabric.window.msRequestAnimationFrame ||
    function (callback) {
      return fabric.window.setTimeout(callback, 1000 / 60);
    };

  var _cancelAnimFrame =
    fabric.window.cancelAnimationFrame || fabric.window.clearTimeout;

  /**
   * requestAnimationFrame polyfill based on http://paulirish.com/2011/requestanimationframe-for-smart-animating/
   * In order to get a precise start time, `requestAnimFrame` should be called as an entry into the method
   * @memberOf fabric.util
   * @param {Function} callback Callback to invoke
   * @param {DOMElement} element optional Element to associate with animation
   */
  function requestAnimFrame() {
    return _requestAnimFrame.apply(fabric.window, arguments);
  }

  function cancelAnimFrame() {
    return _cancelAnimFrame.apply(fabric.window, arguments);
  }

  fabric.util.animate = animate;
  fabric.util.requestAnimFrame = requestAnimFrame;
  fabric.util.cancelAnimFrame = cancelAnimFrame;
})();
(function () {
  // Calculate an in-between color. Returns a "rgba()" string.
  // Credit: Edwin Martin <edwin@bitstorm.org>
  //         http://www.bitstorm.org/jquery/color-animation/jquery.animate-colors.js
  function calculateColor(begin, end, pos) {
    var color =
      'rgba(' +
      parseInt(begin[0] + pos * (end[0] - begin[0]), 10) +
      ',' +
      parseInt(begin[1] + pos * (end[1] - begin[1]), 10) +
      ',' +
      parseInt(begin[2] + pos * (end[2] - begin[2]), 10);

    color +=
      ',' +
      (begin && end ? parseFloat(begin[3] + pos * (end[3] - begin[3])) : 1);
    color += ')';
    return color;
  }

  /**
   * Changes the color from one to another within certain period of time, invoking callbacks as value is being changed.
   * @memberOf fabric.util
   * @param {String} fromColor The starting color in hex or rgb(a) format.
   * @param {String} toColor The starting color in hex or rgb(a) format.
   * @param {Number} [duration] Duration of change (in ms).
   * @param {Object} [options] Animation options
   * @param {Function} [options.onChange] Callback; invoked on every value change
   * @param {Function} [options.onComplete] Callback; invoked when value change is completed
   * @param {Function} [options.colorEasing] Easing function. Note that this function only take two arguments (currentTime, duration). Thus the regular animation easing functions cannot be used.
   * @param {Function} [options.abort] Additional function with logic. If returns true, onComplete is called.
   */
  function animateColor(fromColor, toColor, duration, options) {
    var startColor = new fabric.Color(fromColor).getSource(),
      endColor = new fabric.Color(toColor).getSource();

    options = options || {};

    fabric.util.animate(
      fabric.util.object.extend(options, {
        duration: duration || 500,
        startValue: startColor,
        endValue: endColor,
        byValue: endColor,
        easing: function (currentTime, startValue, byValue, duration) {
          var posValue = options.colorEasing
            ? options.colorEasing(currentTime, duration)
            : 1 - Math.cos((currentTime / duration) * (Math.PI / 2));
          return calculateColor(startValue, byValue, posValue);
        },
      })
    );
  }

  fabric.util.animateColor = animateColor;
})();
(function initEasingUtilities() {
  function normalize(a, c, p, s) {
    if (a < Math.abs(c)) {
      a = c;
      s = p / 4;
    } else {
      //handle the 0/0 case:
      if (c === 0 && a === 0) {
        s = (p / (2 * Math.PI)) * Math.asin(1);
      } else {
        s = (p / (2 * Math.PI)) * Math.asin(c / a);
      }
    }
    return { a: a, c: c, p: p, s: s };
  }

  function elastic(opts, t, d) {
    return (
      opts.a *
      Math.pow(2, 10 * (t -= 1)) *
      Math.sin(((t * d - opts.s) * (2 * Math.PI)) / opts.p)
    );
  }

  /**
   * Cubic easing out
   * @memberOf fabric.util.ease
   */
  function easeOutCubic(t, b, c, d) {
    return c * ((t = t / d - 1) * t * t + 1) + b;
  }

  /**
   * Cubic easing in and out
   * @memberOf fabric.util.ease
   */
  function easeInOutCubic(t, b, c, d) {
    t /= d / 2;
    if (t < 1) {
      return (c / 2) * t * t * t + b;
    }
    return (c / 2) * ((t -= 2) * t * t + 2) + b;
  }

  /**
   * Quartic easing in
   * @memberOf fabric.util.ease
   */
  function easeInQuart(t, b, c, d) {
    return c * (t /= d) * t * t * t + b;
  }

  /**
   * Quartic easing out
   * @memberOf fabric.util.ease
   */
  function easeOutQuart(t, b, c, d) {
    return -c * ((t = t / d - 1) * t * t * t - 1) + b;
  }

  /**
   * Quartic easing in and out
   * @memberOf fabric.util.ease
   */
  function easeInOutQuart(t, b, c, d) {
    t /= d / 2;
    if (t < 1) {
      return (c / 2) * t * t * t * t + b;
    }
    return (-c / 2) * ((t -= 2) * t * t * t - 2) + b;
  }

  /**
   * Quintic easing in
   * @memberOf fabric.util.ease
   */
  function easeInQuint(t, b, c, d) {
    return c * (t /= d) * t * t * t * t + b;
  }

  /**
   * Quintic easing out
   * @memberOf fabric.util.ease
   */
  function easeOutQuint(t, b, c, d) {
    return c * ((t = t / d - 1) * t * t * t * t + 1) + b;
  }

  /**
   * Quintic easing in and out
   * @memberOf fabric.util.ease
   */
  function easeInOutQuint(t, b, c, d) {
    t /= d / 2;
    if (t < 1) {
      return (c / 2) * t * t * t * t * t + b;
    }
    return (c / 2) * ((t -= 2) * t * t * t * t + 2) + b;
  }

  /**
   * Sinusoidal easing in
   * @memberOf fabric.util.ease
   */
  function easeInSine(t, b, c, d) {
    return -c * Math.cos((t / d) * (Math.PI / 2)) + c + b;
  }

  /**
   * Sinusoidal easing out
   * @memberOf fabric.util.ease
   */
  function easeOutSine(t, b, c, d) {
    return c * Math.sin((t / d) * (Math.PI / 2)) + b;
  }

  /**
   * Sinusoidal easing in and out
   * @memberOf fabric.util.ease
   */
  function easeInOutSine(t, b, c, d) {
    return (-c / 2) * (Math.cos((Math.PI * t) / d) - 1) + b;
  }

  /**
   * Exponential easing in
   * @memberOf fabric.util.ease
   */
  function easeInExpo(t, b, c, d) {
    return t === 0 ? b : c * Math.pow(2, 10 * (t / d - 1)) + b;
  }

  /**
   * Exponential easing out
   * @memberOf fabric.util.ease
   */
  function easeOutExpo(t, b, c, d) {
    return t === d ? b + c : c * (-Math.pow(2, (-10 * t) / d) + 1) + b;
  }

  /**
   * Exponential easing in and out
   * @memberOf fabric.util.ease
   */
  function easeInOutExpo(t, b, c, d) {
    if (t === 0) {
      return b;
    }
    if (t === d) {
      return b + c;
    }
    t /= d / 2;
    if (t < 1) {
      return (c / 2) * Math.pow(2, 10 * (t - 1)) + b;
    }
    return (c / 2) * (-Math.pow(2, -10 * --t) + 2) + b;
  }

  /**
   * Circular easing in
   * @memberOf fabric.util.ease
   */
  function easeInCirc(t, b, c, d) {
    return -c * (Math.sqrt(1 - (t /= d) * t) - 1) + b;
  }

  /**
   * Circular easing out
   * @memberOf fabric.util.ease
   */
  function easeOutCirc(t, b, c, d) {
    return c * Math.sqrt(1 - (t = t / d - 1) * t) + b;
  }

  /**
   * Circular easing in and out
   * @memberOf fabric.util.ease
   */
  function easeInOutCirc(t, b, c, d) {
    t /= d / 2;
    if (t < 1) {
      return (-c / 2) * (Math.sqrt(1 - t * t) - 1) + b;
    }
    return (c / 2) * (Math.sqrt(1 - (t -= 2) * t) + 1) + b;
  }

  /**
   * Elastic easing in
   * @memberOf fabric.util.ease
   */
  function easeInElastic(t, b, c, d) {
    var s = 1.70158,
      p = 0,
      a = c;
    if (t === 0) {
      return b;
    }
    t /= d;
    if (t === 1) {
      return b + c;
    }
    if (!p) {
      p = d * 0.3;
    }
    var opts = normalize(a, c, p, s);
    return -elastic(opts, t, d) + b;
  }

  /**
   * Elastic easing out
   * @memberOf fabric.util.ease
   */
  function easeOutElastic(t, b, c, d) {
    var s = 1.70158,
      p = 0,
      a = c;
    if (t === 0) {
      return b;
    }
    t /= d;
    if (t === 1) {
      return b + c;
    }
    if (!p) {
      p = d * 0.3;
    }
    var opts = normalize(a, c, p, s);
    return (
      opts.a *
        Math.pow(2, -10 * t) *
        Math.sin(((t * d - opts.s) * (2 * Math.PI)) / opts.p) +
      opts.c +
      b
    );
  }

  /**
   * Elastic easing in and out
   * @memberOf fabric.util.ease
   */
  function easeInOutElastic(t, b, c, d) {
    var s = 1.70158,
      p = 0,
      a = c;
    if (t === 0) {
      return b;
    }
    t /= d / 2;
    if (t === 2) {
      return b + c;
    }
    if (!p) {
      p = d * (0.3 * 1.5);
    }
    var opts = normalize(a, c, p, s);
    if (t < 1) {
      return -0.5 * elastic(opts, t, d) + b;
    }
    return (
      opts.a *
        Math.pow(2, -10 * (t -= 1)) *
        Math.sin(((t * d - opts.s) * (2 * Math.PI)) / opts.p) *
        0.5 +
      opts.c +
      b
    );
  }

  /**
   * Backwards easing in
   * @memberOf fabric.util.ease
   */
  function easeInBack(t, b, c, d, s) {
    if (s === undefined) {
      s = 1.70158;
    }
    return c * (t /= d) * t * ((s + 1) * t - s) + b;
  }

  /**
   * Backwards easing out
   * @memberOf fabric.util.ease
   */
  function easeOutBack(t, b, c, d, s) {
    if (s === undefined) {
      s = 1.70158;
    }
    return c * ((t = t / d - 1) * t * ((s + 1) * t + s) + 1) + b;
  }

  /**
   * Backwards easing in and out
   * @memberOf fabric.util.ease
   */
  function easeInOutBack(t, b, c, d, s) {
    if (s === undefined) {
      s = 1.70158;
    }
    t /= d / 2;
    if (t < 1) {
      return (c / 2) * (t * t * (((s *= 1.525) + 1) * t - s)) + b;
    }
    return (c / 2) * ((t -= 2) * t * (((s *= 1.525) + 1) * t + s) + 2) + b;
  }

  /**
   * Bouncing easing in
   * @memberOf fabric.util.ease
   */
  function easeInBounce(t, b, c, d) {
    return c - easeOutBounce(d - t, 0, c, d) + b;
  }

  /**
   * Bouncing easing out
   * @memberOf fabric.util.ease
   */
  function easeOutBounce(t, b, c, d) {
    if ((t /= d) < 1 / 2.75) {
      return c * (7.5625 * t * t) + b;
    } else if (t < 2 / 2.75) {
      return c * (7.5625 * (t -= 1.5 / 2.75) * t + 0.75) + b;
    } else if (t < 2.5 / 2.75) {
      return c * (7.5625 * (t -= 2.25 / 2.75) * t + 0.9375) + b;
    } else {
      return c * (7.5625 * (t -= 2.625 / 2.75) * t + 0.984375) + b;
    }
  }

  /**
   * Bouncing easing in and out
   * @memberOf fabric.util.ease
   */
  function easeInOutBounce(t, b, c, d) {
    if (t < d / 2) {
      return easeInBounce(t * 2, 0, c, d) * 0.5 + b;
    }
    return easeOutBounce(t * 2 - d, 0, c, d) * 0.5 + c * 0.5 + b;
  }

  /**
   * Easing functions
   * See <a href="http://gizma.com/easing/">Easing Equations by Robert Penner</a>
   * @namespace fabric.util.ease
   */
  fabric.util.ease = {
    /**
     * Quadratic easing in
     * @memberOf fabric.util.ease
     */
    easeInQuad: function (t, b, c, d) {
      return c * (t /= d) * t + b;
    },

    /**
     * Quadratic easing out
     * @memberOf fabric.util.ease
     */
    easeOutQuad: function (t, b, c, d) {
      return -c * (t /= d) * (t - 2) + b;
    },

    /**
     * Quadratic easing in and out
     * @memberOf fabric.util.ease
     */
    easeInOutQuad: function (t, b, c, d) {
      t /= d / 2;
      if (t < 1) {
        return (c / 2) * t * t + b;
      }
      return (-c / 2) * (--t * (t - 2) - 1) + b;
    },

    /**
     * Cubic easing in
     * @memberOf fabric.util.ease
     */
    easeInCubic: function (t, b, c, d) {
      return c * (t /= d) * t * t + b;
    },

    easeOutCubic: easeOutCubic,
    easeInOutCubic: easeInOutCubic,
    easeInQuart: easeInQuart,
    easeOutQuart: easeOutQuart,
    easeInOutQuart: easeInOutQuart,
    easeInQuint: easeInQuint,
    easeOutQuint: easeOutQuint,
    easeInOutQuint: easeInOutQuint,
    easeInSine: easeInSine,
    easeOutSine: easeOutSine,
    easeInOutSine: easeInOutSine,
    easeInExpo: easeInExpo,
    easeOutExpo: easeOutExpo,
    easeInOutExpo: easeInOutExpo,
    easeInCirc: easeInCirc,
    easeOutCirc: easeOutCirc,
    easeInOutCirc: easeInOutCirc,
    easeInElastic: easeInElastic,
    easeOutElastic: easeOutElastic,
    easeInOutElastic: easeInOutElastic,
    easeInBack: easeInBack,
    easeOutBack: easeOutBack,
    easeInOutBack: easeInOutBack,
    easeInBounce: easeInBounce,
    easeOutBounce: easeOutBounce,
    easeInOutBounce: easeInOutBounce,
  };
})();
(function initPoint(global) {
  /* Adaptation of work of Kevin Lindsey (kevin@kevlindev.com) */

  var fabric = global.fabric || (global.fabric = {});

  if (fabric.Point) {
    fabric.warn('fabric.Point is already defined');
    return;
  }

  fabric.Point = Point;

  /**
   * Point class
   * @class fabric.Point
   * @memberOf fabric
   * @constructor
   * @param {Number} x
   * @param {Number} y
   * @return {fabric.Point} thisArg
   */
  function Point(x, y) {
    this.x = x;
    this.y = y;
  }

  Point.prototype = /** @lends fabric.Point.prototype */ {
    type: 'point',

    constructor: Point,

    /**
     * Adds another point to this one and returns another one
     * @param {fabric.Point} that
     * @return {fabric.Point} new Point instance with added values
     */
    add: function (that) {
      return new Point(this.x + that.x, this.y + that.y);
    },

    /**
     * Adds another point to this one
     * @param {fabric.Point} that
     * @return {fabric.Point} thisArg
     * @chainable
     */
    addEquals: function (that) {
      this.x += that.x;
      this.y += that.y;
      return this;
    },

    /**
     * Adds value to this point and returns a new one
     * @param {Number} scalar
     * @return {fabric.Point} new Point with added value
     */
    scalarAdd: function (scalar) {
      return new Point(this.x + scalar, this.y + scalar);
    },

    /**
     * Adds value to this point
     * @param {Number} scalar
     * @return {fabric.Point} thisArg
     * @chainable
     */
    scalarAddEquals: function (scalar) {
      this.x += scalar;
      this.y += scalar;
      return this;
    },

    /**
     * Subtracts another point from this point and returns a new one
     * @param {fabric.Point} that
     * @return {fabric.Point} new Point object with subtracted values
     */
    subtract: function (that) {
      return new Point(this.x - that.x, this.y - that.y);
    },

    /**
     * Subtracts another point from this point
     * @param {fabric.Point} that
     * @return {fabric.Point} thisArg
     * @chainable
     */
    subtractEquals: function (that) {
      this.x -= that.x;
      this.y -= that.y;
      return this;
    },

    /**
     * Subtracts value from this point and returns a new one
     * @param {Number} scalar
     * @return {fabric.Point}
     */
    scalarSubtract: function (scalar) {
      return new Point(this.x - scalar, this.y - scalar);
    },

    /**
     * Subtracts value from this point
     * @param {Number} scalar
     * @return {fabric.Point} thisArg
     * @chainable
     */
    scalarSubtractEquals: function (scalar) {
      this.x -= scalar;
      this.y -= scalar;
      return this;
    },

    /**
     * Multiplies this point by a value and returns a new one
     * TODO: rename in scalarMultiply in 2.0
     * @param {Number} scalar
     * @return {fabric.Point}
     */
    multiply: function (scalar) {
      return new Point(this.x * scalar, this.y * scalar);
    },

    /**
     * Multiplies this point by a value
     * TODO: rename in scalarMultiplyEquals in 2.0
     * @param {Number} scalar
     * @return {fabric.Point} thisArg
     * @chainable
     */
    multiplyEquals: function (scalar) {
      this.x *= scalar;
      this.y *= scalar;
      return this;
    },

    /**
     * Divides this point by a value and returns a new one
     * TODO: rename in scalarDivide in 2.0
     * @param {Number} scalar
     * @return {fabric.Point}
     */
    divide: function (scalar) {
      return new Point(this.x / scalar, this.y / scalar);
    },

    /**
     * Divides this point by a value
     * TODO: rename in scalarDivideEquals in 2.0
     * @param {Number} scalar
     * @return {fabric.Point} thisArg
     * @chainable
     */
    divideEquals: function (scalar) {
      this.x /= scalar;
      this.y /= scalar;
      return this;
    },

    /**
     * Returns true if this point is equal to another one
     * @param {fabric.Point} that
     * @return {Boolean}
     */
    eq: function (that) {
      return this.x === that.x && this.y === that.y;
    },

    /**
     * Returns true if this point is less than another one
     * @param {fabric.Point} that
     * @return {Boolean}
     */
    lt: function (that) {
      return this.x < that.x && this.y < that.y;
    },

    /**
     * Returns true if this point is less than or equal to another one
     * @param {fabric.Point} that
     * @return {Boolean}
     */
    lte: function (that) {
      return this.x <= that.x && this.y <= that.y;
    },

    /**

     * Returns true if this point is greater another one
     * @param {fabric.Point} that
     * @return {Boolean}
     */
    gt: function (that) {
      return this.x > that.x && this.y > that.y;
    },

    /**
     * Returns true if this point is greater than or equal to another one
     * @param {fabric.Point} that
     * @return {Boolean}
     */
    gte: function (that) {
      return this.x >= that.x && this.y >= that.y;
    },

    /**
     * Returns new point which is the result of linear interpolation with this one and another one
     * @param {fabric.Point} that
     * @param {Number} t , position of interpolation, between 0 and 1 default 0.5
     * @return {fabric.Point}
     */
    lerp: function (that, t) {
      if (typeof t === 'undefined') {
        t = 0.5;
      }
      t = Math.max(Math.min(1, t), 0);
      return new Point(
        this.x + (that.x - this.x) * t,
        this.y + (that.y - this.y) * t
      );
    },

    /**
     * Returns distance from this point and another one
     * @param {fabric.Point} that
     * @return {Number}
     */
    distanceFrom: function (that) {
      var dx = this.x - that.x,
        dy = this.y - that.y;
      return Math.sqrt(dx * dx + dy * dy);
    },

    /**
     * Returns the point between this point and another one
     * @param {fabric.Point} that
     * @return {fabric.Point}
     */
    midPointFrom: function (that) {
      return this.lerp(that);
    },

    /**
     * Returns a new point which is the min of this and another one
     * @param {fabric.Point} that
     * @return {fabric.Point}
     */
    min: function (that) {
      return new Point(Math.min(this.x, that.x), Math.min(this.y, that.y));
    },

    /**
     * Returns a new point which is the max of this and another one
     * @param {fabric.Point} that
     * @return {fabric.Point}
     */
    max: function (that) {
      return new Point(Math.max(this.x, that.x), Math.max(this.y, that.y));
    },

    /**
     * Returns string representation of this point
     * @return {String}
     */
    toString: function () {
      return this.x + ',' + this.y;
    },

    /**
     * Sets x/y of this point
     * @param {Number} x
     * @param {Number} y
     * @chainable
     */
    setXY: function (x, y) {
      this.x = x;
      this.y = y;
      return this;
    },

    /**
     * Sets x of this point
     * @param {Number} x
     * @chainable
     */
    setX: function (x) {
      this.x = x;
      return this;
    },

    /**
     * Sets y of this point
     * @param {Number} y
     * @chainable
     */
    setY: function (y) {
      this.y = y;
      return this;
    },

    /**
     * Sets x/y of this point from another point
     * @param {fabric.Point} that
     * @chainable
     */
    setFromPoint: function (that) {
      this.x = that.x;
      this.y = that.y;
      return this;
    },

    /**
     * Swaps x/y of this point and another point
     * @param {fabric.Point} that
     */
    swap: function (that) {
      var x = this.x,
        y = this.y;
      this.x = that.x;
      this.y = that.y;
      that.x = x;
      that.y = y;
    },

    /**
     * return a cloned instance of the point
     * @return {fabric.Point}
     */
    clone: function () {
      return new Point(this.x, this.y);
    },
  };
})(typeof exports !== 'undefined' ? exports : this);
(function initIntersection(global) {
  /* Adaptation of work of Kevin Lindsey (kevin@kevlindev.com) */
  var fabric = global.fabric || (global.fabric = {});

  if (fabric.Intersection) {
    fabric.warn('fabric.Intersection is already defined');
    return;
  }

  /**
   * Intersection class
   * @class fabric.Intersection
   * @memberOf fabric
   * @constructor
   */
  function Intersection(status) {
    this.status = status;
    this.points = [];
  }

  fabric.Intersection = Intersection;

  fabric.Intersection.prototype = /** @lends fabric.Intersection.prototype */ {
    constructor: Intersection,

    /**
     * Appends a point to intersection
     * @param {fabric.Point} point
     * @return {fabric.Intersection} thisArg
     * @chainable
     */
    appendPoint: function (point) {
      this.points.push(point);
      return this;
    },

    /**
     * Appends points to intersection
     * @param {Array} points
     * @return {fabric.Intersection} thisArg
     * @chainable
     */
    appendPoints: function (points) {
      this.points = this.points.concat(points);
      return this;
    },
  };

  /**
   * Checks if one line intersects another
   * TODO: rename in intersectSegmentSegment
   * @static
   * @param {fabric.Point} a1
   * @param {fabric.Point} a2
   * @param {fabric.Point} b1
   * @param {fabric.Point} b2
   * @return {fabric.Intersection}
   */
  fabric.Intersection.intersectLineLine = function (a1, a2, b1, b2) {
    var result,
      uaT = (b2.x - b1.x) * (a1.y - b1.y) - (b2.y - b1.y) * (a1.x - b1.x),
      ubT = (a2.x - a1.x) * (a1.y - b1.y) - (a2.y - a1.y) * (a1.x - b1.x),
      uB = (b2.y - b1.y) * (a2.x - a1.x) - (b2.x - b1.x) * (a2.y - a1.y);
    if (uB !== 0) {
      var ua = uaT / uB,
        ub = ubT / uB;
      if (0 <= ua && ua <= 1 && 0 <= ub && ub <= 1) {
        result = new Intersection('Intersection');
        result.appendPoint(
          new fabric.Point(a1.x + ua * (a2.x - a1.x), a1.y + ua * (a2.y - a1.y))
        );
      } else {
        result = new Intersection();
      }
    } else {
      if (uaT === 0 || ubT === 0) {
        result = new Intersection('Coincident');
      } else {
        result = new Intersection('Parallel');
      }
    }
    return result;
  };

  /**
   * Checks if line intersects polygon
   * TODO: rename in intersectSegmentPolygon
   * fix detection of coincident
   * @static
   * @param {fabric.Point} a1
   * @param {fabric.Point} a2
   * @param {Array} points
   * @return {fabric.Intersection}
   */
  fabric.Intersection.intersectLinePolygon = function (a1, a2, points) {
    var result = new Intersection(),
      length = points.length,
      b1,
      b2,
      inter,
      i;

    for (i = 0; i < length; i++) {
      b1 = points[i];
      b2 = points[(i + 1) % length];
      inter = Intersection.intersectLineLine(a1, a2, b1, b2);

      result.appendPoints(inter.points);
    }
    if (result.points.length > 0) {
      result.status = 'Intersection';
    }
    return result;
  };

  /**
   * Checks if polygon intersects another polygon
   * @static
   * @param {Array} points1
   * @param {Array} points2
   * @return {fabric.Intersection}
   */
  fabric.Intersection.intersectPolygonPolygon = function (points1, points2) {
    var result = new Intersection(),
      length = points1.length,
      i;

    for (i = 0; i < length; i++) {
      var a1 = points1[i],
        a2 = points1[(i + 1) % length],
        inter = Intersection.intersectLinePolygon(a1, a2, points2);

      result.appendPoints(inter.points);
    }
    if (result.points.length > 0) {
      result.status = 'Intersection';
    }
    return result;
  };

  /**
   * Checks if polygon intersects rectangle
   * @static
   * @param {Array} points
   * @param {fabric.Point} r1
   * @param {fabric.Point} r2
   * @return {fabric.Intersection}
   */
  fabric.Intersection.intersectPolygonRectangle = function (points, r1, r2) {
    var min = r1.min(r2),
      max = r1.max(r2),
      topRight = new fabric.Point(max.x, min.y),
      bottomLeft = new fabric.Point(min.x, max.y),
      inter1 = Intersection.intersectLinePolygon(min, topRight, points),
      inter2 = Intersection.intersectLinePolygon(topRight, max, points),
      inter3 = Intersection.intersectLinePolygon(max, bottomLeft, points),
      inter4 = Intersection.intersectLinePolygon(bottomLeft, min, points),
      result = new Intersection();

    result.appendPoints(inter1.points);
    result.appendPoints(inter2.points);
    result.appendPoints(inter3.points);
    result.appendPoints(inter4.points);

    if (result.points.length > 0) {
      result.status = 'Intersection';
    }
    return result;
  };
})(typeof exports !== 'undefined' ? exports : this);
(function initColor(global) {
  var fabric = global.fabric || (global.fabric = {});

  if (fabric.Color) {
    fabric.warn('fabric.Color is already defined.');
    return;
  }

  /**
   * Color class
   * The purpose of {@link fabric.Color} is to abstract and encapsulate common color operations;
   * {@link fabric.Color} is a constructor and creates instances of {@link fabric.Color} objects.
   *
   * @class fabric.Color
   * @param {String} color optional in hex or rgb(a) or hsl format or from known color list
   * @return {fabric.Color} thisArg
   * @tutorial {@link http://fabricjs.com/fabric-intro-part-2/#colors}
   */
  function Color(color) {
    if (!color) {
      this.setSource([0, 0, 0, 1]);
    } else {
      this._tryParsingColor(color);
    }
  }

  fabric.Color = Color;

  fabric.Color.prototype = /** @lends fabric.Color.prototype */ {
    /**
     * @private
     * @param {String|Array} color Color value to parse
     */
    _tryParsingColor: function (color) {
      var source;

      if (color in Color.colorNameMap) {
        color = Color.colorNameMap[color];
      }

      if (color === 'transparent') {
        source = [255, 255, 255, 0];
      }

      if (!source) {
        source = Color.sourceFromHex(color);
      }
      if (!source) {
        source = Color.sourceFromRgb(color);
      }
      if (!source) {
        source = Color.sourceFromHsl(color);
      }
      if (!source) {
        //if color is not recognize let's make black as canvas does
        source = [0, 0, 0, 1];
      }
      if (source) {
        this.setSource(source);
      }
    },

    /**
     * Adapted from <a href="https://rawgithub.com/mjijackson/mjijackson.github.com/master/2008/02/rgb-to-hsl-and-rgb-to-hsv-color-model-conversion-algorithms-in-javascript.html">https://github.com/mjijackson</a>
     * @private
     * @param {Number} r Red color value
     * @param {Number} g Green color value
     * @param {Number} b Blue color value
     * @return {Array} Hsl color
     */
    _rgbToHsl: function (r, g, b) {
      r /= 255;
      g /= 255;
      b /= 255;

      var h,
        s,
        l,
        max = fabric.util.array.max([r, g, b]),
        min = fabric.util.array.min([r, g, b]);

      l = (max + min) / 2;

      if (max === min) {
        h = s = 0; // achromatic
      } else {
        var d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
          case r:
            h = (g - b) / d + (g < b ? 6 : 0);
            break;
          case g:
            h = (b - r) / d + 2;
            break;
          case b:
            h = (r - g) / d + 4;
            break;
          default:
            break;
        }
        h /= 6;
      }

      return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)];
    },

    /**
     * Returns source of this color (where source is an array representation; ex: [200, 200, 100, 1])
     * @return {Array}
     */
    getSource: function () {
      return this._source;
    },

    /**
     * Sets source of this color (where source is an array representation; ex: [200, 200, 100, 1])
     * @param {Array} source
     */
    setSource: function (source) {
      this._source = source;
    },

    /**
     * Returns color representation in RGB format
     * @return {String} ex: rgb(0-255,0-255,0-255)
     */
    toRgb: function () {
      var source = this.getSource();
      return 'rgb(' + source[0] + ',' + source[1] + ',' + source[2] + ')';
    },

    /**
     * Returns color representation in RGBA format
     * @return {String} ex: rgba(0-255,0-255,0-255,0-1)
     */
    toRgba: function () {
      var source = this.getSource();
      return (
        'rgba(' +
        source[0] +
        ',' +
        source[1] +
        ',' +
        source[2] +
        ',' +
        source[3] +
        ')'
      );
    },

    /**
     * Returns color representation in HSL format
     * @return {String} ex: hsl(0-360,0%-100%,0%-100%)
     */
    toHsl: function () {
      var source = this.getSource(),
        hsl = this._rgbToHsl(source[0], source[1], source[2]);

      return 'hsl(' + hsl[0] + ',' + hsl[1] + '%,' + hsl[2] + '%)';
    },

    /**
     * Returns color representation in HSLA format
     * @return {String} ex: hsla(0-360,0%-100%,0%-100%,0-1)
     */
    toHsla: function () {
      var source = this.getSource(),
        hsl = this._rgbToHsl(source[0], source[1], source[2]);

      return (
        'hsla(' + hsl[0] + ',' + hsl[1] + '%,' + hsl[2] + '%,' + source[3] + ')'
      );
    },

    /**
     * Returns color representation in HEX format
     * @return {String} ex: FF5555
     */
    toHex: function () {
      var source = this.getSource(),
        r,
        g,
        b;

      r = source[0].toString(16);
      r = r.length === 1 ? '0' + r : r;

      g = source[1].toString(16);
      g = g.length === 1 ? '0' + g : g;

      b = source[2].toString(16);
      b = b.length === 1 ? '0' + b : b;

      return r.toUpperCase() + g.toUpperCase() + b.toUpperCase();
    },

    /**
     * Returns color representation in HEXA format
     * @return {String} ex: FF5555CC
     */
    toHexa: function () {
      var source = this.getSource(),
        a;

      a = Math.round(source[3] * 255);
      a = a.toString(16);
      a = a.length === 1 ? '0' + a : a;

      return this.toHex() + a.toUpperCase();
    },

    /**
     * Gets value of alpha channel for this color
     * @return {Number} 0-1
     */
    getAlpha: function () {
      return this.getSource()[3];
    },

    /**
     * Sets value of alpha channel for this color
     * @param {Number} alpha Alpha value 0-1
     * @return {fabric.Color} thisArg
     */
    setAlpha: function (alpha) {
      var source = this.getSource();
      source[3] = alpha;
      this.setSource(source);
      return this;
    },

    /**
     * Transforms color to its grayscale representation
     * @return {fabric.Color} thisArg
     */
    toGrayscale: function () {
      var source = this.getSource(),
        average = parseInt(
          (source[0] * 0.3 + source[1] * 0.59 + source[2] * 0.11).toFixed(0),
          10
        ),
        currentAlpha = source[3];
      this.setSource([average, average, average, currentAlpha]);
      return this;
    },

    /**
     * Transforms color to its black and white representation
     * @param {Number} threshold
     * @return {fabric.Color} thisArg
     */
    toBlackWhite: function (threshold) {
      var source = this.getSource(),
        average = (
          source[0] * 0.3 +
          source[1] * 0.59 +
          source[2] * 0.11
        ).toFixed(0),
        currentAlpha = source[3];

      threshold = threshold || 127;

      average = Number(average) < Number(threshold) ? 0 : 255;
      this.setSource([average, average, average, currentAlpha]);
      return this;
    },

    /**
     * Overlays color with another color
     * @param {String|fabric.Color} otherColor
     * @return {fabric.Color} thisArg
     */
    overlayWith: function (otherColor) {
      if (!(otherColor instanceof Color)) {
        otherColor = new Color(otherColor);
      }

      var result = [],
        alpha = this.getAlpha(),
        otherAlpha = 0.5,
        source = this.getSource(),
        otherSource = otherColor.getSource(),
        i;

      for (i = 0; i < 3; i++) {
        result.push(
          Math.round(source[i] * (1 - otherAlpha) + otherSource[i] * otherAlpha)
        );
      }

      result[3] = alpha;
      this.setSource(result);
      return this;
    },
  };

  /**
   * Regex matching color in RGB or RGBA formats (ex: rgb(0, 0, 0), rgba(255, 100, 10, 0.5), rgba( 255 , 100 , 10 , 0.5 ), rgb(1,1,1), rgba(100%, 60%, 10%, 0.5))
   * @static
   * @field
   * @memberOf fabric.Color
   */
  // eslint-disable-next-line max-len
  fabric.Color.reRGBa = /^rgba?\(\s*(\d{1,3}(?:\.\d+)?%?)\s*,\s*(\d{1,3}(?:\.\d+)?%?)\s*,\s*(\d{1,3}(?:\.\d+)?%?)\s*(?:\s*,\s*((?:\d*\.?\d+)?)\s*)?\)$/i;

  /**
   * Regex matching color in HSL or HSLA formats (ex: hsl(200, 80%, 10%), hsla(300, 50%, 80%, 0.5), hsla( 300 , 50% , 80% , 0.5 ))
   * @static
   * @field
   * @memberOf fabric.Color
   */
  fabric.Color.reHSLa = /^hsla?\(\s*(\d{1,3})\s*,\s*(\d{1,3}%)\s*,\s*(\d{1,3}%)\s*(?:\s*,\s*(\d+(?:\.\d+)?)\s*)?\)$/i;

  /**
   * Regex matching color in HEX format (ex: #FF5544CC, #FF5555, 010155, aff)
   * @static
   * @field
   * @memberOf fabric.Color
   */
  fabric.Color.reHex = /^#?([0-9a-f]{8}|[0-9a-f]{6}|[0-9a-f]{4}|[0-9a-f]{3})$/i;

  /**
   * Map of the 148 color names with HEX code
   * @static
   * @field
   * @memberOf fabric.Color
   * @see: https://www.w3.org/TR/css3-color/#svg-color
   */
  fabric.Color.colorNameMap = {
    aliceblue: '#F0F8FF',
    antiquewhite: '#FAEBD7',
    aqua: '#00FFFF',
    aquamarine: '#7FFFD4',
    azure: '#F0FFFF',
    beige: '#F5F5DC',
    bisque: '#FFE4C4',
    black: '#000000',
    blanchedalmond: '#FFEBCD',
    blue: '#0000FF',
    blueviolet: '#8A2BE2',
    brown: '#A52A2A',
    burlywood: '#DEB887',
    cadetblue: '#5F9EA0',
    chartreuse: '#7FFF00',
    chocolate: '#D2691E',
    coral: '#FF7F50',
    cornflowerblue: '#6495ED',
    cornsilk: '#FFF8DC',
    crimson: '#DC143C',
    cyan: '#00FFFF',
    darkblue: '#00008B',
    darkcyan: '#008B8B',
    darkgoldenrod: '#B8860B',
    darkgray: '#A9A9A9',
    darkgrey: '#A9A9A9',
    darkgreen: '#006400',
    darkkhaki: '#BDB76B',
    darkmagenta: '#8B008B',
    darkolivegreen: '#556B2F',
    darkorange: '#FF8C00',
    darkorchid: '#9932CC',
    darkred: '#8B0000',
    darksalmon: '#E9967A',
    darkseagreen: '#8FBC8F',
    darkslateblue: '#483D8B',
    darkslategray: '#2F4F4F',
    darkslategrey: '#2F4F4F',
    darkturquoise: '#00CED1',
    darkviolet: '#9400D3',
    deeppink: '#FF1493',
    deepskyblue: '#00BFFF',
    dimgray: '#696969',
    dimgrey: '#696969',
    dodgerblue: '#1E90FF',
    firebrick: '#B22222',
    floralwhite: '#FFFAF0',
    forestgreen: '#228B22',
    fuchsia: '#FF00FF',
    gainsboro: '#DCDCDC',
    ghostwhite: '#F8F8FF',
    gold: '#FFD700',
    goldenrod: '#DAA520',
    gray: '#808080',
    grey: '#808080',
    green: '#008000',
    greenyellow: '#ADFF2F',
    honeydew: '#F0FFF0',
    hotpink: '#FF69B4',
    indianred: '#CD5C5C',
    indigo: '#4B0082',
    ivory: '#FFFFF0',
    khaki: '#F0E68C',
    lavender: '#E6E6FA',
    lavenderblush: '#FFF0F5',
    lawngreen: '#7CFC00',
    lemonchiffon: '#FFFACD',
    lightblue: '#ADD8E6',
    lightcoral: '#F08080',
    lightcyan: '#E0FFFF',
    lightgoldenrodyellow: '#FAFAD2',
    lightgray: '#D3D3D3',
    lightgrey: '#D3D3D3',
    lightgreen: '#90EE90',
    lightpink: '#FFB6C1',
    lightsalmon: '#FFA07A',
    lightseagreen: '#20B2AA',
    lightskyblue: '#87CEFA',
    lightslategray: '#778899',
    lightslategrey: '#778899',
    lightsteelblue: '#B0C4DE',
    lightyellow: '#FFFFE0',
    lime: '#00FF00',
    limegreen: '#32CD32',
    linen: '#FAF0E6',
    magenta: '#FF00FF',
    maroon: '#800000',
    mediumaquamarine: '#66CDAA',
    mediumblue: '#0000CD',
    mediumorchid: '#BA55D3',
    mediumpurple: '#9370DB',
    mediumseagreen: '#3CB371',
    mediumslateblue: '#7B68EE',
    mediumspringgreen: '#00FA9A',
    mediumturquoise: '#48D1CC',
    mediumvioletred: '#C71585',
    midnightblue: '#191970',
    mintcream: '#F5FFFA',
    mistyrose: '#FFE4E1',
    moccasin: '#FFE4B5',
    navajowhite: '#FFDEAD',
    navy: '#000080',
    oldlace: '#FDF5E6',
    olive: '#808000',
    olivedrab: '#6B8E23',
    orange: '#FFA500',
    orangered: '#FF4500',
    orchid: '#DA70D6',
    palegoldenrod: '#EEE8AA',
    palegreen: '#98FB98',
    paleturquoise: '#AFEEEE',
    palevioletred: '#DB7093',
    papayawhip: '#FFEFD5',
    peachpuff: '#FFDAB9',
    peru: '#CD853F',
    pink: '#FFC0CB',
    plum: '#DDA0DD',
    powderblue: '#B0E0E6',
    purple: '#800080',
    rebeccapurple: '#663399',
    red: '#FF0000',
    rosybrown: '#BC8F8F',
    royalblue: '#4169E1',
    saddlebrown: '#8B4513',
    salmon: '#FA8072',
    sandybrown: '#F4A460',
    seagreen: '#2E8B57',
    seashell: '#FFF5EE',
    sienna: '#A0522D',
    silver: '#C0C0C0',
    skyblue: '#87CEEB',
    slateblue: '#6A5ACD',
    slategray: '#708090',
    slategrey: '#708090',
    snow: '#FFFAFA',
    springgreen: '#00FF7F',
    steelblue: '#4682B4',
    tan: '#D2B48C',
    teal: '#008080',
    thistle: '#D8BFD8',
    tomato: '#FF6347',
    turquoise: '#40E0D0',
    violet: '#EE82EE',
    wheat: '#F5DEB3',
    white: '#FFFFFF',
    whitesmoke: '#F5F5F5',
    yellow: '#FFFF00',
    yellowgreen: '#9ACD32',
  };

  /**
   * @private
   * @param {Number} p
   * @param {Number} q
   * @param {Number} t
   * @return {Number}
   */
  function hue2rgb(p, q, t) {
    if (t < 0) {
      t += 1;
    }
    if (t > 1) {
      t -= 1;
    }
    if (t < 1 / 6) {
      return p + (q - p) * 6 * t;
    }
    if (t < 1 / 2) {
      return q;
    }
    if (t < 2 / 3) {
      return p + (q - p) * (2 / 3 - t) * 6;
    }
    return p;
  }

  /**
   * Returns new color object, when given a color in RGB format
   * @memberOf fabric.Color
   * @param {String} color Color value ex: rgb(0-255,0-255,0-255)
   * @return {fabric.Color}
   */
  fabric.Color.fromRgb = function (color) {
    return Color.fromSource(Color.sourceFromRgb(color));
  };

  /**
   * Returns array representation (ex: [100, 100, 200, 1]) of a color that's in RGB or RGBA format
   * @memberOf fabric.Color
   * @param {String} color Color value ex: rgb(0-255,0-255,0-255), rgb(0%-100%,0%-100%,0%-100%)
   * @return {Array} source
   */
  fabric.Color.sourceFromRgb = function (color) {
    var match = color.match(Color.reRGBa);
    if (match) {
      var r =
          (parseInt(match[1], 10) / (/%$/.test(match[1]) ? 100 : 1)) *
          (/%$/.test(match[1]) ? 255 : 1),
        g =
          (parseInt(match[2], 10) / (/%$/.test(match[2]) ? 100 : 1)) *
          (/%$/.test(match[2]) ? 255 : 1),
        b =
          (parseInt(match[3], 10) / (/%$/.test(match[3]) ? 100 : 1)) *
          (/%$/.test(match[3]) ? 255 : 1);

      return [
        parseInt(r, 10),
        parseInt(g, 10),
        parseInt(b, 10),
        match[4] ? parseFloat(match[4]) : 1,
      ];
    }
  };

  /**
   * Returns new color object, when given a color in RGBA format
   * @static
   * @function
   * @memberOf fabric.Color
   * @param {String} color
   * @return {fabric.Color}
   */
  fabric.Color.fromRgba = Color.fromRgb;

  /**
   * Returns new color object, when given a color in HSL format
   * @param {String} color Color value ex: hsl(0-260,0%-100%,0%-100%)
   * @memberOf fabric.Color
   * @return {fabric.Color}
   */
  fabric.Color.fromHsl = function (color) {
    return Color.fromSource(Color.sourceFromHsl(color));
  };

  /**
   * Returns array representation (ex: [100, 100, 200, 1]) of a color that's in HSL or HSLA format.
   * Adapted from <a href="https://rawgithub.com/mjijackson/mjijackson.github.com/master/2008/02/rgb-to-hsl-and-rgb-to-hsv-color-model-conversion-algorithms-in-javascript.html">https://github.com/mjijackson</a>
   * @memberOf fabric.Color
   * @param {String} color Color value ex: hsl(0-360,0%-100%,0%-100%) or hsla(0-360,0%-100%,0%-100%, 0-1)
   * @return {Array} source
   * @see http://http://www.w3.org/TR/css3-color/#hsl-color
   */
  fabric.Color.sourceFromHsl = function (color) {
    var match = color.match(Color.reHSLa);
    if (!match) {
      return;
    }

    var h = (((parseFloat(match[1]) % 360) + 360) % 360) / 360,
      s = parseFloat(match[2]) / (/%$/.test(match[2]) ? 100 : 1),
      l = parseFloat(match[3]) / (/%$/.test(match[3]) ? 100 : 1),
      r,
      g,
      b;

    if (s === 0) {
      r = g = b = l;
    } else {
      var q = l <= 0.5 ? l * (s + 1) : l + s - l * s,
        p = l * 2 - q;

      r = hue2rgb(p, q, h + 1 / 3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1 / 3);
    }

    return [
      Math.round(r * 255),
      Math.round(g * 255),
      Math.round(b * 255),
      match[4] ? parseFloat(match[4]) : 1,
    ];
  };

  /**
   * Returns new color object, when given a color in HSLA format
   * @static
   * @function
   * @memberOf fabric.Color
   * @param {String} color
   * @return {fabric.Color}
   */
  fabric.Color.fromHsla = Color.fromHsl;

  /**
   * Returns new color object, when given a color in HEX format
   * @static
   * @memberOf fabric.Color
   * @param {String} color Color value ex: FF5555
   * @return {fabric.Color}
   */
  fabric.Color.fromHex = function (color) {
    return Color.fromSource(Color.sourceFromHex(color));
  };

  /**
   * Returns array representation (ex: [100, 100, 200, 1]) of a color that's in HEX format
   * @static
   * @memberOf fabric.Color
   * @param {String} color ex: FF5555 or FF5544CC (RGBa)
   * @return {Array} source
   */
  fabric.Color.sourceFromHex = function (color) {
    if (color.match(Color.reHex)) {
      var value = color.slice(color.indexOf('#') + 1),
        isShortNotation = value.length === 3 || value.length === 4,
        isRGBa = value.length === 8 || value.length === 4,
        r = isShortNotation
          ? value.charAt(0) + value.charAt(0)
          : value.substring(0, 2),
        g = isShortNotation
          ? value.charAt(1) + value.charAt(1)
          : value.substring(2, 4),
        b = isShortNotation
          ? value.charAt(2) + value.charAt(2)
          : value.substring(4, 6),
        a = isRGBa
          ? isShortNotation
            ? value.charAt(3) + value.charAt(3)
            : value.substring(6, 8)
          : 'FF';

      return [
        parseInt(r, 16),
        parseInt(g, 16),
        parseInt(b, 16),
        parseFloat((parseInt(a, 16) / 255).toFixed(2)),
      ];
    }
  };

  /**
   * Returns new color object, when given color in array representation (ex: [200, 100, 100, 0.5])
   * @static
   * @memberOf fabric.Color
   * @param {Array} source
   * @return {fabric.Color}
   */
  fabric.Color.fromSource = function (source) {
    var oColor = new Color();
    oColor.setSource(source);
    return oColor;
  };
})(typeof exports !== 'undefined' ? exports : this);
(function initStaticCanvas() {
  if (fabric.StaticCanvas) {
    fabric.warn('fabric.StaticCanvas is already defined.');
    return;
  }

  // aliases for faster resolution
  var extend = fabric.util.object.extend,
    getElementOffset = fabric.util.getElementOffset,
    removeFromArray = fabric.util.removeFromArray,
    toFixed = fabric.util.toFixed,
    transformPoint = fabric.util.transformPoint,
    invertTransform = fabric.util.invertTransform,
    getNodeCanvas = fabric.util.getNodeCanvas,
    createCanvasElement = fabric.util.createCanvasElement,
    CANVAS_INIT_ERROR = new Error('Could not initialize `canvas` element');

  /**
   * Static canvas class
   * @class fabric.StaticCanvas
   * @mixes fabric.Collection
   * @mixes fabric.Observable
   * @see {@link http://fabricjs.com/static_canvas|StaticCanvas demo}
   * @see {@link fabric.StaticCanvas#initialize} for constructor definition
   * @fires before:render
   * @fires after:render
   * @fires canvas:cleared
   * @fires object:added
   * @fires object:removed
   */
  fabric.StaticCanvas = fabric.util.createClass(
    fabric.CommonMethods,
    /** @lends fabric.StaticCanvas.prototype */ {
      /**
       * Constructor
       * @param {HTMLElement | String} el &lt;canvas> element to initialize instance on
       * @param {Object} [options] Options object
       * @return {Object} thisArg
       */
      initialize: function (el, options) {
        options || (options = {});
        this.renderAndResetBound = this.renderAndReset.bind(this);
        this.requestRenderAllBound = this.requestRenderAll.bind(this);
        this._initStatic(el, options);
      },

      /**
       * Background color of canvas instance.
       * Should be set via {@link fabric.StaticCanvas#setBackgroundColor}.
       * @type {(String|fabric.Pattern)}
       * @default
       */
      backgroundColor: '',

      /**
       * Background image of canvas instance.
       * Should be set via {@link fabric.StaticCanvas#setBackgroundImage}.
       * <b>Backwards incompatibility note:</b> The "backgroundImageOpacity"
       * and "backgroundImageStretch" properties are deprecated since 1.3.9.
       * Use {@link fabric.Image#opacity}, {@link fabric.Image#width} and {@link fabric.Image#height}.
       * since 2.4.0 image caching is active, please when putting an image as background, add to the
       * canvas property a reference to the canvas it is on. Otherwise the image cannot detect the zoom
       * vale. As an alternative you can disable image objectCaching
       * @type fabric.Image
       * @default
       */
      backgroundImage: null,

      /**
       * Overlay color of canvas instance.
       * Should be set via {@link fabric.StaticCanvas#setOverlayColor}
       * @since 1.3.9
       * @type {(String|fabric.Pattern)}
       * @default
       */
      overlayColor: '',

      /**
       * Overlay image of canvas instance.
       * Should be set via {@link fabric.StaticCanvas#setOverlayImage}.
       * <b>Backwards incompatibility note:</b> The "overlayImageLeft"
       * and "overlayImageTop" properties are deprecated since 1.3.9.
       * Use {@link fabric.Image#left} and {@link fabric.Image#top}.
       * since 2.4.0 image caching is active, please when putting an image as overlay, add to the
       * canvas property a reference to the canvas it is on. Otherwise the image cannot detect the zoom
       * vale. As an alternative you can disable image objectCaching
       * @type fabric.Image
       * @default
       */
      overlayImage: null,

      /**
       * Indicates whether toObject/toDatalessObject should include default values
       * if set to false, takes precedence over the object value.
       * @type Boolean
       * @default
       */
      includeDefaultValues: true,

      /**
       * Indicates whether objects' state should be saved
       * @type Boolean
       * @default
       */
      stateful: false,

      /**
       * Indicates whether {@link fabric.Collection.add}, {@link fabric.Collection.insertAt} and {@link fabric.Collection.remove},
       * {@link fabric.StaticCanvas.moveTo}, {@link fabric.StaticCanvas.clear} and many more, should also re-render canvas.
       * Disabling this option will not give a performance boost when adding/removing a lot of objects to/from canvas at once
       * since the renders are quequed and executed one per frame.
       * Disabling is suggested anyway and managing the renders of the app manually is not a big effort ( canvas.requestRenderAll() )
       * Left default to true to do not break documentation and old app, fiddles.
       * @type Boolean
       * @default
       */
      renderOnAddRemove: true,

      /**
       * Function that determines clipping of entire canvas area
       * Being passed context as first argument.
       * If you are using code minification, ctx argument can be minified/manglied you should use
       * as a workaround `var ctx = arguments[0];` in the function;
       * See clipping canvas area in {@link https://github.com/kangax/fabric.js/wiki/FAQ}
       * @deprecated since 2.0.0
       * @type Function
       * @default
       */
      clipTo: null,

      /**
       * Indicates whether object controls (borders/controls) are rendered above overlay image
       * @type Boolean
       * @default
       */
      controlsAboveOverlay: false,

      /**
       * Indicates whether the browser can be scrolled when using a touchscreen and dragging on the canvas
       * @type Boolean
       * @default
       */
      allowTouchScrolling: false,

      /**
       * Indicates whether this canvas will use image smoothing, this is on by default in browsers
       * @type Boolean
       * @default
       */
      imageSmoothingEnabled: true,

      /**
       * The transformation (in the format of Canvas transform) which focuses the viewport
       * @type Array
       * @default
       */
      viewportTransform: fabric.iMatrix.concat(),

      /**
       * if set to false background image is not affected by viewport transform
       * @since 1.6.3
       * @type Boolean
       * @default
       */
      backgroundVpt: true,

      /**
       * if set to false overlya image is not affected by viewport transform
       * @since 1.6.3
       * @type Boolean
       * @default
       */
      overlayVpt: true,

      /**
       * Callback; invoked right before object is about to be scaled/rotated
       * @deprecated since 2.3.0
       * Use before:transform event
       */
      onBeforeScaleRotate: function () {
        /* NOOP */
      },

      /**
       * When true, canvas is scaled by devicePixelRatio for better rendering on retina screens
       * @type Boolean
       * @default
       */
      enableRetinaScaling: true,

      /**
       * Describe canvas element extension over design
       * properties are tl,tr,bl,br.
       * if canvas is not zoomed/panned those points are the four corner of canvas
       * if canvas is viewportTransformed you those points indicate the extension
       * of canvas element in plain untrasformed coordinates
       * The coordinates get updated with @method calcViewportBoundaries.
       * @memberOf fabric.StaticCanvas.prototype
       */
      vptCoords: {},

      /**
       * Based on vptCoords and object.aCoords, skip rendering of objects that
       * are not included in current viewport.
       * May greatly help in applications with crowded canvas and use of zoom/pan
       * If One of the corner of the bounding box of the object is on the canvas
       * the objects get rendered.
       * @memberOf fabric.StaticCanvas.prototype
       * @type Boolean
       * @default
       */
      skipOffscreen: true,

      /**
       * a fabricObject that, without stroke define a clipping area with their shape. filled in black
       * the clipPath object gets used when the canvas has rendered, and the context is placed in the
       * top left corner of the canvas.
       * clipPath will clip away controls, if you do not want this to happen use controlsAboveOverlay = true
       * @type fabric.Object
       */
      clipPath: undefined,

      /**
       * @private
       * @param {HTMLElement | String} el &lt;canvas> element to initialize instance on
       * @param {Object} [options] Options object
       */
      _initStatic: function (el, options) {
        var cb = this.requestRenderAllBound;
        this._objects = [];
        this._createLowerCanvas(el);
        this._initOptions(options);
        this._setImageSmoothing();
        // only initialize retina scaling once
        if (!this.interactive) {
          this._initRetinaScaling();
        }

        if (options.overlayImage) {
          this.setOverlayImage(options.overlayImage, cb);
        }
        if (options.backgroundImage) {
          this.setBackgroundImage(options.backgroundImage, cb);
        }
        if (options.backgroundColor) {
          this.setBackgroundColor(options.backgroundColor, cb);
        }
        if (options.overlayColor) {
          this.setOverlayColor(options.overlayColor, cb);
        }
        this.calcOffset();
      },

      /**
       * @private
       */
      _isRetinaScaling: function () {
        return fabric.devicePixelRatio !== 1 && this.enableRetinaScaling;
      },

      /**
       * @private
       * @return {Number} retinaScaling if applied, otherwise 1;
       */
      getRetinaScaling: function () {
        return this._isRetinaScaling() ? fabric.devicePixelRatio : 1;
      },

      /**
       * @private
       */
      _initRetinaScaling: function () {
        if (!this._isRetinaScaling()) {
          return;
        }
        var scaleRatio = fabric.devicePixelRatio;
        this.__initRetinaScaling(
          scaleRatio,
          this.lowerCanvasEl,
          this.contextContainer
        );
        if (this.upperCanvasEl) {
          this.__initRetinaScaling(
            scaleRatio,
            this.upperCanvasEl,
            this.contextTop
          );
        }
      },

      __initRetinaScaling: function (scaleRatio, canvas, context) {
        canvas.setAttribute('width', this.width * scaleRatio);
        canvas.setAttribute('height', this.height * scaleRatio);
        context.scale(scaleRatio, scaleRatio);
      },

      /**
       * Calculates canvas element offset relative to the document
       * This method is also attached as "resize" event handler of window
       * @return {fabric.Canvas} instance
       * @chainable
       */
      calcOffset: function () {
        this._offset = getElementOffset(this.lowerCanvasEl);
        return this;
      },

      /**
       * Sets {@link fabric.StaticCanvas#overlayImage|overlay image} for this canvas
       * @param {(fabric.Image|String)} image fabric.Image instance or URL of an image to set overlay to
       * @param {Function} callback callback to invoke when image is loaded and set as an overlay
       * @param {Object} [options] Optional options to set for the {@link fabric.Image|overlay image}.
       * @return {fabric.Canvas} thisArg
       * @chainable
       * @see {@link http://jsfiddle.net/fabricjs/MnzHT/|jsFiddle demo}
       * @example <caption>Normal overlayImage with left/top = 0</caption>
       * canvas.setOverlayImage('http://fabricjs.com/assets/jail_cell_bars.png', canvas.renderAll.bind(canvas), {
       *   // Needed to position overlayImage at 0/0
       *   originX: 'left',
       *   originY: 'top'
       * });
       * @example <caption>overlayImage with different properties</caption>
       * canvas.setOverlayImage('http://fabricjs.com/assets/jail_cell_bars.png', canvas.renderAll.bind(canvas), {
       *   opacity: 0.5,
       *   angle: 45,
       *   left: 400,
       *   top: 400,
       *   originX: 'left',
       *   originY: 'top'
       * });
       * @example <caption>Stretched overlayImage #1 - width/height correspond to canvas width/height</caption>
       * fabric.Image.fromURL('http://fabricjs.com/assets/jail_cell_bars.png', function(img) {
       *    img.set({width: canvas.width, height: canvas.height, originX: 'left', originY: 'top'});
       *    canvas.setOverlayImage(img, canvas.renderAll.bind(canvas));
       * });
       * @example <caption>Stretched overlayImage #2 - width/height correspond to canvas width/height</caption>
       * canvas.setOverlayImage('http://fabricjs.com/assets/jail_cell_bars.png', canvas.renderAll.bind(canvas), {
       *   width: canvas.width,
       *   height: canvas.height,
       *   // Needed to position overlayImage at 0/0
       *   originX: 'left',
       *   originY: 'top'
       * });
       * @example <caption>overlayImage loaded from cross-origin</caption>
       * canvas.setOverlayImage('http://fabricjs.com/assets/jail_cell_bars.png', canvas.renderAll.bind(canvas), {
       *   opacity: 0.5,
       *   angle: 45,
       *   left: 400,
       *   top: 400,
       *   originX: 'left',
       *   originY: 'top',
       *   crossOrigin: 'anonymous'
       * });
       */
      setOverlayImage: function (image, callback, options) {
        return this.__setBgOverlayImage(
          'overlayImage',
          image,
          callback,
          options
        );
      },

      /**
       * Sets {@link fabric.StaticCanvas#backgroundImage|background image} for this canvas
       * @param {(fabric.Image|String)} image fabric.Image instance or URL of an image to set background to
       * @param {Function} callback Callback to invoke when image is loaded and set as background
       * @param {Object} [options] Optional options to set for the {@link fabric.Image|background image}.
       * @return {fabric.Canvas} thisArg
       * @chainable
       * @see {@link http://jsfiddle.net/djnr8o7a/28/|jsFiddle demo}
       * @example <caption>Normal backgroundImage with left/top = 0</caption>
       * canvas.setBackgroundImage('http://fabricjs.com/assets/honey_im_subtle.png', canvas.renderAll.bind(canvas), {
       *   // Needed to position backgroundImage at 0/0
       *   originX: 'left',
       *   originY: 'top'
       * });
       * @example <caption>backgroundImage with different properties</caption>
       * canvas.setBackgroundImage('http://fabricjs.com/assets/honey_im_subtle.png', canvas.renderAll.bind(canvas), {
       *   opacity: 0.5,
       *   angle: 45,
       *   left: 400,
       *   top: 400,
       *   originX: 'left',
       *   originY: 'top'
       * });
       * @example <caption>Stretched backgroundImage #1 - width/height correspond to canvas width/height</caption>
       * fabric.Image.fromURL('http://fabricjs.com/assets/honey_im_subtle.png', function(img) {
       *    img.set({width: canvas.width, height: canvas.height, originX: 'left', originY: 'top'});
       *    canvas.setBackgroundImage(img, canvas.renderAll.bind(canvas));
       * });
       * @example <caption>Stretched backgroundImage #2 - width/height correspond to canvas width/height</caption>
       * canvas.setBackgroundImage('http://fabricjs.com/assets/honey_im_subtle.png', canvas.renderAll.bind(canvas), {
       *   width: canvas.width,
       *   height: canvas.height,
       *   // Needed to position backgroundImage at 0/0
       *   originX: 'left',
       *   originY: 'top'
       * });
       * @example <caption>backgroundImage loaded from cross-origin</caption>
       * canvas.setBackgroundImage('http://fabricjs.com/assets/honey_im_subtle.png', canvas.renderAll.bind(canvas), {
       *   opacity: 0.5,
       *   angle: 45,
       *   left: 400,
       *   top: 400,
       *   originX: 'left',
       *   originY: 'top',
       *   crossOrigin: 'anonymous'
       * });
       */
      // TODO: fix stretched examples
      setBackgroundImage: function (image, callback, options) {
        return this.__setBgOverlayImage(
          'backgroundImage',
          image,
          callback,
          options
        );
      },

      /**
       * Sets {@link fabric.StaticCanvas#overlayColor|foreground color} for this canvas
       * @param {(String|fabric.Pattern)} overlayColor Color or pattern to set foreground color to
       * @param {Function} callback Callback to invoke when foreground color is set
       * @return {fabric.Canvas} thisArg
       * @chainable
       * @see {@link http://jsfiddle.net/fabricjs/pB55h/|jsFiddle demo}
       * @example <caption>Normal overlayColor - color value</caption>
       * canvas.setOverlayColor('rgba(255, 73, 64, 0.6)', canvas.renderAll.bind(canvas));
       * @example <caption>fabric.Pattern used as overlayColor</caption>
       * canvas.setOverlayColor({
       *   source: 'http://fabricjs.com/assets/escheresque_ste.png'
       * }, canvas.renderAll.bind(canvas));
       * @example <caption>fabric.Pattern used as overlayColor with repeat and offset</caption>
       * canvas.setOverlayColor({
       *   source: 'http://fabricjs.com/assets/escheresque_ste.png',
       *   repeat: 'repeat',
       *   offsetX: 200,
       *   offsetY: 100
       * }, canvas.renderAll.bind(canvas));
       */
      setOverlayColor: function (overlayColor, callback) {
        return this.__setBgOverlayColor('overlayColor', overlayColor, callback);
      },

      /**
       * Sets {@link fabric.StaticCanvas#backgroundColor|background color} for this canvas
       * @param {(String|fabric.Pattern)} backgroundColor Color or pattern to set background color to
       * @param {Function} callback Callback to invoke when background color is set
       * @return {fabric.Canvas} thisArg
       * @chainable
       * @see {@link http://jsfiddle.net/fabricjs/hXzvk/|jsFiddle demo}
       * @example <caption>Normal backgroundColor - color value</caption>
       * canvas.setBackgroundColor('rgba(255, 73, 64, 0.6)', canvas.renderAll.bind(canvas));
       * @example <caption>fabric.Pattern used as backgroundColor</caption>
       * canvas.setBackgroundColor({
       *   source: 'http://fabricjs.com/assets/escheresque_ste.png'
       * }, canvas.renderAll.bind(canvas));
       * @example <caption>fabric.Pattern used as backgroundColor with repeat and offset</caption>
       * canvas.setBackgroundColor({
       *   source: 'http://fabricjs.com/assets/escheresque_ste.png',
       *   repeat: 'repeat',
       *   offsetX: 200,
       *   offsetY: 100
       * }, canvas.renderAll.bind(canvas));
       */
      setBackgroundColor: function (backgroundColor, callback) {
        return this.__setBgOverlayColor(
          'backgroundColor',
          backgroundColor,
          callback
        );
      },

      /**
       * @private
       * @see {@link http://www.whatwg.org/specs/web-apps/current-work/multipage/the-canvas-element.html#dom-context-2d-imagesmoothingenabled|WhatWG Canvas Standard}
       */
      _setImageSmoothing: function () {
        var ctx = this.getContext();

        ctx.imageSmoothingEnabled =
          ctx.imageSmoothingEnabled ||
          ctx.webkitImageSmoothingEnabled ||
          ctx.mozImageSmoothingEnabled ||
          ctx.msImageSmoothingEnabled ||
          ctx.oImageSmoothingEnabled;
        ctx.imageSmoothingEnabled = this.imageSmoothingEnabled;
      },

      /**
       * @private
       * @param {String} property Property to set ({@link fabric.StaticCanvas#backgroundImage|backgroundImage}
       * or {@link fabric.StaticCanvas#overlayImage|overlayImage})
       * @param {(fabric.Image|String|null)} image fabric.Image instance, URL of an image or null to set background or overlay to
       * @param {Function} callback Callback to invoke when image is loaded and set as background or overlay
       * @param {Object} [options] Optional options to set for the {@link fabric.Image|image}.
       */
      __setBgOverlayImage: function (property, image, callback, options) {
        if (typeof image === 'string') {
          fabric.util.loadImage(
            image,
            function (img) {
              if (img) {
                var instance = new fabric.Image(img, options);
                this[property] = instance;
                instance.canvas = this;
              }
              callback && callback(img);
            },
            this,
            options && options.crossOrigin
          );
        } else {
          options && image.setOptions(options);
          this[property] = image;
          image && (image.canvas = this);
          callback && callback(image);
        }

        return this;
      },

      /**
       * @private
       * @param {String} property Property to set ({@link fabric.StaticCanvas#backgroundColor|backgroundColor}
       * or {@link fabric.StaticCanvas#overlayColor|overlayColor})
       * @param {(Object|String|null)} color Object with pattern information, color value or null
       * @param {Function} [callback] Callback is invoked when color is set
       */
      __setBgOverlayColor: function (property, color, callback) {
        this[property] = color;
        this._initGradient(color, property);
        this._initPattern(color, property, callback);
        return this;
      },

      /**
       * @private
       */
      _createCanvasElement: function () {
        var element = createCanvasElement();
        if (!element) {
          throw CANVAS_INIT_ERROR;
        }
        if (!element.style) {
          element.style = {};
        }
        if (typeof element.getContext === 'undefined') {
          throw CANVAS_INIT_ERROR;
        }
        return element;
      },

      /**
       * @private
       * @param {Object} [options] Options object
       */
      _initOptions: function (options) {
        var lowerCanvasEl = this.lowerCanvasEl;
        this._setOptions(options);

        this.width = this.width || parseInt(lowerCanvasEl.width, 10) || 0;
        this.height = this.height || parseInt(lowerCanvasEl.height, 10) || 0;

        if (!this.lowerCanvasEl.style) {
          return;
        }

        lowerCanvasEl.width = this.width;
        lowerCanvasEl.height = this.height;

        lowerCanvasEl.style.width = this.width + 'px';
        lowerCanvasEl.style.height = this.height + 'px';

        this.viewportTransform = this.viewportTransform.slice();
      },

      /**
       * Creates a bottom canvas
       * @private
       * @param {HTMLElement} [canvasEl]
       */
      _createLowerCanvas: function (canvasEl) {
        // canvasEl === 'HTMLCanvasElement' does not work on jsdom/node
        if (canvasEl && canvasEl.getContext) {
          this.lowerCanvasEl = canvasEl;
        } else {
          this.lowerCanvasEl =
            fabric.util.getById(canvasEl) || this._createCanvasElement();
        }

        fabric.util.addClass(this.lowerCanvasEl, 'lower-canvas');

        if (this.interactive) {
          this._applyCanvasStyle(this.lowerCanvasEl);
        }

        this.contextContainer = this.lowerCanvasEl.getContext('2d');
      },

      /**
       * Returns canvas width (in px)
       * @return {Number}
       */
      getWidth: function () {
        return this.width;
      },

      /**
       * Returns canvas height (in px)
       * @return {Number}
       */
      getHeight: function () {
        return this.height;
      },

      /**
       * Sets width of this canvas instance
       * @param {Number|String} value                         Value to set width to
       * @param {Object}        [options]                     Options object
       * @param {Boolean}       [options.backstoreOnly=false] Set the given dimensions only as canvas backstore dimensions
       * @param {Boolean}       [options.cssOnly=false]       Set the given dimensions only as css dimensions
       * @return {fabric.Canvas} instance
       * @chainable true
       */
      setWidth: function (value, options) {
        return this.setDimensions({ width: value }, options);
      },

      /**
       * Sets height of this canvas instance
       * @param {Number|String} value                         Value to set height to
       * @param {Object}        [options]                     Options object
       * @param {Boolean}       [options.backstoreOnly=false] Set the given dimensions only as canvas backstore dimensions
       * @param {Boolean}       [options.cssOnly=false]       Set the given dimensions only as css dimensions
       * @return {fabric.Canvas} instance
       * @chainable true
       */
      setHeight: function (value, options) {
        return this.setDimensions({ height: value }, options);
      },

      /**
       * Sets dimensions (width, height) of this canvas instance. when options.cssOnly flag active you should also supply the unit of measure (px/%/em)
       * @param {Object}        dimensions                    Object with width/height properties
       * @param {Number|String} [dimensions.width]            Width of canvas element
       * @param {Number|String} [dimensions.height]           Height of canvas element
       * @param {Object}        [options]                     Options object
       * @param {Boolean}       [options.backstoreOnly=false] Set the given dimensions only as canvas backstore dimensions
       * @param {Boolean}       [options.cssOnly=false]       Set the given dimensions only as css dimensions
       * @return {fabric.Canvas} thisArg
       * @chainable
       */
      setDimensions: function (dimensions, options) {
        var cssValue;

        options = options || {};

        for (var prop in dimensions) {
          cssValue = dimensions[prop];

          if (!options.cssOnly) {
            this._setBackstoreDimension(prop, dimensions[prop]);
            cssValue += 'px';
            this.hasLostContext = true;
          }

          if (!options.backstoreOnly) {
            this._setCssDimension(prop, cssValue);
          }
        }
        if (this._isCurrentlyDrawing) {
          this.freeDrawingBrush && this.freeDrawingBrush._setBrushStyles();
        }
        this._initRetinaScaling();
        this._setImageSmoothing();
        this.calcOffset();

        if (!options.cssOnly) {
          this.requestRenderAll();
        }

        return this;
      },

      /**
       * Helper for setting width/height
       * @private
       * @param {String} prop property (width|height)
       * @param {Number} value value to set property to
       * @return {fabric.Canvas} instance
       * @chainable true
       */
      _setBackstoreDimension: function (prop, value) {
        this.lowerCanvasEl[prop] = value;

        if (this.upperCanvasEl) {
          this.upperCanvasEl[prop] = value;
        }

        if (this.cacheCanvasEl) {
          this.cacheCanvasEl[prop] = value;
        }

        this[prop] = value;

        return this;
      },

      /**
       * Helper for setting css width/height
       * @private
       * @param {String} prop property (width|height)
       * @param {String} value value to set property to
       * @return {fabric.Canvas} instance
       * @chainable true
       */
      _setCssDimension: function (prop, value) {
        this.lowerCanvasEl.style[prop] = value;

        if (this.upperCanvasEl) {
          this.upperCanvasEl.style[prop] = value;
        }

        if (this.wrapperEl) {
          this.wrapperEl.style[prop] = value;
        }

        return this;
      },

      /**
       * Returns canvas zoom level
       * @return {Number}
       */
      getZoom: function () {
        return this.viewportTransform[0];
      },

      /**
       * Sets viewport transform of this canvas instance
       * @param {Array} vpt the transform in the form of context.transform
       * @return {fabric.Canvas} instance
       * @chainable true
       */
      setViewportTransform: function (vpt) {
        var activeObject = this._activeObject,
          object,
          ignoreVpt = false,
          skipAbsolute = true,
          i,
          len;
        this.viewportTransform = vpt;
        for (i = 0, len = this._objects.length; i < len; i++) {
          object = this._objects[i];
          object.group || object.setCoords(ignoreVpt, skipAbsolute);
        }
        if (activeObject && activeObject.type === 'activeSelection') {
          activeObject.setCoords(ignoreVpt, skipAbsolute);
        }
        this.calcViewportBoundaries();
        this.renderOnAddRemove && this.requestRenderAll();
        return this;
      },

      /**
       * Sets zoom level of this canvas instance, zoom centered around point
       * @param {fabric.Point} point to zoom with respect to
       * @param {Number} value to set zoom to, less than 1 zooms out
       * @return {fabric.Canvas} instance
       * @chainable true
       */
      zoomToPoint: function (point, value) {
        // TODO: just change the scale, preserve other transformations
        var before = point,
          vpt = this.viewportTransform.slice(0);
        point = transformPoint(point, invertTransform(this.viewportTransform));
        vpt[0] = value;
        vpt[3] = value;
        var after = transformPoint(point, vpt);
        vpt[4] += before.x - after.x;
        vpt[5] += before.y - after.y;
        return this.setViewportTransform(vpt);
      },

      /**
       * Sets zoom level of this canvas instance
       * @param {Number} value to set zoom to, less than 1 zooms out
       * @return {fabric.Canvas} instance
       * @chainable true
       */
      setZoom: function (value) {
        this.zoomToPoint(new fabric.Point(0, 0), value);
        return this;
      },

      /**
       * Pan viewport so as to place point at top left corner of canvas
       * @param {fabric.Point} point to move to
       * @return {fabric.Canvas} instance
       * @chainable true
       */
      absolutePan: function (point) {
        var vpt = this.viewportTransform.slice(0);
        vpt[4] = -point.x;
        vpt[5] = -point.y;
        return this.setViewportTransform(vpt);
      },

      /**
       * Pans viewpoint relatively
       * @param {fabric.Point} point (position vector) to move by
       * @return {fabric.Canvas} instance
       * @chainable true
       */
      relativePan: function (point) {
        return this.absolutePan(
          new fabric.Point(
            -point.x - this.viewportTransform[4],
            -point.y - this.viewportTransform[5]
          )
        );
      },

      /**
       * Returns &lt;canvas> element corresponding to this instance
       * @return {HTMLCanvasElement}
       */
      getElement: function () {
        return this.lowerCanvasEl;
      },

      /**
       * @private
       * @param {fabric.Object} obj Object that was added
       */
      _onObjectAdded: function (obj) {
        this.stateful && obj.setupState();
        obj._set('canvas', this);
        obj.setCoords();
        this.fire('object:added', { target: obj });
        obj.fire('added');
      },

      /**
       * @private
       * @param {fabric.Object} obj Object that was removed
       */
      _onObjectRemoved: function (obj) {
        this.fire('object:removed', { target: obj });
        obj.fire('removed');
        delete obj.canvas;
      },

      /**
       * Clears specified context of canvas element
       * @param {CanvasRenderingContext2D} ctx Context to clear
       * @return {fabric.Canvas} thisArg
       * @chainable
       */
      clearContext: function (ctx) {
        ctx.clearRect(0, 0, this.width, this.height);
        return this;
      },

      /**
       * Returns context of canvas where objects are drawn
       * @return {CanvasRenderingContext2D}
       */
      getContext: function () {
        return this.contextContainer;
      },

      /**
       * Clears all contexts (background, main, top) of an instance
       * @return {fabric.Canvas} thisArg
       * @chainable
       */
      clear: function () {
        this._objects.length = 0;
        this.backgroundImage = null;
        this.overlayImage = null;
        this.backgroundColor = '';
        this.overlayColor = '';
        if (this._hasITextHandlers) {
          this.off('mouse:up', this._mouseUpITextHandler);
          this._iTextInstances = null;
          this._hasITextHandlers = false;
        }
        this.clearContext(this.contextContainer);
        this.fire('canvas:cleared');
        this.renderOnAddRemove && this.requestRenderAll();
        return this;
      },

      /**
       * Renders the canvas
       * @return {fabric.Canvas} instance
       * @chainable
       */
      renderAll: function () {
        var canvasToDrawOn = this.contextContainer;
        this.renderCanvas(canvasToDrawOn, this._objects);
        return this;
      },

      /**
       * Function created to be instance bound at initialization
       * used in requestAnimationFrame rendering
       * Let the fabricJS call it. If you call it manually you could have more
       * animationFrame stacking on to of each other
       * for an imperative rendering, use canvas.renderAll
       * @private
       * @return {fabric.Canvas} instance
       * @chainable
       */
      renderAndReset: function () {
        this.isRendering = 0;
        this.renderAll();
      },

      /**
       * Append a renderAll request to next animation frame.
       * unless one is already in progress, in that case nothing is done
       * a boolean flag will avoid appending more.
       * @return {fabric.Canvas} instance
       * @chainable
       */
      requestRenderAll: function () {
        if (!this.isRendering) {
          this.isRendering = fabric.util.requestAnimFrame(
            this.renderAndResetBound
          );
        }
        return this;
      },

      /**
       * Calculate the position of the 4 corner of canvas with current viewportTransform.
       * helps to determinate when an object is in the current rendering viewport using
       * object absolute coordinates ( aCoords )
       * @return {Object} points.tl
       * @chainable
       */
      calcViewportBoundaries: function () {
        var points = {},
          width = this.width,
          height = this.height,
          iVpt = invertTransform(this.viewportTransform);
        points.tl = transformPoint({ x: 0, y: 0 }, iVpt);
        points.br = transformPoint({ x: width, y: height }, iVpt);
        points.tr = new fabric.Point(points.br.x, points.tl.y);
        points.bl = new fabric.Point(points.tl.x, points.br.y);
        this.vptCoords = points;
        return points;
      },

      cancelRequestedRender: function () {
        if (this.isRendering) {
          fabric.util.cancelAnimFrame(this.isRendering);
          this.isRendering = 0;
        }
      },

      /**
       * Renders background, objects, overlay and controls.
       * @param {CanvasRenderingContext2D} ctx
       * @param {Array} objects to render
       * @return {fabric.Canvas} instance
       * @chainable
       */
      renderCanvas: function (ctx, objects) {
        var v = this.viewportTransform,
          path = this.clipPath;
        this.cancelRequestedRender();
        this.calcViewportBoundaries();
        this.clearContext(ctx);
        this.fire('before:render', { ctx: ctx });
        if (this.clipTo) {
          fabric.util.clipContext(this, ctx);
        }
        this._renderBackground(ctx);

        ctx.save();
        //apply viewport transform once for all rendering process
        ctx.transform(v[0], v[1], v[2], v[3], v[4], v[5]);
        this._renderObjects(ctx, objects);
        ctx.restore();
        if (!this.controlsAboveOverlay && this.interactive) {
          this.drawControls(ctx);
        }
        if (this.clipTo) {
          ctx.restore();
        }
        if (path) {
          path.canvas = this;
          // needed to setup a couple of variables
          path.shouldCache();
          path._transformDone = true;
          path.renderCache({ forClipping: true });
          this.drawClipPathOnCanvas(ctx);
        }
        this._renderOverlay(ctx);
        if (this.controlsAboveOverlay && this.interactive) {
          this.drawControls(ctx);
        }
        this.fire('after:render', { ctx: ctx });
      },

      /**
       * Paint the cached clipPath on the lowerCanvasEl
       * @param {CanvasRenderingContext2D} ctx Context to render on
       */
      drawClipPathOnCanvas: function (ctx) {
        var v = this.viewportTransform,
          path = this.clipPath;
        ctx.save();
        ctx.transform(v[0], v[1], v[2], v[3], v[4], v[5]);
        // DEBUG: uncomment this line, comment the following
        // ctx.globalAlpha = 0.4;
        ctx.globalCompositeOperation = 'destination-in';
        path.transform(ctx);
        ctx.scale(1 / path.zoomX, 1 / path.zoomY);
        ctx.drawImage(
          path._cacheCanvas,
          -path.cacheTranslationX,
          -path.cacheTranslationY
        );
        ctx.restore();
      },

      /**
       * @private
       * @param {CanvasRenderingContext2D} ctx Context to render on
       * @param {Array} objects to render
       */
      _renderObjects: function (ctx, objects) {
        var i, len;
        for (i = 0, len = objects.length; i < len; ++i) {
          objects[i] && objects[i].render(ctx);
        }
      },

      /**
       * @private
       * @param {CanvasRenderingContext2D} ctx Context to render on
       * @param {string} property 'background' or 'overlay'
       */
      _renderBackgroundOrOverlay: function (ctx, property) {
        var fill = this[property + 'Color'],
          object = this[property + 'Image'],
          v = this.viewportTransform,
          needsVpt = this[property + 'Vpt'];
        if (!fill && !object) {
          return;
        }
        if (fill) {
          ctx.save();
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.lineTo(this.width, 0);
          ctx.lineTo(this.width, this.height);
          ctx.lineTo(0, this.height);
          ctx.closePath();
          ctx.fillStyle = fill.toLive ? fill.toLive(ctx, this) : fill;
          if (needsVpt) {
            ctx.transform(v[0], v[1], v[2], v[3], v[4], v[5]);
          }
          ctx.transform(1, 0, 0, 1, fill.offsetX || 0, fill.offsetY || 0);
          var m = fill.gradientTransform || fill.patternTransform;
          m && ctx.transform(m[0], m[1], m[2], m[3], m[4], m[5]);
          ctx.fill();
          ctx.restore();
        }
        if (object) {
          ctx.save();
          if (needsVpt) {
            ctx.transform(v[0], v[1], v[2], v[3], v[4], v[5]);
          }
          object.render(ctx);
          ctx.restore();
        }
      },

      /**
       * @private
       * @param {CanvasRenderingContext2D} ctx Context to render on
       */
      _renderBackground: function (ctx) {
        this._renderBackgroundOrOverlay(ctx, 'background');
      },

      /**
       * @private
       * @param {CanvasRenderingContext2D} ctx Context to render on
       */
      _renderOverlay: function (ctx) {
        this._renderBackgroundOrOverlay(ctx, 'overlay');
      },

      /**
       * Returns coordinates of a center of canvas.
       * Returned value is an object with top and left properties
       * @return {Object} object with "top" and "left" number values
       */
      getCenter: function () {
        return {
          top: this.height / 2,
          left: this.width / 2,
        };
      },

      /**
       * Centers object horizontally in the canvas
       * @param {fabric.Object} object Object to center horizontally
       * @return {fabric.Canvas} thisArg
       */
      centerObjectH: function (object) {
        return this._centerObject(
          object,
          new fabric.Point(this.getCenter().left, object.getCenterPoint().y)
        );
      },

      /**
       * Centers object vertically in the canvas
       * @param {fabric.Object} object Object to center vertically
       * @return {fabric.Canvas} thisArg
       * @chainable
       */
      centerObjectV: function (object) {
        return this._centerObject(
          object,
          new fabric.Point(object.getCenterPoint().x, this.getCenter().top)
        );
      },

      /**
       * Centers object vertically and horizontally in the canvas
       * @param {fabric.Object} object Object to center vertically and horizontally
       * @return {fabric.Canvas} thisArg
       * @chainable
       */
      centerObject: function (object) {
        var center = this.getCenter();

        return this._centerObject(
          object,
          new fabric.Point(center.left, center.top)
        );
      },

      /**
       * Centers object vertically and horizontally in the viewport
       * @param {fabric.Object} object Object to center vertically and horizontally
       * @return {fabric.Canvas} thisArg
       * @chainable
       */
      viewportCenterObject: function (object) {
        var vpCenter = this.getVpCenter();

        return this._centerObject(object, vpCenter);
      },

      /**
       * Centers object horizontally in the viewport, object.top is unchanged
       * @param {fabric.Object} object Object to center vertically and horizontally
       * @return {fabric.Canvas} thisArg
       * @chainable
       */
      viewportCenterObjectH: function (object) {
        var vpCenter = this.getVpCenter();
        this._centerObject(
          object,
          new fabric.Point(vpCenter.x, object.getCenterPoint().y)
        );
        return this;
      },

      /**
       * Centers object Vertically in the viewport, object.top is unchanged
       * @param {fabric.Object} object Object to center vertically and horizontally
       * @return {fabric.Canvas} thisArg
       * @chainable
       */
      viewportCenterObjectV: function (object) {
        var vpCenter = this.getVpCenter();

        return this._centerObject(
          object,
          new fabric.Point(object.getCenterPoint().x, vpCenter.y)
        );
      },

      /**
       * Calculate the point in canvas that correspond to the center of actual viewport.
       * @return {fabric.Point} vpCenter, viewport center
       * @chainable
       */
      getVpCenter: function () {
        var center = this.getCenter(),
          iVpt = invertTransform(this.viewportTransform);
        return transformPoint({ x: center.left, y: center.top }, iVpt);
      },

      /**
       * @private
       * @param {fabric.Object} object Object to center
       * @param {fabric.Point} center Center point
       * @return {fabric.Canvas} thisArg
       * @chainable
       */
      _centerObject: function (object, center) {
        object.setPositionByOrigin(center, 'center', 'center');
        object.setCoords();
        this.renderOnAddRemove && this.requestRenderAll();
        return this;
      },

      /**
       * Returs dataless JSON representation of canvas
       * @param {Array} [propertiesToInclude] Any properties that you might want to additionally include in the output
       * @return {String} json string
       */
      toDatalessJSON: function (propertiesToInclude) {
        return this.toDatalessObject(propertiesToInclude);
      },

      /**
       * Returns object representation of canvas
       * @param {Array} [propertiesToInclude] Any properties that you might want to additionally include in the output
       * @return {Object} object representation of an instance
       */
      toObject: function (propertiesToInclude) {
        return this._toObjectMethod('toObject', propertiesToInclude);
      },

      /**
       * Returns dataless object representation of canvas
       * @param {Array} [propertiesToInclude] Any properties that you might want to additionally include in the output
       * @return {Object} object representation of an instance
       */
      toDatalessObject: function (propertiesToInclude) {
        return this._toObjectMethod('toDatalessObject', propertiesToInclude);
      },

      /**
       * @private
       */
      _toObjectMethod: function (methodName, propertiesToInclude) {
        var clipPath = this.clipPath,
          data = {
            version: fabric.version,
            objects: this._toObjects(methodName, propertiesToInclude),
          };
        if (clipPath) {
          data.clipPath = this._toObject(
            this.clipPath,
            methodName,
            propertiesToInclude
          );
        }
        extend(
          data,
          this.__serializeBgOverlay(methodName, propertiesToInclude)
        );

        fabric.util.populateWithProperties(this, data, propertiesToInclude);

        return data;
      },

      /**
       * @private
       */
      _toObjects: function (methodName, propertiesToInclude) {
        return this._objects
          .filter(function (object) {
            return !object.excludeFromExport;
          })
          .map(function (instance) {
            return this._toObject(instance, methodName, propertiesToInclude);
          }, this);
      },

      /**
       * @private
       */
      _toObject: function (instance, methodName, propertiesToInclude) {
        var originalValue;

        if (!this.includeDefaultValues) {
          originalValue = instance.includeDefaultValues;
          instance.includeDefaultValues = false;
        }

        var object = instance[methodName](propertiesToInclude);
        if (!this.includeDefaultValues) {
          instance.includeDefaultValues = originalValue;
        }
        return object;
      },

      /**
       * @private
       */
      __serializeBgOverlay: function (methodName, propertiesToInclude) {
        var data = {},
          bgImage = this.backgroundImage,
          overlay = this.overlayImage;

        if (this.backgroundColor) {
          data.background = this.backgroundColor.toObject
            ? this.backgroundColor.toObject(propertiesToInclude)
            : this.backgroundColor;
        }

        if (this.overlayColor) {
          data.overlay = this.overlayColor.toObject
            ? this.overlayColor.toObject(propertiesToInclude)
            : this.overlayColor;
        }
        if (bgImage && !bgImage.excludeFromExport) {
          data.backgroundImage = this._toObject(
            bgImage,
            methodName,
            propertiesToInclude
          );
        }
        if (overlay && !overlay.excludeFromExport) {
          data.overlayImage = this._toObject(
            overlay,
            methodName,
            propertiesToInclude
          );
        }

        return data;
      },

      /* _TO_SVG_START_ */
      /**
       * When true, getSvgTransform() will apply the StaticCanvas.viewportTransform to the SVG transformation. When true,
       * a zoomed canvas will then produce zoomed SVG output.
       * @type Boolean
       * @default
       */
      svgViewportTransformation: true,

      /**
       * Returns SVG representation of canvas
       * @function
       * @param {Object} [options] Options object for SVG output
       * @param {Boolean} [options.suppressPreamble=false] If true xml tag is not included
       * @param {Object} [options.viewBox] SVG viewbox object
       * @param {Number} [options.viewBox.x] x-cooridnate of viewbox
       * @param {Number} [options.viewBox.y] y-coordinate of viewbox
       * @param {Number} [options.viewBox.width] Width of viewbox
       * @param {Number} [options.viewBox.height] Height of viewbox
       * @param {String} [options.encoding=UTF-8] Encoding of SVG output
       * @param {String} [options.width] desired width of svg with or without units
       * @param {String} [options.height] desired height of svg with or without units
       * @param {Function} [reviver] Method for further parsing of svg elements, called after each fabric object converted into svg representation.
       * @return {String} SVG string
       * @tutorial {@link http://fabricjs.com/fabric-intro-part-3#serialization}
       * @see {@link http://jsfiddle.net/fabricjs/jQ3ZZ/|jsFiddle demo}
       * @example <caption>Normal SVG output</caption>
       * var svg = canvas.toSVG();
       * @example <caption>SVG output without preamble (without &lt;?xml ../>)</caption>
       * var svg = canvas.toSVG({suppressPreamble: true});
       * @example <caption>SVG output with viewBox attribute</caption>
       * var svg = canvas.toSVG({
       *   viewBox: {
       *     x: 100,
       *     y: 100,
       *     width: 200,
       *     height: 300
       *   }
       * });
       * @example <caption>SVG output with different encoding (default: UTF-8)</caption>
       * var svg = canvas.toSVG({encoding: 'ISO-8859-1'});
       * @example <caption>Modify SVG output with reviver function</caption>
       * var svg = canvas.toSVG(null, function(svg) {
       *   return svg.replace('stroke-dasharray: ; stroke-linecap: butt; stroke-linejoin: miter; stroke-miterlimit: 10; ', '');
       * });
       */
      toSVG: function (options, reviver) {
        options || (options = {});
        options.reviver = reviver;
        var markup = [];

        this._setSVGPreamble(markup, options);
        this._setSVGHeader(markup, options);
        if (this.clipPath) {
          markup.push(
            '<g clip-path="url(#' + this.clipPath.clipPathId + ')" >\n'
          );
        }
        this._setSVGBgOverlayColor(markup, 'background');
        this._setSVGBgOverlayImage(markup, 'backgroundImage', reviver);
        this._setSVGObjects(markup, reviver);
        if (this.clipPath) {
          markup.push('</g>\n');
        }
        this._setSVGBgOverlayColor(markup, 'overlay');
        this._setSVGBgOverlayImage(markup, 'overlayImage', reviver);

        markup.push('</svg>');

        return markup.join('');
      },

      /**
       * @private
       */
      _setSVGPreamble: function (markup, options) {
        if (options.suppressPreamble) {
          return;
        }
        markup.push(
          '<?xml version="1.0" encoding="',
          options.encoding || 'UTF-8',
          '" standalone="no" ?>\n',
          '<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" ',
          '"http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">\n'
        );
      },

      /**
       * @private
       */
      _setSVGHeader: function (markup, options) {
        var width = options.width || this.width,
          height = options.height || this.height,
          vpt,
          viewBox = 'viewBox="0 0 ' + this.width + ' ' + this.height + '" ',
          NUM_FRACTION_DIGITS = fabric.Object.NUM_FRACTION_DIGITS;

        if (options.viewBox) {
          viewBox =
            'viewBox="' +
            options.viewBox.x +
            ' ' +
            options.viewBox.y +
            ' ' +
            options.viewBox.width +
            ' ' +
            options.viewBox.height +
            '" ';
        } else {
          if (this.svgViewportTransformation) {
            vpt = this.viewportTransform;
            viewBox =
              'viewBox="' +
              toFixed(-vpt[4] / vpt[0], NUM_FRACTION_DIGITS) +
              ' ' +
              toFixed(-vpt[5] / vpt[3], NUM_FRACTION_DIGITS) +
              ' ' +
              toFixed(this.width / vpt[0], NUM_FRACTION_DIGITS) +
              ' ' +
              toFixed(this.height / vpt[3], NUM_FRACTION_DIGITS) +
              '" ';
          }
        }

        markup.push(
          '<svg ',
          'xmlns="http://www.w3.org/2000/svg" ',
          'xmlns:xlink="http://www.w3.org/1999/xlink" ',
          'version="1.1" ',
          'width="',
          width,
          '" ',
          'height="',
          height,
          '" ',
          viewBox,
          'xml:space="preserve">\n',
          '<desc>Created with Fabric.js ',
          fabric.version,
          '</desc>\n',
          '<defs>\n',
          this.createSVGFontFacesMarkup(),
          this.createSVGRefElementsMarkup(),
          this.createSVGClipPathMarkup(options),
          '</defs>\n'
        );
      },

      createSVGClipPathMarkup: function (options) {
        var clipPath = this.clipPath;
        if (clipPath) {
          clipPath.clipPathId = 'CLIPPATH_' + fabric.Object.__uid++;
          return (
            '<clipPath id="' +
            clipPath.clipPathId +
            '" >\n' +
            this.clipPath.toClipPathSVG(options.reviver) +
            '</clipPath>\n'
          );
        }
        return '';
      },

      /**
       * Creates markup containing SVG referenced elements like patterns, gradients etc.
       * @return {String}
       */
      createSVGRefElementsMarkup: function () {
        var _this = this,
          markup = ['background', 'overlay'].map(function (prop) {
            var fill = _this[prop + 'Color'];
            if (fill && fill.toLive) {
              var shouldTransform = _this[prop + 'Vpt'],
                vpt = _this.viewportTransform,
                object = {
                  width: _this.width / (shouldTransform ? vpt[0] : 1),
                  height: _this.height / (shouldTransform ? vpt[3] : 1),
                };
              return fill.toSVG(object, {
                additionalTransform: shouldTransform
                  ? fabric.util.matrixToSVG(vpt)
                  : '',
              });
            }
            return undefined;
          });
        return markup.join('');
      },

      /**
       * Creates markup containing SVG font faces,
       * font URLs for font faces must be collected by developers
       * and are not extracted from the DOM by fabricjs
       * @param {Array} objects Array of fabric objects
       * @return {String}
       */
      createSVGFontFacesMarkup: function () {
        var markup = '',
          fontList = {},
          obj,
          fontFamily,
          style,
          row,
          rowIndex,
          _char,
          charIndex,
          i,
          len,
          fontPaths = fabric.fontPaths,
          objects = [];

        this._objects.forEach(function add(object) {
          objects.push(object);
          if (object._objects) {
            object._objects.forEach(add);
          }
        });

        for (i = 0, len = objects.length; i < len; i++) {
          obj = objects[i];
          fontFamily = obj.fontFamily;
          if (
            obj.type.indexOf('text') === -1 ||
            fontList[fontFamily] ||
            !fontPaths[fontFamily]
          ) {
            continue;
          }
          fontList[fontFamily] = true;
          if (!obj.styles) {
            continue;
          }
          style = obj.styles;
          for (rowIndex in style) {
            row = style[rowIndex];
            for (charIndex in row) {
              _char = row[charIndex];
              fontFamily = _char.fontFamily;
              if (!fontList[fontFamily] && fontPaths[fontFamily]) {
                fontList[fontFamily] = true;
              }
            }
          }
        }

        for (var j in fontList) {
          markup += [
            '\t\t@font-face {\n',
            "\t\t\tfont-family: '",
            j,
            "';\n",
            "\t\t\tsrc: url('",
            fontPaths[j],
            "');\n",
            '\t\t}\n',
          ].join('');
        }

        if (markup) {
          markup = [
            '\t<style type="text/css">',
            '<![CDATA[\n',
            markup,
            ']]>',
            '</style>\n',
          ].join('');
        }

        return markup;
      },

      /**
       * @private
       */
      _setSVGObjects: function (markup, reviver) {
        var instance,
          i,
          len,
          objects = this._objects;
        for (i = 0, len = objects.length; i < len; i++) {
          instance = objects[i];
          if (instance.excludeFromExport) {
            continue;
          }
          this._setSVGObject(markup, instance, reviver);
        }
      },

      /**
       * @private
       */
      _setSVGObject: function (markup, instance, reviver) {
        markup.push(instance.toSVG(reviver));
      },

      /**
       * @private
       */
      _setSVGBgOverlayImage: function (markup, property, reviver) {
        if (
          this[property] &&
          !this[property].excludeFromExport &&
          this[property].toSVG
        ) {
          markup.push(this[property].toSVG(reviver));
        }
      },

      /**
       * @private
       */
      _setSVGBgOverlayColor: function (markup, property) {
        var filler = this[property + 'Color'],
          vpt = this.viewportTransform,
          finalWidth = this.width,
          finalHeight = this.height;
        if (!filler) {
          return;
        }
        if (filler.toLive) {
          var repeat = filler.repeat,
            iVpt = fabric.util.invertTransform(vpt),
            shouldInvert = this[property + 'Vpt'],
            additionalTransform = shouldInvert
              ? fabric.util.matrixToSVG(iVpt)
              : '';
          markup.push(
            '<rect transform="' + additionalTransform + ' translate(',
            finalWidth / 2,
            ',',
            finalHeight / 2,
            ')"',
            ' x="',
            filler.offsetX - finalWidth / 2,
            '" y="',
            filler.offsetY - finalHeight / 2,
            '" ',
            'width="',
            repeat === 'repeat-y' || repeat === 'no-repeat'
              ? filler.source.width
              : finalWidth,
            '" height="',
            repeat === 'repeat-x' || repeat === 'no-repeat'
              ? filler.source.height
              : finalHeight,
            '" fill="url(#SVGID_' + filler.id + ')"',
            '></rect>\n'
          );
        } else {
          markup.push(
            '<rect x="0" y="0" width="100%" height="100%" ',
            'fill="',
            filler,
            '"',
            '></rect>\n'
          );
        }
      },
      /* _TO_SVG_END_ */

      /**
       * Moves an object or the objects of a multiple selection
       * to the bottom of the stack of drawn objects
       * @param {fabric.Object} object Object to send to back
       * @return {fabric.Canvas} thisArg
       * @chainable
       */
      sendToBack: function (object) {
        if (!object) {
          return this;
        }
        var activeSelection = this._activeObject,
          i,
          obj,
          objs;
        if (object === activeSelection && object.type === 'activeSelection') {
          objs = activeSelection._objects;
          for (i = objs.length; i--; ) {
            obj = objs[i];
            removeFromArray(this._objects, obj);
            this._objects.unshift(obj);
          }
        } else {
          removeFromArray(this._objects, object);
          this._objects.unshift(object);
        }
        this.renderOnAddRemove && this.requestRenderAll();
        return this;
      },

      /**
       * Moves an object or the objects of a multiple selection
       * to the top of the stack of drawn objects
       * @param {fabric.Object} object Object to send
       * @return {fabric.Canvas} thisArg
       * @chainable
       */
      bringToFront: function (object) {
        if (!object) {
          return this;
        }
        var activeSelection = this._activeObject,
          i,
          obj,
          objs;
        if (object === activeSelection && object.type === 'activeSelection') {
          objs = activeSelection._objects;
          for (i = 0; i < objs.length; i++) {
            obj = objs[i];
            removeFromArray(this._objects, obj);
            this._objects.push(obj);
          }
        } else {
          removeFromArray(this._objects, object);
          this._objects.push(object);
        }
        this.renderOnAddRemove && this.requestRenderAll();
        return this;
      },

      /**
       * Moves an object or a selection down in stack of drawn objects
       * An optional paramter, intersecting allowes to move the object in behind
       * the first intersecting object. Where intersection is calculated with
       * bounding box. If no intersection is found, there will not be change in the
       * stack.
       * @param {fabric.Object} object Object to send
       * @param {Boolean} [intersecting] If `true`, send object behind next lower intersecting object
       * @return {fabric.Canvas} thisArg
       * @chainable
       */
      sendBackwards: function (object, intersecting) {
        if (!object) {
          return this;
        }
        var activeSelection = this._activeObject,
          i,
          obj,
          idx,
          newIdx,
          objs,
          objsMoved = 0;

        if (object === activeSelection && object.type === 'activeSelection') {
          objs = activeSelection._objects;
          for (i = 0; i < objs.length; i++) {
            obj = objs[i];
            idx = this._objects.indexOf(obj);
            if (idx > 0 + objsMoved) {
              newIdx = idx - 1;
              removeFromArray(this._objects, obj);
              this._objects.splice(newIdx, 0, obj);
            }
            objsMoved++;
          }
        } else {
          idx = this._objects.indexOf(object);
          if (idx !== 0) {
            // if object is not on the bottom of stack
            newIdx = this._findNewLowerIndex(object, idx, intersecting);
            removeFromArray(this._objects, object);
            this._objects.splice(newIdx, 0, object);
          }
        }
        this.renderOnAddRemove && this.requestRenderAll();
        return this;
      },

      /**
       * @private
       */
      _findNewLowerIndex: function (object, idx, intersecting) {
        var newIdx, i;

        if (intersecting) {
          newIdx = idx;

          // traverse down the stack looking for the nearest intersecting object
          for (i = idx - 1; i >= 0; --i) {
            var isIntersecting =
              object.intersectsWithObject(this._objects[i]) ||
              object.isContainedWithinObject(this._objects[i]) ||
              this._objects[i].isContainedWithinObject(object);

            if (isIntersecting) {
              newIdx = i;
              break;
            }
          }
        } else {
          newIdx = idx - 1;
        }

        return newIdx;
      },

      /**
       * Moves an object or a selection up in stack of drawn objects
       * An optional paramter, intersecting allowes to move the object in front
       * of the first intersecting object. Where intersection is calculated with
       * bounding box. If no intersection is found, there will not be change in the
       * stack.
       * @param {fabric.Object} object Object to send
       * @param {Boolean} [intersecting] If `true`, send object in front of next upper intersecting object
       * @return {fabric.Canvas} thisArg
       * @chainable
       */
      bringForward: function (object, intersecting) {
        if (!object) {
          return this;
        }
        var activeSelection = this._activeObject,
          i,
          obj,
          idx,
          newIdx,
          objs,
          objsMoved = 0;

        if (object === activeSelection && object.type === 'activeSelection') {
          objs = activeSelection._objects;
          for (i = objs.length; i--; ) {
            obj = objs[i];
            idx = this._objects.indexOf(obj);
            if (idx < this._objects.length - 1 - objsMoved) {
              newIdx = idx + 1;
              removeFromArray(this._objects, obj);
              this._objects.splice(newIdx, 0, obj);
            }
            objsMoved++;
          }
        } else {
          idx = this._objects.indexOf(object);
          if (idx !== this._objects.length - 1) {
            // if object is not on top of stack (last item in an array)
            newIdx = this._findNewUpperIndex(object, idx, intersecting);
            removeFromArray(this._objects, object);
            this._objects.splice(newIdx, 0, object);
          }
        }
        this.renderOnAddRemove && this.requestRenderAll();
        return this;
      },

      /**
       * @private
       */
      _findNewUpperIndex: function (object, idx, intersecting) {
        var newIdx, i, len;

        if (intersecting) {
          newIdx = idx;

          // traverse up the stack looking for the nearest intersecting object
          for (i = idx + 1, len = this._objects.length; i < len; ++i) {
            var isIntersecting =
              object.intersectsWithObject(this._objects[i]) ||
              object.isContainedWithinObject(this._objects[i]) ||
              this._objects[i].isContainedWithinObject(object);

            if (isIntersecting) {
              newIdx = i;
              break;
            }
          }
        } else {
          newIdx = idx + 1;
        }

        return newIdx;
      },

      /**
       * Moves an object to specified level in stack of drawn objects
       * @param {fabric.Object} object Object to send
       * @param {Number} index Position to move to
       * @return {fabric.Canvas} thisArg
       * @chainable
       */
      moveTo: function (object, index) {
        removeFromArray(this._objects, object);
        this._objects.splice(index, 0, object);
        return this.renderOnAddRemove && this.requestRenderAll();
      },

      /**
       * Clears a canvas element and dispose objects
       * @return {fabric.Canvas} thisArg
       * @chainable
       */
      dispose: function () {
        // cancel eventually ongoing renders
        if (this.isRendering) {
          fabric.util.cancelAnimFrame(this.isRendering);
          this.isRendering = 0;
        }
        this.forEachObject(function (object) {
          object.dispose && object.dispose();
        });
        this._objects = [];
        if (this.backgroundImage && this.backgroundImage.dispose) {
          this.backgroundImage.dispose();
        }
        this.backgroundImage = null;
        if (this.overlayImage && this.overlayImage.dispose) {
          this.overlayImage.dispose();
        }
        this.overlayImage = null;
        this._iTextInstances = null;
        this.contextContainer = null;
        fabric.util.cleanUpJsdomNode(this.lowerCanvasEl);
        this.lowerCanvasEl = undefined;
        return this;
      },

      /**
       * Returns a string representation of an instance
       * @return {String} string representation of an instance
       */
      toString: function () {
        return (
          '#<fabric.Canvas (' +
          this.complexity() +
          '): ' +
          '{ objects: ' +
          this._objects.length +
          ' }>'
        );
      },
    }
  );

  extend(fabric.StaticCanvas.prototype, fabric.Observable);
  extend(fabric.StaticCanvas.prototype, fabric.Collection);
  extend(fabric.StaticCanvas.prototype, fabric.DataURLExporter);

  extend(
    fabric.StaticCanvas,
    /** @lends fabric.StaticCanvas */ {
      /**
       * @static
       * @type String
       * @default
       */
      EMPTY_JSON: '{"objects": [], "background": "white"}',

      /**
       * Provides a way to check support of some of the canvas methods
       * (either those of HTMLCanvasElement itself, or rendering context)
       *
       * @param {String} methodName Method to check support for;
       *                            Could be one of "setLineDash"
       * @return {Boolean | null} `true` if method is supported (or at least exists),
       *                          `null` if canvas element or context can not be initialized
       */
      supports: function (methodName) {
        var el = createCanvasElement();

        if (!el || !el.getContext) {
          return null;
        }

        var ctx = el.getContext('2d');
        if (!ctx) {
          return null;
        }

        switch (methodName) {
          case 'setLineDash':
            return typeof ctx.setLineDash !== 'undefined';

          default:
            return null;
        }
      },
    }
  );

  /**
   * Returns JSON representation of canvas
   * @function
   * @param {Array} [propertiesToInclude] Any properties that you might want to additionally include in the output
   * @return {String} JSON string
   * @tutorial {@link http://fabricjs.com/fabric-intro-part-3#serialization}
   * @see {@link http://jsfiddle.net/fabricjs/pec86/|jsFiddle demo}
   * @example <caption>JSON without additional properties</caption>
   * var json = canvas.toJSON();
   * @example <caption>JSON with additional properties included</caption>
   * var json = canvas.toJSON(['lockMovementX', 'lockMovementY', 'lockRotation', 'lockScalingX', 'lockScalingY', 'lockUniScaling']);
   * @example <caption>JSON without default values</caption>
   * canvas.includeDefaultValues = false;
   * var json = canvas.toJSON();
   */
  fabric.StaticCanvas.prototype.toJSON = fabric.StaticCanvas.prototype.toObject;

  if (fabric.isLikelyNode) {
    fabric.StaticCanvas.prototype.createPNGStream = function () {
      var impl = getNodeCanvas(this.lowerCanvasEl);
      return impl && impl.createPNGStream();
    };
    fabric.StaticCanvas.prototype.createJPEGStream = function (opts) {
      var impl = getNodeCanvas(this.lowerCanvasEl);
      return impl && impl.createJPEGStream(opts);
    };
  }
})();
(function initToDataURL() {
  fabric.util.object.extend(
    fabric.StaticCanvas.prototype,
    /** @lends fabric.StaticCanvas.prototype */ {
      /**
       * Exports canvas element to a dataurl image. Note that when multiplier is used, cropping is scaled appropriately
       * @param {Object} [options] Options object
       * @param {String} [options.format=png] The format of the output image. Either "jpeg" or "png"
       * @param {Number} [options.quality=1] Quality level (0..1). Only used for jpeg.
       * @param {Number} [options.multiplier=1] Multiplier to scale by, to have consistent
       * @param {Number} [options.left] Cropping left offset. Introduced in v1.2.14
       * @param {Number} [options.top] Cropping top offset. Introduced in v1.2.14
       * @param {Number} [options.width] Cropping width. Introduced in v1.2.14
       * @param {Number} [options.height] Cropping height. Introduced in v1.2.14
       * @param {Boolean} [options.enableRetinaScaling] Enable retina scaling for clone image. Introduce in 2.0.0
       * @return {String} Returns a data: URL containing a representation of the object in the format specified by options.format
       * @see {@link http://jsfiddle.net/fabricjs/NfZVb/|jsFiddle demo}
       * @example <caption>Generate jpeg dataURL with lower quality</caption>
       * var dataURL = canvas.toDataURL({
       *   format: 'jpeg',
       *   quality: 0.8
       * });
       * @example <caption>Generate cropped png dataURL (clipping of canvas)</caption>
       * var dataURL = canvas.toDataURL({
       *   format: 'png',
       *   left: 100,
       *   top: 100,
       *   width: 200,
       *   height: 200
       * });
       * @example <caption>Generate double scaled png dataURL</caption>
       * var dataURL = canvas.toDataURL({
       *   format: 'png',
       *   multiplier: 2
       * });
       */
      toDataURL: function (options) {
        options || (options = {});

        var format = options.format || 'png',
          quality = options.quality || 1,
          multiplier =
            (options.multiplier || 1) *
            (options.enableRetinaScaling ? this.getRetinaScaling() : 1),
          canvasEl = this.toCanvasElement(multiplier, options);
        return fabric.util.toDataURL(canvasEl, format, quality);
      },

      /**
       * Create a new HTMLCanvas element painted with the current canvas content.
       * No need to resize the actual one or repaint it.
       * Will transfer object ownership to a new canvas, paint it, and set everything back.
       * This is an intermediary step used to get to a dataUrl but also it is useful to
       * create quick image copies of a canvas without passing for the dataUrl string
       * @param {Number} [multiplier] a zoom factor.
       * @param {Object} [cropping] Cropping informations
       * @param {Number} [cropping.left] Cropping left offset.
       * @param {Number} [cropping.top] Cropping top offset.
       * @param {Number} [cropping.width] Cropping width.
       * @param {Number} [cropping.height] Cropping height.
       */
      toCanvasElement: function (multiplier, cropping) {
        multiplier = multiplier || 1;
        cropping = cropping || {};
        var scaledWidth = (cropping.width || this.width) * multiplier,
          scaledHeight = (cropping.height || this.height) * multiplier,
          zoom = this.getZoom(),
          originalWidth = this.width,
          originalHeight = this.height,
          newZoom = zoom * multiplier,
          vp = this.viewportTransform,
          translateX = (vp[4] - (cropping.left || 0)) * multiplier,
          translateY = (vp[5] - (cropping.top || 0)) * multiplier,
          originalInteractive = this.interactive,
          newVp = [newZoom, 0, 0, newZoom, translateX, translateY],
          originalRetina = this.enableRetinaScaling,
          canvasEl = fabric.util.createCanvasElement(),
          originalContextTop = this.contextTop;
        canvasEl.width = scaledWidth;
        canvasEl.height = scaledHeight;
        this.contextTop = null;
        this.enableRetinaScaling = false;
        this.interactive = false;
        this.viewportTransform = newVp;
        this.width = scaledWidth;
        this.height = scaledHeight;
        this.calcViewportBoundaries();
        this.renderCanvas(canvasEl.getContext('2d'), this._objects);
        this.viewportTransform = vp;
        this.width = originalWidth;
        this.height = originalHeight;
        this.calcViewportBoundaries();
        this.interactive = originalInteractive;
        this.enableRetinaScaling = originalRetina;
        this.contextTop = originalContextTop;
        return canvasEl;
      },
    }
  );
})();
(function init2dRoot(global) {
  var fabric = global.fabric || (global.fabric = {}),
    extend = fabric.util.object.extend,
    clone = fabric.util.object.clone,
    toFixed = fabric.util.toFixed,
    capitalize = fabric.util.string.capitalize,
    degreesToRadians = fabric.util.degreesToRadians,
    supportsLineDash = fabric.StaticCanvas.supports('setLineDash'),
    objectCaching = !fabric.isLikelyNode,
    ALIASING_LIMIT = 2;

  if (fabric.Object) {
    return;
  }

  /**
   * Root object class from which all 2d shape classes inherit from
   * @class fabric.Object
   * @tutorial {@link http://fabricjs.com/fabric-intro-part-1#objects}
   * @see {@link fabric.Object#initialize} for constructor definition
   *
   * @fires added
   * @fires removed
   *
   * @fires selected
   * @fires deselected
   * @fires modified
   * @fires modified
   * @fires moved
   * @fires scaled
   * @fires rotated
   * @fires skewed
   *
   * @fires rotating
   * @fires scaling
   * @fires moving
   * @fires skewing
   *
   * @fires mousedown
   * @fires mouseup
   * @fires mouseover
   * @fires mouseout
   * @fires mousewheel
   * @fires mousedblclick
   *
   * @fires dragover
   * @fires dragenter
   * @fires dragleave
   * @fires drop
   */
  fabric.Object = fabric.util.createClass(
    fabric.CommonMethods,
    /** @lends fabric.Object.prototype */ {
      /**
       * Type of an object (rect, circle, path, etc.).
       * Note that this property is meant to be read-only and not meant to be modified.
       * If you modify, certain parts of Fabric (such as JSON loading) won't work correctly.
       * @type String
       * @default
       */
      type: 'object',

      /**
       * Horizontal origin of transformation of an object (one of "left", "right", "center")
       * See http://jsfiddle.net/1ow02gea/244/ on how originX/originY affect objects in groups
       * @type String
       * @default
       */
      originX: 'left',

      /**
       * Vertical origin of transformation of an object (one of "top", "bottom", "center")
       * See http://jsfiddle.net/1ow02gea/244/ on how originX/originY affect objects in groups
       * @type String
       * @default
       */
      originY: 'top',

      /**
       * Top position of an object. Note that by default it's relative to object top. You can change this by setting originY={top/center/bottom}
       * @type Number
       * @default
       */
      top: 0,

      /**
       * Left position of an object. Note that by default it's relative to object left. You can change this by setting originX={left/center/right}
       * @type Number
       * @default
       */
      left: 0,

      /**
       * Object width
       * @type Number
       * @default
       */
      width: 0,

      /**
       * Object height
       * @type Number
       * @default
       */
      height: 0,

      /**
       * Object scale factor (horizontal)
       * @type Number
       * @default
       */
      scaleX: 1,

      /**
       * Object scale factor (vertical)
       * @type Number
       * @default
       */
      scaleY: 1,

      /**
       * When true, an object is rendered as flipped horizontally
       * @type Boolean
       * @default
       */
      flipX: false,

      /**
       * When true, an object is rendered as flipped vertically
       * @type Boolean
       * @default
       */
      flipY: false,

      /**
       * Opacity of an object
       * @type Number
       * @default
       */
      opacity: 1,

      /**
       * Angle of rotation of an object (in degrees)
       * @type Number
       * @default
       */
      angle: 0,

      /**
       * Angle of skew on x axes of an object (in degrees)
       * @type Number
       * @default
       */
      skewX: 0,

      /**
       * Angle of skew on y axes of an object (in degrees)
       * @type Number
       * @default
       */
      skewY: 0,

      /**
       * Size of object's controlling corners (in pixels)
       * @type Number
       * @default
       */
      cornerSize: 13,

      /**
       * When true, object's controlling corners are rendered as transparent inside (i.e. stroke instead of fill)
       * @type Boolean
       * @default
       */
      transparentCorners: true,

      /**
       * Default cursor value used when hovering over this object on canvas
       * @type String
       * @default
       */
      hoverCursor: null,

      /**
       * Default cursor value used when moving this object on canvas
       * @type String
       * @default
       */
      moveCursor: null,

      /**
       * Padding between object and its controlling borders (in pixels)
       * @type Number
       * @default
       */
      padding: 0,

      /**
       * Color of controlling borders of an object (when it's active)
       * @type String
       * @default
       */
      borderColor: 'rgba(102,153,255,0.75)',

      /**
       * Array specifying dash pattern of an object's borders (hasBorder must be true)
       * @since 1.6.2
       * @type Array
       */
      borderDashArray: null,

      /**
       * Color of controlling corners of an object (when it's active)
       * @type String
       * @default
       */
      cornerColor: 'rgba(102,153,255,0.5)',

      /**
       * Color of controlling corners of an object (when it's active and transparentCorners false)
       * @since 1.6.2
       * @type String
       * @default
       */
      cornerStrokeColor: null,

      /**
       * Specify style of control, 'rect' or 'circle'
       * @since 1.6.2
       * @type String
       */
      cornerStyle: 'rect',

      /**
       * Array specifying dash pattern of an object's control (hasBorder must be true)
       * @since 1.6.2
       * @type Array
       */
      cornerDashArray: null,

      /**
       * When true, this object will use center point as the origin of transformation
       * when being scaled via the controls.
       * <b>Backwards incompatibility note:</b> This property replaces "centerTransform" (Boolean).
       * @since 1.3.4
       * @type Boolean
       * @default
       */
      centeredScaling: false,

      /**
       * When true, this object will use center point as the origin of transformation
       * when being rotated via the controls.
       * <b>Backwards incompatibility note:</b> This property replaces "centerTransform" (Boolean).
       * @since 1.3.4
       * @type Boolean
       * @default
       */
      centeredRotation: true,

      /**
       * Color of object's fill
       * takes css colors https://www.w3.org/TR/css-color-3/
       * @type String
       * @default
       */
      fill: 'rgb(0,0,0)',

      /**
       * Fill rule used to fill an object
       * accepted values are nonzero, evenodd
       * <b>Backwards incompatibility note:</b> This property was used for setting globalCompositeOperation until v1.4.12 (use `fabric.Object#globalCompositeOperation` instead)
       * @type String
       * @default
       */
      fillRule: 'nonzero',

      /**
       * Composite rule used for canvas globalCompositeOperation
       * @type String
       * @default
       */
      globalCompositeOperation: 'source-over',

      /**
       * Background color of an object.
       * takes css colors https://www.w3.org/TR/css-color-3/
       * @type String
       * @default
       */
      backgroundColor: '',

      /**
       * Selection Background color of an object. colored layer behind the object when it is active.
       * does not mix good with globalCompositeOperation methods.
       * @type String
       * @default
       */
      selectionBackgroundColor: '',

      /**
       * When defined, an object is rendered via stroke and this property specifies its color
       * takes css colors https://www.w3.org/TR/css-color-3/
       * @type String
       * @default
       */
      stroke: null,

      /**
       * Width of a stroke used to render this object
       * @type Number
       * @default
       */
      strokeWidth: 1,

      /**
       * Array specifying dash pattern of an object's stroke (stroke must be defined)
       * @type Array
       */
      strokeDashArray: null,

      /**
       * Line offset of an object's stroke
       * @type Number
       * @default
       */
      strokeDashOffset: 0,

      /**
       * Line endings style of an object's stroke (one of "butt", "round", "square")
       * @type String
       * @default
       */
      strokeLineCap: 'butt',

      /**
       * Corner style of an object's stroke (one of "bevil", "round", "miter")
       * @type String
       * @default
       */
      strokeLineJoin: 'miter',

      /**
       * Maximum miter length (used for strokeLineJoin = "miter") of an object's stroke
       * @type Number
       * @default
       */
      strokeMiterLimit: 4,

      /**
       * Shadow object representing shadow of this shape
       * @type fabric.Shadow
       * @default
       */
      shadow: null,

      /**
       * Opacity of object's controlling borders when object is active and moving
       * @type Number
       * @default
       */
      borderOpacityWhenMoving: 0.4,

      /**
       * Scale factor of object's controlling borders
       * bigger number will make a thicker border
       * border is 1, so this is basically a border tickness
       * since there is no way to change the border itself.
       * @type Number
       * @default
       */
      borderScaleFactor: 1,

      /**
       * Transform matrix (similar to SVG's transform matrix)
       * This property has been depreacted. Since caching and and qrDecompose this
       * property can be handled with the standard top,left,scaleX,scaleY,angle and skewX.
       * A documentation example on how to parse and merge a transformMatrix will be provided before
       * completely removing it in fabric 4.0
       * If you are starting a project now, DO NOT use it.
       * @deprecated since 3.2.0
       * @type Array
       */
      transformMatrix: null,

      /**
       * Minimum allowed scale value of an object
       * @type Number
       * @default
       */
      minScaleLimit: 0,

      /**
       * When set to `false`, an object can not be selected for modification (using either point-click-based or group-based selection).
       * But events still fire on it.
       * @type Boolean
       * @default
       */
      selectable: true,

      /**
       * When set to `false`, an object can not be a target of events. All events propagate through it. Introduced in v1.3.4
       * @type Boolean
       * @default
       */
      evented: true,

      /**
       * When set to `false`, an object is not rendered on canvas
       * @type Boolean
       * @default
       */
      visible: true,

      /**
       * When set to `false`, object's controls are not displayed and can not be used to manipulate object
       * @type Boolean
       * @default
       */
      hasControls: true,

      /**
       * When set to `false`, object's controlling borders are not rendered
       * @type Boolean
       * @default
       */
      hasBorders: true,

      /**
       * When set to `false`, object's controlling rotating point will not be visible or selectable
       * @type Boolean
       * @default
       */
      hasRotatingPoint: true,

      /**
       * Offset for object's controlling rotating point (when enabled via `hasRotatingPoint`)
       * @type Number
       * @default
       */
      rotatingPointOffset: 40,

      /**
       * When set to `true`, objects are "found" on canvas on per-pixel basis rather than according to bounding box
       * @type Boolean
       * @default
       */
      perPixelTargetFind: false,

      /**
       * When `false`, default object's values are not included in its serialization
       * @type Boolean
       * @default
       */
      includeDefaultValues: true,

      /**
       * Function that determines clipping of an object (context is passed as a first argument).
       * If you are using code minification, ctx argument can be minified/manglied you should use
       * as a workaround `var ctx = arguments[0];` in the function;
       * Note that context origin is at the object's center point (not left/top corner)
       * @deprecated since 2.0.0
       * @type Function
       */
      clipTo: null,

      /**
       * When `true`, object horizontal movement is locked
       * @type Boolean
       * @default
       */
      lockMovementX: false,

      /**
       * When `true`, object vertical movement is locked
       * @type Boolean
       * @default
       */
      lockMovementY: false,

      /**
       * When `true`, object rotation is locked
       * @type Boolean
       * @default
       */
      lockRotation: false,

      /**
       * When `true`, object horizontal scaling is locked
       * @type Boolean
       * @default
       */
      lockScalingX: false,

      /**
       * When `true`, object vertical scaling is locked
       * @type Boolean
       * @default
       */
      lockScalingY: false,

      /**
       * When `true`, object non-uniform scaling is locked
       * @type Boolean
       * @default
       */
      lockUniScaling: false,

      /**
       * When `true`, object horizontal skewing is locked
       * @type Boolean
       * @default
       */
      lockSkewingX: false,

      /**
       * When `true`, object vertical skewing is locked
       * @type Boolean
       * @default
       */
      lockSkewingY: false,

      /**
       * When `true`, object cannot be flipped by scaling into negative values
       * @type Boolean
       * @default
       */
      lockScalingFlip: false,

      /**
       * When `true`, object is not exported in OBJECT/JSON
       * @since 1.6.3
       * @type Boolean
       * @default
       */
      excludeFromExport: false,

      /**
       * When `true`, object is cached on an additional canvas.
       * When `false`, object is not cached unless necessary ( clipPath )
       * default to true
       * @since 1.7.0
       * @type Boolean
       * @default true
       */
      objectCaching: objectCaching,

      /**
       * When `true`, object properties are checked for cache invalidation. In some particular
       * situation you may want this to be disabled ( spray brush, very big, groups)
       * or if your application does not allow you to modify properties for groups child you want
       * to disable it for groups.
       * default to false
       * since 1.7.0
       * @type Boolean
       * @default false
       */
      statefullCache: false,

      /**
       * When `true`, cache does not get updated during scaling. The picture will get blocky if scaled
       * too much and will be redrawn with correct details at the end of scaling.
       * this setting is performance and application dependant.
       * default to true
       * since 1.7.0
       * @type Boolean
       * @default true
       */
      noScaleCache: true,

      /**
       * When `false`, the stoke width will scale with the object.
       * When `true`, the stroke will always match the exact pixel size entered for stroke width.
       * default to false
       * @since 2.6.0
       * @type Boolean
       * @default false
       * @type Boolean
       * @default false
       */
      strokeUniform: false,

      /**
       * When set to `true`, object's cache will be rerendered next render call.
       * since 1.7.0
       * @type Boolean
       * @default true
       */
      dirty: true,

      /**
       * keeps the value of the last hovered corner during mouse move.
       * 0 is no corner, or 'mt', 'ml', 'mtr' etc..
       * It should be private, but there is no harm in using it as
       * a read-only property.
       * @type number|string|any
       * @default 0
       */
      __corner: 0,

      /**
       * Determines if the fill or the stroke is drawn first (one of "fill" or "stroke")
       * @type String
       * @default
       */
      paintFirst: 'fill',

      /**
       * List of properties to consider when checking if state
       * of an object is changed (fabric.Object#hasStateChanged)
       * as well as for history (undo/redo) purposes
       * @type Array
       */
      stateProperties: (
        'top left width height scaleX scaleY flipX flipY originX originY transformMatrix ' +
        'stroke strokeWidth strokeDashArray strokeLineCap strokeDashOffset strokeLineJoin strokeMiterLimit ' +
        'angle opacity fill globalCompositeOperation shadow clipTo visible backgroundColor ' +
        'skewX skewY fillRule paintFirst clipPath strokeUniform'
      ).split(' '),

      /**
       * List of properties to consider when checking if cache needs refresh
       * Those properties are checked by statefullCache ON ( or lazy mode if we want ) or from single
       * calls to Object.set(key, value). If the key is in this list, the object is marked as dirty
       * and refreshed at the next render
       * @type Array
       */
      cacheProperties: (
        'fill stroke strokeWidth strokeDashArray width height paintFirst strokeUniform' +
        ' strokeLineCap strokeDashOffset strokeLineJoin strokeMiterLimit backgroundColor clipPath'
      ).split(' '),

      /**
       * a fabricObject that, without stroke define a clipping area with their shape. filled in black
       * the clipPath object gets used when the object has rendered, and the context is placed in the center
       * of the object cacheCanvas.
       * If you want 0,0 of a clipPath to align with an object center, use clipPath.originX/Y to 'center'
       * @type fabric.Object
       */
      clipPath: undefined,

      /**
       * Meaningful ONLY when the object is used as clipPath.
       * if true, the clipPath will make the object clip to the outside of the clipPath
       * since 2.4.0
       * @type boolean
       * @default false
       */
      inverted: false,

      /**
       * Meaningful ONLY when the object is used as clipPath.
       * if true, the clipPath will have its top and left relative to canvas, and will
       * not be influenced by the object transform. This will make the clipPath relative
       * to the canvas, but clipping just a particular object.
       * WARNING this is beta, this feature may change or be renamed.
       * since 2.4.0
       * @type boolean
       * @default false
       */
      absolutePositioned: false,

      /**
       * Constructor
       * @param {Object} [options] Options object
       */
      initialize: function (options) {
        if (options) {
          this.setOptions(options);
        }
      },

      /**
       * Create a the canvas used to keep the cached copy of the object
       * @private
       */
      _createCacheCanvas: function () {
        this._cacheProperties = {};
        this._cacheCanvas = fabric.util.createCanvasElement();
        this._cacheContext = this._cacheCanvas.getContext('2d');
        this._updateCacheCanvas();
        // if canvas gets created, is empty, so dirty.
        this.dirty = true;
      },

      /**
       * Limit the cache dimensions so that X * Y do not cross fabric.perfLimitSizeTotal
       * and each side do not cross fabric.cacheSideLimit
       * those numbers are configurable so that you can get as much detail as you want
       * making bargain with performances.
       * @param {Object} dims
       * @param {Object} dims.width width of canvas
       * @param {Object} dims.height height of canvas
       * @param {Object} dims.zoomX zoomX zoom value to unscale the canvas before drawing cache
       * @param {Object} dims.zoomY zoomY zoom value to unscale the canvas before drawing cache
       * @return {Object}.width width of canvas
       * @return {Object}.height height of canvas
       * @return {Object}.zoomX zoomX zoom value to unscale the canvas before drawing cache
       * @return {Object}.zoomY zoomY zoom value to unscale the canvas before drawing cache
       */
      _limitCacheSize: function (dims) {
        var perfLimitSizeTotal = fabric.perfLimitSizeTotal,
          width = dims.width,
          height = dims.height,
          max = fabric.maxCacheSideLimit,
          min = fabric.minCacheSideLimit;
        if (
          width <= max &&
          height <= max &&
          width * height <= perfLimitSizeTotal
        ) {
          if (width < min) {
            dims.width = min;
          }
          if (height < min) {
            dims.height = min;
          }
          return dims;
        }
        var ar = width / height,
          limitedDims = fabric.util.limitDimsByArea(ar, perfLimitSizeTotal),
          capValue = fabric.util.capValue,
          x = capValue(min, limitedDims.x, max),
          y = capValue(min, limitedDims.y, max);
        if (width > x) {
          dims.zoomX /= width / x;
          dims.width = x;
          dims.capped = true;
        }
        if (height > y) {
          dims.zoomY /= height / y;
          dims.height = y;
          dims.capped = true;
        }
        return dims;
      },

      /**
       * Return the dimension and the zoom level needed to create a cache canvas
       * big enough to host the object to be cached.
       * @private
       * @return {Object}.x width of object to be cached
       * @return {Object}.y height of object to be cached
       * @return {Object}.width width of canvas
       * @return {Object}.height height of canvas
       * @return {Object}.zoomX zoomX zoom value to unscale the canvas before drawing cache
       * @return {Object}.zoomY zoomY zoom value to unscale the canvas before drawing cache
       */
      _getCacheCanvasDimensions: function () {
        var objectScale = this.getTotalObjectScaling(),
          // caculate dimensions without skewing
          dim = this._getTransformedDimensions(0, 0),
          neededX = (dim.x * objectScale.scaleX) / this.scaleX,
          neededY = (dim.y * objectScale.scaleY) / this.scaleY;
        return {
          // for sure this ALIASING_LIMIT is slightly creating problem
          // in situation in which the cache canvas gets an upper limit
          // also objectScale contains already scaleX and scaleY
          width: neededX + ALIASING_LIMIT,
          height: neededY + ALIASING_LIMIT,
          zoomX: objectScale.scaleX,
          zoomY: objectScale.scaleY,
          x: neededX,
          y: neededY,
        };
      },

      /**
       * Update width and height of the canvas for cache
       * returns true or false if canvas needed resize.
       * @private
       * @return {Boolean} true if the canvas has been resized
       */
      _updateCacheCanvas: function () {
        var targetCanvas = this.canvas;
        if (
          this.noScaleCache &&
          targetCanvas &&
          targetCanvas._currentTransform
        ) {
          var target = targetCanvas._currentTransform.target,
            action = targetCanvas._currentTransform.action;
          if (
            this === target &&
            action.slice &&
            action.slice(0, 5) === 'scale'
          ) {
            return false;
          }
        }
        var canvas = this._cacheCanvas,
          dims = this._limitCacheSize(this._getCacheCanvasDimensions()),
          minCacheSize = fabric.minCacheSideLimit,
          width = dims.width,
          height = dims.height,
          drawingWidth,
          drawingHeight,
          zoomX = dims.zoomX,
          zoomY = dims.zoomY,
          dimensionsChanged =
            width !== this.cacheWidth || height !== this.cacheHeight,
          zoomChanged = this.zoomX !== zoomX || this.zoomY !== zoomY,
          shouldRedraw = dimensionsChanged || zoomChanged,
          additionalWidth = 0,
          additionalHeight = 0,
          shouldResizeCanvas = false;
        if (dimensionsChanged) {
          var canvasWidth = this._cacheCanvas.width,
            canvasHeight = this._cacheCanvas.height,
            sizeGrowing = width > canvasWidth || height > canvasHeight,
            sizeShrinking =
              (width < canvasWidth * 0.9 || height < canvasHeight * 0.9) &&
              canvasWidth > minCacheSize &&
              canvasHeight > minCacheSize;
          shouldResizeCanvas = sizeGrowing || sizeShrinking;
          if (
            sizeGrowing &&
            !dims.capped &&
            (width > minCacheSize || height > minCacheSize)
          ) {
            additionalWidth = width * 0.1;
            additionalHeight = height * 0.1;
          }
        }
        if (shouldRedraw) {
          if (shouldResizeCanvas) {
            canvas.width = Math.ceil(width + additionalWidth);
            canvas.height = Math.ceil(height + additionalHeight);
          } else {
            this._cacheContext.setTransform(1, 0, 0, 1, 0, 0);
            this._cacheContext.clearRect(0, 0, canvas.width, canvas.height);
          }
          drawingWidth = dims.x / 2;
          drawingHeight = dims.y / 2;
          this.cacheTranslationX =
            Math.round(canvas.width / 2 - drawingWidth) + drawingWidth;
          this.cacheTranslationY =
            Math.round(canvas.height / 2 - drawingHeight) + drawingHeight;
          this.cacheWidth = width;
          this.cacheHeight = height;
          this._cacheContext.translate(
            this.cacheTranslationX,
            this.cacheTranslationY
          );
          this._cacheContext.scale(zoomX, zoomY);
          this.zoomX = zoomX;
          this.zoomY = zoomY;
          return true;
        }
        return false;
      },

      /**
       * Sets object's properties from options
       * @param {Object} [options] Options object
       */
      setOptions: function (options) {
        this._setOptions(options);
        this._initGradient(options.fill, 'fill');
        this._initGradient(options.stroke, 'stroke');
        this._initClipping(options);
        this._initPattern(options.fill, 'fill');
        this._initPattern(options.stroke, 'stroke');
      },

      /**
       * Transforms context when rendering an object
       * @param {CanvasRenderingContext2D} ctx Context
       */
      transform: function (ctx) {
        var m;
        if (this.group && !this.group._transformDone) {
          m = this.calcTransformMatrix();
        } else {
          m = this.calcOwnMatrix();
        }
        ctx.transform(m[0], m[1], m[2], m[3], m[4], m[5]);
      },

      /**
       * Returns an object representation of an instance
       * @param {Array} [propertiesToInclude] Any properties that you might want to additionally include in the output
       * @return {Object} Object representation of an instance
       */
      toObject: function (propertiesToInclude) {
        var NUM_FRACTION_DIGITS = fabric.Object.NUM_FRACTION_DIGITS,
          object = {
            type: this.type,
            version: fabric.version,
            originX: this.originX,
            originY: this.originY,
            left: toFixed(this.left, NUM_FRACTION_DIGITS),
            top: toFixed(this.top, NUM_FRACTION_DIGITS),
            width: toFixed(this.width, NUM_FRACTION_DIGITS),
            height: toFixed(this.height, NUM_FRACTION_DIGITS),
            fill:
              this.fill && this.fill.toObject
                ? this.fill.toObject()
                : this.fill,
            stroke:
              this.stroke && this.stroke.toObject
                ? this.stroke.toObject()
                : this.stroke,
            strokeWidth: toFixed(this.strokeWidth, NUM_FRACTION_DIGITS),
            strokeDashArray: this.strokeDashArray
              ? this.strokeDashArray.concat()
              : this.strokeDashArray,
            strokeLineCap: this.strokeLineCap,
            strokeDashOffset: this.strokeDashOffset,
            strokeLineJoin: this.strokeLineJoin,
            // TODO: add this before release
            // strokeUniform:            this.strokeUniform,
            strokeMiterLimit: toFixed(
              this.strokeMiterLimit,
              NUM_FRACTION_DIGITS
            ),
            scaleX: toFixed(this.scaleX, NUM_FRACTION_DIGITS),
            scaleY: toFixed(this.scaleY, NUM_FRACTION_DIGITS),
            angle: toFixed(this.angle, NUM_FRACTION_DIGITS),
            flipX: this.flipX,
            flipY: this.flipY,
            opacity: toFixed(this.opacity, NUM_FRACTION_DIGITS),
            shadow:
              this.shadow && this.shadow.toObject
                ? this.shadow.toObject()
                : this.shadow,
            visible: this.visible,
            clipTo: this.clipTo && String(this.clipTo),
            backgroundColor: this.backgroundColor,
            fillRule: this.fillRule,
            paintFirst: this.paintFirst,
            globalCompositeOperation: this.globalCompositeOperation,
            transformMatrix: this.transformMatrix
              ? this.transformMatrix.concat()
              : null,
            skewX: toFixed(this.skewX, NUM_FRACTION_DIGITS),
            skewY: toFixed(this.skewY, NUM_FRACTION_DIGITS),
          };

        if (this.clipPath) {
          object.clipPath = this.clipPath.toObject(propertiesToInclude);
          object.clipPath.inverted = this.clipPath.inverted;
          object.clipPath.absolutePositioned = this.clipPath.absolutePositioned;
        }

        fabric.util.populateWithProperties(this, object, propertiesToInclude);
        if (!this.includeDefaultValues) {
          object = this._removeDefaultValues(object);
        }

        return object;
      },

      /**
       * Returns (dataless) object representation of an instance
       * @param {Array} [propertiesToInclude] Any properties that you might want to additionally include in the output
       * @return {Object} Object representation of an instance
       */
      toDatalessObject: function (propertiesToInclude) {
        // will be overwritten by subclasses
        return this.toObject(propertiesToInclude);
      },

      /**
       * @private
       * @param {Object} object
       */
      _removeDefaultValues: function (object) {
        var prototype = fabric.util.getKlass(object.type).prototype,
          stateProperties = prototype.stateProperties;
        stateProperties.forEach(function (prop) {
          if (prop === 'left' || prop === 'top') {
            return;
          }
          if (object[prop] === prototype[prop]) {
            delete object[prop];
          }
          var isArray =
            Object.prototype.toString.call(object[prop]) === '[object Array]' &&
            Object.prototype.toString.call(prototype[prop]) ===
              '[object Array]';

          // basically a check for [] === []
          if (
            isArray &&
            object[prop].length === 0 &&
            prototype[prop].length === 0
          ) {
            delete object[prop];
          }
        });

        return object;
      },

      /**
       * Returns a string representation of an instance
       * @return {String}
       */
      toString: function () {
        return '#<fabric.' + capitalize(this.type) + '>';
      },

      /**
       * Return the object scale factor counting also the group scaling
       * @return {Object} object with scaleX and scaleY properties
       */
      getObjectScaling: function () {
        var options = fabric.util.qrDecompose(this.calcTransformMatrix());
        return {
          scaleX: Math.abs(options.scaleX),
          scaleY: Math.abs(options.scaleY),
        };
      },

      /**
       * Return the object scale factor counting also the group scaling, zoom and retina
       * @return {Object} object with scaleX and scaleY properties
       */
      getTotalObjectScaling: function () {
        var scale = this.getObjectScaling(),
          scaleX = scale.scaleX,
          scaleY = scale.scaleY;
        if (this.canvas) {
          var zoom = this.canvas.getZoom();
          var retina = this.canvas.getRetinaScaling();
          scaleX *= zoom * retina;
          scaleY *= zoom * retina;
        }
        return { scaleX: scaleX, scaleY: scaleY };
      },

      /**
       * Return the object opacity counting also the group property
       * @return {Number}
       */
      getObjectOpacity: function () {
        var opacity = this.opacity;
        if (this.group) {
          opacity *= this.group.getObjectOpacity();
        }
        return opacity;
      },

      /**
       * @private
       * @param {String} key
       * @param {*} value
       * @return {fabric.Object} thisArg
       */
      _set: function (key, value) {
        var shouldConstrainValue = key === 'scaleX' || key === 'scaleY',
          isChanged = this[key] !== value,
          groupNeedsUpdate = false;

        if (shouldConstrainValue) {
          value = this._constrainScale(value);
        }
        if (key === 'scaleX' && value < 0) {
          this.flipX = !this.flipX;
          value *= -1;
        } else if (key === 'scaleY' && value < 0) {
          this.flipY = !this.flipY;
          value *= -1;
        } else if (
          key === 'shadow' &&
          value &&
          !(value instanceof fabric.Shadow)
        ) {
          value = new fabric.Shadow(value);
        } else if (key === 'dirty' && this.group) {
          this.group.set('dirty', value);
        }

        this[key] = value;

        if (isChanged) {
          groupNeedsUpdate = this.group && this.group.isOnACache();
          if (this.cacheProperties.indexOf(key) > -1) {
            this.dirty = true;
            groupNeedsUpdate && this.group.set('dirty', true);
          } else if (
            groupNeedsUpdate &&
            this.stateProperties.indexOf(key) > -1
          ) {
            this.group.set('dirty', true);
          }
        }

        return this;
      },

      /**
       * This callback function is called by the parent group of an object every
       * time a non-delegated property changes on the group. It is passed the key
       * and value as parameters. Not adding in this function's signature to avoid
       * Travis build error about unused variables.
       */
      setOnGroup: function () {
        // implemented by sub-classes, as needed.
      },

      /**
       * Retrieves viewportTransform from Object's canvas if possible
       * @method getViewportTransform
       * @memberOf fabric.Object.prototype
       * @return {Array}
       */
      getViewportTransform: function () {
        if (this.canvas && this.canvas.viewportTransform) {
          return this.canvas.viewportTransform;
        }
        return fabric.iMatrix.concat();
      },

      /*
       * @private
       * return if the object would be visible in rendering
       * @memberOf fabric.Object.prototype
       * @return {Boolean}
       */
      isNotVisible: function () {
        return (
          this.opacity === 0 ||
          (this.width === 0 && this.height === 0 && this.strokeWidth === 0) ||
          !this.visible
        );
      },

      /**
       * Renders an object on a specified context
       * @param {CanvasRenderingContext2D} ctx Context to render on
       */
      render: function (ctx) {
        // do not render if width/height are zeros or object is not visible
        if (this.isNotVisible()) {
          return;
        }
        if (
          this.canvas &&
          this.canvas.skipOffscreen &&
          !this.group &&
          !this.isOnScreen()
        ) {
          return;
        }
        ctx.save();
        this._setupCompositeOperation(ctx);
        this.drawSelectionBackground(ctx);
        this.transform(ctx);
        this._setOpacity(ctx);
        this._setShadow(ctx, this);
        if (this.transformMatrix) {
          ctx.transform.apply(ctx, this.transformMatrix);
        }
        this.clipTo && fabric.util.clipContext(this, ctx);
        if (this.shouldCache()) {
          this.renderCache();
          this.drawCacheOnCanvas(ctx);
        } else {
          this._removeCacheCanvas();
          this.dirty = false;
          this.drawObject(ctx);
          if (this.objectCaching && this.statefullCache) {
            this.saveState({ propertySet: 'cacheProperties' });
          }
        }
        this.clipTo && ctx.restore();
        ctx.restore();
      },

      renderCache: function (options) {
        options = options || {};
        if (!this._cacheCanvas) {
          this._createCacheCanvas();
        }
        if (this.isCacheDirty()) {
          this.statefullCache &&
            this.saveState({ propertySet: 'cacheProperties' });
          this.drawObject(this._cacheContext, options.forClipping);
          this.dirty = false;
        }
      },

      /**
       * Remove cacheCanvas and its dimensions from the objects
       */
      _removeCacheCanvas: function () {
        this._cacheCanvas = null;
        this.cacheWidth = 0;
        this.cacheHeight = 0;
      },

      /**
       * return true if the object will draw a stroke
       * Does not consider text styles. This is just a shortcut used at rendering time
       * We want it to be an aproximation and be fast.
       * wrote to avoid extra caching, it has to return true when stroke happens,
       * can guess when it will not happen at 100% chance, does not matter if it misses
       * some use case where the stroke is invisible.
       * @since 3.0.0
       * @returns Boolean
       */
      hasStroke: function () {
        return (
          this.stroke && this.stroke !== 'transparent' && this.strokeWidth !== 0
        );
      },

      /**
       * return true if the object will draw a fill
       * Does not consider text styles. This is just a shortcut used at rendering time
       * We want it to be an aproximation and be fast.
       * wrote to avoid extra caching, it has to return true when fill happens,
       * can guess when it will not happen at 100% chance, does not matter if it misses
       * some use case where the fill is invisible.
       * @since 3.0.0
       * @returns Boolean
       */
      hasFill: function () {
        return this.fill && this.fill !== 'transparent';
      },

      /**
       * When set to `true`, force the object to have its own cache, even if it is inside a group
       * it may be needed when your object behave in a particular way on the cache and always needs
       * its own isolated canvas to render correctly.
       * Created to be overridden
       * since 1.7.12
       * @returns Boolean
       */
      needsItsOwnCache: function () {
        if (
          this.paintFirst === 'stroke' &&
          this.hasFill() &&
          this.hasStroke() &&
          typeof this.shadow === 'object'
        ) {
          return true;
        }
        if (this.clipPath) {
          return true;
        }
        return false;
      },

      /**
       * Decide if the object should cache or not. Create its own cache level
       * objectCaching is a global flag, wins over everything
       * needsItsOwnCache should be used when the object drawing method requires
       * a cache step. None of the fabric classes requires it.
       * Generally you do not cache objects in groups because the group outside is cached.
       * Read as: cache if is needed, or if the feature is enabled but we are not already caching.
       * @return {Boolean}
       */
      shouldCache: function () {
        this.ownCaching =
          this.needsItsOwnCache() ||
          (this.objectCaching && (!this.group || !this.group.isOnACache()));
        return this.ownCaching;
      },

      /**
       * Check if this object or a child object will cast a shadow
       * used by Group.shouldCache to know if child has a shadow recursively
       * @return {Boolean}
       */
      willDrawShadow: function () {
        return (
          !!this.shadow &&
          (this.shadow.offsetX !== 0 || this.shadow.offsetY !== 0)
        );
      },

      /**
       * Execute the drawing operation for an object clipPath
       * @param {CanvasRenderingContext2D} ctx Context to render on
       */
      drawClipPathOnCache: function (ctx) {
        var path = this.clipPath;
        ctx.save();
        // DEBUG: uncomment this line, comment the following
        // ctx.globalAlpha = 0.4
        if (path.inverted) {
          ctx.globalCompositeOperation = 'destination-out';
        } else {
          ctx.globalCompositeOperation = 'destination-in';
        }
        //ctx.scale(1 / 2, 1 / 2);
        if (path.absolutePositioned) {
          var m = fabric.util.invertTransform(this.calcTransformMatrix());
          ctx.transform(m[0], m[1], m[2], m[3], m[4], m[5]);
        }
        path.transform(ctx);
        ctx.scale(1 / path.zoomX, 1 / path.zoomY);
        ctx.drawImage(
          path._cacheCanvas,
          -path.cacheTranslationX,
          -path.cacheTranslationY
        );
        ctx.restore();
      },

      /**
       * Execute the drawing operation for an object on a specified context
       * @param {CanvasRenderingContext2D} ctx Context to render on
       */
      drawObject: function (ctx, forClipping) {
        var originalFill = this.fill,
          originalStroke = this.stroke;
        if (forClipping) {
          this.fill = 'black';
          this.stroke = '';
          this._setClippingProperties(ctx);
        } else {
          this._renderBackground(ctx);
          this._setStrokeStyles(ctx, this);
          this._setFillStyles(ctx, this);
        }
        this._render(ctx);
        this._drawClipPath(ctx);
        this.fill = originalFill;
        this.stroke = originalStroke;
      },

      _drawClipPath: function (ctx) {
        var path = this.clipPath;
        if (!path) {
          return;
        }
        // needed to setup a couple of variables
        // path canvas gets overridden with this one.
        // TODO find a better solution?
        path.canvas = this.canvas;
        path.shouldCache();
        path._transformDone = true;
        path.renderCache({ forClipping: true });
        this.drawClipPathOnCache(ctx);
      },

      /**
       * Paint the cached copy of the object on the target context.
       * @param {CanvasRenderingContext2D} ctx Context to render on
       */
      drawCacheOnCanvas: function (ctx) {
        ctx.scale(1 / this.zoomX, 1 / this.zoomY);
        ctx.drawImage(
          this._cacheCanvas,
          -this.cacheTranslationX,
          -this.cacheTranslationY
        );
      },

      /**
       * Check if cache is dirty
       * @param {Boolean} skipCanvas skip canvas checks because this object is painted
       * on parent canvas.
       */
      isCacheDirty: function (skipCanvas) {
        if (this.isNotVisible()) {
          return false;
        }
        if (this._cacheCanvas && !skipCanvas && this._updateCacheCanvas()) {
          // in this case the context is already cleared.
          return true;
        } else {
          if (
            this.dirty ||
            (this.clipPath && this.clipPath.absolutePositioned) ||
            (this.statefullCache && this.hasStateChanged('cacheProperties'))
          ) {
            if (this._cacheCanvas && !skipCanvas) {
              var width = this.cacheWidth / this.zoomX;
              var height = this.cacheHeight / this.zoomY;
              this._cacheContext.clearRect(
                -width / 2,
                -height / 2,
                width,
                height
              );
            }
            return true;
          }
        }
        return false;
      },

      /**
       * Draws a background for the object big as its untransformed dimensions
       * @private
       * @param {CanvasRenderingContext2D} ctx Context to render on
       */
      _renderBackground: function (ctx) {
        if (!this.backgroundColor) {
          return;
        }
        var dim = this._getNonTransformedDimensions();
        ctx.fillStyle = this.backgroundColor;

        ctx.fillRect(-dim.x / 2, -dim.y / 2, dim.x, dim.y);
        // if there is background color no other shadows
        // should be casted
        this._removeShadow(ctx);
      },

      /**
       * @private
       * @param {CanvasRenderingContext2D} ctx Context to render on
       */
      _setOpacity: function (ctx) {
        if (this.group && !this.group._transformDone) {
          ctx.globalAlpha = this.getObjectOpacity();
        } else {
          ctx.globalAlpha *= this.opacity;
        }
      },

      _setStrokeStyles: function (ctx, decl) {
        if (decl.stroke) {
          ctx.lineWidth = decl.strokeWidth;
          ctx.lineCap = decl.strokeLineCap;
          ctx.lineDashOffset = decl.strokeDashOffset;
          ctx.lineJoin = decl.strokeLineJoin;
          ctx.miterLimit = decl.strokeMiterLimit;
          ctx.strokeStyle = decl.stroke.toLive
            ? decl.stroke.toLive(ctx, this)
            : decl.stroke;
        }
      },

      _setFillStyles: function (ctx, decl) {
        if (decl.fill) {
          ctx.fillStyle = decl.fill.toLive
            ? decl.fill.toLive(ctx, this)
            : decl.fill;
        }
      },

      _setClippingProperties: function (ctx) {
        ctx.globalAlpha = 1;
        ctx.strokeStyle = 'transparent';
        ctx.fillStyle = '#000000';
      },

      /**
       * @private
       * Sets line dash
       * @param {CanvasRenderingContext2D} ctx Context to set the dash line on
       * @param {Array} dashArray array representing dashes
       * @param {Function} alternative function to call if browser does not support lineDash
       */
      _setLineDash: function (ctx, dashArray, alternative) {
        if (!dashArray || dashArray.length === 0) {
          return;
        }
        // Spec requires the concatenation of two copies the dash list when the number of elements is odd
        if (1 & dashArray.length) {
          dashArray.push.apply(dashArray, dashArray);
        }
        if (supportsLineDash) {
          ctx.setLineDash(dashArray);
        } else {
          alternative && alternative(ctx);
        }
      },

      /**
       * Renders controls and borders for the object
       * @param {CanvasRenderingContext2D} ctx Context to render on
       * @param {Object} [styleOverride] properties to override the object style
       */
      _renderControls: function (ctx, styleOverride) {
        var vpt = this.getViewportTransform(),
          matrix = this.calcTransformMatrix(),
          options,
          drawBorders,
          drawControls;
        styleOverride = styleOverride || {};
        drawBorders =
          typeof styleOverride.hasBorders !== 'undefined'
            ? styleOverride.hasBorders
            : this.hasBorders;
        drawControls =
          typeof styleOverride.hasControls !== 'undefined'
            ? styleOverride.hasControls
            : this.hasControls;
        matrix = fabric.util.multiplyTransformMatrices(vpt, matrix);
        options = fabric.util.qrDecompose(matrix);
        ctx.save();
        ctx.translate(options.translateX, options.translateY);
        ctx.lineWidth = 1 * this.borderScaleFactor;
        if (!this.group) {
          ctx.globalAlpha = this.isMoving ? this.borderOpacityWhenMoving : 1;
        }
        if (styleOverride.forActiveSelection) {
          ctx.rotate(degreesToRadians(options.angle));
          drawBorders && this.drawBordersInGroup(ctx, options, styleOverride);
        } else {
          ctx.rotate(degreesToRadians(this.angle));
          drawBorders && this.drawBorders(ctx, styleOverride);
        }
        drawControls && this.drawControls(ctx, styleOverride);
        ctx.restore();
      },

      /**
       * @private
       * @param {CanvasRenderingContext2D} ctx Context to render on
       */
      _setShadow: function (ctx) {
        if (!this.shadow) {
          return;
        }

        var shadow = this.shadow,
          canvas = this.canvas,
          scaling,
          multX = (canvas && canvas.viewportTransform[0]) || 1,
          multY = (canvas && canvas.viewportTransform[3]) || 1;
        if (shadow.nonScaling) {
          scaling = { scaleX: 1, scaleY: 1 };
        } else {
          scaling = this.getObjectScaling();
        }
        if (canvas && canvas._isRetinaScaling()) {
          multX *= fabric.devicePixelRatio;
          multY *= fabric.devicePixelRatio;
        }
        ctx.shadowColor = shadow.color;
        ctx.shadowBlur =
          (shadow.blur *
            fabric.browserShadowBlurConstant *
            (multX + multY) *
            (scaling.scaleX + scaling.scaleY)) /
          4;
        ctx.shadowOffsetX = shadow.offsetX * multX * scaling.scaleX;
        ctx.shadowOffsetY = shadow.offsetY * multY * scaling.scaleY;
      },

      /**
       * @private
       * @param {CanvasRenderingContext2D} ctx Context to render on
       */
      _removeShadow: function (ctx) {
        if (!this.shadow) {
          return;
        }

        ctx.shadowColor = '';
        ctx.shadowBlur = ctx.shadowOffsetX = ctx.shadowOffsetY = 0;
      },

      /**
       * @private
       * @param {CanvasRenderingContext2D} ctx Context to render on
       * @param {Object} filler fabric.Pattern or fabric.Gradient
       * @return {Object} offset.offsetX offset for text rendering
       * @return {Object} offset.offsetY offset for text rendering
       */
      _applyPatternGradientTransform: function (ctx, filler) {
        if (!filler || !filler.toLive) {
          return { offsetX: 0, offsetY: 0 };
        }
        var t = filler.gradientTransform || filler.patternTransform;
        var offsetX = -this.width / 2 + filler.offsetX || 0,
          offsetY = -this.height / 2 + filler.offsetY || 0;

        if (filler.gradientUnits === 'percentage') {
          ctx.transform(this.width, 0, 0, this.height, offsetX, offsetY);
        } else {
          ctx.transform(1, 0, 0, 1, offsetX, offsetY);
        }
        if (t) {
          ctx.transform(t[0], t[1], t[2], t[3], t[4], t[5]);
        }
        return { offsetX: offsetX, offsetY: offsetY };
      },

      /**
       * @private
       * @param {CanvasRenderingContext2D} ctx Context to render on
       */
      _renderPaintInOrder: function (ctx) {
        if (this.paintFirst === 'stroke') {
          this._renderStroke(ctx);
          this._renderFill(ctx);
        } else {
          this._renderFill(ctx);
          this._renderStroke(ctx);
        }
      },

      /**
       * @private
       * function that actually render something on the context.
       * empty here to allow Obects to work on tests to benchmark fabric functionalites
       * not related to rendering
       * @param {CanvasRenderingContext2D} ctx Context to render on
       */
      _render: function (/* ctx */) {},

      /**
       * @private
       * @param {CanvasRenderingContext2D} ctx Context to render on
       */
      _renderFill: function (ctx) {
        if (!this.fill) {
          return;
        }

        ctx.save();
        this._applyPatternGradientTransform(ctx, this.fill);
        if (this.fillRule === 'evenodd') {
          ctx.fill('evenodd');
        } else {
          ctx.fill();
        }
        ctx.restore();
      },

      /**
       * @private
       * @param {CanvasRenderingContext2D} ctx Context to render on
       */
      _renderStroke: function (ctx) {
        if (!this.stroke || this.strokeWidth === 0) {
          return;
        }

        if (this.shadow && !this.shadow.affectStroke) {
          this._removeShadow(ctx);
        }

        ctx.save();
        if (this.strokeUniform && this.group) {
          var scaling = this.getObjectScaling();
          ctx.scale(1 / scaling.scaleX, 1 / scaling.scaleY);
        } else if (this.strokeUniform) {
          ctx.scale(1 / this.scaleX, 1 / this.scaleY);
        }
        this._setLineDash(ctx, this.strokeDashArray, this._renderDashedStroke);
        if (this.stroke.toLive && this.stroke.gradientUnits === 'percentage') {
          // need to transform gradient in a pattern.
          // this is a slow process. If you are hitting this codepath, and the object
          // is not using caching, you should consider switching it on.
          // we need a canvas as big as the current object caching canvas.
          this._applyPatternForTransformedGradient(ctx, this.stroke);
        } else {
          this._applyPatternGradientTransform(ctx, this.stroke);
        }
        ctx.stroke();
        ctx.restore();
      },

      /**
       * This function try to patch the missing gradientTransform on canvas gradients.
       * transforming a context to transform the gradient, is going to transform the stroke too.
       * we want to transform the gradient but not the stroke operation, so we create
       * a transformed gradient on a pattern and then we use the pattern instead of the gradient.
       * this method has drwabacks: is slow, is in low resolution, needs a patch for when the size
       * is limited.
       * @private
       * @param {CanvasRenderingContext2D} ctx Context to render on
       * @param {fabric.Gradient} filler a fabric gradient instance
       */
      _applyPatternForTransformedGradient: function (ctx, filler) {
        var dims = this._limitCacheSize(this._getCacheCanvasDimensions()),
          pCanvas = fabric.util.createCanvasElement(),
          pCtx,
          retinaScaling = this.canvas.getRetinaScaling(),
          width = dims.x / this.scaleX / retinaScaling,
          height = dims.y / this.scaleY / retinaScaling;
        pCanvas.width = width;
        pCanvas.height = height;
        pCtx = pCanvas.getContext('2d');
        pCtx.beginPath();
        pCtx.moveTo(0, 0);
        pCtx.lineTo(width, 0);
        pCtx.lineTo(width, height);
        pCtx.lineTo(0, height);
        pCtx.closePath();
        pCtx.translate(width / 2, height / 2);
        pCtx.scale(
          dims.zoomX / this.scaleX / retinaScaling,
          dims.zoomY / this.scaleY / retinaScaling
        );
        this._applyPatternGradientTransform(pCtx, filler);
        pCtx.fillStyle = filler.toLive(ctx);
        pCtx.fill();
        ctx.translate(
          -this.width / 2 - this.strokeWidth / 2,
          -this.height / 2 - this.strokeWidth / 2
        );
        ctx.scale(
          (retinaScaling * this.scaleX) / dims.zoomX,
          (retinaScaling * this.scaleY) / dims.zoomY
        );
        ctx.strokeStyle = pCtx.createPattern(pCanvas, 'no-repeat');
      },

      /**
       * This function is an helper for svg import. it returns the center of the object in the svg
       * untransformed coordinates
       * @private
       * @return {Object} center point from element coordinates
       */
      _findCenterFromElement: function () {
        return { x: this.left + this.width / 2, y: this.top + this.height / 2 };
      },

      /**
       * This function is an helper for svg import. it decompose the transformMatrix
       * and assign properties to object.
       * untransformed coordinates
       * @private
       * @chainable
       */
      _assignTransformMatrixProps: function () {
        if (this.transformMatrix) {
          var options = fabric.util.qrDecompose(this.transformMatrix);
          this.flipX = false;
          this.flipY = false;
          this.set('scaleX', options.scaleX);
          this.set('scaleY', options.scaleY);
          this.angle = options.angle;
          this.skewX = options.skewX;
          this.skewY = 0;
        }
      },

      /**
       * This function is an helper for svg import. it removes the transform matrix
       * and set to object properties that fabricjs can handle
       * @private
       * @param {Object} preserveAspectRatioOptions
       * @return {thisArg}
       */
      _removeTransformMatrix: function (preserveAspectRatioOptions) {
        var center = this._findCenterFromElement();
        if (this.transformMatrix) {
          this._assignTransformMatrixProps();
          center = fabric.util.transformPoint(center, this.transformMatrix);
        }
        this.transformMatrix = null;
        if (preserveAspectRatioOptions) {
          this.scaleX *= preserveAspectRatioOptions.scaleX;
          this.scaleY *= preserveAspectRatioOptions.scaleY;
          this.cropX = preserveAspectRatioOptions.cropX;
          this.cropY = preserveAspectRatioOptions.cropY;
          center.x += preserveAspectRatioOptions.offsetLeft;
          center.y += preserveAspectRatioOptions.offsetTop;
          this.width = preserveAspectRatioOptions.width;
          this.height = preserveAspectRatioOptions.height;
        }
        this.setPositionByOrigin(center, 'center', 'center');
      },

      /**
       * Clones an instance, using a callback method will work for every object.
       * @param {Function} callback Callback is invoked with a clone as a first argument
       * @param {Array} [propertiesToInclude] Any properties that you might want to additionally include in the output
       */
      clone: function (callback, propertiesToInclude) {
        var objectForm = this.toObject(propertiesToInclude);
        if (this.constructor.fromObject) {
          this.constructor.fromObject(objectForm, callback);
        } else {
          fabric.Object._fromObject('Object', objectForm, callback);
        }
      },

      /**
       * Creates an instance of fabric.Image out of an object
       * could make use of both toDataUrl or toCanvasElement.
       * @param {Function} callback callback, invoked with an instance as a first argument
       * @param {Object} [options] for clone as image, passed to toDataURL
       * @param {String} [options.format=png] The format of the output image. Either "jpeg" or "png"
       * @param {Number} [options.quality=1] Quality level (0..1). Only used for jpeg.
       * @param {Number} [options.multiplier=1] Multiplier to scale by
       * @param {Number} [options.left] Cropping left offset. Introduced in v1.2.14
       * @param {Number} [options.top] Cropping top offset. Introduced in v1.2.14
       * @param {Number} [options.width] Cropping width. Introduced in v1.2.14
       * @param {Number} [options.height] Cropping height. Introduced in v1.2.14
       * @param {Boolean} [options.enableRetinaScaling] Enable retina scaling for clone image. Introduce in 1.6.4
       * @param {Boolean} [options.withoutTransform] Remove current object transform ( no scale , no angle, no flip, no skew ). Introduced in 2.3.4
       * @param {Boolean} [options.withoutShadow] Remove current object shadow. Introduced in 2.4.2
       * @return {fabric.Object} thisArg
       */
      cloneAsImage: function (callback, options) {
        var canvasEl = this.toCanvasElement(options);
        if (callback) {
          callback(new fabric.Image(canvasEl));
        }
        return this;
      },

      /**
       * Converts an object into a HTMLCanvas element
       * @param {Object} options Options object
       * @param {Number} [options.multiplier=1] Multiplier to scale by
       * @param {Number} [options.left] Cropping left offset. Introduced in v1.2.14
       * @param {Number} [options.top] Cropping top offset. Introduced in v1.2.14
       * @param {Number} [options.width] Cropping width. Introduced in v1.2.14
       * @param {Number} [options.height] Cropping height. Introduced in v1.2.14
       * @param {Boolean} [options.enableRetinaScaling] Enable retina scaling for clone image. Introduce in 1.6.4
       * @param {Boolean} [options.withoutTransform] Remove current object transform ( no scale , no angle, no flip, no skew ). Introduced in 2.3.4
       * @param {Boolean} [options.withoutShadow] Remove current object shadow. Introduced in 2.4.2
       * @return {HTMLCanvasElement} Returns DOM element <canvas> with the fabric.Object
       */
      toCanvasElement: function (options) {
        options || (options = {});

        var utils = fabric.util,
          origParams = utils.saveObjectTransform(this),
          originalGroup = this.group,
          originalShadow = this.shadow,
          abs = Math.abs,
          multiplier =
            (options.multiplier || 1) *
            (options.enableRetinaScaling ? fabric.devicePixelRatio : 1);
        delete this.group;
        if (options.withoutTransform) {
          utils.resetObjectTransform(this);
        }
        if (options.withoutShadow) {
          this.shadow = null;
        }

        var el = fabric.util.createCanvasElement(),
          // skip canvas zoom and calculate with setCoords now.
          boundingRect = this.getBoundingRect(true, true),
          shadow = this.shadow,
          scaling,
          shadowOffset = { x: 0, y: 0 },
          shadowBlur,
          width,
          height;

        if (shadow) {
          shadowBlur = shadow.blur;
          if (shadow.nonScaling) {
            scaling = { scaleX: 1, scaleY: 1 };
          } else {
            scaling = this.getObjectScaling();
          }
          // consider non scaling shadow.
          shadowOffset.x =
            2 *
            Math.round(abs(shadow.offsetX) + shadowBlur) *
            abs(scaling.scaleX);
          shadowOffset.y =
            2 *
            Math.round(abs(shadow.offsetY) + shadowBlur) *
            abs(scaling.scaleY);
        }
        width = boundingRect.width + shadowOffset.x;
        height = boundingRect.height + shadowOffset.y;
        // if the current width/height is not an integer
        // we need to make it so.
        el.width = Math.ceil(width);
        el.height = Math.ceil(height);
        var canvas = new fabric.StaticCanvas(el, {
          enableRetinaScaling: false,
          renderOnAddRemove: false,
          skipOffscreen: false,
        });
        if (options.format === 'jpeg') {
          canvas.backgroundColor = '#fff';
        }
        this.setPositionByOrigin(
          new fabric.Point(canvas.width / 2, canvas.height / 2),
          'center',
          'center'
        );

        var originalCanvas = this.canvas;
        canvas.add(this);
        var canvasEl = canvas.toCanvasElement(multiplier || 1, options);
        this.shadow = originalShadow;
        this.set('canvas', originalCanvas);
        if (originalGroup) {
          this.group = originalGroup;
        }
        this.set(origParams).setCoords();
        // canvas.dispose will call image.dispose that will nullify the elements
        // since this canvas is a simple element for the process, we remove references
        // to objects in this way in order to avoid object trashing.
        canvas._objects = [];
        canvas.dispose();
        canvas = null;

        return canvasEl;
      },

      /**
       * Converts an object into a data-url-like string
       * @param {Object} options Options object
       * @param {String} [options.format=png] The format of the output image. Either "jpeg" or "png"
       * @param {Number} [options.quality=1] Quality level (0..1). Only used for jpeg.
       * @param {Number} [options.multiplier=1] Multiplier to scale by
       * @param {Number} [options.left] Cropping left offset. Introduced in v1.2.14
       * @param {Number} [options.top] Cropping top offset. Introduced in v1.2.14
       * @param {Number} [options.width] Cropping width. Introduced in v1.2.14
       * @param {Number} [options.height] Cropping height. Introduced in v1.2.14
       * @param {Boolean} [options.enableRetinaScaling] Enable retina scaling for clone image. Introduce in 1.6.4
       * @param {Boolean} [options.withoutTransform] Remove current object transform ( no scale , no angle, no flip, no skew ). Introduced in 2.3.4
       * @param {Boolean} [options.withoutShadow] Remove current object shadow. Introduced in 2.4.2
       * @return {String} Returns a data: URL containing a representation of the object in the format specified by options.format
       */
      toDataURL: function (options) {
        options || (options = {});
        return fabric.util.toDataURL(
          this.toCanvasElement(options),
          options.format || 'png',
          options.quality || 1
        );
      },

      /**
       * Returns true if specified type is identical to the type of an instance
       * @param {String} type Type to check against
       * @return {Boolean}
       */
      isType: function (type) {
        return this.type === type;
      },

      /**
       * Returns complexity of an instance
       * @return {Number} complexity of this instance (is 1 unless subclassed)
       */
      complexity: function () {
        return 1;
      },

      /**
       * Returns a JSON representation of an instance
       * @param {Array} [propertiesToInclude] Any properties that you might want to additionally include in the output
       * @return {Object} JSON
       */
      toJSON: function (propertiesToInclude) {
        // delegate, not alias
        return this.toObject(propertiesToInclude);
      },

      /**
       * Sets gradient (fill or stroke) of an object
       * percentages for x1,x2,y1,y2,r1,r2 together with gradientUnits 'pixels', are not supported.
       * <b>Backwards incompatibility note:</b> This method was named "setGradientFill" until v1.1.0
       * @param {String} property Property name 'stroke' or 'fill'
       * @param {Object} [options] Options object
       * @param {String} [options.type] Type of gradient 'radial' or 'linear'
       * @param {Number} [options.x1=0] x-coordinate of start point
       * @param {Number} [options.y1=0] y-coordinate of start point
       * @param {Number} [options.x2=0] x-coordinate of end point
       * @param {Number} [options.y2=0] y-coordinate of end point
       * @param {Number} [options.r1=0] Radius of start point (only for radial gradients)
       * @param {Number} [options.r2=0] Radius of end point (only for radial gradients)
       * @param {Object} [options.colorStops] Color stops object eg. {0: 'ff0000', 1: '000000'}
       * @param {Object} [options.gradientTransform] transformMatrix for gradient
       * @return {fabric.Object} thisArg
       * @chainable
       * @deprecated since 3.4.0
       * @see {@link http://jsfiddle.net/fabricjs/58y8b/|jsFiddle demo}
       * @example <caption>Set linear gradient</caption>
       * object.setGradient('fill', {
       *   type: 'linear',
       *   x1: -object.width / 2,
       *   y1: 0,
       *   x2: object.width / 2,
       *   y2: 0,
       *   colorStops: {
       *     0: 'red',
       *     0.5: '#005555',
       *     1: 'rgba(0,0,255,0.5)'
       *   }
       * });
       * canvas.renderAll();
       * @example <caption>Set radial gradient</caption>
       * object.setGradient('fill', {
       *   type: 'radial',
       *   x1: 0,
       *   y1: 0,
       *   x2: 0,
       *   y2: 0,
       *   r1: object.width / 2,
       *   r2: 10,
       *   colorStops: {
       *     0: 'red',
       *     0.5: '#005555',
       *     1: 'rgba(0,0,255,0.5)'
       *   }
       * });
       * canvas.renderAll();
       */
      setGradient: function (property, options) {
        options || (options = {});

        var gradient = { colorStops: [] };

        gradient.type =
          options.type || (options.r1 || options.r2 ? 'radial' : 'linear');
        gradient.coords = {
          x1: options.x1,
          y1: options.y1,
          x2: options.x2,
          y2: options.y2,
        };
        gradient.gradientUnits = options.gradientUnits || 'pixels';
        if (options.r1 || options.r2) {
          gradient.coords.r1 = options.r1;
          gradient.coords.r2 = options.r2;
        }

        gradient.gradientTransform = options.gradientTransform;
        fabric.Gradient.prototype.addColorStop.call(
          gradient,
          options.colorStops
        );

        return this.set(property, fabric.Gradient.forObject(this, gradient));
      },

      /**
       * Sets pattern fill of an object
       * @param {Object} options Options object
       * @param {(String|HTMLImageElement)} options.source Pattern source
       * @param {String} [options.repeat=repeat] Repeat property of a pattern (one of repeat, repeat-x, repeat-y or no-repeat)
       * @param {Number} [options.offsetX=0] Pattern horizontal offset from object's left/top corner
       * @param {Number} [options.offsetY=0] Pattern vertical offset from object's left/top corner
       * @param {Function} [callback] Callback to invoke when image set as a pattern
       * @return {fabric.Object} thisArg
       * @chainable
       * @deprecated since 3.5.0
       * @see {@link http://jsfiddle.net/fabricjs/QT3pa/|jsFiddle demo}
       * @example <caption>Set pattern</caption>
       * object.setPatternFill({
       *   source: 'http://fabricjs.com/assets/escheresque_ste.png',
       *   repeat: 'repeat'
       * },canvas.renderAll.bind(canvas));
       */
      setPatternFill: function (options, callback) {
        return this.set('fill', new fabric.Pattern(options, callback));
      },

      /**
       * Sets {@link fabric.Object#shadow|shadow} of an object
       * @param {Object|String} [options] Options object or string (e.g. "2px 2px 10px rgba(0,0,0,0.2)")
       * @param {String} [options.color=rgb(0,0,0)] Shadow color
       * @param {Number} [options.blur=0] Shadow blur
       * @param {Number} [options.offsetX=0] Shadow horizontal offset
       * @param {Number} [options.offsetY=0] Shadow vertical offset
       * @return {fabric.Object} thisArg
       * @chainable
       * @deprecated since 3.5.0
       * @see {@link http://jsfiddle.net/fabricjs/7gvJG/|jsFiddle demo}
       * @example <caption>Set shadow with string notation</caption>
       * object.setShadow('2px 2px 10px rgba(0,0,0,0.2)');
       * canvas.renderAll();
       * @example <caption>Set shadow with object notation</caption>
       * object.setShadow({
       *   color: 'red',
       *   blur: 10,
       *   offsetX: 20,
       *   offsetY: 20
       * });
       * canvas.renderAll();
       */
      setShadow: function (options) {
        return this.set('shadow', options ? new fabric.Shadow(options) : null);
      },

      /**
       * Sets "color" of an instance (alias of `set('fill', &hellip;)`)
       * @param {String} color Color value
       * @return {fabric.Object} thisArg
       * @deprecated since 3.5.0
       * @chainable
       */
      setColor: function (color) {
        this.set('fill', color);
        return this;
      },

      /**
       * Sets "angle" of an instance with centered rotation
       * @param {Number} angle Angle value (in degrees)
       * @return {fabric.Object} thisArg
       * @chainable
       */
      rotate: function (angle) {
        var shouldCenterOrigin =
          (this.originX !== 'center' || this.originY !== 'center') &&
          this.centeredRotation;

        if (shouldCenterOrigin) {
          this._setOriginToCenter();
        }

        this.set('angle', angle);

        if (shouldCenterOrigin) {
          this._resetOrigin();
        }

        return this;
      },

      /**
       * Centers object horizontally on canvas to which it was added last.
       * You might need to call `setCoords` on an object after centering, to update controls area.
       * @return {fabric.Object} thisArg
       * @chainable
       */
      centerH: function () {
        this.canvas && this.canvas.centerObjectH(this);
        return this;
      },

      /**
       * Centers object horizontally on current viewport of canvas to which it was added last.
       * You might need to call `setCoords` on an object after centering, to update controls area.
       * @return {fabric.Object} thisArg
       * @chainable
       */
      viewportCenterH: function () {
        this.canvas && this.canvas.viewportCenterObjectH(this);
        return this;
      },

      /**
       * Centers object vertically on canvas to which it was added last.
       * You might need to call `setCoords` on an object after centering, to update controls area.
       * @return {fabric.Object} thisArg
       * @chainable
       */
      centerV: function () {
        this.canvas && this.canvas.centerObjectV(this);
        return this;
      },

      /**
       * Centers object vertically on current viewport of canvas to which it was added last.
       * You might need to call `setCoords` on an object after centering, to update controls area.
       * @return {fabric.Object} thisArg
       * @chainable
       */
      viewportCenterV: function () {
        this.canvas && this.canvas.viewportCenterObjectV(this);
        return this;
      },

      /**
       * Centers object vertically and horizontally on canvas to which is was added last
       * You might need to call `setCoords` on an object after centering, to update controls area.
       * @return {fabric.Object} thisArg
       * @chainable
       */
      center: function () {
        this.canvas && this.canvas.centerObject(this);
        return this;
      },

      /**
       * Centers object on current viewport of canvas to which it was added last.
       * You might need to call `setCoords` on an object after centering, to update controls area.
       * @return {fabric.Object} thisArg
       * @chainable
       */
      viewportCenter: function () {
        this.canvas && this.canvas.viewportCenterObject(this);
        return this;
      },

      /**
       * Returns coordinates of a pointer relative to an object
       * @param {Event} e Event to operate upon
       * @param {Object} [pointer] Pointer to operate upon (instead of event)
       * @return {Object} Coordinates of a pointer (x, y)
       */
      getLocalPointer: function (e, pointer) {
        pointer = pointer || this.canvas.getPointer(e);
        var pClicked = new fabric.Point(pointer.x, pointer.y),
          objectLeftTop = this._getLeftTopCoords();
        if (this.angle) {
          pClicked = fabric.util.rotatePoint(
            pClicked,
            objectLeftTop,
            degreesToRadians(-this.angle)
          );
        }
        return {
          x: pClicked.x - objectLeftTop.x,
          y: pClicked.y - objectLeftTop.y,
        };
      },

      /**
       * Sets canvas globalCompositeOperation for specific object
       * custom composition operation for the particular object can be specified using globalCompositeOperation property
       * @param {CanvasRenderingContext2D} ctx Rendering canvas context
       */
      _setupCompositeOperation: function (ctx) {
        if (this.globalCompositeOperation) {
          ctx.globalCompositeOperation = this.globalCompositeOperation;
        }
      },
    }
  );

  fabric.util.createAccessors && fabric.util.createAccessors(fabric.Object);

  extend(fabric.Object.prototype, fabric.Observable);

  /**
   * Defines the number of fraction digits to use when serializing object values.
   * You can use it to increase/decrease precision of such values like left, top, scaleX, scaleY, etc.
   * @static
   * @memberOf fabric.Object
   * @constant
   * @type Number
   */
  fabric.Object.NUM_FRACTION_DIGITS = 2;

  fabric.Object._fromObject = function (
    className,
    object,
    callback,
    extraParam
  ) {
    var klass = fabric[className];
    object = clone(object, true);
    fabric.util.enlivenPatterns([object.fill, object.stroke], function (
      patterns
    ) {
      if (typeof patterns[0] !== 'undefined') {
        object.fill = patterns[0];
      }
      if (typeof patterns[1] !== 'undefined') {
        object.stroke = patterns[1];
      }
      fabric.util.enlivenObjects([object.clipPath], function (enlivedProps) {
        object.clipPath = enlivedProps[0];
        var instance = extraParam
          ? new klass(object[extraParam], object)
          : new klass(object);
        callback && callback(instance);
      });
    });
  };

  /**
   * Unique id used internally when creating SVG elements
   * @static
   * @memberOf fabric.Object
   * @type Number
   */
  fabric.Object.__uid = 0;
})(typeof exports !== 'undefined' ? exports : this);
(function initTranslations() {
  var degreesToRadians = fabric.util.degreesToRadians,
    originXOffset = {
      left: -0.5,
      center: 0,
      right: 0.5,
    },
    originYOffset = {
      top: -0.5,
      center: 0,
      bottom: 0.5,
    };

  fabric.util.object.extend(
    fabric.Object.prototype,
    /** @lends fabric.Object.prototype */ {
      /**
       * Translates the coordinates from a set of origin to another (based on the object's dimensions)
       * @param {fabric.Point} point The point which corresponds to the originX and originY params
       * @param {String} fromOriginX Horizontal origin: 'left', 'center' or 'right'
       * @param {String} fromOriginY Vertical origin: 'top', 'center' or 'bottom'
       * @param {String} toOriginX Horizontal origin: 'left', 'center' or 'right'
       * @param {String} toOriginY Vertical origin: 'top', 'center' or 'bottom'
       * @return {fabric.Point}
       */
      translateToGivenOrigin: function (
        point,
        fromOriginX,
        fromOriginY,
        toOriginX,
        toOriginY
      ) {
        var x = point.x,
          y = point.y,
          offsetX,
          offsetY,
          dim;

        if (typeof fromOriginX === 'string') {
          fromOriginX = originXOffset[fromOriginX];
        } else {
          fromOriginX -= 0.5;
        }

        if (typeof toOriginX === 'string') {
          toOriginX = originXOffset[toOriginX];
        } else {
          toOriginX -= 0.5;
        }

        offsetX = toOriginX - fromOriginX;

        if (typeof fromOriginY === 'string') {
          fromOriginY = originYOffset[fromOriginY];
        } else {
          fromOriginY -= 0.5;
        }

        if (typeof toOriginY === 'string') {
          toOriginY = originYOffset[toOriginY];
        } else {
          toOriginY -= 0.5;
        }

        offsetY = toOriginY - fromOriginY;

        if (offsetX || offsetY) {
          dim = this._getTransformedDimensions();
          x = point.x + offsetX * dim.x;
          y = point.y + offsetY * dim.y;
        }

        return new fabric.Point(x, y);
      },

      /**
       * Translates the coordinates from origin to center coordinates (based on the object's dimensions)
       * @param {fabric.Point} point The point which corresponds to the originX and originY params
       * @param {String} originX Horizontal origin: 'left', 'center' or 'right'
       * @param {String} originY Vertical origin: 'top', 'center' or 'bottom'
       * @return {fabric.Point}
       */
      translateToCenterPoint: function (point, originX, originY) {
        var p = this.translateToGivenOrigin(
          point,
          originX,
          originY,
          'center',
          'center'
        );
        if (this.angle) {
          return fabric.util.rotatePoint(
            p,
            point,
            degreesToRadians(this.angle)
          );
        }
        return p;
      },

      /**
       * Translates the coordinates from center to origin coordinates (based on the object's dimensions)
       * @param {fabric.Point} center The point which corresponds to center of the object
       * @param {String} originX Horizontal origin: 'left', 'center' or 'right'
       * @param {String} originY Vertical origin: 'top', 'center' or 'bottom'
       * @return {fabric.Point}
       */
      translateToOriginPoint: function (center, originX, originY) {
        var p = this.translateToGivenOrigin(
          center,
          'center',
          'center',
          originX,
          originY
        );
        if (this.angle) {
          return fabric.util.rotatePoint(
            p,
            center,
            degreesToRadians(this.angle)
          );
        }
        return p;
      },

      /**
       * Returns the real center coordinates of the object
       * @return {fabric.Point}
       */
      getCenterPoint: function () {
        var leftTop = new fabric.Point(this.left, this.top);
        return this.translateToCenterPoint(leftTop, this.originX, this.originY);
      },

      /**
       * Returns the coordinates of the object based on center coordinates
       * @param {fabric.Point} point The point which corresponds to the originX and originY params
       * @return {fabric.Point}
       */
      // getOriginPoint: function(center) {
      //   return this.translateToOriginPoint(center, this.originX, this.originY);
      // },

      /**
       * Returns the coordinates of the object as if it has a different origin
       * @param {String} originX Horizontal origin: 'left', 'center' or 'right'
       * @param {String} originY Vertical origin: 'top', 'center' or 'bottom'
       * @return {fabric.Point}
       */
      getPointByOrigin: function (originX, originY) {
        var center = this.getCenterPoint();
        return this.translateToOriginPoint(center, originX, originY);
      },

      /**
       * Returns the point in local coordinates
       * @param {fabric.Point} point The point relative to the global coordinate system
       * @param {String} originX Horizontal origin: 'left', 'center' or 'right'
       * @param {String} originY Vertical origin: 'top', 'center' or 'bottom'
       * @return {fabric.Point}
       */
      toLocalPoint: function (point, originX, originY) {
        var center = this.getCenterPoint(),
          p,
          p2;

        if (typeof originX !== 'undefined' && typeof originY !== 'undefined') {
          p = this.translateToGivenOrigin(
            center,
            'center',
            'center',
            originX,
            originY
          );
        } else {
          p = new fabric.Point(this.left, this.top);
        }

        p2 = new fabric.Point(point.x, point.y);
        if (this.angle) {
          p2 = fabric.util.rotatePoint(
            p2,
            center,
            -degreesToRadians(this.angle)
          );
        }
        return p2.subtractEquals(p);
      },

      /**
       * Returns the point in global coordinates
       * @param {fabric.Point} The point relative to the local coordinate system
       * @return {fabric.Point}
       */
      // toGlobalPoint: function(point) {
      //   return fabric.util.rotatePoint(point, this.getCenterPoint(), degreesToRadians(this.angle)).addEquals(new fabric.Point(this.left, this.top));
      // },

      /**
       * Sets the position of the object taking into consideration the object's origin
       * @param {fabric.Point} pos The new position of the object
       * @param {String} originX Horizontal origin: 'left', 'center' or 'right'
       * @param {String} originY Vertical origin: 'top', 'center' or 'bottom'
       * @return {void}
       */
      setPositionByOrigin: function (pos, originX, originY) {
        var center = this.translateToCenterPoint(pos, originX, originY),
          position = this.translateToOriginPoint(
            center,
            this.originX,
            this.originY
          );
        this.set('left', position.x);
        this.set('top', position.y);
      },

      /**
       * @param {String} to One of 'left', 'center', 'right'
       */
      adjustPosition: function (to) {
        var angle = degreesToRadians(this.angle),
          hypotFull = this.getScaledWidth(),
          xFull = fabric.util.cos(angle) * hypotFull,
          yFull = fabric.util.sin(angle) * hypotFull,
          offsetFrom,
          offsetTo;

        //TODO: this function does not consider mixed situation like top, center.
        if (typeof this.originX === 'string') {
          offsetFrom = originXOffset[this.originX];
        } else {
          offsetFrom = this.originX - 0.5;
        }
        if (typeof to === 'string') {
          offsetTo = originXOffset[to];
        } else {
          offsetTo = to - 0.5;
        }
        this.left += xFull * (offsetTo - offsetFrom);
        this.top += yFull * (offsetTo - offsetFrom);
        this.setCoords();
        this.originX = to;
      },

      /**
       * Sets the origin/position of the object to it's center point
       * @private
       * @return {void}
       */
      _setOriginToCenter: function () {
        this._originalOriginX = this.originX;
        this._originalOriginY = this.originY;

        var center = this.getCenterPoint();

        this.originX = 'center';
        this.originY = 'center';

        this.left = center.x;
        this.top = center.y;
      },

      /**
       * Resets the origin/position of the object to it's original origin
       * @private
       * @return {void}
       */
      _resetOrigin: function () {
        var originPoint = this.translateToOriginPoint(
          this.getCenterPoint(),
          this._originalOriginX,
          this._originalOriginY
        );

        this.originX = this._originalOriginX;
        this.originY = this._originalOriginY;

        this.left = originPoint.x;
        this.top = originPoint.y;

        this._originalOriginX = null;
        this._originalOriginY = null;
      },

      /**
       * @private
       */
      _getLeftTopCoords: function () {
        return this.translateToOriginPoint(
          this.getCenterPoint(),
          'left',
          'top'
        );
      },
    }
  );
})();
(function initIntersectionsAndScaling() {
  // Also threw in drawSelectionBackground

  function getCoords(coords) {
    return [
      new fabric.Point(coords.tl.x, coords.tl.y),
      new fabric.Point(coords.tr.x, coords.tr.y),
      new fabric.Point(coords.br.x, coords.br.y),
      new fabric.Point(coords.bl.x, coords.bl.y),
    ];
  }

  var degreesToRadians = fabric.util.degreesToRadians,
    multiplyMatrices = fabric.util.multiplyTransformMatrices,
    transformPoint = fabric.util.transformPoint;

  fabric.util.object.extend(
    fabric.Object.prototype,
    /** @lends fabric.Object.prototype */ {
      /**
       * Draws a colored layer behind the object, inside its selection borders.
       * Requires public options: padding, selectionBackgroundColor
       * this function is called when the context is transformed
       * has checks to be skipped when the object is on a staticCanvas
       * @param {CanvasRenderingContext2D} ctx Context to draw on
       * @return {fabric.Object} thisArg
       * @chainable
       */
      drawSelectionBackground: function (ctx) {
        if (
          !this.selectionBackgroundColor ||
          (this.canvas && !this.canvas.interactive) ||
          (this.canvas && this.canvas._activeObject !== this)
        ) {
          return this;
        }
        ctx.save();
        var center = this.getCenterPoint(),
          wh = this._calculateCurrentDimensions(),
          vpt = this.canvas.viewportTransform;
        ctx.translate(center.x, center.y);
        ctx.scale(1 / vpt[0], 1 / vpt[3]);
        ctx.rotate(degreesToRadians(this.angle));
        ctx.fillStyle = this.selectionBackgroundColor;
        ctx.fillRect(-wh.x / 2, -wh.y / 2, wh.x, wh.y);
        ctx.restore();
        return this;
      },

      /**
       * Describe object's corner position in canvas element coordinates.
       * properties are tl,mt,tr,ml,mr,bl,mb,br,mtr for the main controls.
       * each property is an object with x, y and corner.
       * The `corner` property contains in a similar manner the 4 points of the
       * interactive area of the corner.
       * The coordinates depends from this properties: width, height, scaleX, scaleY
       * skewX, skewY, angle, strokeWidth, viewportTransform, top, left, padding.
       * The coordinates get updated with @method setCoords.
       * You can calculate them without updating with @method calcCoords;
       * @memberOf fabric.Object.prototype
       */
      oCoords: null,

      /**
       * Describe object's corner position in canvas object absolute coordinates
       * properties are tl,tr,bl,br and describe the four main corner.
       * each property is an object with x, y, instance of Fabric.Point.
       * The coordinates depends from this properties: width, height, scaleX, scaleY
       * skewX, skewY, angle, strokeWidth, top, left.
       * Those coordinates are useful to understand where an object is. They get updated
       * with oCoords but they do not need to be updated when zoom or panning change.
       * The coordinates get updated with @method setCoords.
       * You can calculate them without updating with @method calcCoords(true);
       * @memberOf fabric.Object.prototype
       */
      aCoords: null,

      /**
       * storage for object transform matrix
       */
      ownMatrixCache: null,

      /**
       * storage for object full transform matrix
       */
      matrixCache: null,

      /**
       * return correct set of coordinates for intersection
       */
      getCoords: function (absolute, calculate) {
        if (!this.oCoords) {
          this.setCoords();
        }
        var coords = absolute ? this.aCoords : this.oCoords;
        return getCoords(calculate ? this.calcCoords(absolute) : coords);
      },

      /**
       * Checks if object intersects with an area formed by 2 points
       * @param {Object} pointTL top-left point of area
       * @param {Object} pointBR bottom-right point of area
       * @param {Boolean} [absolute] use coordinates without viewportTransform
       * @param {Boolean} [calculate] use coordinates of current position instead of .oCoords
       * @return {Boolean} true if object intersects with an area formed by 2 points
       */
      intersectsWithRect: function (pointTL, pointBR, absolute, calculate) {
        var coords = this.getCoords(absolute, calculate),
          intersection = fabric.Intersection.intersectPolygonRectangle(
            coords,
            pointTL,
            pointBR
          );
        return intersection.status === 'Intersection';
      },

      /**
       * Checks if object intersects with another object
       * @param {Object} other Object to test
       * @param {Boolean} [absolute] use coordinates without viewportTransform
       * @param {Boolean} [calculate] use coordinates of current position instead of .oCoords
       * @return {Boolean} true if object intersects with another object
       */
      intersectsWithObject: function (other, absolute, calculate) {
        var intersection = fabric.Intersection.intersectPolygonPolygon(
          this.getCoords(absolute, calculate),
          other.getCoords(absolute, calculate)
        );

        return (
          intersection.status === 'Intersection' ||
          other.isContainedWithinObject(this, absolute, calculate) ||
          this.isContainedWithinObject(other, absolute, calculate)
        );
      },

      /**
       * Checks if object is fully contained within area of another object
       * @param {Object} other Object to test
       * @param {Boolean} [absolute] use coordinates without viewportTransform
       * @param {Boolean} [calculate] use coordinates of current position instead of .oCoords
       * @return {Boolean} true if object is fully contained within area of another object
       */
      isContainedWithinObject: function (other, absolute, calculate) {
        var points = this.getCoords(absolute, calculate),
          i = 0,
          lines = other._getImageLines(
            calculate
              ? other.calcCoords(absolute)
              : absolute
              ? other.aCoords
              : other.oCoords
          );
        for (; i < 4; i++) {
          if (!other.containsPoint(points[i], lines)) {
            return false;
          }
        }
        return true;
      },

      /**
       * Checks if object is fully contained within area formed by 2 points
       * @param {Object} pointTL top-left point of area
       * @param {Object} pointBR bottom-right point of area
       * @param {Boolean} [absolute] use coordinates without viewportTransform
       * @param {Boolean} [calculate] use coordinates of current position instead of .oCoords
       * @return {Boolean} true if object is fully contained within area formed by 2 points
       */
      isContainedWithinRect: function (pointTL, pointBR, absolute, calculate) {
        var boundingRect = this.getBoundingRect(absolute, calculate);

        return (
          boundingRect.left >= pointTL.x &&
          boundingRect.left + boundingRect.width <= pointBR.x &&
          boundingRect.top >= pointTL.y &&
          boundingRect.top + boundingRect.height <= pointBR.y
        );
      },

      /**
       * Checks if point is inside the object
       * @param {fabric.Point} point Point to check against
       * @param {Object} [lines] object returned from @method _getImageLines
       * @param {Boolean} [absolute] use coordinates without viewportTransform
       * @param {Boolean} [calculate] use coordinates of current position instead of .oCoords
       * @return {Boolean} true if point is inside the object
       */
      containsPoint: function (point, lines, absolute, calculate) {
        let objLines =
            lines ||
            this._getImageLines(
              calculate
                ? this.calcCoords(absolute)
                : absolute
                ? this.aCoords
                : this.oCoords
            ),
          xPoints = this._findCrossPoints(point, objLines);

        // if xPoints is odd then point is inside the object
        return xPoints !== 0 && xPoints % 2 === 1;
      },

      /**
       * Checks if object is contained within the canvas with current viewportTransform
       * the check is done stopping at first point that appears on screen
       * @param {Boolean} [calculate] use coordinates of current position instead of .aCoords
       * @return {Boolean} true if object is fully or partially contained within canvas
       */
      isOnScreen: function (calculate) {
        if (!this.canvas) {
          return false;
        }
        var pointTL = this.canvas.vptCoords.tl,
          pointBR = this.canvas.vptCoords.br;
        var points = this.getCoords(true, calculate),
          point;
        for (var i = 0; i < 4; i++) {
          point = points[i];
          if (
            point.x <= pointBR.x &&
            point.x >= pointTL.x &&
            point.y <= pointBR.y &&
            point.y >= pointTL.y
          ) {
            return true;
          }
        }
        // no points on screen, check intersection with absolute coordinates
        if (this.intersectsWithRect(pointTL, pointBR, true, calculate)) {
          return true;
        }
        return this._containsCenterOfCanvas(pointTL, pointBR, calculate);
      },

      /**
       * Checks if the object contains the midpoint between canvas extremities
       * Does not make sense outside the context of isOnScreen and isPartiallyOnScreen
       * @private
       * @param {Fabric.Point} pointTL Top Left point
       * @param {Fabric.Point} pointBR Top Right point
       * @param {Boolean} calculate use coordinates of current position instead of .oCoords
       * @return {Boolean} true if the object contains the point
       */
      _containsCenterOfCanvas: function (pointTL, pointBR, calculate) {
        // worst case scenario the object is so big that contains the screen
        var centerPoint = {
          x: (pointTL.x + pointBR.x) / 2,
          y: (pointTL.y + pointBR.y) / 2,
        };
        if (this.containsPoint(centerPoint, null, true, calculate)) {
          return true;
        }
        return false;
      },

      /**
       * Checks if object is partially contained within the canvas with current viewportTransform
       * @param {Boolean} [calculate] use coordinates of current position instead of .oCoords
       * @return {Boolean} true if object is partially contained within canvas
       */
      isPartiallyOnScreen: function (calculate) {
        if (!this.canvas) {
          return false;
        }
        var pointTL = this.canvas.vptCoords.tl,
          pointBR = this.canvas.vptCoords.br;
        if (this.intersectsWithRect(pointTL, pointBR, true, calculate)) {
          return true;
        }
        return this._containsCenterOfCanvas(pointTL, pointBR, calculate);
      },

      /**
       * Method that returns an object with the object edges in it, given the coordinates of the corners
       * @private
       * @param {Object} oCoords Coordinates of the object corners
       */
      _getImageLines: function (oCoords) {
        return {
          topline: {
            o: oCoords.tl,
            d: oCoords.tr,
          },
          rightline: {
            o: oCoords.tr,
            d: oCoords.br,
          },
          bottomline: {
            o: oCoords.br,
            d: oCoords.bl,
          },
          leftline: {
            o: oCoords.bl,
            d: oCoords.tl,
          },
        };
      },

      /**
       * Helper method to determine how many cross points are between the 4 object edges
       * and the horizontal line determined by a point on canvas
       * @private
       * @param {fabric.Point} point Point to check
       * @param {Object} lines Coordinates of the object being evaluated
       */
      // remove yi, not used but left code here just in case.
      _findCrossPoints: function (point, lines) {
        var b1,
          b2,
          a1,
          a2,
          xi, // yi,
          xcount = 0,
          iLine;

        for (var lineKey in lines) {
          iLine = lines[lineKey];
          // optimisation 1: line below point. no cross
          if (iLine.o.y < point.y && iLine.d.y < point.y) {
            continue;
          }
          // optimisation 2: line above point. no cross
          if (iLine.o.y >= point.y && iLine.d.y >= point.y) {
            continue;
          }
          // optimisation 3: vertical line case
          if (iLine.o.x === iLine.d.x && iLine.o.x >= point.x) {
            xi = iLine.o.x;
            // yi = point.y;
          }
          // calculate the intersection point
          else {
            b1 = 0;
            b2 = (iLine.d.y - iLine.o.y) / (iLine.d.x - iLine.o.x);
            a1 = point.y - b1 * point.x;
            a2 = iLine.o.y - b2 * iLine.o.x;

            xi = -(a1 - a2) / (b1 - b2);
            // yi = a1 + b1 * xi;
          }
          // dont count xi < point.x cases
          if (xi >= point.x) {
            xcount += 1;
          }
          // optimisation 4: specific for square images
          if (xcount === 2) {
            break;
          }
        }
        return xcount;
      },

      /**
       * Returns coordinates of object's bounding rectangle (left, top, width, height)
       * the box is intended as aligned to axis of canvas.
       * @param {Boolean} [absolute] use coordinates without viewportTransform
       * @param {Boolean} [calculate] use coordinates of current position instead of .oCoords / .aCoords
       * @return {Object} Object with left, top, width, height properties
       */
      getBoundingRect: function (absolute, calculate) {
        var coords = this.getCoords(absolute, calculate);
        return fabric.util.makeBoundingBoxFromPoints(coords);
      },

      /**
       * Returns width of an object's bounding box counting transformations
       * before 2.0 it was named getWidth();
       * @return {Number} width value
       */
      getScaledWidth: function () {
        return this._getTransformedDimensions().x;
      },

      /**
       * Returns height of an object bounding box counting transformations
       * before 2.0 it was named getHeight();
       * @return {Number} height value
       */
      getScaledHeight: function () {
        return this._getTransformedDimensions().y;
      },

      /**
       * Makes sure the scale is valid and modifies it if necessary
       * @private
       * @param {Number} value
       * @return {Number}
       */
      _constrainScale: function (value) {
        if (Math.abs(value) < this.minScaleLimit) {
          if (value < 0) {
            return -this.minScaleLimit;
          } else {
            return this.minScaleLimit;
          }
        } else if (value === 0) {
          return 0.0001;
        }
        return value;
      },

      /**
       * Scales an object (equally by x and y)
       * @param {Number} value Scale factor
       * @return {fabric.Object} thisArg
       * @chainable
       */
      scale: function (value) {
        this._set('scaleX', value);
        this._set('scaleY', value);
        return this.setCoords();
      },

      /**
       * Scales an object to a given width, with respect to bounding box (scaling by x/y equally)
       * @param {Number} value New width value
       * @param {Boolean} absolute ignore viewport
       * @return {fabric.Object} thisArg
       * @chainable
       */
      scaleToWidth: function (value, absolute) {
        // adjust to bounding rect factor so that rotated shapes would fit as well
        var boundingRectFactor =
          this.getBoundingRect(absolute).width / this.getScaledWidth();
        return this.scale(value / this.width / boundingRectFactor);
      },

      /**
       * Scales an object to a given height, with respect to bounding box (scaling by x/y equally)
       * @param {Number} value New height value
       * @param {Boolean} absolute ignore viewport
       * @return {fabric.Object} thisArg
       * @chainable
       */
      scaleToHeight: function (value, absolute) {
        // adjust to bounding rect factor so that rotated shapes would fit as well
        var boundingRectFactor =
          this.getBoundingRect(absolute).height / this.getScaledHeight();
        return this.scale(value / this.height / boundingRectFactor);
      },

      /**
       * Calculates and returns the .coords of an object.
       * @return {Object} Object with tl, tr, br, bl ....
       * @chainable
       */
      calcCoords: function (absolute) {
        var rotateMatrix = this._calcRotateMatrix(),
          translateMatrix = this._calcTranslateMatrix(),
          startMatrix = multiplyMatrices(translateMatrix, rotateMatrix),
          vpt = this.getViewportTransform(),
          finalMatrix = absolute
            ? startMatrix
            : multiplyMatrices(vpt, startMatrix),
          dim = this._getTransformedDimensions(),
          w = dim.x / 2,
          h = dim.y / 2,
          tl = transformPoint({ x: -w, y: -h }, finalMatrix),
          tr = transformPoint({ x: w, y: -h }, finalMatrix),
          bl = transformPoint({ x: -w, y: h }, finalMatrix),
          br = transformPoint({ x: w, y: h }, finalMatrix);
        if (!absolute) {
          var padding = this.padding,
            angle = degreesToRadians(this.angle),
            cos = fabric.util.cos(angle),
            sin = fabric.util.sin(angle),
            cosP = cos * padding,
            sinP = sin * padding,
            cosPSinP = cosP + sinP,
            cosPMinusSinP = cosP - sinP;
          if (padding) {
            tl.x -= cosPMinusSinP;
            tl.y -= cosPSinP;
            tr.x += cosPSinP;
            tr.y -= cosPMinusSinP;
            bl.x -= cosPSinP;
            bl.y += cosPMinusSinP;
            br.x += cosPMinusSinP;
            br.y += cosPSinP;
          }
          var ml = new fabric.Point((tl.x + bl.x) / 2, (tl.y + bl.y) / 2),
            mt = new fabric.Point((tr.x + tl.x) / 2, (tr.y + tl.y) / 2),
            mr = new fabric.Point((br.x + tr.x) / 2, (br.y + tr.y) / 2),
            mb = new fabric.Point((br.x + bl.x) / 2, (br.y + bl.y) / 2),
            mtr = new fabric.Point(
              mt.x + sin * this.rotatingPointOffset,
              mt.y - cos * this.rotatingPointOffset
            );
        }

        // if (!absolute) {
        //   var canvas = this.canvas;
        //   setTimeout(function() {
        //     canvas.contextTop.clearRect(0, 0, 700, 700);
        //     canvas.contextTop.fillStyle = 'green';
        //     canvas.contextTop.fillRect(mb.x, mb.y, 3, 3);
        //     canvas.contextTop.fillRect(bl.x, bl.y, 3, 3);
        //     canvas.contextTop.fillRect(br.x, br.y, 3, 3);
        //     canvas.contextTop.fillRect(tl.x, tl.y, 3, 3);
        //     canvas.contextTop.fillRect(tr.x, tr.y, 3, 3);
        //     canvas.contextTop.fillRect(ml.x, ml.y, 3, 3);
        //     canvas.contextTop.fillRect(mr.x, mr.y, 3, 3);
        //     canvas.contextTop.fillRect(mt.x, mt.y, 3, 3);
        //     canvas.contextTop.fillRect(mtr.x, mtr.y, 3, 3);
        //   }, 50);
        // }

        var coords = {
          // corners
          tl: tl,
          tr: tr,
          br: br,
          bl: bl,
        };
        if (!absolute) {
          // middle
          coords.ml = ml;
          coords.mt = mt;
          coords.mr = mr;
          coords.mb = mb;
          // rotating point
          coords.mtr = mtr;
        }
        return coords;
      },

      /**
       * Sets corner position coordinates based on current angle, width and height.
       * See {@link https://github.com/kangax/fabric.js/wiki/When-to-call-setCoords|When-to-call-setCoords}
       * @param {Boolean} [ignoreZoom] set oCoords with or without the viewport transform.
       * @param {Boolean} [skipAbsolute] skip calculation of aCoords, useful in setViewportTransform
       * @return {fabric.Object} thisArg
       * @chainable
       */
      setCoords: function (ignoreZoom, skipAbsolute) {
        this.oCoords = this.calcCoords(ignoreZoom);
        if (!skipAbsolute) {
          this.aCoords = this.calcCoords(true);
        }

        // set coordinates of the draggable boxes in the corners used to scale/rotate the image
        ignoreZoom || (this._setCornerCoords && this._setCornerCoords());

        return this;
      },

      /**
       * calculate rotation matrix of an object
       * @return {Array} rotation matrix for the object
       */
      _calcRotateMatrix: function () {
        return fabric.util.calcRotateMatrix(this);
      },

      /**
       * calculate the translation matrix for an object transform
       * @return {Array} rotation matrix for the object
       */
      _calcTranslateMatrix: function () {
        var center = this.getCenterPoint();
        return [1, 0, 0, 1, center.x, center.y];
      },

      transformMatrixKey: function (skipGroup) {
        var sep = '_',
          prefix = '';
        if (!skipGroup && this.group) {
          prefix = this.group.transformMatrixKey(skipGroup) + sep;
        }
        return (
          prefix +
          this.top +
          sep +
          this.left +
          sep +
          this.scaleX +
          sep +
          this.scaleY +
          sep +
          this.skewX +
          sep +
          this.skewY +
          sep +
          this.angle +
          sep +
          this.originX +
          sep +
          this.originY +
          sep +
          this.width +
          sep +
          this.height +
          sep +
          this.strokeWidth +
          this.flipX +
          this.flipY
        );
      },

      /**
       * calculate transform matrix that represents the current transformations from the
       * object's properties.
       * @param {Boolean} [skipGroup] return transform matrix for object not counting parent transformations
       * @return {Array} transform matrix for the object
       */
      calcTransformMatrix: function (skipGroup) {
        if (skipGroup) {
          return this.calcOwnMatrix();
        }
        var key = this.transformMatrixKey(),
          cache = this.matrixCache || (this.matrixCache = {});
        if (cache.key === key) {
          return cache.value;
        }
        var matrix = this.calcOwnMatrix();
        if (this.group) {
          matrix = multiplyMatrices(this.group.calcTransformMatrix(), matrix);
        }
        cache.key = key;
        cache.value = matrix;
        return matrix;
      },

      /**
       * calculate transform matrix that represents the current transformations from the
       * object's properties, this matrix does not include the group transformation
       * @return {Array} transform matrix for the object
       */
      calcOwnMatrix: function () {
        var key = this.transformMatrixKey(true),
          cache = this.ownMatrixCache || (this.ownMatrixCache = {});
        if (cache.key === key) {
          return cache.value;
        }
        var tMatrix = this._calcTranslateMatrix();
        this.translateX = tMatrix[4];
        this.translateY = tMatrix[5];
        cache.key = key;
        cache.value = fabric.util.composeMatrix(this);
        return cache.value;
      },

      /*
       * Calculate object dimensions from its properties
       * @private
       * @deprecated since 3.4.0, please use fabric.util._calcDimensionsTransformMatrix
       * not including or including flipX, flipY to emulate the flipping boolean
       * @return {Object} .x width dimension
       * @return {Object} .y height dimension
       */
      _calcDimensionsTransformMatrix: function (skewX, skewY, flipping) {
        return fabric.util.calcDimensionsMatrix({
          skewX: skewX,
          skewY: skewY,
          scaleX: this.scaleX * (flipping && this.flipX ? -1 : 1),
          scaleY: this.scaleY * (flipping && this.flipY ? -1 : 1),
        });
      },

      /*
       * Calculate object dimensions from its properties
       * @private
       * @return {Object} .x width dimension
       * @return {Object} .y height dimension
       */
      _getNonTransformedDimensions: function () {
        var strokeWidth = this.strokeWidth,
          w = this.width + strokeWidth,
          h = this.height + strokeWidth;
        return { x: w, y: h };
      },

      /*
       * Calculate object bounding box dimensions from its properties scale, skew.
       * The skewX and skewY parameters are used in the skewing logic path and
       * do not provide something useful to common use cases.
       * @param {Number} [skewX], a value to override current skewX
       * @param {Number} [skewY], a value to override current skewY
       * @private
       * @return {Object} .x width dimension
       * @return {Object} .y height dimension
       */
      _getTransformedDimensions: function (skewX, skewY) {
        if (typeof skewX === 'undefined') {
          skewX = this.skewX;
        }
        if (typeof skewY === 'undefined') {
          skewY = this.skewY;
        }
        var dimensions = this._getNonTransformedDimensions(),
          dimX,
          dimY,
          noSkew = skewX === 0 && skewY === 0;

        if (this.strokeUniform) {
          dimX = this.width;
          dimY = this.height;
        } else {
          dimX = dimensions.x;
          dimY = dimensions.y;
        }
        if (noSkew) {
          return this._finalizeDimensions(
            dimX * this.scaleX,
            dimY * this.scaleY
          );
        } else {
          dimX /= 2;
          dimY /= 2;
        }
        var points = [
            {
              x: -dimX,
              y: -dimY,
            },
            {
              x: dimX,
              y: -dimY,
            },
            {
              x: -dimX,
              y: dimY,
            },
            {
              x: dimX,
              y: dimY,
            },
          ],
          transformMatrix = fabric.util.calcDimensionsMatrix({
            scaleX: this.scaleX,
            scaleY: this.scaleY,
            skewX: skewX,
            skewY: skewY,
          }),
          bbox = fabric.util.makeBoundingBoxFromPoints(points, transformMatrix);
        return this._finalizeDimensions(bbox.width, bbox.height);
      },

      /*
       * Calculate object bounding box dimensions from its properties scale, skew.
       * @param Number width width of the bbox
       * @param Number height height of the bbox
       * @private
       * @return {Object} .x finalized width dimension
       * @return {Object} .y finalized height dimension
       */
      _finalizeDimensions: function (width, height) {
        return this.strokeUniform
          ? { x: width + this.strokeWidth, y: height + this.strokeWidth }
          : { x: width, y: height };
      },
      /*
       * Calculate object dimensions for controls, including padding and canvas zoom.
       * private
       */
      _calculateCurrentDimensions: function () {
        var vpt = this.getViewportTransform(),
          dim = this._getTransformedDimensions(),
          p = fabric.util.transformPoint(dim, vpt, true);

        return p.scalarAdd(2 * this.padding);
      },
    }
  );
})();
fabric.util.object.extend(
  fabric.Object.prototype,
  /** @lends fabric.Object.prototype */ {
    /**
     * Moves an object to the bottom of the stack of drawn objects
     * @return {fabric.Object} thisArg
     * @chainable
     */
    sendToBack: function () {
      if (this.group) {
        fabric.StaticCanvas.prototype.sendToBack.call(this.group, this);
      } else if (this.canvas) {
        this.canvas.sendToBack(this);
      }
      return this;
    },

    /**
     * Moves an object to the top of the stack of drawn objects
     * @return {fabric.Object} thisArg
     * @chainable
     */
    bringToFront: function () {
      if (this.group) {
        fabric.StaticCanvas.prototype.bringToFront.call(this.group, this);
      } else if (this.canvas) {
        this.canvas.bringToFront(this);
      }
      return this;
    },

    /**
     * Moves an object down in stack of drawn objects
     * @param {Boolean} [intersecting] If `true`, send object behind next lower intersecting object
     * @return {fabric.Object} thisArg
     * @chainable
     */
    sendBackwards: function (intersecting) {
      if (this.group) {
        fabric.StaticCanvas.prototype.sendBackwards.call(
          this.group,
          this,
          intersecting
        );
      } else if (this.canvas) {
        this.canvas.sendBackwards(this, intersecting);
      }
      return this;
    },

    /**
     * Moves an object up in stack of drawn objects
     * @param {Boolean} [intersecting] If `true`, send object in front of next upper intersecting object
     * @return {fabric.Object} thisArg
     * @chainable
     */
    bringForward: function (intersecting) {
      if (this.group) {
        fabric.StaticCanvas.prototype.bringForward.call(
          this.group,
          this,
          intersecting
        );
      } else if (this.canvas) {
        this.canvas.bringForward(this, intersecting);
      }
      return this;
    },

    /**
     * Moves an object to specified level in stack of drawn objects
     * @param {Number} index New position of object
     * @return {fabric.Object} thisArg
     * @chainable
     */
    moveTo: function (index) {
      if (this.group && this.group.type !== 'activeSelection') {
        fabric.StaticCanvas.prototype.moveTo.call(this.group, this, index);
      } else if (this.canvas) {
        this.canvas.moveTo(this, index);
      }
      return this;
    },
  }
);
/* _TO_SVG_START_ */
(function () {
  function getSvgColorString(prop, value) {
    if (!value) {
      return prop + ': none; ';
    } else if (value.toLive) {
      return prop + ': url(#SVGID_' + value.id + '); ';
    } else {
      var color = new fabric.Color(value),
        str = prop + ': ' + color.toRgb() + '; ',
        opacity = color.getAlpha();
      if (opacity !== 1) {
        //change the color in rgb + opacity
        str += prop + '-opacity: ' + opacity.toString() + '; ';
      }
      return str;
    }
  }

  var toFixed = fabric.util.toFixed;

  fabric.util.object.extend(
    fabric.Object.prototype,
    /** @lends fabric.Object.prototype */ {
      /**
       * Returns styles-string for svg-export
       * @param {Boolean} skipShadow a boolean to skip shadow filter output
       * @return {String}
       */
      getSvgStyles: function (skipShadow) {
        var fillRule = this.fillRule ? this.fillRule : 'nonzero',
          strokeWidth = this.strokeWidth ? this.strokeWidth : '0',
          strokeDashArray = this.strokeDashArray
            ? this.strokeDashArray.join(' ')
            : 'none',
          strokeDashOffset = this.strokeDashOffset
            ? this.strokeDashOffset
            : '0',
          strokeLineCap = this.strokeLineCap ? this.strokeLineCap : 'butt',
          strokeLineJoin = this.strokeLineJoin ? this.strokeLineJoin : 'miter',
          strokeMiterLimit = this.strokeMiterLimit
            ? this.strokeMiterLimit
            : '4',
          opacity = typeof this.opacity !== 'undefined' ? this.opacity : '1',
          visibility = this.visible ? '' : ' visibility: hidden;',
          filter = skipShadow ? '' : this.getSvgFilter(),
          fill = getSvgColorString('fill', this.fill),
          stroke = getSvgColorString('stroke', this.stroke);

        return [
          stroke,
          'stroke-width: ',
          strokeWidth,
          '; ',
          'stroke-dasharray: ',
          strokeDashArray,
          '; ',
          'stroke-linecap: ',
          strokeLineCap,
          '; ',
          'stroke-dashoffset: ',
          strokeDashOffset,
          '; ',
          'stroke-linejoin: ',
          strokeLineJoin,
          '; ',
          'stroke-miterlimit: ',
          strokeMiterLimit,
          '; ',
          fill,
          'fill-rule: ',
          fillRule,
          '; ',
          'opacity: ',
          opacity,
          ';',
          filter,
          visibility,
        ].join('');
      },

      /**
       * Returns styles-string for svg-export
       * @param {Object} style the object from which to retrieve style properties
       * @param {Boolean} useWhiteSpace a boolean to include an additional attribute in the style.
       * @return {String}
       */
      getSvgSpanStyles: function (style, useWhiteSpace) {
        var term = '; ';
        var fontFamily = style.fontFamily
          ? 'font-family: ' +
            (style.fontFamily.indexOf("'") === -1 &&
            style.fontFamily.indexOf('"') === -1
              ? "'" + style.fontFamily + "'"
              : style.fontFamily) +
            term
          : '';
        var strokeWidth = style.strokeWidth
            ? 'stroke-width: ' + style.strokeWidth + term
            : '',
          // fontFamily = fontFamily,
          fontSize = style.fontSize
            ? 'font-size: ' + style.fontSize + 'px' + term
            : '',
          fontStyle = style.fontStyle
            ? 'font-style: ' + style.fontStyle + term
            : '',
          fontWeight = style.fontWeight
            ? 'font-weight: ' + style.fontWeight + term
            : '',
          fill = style.fill ? getSvgColorString('fill', style.fill) : '',
          stroke = style.stroke
            ? getSvgColorString('stroke', style.stroke)
            : '',
          textDecoration = this.getSvgTextDecoration(style),
          deltaY = style.deltaY
            ? 'baseline-shift: ' + -style.deltaY + '; '
            : '';
        if (textDecoration) {
          textDecoration = 'text-decoration: ' + textDecoration + term;
        }

        return [
          stroke,
          strokeWidth,
          fontFamily,
          fontSize,
          fontStyle,
          fontWeight,
          textDecoration,
          fill,
          deltaY,
          useWhiteSpace ? 'white-space: pre; ' : '',
        ].join('');
      },

      /**
       * Returns text-decoration property for svg-export
       * @param {Object} style the object from which to retrieve style properties
       * @return {String}
       */
      getSvgTextDecoration: function (style) {
        return ['overline', 'underline', 'line-through']
          .filter(function (decoration) {
            return style[decoration.replace('-', '')];
          })
          .join(' ');
      },

      /**
       * Returns filter for svg shadow
       * @return {String}
       */
      getSvgFilter: function () {
        return this.shadow ? 'filter: url(#SVGID_' + this.shadow.id + ');' : '';
      },

      /**
       * Returns id attribute for svg output
       * @return {String}
       */
      getSvgCommons: function () {
        return [
          this.id ? 'id="' + this.id + '" ' : '',
          this.clipPath
            ? 'clip-path="url(#' + this.clipPath.clipPathId + ')" '
            : '',
        ].join('');
      },

      /**
       * Returns transform-string for svg-export
       * @param {Boolean} use the full transform or the single object one.
       * @return {String}
       */
      getSvgTransform: function (full, additionalTransform) {
        var transform = full
            ? this.calcTransformMatrix()
            : this.calcOwnMatrix(),
          svgTransform = 'transform="' + fabric.util.matrixToSVG(transform);
        return (
          svgTransform +
          (additionalTransform || '') +
          this.getSvgTransformMatrix() +
          '" '
        );
      },

      /**
       * Returns transform-string for svg-export from the transform matrix of single elements
       * @return {String}
       */
      getSvgTransformMatrix: function () {
        return this.transformMatrix
          ? ' ' + fabric.util.matrixToSVG(this.transformMatrix)
          : '';
      },

      _setSVGBg: function (textBgRects) {
        if (this.backgroundColor) {
          var NUM_FRACTION_DIGITS = fabric.Object.NUM_FRACTION_DIGITS;
          textBgRects.push(
            '\t\t<rect ',
            this._getFillAttributes(this.backgroundColor),
            ' x="',
            toFixed(-this.width / 2, NUM_FRACTION_DIGITS),
            '" y="',
            toFixed(-this.height / 2, NUM_FRACTION_DIGITS),
            '" width="',
            toFixed(this.width, NUM_FRACTION_DIGITS),
            '" height="',
            toFixed(this.height, NUM_FRACTION_DIGITS),
            '"></rect>\n'
          );
        }
      },

      /**
       * Returns svg representation of an instance
       * @param {Function} [reviver] Method for further parsing of svg representation.
       * @return {String} svg representation of an instance
       */
      toSVG: function (reviver) {
        return this._createBaseSVGMarkup(this._toSVG(reviver), {
          reviver: reviver,
        });
      },

      /**
       * Returns svg clipPath representation of an instance
       * @param {Function} [reviver] Method for further parsing of svg representation.
       * @return {String} svg representation of an instance
       */
      toClipPathSVG: function (reviver) {
        return (
          '\t' +
          this._createBaseClipPathSVGMarkup(this._toSVG(reviver), {
            reviver: reviver,
          })
        );
      },

      /**
       * @private
       */
      _createBaseClipPathSVGMarkup: function (objectMarkup, options) {
        options = options || {};
        var reviver = options.reviver,
          additionalTransform = options.additionalTransform || '',
          commonPieces = [
            this.getSvgTransform(true, additionalTransform),
            this.getSvgCommons(),
          ].join(''),
          // insert commons in the markup, style and svgCommons
          index = objectMarkup.indexOf('COMMON_PARTS');
        objectMarkup[index] = commonPieces;
        return reviver ? reviver(objectMarkup.join('')) : objectMarkup.join('');
      },

      /**
       * @private
       */
      _createBaseSVGMarkup: function (objectMarkup, options) {
        options = options || {};
        var noStyle = options.noStyle,
          reviver = options.reviver,
          styleInfo = noStyle ? '' : 'style="' + this.getSvgStyles() + '" ',
          shadowInfo = options.withShadow
            ? 'style="' + this.getSvgFilter() + '" '
            : '',
          clipPath = this.clipPath,
          vectorEffect = this.strokeUniform
            ? 'vector-effect="non-scaling-stroke" '
            : '',
          absoluteClipPath = clipPath && clipPath.absolutePositioned,
          stroke = this.stroke,
          fill = this.fill,
          shadow = this.shadow,
          commonPieces,
          markup = [],
          clipPathMarkup,
          // insert commons in the markup, style and svgCommons
          index = objectMarkup.indexOf('COMMON_PARTS'),
          additionalTransform = options.additionalTransform;
        if (clipPath) {
          clipPath.clipPathId = 'CLIPPATH_' + fabric.Object.__uid++;
          clipPathMarkup =
            '<clipPath id="' +
            clipPath.clipPathId +
            '" >\n' +
            clipPath.toClipPathSVG(reviver) +
            '</clipPath>\n';
        }
        if (absoluteClipPath) {
          markup.push('<g ', shadowInfo, this.getSvgCommons(), ' >\n');
        }
        markup.push(
          '<g ',
          this.getSvgTransform(false),
          !absoluteClipPath ? shadowInfo + this.getSvgCommons() : '',
          ' >\n'
        );
        commonPieces = [
          styleInfo,
          vectorEffect,
          noStyle ? '' : this.addPaintOrder(),
          ' ',
          additionalTransform ? 'transform="' + additionalTransform + '" ' : '',
        ].join('');
        objectMarkup[index] = commonPieces;
        if (fill && fill.toLive) {
          markup.push(fill.toSVG(this));
        }
        if (stroke && stroke.toLive) {
          markup.push(stroke.toSVG(this));
        }
        if (shadow) {
          markup.push(shadow.toSVG(this));
        }
        if (clipPath) {
          markup.push(clipPathMarkup);
        }
        markup.push(objectMarkup.join(''));
        markup.push('</g>\n');
        absoluteClipPath && markup.push('</g>\n');
        return reviver ? reviver(markup.join('')) : markup.join('');
      },

      addPaintOrder: function () {
        return this.paintFirst !== 'fill'
          ? ' paint-order="' + this.paintFirst + '" '
          : '';
      },
    }
  );
})();
/* _TO_SVG_END_ */
(function () {
  var extend = fabric.util.object.extend,
    originalSet = 'stateProperties';

  /*
    Depends on `stateProperties`
  */
  function saveProps(origin, destination, props) {
    var tmpObj = {},
      deep = true;
    props.forEach(function (prop) {
      tmpObj[prop] = origin[prop];
    });
    extend(origin[destination], tmpObj, deep);
  }

  function _isEqual(origValue, currentValue, firstPass) {
    if (origValue === currentValue) {
      // if the objects are identical, return
      return true;
    } else if (Array.isArray(origValue)) {
      if (
        !Array.isArray(currentValue) ||
        origValue.length !== currentValue.length
      ) {
        return false;
      }
      for (let i = 0, len = origValue.length; i < len; i++) {
        if (!_isEqual(origValue[i], currentValue[i])) {
          return false;
        }
      }
      return true;
    } else if (origValue && typeof origValue === 'object') {
      var keys = Object.keys(origValue),
        key;
      if (
        !currentValue ||
        typeof currentValue !== 'object' ||
        (!firstPass && keys.length !== Object.keys(currentValue).length)
      ) {
        return false;
      }
      for (let i = 0, len = keys.length; i < len; i++) {
        key = keys[i];
        // since clipPath is in the statefull cache list and the clipPath objects
        // would be iterated as an object, this would lead to possible infinite recursion
        if (key === 'canvas') {
          continue;
        }
        if (!_isEqual(origValue[key], currentValue[key])) {
          return false;
        }
      }
      return true;
    }
  }

  fabric.util.object.extend(
    fabric.Object.prototype,
    /** @lends fabric.Object.prototype */ {
      /**
       * Returns true if object state (one of its state properties) was changed
       * @param {String} [propertySet] optional name for the set of property we want to save
       * @return {Boolean} true if instance' state has changed since `{@link fabric.Object#saveState}` was called
       */
      hasStateChanged: function (propertySet) {
        propertySet = propertySet || originalSet;
        var dashedPropertySet = '_' + propertySet;
        if (
          Object.keys(this[dashedPropertySet]).length < this[propertySet].length
        ) {
          return true;
        }
        return !_isEqual(this[dashedPropertySet], this, true);
      },

      /**
       * Saves state of an object
       * @param {Object} [options] Object with additional `stateProperties` array to include when saving state
       * @return {fabric.Object} thisArg
       */
      saveState: function (options) {
        var propertySet = (options && options.propertySet) || originalSet,
          destination = '_' + propertySet;
        if (!this[destination]) {
          return this.setupState(options);
        }
        saveProps(this, destination, this[propertySet]);
        if (options && options.stateProperties) {
          saveProps(this, destination, options.stateProperties);
        }
        return this;
      },

      /**
       * Setups state of an object
       * @param {Object} [options] Object with additional `stateProperties` array to include when saving state
       * @return {fabric.Object} thisArg
       */
      setupState: function (options) {
        options = options || {};
        var propertySet = options.propertySet || originalSet;
        options.propertySet = propertySet;
        this['_' + propertySet] = {};
        this.saveState(options);
        return this;
      },
    }
  );
})();

fabric.util.object.extend(
  fabric.Object.prototype,
  /** @lends fabric.Object.prototype */ {
    /**
     * Animates object's properties
     * @param {String|Object} property Property to animate (if string) or properties to animate (if object)
     * @param {Number|Object} value Value to animate property to (if string was given first) or options object
     * @return {fabric.Object} thisArg
     * @tutorial {@link http://fabricjs.com/fabric-intro-part-2#animation}
     * @chainable
     *
     * As object — multiple properties
     *
     * object.animate({ left: ..., top: ... });
     * object.animate({ left: ..., top: ... }, { duration: ... });
     *
     * As string — one property
     *
     * object.animate('left', ...);
     * object.animate('left', { duration: ... });
     *
     */
    animate: function () {
      if (arguments[0] && typeof arguments[0] === 'object') {
        var propsToAnimate = [],
          prop,
          skipCallbacks;
        for (prop in arguments[0]) {
          propsToAnimate.push(prop);
        }
        for (var i = 0, len = propsToAnimate.length; i < len; i++) {
          prop = propsToAnimate[i];
          skipCallbacks = i !== len - 1;
          this._animate(prop, arguments[0][prop], arguments[1], skipCallbacks);
        }
      } else {
        this._animate.apply(this, arguments);
      }
      return this;
    },

    /**
     * @private
     * @param {String} property Property to animate
     * @param {String} to Value to animate to
     * @param {Object} [options] Options object
     * @param {Boolean} [skipCallbacks] When true, callbacks like onchange and oncomplete are not invoked
     */
    _animate: function (property, to, options, skipCallbacks) {
      var _this = this,
        propPair;

      to = to.toString();

      if (!options) {
        options = {};
      } else {
        options = fabric.util.object.clone(options);
      }

      if (~property.indexOf('.')) {
        propPair = property.split('.');
      }

      var currentValue = propPair
        ? this.get(propPair[0])[propPair[1]]
        : this.get(property);

      if (!('from' in options)) {
        options.from = currentValue;
      }

      if (~to.indexOf('=')) {
        to = currentValue + parseFloat(to.replace('=', ''));
      } else {
        to = parseFloat(to);
      }

      fabric.util.animate({
        startValue: options.from,
        endValue: to,
        byValue: options.by,
        easing: options.easing,
        duration: options.duration,
        abort:
          options.abort &&
          function () {
            return options.abort.call(_this);
          },
        onChange: function (value, valueProgress, timeProgress) {
          if (propPair) {
            _this[propPair[0]][propPair[1]] = value;
          } else {
            _this.set(property, value);
          }
          if (skipCallbacks) {
            return;
          }
          options.onChange &&
            options.onChange(value, valueProgress, timeProgress);
        },
        onComplete: function (value, valueProgress, timeProgress) {
          if (skipCallbacks) {
            return;
          }

          _this.setCoords();
          options.onComplete &&
            options.onComplete(value, valueProgress, timeProgress);
        },
      });
    },
  }
);
(function initGroup(global) {
  var fabric = global.fabric || (global.fabric = {}),
    min = fabric.util.array.min,
    max = fabric.util.array.max;

  if (fabric.Group) {
    return;
  }

  /**
   * Group class
   * @class fabric.Group
   * @extends fabric.Object
   * @mixes fabric.Collection
   * @tutorial {@link http://fabricjs.com/fabric-intro-part-3#groups}
   * @see {@link fabric.Group#initialize} for constructor definition
   */
  fabric.Group = fabric.util.createClass(
    fabric.Object,
    fabric.Collection,
    /** @lends fabric.Group.prototype */ {
      /**
       * Type of an object
       * @type String
       * @default
       */
      type: 'group',

      /**
       * Width of stroke
       * @type Number
       * @default
       */
      strokeWidth: 0,

      /**
       * Indicates if click, mouseover, mouseout events & hoverCursor should also check for subtargets
       * @type Boolean
       * @default
       */
      subTargetCheck: false,

      /**
       * Groups are container, do not render anything on theyr own, ence no cache properties
       * @type Array
       * @default
       */
      cacheProperties: [],

      /**
       * setOnGroup is a method used for TextBox that is no more used since 2.0.0 The behavior is still
       * available setting this boolean to true.
       * @type Boolean
       * @since 2.0.0
       * @default
       */
      useSetOnGroup: false,

      /**
       * Constructor
       * @param {Object} objects Group objects
       * @param {Object} [options] Options object
       * @param {Boolean} [isAlreadyGrouped] if true, objects have been grouped already.
       * @return {Object} thisArg
       */
      initialize: function (objects, options, isAlreadyGrouped) {
        options = options || {};
        this._objects = [];
        // if objects enclosed in a group have been grouped already,
        // we cannot change properties of objects.
        // Thus we need to set options to group without objects,
        isAlreadyGrouped && this.callSuper('initialize', options);
        this._objects = objects || [];
        for (var i = this._objects.length; i--; ) {
          this._objects[i].group = this;
        }

        if (!isAlreadyGrouped) {
          var center = options && options.centerPoint;
          // we want to set origins before calculating the bounding box.
          // so that the topleft can be set with that in mind.
          // if specific top and left are passed, are overwritten later
          // with the callSuper('initialize', options)
          if (options.originX !== undefined) {
            this.originX = options.originX;
          }
          if (options.originY !== undefined) {
            this.originY = options.originY;
          }
          // if coming from svg i do not want to calc bounds.
          // i assume width and height are passed along options
          center || this._calcBounds();
          this._updateObjectsCoords(center);
          delete options.centerPoint;
          this.callSuper('initialize', options);
        } else {
          this._updateObjectsACoords();
        }

        this.setCoords();
      },

      /**
       * @private
       * @param {Boolean} [skipCoordsChange] if true, coordinates of objects enclosed in a group do not change
       */
      _updateObjectsACoords: function () {
        var ignoreZoom = true,
          skipAbsolute = true;
        for (var i = this._objects.length; i--; ) {
          this._objects[i].setCoords(ignoreZoom, skipAbsolute);
        }
      },

      /**
       * @private
       * @param {Boolean} [skipCoordsChange] if true, coordinates of objects enclosed in a group do not change
       */
      _updateObjectsCoords: function (center) {
        var actualCenter = center || this.getCenterPoint();
        for (var i = this._objects.length; i--; ) {
          this._updateObjectCoords(this._objects[i], actualCenter);
        }
      },

      /**
       * @private
       * @param {Object} object
       * @param {fabric.Point} center, current center of group.
       */
      _updateObjectCoords: function (object, center) {
        var objectLeft = object.left,
          objectTop = object.top,
          ignoreZoom = true,
          skipAbsolute = true;

        object.set({
          left: objectLeft - center.x,
          top: objectTop - center.y,
        });
        object.group = this;
        object.setCoords(ignoreZoom, skipAbsolute);
      },

      /**
       * Returns string represenation of a group
       * @return {String}
       */
      toString: function () {
        return '#<fabric.Group: (' + this.complexity() + ')>';
      },

      /**
       * Adds an object to a group; Then recalculates group's dimension, position.
       * @param {Object} object
       * @return {fabric.Group} thisArg
       * @chainable
       */
      addWithUpdate: function (object) {
        this._restoreObjectsState();
        fabric.util.resetObjectTransform(this);
        if (object) {
          this._objects.push(object);
          object.group = this;
          object._set('canvas', this.canvas);
        }
        this._calcBounds();
        this._updateObjectsCoords();
        this.setCoords();
        this.dirty = true;
        return this;
      },

      /**
       * Removes an object from a group; Then recalculates group's dimension, position.
       * @param {Object} object
       * @return {fabric.Group} thisArg
       * @chainable
       */
      removeWithUpdate: function (object) {
        this._restoreObjectsState();
        fabric.util.resetObjectTransform(this);

        this.remove(object);
        this._calcBounds();
        this._updateObjectsCoords();
        this.setCoords();
        this.dirty = true;
        return this;
      },

      /**
       * @private
       */
      _onObjectAdded: function (object) {
        this.dirty = true;
        object.group = this;
        object._set('canvas', this.canvas);
      },

      /**
       * @private
       */
      _onObjectRemoved: function (object) {
        this.dirty = true;
        delete object.group;
      },

      /**
       * @private
       */
      _set: function (key, value) {
        var i = this._objects.length;
        if (this.useSetOnGroup) {
          while (i--) {
            this._objects[i].setOnGroup(key, value);
          }
        }
        if (key === 'canvas') {
          while (i--) {
            this._objects[i]._set(key, value);
          }
        }
        fabric.Object.prototype._set.call(this, key, value);
      },

      /**
       * Returns object representation of an instance
       * @param {Array} [propertiesToInclude] Any properties that you might want to additionally include in the output
       * @return {Object} object representation of an instance
       */
      toObject: function (propertiesToInclude) {
        var _includeDefaultValues = this.includeDefaultValues;
        var objsToObject = this._objects.map(function (obj) {
          var originalDefaults = obj.includeDefaultValues;
          obj.includeDefaultValues = _includeDefaultValues;
          var _obj = obj.toObject(propertiesToInclude);
          obj.includeDefaultValues = originalDefaults;
          return _obj;
        });
        var obj = fabric.Object.prototype.toObject.call(
          this,
          propertiesToInclude
        );
        obj.objects = objsToObject;
        return obj;
      },

      /**
       * Returns object representation of an instance, in dataless mode.
       * @param {Array} [propertiesToInclude] Any properties that you might want to additionally include in the output
       * @return {Object} object representation of an instance
       */
      toDatalessObject: function (propertiesToInclude) {
        var objsToObject,
          sourcePath = this.sourcePath;
        if (sourcePath) {
          objsToObject = sourcePath;
        } else {
          var _includeDefaultValues = this.includeDefaultValues;
          objsToObject = this._objects.map(function (obj) {
            var originalDefaults = obj.includeDefaultValues;
            obj.includeDefaultValues = _includeDefaultValues;
            var _obj = obj.toDatalessObject(propertiesToInclude);
            obj.includeDefaultValues = originalDefaults;
            return _obj;
          });
        }
        var obj = fabric.Object.prototype.toDatalessObject.call(
          this,
          propertiesToInclude
        );
        obj.objects = objsToObject;
        return obj;
      },

      /**
       * Renders instance on a given context
       * @param {CanvasRenderingContext2D} ctx context to render instance on
       */
      render: function (ctx) {
        this._transformDone = true;
        this.callSuper('render', ctx);
        this._transformDone = false;
      },

      /**
       * Decide if the object should cache or not. Create its own cache level
       * needsItsOwnCache should be used when the object drawing method requires
       * a cache step. None of the fabric classes requires it.
       * Generally you do not cache objects in groups because the group is already cached.
       * @return {Boolean}
       */
      shouldCache: function () {
        var ownCache = fabric.Object.prototype.shouldCache.call(this);
        if (ownCache) {
          for (var i = 0, len = this._objects.length; i < len; i++) {
            if (this._objects[i].willDrawShadow()) {
              this.ownCaching = false;
              return false;
            }
          }
        }
        return ownCache;
      },

      /**
       * Check if this object or a child object will cast a shadow
       * @return {Boolean}
       */
      willDrawShadow: function () {
        if (fabric.Object.prototype.willDrawShadow.call(this)) {
          return true;
        }
        for (var i = 0, len = this._objects.length; i < len; i++) {
          if (this._objects[i].willDrawShadow()) {
            return true;
          }
        }
        return false;
      },

      /**
       * Check if this group or its parent group are caching, recursively up
       * @return {Boolean}
       */
      isOnACache: function () {
        return this.ownCaching || (this.group && this.group.isOnACache());
      },

      /**
       * Execute the drawing operation for an object on a specified context
       * @param {CanvasRenderingContext2D} ctx Context to render on
       */
      drawObject: function (ctx) {
        for (var i = 0, len = this._objects.length; i < len; i++) {
          this._objects[i].render(ctx);
        }
        this._drawClipPath(ctx);
      },

      /**
       * Check if cache is dirty
       */
      isCacheDirty: function (skipCanvas) {
        if (this.callSuper('isCacheDirty', skipCanvas)) {
          return true;
        }
        if (!this.statefullCache) {
          return false;
        }
        for (var i = 0, len = this._objects.length; i < len; i++) {
          if (this._objects[i].isCacheDirty(true)) {
            if (this._cacheCanvas) {
              // if this group has not a cache canvas there is nothing to clean
              var x = this.cacheWidth / this.zoomX,
                y = this.cacheHeight / this.zoomY;
              this._cacheContext.clearRect(-x / 2, -y / 2, x, y);
            }
            return true;
          }
        }
        return false;
      },

      /**
       * Retores original state of each of group objects (original state is that which was before group was created).
       * @private
       * @return {fabric.Group} thisArg
       * @chainable
       */
      _restoreObjectsState: function () {
        this._objects.forEach(this._restoreObjectState, this);
        return this;
      },

      /**
       * Realises the transform from this group onto the supplied object
       * i.e. it tells you what would happen if the supplied object was in
       * the group, and then the group was destroyed. It mutates the supplied
       * object.
       * @param {fabric.Object} object
       * @return {fabric.Object} transformedObject
       */
      realizeTransform: function (object) {
        var matrix = object.calcTransformMatrix(),
          options = fabric.util.qrDecompose(matrix),
          center = new fabric.Point(options.translateX, options.translateY);
        object.flipX = false;
        object.flipY = false;
        object.set('scaleX', options.scaleX);
        object.set('scaleY', options.scaleY);
        object.skewX = options.skewX;
        object.skewY = options.skewY;
        object.angle = options.angle;
        object.setPositionByOrigin(center, 'center', 'center');
        return object;
      },

      /**
       * Restores original state of a specified object in group
       * @private
       * @param {fabric.Object} object
       * @return {fabric.Group} thisArg
       */
      _restoreObjectState: function (object) {
        this.realizeTransform(object);
        object.setCoords();
        delete object.group;
        return this;
      },

      /**
       * Destroys a group (restoring state of its objects)
       * @return {fabric.Group} thisArg
       * @chainable
       */
      destroy: function () {
        // when group is destroyed objects needs to get a repaint to be eventually
        // displayed on canvas.
        this._objects.forEach(function (object) {
          object.set('dirty', true);
        });
        return this._restoreObjectsState();
      },

      /**
       * make a group an active selection, remove the group from canvas
       * the group has to be on canvas for this to work.
       * @return {fabric.ActiveSelection} thisArg
       * @chainable
       */
      toActiveSelection: function () {
        if (!this.canvas) {
          return;
        }
        var objects = this._objects,
          canvas = this.canvas;
        this._objects = [];
        var options = this.toObject();
        delete options.objects;
        var activeSelection = new fabric.ActiveSelection([]);
        activeSelection.set(options);
        activeSelection.type = 'activeSelection';
        canvas.remove(this);
        objects.forEach(function (object) {
          object.group = activeSelection;
          object.dirty = true;
          canvas.add(object);
        });
        activeSelection.canvas = canvas;
        activeSelection._objects = objects;
        canvas._activeObject = activeSelection;
        activeSelection.setCoords();
        return activeSelection;
      },

      /**
       * Destroys a group (restoring state of its objects)
       * @return {fabric.Group} thisArg
       * @chainable
       */
      ungroupOnCanvas: function () {
        return this._restoreObjectsState();
      },

      /**
       * Sets coordinates of all objects inside group
       * @return {fabric.Group} thisArg
       * @chainable
       */
      setObjectsCoords: function () {
        var ignoreZoom = true,
          skipAbsolute = true;
        this.forEachObject(function (object) {
          object.setCoords(ignoreZoom, skipAbsolute);
        });
        return this;
      },

      /**
       * @private
       */
      _calcBounds: function (onlyWidthHeight) {
        var aX = [],
          aY = [],
          o,
          prop,
          props = ['tr', 'br', 'bl', 'tl'],
          i = 0,
          iLen = this._objects.length,
          j,
          jLen = props.length,
          ignoreZoom = true;

        for (; i < iLen; ++i) {
          o = this._objects[i];
          o.setCoords(ignoreZoom);
          for (j = 0; j < jLen; j++) {
            prop = props[j];
            aX.push(o.oCoords[prop].x);
            aY.push(o.oCoords[prop].y);
          }
        }

        this._getBounds(aX, aY, onlyWidthHeight);
      },

      /**
       * @private
       */
      _getBounds: function (aX, aY, onlyWidthHeight) {
        var minXY = new fabric.Point(min(aX), min(aY)),
          maxXY = new fabric.Point(max(aX), max(aY)),
          top = minXY.y || 0,
          left = minXY.x || 0,
          width = maxXY.x - minXY.x || 0,
          height = maxXY.y - minXY.y || 0;
        this.width = width;
        this.height = height;
        if (!onlyWidthHeight) {
          // the bounding box always finds the topleft most corner.
          // whatever is the group origin, we set up here the left/top position.
          this.setPositionByOrigin({ x: left, y: top }, 'left', 'top');
        }
      },

      /* _TO_SVG_START_ */
      /**
       * Returns svg representation of an instance
       * @param {Function} [reviver] Method for further parsing of svg representation.
       * @return {String} svg representation of an instance
       */
      _toSVG: function (reviver) {
        var svgString = ['<g ', 'COMMON_PARTS', ' >\n'];

        for (var i = 0, len = this._objects.length; i < len; i++) {
          svgString.push('\t\t', this._objects[i].toSVG(reviver));
        }
        svgString.push('</g>\n');
        return svgString;
      },

      /**
       * Returns styles-string for svg-export, specific version for group
       * @return {String}
       */
      getSvgStyles: function () {
        var opacity =
            typeof this.opacity !== 'undefined' && this.opacity !== 1
              ? 'opacity: ' + this.opacity + ';'
              : '',
          visibility = this.visible ? '' : ' visibility: hidden;';
        return [opacity, this.getSvgFilter(), visibility].join('');
      },

      /**
       * Returns svg clipPath representation of an instance
       * @param {Function} [reviver] Method for further parsing of svg representation.
       * @return {String} svg representation of an instance
       */
      toClipPathSVG: function (reviver) {
        var svgString = [];

        for (var i = 0, len = this._objects.length; i < len; i++) {
          svgString.push('\t', this._objects[i].toClipPathSVG(reviver));
        }

        return this._createBaseClipPathSVGMarkup(svgString, {
          reviver: reviver,
        });
      },
      /* _TO_SVG_END_ */
    }
  );

  /**
   * Returns {@link fabric.Group} instance from an object representation
   * @static
   * @memberOf fabric.Group
   * @param {Object} object Object to create a group from
   * @param {Function} [callback] Callback to invoke when an group instance is created
   */
  fabric.Group.fromObject = function (object, callback) {
    var objects = object.objects,
      options = fabric.util.object.clone(object, true);
    delete options.objects;
    if (typeof objects === 'string') {
      // it has to be an url or something went wrong.
      fabric.loadSVGFromURL(objects, function (elements) {
        var group = fabric.util.groupSVGElements(elements, object, objects);
        group.set(options);
        callback && callback(group);
      });
      return;
    }
    fabric.util.enlivenObjects(objects, function (enlivenedObjects) {
      fabric.util.enlivenObjects([object.clipPath], function (enlivedClipPath) {
        var options = fabric.util.object.clone(object, true);
        options.clipPath = enlivedClipPath[0];
        delete options.objects;
        callback && callback(new fabric.Group(enlivenedObjects, options, true));
      });
    });
  };
})(typeof exports !== 'undefined' ? exports : this);
(function initImageClass(global) {
  var extend = fabric.util.object.extend;

  if (!global.fabric) {
    global.fabric = {};
  }

  if (global.fabric.Image) {
    fabric.warn('fabric.Image is already defined.');
    return;
  }

  /**
   * Image class
   * @class fabric.Image
   * @extends fabric.Object
   * @tutorial {@link http://fabricjs.com/fabric-intro-part-1#images}
   * @see {@link fabric.Image#initialize} for constructor definition
   */
  fabric.Image = fabric.util.createClass(
    fabric.Object,
    /** @lends fabric.Image.prototype */ {
      /**
       * Type of an object
       * @type String
       * @default
       */
      type: 'image',

      /**
       * crossOrigin value (one of "", "anonymous", "use-credentials")
       * @see https://developer.mozilla.org/en-US/docs/HTML/CORS_settings_attributes
       * @type String
       * @default
       */
      crossOrigin: '',

      /**
       * Width of a stroke.
       * For image quality a stroke multiple of 2 gives better results.
       * @type Number
       * @default
       */
      strokeWidth: 0,

      /**
       * When calling {@link fabric.Image.getSrc}, return value from element src with `element.getAttribute('src')`.
       * This allows for relative urls as image src.
       * @since 2.7.0
       * @type Boolean
       * @default
       */
      srcFromAttribute: false,

      /**
       * private
       * contains last value of scaleX to detect
       * if the Image got resized after the last Render
       * @type Number
       */
      _lastScaleX: 1,

      /**
       * private
       * contains last value of scaleY to detect
       * if the Image got resized after the last Render
       * @type Number
       */
      _lastScaleY: 1,

      /**
       * private
       * contains last value of scaling applied by the apply filter chain
       * @type Number
       */
      _filterScalingX: 1,

      /**
       * private
       * contains last value of scaling applied by the apply filter chain
       * @type Number
       */
      _filterScalingY: 1,

      /**
       * minimum scale factor under which any resizeFilter is triggered to resize the image
       * 0 will disable the automatic resize. 1 will trigger automatically always.
       * number bigger than 1 are not implemented yet.
       * @type Number
       */
      minimumScaleTrigger: 0.5,

      /**
       * List of properties to consider when checking if
       * state of an object is changed ({@link fabric.Object#hasStateChanged})
       * as well as for history (undo/redo) purposes
       * @type Array
       */
      stateProperties: fabric.Object.prototype.stateProperties.concat(
        'cropX',
        'cropY'
      ),

      /**
       * key used to retrieve the texture representing this image
       * @since 2.0.0
       * @type String
       * @default
       */
      cacheKey: '',

      /**
       * Image crop in pixels from original image size.
       * @since 2.0.0
       * @type Number
       * @default
       */
      cropX: 0,

      /**
       * Image crop in pixels from original image size.
       * @since 2.0.0
       * @type Number
       * @default
       */
      cropY: 0,

      /**
       * Constructor
       * @param {HTMLImageElement | String} element Image element
       * @param {Object} [options] Options object
       * @param {function} [callback] callback function to call after eventual filters applied.
       * @return {fabric.Image} thisArg
       */
      initialize: function (element, options) {
        options || (options = {});
        this.filters = [];
        this.cacheKey = 'texture' + fabric.Object.__uid++;
        this.callSuper('initialize', options);
        this._initElement(element, options);
      },

      /**
       * Returns image element which this instance if based on
       * @return {HTMLImageElement} Image element
       */
      getElement: function () {
        return this._element || {};
      },

      /**
       * Sets image element for this instance to a specified one.
       * If filters defined they are applied to new image.
       * You might need to call `canvas.renderAll` and `object.setCoords` after replacing, to render new image and update controls area.
       * @param {HTMLImageElement} element
       * @param {Object} [options] Options object
       * @return {fabric.Image} thisArg
       * @chainable
       */
      setElement: function (element, options) {
        this.removeTexture(this.cacheKey);
        this.removeTexture(this.cacheKey + '_filtered');
        this._element = element;
        this._originalElement = element;
        this._initConfig(options);
        if (this.filters.length !== 0) {
          this.applyFilters();
        }
        // resizeFilters work on the already filtered copy.
        // we need to apply resizeFilters AFTER normal filters.
        // applyResizeFilters is run more often than normal fiters
        // and is triggered by user interactions rather than dev code
        if (this.resizeFilter) {
          this.applyResizeFilters();
        }
        return this;
      },

      /**
       * Delete a single texture if in webgl mode
       */
      removeTexture: function (key) {
        var backend = fabric.filterBackend;
        if (backend && backend.evictCachesForKey) {
          backend.evictCachesForKey(key);
        }
      },

      /**
       * Delete textures, reference to elements and eventually JSDOM cleanup
       */
      dispose: function () {
        this.removeTexture(this.cacheKey);
        this.removeTexture(this.cacheKey + '_filtered');
        this._cacheContext = undefined;
        ['_originalElement', '_element', '_filteredEl', '_cacheCanvas'].forEach(
          function (element) {
            fabric.util.cleanUpJsdomNode(this[element]);
            this[element] = undefined;
          }.bind(this)
        );
      },

      /**
       * Sets crossOrigin value (on an instance and corresponding image element)
       * @return {fabric.Image} thisArg
       * @chainable
       */
      setCrossOrigin: function (value) {
        this.crossOrigin = value;
        this._element.crossOrigin = value;

        return this;
      },

      /**
       * Returns original size of an image
       * @return {Object} Object with "width" and "height" properties
       */
      getOriginalSize: function () {
        var element = this.getElement();
        return {
          width: element.naturalWidth || element.width,
          height: element.naturalHeight || element.height,
        };
      },

      /**
       * @private
       * @param {CanvasRenderingContext2D} ctx Context to render on
       */
      _stroke: function (ctx) {
        if (!this.stroke || this.strokeWidth === 0) {
          return;
        }
        var w = this.width / 2,
          h = this.height / 2;
        ctx.beginPath();
        ctx.moveTo(-w, -h);
        ctx.lineTo(w, -h);
        ctx.lineTo(w, h);
        ctx.lineTo(-w, h);
        ctx.lineTo(-w, -h);
        ctx.closePath();
      },

      /**
       * @private
       * @param {CanvasRenderingContext2D} ctx Context to render on
       */
      _renderDashedStroke: function (ctx) {
        var x = -this.width / 2,
          y = -this.height / 2,
          w = this.width,
          h = this.height;

        ctx.save();
        this._setStrokeStyles(ctx, this);

        ctx.beginPath();
        fabric.util.drawDashedLine(ctx, x, y, x + w, y, this.strokeDashArray);
        fabric.util.drawDashedLine(
          ctx,
          x + w,
          y,
          x + w,
          y + h,
          this.strokeDashArray
        );
        fabric.util.drawDashedLine(
          ctx,
          x + w,
          y + h,
          x,
          y + h,
          this.strokeDashArray
        );
        fabric.util.drawDashedLine(ctx, x, y + h, x, y, this.strokeDashArray);
        ctx.closePath();
        ctx.restore();
      },

      /**
       * Returns object representation of an instance
       * @param {Array} [propertiesToInclude] Any properties that you might want to additionally include in the output
       * @return {Object} Object representation of an instance
       */
      toObject: function (propertiesToInclude) {
        var filters = [];

        this.filters.forEach(function (filterObj) {
          if (filterObj) {
            filters.push(filterObj.toObject());
          }
        });
        var object = extend(
          this.callSuper(
            'toObject',
            ['crossOrigin', 'cropX', 'cropY'].concat(propertiesToInclude)
          ),
          {
            src: this.getSrc(),
            filters: filters,
          }
        );
        if (this.resizeFilter) {
          object.resizeFilter = this.resizeFilter.toObject();
        }
        return object;
      },

      /**
       * Returns true if an image has crop applied, inspecting values of cropX,cropY,width,hight.
       * @return {Boolean}
       */
      hasCrop: function () {
        return (
          this.cropX ||
          this.cropY ||
          this.width < this._element.width ||
          this.height < this._element.height
        );
      },

      /* _TO_SVG_START_ */
      /**
       * Returns svg representation of an instance
       * @return {Array} an array of strings with the specific svg representation
       * of the instance
       */
      _toSVG: function () {
        var svgString = [],
          imageMarkup = [],
          strokeSvg,
          x = -this.width / 2,
          y = -this.height / 2,
          clipPath = '';
        if (this.hasCrop()) {
          var clipPathId = fabric.Object.__uid++;
          svgString.push(
            '<clipPath id="imageCrop_' + clipPathId + '">\n',
            '\t<rect x="' +
              x +
              '" y="' +
              y +
              '" width="' +
              this.width +
              '" height="' +
              this.height +
              '" />\n',
            '</clipPath>\n'
          );
          clipPath = ' clip-path="url(#imageCrop_' + clipPathId + ')" ';
        }
        imageMarkup.push(
          '\t<image ',
          'COMMON_PARTS',
          'xlink:href="',
          this.getSvgSrc(true),
          '" x="',
          x - this.cropX,
          '" y="',
          y - this.cropY,
          // we're essentially moving origin of transformation from top/left corner to the center of the shape
          // by wrapping it in container <g> element with actual transformation, then offsetting object to the top/left
          // so that object's center aligns with container's left/top
          '" width="',
          this._element.width || this._element.naturalWidth,
          '" height="',
          this._element.height || this._element.height,
          '"',
          clipPath,
          '></image>\n'
        );

        if (this.stroke || this.strokeDashArray) {
          var origFill = this.fill;
          this.fill = null;
          strokeSvg = [
            '\t<rect ',
            'x="',
            x,
            '" y="',
            y,
            '" width="',
            this.width,
            '" height="',
            this.height,
            '" style="',
            this.getSvgStyles(),
            '"/>\n',
          ];
          this.fill = origFill;
        }
        if (this.paintFirst !== 'fill') {
          svgString = svgString.concat(strokeSvg, imageMarkup);
        } else {
          svgString = svgString.concat(imageMarkup, strokeSvg);
        }
        return svgString;
      },
      /* _TO_SVG_END_ */

      /**
       * Returns source of an image
       * @param {Boolean} filtered indicates if the src is needed for svg
       * @return {String} Source of an image
       */
      getSrc: function (filtered) {
        var element = filtered ? this._element : this._originalElement;
        if (element) {
          if (element.toDataURL) {
            return element.toDataURL();
          }

          if (this.srcFromAttribute) {
            return element.getAttribute('src');
          } else {
            return element.src;
          }
        } else {
          return this.src || '';
        }
      },

      /**
       * Sets source of an image
       * @param {String} src Source string (URL)
       * @param {Function} [callback] Callback is invoked when image has been loaded (and all filters have been applied)
       * @param {Object} [options] Options object
       * @return {fabric.Image} thisArg
       * @chainable
       */
      setSrc: function (src, callback, options) {
        fabric.util.loadImage(
          src,
          function (img) {
            this.setElement(img, options);
            this._setWidthHeight();
            callback && callback(this);
          },
          this,
          options && options.crossOrigin
        );
        return this;
      },

      /**
       * Returns string representation of an instance
       * @return {String} String representation of an instance
       */
      toString: function () {
        return '#<fabric.Image: { src: "' + this.getSrc() + '" }>';
      },

      applyResizeFilters: function () {
        var filter = this.resizeFilter,
          minimumScale = this.minimumScaleTrigger,
          objectScale = this.getTotalObjectScaling(),
          scaleX = objectScale.scaleX,
          scaleY = objectScale.scaleY,
          elementToFilter = this._filteredEl || this._originalElement;
        if (this.group) {
          this.set('dirty', true);
        }
        if (!filter || (scaleX > minimumScale && scaleY > minimumScale)) {
          this._element = elementToFilter;
          this._filterScalingX = 1;
          this._filterScalingY = 1;
          this._lastScaleX = scaleX;
          this._lastScaleY = scaleY;
          return;
        }
        if (!fabric.filterBackend) {
          fabric.filterBackend = fabric.initFilterBackend();
        }
        var canvasEl = fabric.util.createCanvasElement(),
          cacheKey = this._filteredEl
            ? this.cacheKey + '_filtered'
            : this.cacheKey,
          sourceWidth = elementToFilter.width,
          sourceHeight = elementToFilter.height;
        canvasEl.width = sourceWidth;
        canvasEl.height = sourceHeight;
        this._element = canvasEl;
        this._lastScaleX = filter.scaleX = scaleX;
        this._lastScaleY = filter.scaleY = scaleY;
        fabric.filterBackend.applyFilters(
          [filter],
          elementToFilter,
          sourceWidth,
          sourceHeight,
          this._element,
          cacheKey
        );
        this._filterScalingX = canvasEl.width / this._originalElement.width;
        this._filterScalingY = canvasEl.height / this._originalElement.height;
      },

      /**
       * Applies filters assigned to this image (from "filters" array) or from filter param
       * @method applyFilters
       * @param {Array} filters to be applied
       * @param {Boolean} forResizing specify if the filter operation is a resize operation
       * @return {thisArg} return the fabric.Image object
       * @chainable
       */
      applyFilters: function (filters) {
        filters = filters || this.filters || [];
        filters = filters.filter(function (filter) {
          return filter && !filter.isNeutralState();
        });
        this.set('dirty', true);

        // needs to clear out or WEBGL will not resize correctly
        this.removeTexture(this.cacheKey + '_filtered');

        if (filters.length === 0) {
          this._element = this._originalElement;
          this._filteredEl = null;
          this._filterScalingX = 1;
          this._filterScalingY = 1;
          return this;
        }

        var imgElement = this._originalElement,
          sourceWidth = imgElement.naturalWidth || imgElement.width,
          sourceHeight = imgElement.naturalHeight || imgElement.height;

        if (this._element === this._originalElement) {
          // if the element is the same we need to create a new element
          var canvasEl = fabric.util.createCanvasElement();
          canvasEl.width = sourceWidth;
          canvasEl.height = sourceHeight;
          this._element = canvasEl;
          this._filteredEl = canvasEl;
        } else {
          // clear the existing element to get new filter data
          // also dereference the eventual resized _element
          this._element = this._filteredEl;
          this._filteredEl
            .getContext('2d')
            .clearRect(0, 0, sourceWidth, sourceHeight);
          // we also need to resize again at next renderAll, so remove saved _lastScaleX/Y
          this._lastScaleX = 1;
          this._lastScaleY = 1;
        }
        if (!fabric.filterBackend) {
          fabric.filterBackend = fabric.initFilterBackend();
        }
        fabric.filterBackend.applyFilters(
          filters,
          this._originalElement,
          sourceWidth,
          sourceHeight,
          this._element,
          this.cacheKey
        );
        if (
          this._originalElement.width !== this._element.width ||
          this._originalElement.height !== this._element.height
        ) {
          this._filterScalingX =
            this._element.width / this._originalElement.width;
          this._filterScalingY =
            this._element.height / this._originalElement.height;
        }
        return this;
      },

      /**
       * @private
       * @param {CanvasRenderingContext2D} ctx Context to render on
       */
      _render: function (ctx) {
        if (
          this.isMoving !== true &&
          this.resizeFilter &&
          this._needsResize()
        ) {
          this.applyResizeFilters();
        }
        this._stroke(ctx);
        this._renderPaintInOrder(ctx);
      },

      /**
       * Decide if the object should cache or not. Create its own cache level
       * needsItsOwnCache should be used when the object drawing method requires
       * a cache step. None of the fabric classes requires it.
       * Generally you do not cache objects in groups because the group outside is cached.
       * This is the special image version where we would like to avoid caching where possible.
       * Essentially images do not benefit from caching. They may require caching, and in that
       * case we do it. Also caching an image usually ends in a loss of details.
       * A full performance audit should be done.
       * @return {Boolean}
       */
      shouldCache: function () {
        return this.needsItsOwnCache();
      },

      _renderFill: function (ctx) {
        var elementToDraw = this._element,
          w = this.width,
          h = this.height,
          sW = Math.min(
            elementToDraw.naturalWidth || elementToDraw.width,
            w * this._filterScalingX
          ),
          sH = Math.min(
            elementToDraw.naturalHeight || elementToDraw.height,
            h * this._filterScalingY
          ),
          x = -w / 2,
          y = -h / 2,
          sX = Math.max(0, this.cropX * this._filterScalingX),
          sY = Math.max(0, this.cropY * this._filterScalingY);

        elementToDraw &&
          ctx.drawImage(elementToDraw, sX, sY, sW, sH, x, y, w, h);
      },

      /**
       * needed to check if image needs resize
       * @private
       */
      _needsResize: function () {
        var scale = this.getTotalObjectScaling();
        return (
          scale.scaleX !== this._lastScaleX || scale.scaleY !== this._lastScaleY
        );
      },

      /**
       * @private
       */
      _resetWidthHeight: function () {
        this.set(this.getOriginalSize());
      },

      /**
       * The Image class's initialization method. This method is automatically
       * called by the constructor.
       * @private
       * @param {HTMLImageElement|String} element The element representing the image
       * @param {Object} [options] Options object
       */
      _initElement: function (element, options) {
        this.setElement(fabric.util.getById(element), options);
        fabric.util.addClass(this.getElement(), fabric.Image.CSS_CANVAS);
      },

      /**
       * @private
       * @param {Object} [options] Options object
       */
      _initConfig: function (options) {
        options || (options = {});
        this.setOptions(options);
        this._setWidthHeight(options);
        if (this._element && this.crossOrigin) {
          this._element.crossOrigin = this.crossOrigin;
        }
      },

      /**
       * @private
       * @param {Array} filters to be initialized
       * @param {Function} callback Callback to invoke when all fabric.Image.filters instances are created
       */
      _initFilters: function (filters, callback) {
        if (filters && filters.length) {
          fabric.util.enlivenObjects(
            filters,
            function (enlivenedObjects) {
              callback && callback(enlivenedObjects);
            },
            'fabric.Image.filters'
          );
        } else {
          callback && callback();
        }
      },

      /**
       * @private
       * Set the width and the height of the image object, using the element or the
       * options.
       * @param {Object} [options] Object with width/height properties
       */
      _setWidthHeight: function (options) {
        options || (options = {});
        var el = this.getElement();
        this.width = options.width || el.naturalWidth || el.width || 0;
        this.height = options.height || el.naturalHeight || el.height || 0;
      },

      /**
       * Calculate offset for center and scale factor for the image in order to respect
       * the preserveAspectRatio attribute
       * @private
       * @return {Object}
       */
      parsePreserveAspectRatioAttribute: function () {
        var pAR = fabric.util.parsePreserveAspectRatioAttribute(
            this.preserveAspectRatio || ''
          ),
          rWidth = this._element.width,
          rHeight = this._element.height,
          scaleX = 1,
          scaleY = 1,
          offsetLeft = 0,
          offsetTop = 0,
          cropX = 0,
          cropY = 0,
          offset,
          pWidth = this.width,
          pHeight = this.height,
          parsedAttributes = { width: pWidth, height: pHeight };
        if (pAR && (pAR.alignX !== 'none' || pAR.alignY !== 'none')) {
          if (pAR.meetOrSlice === 'meet') {
            scaleX = scaleY = fabric.util.findScaleToFit(
              this._element,
              parsedAttributes
            );
            offset = (pWidth - rWidth * scaleX) / 2;
            if (pAR.alignX === 'Min') {
              offsetLeft = -offset;
            }
            if (pAR.alignX === 'Max') {
              offsetLeft = offset;
            }
            offset = (pHeight - rHeight * scaleY) / 2;
            if (pAR.alignY === 'Min') {
              offsetTop = -offset;
            }
            if (pAR.alignY === 'Max') {
              offsetTop = offset;
            }
          }
          if (pAR.meetOrSlice === 'slice') {
            scaleX = scaleY = fabric.util.findScaleToCover(
              this._element,
              parsedAttributes
            );
            offset = rWidth - pWidth / scaleX;
            if (pAR.alignX === 'Mid') {
              cropX = offset / 2;
            }
            if (pAR.alignX === 'Max') {
              cropX = offset;
            }
            offset = rHeight - pHeight / scaleY;
            if (pAR.alignY === 'Mid') {
              cropY = offset / 2;
            }
            if (pAR.alignY === 'Max') {
              cropY = offset;
            }
            rWidth = pWidth / scaleX;
            rHeight = pHeight / scaleY;
          }
        } else {
          scaleX = pWidth / rWidth;
          scaleY = pHeight / rHeight;
        }
        return {
          width: rWidth,
          height: rHeight,
          scaleX: scaleX,
          scaleY: scaleY,
          offsetLeft: offsetLeft,
          offsetTop: offsetTop,
          cropX: cropX,
          cropY: cropY,
        };
      },
    }
  );

  /**
   * Default CSS class name for canvas
   * @static
   * @type String
   * @default
   */
  fabric.Image.CSS_CANVAS = 'canvas-img';

  /**
   * Alias for getSrc
   * @static
   */
  fabric.Image.prototype.getSvgSrc = fabric.Image.prototype.getSrc;

  /**
   * Creates an instance of fabric.Image from its object representation
   * @static
   * @param {Object} object Object to create an instance from
   * @param {Function} callback Callback to invoke when an image instance is created
   */
  fabric.Image.fromObject = function (_object, callback) {
    var object = fabric.util.object.clone(_object);
    fabric.util.loadImage(
      object.src,
      function (img, error) {
        if (error) {
          callback && callback(null, error);
          return;
        }
        fabric.Image.prototype._initFilters.call(
          object,
          object.filters,
          function (filters) {
            object.filters = filters || [];
            fabric.Image.prototype._initFilters.call(
              object,
              [object.resizeFilter],
              function (resizeFilters) {
                object.resizeFilter = resizeFilters[0];
                fabric.util.enlivenObjects([object.clipPath], function (
                  enlivedProps
                ) {
                  object.clipPath = enlivedProps[0];
                  var image = new fabric.Image(img, object);
                  callback(image);
                });
              }
            );
          }
        );
      },
      null,
      object.crossOrigin
    );
  };

  /**
   * Creates an instance of fabric.Image from an URL string
   * @static
   * @param {String} url URL to create an image from
   * @param {Function} [callback] Callback to invoke when image is created (newly created image is passed as a first argument)
   * @param {Object} [imgOptions] Options object
   */
  fabric.Image.fromURL = function (url, callback, imgOptions) {
    fabric.util.loadImage(
      url,
      function (img) {
        callback && callback(new fabric.Image(img, imgOptions));
      },
      null,
      imgOptions && imgOptions.crossOrigin
    );
  };

  /* _FROM_SVG_START_ */
  /**
   * List of attribute names to account for when parsing SVG element (used by {@link fabric.Image.fromElement})
   * @static
   * @see {@link http://www.w3.org/TR/SVG/struct.html#ImageElement}
   */
  fabric.Image.ATTRIBUTE_NAMES = fabric.SHARED_ATTRIBUTES.concat(
    'x y width height preserveAspectRatio xlink:href crossOrigin'.split(' ')
  );

  /**
   * Returns {@link fabric.Image} instance from an SVG element
   * @static
   * @param {SVGElement} element Element to parse
   * @param {Object} [options] Options object
   * @param {Function} callback Callback to execute when fabric.Image object is created
   * @return {fabric.Image} Instance of fabric.Image
   */
  fabric.Image.fromElement = function (element, callback, options) {
    var parsedAttributes = fabric.parseAttributes(
      element,
      fabric.Image.ATTRIBUTE_NAMES
    );
    fabric.Image.fromURL(
      parsedAttributes['xlink:href'],
      callback,
      extend(options ? fabric.util.object.clone(options) : {}, parsedAttributes)
    );
  };
  /* _FROM_SVG_END_ */
})(typeof exports !== 'undefined' ? exports : this);
(function initTestWebGL() {
  /**
   * Tests if webgl supports certain precision
   * @param {WebGL} Canvas WebGL context to test on
   * @param {String} Precision to test can be any of following: 'lowp', 'mediump', 'highp'
   * @returns {Boolean} Whether the user's browser WebGL supports given precision.
   */
  function testPrecision(gl, precision) {
    var fragmentSource = 'precision ' + precision + ' float;\nvoid main(){}';
    var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fragmentShader, fragmentSource);
    gl.compileShader(fragmentShader);
    if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
      return false;
    }
    return true;
  }

  /**
   * Indicate whether this filtering backend is supported by the user's browser.
   * @param {Number} tileSize check if the tileSize is supported
   * @returns {Boolean} Whether the user's browser supports WebGL.
   */
  fabric.isWebglSupported = function (tileSize) {
    if (fabric.isLikelyNode) {
      return false;
    }
    tileSize = tileSize || fabric.WebglFilterBackend.prototype.tileSize;
    var canvas = document.createElement('canvas');
    var gl =
      canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    var isSupported = false;
    // eslint-disable-next-line
    if (gl) {
      fabric.maxTextureSize = gl.getParameter(gl.MAX_TEXTURE_SIZE);
      isSupported = fabric.maxTextureSize >= tileSize;
      var precisions = ['highp', 'mediump', 'lowp'];
      for (var i = 0; i < 3; i++) {
        if (testPrecision(gl, precisions[i])) {
          fabric.webGlPrecision = precisions[i];
          break;
        }
      }
    }
    this.isSupported = isSupported;
    return isSupported;
  };

  fabric.WebglFilterBackend = WebglFilterBackend;

  /**
   * WebGL filter backend.
   */
  function WebglFilterBackend(options) {
    if (options && options.tileSize) {
      this.tileSize = options.tileSize;
    }
    this.setupGLContext(this.tileSize, this.tileSize);
    this.captureGPUInfo();
  }

  WebglFilterBackend.prototype = /** @lends fabric.WebglFilterBackend.prototype */ {
    tileSize: 2048,

    /**
     * Experimental. This object is a sort of repository of help layers used to avoid
     * of recreating them during frequent filtering. If you are previewing a filter with
     * a slider you problably do not want to create help layers every filter step.
     * in this object there will be appended some canvases, created once, resized sometimes
     * cleared never. Clearing is left to the developer.
     **/
    resources: {},

    /**
     * Setup a WebGL context suitable for filtering, and bind any needed event handlers.
     */
    setupGLContext: function (width, height) {
      this.dispose();
      this.createWebGLCanvas(width, height);
      // eslint-disable-next-line
      this.aPosition = new Float32Array([0, 0, 0, 1, 1, 0, 1, 1]);
      this.chooseFastestCopyGLTo2DMethod(width, height);
    },

    /**
     * Pick a method to copy data from GL context to 2d canvas.  In some browsers using
     * putImageData is faster than drawImage for that specific operation.
     */
    chooseFastestCopyGLTo2DMethod: function (width, height) {
      var canMeasurePerf = typeof window.performance !== 'undefined',
        canUseImageData;
      try {
        new ImageData(1, 1);
        canUseImageData = true;
      } catch (e) {
        canUseImageData = false;
      }
      // eslint-disable-next-line no-undef
      var canUseArrayBuffer = typeof ArrayBuffer !== 'undefined';
      // eslint-disable-next-line no-undef
      var canUseUint8Clamped = typeof Uint8ClampedArray !== 'undefined';

      if (
        !(
          canMeasurePerf &&
          canUseImageData &&
          canUseArrayBuffer &&
          canUseUint8Clamped
        )
      ) {
        return;
      }

      var targetCanvas = fabric.util.createCanvasElement();
      // eslint-disable-next-line no-undef
      var imageBuffer = new ArrayBuffer(width * height * 4);
      if (fabric.forceGLPutImageData) {
        this.imageBuffer = imageBuffer;
        this.copyGLTo2D = copyGLTo2DPutImageData;
        return;
      }
      var testContext = {
        imageBuffer: imageBuffer,
        destinationWidth: width,
        destinationHeight: height,
        targetCanvas: targetCanvas,
      };
      var startTime, drawImageTime, putImageDataTime;
      targetCanvas.width = width;
      targetCanvas.height = height;

      startTime = window.performance.now();
      copyGLTo2DDrawImage.call(testContext, this.gl, testContext);
      drawImageTime = window.performance.now() - startTime;

      startTime = window.performance.now();
      copyGLTo2DPutImageData.call(testContext, this.gl, testContext);
      putImageDataTime = window.performance.now() - startTime;

      if (drawImageTime > putImageDataTime) {
        this.imageBuffer = imageBuffer;
        this.copyGLTo2D = copyGLTo2DPutImageData;
      } else {
        this.copyGLTo2D = copyGLTo2DDrawImage;
      }
    },

    /**
     * Create a canvas element and associated WebGL context and attaches them as
     * class properties to the GLFilterBackend class.
     */
    createWebGLCanvas: function (width, height) {
      var canvas = fabric.util.createCanvasElement();
      canvas.width = width;
      canvas.height = height;
      var glOptions = {
          alpha: true,
          premultipliedAlpha: false,
          depth: false,
          stencil: false,
          antialias: false,
        },
        gl = canvas.getContext('webgl', glOptions);
      if (!gl) {
        gl = canvas.getContext('experimental-webgl', glOptions);
      }
      if (!gl) {
        return;
      }
      gl.clearColor(0, 0, 0, 0);
      // this canvas can fire webglcontextlost and webglcontextrestored
      this.canvas = canvas;
      this.gl = gl;
    },

    /**
     * Attempts to apply the requested filters to the source provided, drawing the filtered output
     * to the provided target canvas.
     *
     * @param {Array} filters The filters to apply.
     * @param {HTMLImageElement|HTMLCanvasElement} source The source to be filtered.
     * @param {Number} width The width of the source input.
     * @param {Number} height The height of the source input.
     * @param {HTMLCanvasElement} targetCanvas The destination for filtered output to be drawn.
     * @param {String|undefined} cacheKey A key used to cache resources related to the source. If
     * omitted, caching will be skipped.
     */
    applyFilters: function (
      filters,
      source,
      width,
      height,
      targetCanvas,
      cacheKey
    ) {
      var gl = this.gl;
      var cachedTexture;
      if (cacheKey) {
        cachedTexture = this.getCachedTexture(cacheKey, source);
      }
      var pipelineState = {
        originalWidth: source.width || source.originalWidth,
        originalHeight: source.height || source.originalHeight,
        sourceWidth: width,
        sourceHeight: height,
        destinationWidth: width,
        destinationHeight: height,
        context: gl,
        sourceTexture: this.createTexture(
          gl,
          width,
          height,
          !cachedTexture && source
        ),
        targetTexture: this.createTexture(gl, width, height),
        originalTexture:
          cachedTexture ||
          this.createTexture(gl, width, height, !cachedTexture && source),
        passes: filters.length,
        webgl: true,
        aPosition: this.aPosition,
        programCache: this.programCache,
        pass: 0,
        filterBackend: this,
        targetCanvas: targetCanvas,
      };
      var tempFbo = gl.createFramebuffer();
      gl.bindFramebuffer(gl.FRAMEBUFFER, tempFbo);
      filters.forEach(function (filter) {
        filter && filter.applyTo(pipelineState);
      });
      resizeCanvasIfNeeded(pipelineState);
      this.copyGLTo2D(gl, pipelineState);
      gl.bindTexture(gl.TEXTURE_2D, null);
      gl.deleteTexture(pipelineState.sourceTexture);
      gl.deleteTexture(pipelineState.targetTexture);
      gl.deleteFramebuffer(tempFbo);
      targetCanvas.getContext('2d').setTransform(1, 0, 0, 1, 0, 0);
      return pipelineState;
    },

    /**
     * Detach event listeners, remove references, and clean up caches.
     */
    dispose: function () {
      if (this.canvas) {
        this.canvas = null;
        this.gl = null;
      }
      this.clearWebGLCaches();
    },

    /**
     * Wipe out WebGL-related caches.
     */
    clearWebGLCaches: function () {
      this.programCache = {};
      this.textureCache = {};
    },

    /**
     * Create a WebGL texture object.
     *
     * Accepts specific dimensions to initialize the textuer to or a source image.
     *
     * @param {WebGLRenderingContext} gl The GL context to use for creating the texture.
     * @param {Number} width The width to initialize the texture at.
     * @param {Number} height The height to initialize the texture.
     * @param {HTMLImageElement|HTMLCanvasElement} textureImageSource A source for the texture data.
     * @returns {WebGLTexture}
     */
    createTexture: function (gl, width, height, textureImageSource) {
      var texture = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      if (textureImageSource) {
        gl.texImage2D(
          gl.TEXTURE_2D,
          0,
          gl.RGBA,
          gl.RGBA,
          gl.UNSIGNED_BYTE,
          textureImageSource
        );
      } else {
        gl.texImage2D(
          gl.TEXTURE_2D,
          0,
          gl.RGBA,
          width,
          height,
          0,
          gl.RGBA,
          gl.UNSIGNED_BYTE,
          null
        );
      }
      return texture;
    },

    /**
     * Can be optionally used to get a texture from the cache array
     *
     * If an existing texture is not found, a new texture is created and cached.
     *
     * @param {String} uniqueId A cache key to use to find an existing texture.
     * @param {HTMLImageElement|HTMLCanvasElement} textureImageSource A source to use to create the
     * texture cache entry if one does not already exist.
     */
    getCachedTexture: function (uniqueId, textureImageSource) {
      if (this.textureCache[uniqueId]) {
        return this.textureCache[uniqueId];
      } else {
        var texture = this.createTexture(
          this.gl,
          textureImageSource.width,
          textureImageSource.height,
          textureImageSource
        );
        this.textureCache[uniqueId] = texture;
        return texture;
      }
    },

    /**
     * Clear out cached resources related to a source image that has been
     * filtered previously.
     *
     * @param {String} cacheKey The cache key provided when the source image was filtered.
     */
    evictCachesForKey: function (cacheKey) {
      if (this.textureCache[cacheKey]) {
        this.gl.deleteTexture(this.textureCache[cacheKey]);
        delete this.textureCache[cacheKey];
      }
    },

    copyGLTo2D: copyGLTo2DDrawImage,

    /**
     * Attempt to extract GPU information strings from a WebGL context.
     *
     * Useful information when debugging or blacklisting specific GPUs.
     *
     * @returns {Object} A GPU info object with renderer and vendor strings.
     */
    captureGPUInfo: function () {
      if (this.gpuInfo) {
        return this.gpuInfo;
      }
      var gl = this.gl,
        gpuInfo = { renderer: '', vendor: '' };
      if (!gl) {
        return gpuInfo;
      }
      var ext = gl.getExtension('WEBGL_debug_renderer_info');
      if (ext) {
        var renderer = gl.getParameter(ext.UNMASKED_RENDERER_WEBGL);
        var vendor = gl.getParameter(ext.UNMASKED_VENDOR_WEBGL);
        if (renderer) {
          gpuInfo.renderer = renderer.toLowerCase();
        }
        if (vendor) {
          gpuInfo.vendor = vendor.toLowerCase();
        }
      }
      this.gpuInfo = gpuInfo;
      return gpuInfo;
    },
  };
})();

function resizeCanvasIfNeeded(pipelineState) {
  var targetCanvas = pipelineState.targetCanvas,
    width = targetCanvas.width,
    height = targetCanvas.height,
    dWidth = pipelineState.destinationWidth,
    dHeight = pipelineState.destinationHeight;

  if (width !== dWidth || height !== dHeight) {
    targetCanvas.width = dWidth;
    targetCanvas.height = dHeight;
  }
}

/**
 * Copy an input WebGL canvas on to an output 2D canvas.
 *
 * The WebGL canvas is assumed to be upside down, with the top-left pixel of the
 * desired output image appearing in the bottom-left corner of the WebGL canvas.
 *
 * @param {WebGLRenderingContext} sourceContext The WebGL context to copy from.
 * @param {HTMLCanvasElement} targetCanvas The 2D target canvas to copy on to.
 * @param {Object} pipelineState The 2D target canvas to copy on to.
 */
function copyGLTo2DDrawImage(gl, pipelineState) {
  var glCanvas = gl.canvas,
    targetCanvas = pipelineState.targetCanvas,
    ctx = targetCanvas.getContext('2d');
  ctx.translate(0, targetCanvas.height); // move it down again
  ctx.scale(1, -1); // vertical flip
  // where is my image on the big glcanvas?
  var sourceY = glCanvas.height - targetCanvas.height;
  ctx.drawImage(
    glCanvas,
    0,
    sourceY,
    targetCanvas.width,
    targetCanvas.height,
    0,
    0,
    targetCanvas.width,
    targetCanvas.height
  );
}

/**
 * Copy an input WebGL canvas on to an output 2D canvas using 2d canvas' putImageData
 * API. Measurably faster than using ctx.drawImage in Firefox (version 54 on OSX Sierra).
 *
 * @param {WebGLRenderingContext} sourceContext The WebGL context to copy from.
 * @param {HTMLCanvasElement} targetCanvas The 2D target canvas to copy on to.
 * @param {Object} pipelineState The 2D target canvas to copy on to.
 */
function copyGLTo2DPutImageData(gl, pipelineState) {
  var targetCanvas = pipelineState.targetCanvas,
    ctx = targetCanvas.getContext('2d'),
    dWidth = pipelineState.destinationWidth,
    dHeight = pipelineState.destinationHeight,
    numBytes = dWidth * dHeight * 4;

  // eslint-disable-next-line no-undef
  var u8 = new Uint8Array(this.imageBuffer, 0, numBytes);
  // eslint-disable-next-line no-undef
  var u8Clamped = new Uint8ClampedArray(this.imageBuffer, 0, numBytes);

  gl.readPixels(0, 0, dWidth, dHeight, gl.RGBA, gl.UNSIGNED_BYTE, u8);
  var imgData = new ImageData(u8Clamped, dWidth, dHeight);
  ctx.putImageData(imgData, 0, 0);
}
(function initCanvas2dFilterBackend() {
  var noop = function () {};

  fabric.Canvas2dFilterBackend = Canvas2dFilterBackend;

  /**
   * Canvas 2D filter backend.
   */
  function Canvas2dFilterBackend() {}

  Canvas2dFilterBackend.prototype = /** @lends fabric.Canvas2dFilterBackend.prototype */ {
    evictCachesForKey: noop,
    dispose: noop,
    clearWebGLCaches: noop,

    /**
     * Experimental. This object is a sort of repository of help layers used to avoid
     * of recreating them during frequent filtering. If you are previewing a filter with
     * a slider you probably do not want to create help layers every filter step.
     * in this object there will be appended some canvases, created once, resized sometimes
     * cleared never. Clearing is left to the developer.
     **/
    resources: {},

    /**
     * Apply a set of filters against a source image and draw the filtered output
     * to the provided destination canvas.
     *
     * @param {EnhancedFilter} filters The filter to apply.
     * @param {HTMLImageElement|HTMLCanvasElement} sourceElement The source to be filtered.
     * @param {Number} sourceWidth The width of the source input.
     * @param {Number} sourceHeight The height of the source input.
     * @param {HTMLCanvasElement} targetCanvas The destination for filtered output to be drawn.
     */
    applyFilters: function (
      filters,
      sourceElement,
      sourceWidth,
      sourceHeight,
      targetCanvas
    ) {
      var ctx = targetCanvas.getContext('2d');
      ctx.drawImage(sourceElement, 0, 0, sourceWidth, sourceHeight);
      var imageData = ctx.getImageData(0, 0, sourceWidth, sourceHeight);
      var originalImageData = ctx.getImageData(0, 0, sourceWidth, sourceHeight);
      var pipelineState = {
        sourceWidth: sourceWidth,
        sourceHeight: sourceHeight,
        imageData: imageData,
        originalEl: sourceElement,
        originalImageData: originalImageData,
        canvasEl: targetCanvas,
        ctx: ctx,
        filterBackend: this,
      };
      filters.forEach(function (filter) {
        filter.applyTo(pipelineState);
      });
      if (
        pipelineState.imageData.width !== sourceWidth ||
        pipelineState.imageData.height !== sourceHeight
      ) {
        targetCanvas.width = pipelineState.imageData.width;
        targetCanvas.height = pipelineState.imageData.height;
      }
      ctx.putImageData(pipelineState.imageData, 0, 0);
      return pipelineState;
    },
  };
})();
/**
 * @namespace fabric.Image.filters
 * @memberOf fabric.Image
 * @tutorial {@link http://fabricjs.com/fabric-intro-part-2#image_filters}
 * @see {@link http://fabricjs.com/image-filters|ImageFilters demo}
 */
fabric.Image = fabric.Image || {};
fabric.Image.filters = fabric.Image.filters || {};

/**
 * Root filter class from which all filter classes inherit from
 * @class fabric.Image.filters.BaseFilter
 * @memberOf fabric.Image.filters
 */
fabric.Image.filters.BaseFilter = fabric.util.createClass(
  /** @lends fabric.Image.filters.BaseFilter.prototype */ {
    /**
     * Filter type
     * @param {String} type
     * @default
     */
    type: 'BaseFilter',

    /**
     * Array of attributes to send with buffers. do not modify
     * @private
     */

    vertexSource:
      'attribute vec2 aPosition;\n' +
      'varying vec2 vTexCoord;\n' +
      'void main() {\n' +
      'vTexCoord = aPosition;\n' +
      'gl_Position = vec4(aPosition * 2.0 - 1.0, 0.0, 1.0);\n' +
      '}',

    fragmentSource:
      'precision highp float;\n' +
      'varying vec2 vTexCoord;\n' +
      'uniform sampler2D uTexture;\n' +
      'void main() {\n' +
      'gl_FragColor = texture2D(uTexture, vTexCoord);\n' +
      '}',

    /**
     * Constructor
     * @param {Object} [options] Options object
     */
    initialize: function (options) {
      if (options) {
        this.setOptions(options);
      }
    },

    /**
     * Sets filter's properties from options
     * @param {Object} [options] Options object
     */
    setOptions: function (options) {
      for (var prop in options) {
        this[prop] = options[prop];
      }
    },

    /**
     * Compile this filter's shader program.
     *
     * @param {WebGLRenderingContext} gl The GL canvas context to use for shader compilation.
     * @param {String} fragmentSource fragmentShader source for compilation
     * @param {String} vertexSource vertexShader source for compilation
     */
    createProgram: function (gl, fragmentSource, vertexSource) {
      fragmentSource = fragmentSource || this.fragmentSource;
      vertexSource = vertexSource || this.vertexSource;
      if (fabric.webGlPrecision !== 'highp') {
        fragmentSource = fragmentSource.replace(
          /precision highp float/g,
          'precision ' + fabric.webGlPrecision + ' float'
        );
      }
      var vertexShader = gl.createShader(gl.VERTEX_SHADER);
      gl.shaderSource(vertexShader, vertexSource);
      gl.compileShader(vertexShader);
      if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
        throw new Error(
          // eslint-disable-next-line prefer-template
          'Vertex shader compile error for ' +
            this.type +
            ': ' +
            gl.getShaderInfoLog(vertexShader)
        );
      }

      var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
      gl.shaderSource(fragmentShader, fragmentSource);
      gl.compileShader(fragmentShader);
      if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
        throw new Error(
          // eslint-disable-next-line prefer-template
          'Fragment shader compile error for ' +
            this.type +
            ': ' +
            gl.getShaderInfoLog(fragmentShader)
        );
      }

      var program = gl.createProgram();
      gl.attachShader(program, vertexShader);
      gl.attachShader(program, fragmentShader);
      gl.linkProgram(program);
      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        throw new Error(
          `Shader link error for \\"\${this.type}\\" ${gl.getProgramInfoLog(
            program
          )}`
        );
      }

      var attributeLocations = this.getAttributeLocations(gl, program);
      var uniformLocations = this.getUniformLocations(gl, program) || {};
      uniformLocations.uStepW = gl.getUniformLocation(program, 'uStepW');
      uniformLocations.uStepH = gl.getUniformLocation(program, 'uStepH');
      return {
        program: program,
        attributeLocations: attributeLocations,
        uniformLocations: uniformLocations,
      };
    },

    /**
     * Return a map of attribute names to WebGLAttributeLocation objects.
     *
     * @param {WebGLRenderingContext} gl The canvas context used to compile the shader program.
     * @param {WebGLShaderProgram} program The shader program from which to take attribute locations.
     * @returns {Object} A map of attribute names to attribute locations.
     */
    getAttributeLocations: function (gl, program) {
      return {
        aPosition: gl.getAttribLocation(program, 'aPosition'),
      };
    },

    /**
     * Return a map of uniform names to WebGLUniformLocation objects.
     *
     * Intended to be overridden by subclasses.
     *
     * @param {WebGLRenderingContext} gl The canvas context used to compile the shader program.
     * @param {WebGLShaderProgram} program The shader program from which to take uniform locations.
     * @returns {Object} A map of uniform names to uniform locations.
     */
    getUniformLocations: function (/* gl, program */) {
      // in case i do not need any special uniform i need to return an empty object
      return {};
    },

    /**
     * Send attribute data from this filter to its shader program on the GPU.
     *
     * @param {WebGLRenderingContext} gl The canvas context used to compile the shader program.
     * @param {Object} attributeLocations A map of shader attribute names to their locations.
     */
    sendAttributeData: function (gl, attributeLocations, aPositionData) {
      var attributeLocation = attributeLocations.aPosition;
      var buffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
      gl.enableVertexAttribArray(attributeLocation);
      gl.vertexAttribPointer(attributeLocation, 2, gl.FLOAT, false, 0, 0);
      gl.bufferData(gl.ARRAY_BUFFER, aPositionData, gl.STATIC_DRAW);
    },

    _setupFrameBuffer: function (options) {
      var gl = options.context,
        width,
        height;
      if (options.passes > 1) {
        width = options.destinationWidth;
        height = options.destinationHeight;
        if (options.sourceWidth !== width || options.sourceHeight !== height) {
          gl.deleteTexture(options.targetTexture);
          options.targetTexture = options.filterBackend.createTexture(
            gl,
            width,
            height
          );
        }
        gl.framebufferTexture2D(
          gl.FRAMEBUFFER,
          gl.COLOR_ATTACHMENT0,
          gl.TEXTURE_2D,
          options.targetTexture,
          0
        );
      } else {
        // draw last filter on canvas and not to framebuffer.
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        gl.finish();
      }
    },

    _swapTextures: function (options) {
      options.passes--;
      options.pass++;
      var temp = options.targetTexture;
      options.targetTexture = options.sourceTexture;
      options.sourceTexture = temp;
    },

    /**
     * Generic isNeutral implementation for one parameter based filters.
     * Used only in image applyFilters to discard filters that will not have an effect
     * on the image
     * Other filters may need their own verison ( ColorMatrix, HueRotation, gamma, ComposedFilter )
     * @param {Object} options
     **/
    isNeutralState: function (/* options */) {
      var main = this.mainParameter,
        _class = fabric.Image.filters[this.type].prototype;
      if (main) {
        if (Array.isArray(_class[main])) {
          for (var i = _class[main].length; i--; ) {
            if (this[main][i] !== _class[main][i]) {
              return false;
            }
          }
          return true;
        } else {
          return _class[main] === this[main];
        }
      } else {
        return false;
      }
    },

    /**
     * Apply this filter to the input image data provided.
     *
     * Determines whether to use WebGL or Canvas2D based on the options.webgl flag.
     *
     * @param {Object} options
     * @param {Number} options.passes The number of filters remaining to be executed
     * @param {Boolean} options.webgl Whether to use webgl to render the filter.
     * @param {WebGLTexture} options.sourceTexture The texture setup as the source to be filtered.
     * @param {WebGLTexture} options.targetTexture The texture where filtered output should be drawn.
     * @param {WebGLRenderingContext} options.context The GL context used for rendering.
     * @param {Object} options.programCache A map of compiled shader programs, keyed by filter type.
     */
    applyTo: function (options) {
      if (options.webgl) {
        this._setupFrameBuffer(options);
        this.applyToWebGL(options);
        this._swapTextures(options);
      } else {
        this.applyTo2d(options);
      }
    },

    /**
     * Retrieves the cached shader.
     * @param {Object} options
     * @param {WebGLRenderingContext} options.context The GL context used for rendering.
     * @param {Object} options.programCache A map of compiled shader programs, keyed by filter type.
     */
    retrieveShader: function (options) {
      if (!options.programCache.hasOwnProperty(this.type)) {
        options.programCache[this.type] = this.createProgram(options.context);
      }
      return options.programCache[this.type];
    },

    /**
     * Apply this filter using webgl.
     *
     * @param {Object} options
     * @param {Number} options.passes The number of filters remaining to be executed
     * @param {Boolean} options.webgl Whether to use webgl to render the filter.
     * @param {WebGLTexture} options.originalTexture The texture of the original input image.
     * @param {WebGLTexture} options.sourceTexture The texture setup as the source to be filtered.
     * @param {WebGLTexture} options.targetTexture The texture where filtered output should be drawn.
     * @param {WebGLRenderingContext} options.context The GL context used for rendering.
     * @param {Object} options.programCache A map of compiled shader programs, keyed by filter type.
     */
    applyToWebGL: function (options) {
      var gl = options.context;
      var shader = this.retrieveShader(options);
      if (options.pass === 0 && options.originalTexture) {
        gl.bindTexture(gl.TEXTURE_2D, options.originalTexture);
      } else {
        gl.bindTexture(gl.TEXTURE_2D, options.sourceTexture);
      }
      gl.useProgram(shader.program);
      this.sendAttributeData(gl, shader.attributeLocations, options.aPosition);

      gl.uniform1f(shader.uniformLocations.uStepW, 1 / options.sourceWidth);
      gl.uniform1f(shader.uniformLocations.uStepH, 1 / options.sourceHeight);

      this.sendUniformData(gl, shader.uniformLocations);
      gl.viewport(0, 0, options.destinationWidth, options.destinationHeight);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    },

    bindAdditionalTexture: function (gl, texture, textureUnit) {
      gl.activeTexture(textureUnit);
      gl.bindTexture(gl.TEXTURE_2D, texture);
      // reset active texture to 0 as usual
      gl.activeTexture(gl.TEXTURE0);
    },

    unbindAdditionalTexture: function (gl, textureUnit) {
      gl.activeTexture(textureUnit);
      gl.bindTexture(gl.TEXTURE_2D, null);
      gl.activeTexture(gl.TEXTURE0);
    },

    getMainParameter: function () {
      return this[this.mainParameter];
    },

    setMainParameter: function (value) {
      this[this.mainParameter] = value;
    },

    /**
     * Send uniform data from this filter to its shader program on the GPU.
     *
     * Intended to be overridden by subclasses.
     *
     * @param {WebGLRenderingContext} gl The canvas context used to compile the shader program.
     * @param {Object} uniformLocations A map of shader uniform names to their locations.
     */
    sendUniformData: function (/* gl, uniformLocations */) {
      // Intentionally left blank.  Override me in subclasses.
    },

    /**
     * If needed by a 2d filter, this functions can create an helper canvas to be used
     * remember that options.targetCanvas is available for use till end of chain.
     */
    createHelpLayer: function (options) {
      if (!options.helpLayer) {
        var helpLayer = document.createElement('canvas');
        helpLayer.width = options.sourceWidth;
        helpLayer.height = options.sourceHeight;
        options.helpLayer = helpLayer;
      }
    },

    /**
     * Returns object representation of an instance
     * @return {Object} Object representation of an instance
     */
    toObject: function () {
      var object = { type: this.type },
        mainP = this.mainParameter;
      if (mainP) {
        object[mainP] = this[mainP];
      }
      return object;
    },

    /**
     * Returns a JSON representation of an instance
     * @return {Object} JSON
     */
    toJSON: function () {
      // delegate, not alias
      return this.toObject();
    },
  }
);

fabric.Image.filters.BaseFilter.fromObject = function (object, callback) {
  var filter = new fabric.Image.filters[object.type](object);
  callback && callback(filter);
  return filter;
};
(function initColorBlendFilter(global) {
  var fabric = global.fabric,
    filters = fabric.Image.filters,
    createClass = fabric.util.createClass;

  /**
   * Color Blend filter class
   * @class fabric.Image.filter.BlendColor
   * @memberOf fabric.Image.filters
   * @extends fabric.Image.filters.BaseFilter
   * @example
   * var filter = new fabric.Image.filters.BlendColor({
   *  color: '#000',
   *  mode: 'multiply'
   * });
   *
   * var filter = new fabric.Image.filters.BlendImage({
   *  image: fabricImageObject,
   *  mode: 'multiply',
   *  alpha: 0.5
   * });
   * object.filters.push(filter);
   * object.applyFilters();
   * canvas.renderAll();
   */

  filters.BlendColor = createClass(
    filters.BaseFilter,
    /** @lends fabric.Image.filters.Blend.prototype */ {
      type: 'BlendColor',

      /**
       * Color to make the blend operation with. default to a reddish color since black or white
       * gives always strong result.
       **/
      color: '#F95C63',

      /**
       * Blend mode for the filter: one of multiply, add, diff, screen, subtract,
       * darken, lighten, overlay, exclusion, tint.
       **/
      mode: 'multiply',

      /**
       * alpha value. represent the strength of the blend color operation.
       **/
      alpha: 1,

      /**
       * Fragment source for the Multiply program
       */
      fragmentSource: {
        multiply: 'gl_FragColor.rgb *= uColor.rgb;\n',
        screen:
          'gl_FragColor.rgb = 1.0 - (1.0 - gl_FragColor.rgb) * (1.0 - uColor.rgb);\n',
        add: 'gl_FragColor.rgb += uColor.rgb;\n',
        diff: 'gl_FragColor.rgb = abs(gl_FragColor.rgb - uColor.rgb);\n',
        subtract: 'gl_FragColor.rgb -= uColor.rgb;\n',
        lighten: 'gl_FragColor.rgb = max(gl_FragColor.rgb, uColor.rgb);\n',
        darken: 'gl_FragColor.rgb = min(gl_FragColor.rgb, uColor.rgb);\n',
        exclusion:
          'gl_FragColor.rgb += uColor.rgb - 2.0 * (uColor.rgb * gl_FragColor.rgb);\n',
        overlay:
          'if (uColor.r < 0.5) {\n' +
          'gl_FragColor.r *= 2.0 * uColor.r;\n' +
          '} else {\n' +
          'gl_FragColor.r = 1.0 - 2.0 * (1.0 - gl_FragColor.r) * (1.0 - uColor.r);\n' +
          '}\n' +
          'if (uColor.g < 0.5) {\n' +
          'gl_FragColor.g *= 2.0 * uColor.g;\n' +
          '} else {\n' +
          'gl_FragColor.g = 1.0 - 2.0 * (1.0 - gl_FragColor.g) * (1.0 - uColor.g);\n' +
          '}\n' +
          'if (uColor.b < 0.5) {\n' +
          'gl_FragColor.b *= 2.0 * uColor.b;\n' +
          '} else {\n' +
          'gl_FragColor.b = 1.0 - 2.0 * (1.0 - gl_FragColor.b) * (1.0 - uColor.b);\n' +
          '}\n',
        tint:
          'gl_FragColor.rgb *= (1.0 - uColor.a);\n' +
          'gl_FragColor.rgb += uColor.rgb;\n',
      },

      /**
       * build the fragment source for the filters, joining the common part with
       * the specific one.
       * @param {String} mode the mode of the filter, a key of this.fragmentSource
       * @return {String} the source to be compiled
       * @private
       */
      buildSource: function (mode) {
        return (
          'precision highp float;\n' +
          'uniform sampler2D uTexture;\n' +
          'uniform vec4 uColor;\n' +
          'varying vec2 vTexCoord;\n' +
          'void main() {\n' +
          'vec4 color = texture2D(uTexture, vTexCoord);\n' +
          'gl_FragColor = color;\n' +
          'if (color.a > 0.0) {\n' +
          this.fragmentSource[mode] +
          '}\n' +
          '}'
        );
      },

      /**
       * Retrieves the cached shader.
       * @param {Object} options
       * @param {WebGLRenderingContext} options.context The GL context used for rendering.
       * @param {Object} options.programCache A map of compiled shader programs, keyed by filter type.
       */
      retrieveShader: function (options) {
        var cacheKey = this.type + '_' + this.mode,
          shaderSource;
        if (!options.programCache.hasOwnProperty(cacheKey)) {
          shaderSource = this.buildSource(this.mode);
          options.programCache[cacheKey] = this.createProgram(
            options.context,
            shaderSource
          );
        }
        return options.programCache[cacheKey];
      },

      /**
       * Apply the Blend operation to a Uint8ClampedArray representing the pixels of an image.
       *
       * @param {Object} options
       * @param {ImageData} options.imageData The Uint8ClampedArray to be filtered.
       */
      applyTo2d: function (options) {
        var imageData = options.imageData,
          data = imageData.data,
          iLen = data.length,
          tr,
          tg,
          tb,
          r,
          g,
          b,
          source,
          alpha1 = 1 - this.alpha;

        source = new fabric.Color(this.color).getSource();
        tr = source[0] * this.alpha;
        tg = source[1] * this.alpha;
        tb = source[2] * this.alpha;

        for (var i = 0; i < iLen; i += 4) {
          r = data[i];
          g = data[i + 1];
          b = data[i + 2];

          switch (this.mode) {
            case 'multiply':
              data[i] = (r * tr) / 255;
              data[i + 1] = (g * tg) / 255;
              data[i + 2] = (b * tb) / 255;
              break;
            case 'screen':
              data[i] = 255 - ((255 - r) * (255 - tr)) / 255;
              data[i + 1] = 255 - ((255 - g) * (255 - tg)) / 255;
              data[i + 2] = 255 - ((255 - b) * (255 - tb)) / 255;
              break;
            case 'add':
              data[i] = r + tr;
              data[i + 1] = g + tg;
              data[i + 2] = b + tb;
              break;
            case 'diff':
            case 'difference':
              data[i] = Math.abs(r - tr);
              data[i + 1] = Math.abs(g - tg);
              data[i + 2] = Math.abs(b - tb);
              break;
            case 'subtract':
              data[i] = r - tr;
              data[i + 1] = g - tg;
              data[i + 2] = b - tb;
              break;
            case 'darken':
              data[i] = Math.min(r, tr);
              data[i + 1] = Math.min(g, tg);
              data[i + 2] = Math.min(b, tb);
              break;
            case 'lighten':
              data[i] = Math.max(r, tr);
              data[i + 1] = Math.max(g, tg);
              data[i + 2] = Math.max(b, tb);
              break;
            case 'overlay':
              data[i] =
                tr < 128
                  ? (2 * r * tr) / 255
                  : 255 - (2 * (255 - r) * (255 - tr)) / 255;
              data[i + 1] =
                tg < 128
                  ? (2 * g * tg) / 255
                  : 255 - (2 * (255 - g) * (255 - tg)) / 255;
              data[i + 2] =
                tb < 128
                  ? (2 * b * tb) / 255
                  : 255 - (2 * (255 - b) * (255 - tb)) / 255;
              break;
            case 'exclusion':
              data[i] = tr + r - (2 * tr * r) / 255;
              data[i + 1] = tg + g - (2 * tg * g) / 255;
              data[i + 2] = tb + b - (2 * tb * b) / 255;
              break;
            case 'tint':
              data[i] = tr + r * alpha1;
              data[i + 1] = tg + g * alpha1;
              data[i + 2] = tb + b * alpha1;
              break;
            default:
              break;
          }
        }
      },

      /**
       * Return WebGL uniform locations for this filter's shader.
       *
       * @param {WebGLRenderingContext} gl The GL canvas context used to compile this filter's shader.
       * @param {WebGLShaderProgram} program This filter's compiled shader program.
       */
      getUniformLocations: function (gl, program) {
        return {
          uColor: gl.getUniformLocation(program, 'uColor'),
        };
      },

      /**
       * Send data from this filter to its shader program's uniforms.
       *
       * @param {WebGLRenderingContext} gl The GL canvas context used to compile this filter's shader.
       * @param {Object} uniformLocations A map of string uniform names to WebGLUniformLocation objects
       */
      sendUniformData: function (gl, uniformLocations) {
        var source = new fabric.Color(this.color).getSource();
        source[0] = (this.alpha * source[0]) / 255;
        source[1] = (this.alpha * source[1]) / 255;
        source[2] = (this.alpha * source[2]) / 255;
        source[3] = this.alpha;
        gl.uniform4fv(uniformLocations.uColor, source);
      },

      /**
       * Returns object representation of an instance
       * @return {Object} Object representation of an instance
       */
      toObject: function () {
        return {
          type: this.type,
          color: this.color,
          mode: this.mode,
          alpha: this.alpha,
        };
      },
    }
  );

  /**
   * Returns filter instance from an object representation
   * @static
   * @param {Object} object Object to create an instance from
   * @param {function} [callback] to be invoked after filter creation
   * @return {fabric.Image.filters.BlendColor} Instance of fabric.Image.filters.BlendColor
   */
  fabric.Image.filters.BlendColor.fromObject =
    fabric.Image.filters.BaseFilter.fromObject;
})(typeof exports !== 'undefined' ? exports : this);
(function initImageBlendFilter(global) {
  var fabric = global.fabric,
    filters = fabric.Image.filters,
    createClass = fabric.util.createClass;

  /**
   * Image Blend filter class
   * @class fabric.Image.filter.BlendImage
   * @memberOf fabric.Image.filters
   * @extends fabric.Image.filters.BaseFilter
   * @example
   * var filter = new fabric.Image.filters.BlendColor({
   *  color: '#000',
   *  mode: 'multiply'
   * });
   *
   * var filter = new fabric.Image.filters.BlendImage({
   *  image: fabricImageObject,
   *  mode: 'multiply',
   *  alpha: 0.5
   * });
   * object.filters.push(filter);
   * object.applyFilters();
   * canvas.renderAll();
   */

  filters.BlendImage = createClass(
    filters.BaseFilter,
    /** @lends fabric.Image.filters.BlendImage.prototype */ {
      type: 'BlendImage',

      /**
       * Color to make the blend operation with. default to a reddish color since black or white
       * gives always strong result.
       **/
      image: null,

      /**
       * Blend mode for the filter: one of multiply, add, diff, screen, subtract,
       * darken, lighten, overlay, exclusion, tint.
       **/
      mode: 'multiply',

      /**
       * alpha value. represent the strength of the blend image operation.
       * not implemented.
       **/
      alpha: 1,

      vertexSource:
        'attribute vec2 aPosition;\n' +
        'varying vec2 vTexCoord;\n' +
        'varying vec2 vTexCoord2;\n' +
        'uniform mat3 uTransformMatrix;\n' +
        'void main() {\n' +
        'vTexCoord = aPosition;\n' +
        'vTexCoord2 = (uTransformMatrix * vec3(aPosition, 1.0)).xy;\n' +
        'gl_Position = vec4(aPosition * 2.0 - 1.0, 0.0, 1.0);\n' +
        '}',

      /**
       * Fragment source for the Multiply program
       */
      fragmentSource: {
        multiply:
          'precision highp float;\n' +
          'uniform sampler2D uTexture;\n' +
          'uniform sampler2D uImage;\n' +
          'uniform vec4 uColor;\n' +
          'varying vec2 vTexCoord;\n' +
          'varying vec2 vTexCoord2;\n' +
          'void main() {\n' +
          'vec4 color = texture2D(uTexture, vTexCoord);\n' +
          'vec4 color2 = texture2D(uImage, vTexCoord2);\n' +
          'color.rgba *= color2.rgba;\n' +
          'gl_FragColor = color;\n' +
          '}',
        mask:
          'precision highp float;\n' +
          'uniform sampler2D uTexture;\n' +
          'uniform sampler2D uImage;\n' +
          'uniform vec4 uColor;\n' +
          'varying vec2 vTexCoord;\n' +
          'varying vec2 vTexCoord2;\n' +
          'void main() {\n' +
          'vec4 color = texture2D(uTexture, vTexCoord);\n' +
          'vec4 color2 = texture2D(uImage, vTexCoord2);\n' +
          'color.a = color2.a;\n' +
          'gl_FragColor = color;\n' +
          '}',
      },

      /**
       * Retrieves the cached shader.
       * @param {Object} options
       * @param {WebGLRenderingContext} options.context The GL context used for rendering.
       * @param {Object} options.programCache A map of compiled shader programs, keyed by filter type.
       */
      retrieveShader: function (options) {
        var cacheKey = this.type + '_' + this.mode;
        var shaderSource = this.fragmentSource[this.mode];
        if (!options.programCache.hasOwnProperty(cacheKey)) {
          options.programCache[cacheKey] = this.createProgram(
            options.context,
            shaderSource
          );
        }
        return options.programCache[cacheKey];
      },

      applyToWebGL: function (options) {
        // load texture to blend.
        var gl = options.context,
          texture = this.createTexture(options.filterBackend, this.image);
        this.bindAdditionalTexture(gl, texture, gl.TEXTURE1);
        this.callSuper('applyToWebGL', options);
        this.unbindAdditionalTexture(gl, gl.TEXTURE1);
      },

      createTexture: function (backend, image) {
        return backend.getCachedTexture(image.cacheKey, image._element);
      },

      /**
       * Calculate a transformMatrix to adapt the image to blend over
       * @param {Object} options
       * @param {WebGLRenderingContext} options.context The GL context used for rendering.
       * @param {Object} options.programCache A map of compiled shader programs, keyed by filter type.
       */
      calculateMatrix: function () {
        var image = this.image,
          width = image._element.width,
          height = image._element.height;
        return [
          1 / image.scaleX,
          0,
          0,
          0,
          1 / image.scaleY,
          0,
          -image.left / width,
          -image.top / height,
          1,
        ];
      },

      /**
       * Apply the Blend operation to a Uint8ClampedArray representing the pixels of an image.
       *
       * @param {Object} options
       * @param {ImageData} options.imageData The Uint8ClampedArray to be filtered.
       */
      applyTo2d: function (options) {
        var imageData = options.imageData,
          resources = options.filterBackend.resources,
          data = imageData.data,
          iLen = data.length,
          width = imageData.width,
          height = imageData.height,
          tr,
          tg,
          tb,
          ta,
          r,
          g,
          b,
          a,
          canvas1,
          context,
          image = this.image,
          blendData;

        if (!resources.blendImage) {
          resources.blendImage = fabric.util.createCanvasElement();
        }
        canvas1 = resources.blendImage;
        context = canvas1.getContext('2d');
        if (canvas1.width !== width || canvas1.height !== height) {
          canvas1.width = width;
          canvas1.height = height;
        } else {
          context.clearRect(0, 0, width, height);
        }
        context.setTransform(
          image.scaleX,
          0,
          0,
          image.scaleY,
          image.left,
          image.top
        );
        context.drawImage(image._element, 0, 0, width, height);
        blendData = context.getImageData(0, 0, width, height).data;
        for (var i = 0; i < iLen; i += 4) {
          r = data[i];
          g = data[i + 1];
          b = data[i + 2];
          a = data[i + 3];

          tr = blendData[i];
          tg = blendData[i + 1];
          tb = blendData[i + 2];
          ta = blendData[i + 3];

          switch (this.mode) {
            case 'multiply':
              data[i] = (r * tr) / 255;
              data[i + 1] = (g * tg) / 255;
              data[i + 2] = (b * tb) / 255;
              data[i + 3] = (a * ta) / 255;
              break;
            case 'mask':
              data[i + 3] = ta;
              break;
            default:
              break;
          }
        }
      },

      /**
       * Return WebGL uniform locations for this filter's shader.
       *
       * @param {WebGLRenderingContext} gl The GL canvas context used to compile this filter's shader.
       * @param {WebGLShaderProgram} program This filter's compiled shader program.
       */
      getUniformLocations: function (gl, program) {
        return {
          uTransformMatrix: gl.getUniformLocation(program, 'uTransformMatrix'),
          uImage: gl.getUniformLocation(program, 'uImage'),
        };
      },

      /**
       * Send data from this filter to its shader program's uniforms.
       *
       * @param {WebGLRenderingContext} gl The GL canvas context used to compile this filter's shader.
       * @param {Object} uniformLocations A map of string uniform names to WebGLUniformLocation objects
       */
      sendUniformData: function (gl, uniformLocations) {
        var matrix = this.calculateMatrix();
        gl.uniform1i(uniformLocations.uImage, 1); // texture unit 1.
        gl.uniformMatrix3fv(uniformLocations.uTransformMatrix, false, matrix);
      },

      /**
       * Returns object representation of an instance
       * @return {Object} Object representation of an instance
       */
      toObject: function () {
        return {
          type: this.type,
          image: this.image && this.image.toObject(),
          mode: this.mode,
          alpha: this.alpha,
        };
      },
    }
  );

  /**
   * Returns filter instance from an object representation
   * @static
   * @param {Object} object Object to create an instance from
   * @param {function} callback to be invoked after filter creation
   * @return {fabric.Image.filters.BlendImage} Instance of fabric.Image.filters.BlendImage
   */
  fabric.Image.filters.BlendImage.fromObject = function (object, callback) {
    fabric.Image.fromObject(object.image, function (image) {
      var options = fabric.util.object.clone(object);
      options.image = image;
      callback(new fabric.Image.filters.BlendImage(options));
    });
  };
})(typeof exports !== 'undefined' ? exports : this);
(function initResizeImageFilter(global) {
  var fabric = global.fabric || (global.fabric = {}),
    pow = Math.pow,
    floor = Math.floor,
    sqrt = Math.sqrt,
    abs = Math.abs,
    round = Math.round,
    sin = Math.sin,
    ceil = Math.ceil,
    filters = fabric.Image.filters,
    createClass = fabric.util.createClass;

  /**
   * Resize image filter class
   * @class fabric.Image.filters.Resize
   * @memberOf fabric.Image.filters
   * @extends fabric.Image.filters.BaseFilter
   * @see {@link http://fabricjs.com/image-filters|ImageFilters demo}
   * @example
   * var filter = new fabric.Image.filters.Resize();
   * object.filters.push(filter);
   * object.applyFilters(canvas.renderAll.bind(canvas));
   */
  filters.Resize = createClass(
    filters.BaseFilter,
    /** @lends fabric.Image.filters.Resize.prototype */ {
      /**
       * Filter type
       * @param {String} type
       * @default
       */
      type: 'Resize',

      /**
       * Resize type
       * for webgl resizeType is just lanczos, for canvas2d can be:
       * bilinear, hermite, sliceHack, lanczos.
       * @param {String} resizeType
       * @default
       */
      resizeType: 'hermite',

      /**
       * Scale factor for resizing, x axis
       * @param {Number} scaleX
       * @default
       */
      scaleX: 1,

      /**
       * Scale factor for resizing, y axis
       * @param {Number} scaleY
       * @default
       */
      scaleY: 1,

      /**
       * LanczosLobes parameter for lanczos filter, valid for resizeType lanczos
       * @param {Number} lanczosLobes
       * @default
       */
      lanczosLobes: 3,

      /**
       * Return WebGL uniform locations for this filter's shader.
       *
       * @param {WebGLRenderingContext} gl The GL canvas context used to compile this filter's shader.
       * @param {WebGLShaderProgram} program This filter's compiled shader program.
       */
      getUniformLocations: function (gl, program) {
        return {
          uDelta: gl.getUniformLocation(program, 'uDelta'),
          uTaps: gl.getUniformLocation(program, 'uTaps'),
        };
      },

      /**
       * Send data from this filter to its shader program's uniforms.
       *
       * @param {WebGLRenderingContext} gl The GL canvas context used to compile this filter's shader.
       * @param {Object} uniformLocations A map of string uniform names to WebGLUniformLocation objects
       */
      sendUniformData: function (gl, uniformLocations) {
        gl.uniform2fv(
          uniformLocations.uDelta,
          this.horizontal ? [1 / this.width, 0] : [0, 1 / this.height]
        );
        gl.uniform1fv(uniformLocations.uTaps, this.taps);
      },

      /**
       * Retrieves the cached shader.
       * @param {Object} options
       * @param {WebGLRenderingContext} options.context The GL context used for rendering.
       * @param {Object} options.programCache A map of compiled shader programs, keyed by filter type.
       */
      retrieveShader: function (options) {
        var filterWindow = this.getFilterWindow(),
          cacheKey = this.type + '_' + filterWindow;
        if (!options.programCache.hasOwnProperty(cacheKey)) {
          var fragmentShader = this.generateShader(filterWindow);
          options.programCache[cacheKey] = this.createProgram(
            options.context,
            fragmentShader
          );
        }
        return options.programCache[cacheKey];
      },

      getFilterWindow: function () {
        var scale = this.tempScale;
        return Math.ceil(this.lanczosLobes / scale);
      },

      getTaps: function () {
        var lobeFunction = this.lanczosCreate(this.lanczosLobes),
          scale = this.tempScale,
          filterWindow = this.getFilterWindow(),
          taps = new Array(filterWindow);
        for (var i = 1; i <= filterWindow; i++) {
          taps[i - 1] = lobeFunction(i * scale);
        }
        return taps;
      },

      /**
       * Generate vertex and shader sources from the necessary steps numbers
       * @param {Number} filterWindow
       */
      generateShader: function (filterWindow) {
        var offsets = new Array(filterWindow),
          fragmentShader = this.fragmentSourceTOP;
        // filterWindow;

        for (var i = 1; i <= filterWindow; i++) {
          offsets[i - 1] = i + '.0 * uDelta';
        }

        fragmentShader += 'uniform float uTaps[' + filterWindow + '];\n';
        fragmentShader += 'void main() {\n';
        fragmentShader += '  vec4 color = texture2D(uTexture, vTexCoord);\n';
        fragmentShader += '  float sum = 1.0;\n';

        offsets.forEach(function (offset, i) {
          fragmentShader +=
            '  color += texture2D(uTexture, vTexCoord + ' +
            offset +
            ') * uTaps[' +
            i +
            '];\n';
          fragmentShader +=
            '  color += texture2D(uTexture, vTexCoord - ' +
            offset +
            ') * uTaps[' +
            i +
            '];\n';
          fragmentShader += '  sum += 2.0 * uTaps[' + i + '];\n';
        });
        fragmentShader += '  gl_FragColor = color / sum;\n';
        fragmentShader += '}';
        return fragmentShader;
      },

      fragmentSourceTOP:
        'precision highp float;\n' +
        'uniform sampler2D uTexture;\n' +
        'uniform vec2 uDelta;\n' +
        'varying vec2 vTexCoord;\n',

      /**
       * Apply the resize filter to the image
       * Determines whether to use WebGL or Canvas2D based on the options.webgl flag.
       *
       * @param {Object} options
       * @param {Number} options.passes The number of filters remaining to be executed
       * @param {Boolean} options.webgl Whether to use webgl to render the filter.
       * @param {WebGLTexture} options.sourceTexture The texture setup as the source to be filtered.
       * @param {WebGLTexture} options.targetTexture The texture where filtered output should be drawn.
       * @param {WebGLRenderingContext} options.context The GL context used for rendering.
       * @param {Object} options.programCache A map of compiled shader programs, keyed by filter type.
       */
      applyTo: function (options) {
        if (options.webgl) {
          options.passes++;
          this.width = options.sourceWidth;
          this.horizontal = true;
          this.dW = Math.round(this.width * this.scaleX);
          this.dH = options.sourceHeight;
          this.tempScale = this.dW / this.width;
          this.taps = this.getTaps();
          options.destinationWidth = this.dW;
          this._setupFrameBuffer(options);
          this.applyToWebGL(options);
          this._swapTextures(options);
          options.sourceWidth = options.destinationWidth;

          this.height = options.sourceHeight;
          this.horizontal = false;
          this.dH = Math.round(this.height * this.scaleY);
          this.tempScale = this.dH / this.height;
          this.taps = this.getTaps();
          options.destinationHeight = this.dH;
          this._setupFrameBuffer(options);
          this.applyToWebGL(options);
          this._swapTextures(options);
          options.sourceHeight = options.destinationHeight;
        } else {
          this.applyTo2d(options);
        }
      },

      isNeutralState: function () {
        return this.scaleX === 1 && this.scaleY === 1;
      },

      lanczosCreate: function (lobes) {
        return function (x) {
          if (x >= lobes || x <= -lobes) {
            return 0.0;
          }
          if (x < 1.1920929e-7 && x > -1.1920929e-7) {
            return 1.0;
          }
          x *= Math.PI;
          var xx = x / lobes;
          return ((sin(x) / x) * sin(xx)) / xx;
        };
      },

      /**
       * Applies filter to canvas element
       * @memberOf fabric.Image.filters.Resize.prototype
       * @param {Object} canvasEl Canvas element to apply filter to
       * @param {Number} scaleX
       * @param {Number} scaleY
       */
      applyTo2d: function (options) {
        var imageData = options.imageData,
          scaleX = this.scaleX,
          scaleY = this.scaleY;

        this.rcpScaleX = 1 / scaleX;
        this.rcpScaleY = 1 / scaleY;

        var oW = imageData.width,
          oH = imageData.height,
          dW = round(oW * scaleX),
          dH = round(oH * scaleY),
          newData;

        if (this.resizeType === 'sliceHack') {
          newData = this.sliceByTwo(options, oW, oH, dW, dH);
        } else if (this.resizeType === 'hermite') {
          newData = this.hermiteFastResize(options, oW, oH, dW, dH);
        } else if (this.resizeType === 'bilinear') {
          newData = this.bilinearFiltering(options, oW, oH, dW, dH);
        } else if (this.resizeType === 'lanczos') {
          newData = this.lanczosResize(options, oW, oH, dW, dH);
        }
        options.imageData = newData;
      },

      /**
       * Filter sliceByTwo
       * @param {Object} canvasEl Canvas element to apply filter to
       * @param {Number} oW Original Width
       * @param {Number} oH Original Height
       * @param {Number} dW Destination Width
       * @param {Number} dH Destination Height
       * @returns {ImageData}
       */
      sliceByTwo: function (options, oW, oH, dW, dH) {
        var imageData = options.imageData,
          mult = 0.5,
          doneW = false,
          doneH = false,
          stepW = oW * mult,
          stepH = oH * mult,
          resources = fabric.filterBackend.resources,
          tmpCanvas,
          ctx,
          sX = 0,
          sY = 0,
          dX = oW,
          dY = 0;
        if (!resources.sliceByTwo) {
          resources.sliceByTwo = document.createElement('canvas');
        }
        tmpCanvas = resources.sliceByTwo;
        if (tmpCanvas.width < oW * 1.5 || tmpCanvas.height < oH) {
          tmpCanvas.width = oW * 1.5;
          tmpCanvas.height = oH;
        }
        ctx = tmpCanvas.getContext('2d');
        ctx.clearRect(0, 0, oW * 1.5, oH);
        ctx.putImageData(imageData, 0, 0);

        dW = floor(dW);
        dH = floor(dH);

        while (!doneW || !doneH) {
          oW = stepW;
          oH = stepH;
          if (dW < floor(stepW * mult)) {
            stepW = floor(stepW * mult);
          } else {
            stepW = dW;
            doneW = true;
          }
          if (dH < floor(stepH * mult)) {
            stepH = floor(stepH * mult);
          } else {
            stepH = dH;
            doneH = true;
          }
          ctx.drawImage(tmpCanvas, sX, sY, oW, oH, dX, dY, stepW, stepH);
          sX = dX;
          sY = dY;
          dY += stepH;
        }
        return ctx.getImageData(sX, sY, dW, dH);
      },

      /**
       * Filter lanczosResize
       * @param {Object} canvasEl Canvas element to apply filter to
       * @param {Number} oW Original Width
       * @param {Number} oH Original Height
       * @param {Number} dW Destination Width
       * @param {Number} dH Destination Height
       * @returns {ImageData}
       */
      lanczosResize: function (options, oW, oH, dW, dH) {
        function process(u) {
          var v, i, weight, idx, a, red, green, blue, alpha, fX, fY;
          center.x = (u + 0.5) * ratioX;
          icenter.x = floor(center.x);
          for (v = 0; v < dH; v++) {
            center.y = (v + 0.5) * ratioY;
            icenter.y = floor(center.y);
            a = 0;
            red = 0;
            green = 0;
            blue = 0;
            alpha = 0;
            for (i = icenter.x - range2X; i <= icenter.x + range2X; i++) {
              if (i < 0 || i >= oW) {
                continue;
              }
              fX = floor(1000 * abs(i - center.x));
              if (!cacheLanc[fX]) {
                cacheLanc[fX] = {};
              }
              for (var j = icenter.y - range2Y; j <= icenter.y + range2Y; j++) {
                if (j < 0 || j >= oH) {
                  continue;
                }
                fY = floor(1000 * abs(j - center.y));
                if (!cacheLanc[fX][fY]) {
                  cacheLanc[fX][fY] = lanczos(
                    sqrt(pow(fX * rcpRatioX, 2) + pow(fY * rcpRatioY, 2)) / 1000
                  );
                }
                weight = cacheLanc[fX][fY];
                if (weight > 0) {
                  idx = (j * oW + i) * 4;
                  a += weight;
                  red += weight * srcData[idx];
                  green += weight * srcData[idx + 1];
                  blue += weight * srcData[idx + 2];
                  alpha += weight * srcData[idx + 3];
                }
              }
            }
            idx = (v * dW + u) * 4;
            destData[idx] = red / a;
            destData[idx + 1] = green / a;
            destData[idx + 2] = blue / a;
            destData[idx + 3] = alpha / a;
          }

          if (++u < dW) {
            return process(u);
          } else {
            return destImg;
          }
        }

        var srcData = options.imageData.data,
          destImg = options.ctx.createImageData(dW, dH),
          destData = destImg.data,
          lanczos = this.lanczosCreate(this.lanczosLobes),
          ratioX = this.rcpScaleX,
          ratioY = this.rcpScaleY,
          rcpRatioX = 2 / this.rcpScaleX,
          rcpRatioY = 2 / this.rcpScaleY,
          range2X = ceil((ratioX * this.lanczosLobes) / 2),
          range2Y = ceil((ratioY * this.lanczosLobes) / 2),
          cacheLanc = {},
          center = {},
          icenter = {};

        return process(0);
      },

      /**
       * bilinearFiltering
       * @param {Object} canvasEl Canvas element to apply filter to
       * @param {Number} oW Original Width
       * @param {Number} oH Original Height
       * @param {Number} dW Destination Width
       * @param {Number} dH Destination Height
       * @returns {ImageData}
       */
      bilinearFiltering: function (options, oW, oH, dW, dH) {
        var a,
          b,
          c,
          d,
          x,
          y,
          i,
          j,
          xDiff,
          yDiff,
          chnl,
          color,
          offset = 0,
          origPix,
          ratioX = this.rcpScaleX,
          ratioY = this.rcpScaleY,
          w4 = 4 * (oW - 1),
          img = options.imageData,
          pixels = img.data,
          destImage = options.ctx.createImageData(dW, dH),
          destPixels = destImage.data;
        for (i = 0; i < dH; i++) {
          for (j = 0; j < dW; j++) {
            x = floor(ratioX * j);
            y = floor(ratioY * i);
            xDiff = ratioX * j - x;
            yDiff = ratioY * i - y;
            origPix = 4 * (y * oW + x);

            for (chnl = 0; chnl < 4; chnl++) {
              a = pixels[origPix + chnl];
              b = pixels[origPix + 4 + chnl];
              c = pixels[origPix + w4 + chnl];
              d = pixels[origPix + w4 + 4 + chnl];
              color =
                a * (1 - xDiff) * (1 - yDiff) +
                b * xDiff * (1 - yDiff) +
                c * yDiff * (1 - xDiff) +
                d * xDiff * yDiff;
              destPixels[offset++] = color;
            }
          }
        }
        return destImage;
      },

      /**
       * hermiteFastResize
       * @param {Object} canvasEl Canvas element to apply filter to
       * @param {Number} oW Original Width
       * @param {Number} oH Original Height
       * @param {Number} dW Destination Width
       * @param {Number} dH Destination Height
       * @returns {ImageData}
       */
      hermiteFastResize: function (options, oW, oH, dW, dH) {
        var ratioW = this.rcpScaleX,
          ratioH = this.rcpScaleY,
          ratioWHalf = ceil(ratioW / 2),
          ratioHHalf = ceil(ratioH / 2),
          img = options.imageData,
          data = img.data,
          img2 = options.ctx.createImageData(dW, dH),
          data2 = img2.data;
        for (var j = 0; j < dH; j++) {
          for (var i = 0; i < dW; i++) {
            var x2 = (i + j * dW) * 4,
              weight = 0,
              weights = 0,
              weightsAlpha = 0,
              gxR = 0,
              gxG = 0,
              gxB = 0,
              gxA = 0,
              centerY = (j + 0.5) * ratioH;
            for (var yy = floor(j * ratioH); yy < (j + 1) * ratioH; yy++) {
              var dy = abs(centerY - (yy + 0.5)) / ratioHHalf,
                centerX = (i + 0.5) * ratioW,
                w0 = dy * dy;
              for (var xx = floor(i * ratioW); xx < (i + 1) * ratioW; xx++) {
                var dx = abs(centerX - (xx + 0.5)) / ratioWHalf,
                  w = sqrt(w0 + dx * dx);
                /* eslint-disable max-depth */
                if (w > 1 && w < -1) {
                  continue;
                }
                //hermite filter
                weight = 2 * w * w * w - 3 * w * w + 1;
                if (weight > 0) {
                  dx = 4 * (xx + yy * oW);
                  //alpha
                  gxA += weight * data[dx + 3];
                  weightsAlpha += weight;
                  //colors
                  if (data[dx + 3] < 255) {
                    weight = (weight * data[dx + 3]) / 250;
                  }
                  gxR += weight * data[dx];
                  gxG += weight * data[dx + 1];
                  gxB += weight * data[dx + 2];
                  weights += weight;
                }
                /* eslint-enable max-depth */
              }
            }
            data2[x2] = gxR / weights;
            data2[x2 + 1] = gxG / weights;
            data2[x2 + 2] = gxB / weights;
            data2[x2 + 3] = gxA / weightsAlpha;
          }
        }
        return img2;
      },

      /**
       * Returns object representation of an instance
       * @return {Object} Object representation of an instance
       */
      toObject: function () {
        return {
          type: this.type,
          scaleX: this.scaleX,
          scaleY: this.scaleY,
          resizeType: this.resizeType,
          lanczosLobes: this.lanczosLobes,
        };
      },
    }
  );

  /**
   * Returns filter instance from an object representation
   * @static
   * @param {Object} object Object to create an instance from
   * @param {Function} [callback] to be invoked after filter creation
   * @return {fabric.Image.filters.Resize} Instance of fabric.Image.filters.Resize
   */
  fabric.Image.filters.Resize.fromObject =
    fabric.Image.filters.BaseFilter.fromObject;
})(typeof exports !== 'undefined' ? exports : this);
