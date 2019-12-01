import {check}                                                                         from '../tools/check';
import {combine}                                                                       from '../tools/combine';
import {expect}                                                                        from '../tools/expect';
import {maybe}                                                                         from '../tools/maybe';
import {optional}                                                                      from '../tools/optional';
import {BinaryCombinator, CharacterSelection, Func, Group, GroupValue, Reference, Str} from '../types';

module.exports = maybe<Group>(stream => {
    const characterSelection = require('./character-selection');
    const combinator = require('./combinator');
    const multiplier = require('./multiplier');
    const reference = require('./reference');
    const string = require('./string');
    const group = require('./group');
    const fn = require('./function');

    // It may be a group
    if (!optional(stream, 'punc', '[')) {
        return null;
    }

    const values: Array<GroupValue> = [];
    const parsers = combine<Reference | Group | CharacterSelection | Str | Func>(
        fn,
        reference,
        group,
        characterSelection,
        string
    );

    // The following code is chaos, and thats ok.
    // It works as intended and does the job just fine.
    let comg: null | BinaryCombinator = null;
    while (!check(stream, 'punc', ']')) {
        const value = parsers(stream);
        const com = combinator(stream);

        if (!value) {
            stream.throwError('Expected a type, group or raw string / character-range.');
        }

        if (com) {

            // Append to previous group
            if (comg) {
                if (com.value === comg.sign) {

                    // Still the same binary combinator since the sign is the same
                    comg.value.push(value as GroupValue);
                } else {

                    /**
                     * Different sign, create new combinator with new sign and push it to
                     * previous combinator
                     */
                    const subCom = {
                        type: 'combinator',
                        sign: com.value,
                        value: [value]
                    } as BinaryCombinator;

                    comg.value.push(subCom);
                    comg = subCom; // We're now in another combinator
                }

                continue;
            }

            // No combinator defined, create one with current sign
            comg = {
                type: 'combinator',
                sign: com.value,
                value: [value]
            } as BinaryCombinator;

            values.push(comg);
        } else if (comg) {

            // Last element of combinator, push it and set current combinator back to null
            comg.value.push(value as GroupValue);
            comg = null;
        } else {

            // Element does no correspond to any binary combinator
            values.push(value as GroupValue);
        }
    }

    // A remaining
    if (comg) {
        stream.throwError('Combinator is missing a value!');
    }

    expect(stream, 'punc', ']');

    return {
        type: 'group',
        multiplier: multiplier(stream),
        value: values
    } as Group;
});
