import {Declaration, Group}                                               from '../ast/types';
import {Streamable}                                                       from '../misc/stream';
import {createScope, ENTRY_EXPORT, GLOBAL_SCOPE}                          from './tools/create-scope';
import {resolveDefaultExport}                                             from './tools/resolve-scope';
import {CompilerConfig, Parser, Scope, ScopeEntriesMap, ScopeVariantsMap} from './types';

/**
 * Compiles a pre-calcuated set of declarations.
 * Should only be used internally.
 * @param tree
 * @param config
 */
export const compileDeclarations = (
    tree: Array<Declaration>,
    config: CompilerConfig = {
        locationData: false,
        functions: {}
    }
): Parser => {
    const group = require('./parser/group');

    // Resolve sub-scopes
    const globalScope = createScope(tree, {
        variants: new Map() as ScopeVariantsMap,
        entries: new Map() as ScopeEntriesMap,
        parent: null,
        key: GLOBAL_SCOPE,
    });

    // Set default starts, and ends values on locationData config option
    if (config.locationData === true) {
        config.locationData = {
            start: '__starts',
            end: '__ends'
        }
    }

    // Pick entry type
    const entry = globalScope.variants.get(ENTRY_EXPORT);

    // Check if entry node is declared
    if (!entry) {
        throw new Error('Couldn\'t resolve entry type. Use the entry keyword to declare one.');
    }

    let entryGroup: Group | null = null;
    let entryScope: Scope | null = null;

    if (entry.type === 'scope') {
        const [scope, decl] = resolveDefaultExport(entry.value as Scope);
        entryScope = scope;
        entryGroup = decl.value as Group;
    } else {
        entryGroup = (entry.value as Declaration).value as Group;
        entryScope = globalScope;
    }

    return (content: string): null | object => {

        // Parse and return result if successful
        const stream = new Streamable(content);
        const res = group({
            config,
            stream,
            decl: entryGroup,
            scope: entryScope
        });

        return stream.hasNext() ? null : res;
    };
};
