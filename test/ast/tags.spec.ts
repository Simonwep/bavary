import {expect}         from 'chai';
import {failAll, parse} from './tools';

describe('[AST] Tags', () => {

    it('Should accept tags', () => {
        expect(parse('<name> = ["C" <another-type#abc-123>]')).to.deep.equal([
            {
                'type': 'declaration',
                'variant': null,
                'name': 'name',
                'value': {
                    'type': 'group',
                    'multiplier': null,
                    'value': [
                        {'type': 'string', 'value': 'C'},
                        {
                            'type': 'reference',
                            'multiplier': null,
                            'join': null,
                            'modifiers': null,
                            'tag': 'abc-123',
                            'spread': false,
                            'value': ['another-type']
                        }
                    ]
                }
            }
        ]);
    });

    it('Should parse multipliers after tags', () => {
        expect(parse('<name> = [<another-type#abc-123>+]*')).to.deep.equal([
            {
                'type': 'declaration',
                'variant': null,
                'name': 'name',
                'value': {
                    'type': 'group',
                    'multiplier': {
                        'type': 'zero-infinity',
                        'value': '*'
                    },
                    'value': [
                        {
                            'type': 'reference',
                            'multiplier': {
                                'type': 'one-infinity',
                                'value': '+'
                            },
                            'tag': 'abc-123',
                            'spread': false,
                            'join': null,
                            'modifiers': null,
                            'value': ['another-type']
                        }
                    ]
                }
            }
        ]);
    });


    failAll([
        '<abc> = ["A"#]',
        '<abc> = []+#abc'
    ]);
});
