// E.g., '12.6x2, 15, 18' --> [126, 132, 150, 180]
function parseTicksInput(str) {
    const delim = /,\s*/;
    const tokenPattern = /^(\d*(?:\.\d)?)(?:x(\d{1,2}))?$/;
    const tokens = str.split(delim);
    const returnValue = [];
    const isValidInput = tokens.every(token => {
        const groups = tokenPattern.exec(token);
        if (!groups) {
            return false;
        }

        const expander = parseInt(groups[2] || '1');
        returnValue.push(parseTime(groups[1]));
        for (let i = 0; i < expander - 1; ++i) {
            returnValue.push(returnValue[returnValue.length - 1] + 6);
        }
        return true;
    });
    if (isValidInput) {
        returnValue.sort();
        return returnValue;
    } else {
        return [];
    }
}

function parseTime(str) {
    if (!/\d*\.\d/.test(str)) {
        str += '0';
    } else {
        str = str.replace('.', '');
    }
    return parseInt(str);
}
