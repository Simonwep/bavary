import {parseValueAccessor} from '../../internal';
import {maybe}              from '../../tools/maybe';
import {RemoveStatement}    from '../../types';

export const parseRemoveStatement = maybe<RemoveStatement>(stream => {
    const value = parseValueAccessor(stream);

    if (!value) {
        stream.throw('Expected value accessor.');
    }

    return {
        type: 'remove',
        value,
    } as RemoveStatement;
});
