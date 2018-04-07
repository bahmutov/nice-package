const check = require('check-more-types')

function initValidators () {
  const is = function (type, name, value) {
    if (!check[type](value)) {
      console.error('expected', name, 'to be', type, 'not', value)
      return false
    }
    return true
  }

  const validators = {
    name: is.bind(null, 'string', 'name'),
    version: is.bind(null, 'string', 'version'),
    description: is.bind(null, 'string', 'description'),

    engines: function (value) {
      if (typeof value !== 'object') {
        console.error('need an object for engines property')
        return false
      }
      if (!check.string(value.node)) {
        console.error(
          'engines object missing node record, has ' +
            JSON.stringify(value, null, 2)
        )
        return false
      }
      return true
    },

    keywords: function (values) {
      if (!check.array(values)) {
        console.error('expected keywords to be an Array')
        return false
      }

      return values.every(function (keyword) {
        if (!check.string(keyword)) {
          console.error('every keyword should be a string, found', keyword)
          return false
        }
        return true
      })
    },
    author: function (value) {
      if (!check.object(value) && !check.string(value)) {
        console.error('invalid author value', value)
        return false
      }
      return true
    },
    repository: function (value) {
      if (!check.object(value)) {
        console.error('expected repository to be an object, not', value)
        return false
      }
      if (!check.string(value.type)) {
        console.error(
          'expected repository type to be a string, not',
          value.type
        )
        return false
      }
      if (!check.string(value.url)) {
        console.error('expected repository url to be a string, not', value.url)
        return false
      }
      return true
    }
  }
  return validators
}

module.exports = initValidators
