import Streamable        from '../../../stream';
import {RawType}         from '../../../tokenizer/types';
import {DeleteExtension} from '../../types';

export default (stream: Streamable<RawType>): DeleteExtension => {
    const identifier = require('../../nodes/identifier');

    const param = identifier(stream);
    if (!param) {
        stream.throwError('Expected identifier');
    }

    return {
        type: 'del',
        param: param.value,
    } as DeleteExtension;
}
