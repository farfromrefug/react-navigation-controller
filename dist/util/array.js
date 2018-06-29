"use strict";
/*!
 * Adapted from LoDash
 *
 * https://lodash.com/
 *
 * Copyright 2012-2015 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js, copyright 2009-2015 Jeremy Ashkenas,
 * DocumentCloud and Investigative Reporters & Editors <http://underscorejs.org/>

 * Permission is hereby granted, free of charge, to any person obtaining
 * a copy of this software and associated documentation files (the
 * "Software"), to deal in the Software without restriction, including
 * without limitation the rights to use, copy, modify, merge, publish,
 * distribute, sublicense, and/or sell copies of the Software, and to
 * permit persons to whom the Software is furnished to do so, subject to
 * the following conditions:
 */
Object.defineProperty(exports, "__esModule", { value: true });
function dropRight(array, n = 1) {
    const length = array ? array.length : 0;
    if (!length) {
        return [];
    }
    n = length - (+n || 0);
    return array.slice(0, n < 0 ? 0 : n);
}
exports.dropRight = dropRight;
function last(array) {
    const length = array ? array.length : 0;
    return length ? array[length - 1] : undefined;
}
exports.last = last;
function takeRight(array, n = 1) {
    var length = array ? array.length : 0;
    if (!length) {
        return [];
    }
    n = length - (+n || 0);
    return array.slice(n < 0 ? 0 : n);
}
exports.takeRight = takeRight;
