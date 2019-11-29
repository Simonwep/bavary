import {check}                        from '../tools/check';
import {combine}                      from '../tools/combine';
import {expect}                       from '../tools/expect';
import {maybe}                        from '../tools/maybe';
import {optional}                     from '../tools/optional';
import {Block, Func, Group, Str, Tag} from '../types';

module.exports = maybe<Func>(stream => {
    const identifier = require('../modifiers/identifier');
    const name = identifier(stream);

    if (!name || !optional(stream, 'punc', '(')) {
        return null;
    }

    const parse = combine<Tag | Group | Block | Str>(
        require('./tag'),
        require('./group'),
        require('./string')
    );

    // Parse arguments
    const args = [];
    while (!check(stream, 'punc', ')')) {
        if (args.length) {
            expect(stream, 'punc', ',');
        }

        const arg = parse(stream);
        if (!arg) {
            stream.throwError('Expected an a group, tag or identifier.');
        }

        args.push(arg);
    }

    expect(stream, 'punc', ')');
    return {
        type: 'function',
        name,
        args,
    } as Func;
});
