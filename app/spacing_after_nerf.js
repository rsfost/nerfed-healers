/**
 * Calcuate post-nerf healer death time.
 *
 * Original python implementation by Raki Suta (Raki Suta#8520) and Solar754 (md#9935).
 * Refactored a bit and implemented in JS by Foster.
 *
 * https://discord.com/channels/255528818305925131/371048954583842816/1076395713719701646
 * https://discord.gg/cba
 **/
Array.prototype.pushTick = function(time, damage, type) {
    return this.push({time, damage, type});
};
function calcHealerDeath(wave, ticks, spawn, reds, splash, verbose) {
    const waveHps = [270, 320, 370, 430, 490, 550, 600, 670, 760, 600];
    const poisonTicks = [];

    if (!spawn) {
        spawn = poisonTicks[0].time - 30;
    }

    const forEachPair = (arr, func) => {
        for (let i = 0; i < arr.length - 1; ++i) {
            func(arr[i], arr[i+1]);
        }
    };

    const appendTicks = (manualTime1, manualTime2) => {
        poisonTicks.pushTick(manualTime1, 40, 'manual');
        if (manualTime2 - manualTime1 < 30) {
            return;
        }

        let time = manualTime1 + 30;
        let count = 0;
        for (; time <= manualTime2; time += 30, ++count) {
            const dmg = Math.max(0, 40 - 10*Math.floor(count / 5));
            if (dmg <= 0) {
                break;
            }
            poisonTicks.pushTick(time, dmg, 'natural');
        }
    };

    const calcDeathTime = () => {
        const startingHp =  waveHps[wave - 1];
        const effectiveStartingHp = startingHp - reds * 3 - splash;
        let lastRegenTime = spawn;
        let hp = effectiveStartingHp;
        let lastPoisonTick;
        for (let i = 0; hp > 0 && i < poisonTicks.length; ++i) {
            const poisonTick = poisonTicks[i];
            const regen = 10*Math.floor((poisonTick.time - lastRegenTime) / 600);
            hp = Math.min(hp + regen, startingHp);
            lastRegenTime += 60 * regen;
            hp -= poisonTick.damage;
            lastPoisonTick = poisonTick;
        }
        if (hp <= 0) {
            return lastPoisonTick.time + 6;
        } else {
            return 0;
        }
    };

    // e.g., 486 -> '48.6'
    const formatMillis = (millis) => {
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

    forEachPair([...ticks, Infinity], (currentTime, nextTime) =>
        appendTicks(currentTime, nextTime));
    const deathTime = calcDeathTime();

    if (deathTime) {
        console.log('healer dies at ' + formatMillis(deathTime));
    } else {
        console.log('healer does not die :(');
    }
}
