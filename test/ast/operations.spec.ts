import {failAll} from './tools';

describe('[AST] Operations', () => {

    failAll([
        '<abc> = [push]',
        '<abc> = [def]',
        '<abc> = [void]',
        '<abc> = [void ab]',
        '<abc> = [def s]',
        '<abc> = [def s = ]',
        '<abc> = [def s = abc]',
    ]);
});
