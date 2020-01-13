import {Reference}                      from '../../ast/types';
import {evalRawReference}               from '../internal';
import {typeOf}                         from '../tools/type-of';
import {ParserArgs, ParsingResultValue} from '../types';

export const evalReference = (
    {
        config,
        stream,
        decl,
        scope,
        result
    }: ParserArgs<Reference>
): boolean => {

    // Resolve value of reference
    const matches = evalRawReference({
        config, stream, decl, scope
    });

    // Identify result type
    const matchesType = typeOf(matches);

    stream.stash();
    if (matches !== null) {
        if (matchesType === 'array') {

            // Join array-values if all entries are strings
            if (result.type === 'string' && (matches as Array<ParsingResultValue>).every(v => typeof v === 'string')) {
                result.value += (matches as Array<ParsingResultValue>).join('');
            }

        } else if (matchesType === 'string' && result.type === 'string') {

            // Concat strings
            result.value += matches as string;
        }
    } else {

        // Restore previous stack position
        stream.pop();

        // Declaration may be still optional through a '?'
        return !!(decl.multiplier && decl.multiplier.type === 'optional');
    }

    stream.recycle();
    return true;
};
