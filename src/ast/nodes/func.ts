import {group, identifier, reference, string, tag} from '../internal';
import {check}                                     from '../tools/check';
import {combine}                                   from '../tools/combine';
import {expect}                                    from '../tools/expect';
import {maybe}                                     from '../tools/maybe';
import {optional}                                  from '../tools/optional';
import {skipWhitespace}                            from '../tools/skip-whitespace';
import {Func, FuncArgument}                        from '../types';

export const func = maybe<Func>(stream => {

    skipWhitespace(stream);
    const name = identifier(stream);
    if (!name || !optional(stream, false, 'punc', '(')) {
        return null;
    }

    const parse = combine<FuncArgument | null>(
        identifier,
        tag,
        group,
        string,
        reference
    );

    // Parse arguments
    const args = [];
    while (!check(stream, false, 'punc', ')')) {
        skipWhitespace(stream);
        if (args.length) {
            expect(stream, false, 'punc', ',');
        }

        skipWhitespace(stream);
        const arg = parse(stream);
        if (!arg) {
            stream.throwError('Expected an a group, tag or identifier.');
        }

        args.push(arg);
    }

    expect(stream, false, 'punc', ')');
    return {
        type: 'function',
        name: name.value,
        args,
    } as Func;
});
