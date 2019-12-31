import {TokenStream}                               from '../../../misc/token-stream';
import {parseIdentifier, parseNumber, parseString} from '../../internal';
import {combine}                                   from '../../tools/combine';
import {expect}                                    from '../../tools/expect';
import {maybe}                                     from '../../tools/maybe';
import {optional}                                  from '../../tools/optional';
import {skipWhitespace}                            from '../../tools/skip-whitespace';
import {BinaryExpression, BinaryExpressionValue}   from '../../types';
import {operatorPriority}                          from './operator-priority';
import {taggedValueAccessor}                       from './tagged-value-accessor';

/**
 * Parses a binary expression
 * @param left Left-hand value
 * @param stream TokenStream
 * @param parse Parsing function
 * @param base Base priority
 */
function maybeBinary(
    left: BinaryExpression | BinaryExpressionValue,
    stream: TokenStream,
    parse: (stream: TokenStream) => BinaryExpressionValue | null,
    base = 0
): BinaryExpression | BinaryExpressionValue {
    stream.stash();

    const operator = optional(stream, false, 'punc')?.value as string
        + (optional(stream, true, 'punc')?.value || '');

    if (!operator || !(operator in operatorPriority)) {
        stream.pop();
        return left;
    }

    // Check whenever the operator has a higher priority than the previous one
    const pr = operatorPriority[operator];
    if (pr > base) {

        // Parse right-hand value
        skipWhitespace(stream);
        const rightValue = parse(stream);
        if (!rightValue) {
            stream.throwError('Expected right-hand value');
        }

        return maybeBinary({
            type: 'binary-expression',
            right: maybeBinary(rightValue, stream, parse, pr),
            operator,
            left
        } as BinaryExpression, stream, parse, base);
    }

    stream.pop();
    return left;
}

export const parseBinaryExpression = maybe<BinaryExpression>(stream => {
    if (!optional(stream, false, 'punc', '(')) {
        return null;
    }

    const parse = combine<BinaryExpressionValue | null>(
        taggedValueAccessor,
        parseBinaryExpression,
        parseString,
        parseNumber,
        parseIdentifier
    );

    const left = parse(stream);
    if (!left) {
        return null;
    }

    // Parse binary expression
    const bex = maybeBinary(left, stream, parse);
    if (bex.type !== 'binary-expression') {
        stream.throwError('Expected binary expression.');
    }

    expect(stream, false, 'punc', ')');
    return bex as BinaryExpression;
});
