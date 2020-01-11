import {Streamable}    from '../../streams/streamable';
import {isPunctuation} from '../tools/is';
import {Token}         from '../types';

export const punc = (stream: Streamable<string>): Token | null => {

    /* istanbul ignore else */
    if (isPunctuation(stream.peek() as string)) {
        return {
            type: 'punc',
            value: stream.next()
        } as Token;
    }

    // Basicall everyhing which ends here must be a puncuation characters...
    // Return null is just here to keep types consistend in their return type
    /* istanbul ignore next */
    return null;
};
