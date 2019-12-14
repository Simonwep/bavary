import {RawType}    from '../../tokenizer/types';
import {maybe}      from '../tools/maybe';
import {Identifier} from '../types';

/**
 * Parses an identifier made out of keywords, numbers or hyphens
 * @type {Function}
 */
module.exports = maybe<Identifier>(stream => {
    let name = '';

    while (stream.hasNext(true)) {
        const {type, value} = stream.peek(true) as RawType;

        if (type === 'ws') {
            break;
        } else if (
            (type === 'punc' && value === '-' && name.length) ||
            (type === 'num') ||
            ( type === 'kw')
        ) {
            name += value;
            stream.next(true);
        } else {
            break;
        }
    }

    if (name.endsWith('-')) {
        stream.throwError('Identifier cannot end with a hyphen');
    }

    return name.length ? {
        type: 'identifier',
        value: name
    } as Identifier : null;
});
