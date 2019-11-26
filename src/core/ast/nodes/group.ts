import {check}                                                               from '../tools/check';
import {combine}                                                             from '../tools/combine';
import {expect}                                                              from '../tools/expect';
import {maybe}                                                               from '../tools/maybe';
import {optional}                                                            from '../tools/optional';
import {CharacterSelection, Group, GroupedCombinator, GroupValue, Reference} from '../types';

module.exports = maybe(stream => {
    const characterSelection = require('./character-selection');
    const combinator = require('./combinator');
    const multiplier = require('./multiplier');
    const reference = require('./reference');
    const string = require('./string');
    const group = require('./group');

    // It may be a group
    if (!optional(stream, 'punc', '[')) {
        return null;
    }

    const values: Array<GroupValue> = [];
    const parsers = combine<Reference | Group | CharacterSelection | string>(
        reference,
        group,
        characterSelection,
        string,
    );

    let comg;
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
                    comg.value.push(value as GroupValue);
                    continue;
                } else {
                    values.push(comg);
                    comg = null;
                }
            }

            comg = {
                type: 'combinator',
                sign: com.value,
                value: [value]
            } as GroupedCombinator;

        } else if (comg) {
            comg.value.push(value as GroupValue);
            values.push(comg);
            comg = null;
        } else {
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
