import {TokenStream} from '../../tokenizer/token-stream';
import {maybe}       from '../tools/maybe';
import {Str}         from '../types';

export const parseString = maybe<Str>((stream: TokenStream) => {
    const string = stream.optional(false, 'str');

    if (string !== null && !(string as string).length) {
        stream.throw('Strings shouldn\'t be empty.');
    }

    return string ? {
        type: 'string',
        value: string
    } as Str : null;
});
