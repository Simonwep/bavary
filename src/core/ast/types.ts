export type ASTNode = Declaration | Combinator | CharacterSelection |
    Identifier | Type | Group | Multiplier | Container | Block | string;

export type DeclarationValue = Group | Block;
export type DeclarationVariant = 'entry' | 'default' | 'export' | null;
export type Declaration = {
    type: 'declaration';
    name: string | null;
    variant: DeclarationVariant;
    value: DeclarationValue;
}

export type GroupValue = Container | Str | GroupedCombinator | Group;
export type Group = {
    type: 'group';
    multiplier: Multiplier;
    value: Array<GroupValue>;
}

export type GroupedCombinator = {
    type: 'combinator';
    sign: string;
    value: Array<GroupValue>;
}

export type MultiplierRange = {
    start: number;
    end: number;
}

export type Multiplier = {
    type: 'zero-infinity' | 'one-infinity' | 'optional' | 'range';
    value: MultiplierRange | '*' | '+' | '?';
}

export type Str = {
    type: 'string';
    value: string;
}

export type Type = {
    type: 'type';
    value: string;
}

export type Reference = {
    type: 'reference';
    value: Array<string>;
}

export type Container = {
    type: 'container';
    multiplier: Multiplier | null;
    modifiers: Modifiers | null;
    value: Reference | Group;
    join: string | null;
    tag: string | null;
    spread: boolean;
}

export type DeleteModifier = {
    type: 'del';
    param: string;
}

export type DefineModifier = {
    type: 'def';
    key: string;
    value: string;
}

export type Modifier = DefineModifier | DeleteModifier;
export type Modifiers = Array<Modifier>;
export type ModifierTarget = {[key: string]: unknown};

export type Identifier = {
    type: 'identifier';
    value: string;
}

export type Combinator = {
    type: 'combinator';
    value: string;
}

export type CharacterSelection = {
    type: 'character-selection';
    multiplier: Multiplier | null;
    included: CharacterSelectionArray;
    excluded: CharacterSelectionArray;
}

export type CharacterSelectionArray = Array<CharacterSelectionRange | CharacterSelectionCode>;

export type CharacterSelectionCode = {
    type: 'character';
    value: number;
}

export type CharacterSelectionRange = {
    type: 'range';
    from: number;
    to: number;
}

export type Block = {
    type: 'block';
    value: Array<Declaration>;
}
