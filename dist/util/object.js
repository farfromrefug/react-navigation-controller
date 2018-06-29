"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function assign(target, ...sources) {
    if (target == null) {
        throw new TypeError('Object.assign target cannot be null or undefined');
    }
    const to = Object(target);
    const hasOwnProperty = Object.prototype.hasOwnProperty;
    for (var nextIndex = 0; nextIndex < sources.length; nextIndex++) {
        var nextSource = sources[nextIndex];
        if (nextSource == null) {
            continue;
        }
        var from = Object(nextSource);
        for (var key in from) {
            if (hasOwnProperty.call(from, key)) {
                to[key] = from[key];
            }
        }
    }
    return to;
}
exports.assign = assign;
