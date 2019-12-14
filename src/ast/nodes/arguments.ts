import {maybe}          from '../tools/maybe';
import {optional}       from '../tools/optional';
import {skipWhitespace} from '../tools/skip-whitespace';
import {Arguments}      from '../types';

module.exports = maybe<Arguments>(stream => {
    const identifier = require('./identifier');
    const group = require('./group');
    const args: Arguments = [];

    while (true) {
        skipWhitespace(stream);
        const name = identifier(stream);

        if (!name) {
            break;
        }

        // It may have a value
        let value = null;
        if (optional(stream, false, 'punc', '=')) {
            value = group(stream);

            if (!value) {
                stream.throwError('Expected a group.');
            }
        }

        args.push({
            type: 'argument',
            name: name.value,
            value
        });
    }

    return args.length ? args : null;
});
