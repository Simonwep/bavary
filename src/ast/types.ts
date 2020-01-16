import {TokenStream} from '../tokenizer/token-stream';

export type ASTNode = Declaration | CharacterSelection | ValueAccessor | ConditionalStatement |
    VoidStatement | Arguments | Func | Multiplier | BinaryExpressionValue | Group | Reference | Block | Literal;

export type ParserFunction<T> = (stream: TokenStream) => T | null;

export type DeclarationValue = Group | Block;
export type DeclarationVariant = 'entry' | 'default' | 'export' | null;
export type Declaration = {
    type: 'declaration';
    name: string | null;
    variant: DeclarationVariant;
    value: DeclarationValue;
    arguments: Arguments | null;
}

export type Block = {
    type: 'block';
    value: Array<Declaration>;
}

export type Arguments = Array<Argument>;
export type Argument = {
    name: string;
    value: Group | null;
}

export type GroupValue = Reference | Literal | BinaryCombinator | Group | Spread |
    CharacterSelection | GroupCommand | ConditionalStatement | Func | VoidStatement;

export type Group = {
    type: 'group';
    mode: 'object' | 'array' | 'string' | null;
    multiplier: Multiplier | null;
    value: Array<GroupValue>;
}

export type GroupCommand = DefineStatement | PushStatement | RemoveStatement | VoidStatement | ThrowStatement;

export type RemoveStatement = {
    type: 'remove';
    value: ValueAccessor;
}

export type DefineStatement = {
    type: 'define';
    name: string;
    value: Group | Literal | ValueAccessor;
}

export type PushStatement = {
    type: 'push';
    value: Group | Literal;
}

export type VoidStatement = {
    type: 'ignored';
    value: Group;
}

export type ThrowStatement = {
    type: 'throw';
    value: Literal;
}

export type Multiplier = {
    type: 'zero-infinity' | 'one-infinity' | 'optional' | 'range';
    value: MultiplierRange | '*' | '+' | '?';
}

export type MultiplierRange = {
    start: number;
    end: number;
}

export type Numeral = {
    type: 'number';
    value: number;
}

export type RawLiteral = {
    type: 'raw-literal';
    value: string;
}

export type Literal = {
    type: 'literal';
    value: LiteralValues;
}

export type LiteralValues = Array<RawLiteral | ValueAccessor>;

export type Identifier = {
    type: 'identifier';
    value: string;
}

export type Reference = {
    type: 'reference';
    multiplier: Multiplier | null;
    arguments: Arguments | null;
    value: Array<string>;
}

export type Spread = {
    type: 'spread';
    value: Reference | Group | CharacterSelection | Literal;
}

export type FuncArgument = Group | Literal | Identifier | ValueAccessor;
export type Func = {
    type: 'function';
    name: string;
    args: Array<FuncArgument>;
}

export type CharacterSelection = {
    type: 'character-selection';
    multiplier: Multiplier | null;
    included: CharacterSelectionArray;
    excluded: CharacterSelectionArray;
}

export type CharacterSelectionArray = Array<number | [number, number]>;
export type ValueAccessorPath = Array<string | number>; // <identifier | array-index>
export type ValueAccessor = {
    type: 'value-accessor';
    value: ValueAccessorPath;
}

export type ConditionalStatement = {
    type: 'conditional-statement';
    condition: BinaryExpression;
    consequent: Group;
    alternate: Group | ConditionalStatement | null;
}

export type BinaryCombinator = {
    type: 'combinator';
    sign: string;
    value: Array<GroupValue>;
}

export type BinaryExpressionValue = BinaryExpression | Literal | Identifier | Numeral | ValueAccessor;
export type BinaryOperator = '|' | '&' | '<' | '>' | '==' | '!=' | '>=' | '<=';
export type BinaryExpression = {
    type: 'binary-expression';
    operator: BinaryOperator;
    left: BinaryExpressionValue;
    right: BinaryExpressionValue;
}
