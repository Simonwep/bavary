const multiplier = require('./multiplier');
const string = require('./string');
const type = require('./type');

module.exports = multiplier((stream, group, map, obj = {}) => {
    let pure = true;
    let str = '';

    stream.stash();
    const decs = group.value;
    for (let i = 0; i < decs.length; i++) {
        const next = (i < decs.length - 1) ? decs[i + 1] : null;
        const prev = (i > 1) ? decs[i - 1] : null;
        const decl = decs[i];
        let passed = false;

        // Parse declaration
        switch (decl.type) {
            case 'string': {
                const res = string(stream, decl);

                if (typeof res === 'string') {
                    str += res;
                    passed = true;
                }

                break;
            }
            case 'type': {
                const res = type(stream, decl, map);

                if (res) {
                    if (decl.tag) {
                        pure = false;
                        obj[decl.tag] = res;
                    } else if (Array.isArray(res)) {
                        str += res.join('');
                    } else if (typeof res === 'string') {
                        str += res;
                    } else {
                        break;
                    }

                    passed = true;
                } else if (decl.multiplier) {
                    const {type} = decl.multiplier;

                    if (type === 'one-infinity') {
                        stream.pop();
                        return null;
                    } else if (type === 'optional') {
                        continue;
                    }

                } else {
                    stream.pop();
                    return null;
                }

                break;
            }
            case 'group': {
                const res = require('./group')(stream, decl, map, obj);

                if (res) {
                    if (Array.isArray(res)) {
                        str += res.join('');
                    } else if (typeof res === 'string') {
                        str += res;
                    } else {
                        stream.recycle();
                        return res;
                    }

                    passed = true;
                } else if (decl.multiplier) {
                    const {type} = decl.multiplier;

                    if (type === 'one-infinity') {
                        stream.pop();
                        return null;
                    } else if (type === 'optional') {
                        continue;
                    }
                }

                break;
            }
            default: {
                continue;
            }
        }

        // If the type couldn't be parsed, check if it's optional trough a combinator.
        const isOptional = (next || prev) && (next || prev).type === 'combinator';
        if (!passed && !isOptional) {
            stream.pop();
            return null;
        } else if (passed && isOptional) {
            break;
        }
    }

    stream.recycle();
    return pure ? str || null : obj;
});
