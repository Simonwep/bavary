/* eslint-disable @typescript-eslint/no-use-before-define */
import {BinaryExpression, BinaryExpressionValue} from '../../ast/types';
import {ParsingResult}                           from '../types';
import {lookupValue}                             from './lookup-value';

/**
 * Resolves a single value in a binary-expression
 * @param result
 * @param bexv
 */
function resolveValueOf(result: ParsingResult, bexv: BinaryExpressionValue): string | number | boolean | null {
    switch (bexv.type) {
        case 'binary-expression': {
            return evalBinaryExpression(result, bexv);
        }
        case 'value-accessor': {

            // Strictly check if tag is defined in the current result
            const [tag] = bexv.value;

            if (result.obj[tag] === undefined) {
                throw new Error(`Tag "${tag}" isn't defined anywhere but used in a condition.`);
            }

            return lookupValue(result.obj, bexv.value) as string | number | boolean | null;
        }
        case 'identifier': {

            if (bexv.value === 'null') {
                return null;
            }

            throw new Error(`Unknown constant: "${bexv.value}"`);
        }
        default: {
            return bexv.value;
        }
    }
}

/**
 * Returns true if val is strictly
 * @param val
 */
function strictBoolean(val: unknown): boolean {
    return !(val === false || val === undefined || val === null);
}

/**
 * Evaluates a binary expression to a single, boolsche value
 * @param result
 * @param bex
 */
export function evalBinaryExpression(result: ParsingResult, bex: BinaryExpression): boolean {
    let {operator} = bex;
    let leftVal = resolveValueOf(result, bex.left);
    let rightVal = resolveValueOf(result, bex.right);

    // "a > b" is the same as "b < a"
    if (operator === '>') {
        operator = '<';
        [leftVal, rightVal] = [rightVal, leftVal];

        // "a >= b" is the same as "b <= a"
    } else if (operator === '>=') {
        operator = '<=';
        [leftVal, rightVal] = [rightVal, leftVal];
    }

    switch (operator) {
        case '|':
            return strictBoolean(leftVal) || strictBoolean(rightVal);
        case '&':
            return strictBoolean(leftVal) && strictBoolean(rightVal);
        case '=':
            return leftVal === rightVal;
        case '!=':
            return leftVal !== rightVal;
        case '<': {
            const leftType = typeof leftVal;
            const rightType = typeof rightVal;

            if (leftType === 'string' && rightType === 'string') {
                return (leftVal as string).localeCompare(rightVal as string) === -1;
            } else if (leftType === 'number' && rightType === 'number') {
                return (leftVal as number) < (rightVal as number);
            } else if (leftVal !== null && rightVal !== null) {
                throw new Error(`Invalid types used in comparison: ${leftType} ("${leftVal}") ≠ ${rightType} ("${rightVal}")`);
            }

            return false;
        }
        case '<=': {
            const leftType = typeof leftVal;
            const rightType = typeof rightVal;

            if (leftType === 'string' && rightType === 'string') {
                return (leftVal as string).localeCompare(rightVal as string) < 1;
            } else if (leftType === 'number' && rightType === 'number') {
                return (leftVal as number) <= (rightVal as number);
            } else if (leftVal !== null && rightVal !== null) {
                throw new Error(`Invalid types used in comparison: ${leftType} ("${leftVal}") ≠ ${rightType} ("${rightVal}")`);
            }

            return false;
        }
    }
}
