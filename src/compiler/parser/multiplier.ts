import {CharacterSelection, Group, MultiplierRange, Reference} from '../../ast/types';
import {MultipliedOutcome, ParserArgs, ParsingResult}          from '../types';

type typesWhoCouldHaveMultiplierAttachedToIt = Group | Reference | CharacterSelection;

type OptionalResult<T> = {
    [P in Exclude<keyof ParserArgs<T>, 'result'>]: ParserArgs<T>[P];
} & {
    result?: ParsingResult;
}

export const maybeMultiplier = <ExpectedResult, DeclarationType extends typesWhoCouldHaveMultiplierAttachedToIt>(
    fn: (args: OptionalResult<DeclarationType>) => ExpectedResult | null
) => (args: OptionalResult<DeclarationType>): ExpectedResult | Array<ExpectedResult> | null => {
    const {stream, decl} = args;

    const parseAll = (): Array<ExpectedResult> => {
        const values: Array<ExpectedResult> = [];

        for (let res; (res = fn(args));) {
            console.log(res);
            values.push(res);
        }

        return values;
    };

    // Check if there's a multiplier
    stream.stash();
    if (decl.multiplier) {
        const {type, value} = decl.multiplier;

        switch (type) {
            case 'zero-infinity': {
                stream.recycle();
                return parseAll();
            }
            case 'one-infinity': {
                const values = parseAll();

                if (!values.length) {
                    stream.pop();
                    return null;
                }

                stream.recycle();
                return values;
            }
            case 'range': {
                const {start, end} = value as MultiplierRange;
                const values = parseAll();

                if (values.length < start || (end !== null && values.length > end)) {
                    stream.pop();
                    return null;
                }

                stream.recycle();
                return values;
            }
        }
    }

    stream.recycle();
    return fn(args);
};
