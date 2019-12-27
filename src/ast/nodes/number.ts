import {maybe}    from '../tools/maybe';
import {optional} from '../tools/optional';
import {Num}      from '../types';

export const number = maybe<Num>(stream => {
    const num = optional(stream, false, 'num');

    return num ? {
        type: 'number',
        value: num.value as number
    } as Num : null;
});
