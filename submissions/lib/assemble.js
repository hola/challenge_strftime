var formats = require('./formats');

var PERCENT_CHAR = '%';
var RESULT_VARIABLE_NAME = '__R';
var DATE_VARIABLE_NAME = '__D';
var OPTIONS_NAME = '__O';

var paddings = {
    '-': '',
    '_': ' ',
    '0': '0'
};
var rePaddingPlaceholder = /\(\(\('.'\)\)\)/g;

function assemble(format) {
    var code = 'var ' + RESULT_VARIABLE_NAME + ' = "";\n' +
               'var __TZ = ' + OPTIONS_NAME + '.timezone;\n' +
               'var __TZ_TYPE = typeof __TZ;\n' +
               'if (' + OPTIONS_NAME + '.utc || __TZ_TYPE == "number" || __TZ_TYPE == "string") {\n' +
               '    ' + DATE_VARIABLE_NAME + ' = new Date(' + DATE_VARIABLE_NAME + '.getTime() + ' +
                    '((' + DATE_VARIABLE_NAME + '.getTimezoneOffset() || 0) * 60000));\n' +
               '}\n' +
               'if (__TZ) {\n' +
                    'if (__TZ_TYPE == "string") {\n' +
                    '    __TZ = (__TZ[0] === "-" ? -1 : 1) * (60 * parseInt(__TZ.slice(1, 3), 10)) + parseInt(__TZ.slice(3, 5), 10);\n' +
                    '} else {' +
                        DATE_VARIABLE_NAME + ' = new Date(' + DATE_VARIABLE_NAME + '.getTime() + (__TZ * 60000));' +
                    '}' +
               '}';

    var next = 0,
        type = '',
        hasPadding = false,
        paddingType = '';

    for (var i = 0, length = format.length, char; i < length; i++) {
        char = format[i];
        next = i + 1;
        hasPadding = false;
        paddingType = '';

        // case char = %
        if (char === PERCENT_CHAR && next < length) {
            type = format[next];

            // case char = %(_|0|-)
            if (paddings.hasOwnProperty(type)) {
                paddingType = type;
                hasPadding = true;
                next = next + 1;
            }

            if (next < length) {
                type = format[next];

                // case char = %(_|0|-)\w
                // case char = %\w
                if (formats.hasOwnProperty(type)) {
                    if (hasPadding) {
                        code += formats[type].replace(rePaddingPlaceholder, '"' + paddings[paddingType] + '"');
                    } else {
                        code += formats[type];
                    }
                } else {
                    // no such formatter
                    code += RESULT_VARIABLE_NAME + ' += "' + type + '";\n';
                }
            }

            i = next;
        } else {
            code += RESULT_VARIABLE_NAME + ' += "' + char + '";\n';
        }
    }

    code += 'return ' + RESULT_VARIABLE_NAME + ';\n';
    return code;
}

module.exports = assemble;
