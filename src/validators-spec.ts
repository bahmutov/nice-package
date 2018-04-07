import {initValidators} from './validators'
import snapshot from 'snap-shot-it'

describe('validators', () => {
  it('returns list of validators', () => {
    const result = initValidators()
    snapshot('list of properties', Object.keys(result))
  })
})
