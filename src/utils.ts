const is = require('check-more-types')
const la = require('lazy-ass')

function unary (fn) {
  la(is.fn(fn), 'unary expects a function')
  return function (first) {
    return fn(first)
  }
}

function find (array, cb) {
  la(is.array(array), 'expected array')
  la(is.fn(cb), 'expected callback')

  var found
  array.some(function (item) {
    if (cb(item)) {
      found = item
      return true
    }
  })
  return found
}

module.exports = {
  unary: unary,
  find: find
}
