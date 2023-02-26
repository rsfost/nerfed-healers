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
    const pattern = /(\d+)?(\d)/;
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
        returnValue.push({
            time: parseTime(groups[1]),
            isExpanded: false
        });
        for (let i = 0; i < expander - 1; ++i) {
            returnValue.push({
                time: returnValue[returnValue.length - 1].time + 6,
                isExpanded: true
            });
        }
        return true;
    });
    if (isValidInput && tokens.length > 0) {
        returnValue.sort((a, b) => a.time - b.time);
        return returnValue;
    } else {
        return false;
    }
}

function userInput() {
    const wave = parseInt(uiWave.value || '1');
    const spawn = Math.floor(parseFloat(uiSpawn.value || '6') * 10);
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
        if (tick.type == 'natural') {

        } else {
            tr.classList.add('text-primary-emphasis');
        }
        tr.appendChild(tableCell(formatMillis(tick.time.toString()), 'th'));
        tr.appendChild(tableCell(tick.damage.toString()));
        tr.appendChild(tableCell(tick.type));
        tr.appendChild(tableCell(tick.hp.toString()));
        tbody.appendChild(tr);
    });
    uiTable.replaceChild(tbody, uiTable.tBodies[0]);
}

// I really don't like this implementation. I should really use a frontend library :\
function generateTicksInterpretation(ticks) {
    let html = '';
    let prevTag;

    if (!ticks || ticks.length <= 0) {
        uiInterpretedTicks.innerText = '';
    }

    const appendTickHtml = (tick) => {
        let tag;
        if (tick.isExpanded) {
            tag = 'span';
        }
        if (tag !== prevTag) {
            if (prevTag) {
                html += `</${prevTag}>`;
            }
            if (tag) {
                html += `<${tag} class="text-body-tertiary">`;
            }
        }
        html += formatMillis(tick.time);
        prevTag = tag;
    };

    appendTickHtml(ticks[0]);
    for (let i = 1; i < ticks.length; ++i) {
        html += ', ';
        appendTickHtml(ticks[i]);
    }
    uiInterpretedTicks.innerHTML = html;
}

function update(e) {
    const params = userInput();
    if (!params.ticks) {
        return false;
    }
    generateTicksInterpretation(params.ticks);

    const tickTimes = params.ticks.map(tick => tick.time);
    const deathTime = calcHealerDeath(
        params.wave, tickTimes, params.spawn, params.reds, params.splash, false);
    if (deathTime.deathTime) {
        uiDeathTime.innerText = `Healer dies at: ${formatMillis(deathTime.deathTime)}`;
    } else {
        uiDeathTime.innerText = 'Healer does not die.';
    }
    generateTable(deathTime.trace);
    return true;
}

[uiWave, uiSpawn, uiReds, uiSplash, uiTicksInput].forEach(input =>
    input.addEventListener('input', update));
update();
