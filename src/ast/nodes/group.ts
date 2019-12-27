import {characterSelecton, conditionalStatement, func, multiplier, reference, string} from '../internal';
import {combinator}                                                                   from '../modifiers/combinator';
import {check}                                                                        from '../tools/check';
import {combine}                                                                      from '../tools/combine';
import {expect}                                                                       from '../tools/expect';
import {maybe}                                                                        from '../tools/maybe';
import {optional}                                                                     from '../tools/optional';
import {BinaryCombinator, Group, GroupValue}                                          from '../types';

export const group = maybe<Group>(stream => {

    // It may be a group
    if (!optional(stream, false, 'punc', '[')) {
        return null;
    }

    const values: Array<GroupValue> = [];
    const parsers = combine<GroupValue | null>(
        conditionalStatement,
        func,
        group,
        reference,
        characterSelecton,
        string
    );

    // The following code is chaos, and thats ok.
    // It works as intended and does the job just fine.
    let comg: null | BinaryCombinator = null;
    while (!check(stream, false, 'punc', ']')) {
        const value = parsers(stream);
        const sign = combinator(stream);

        if (!value) {
            stream.throwError('Expected a type, group or raw string / character-range.');
        }

        if (sign) {

            // Append to previous group
            if (comg) {
                if (sign === comg.sign) {

                    // Still the same binary combinator since the sign is the same
                    comg.value.push(value as GroupValue);
                } else {

                    /**
                     * Different sign, create new combinator with new sign and push it to
                     * previous combinator
                     */
                    const subCom = {
                        type: 'combinator',
                        value: [value],
                        sign
                    } as BinaryCombinator;

                    comg.value.push(subCom);
                    comg = subCom; // We're now in another combinator
                }

                continue;
            }

            // No combinator defined, create one with current sign
            comg = {
                type: 'combinator',
                value: [value],
                sign
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

    expect(stream, false, 'punc', ']');

    return {
        type: 'group',
        multiplier: multiplier(stream),
        value: values
    } as Group;
});
