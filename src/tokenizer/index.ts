import {Streamable}       from '../streams/streamable';
import {Alternate, Token} from './types';
import {cmt}              from './types/cmt';
import {kw}               from './types/kw';
import {num}              from './types/num';
import {punc}             from './types/punc';
import {ws}               from './types/ws';

const parser = [
    cmt,
    ws,
    kw,
    num,
    punc
];

/**
 * Parses a sequence of characters into a list of processable tokens
 * @param str
 * @returns {[]}
 */
export const tokenize = (str: string): Array<Token> => {
    const stream = new Streamable(str);
    const tokens: Array<Token> = [];

    /* eslint-disable no-labels */
    outer: while (stream.hasNext()) {

        // Find matching parser
        for (const parse of parser) {
            const start = stream.index;
            const parsed = parse(stream);

            if (parsed === Alternate.FAILED) {
                continue;
            } else if (parsed === Alternate.EMPTY) {
                continue outer;
            }

            // There may be a comment between whitespace, concatenate that
            if (parsed.type === 'ws' && tokens.length && tokens[tokens.length - 1].type === 'ws') {
                const last = tokens[tokens.length - 1];
                last.value += parsed.value as string;
                last.end = stream.index;
                continue outer;
            }

            tokens.push({
                ...parsed,
                start,
                end: stream.index
            } as Token);

            // Escaped comment-token
            if (parsed.value === '\\' && stream.peek() === '#') {
                tokens.push({
                    type: 'punc',
                    value: '#',
                    start: stream.index,
                    end: stream.index + 1
                } as Token);

                stream.next();
            }

            continue outer;
        }

        // Same problem as in types/punc.ts
        /* istanbul ignore next */
        stream.throw('Failed to parse input sequence.');
    }

    return tokens;
};

