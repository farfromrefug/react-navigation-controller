/**
 * Merge sources into target
 *
 * @param {object} target
 * @param {arguments} soutces
 * @return {object}
 */
export function assign (target, ...sources) {
  if (target == null) {
    throw new TypeError('Object.assign target cannot be null or undefined')
  }
  const to = Object(target)
  const hasOwnProperty = Object.prototype.hasOwnProperty
  for (var nextIndex = 0; nextIndex < sources.length; nextIndex++) {
    var nextSource = sources[nextIndex]
    if (nextSource == null) {
      continue
    }
    var from = Object(nextSource)
    for (var key in from) {
      if (hasOwnProperty.call(from, key)) {
        to[key] = from[key]
      }
    }
  }
  return to
}
