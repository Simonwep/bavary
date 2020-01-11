import {TokenStream} from '../../tokenizer/token-stream';
import {ASTNode}     from '../types';

/**
 * Accepts a list of parser and returns the first who matches the input
 * @param parsers
 * @returns {Function}
 */
export const combine = <T = ASTNode>(...parsers: Array<(stream: TokenStream) => T>) => {
    return (stream: TokenStream): T | null => {
        for (const parser of parsers) {
            const result = parser(stream);

            if (result !== null) {
                return result;
            }
        }

        return null;
    };
};
