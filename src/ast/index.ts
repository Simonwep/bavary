import {TokenStream} from '../misc/token-stream';
import {RawType}     from '../tokenizer/types';
import './internal';
import {declaration} from './nodes/declaration';
import {Declaration} from './types';

/**
 * Converts a array of tokens into an ast-tree.
 * @param tokens Array of raw tokens
 * @param source Source-code
 */
export const parseAST = (tokens: Array<RawType>, source: string): Array<Declaration> => {
    const stream = new TokenStream(tokens, source);
    const declarations: Array<Declaration> = [];

    while (stream.hasNext()) {
        declarations.push(declaration(stream) as Declaration);
    }

    return declarations;
};
