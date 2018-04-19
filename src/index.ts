'use strict'

import { checkProperties } from './utils'
import Debug from 'debug'
const debug = Debug('@bahmutov/nice-package')

const PJV = require('package-json-validator').PJV
const check = require('check-more-types')
const la = require('lazy-ass')
const fs = require('fs')
const join = require('path').join
const unary = require('./utils').unary
const find = require('./utils').find
const initValidators = require('./validators')
const save = fs.writeFileSync
const load = fs.readFileSync
const glob = require('glob')

var taskName = 'nice-package'
var taskDescription = 'Opinionated package.json validator'

// TODO check if repository in package matches git remote origin +enhancement id:1 gh:11 ic:gh

function warnOnLooseVersion (grunt, name, version) {
  la(check.unemptyString(name), 'missing name', name)
  la(check.unemptyString(version), 'missing version for', name)

  if (/\*|\^|\~/.test(version)) {
    grunt.log.warn('loose version', version, 'for dependency', name)
  }
}

function tightenVersion (version) {
  la(check.unemptyString(version), 'expected version string, got', version)
  return version.replace('^', '').replace('~', '')
}

// removes ~, ^, etc from dependencies versions
function tightenDependenciesVersions (grunt, deps) {
  console.assert(deps, 'missing deps object')
  Object.keys(deps).forEach(function (name) {
    var version = deps[name]
    warnOnLooseVersion(grunt, name, version)
    version = tightenVersion(version)
    deps[name] = version
  })
}

function tightenVersions (grunt, cb) {
  var pkg = grunt.file.readJSON('package.json')
  if (pkg.dependencies) {
    tightenDependenciesVersions(grunt, pkg.dependencies)
  }

  if (pkg.devDependencies) {
    tightenDependenciesVersions(grunt, pkg.devDependencies)
  }

  if (pkg.peerDependencies) {
    tightenDependenciesVersions(grunt, pkg.peerDependencies)
  }

  save('package.json', JSON.stringify(pkg, null, 2), 'utf8')
  cb()
}

function findFixpack () {
  var cwd = process.cwd()
  var choices = [
    join(cwd, 'fixpack/bin/fixpack'),
    join(cwd, 'node_modules/fixpack/bin/fixpack'),
    join(cwd, 'node_modules/fixpack/bin/fixpack'),
    join(__dirname, '../fixpack/bin/fixpack'),
    join(__dirname, '../.bin/fixpack'),
    join(__dirname, '../node_modules/.bin/fixpack'),
    join(__dirname, '../node_modules/fixpack/bin/fixpack'),
    join(__dirname, '../node_modules/fixpack/fixpack.js')
  ]
  return find(choices, fs.existsSync)
}

function sortPackageProperties (grunt, done, options, valid) {
  options = options || {}
  var fixpack = findFixpack()
  if (!check.unemptyString(fixpack)) {
    grunt.log.warn('Could not find fixpack, skipping ...')
    done(true)
    return
  }

  var exec = require('child_process').exec

  exec('node "' + fixpack + '"', function (error, stdout, stderr) {
    if (error) {
      grunt.log.error(error)
      done(false)
    } else {
      grunt.log.writeln(stdout)
      if (stderr) {
        grunt.log.warn(stderr)
      }

      if (options.blankLine) {
        var txt = load('package.json', 'utf8')
        if (!/\n\n$/.test(txt)) {
          txt += '\n'
          save('package.json', txt, 'utf8')
        }
      }
      done(valid)
    }
  })
}

function isValidLicense (pkg) {
  return check.string(pkg.license) || check.array(pkg.licenses)
}

function printErrors (grunt, result) {
  if (result && !result.valid && check.array(result.errors)) {
    grunt.log.subhead('Errors:')
    result.errors.forEach(unary(grunt.log.error))
  }
}

function getReadmeFiles () {
  var fileMatchOptions = {
    nocase: true
  }
  var readmeMd = join(process.cwd(), 'readme.md')
  var readme = join(process.cwd(), 'readme')
  var readmes = glob
    .sync(readmeMd, fileMatchOptions)
    .concat(glob.sync(readme, fileMatchOptions))
  return readmes
}

function checkLicenseAndReadm (grunt) {
  var pkg = grunt.file.readJSON('package.json')
  if (!isValidLicense(pkg)) {
    grunt.log.error('missing license information')
    return false
  }

  var readmes = getReadmeFiles()
  if (!readmes.length) {
    grunt.log.error('missing README.md file')
    return false
  }
  return true
}

function makePackageNicer (grunt, validators, done, options) {
  validators = validators || {}
  options = options || {}
  la(check.fn(done), 'expected done to be a function')

  var pkg = grunt.file.readJSON('package.json')
  var every = checkProperties(validators, grunt, pkg)

  // advanced checking
  if (!checkLicenseAndReadm(grunt)) {
    return done(false)
  }

  var pkgText = JSON.stringify(pkg, null, 2)
  pkgText = pkgText.replace(/\^/g, '')

  var result = every && PJV.validate(pkgText)
  printErrors(grunt, result)

  if (check.array(result.warnings) && result.warnings.length) {
    grunt.log.subhead('Warnings:')
    result.warnings.forEach(unary(grunt.log.warn))
  }

  tightenVersions(grunt, function () {
    sortPackageProperties(grunt, done, options.blankLine, !!result.valid)
  })
}

// function registerUnderTaskName (name, grunt, defaultValidators) {
//   verify.unemptyString(name, 'expected name')
//   grunt.verbose.writeln('Using', name, 'multi task')

//   grunt.registerMultiTask(name, taskDescription, function () {
//     // Merge custom validation functions with default ones
//     defaultValidators.fix = true
//     var options = this.options(defaultValidators)
//     var blankLine = Boolean(options.blankLine)
//     delete options.blankLine
//     var fix = Boolean(options.fix)
//     delete options.fix

//     var extraOptions = {
//       blankLine: blankLine,
//       fix: fix
//     }
//     makePackageNicer(grunt, options, this.async(), extraOptions)
//   })
// }

// module.exports = function(grunt) {
//   var defaultValidators = initValidators(grunt);

//   var found;
//   if (grunt.config.data[taskName]) {
//     found = true;
//     registerUnderTaskName(taskName, grunt, defaultValidators);
//   }

//   if (grunt.config.data.nicePackage) {
//     found = true;
//     registerUnderTaskName('nicePackage', grunt, defaultValidators);
//   }

//   if (!found) {
//     grunt.verbose.writeln('Using default', taskName, 'task');

//     grunt.registerTask(taskName, taskDescription, function () {
//       makePackageNicer(grunt, defaultValidators, this.async());
//     });
//   }
// };
