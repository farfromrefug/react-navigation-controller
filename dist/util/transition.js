"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var type;
(function (type) {
    type[type["NONE"] = 0] = "NONE";
    type[type["PUSH_LEFT"] = 1] = "PUSH_LEFT";
    type[type["PUSH_RIGHT"] = 2] = "PUSH_RIGHT";
    type[type["PUSH_UP"] = 3] = "PUSH_UP";
    type[type["PUSH_DOWN"] = 4] = "PUSH_DOWN";
    type[type["COVER_LEFT"] = 5] = "COVER_LEFT";
    type[type["COVER_RIGHT"] = 6] = "COVER_RIGHT";
    type[type["COVER_UP"] = 7] = "COVER_UP";
    type[type["COVER_DOWN"] = 8] = "COVER_DOWN";
    type[type["REVEAL_LEFT"] = 9] = "REVEAL_LEFT";
    type[type["REVEAL_RIGHT"] = 10] = "REVEAL_RIGHT";
    type[type["REVEAL_UP"] = 11] = "REVEAL_UP";
    type[type["REVEAL_DOWN"] = 12] = "REVEAL_DOWN";
})(type = exports.type || (exports.type = {}));
function isPush(t) {
    return t === type.PUSH_LEFT ||
        t === type.PUSH_RIGHT ||
        t === type.PUSH_UP ||
        t === type.PUSH_DOWN;
}
exports.isPush = isPush;
function isCover(t) {
    return t === type.COVER_LEFT ||
        t === type.COVER_RIGHT ||
        t === type.COVER_UP ||
        t === type.COVER_DOWN;
}
exports.isCover = isCover;
function isReveal(t) {
    return t === type.REVEAL_LEFT ||
        t === type.REVEAL_RIGHT ||
        t === type.REVEAL_UP ||
        t === type.REVEAL_DOWN;
}
exports.isReveal = isReveal;
