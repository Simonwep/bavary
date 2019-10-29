const {compile} = require('../../../src');
const {expect} = require('chai');

module.exports = spec => {
    const parse = compile(spec);

    return tests => {
        for (const test of tests) {
            if (Array.isArray(test)) {
                const [str, expectedResult] = test;

                it(`Should parse "${str}"`, () => {
                    expect(parse(str)).to.deep.equal(expectedResult);
                });
            } else {
                it(`Should return null for "${test}"`, () => {
                    expect(parse(test)).to.equal(null);
                });
            }
        }
    };
};
