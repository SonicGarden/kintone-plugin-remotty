(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.json2yaml = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
(function () {
  "use strict";

  var typeOf = require('remedial').typeOf
    ;

  function stringify(data) {
    var handlers
      , indentLevel = ''
      ;

    handlers = {
        "undefined": function () {
          // objects will not have `undefined` converted to `null`
          // as this may have unintended consequences
          // For arrays, however, this behavior seems appropriate
          return 'null';
        }
      , "null": function () {
          return 'null';
        }
      , "number": function (x) {
          return x;
        }
      , "boolean": function (x) {
          return x ? 'true' : 'false';
        }
      , "string": function (x) {
          // to avoid the string "true" being confused with the
          // the literal `true`, we always wrap strings in quotes
          return JSON.stringify(x);
        }
      , "array": function (x) {
          var output = ''
            ;

          if (0 === x.length) {
            output += '[]';
            return output;
          }

          indentLevel = indentLevel.replace(/$/, '  ');
          x.forEach(function (y) {
            // TODO how should `undefined` be handled?
            var handler = handlers[typeOf(y)]
              ;

            if (!handler) {
              throw new Error('what the crap: ' + typeOf(y));
            }

            output += '\n' + indentLevel + '- ' + handler(y);
             
          });
          indentLevel = indentLevel.replace(/  /, '');
          
          return output;
        }
      , "object": function (x) {
          var output = ''
            ;

          if (0 === Object.keys(x).length) {
            output += '{}';
            return output;
          }

          indentLevel = indentLevel.replace(/$/, '  ');
          Object.keys(x).forEach(function (k) {
            var val = x[k]
              , handler = handlers[typeOf(val)]
              ;

            if ('undefined' === typeof val) {
              // the user should do
              // delete obj.key
              // and not
              // obj.key = undefined
              // but we'll error on the side of caution
              return;
            }

            if (!handler) {
              throw new Error('what the crap: ' + typeOf(val));
            }

            output += '\n' + indentLevel + k + ': ' + handler(val);
          });
          indentLevel = indentLevel.replace(/  /, '');

          return output;
        }
      , "function": function () {
          // TODO this should throw or otherwise be ignored
          return '[object Function]';
        }
    };

    return '---' + handlers[typeOf(data)](data) + '\n';
  }

  module.exports.stringify = stringify;
}());

},{"remedial":2}],2:[function(require,module,exports){
/*jslint onevar: true, undef: true, nomen: true, eqeqeq: true, plusplus: true, bitwise: true, regexp: true, newcap: true, immed: true */
(function () {
    "use strict";

    var global = Function('return this')()
      , classes = "Boolean Number String Function Array Date RegExp Object".split(" ")
      , i
      , name
      , class2type = {}
      ;

    for (i in classes) {
      if (classes.hasOwnProperty(i)) {
        name = classes[i];
        class2type["[object " + name + "]"] = name.toLowerCase();
      }
    }

    function typeOf(obj) {
      return (null === obj || undefined === obj) ? String(obj) : class2type[Object.prototype.toString.call(obj)] || "object";
    }

    function isEmpty(o) {
        var i, v;
        if (typeOf(o) === 'object') {
            for (i in o) { // fails jslint
                v = o[i];
                if (v !== undefined && typeOf(v) !== 'function') {
                    return false;
                }
            }
        }
        return true;
    }

    if (!String.prototype.entityify) {
        String.prototype.entityify = function () {
            return this.replace(/&/g, "&amp;").replace(/</g,
                "&lt;").replace(/>/g, "&gt;");
        };
    }

    if (!String.prototype.quote) {
        String.prototype.quote = function () {
            var c, i, l = this.length, o = '"';
            for (i = 0; i < l; i += 1) {
                c = this.charAt(i);
                if (c >= ' ') {
                    if (c === '\\' || c === '"') {
                        o += '\\';
                    }
                    o += c;
                } else {
                    switch (c) {
                    case '\b':
                        o += '\\b';
                        break;
                    case '\f':
                        o += '\\f';
                        break;
                    case '\n':
                        o += '\\n';
                        break;
                    case '\r':
                        o += '\\r';
                        break;
                    case '\t':
                        o += '\\t';
                        break;
                    default:
                        c = c.charCodeAt();
                        o += '\\u00' + Math.floor(c / 16).toString(16) +
                            (c % 16).toString(16);
                    }
                }
            }
            return o + '"';
        };
    } 

    if (!String.prototype.supplant) {
        String.prototype.supplant = function (o) {
            return this.replace(/{([^{}]*)}/g,
                function (a, b) {
                    var r = o[b];
                    return typeof r === 'string' || typeof r === 'number' ? r : a;
                }
            );
        };
    }

    if (!String.prototype.trim) {
        String.prototype.trim = function () {
            return this.replace(/^\s*(\S*(?:\s+\S+)*)\s*$/, "$1");
        };
    }

    // CommonJS / npm / Ender.JS
    module.exports = {
        typeOf: typeOf,
        isEmpty: isEmpty
    };
    global.typeOf = global.typeOf || typeOf;
    global.isEmpty = global.isEmpty || isEmpty;
}());

},{}]},{},[1])(1)
});