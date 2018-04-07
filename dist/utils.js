"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var check_more_types_1 = __importDefault(require("check-more-types"));
var lazy_ass_1 = __importDefault(require("lazy-ass"));
var debug_1 = __importDefault(require("debug"));
var debug = debug_1.default('@bahmutov/nice-package');
function unary(fn) {
    lazy_ass_1.default(check_more_types_1.default.fn(fn), 'unary expects a function');
    return function (first) {
        return fn(first);
    };
}
exports.unary = unary;
function find(array, cb) {
    lazy_ass_1.default(Array.isArray(array), 'expected array');
    lazy_ass_1.default(check_more_types_1.default.fn(cb), 'expected callback');
    var found;
    array.some(function (item) {
        if (cb(item)) {
            found = item;
            return true;
        }
        return false;
    });
    return found;
}
exports.find = find;
function checkProperties(options, pkg) {
    var every = Object.keys(options).every(function (key) {
        debug('checking property %s', key);
        var property = pkg[key];
        if (!property) {
            console.error('package.json missing', key);
            return false;
        }
        if (check_more_types_1.default.fn(options[key])) {
            if (!options[key](property)) {
                console.error('failed check for property', key);
                return false;
            }
        }
        return true;
    });
    return every;
}
exports.checkProperties = checkProperties;
