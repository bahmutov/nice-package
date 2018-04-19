import is from 'check-more-types'
import la from 'lazy-ass'
import Debug from 'debug'

const debug = Debug('@bahmutov/nice-package')

// TODO use Ramda functions

/**
 * Converts a given function into a unary function.
 *
 * @export
{Function} fn
 * @returns Function that only accepts single argument and calls original function
 */
export function unary (fn: Function) {
  la(is.fn(fn), 'unary expects a function', fn)

  return function (first: any) {
    return fn(first)
  }
}

export function find (array: any[], cb: Function) {
  la(Array.isArray(array), 'expected array')
  la(is.fn(cb), 'expected callback')

  var found
  array.some(function (item) {
    if (cb(item)) {
      found = item
      return true
    }
    return false
  })
  return found
}

export type OptionsToCheck = {
  [key: string]: any
}

export type Package = {
  [key: string]: any
}

// TODO: document this function
export function checkProperties (
  options: OptionsToCheck,
  pkg: Package,
  onError: Function = console.error
) {
  const every = Object.keys(options).every(function (key) {
    debug('checking property %s', key)

    var property = pkg[key]
    if (!property) {
      onError('package.json is missing', key)
      return false
    }
    if (is.fn(options[key])) {
      if (!options[key](property)) {
        onError('failed check for property', key)
        return false
      }
    }

    return true
  })

  return every
}
