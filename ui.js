import { calcHealerDeath } from './spacing_after_nerf.js'

const uiWave = document.getElementById('wave');
const uiSpawn = document.getElementById('spawn');
const uiReds = document.getElementById('reds');
const uiSplash = document.getElementById('splash');
const uiTicksInput = document.getElementById('ticks');
const uiInterpretedTicks = document.getElementById('interpretedTicks');
const uiDeathTime = document.getElementById('deathTime');
const uiTable = document.getElementById('table');

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

// E.g., '12.6x2, 15, 18' --> [126, 132, 150, 180]
function parseTicksInput(str) {
    const delim = /,\s*/;
    const tokenPattern = /^(\d+(?:\.\d)?)(?:x(\d{1,2}))?$/;
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

function userInput() {
    const wave = parseInt(uiWave.value || '1');
    const spawn = parseInt(uiSpawn.value || '12');
    const reds = parseInt(uiReds.value || '0');
    const splash = parseInt(uiSplash.value || '0');
    const ticks = parseTicksInput(uiTicksInput.value);
    return { wave, spawn, reds, splash, ticks };
}

function tableCell(text, tag='td') {
    const td = document.createElement(tag);
    td.innerText = text;
    return td;
}

function generateTable(trace) {
    const tbody = document.createElement('tbody');
    trace.forEach(tick => {
        const tr = document.createElement('tr');
        if (tick.type == 'manual') {
            tr.class = 'table-info';
        }
        tr.appendChild(tableCell(formatMillis(tick.time.toString()), 'th'));
        tr.appendChild(tableCell(tick.damage.toString()));
        tr.appendChild(tableCell(tick.type));
        tr.appendChild(tableCell(tick.hp.toString()));
        tbody.appendChild(tr);
    });
    uiTable.replaceChild(tbody, uiTable.tBodies[0]);
}

function update(e) {
    const params = userInput();
    if (!params.ticks) {
        return false;
    }
    uiInterpretedTicks.innerText = params.ticks.map(tick => formatMillis(tick)).join(', ');
    const deathTime = calcHealerDeath(
        params.wave, params.ticks, params.spawn, params.reds, params.splash, false);
    if (deathTime.deathTime) {
        uiDeathTime.innerText = `Healer dies at: ${formatMillis(deathTime.deathTime)}`;
    } else {
        uiDeathTime.innerText = 'Healer does not die.';
    }
    generateTable(deathTime.trace);
    return true;
}

(() => {
    const history = [];
    let historyPosition = 0;

    [uiWave, uiSpawn, uiReds, uiSplash, uiTicksInput].forEach(input =>
        input.addEventListener('input', update));
    uiTicksInput.addEventListener('input', e => {
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
    update();
})();
