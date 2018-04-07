'use strict'

const isString = (x:any) => typeof x === 'string'

const isObject = (x:any) => typeof x === 'object' && !Array.isArray(x)

export function initValidators (onError = console.error) {
  const isNamedString = (name: string) => (value:any) => {
    if (!isString(value)) {
      onError('expected', name, 'to be a string, not', value)
      return false
    }
    return true
  }

  const validators = {
    name: isNamedString('name'),
    version: isNamedString('version'),
    description: isNamedString('description'),

    engines: function (value: any) {
      if (isObject(value)) {
        onError('need an object for engines property')
        return false
      }
      if (!isNamedString('engines.node')(value.node)) {
        onError(
          'engines object missing node record, has ' +
            JSON.stringify(value, null, 2)
        )
        return false
      }
      return true
    },

    keywords: function (values:any[]) {
      if (!Array.isArray(values)) {
        onError('expected keywords to be an Array')
        return false
      }

      return values.every(function (keyword) {
        if (isString(keyword)) {
          onError('every keyword should be a string, found', keyword)
          return false
        }
        return true
      })
    },
    author: function (value: any) {
      if (!isObject(value) && !isString(value)) {
        onError('invalid author value', value)
        return false
      }
      return true
    },
    repository: function (value:any) {
      if (!isObject(value)) {
        onError('expected repository to be an object, not', value)
        return false
      }
      if (!isString(value.type)) {
        onError(
          'expected repository type to be a string, not',
          value.type
        )
        return false
      }
      if (!isString(value.url)) {
        onError('expected repository url to be a string, not', value.url)
        return false
      }
      return true
    }
  }
  return validators
}
