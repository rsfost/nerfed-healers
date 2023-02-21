import { calcHealerDeath } from './spacing_after_nerf.js'

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
    if (isValidInput && tokens.length > 0) {
        returnValue.sort();
        return returnValue;
    } else {
        return false;
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

// e.g., 486 -> '48.6'
function formatMillis(millis)  {
    millis = Math.floor(millis);
    const str = millis.toString(10);
    const pattern = /(\d*)?(\d)/;
    const groups = pattern.exec(str);
    let returnValue = '';
    if (groups) {
        if (groups[1]) {
            returnValue += groups[1];
        } else {
            returnValue += '0';
        }
        returnValue += '.' + groups[2];
    }
    return returnValue;
}

(() => {
    const history = [];
    let historyPosition = 0;

    const uiTicksInput = document.getElementById('ticksInput');
    const uiInterpretedTicks = document.getElementById('interpretedTicks');
    const uiDeathTime = document.getElementById('deathTime');

    uiTicksInput.addEventListener('change', e => {
        const ticks = parseTicksInput(e.target.value);
        if (ticks) {
            uiInterpretedTicks.innerText = ticks.map(tick => formatMillis(tick)).join(', ');
            const deathTime = calcHealerDeath(5, ticks, 12, 0, 0, false);
            if (deathTime) {
                uiDeathTime.innerText = `Healer dies at: ${formatMillis(deathTime)}`;
            } else {
                uiDeathTime.innerText = 'Healer does not die.';
            }
        }
        history.push(e.target.value);
        historyPosition = 1;
    });
    uiTicksInput.addEventListener('keydown', e => {
        if (e.key == 'ArrowUp') {
            historyPosition = Math.min(historyPosition + 1, history.length);
        } else if (e.key == 'ArrowDown') {
            historyPosition = Math.max(historyPosition - 1, 0);
        } else {
            return;
        }
        if (historyPosition <= 0) {
            e.target.value = '';
            return;
        }
        const index = history.length - historyPosition;
        e.target.value = history[index];
        e.preventDefault();
    });
})();
