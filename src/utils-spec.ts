import { unary } from './utils'
import la from 'lazy-ass'
import is from 'check-more-types'

describe('utils', () => {
  describe('unary', () => {
    function identity (a: any) {
      if (arguments.length !== 1) {
        throw new Error('Passed not 1 argument')
      }
      return a
    }

    it('passes functions with single argument', () => {
      const fn = unary(identity)
      la(is.fn(fn))
      fn(1)
    })
  })
})
