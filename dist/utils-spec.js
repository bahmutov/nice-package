"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var utils_1 = require("./utils");
var lazy_ass_1 = __importDefault(require("lazy-ass"));
var check_more_types_1 = __importDefault(require("check-more-types"));
describe('utils', function () {
    describe('unary', function () {
        function identity(a) {
            if (arguments.length !== 1) {
                throw new Error('Passed not 1 argument');
            }
            return a;
        }
        it('passes functions with single argument', function () {
            var fn = utils_1.unary(identity);
            lazy_ass_1.default(check_more_types_1.default.fn(fn));
            fn(1);
        });
    });
});
