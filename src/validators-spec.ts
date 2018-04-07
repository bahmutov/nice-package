import { initValidators } from './validators'
import { checkProperties } from './utils'
import snapshot from 'snap-shot-it'
import la from 'lazy-ass'
import sinon from 'sinon'

describe('validators', () => {
  const sandbox = sinon.createSandbox()

  afterEach(() => {
    sandbox.restore()
  })

  it('returns list of validators', () => {
    const result = initValidators(console.error)
    snapshot('list of properties', Object.keys(result))
  })

  it('without name', () => {
    const onError = sandbox.spy()
    const fields = initValidators()
    const pkg = {}
    la(!checkProperties(fields, pkg, onError))
    la(onError.calledOnceWith('package.json is missing', 'name'))
  })

  it('without description', () => {
    const onError = sandbox.spy()
    const fields = initValidators()
    const pkg = {
      name: 'foo',
      version: '1.0.0'
    }
    la(!checkProperties(fields, pkg, onError))
    la(onError.calledOnceWith('package.json is missing', 'description'))
  })

  it('with everything', () => {
    const onError = sandbox.spy()
    const fields = initValidators()
    const pkg = {
      name: 'foo',
      description: 'test',
      version: '1.0.0',
      engines: {
        node: '6.0.0'
      },
      keywords: ['test'],
      author: 'gleb',
      repository: {
        type: 'git',
        url: 'https://github.com/bahmutov/nice-package.git'
      }
    }
    la(checkProperties(fields, pkg, onError))
    la(!onError.called)
  })
})
