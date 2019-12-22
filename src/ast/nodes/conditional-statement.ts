import {maybe}                from '../tools/maybe';
import {optional}             from '../tools/optional';
import {ConditionalStatement} from '../types';

module.exports = maybe<ConditionalStatement>(stream => {
    const parseValueAccessor = require('./value-accessor');
    const parseGroup = require('./group');
    const parseTag = require('./tag');

    if (!optional(stream, false, 'kw', 'if')) {
        return null;
    }

    // User may used the not-keyword to negate the condition
    const negated = !!optional(stream, false, 'kw', 'not');

    // Parse tag
    const tag = parseTag(stream);
    if (!tag) { // TODO: Create util to expect a value
        stream.throwError('Expected a tag.');
    }

    // The accessor-path is optional
    const accessorPath = parseValueAccessor(stream)?.value || [];

    // Parse then-block
    const then = parseGroup(stream);
    if (!then) {
        stream.throwError('Expected a group.');
    }

    // The else-branch is optional
    let alternative = null;
    if (optional(stream, false, 'kw', 'else')) {
        alternative = parseGroup(stream);

        if (!alternative) {
            stream.throwError('Expected a group.');
        }
    }

    return {
        type: 'conditional-statement',
        condition: [tag.value, ...accessorPath],
        negated,
        then, alternative
    } as ConditionalStatement;
});
