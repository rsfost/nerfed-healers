/**
 * Calcuate post-nerf healer death time.
 *
 * Original python implementation by Raki Suta (Raki Suta#8520) and Solar754 (md#9935).
 * Refactored a bit and implemented in JS by Foster.
 *
 * https://discord.com/channels/255528818305925131/371048954583842816/1076395713719701646
 * https://discord.gg/cba
 **/

export const name = "spacing_after_nerf";

Array.prototype.pushTick = function(time, damage, type) {
    return this.push({time, damage, type});
};

export function calcHealerDeath(wave, ticks, spawn, reds, splash, verbose) {
    const waveHps = [27, 32, 37, 43, 49, 55, 60, 67, 76, 60];
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
        poisonTicks.pushTick(manualTime1, 4, 'manual');
        if (manualTime2 - manualTime1 < 30) {
            return;
        }

        let time = manualTime1 + 30;
        let count = 0;
        for (; time <= manualTime2; time += 30, ++count) {
            const dmg = Math.max(0, 4 - Math.floor(count / 5));
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
        const trace = [];
        for (let i = 0; hp > 0 && i < poisonTicks.length; ++i) {
            const poisonTick = poisonTicks[i];
            const regen = Math.floor((poisonTick.time - lastRegenTime) / 600);
            hp = Math.min(hp + regen, startingHp);
            lastRegenTime += 600 * regen;
            hp -= poisonTick.damage;
            if (hp < 0) {
                hp = 0;
            }
            lastPoisonTick = poisonTick;
            trace.push({ ...poisonTick, hp });
        }

        const returnValue = { trace };
        if (hp <= 0) {
            // Handle the silly case that reds or splash is a big number.
            const finalTick = (lastPoisonTick || { time: spawn }).time;
            returnValue.deathTime = finalTick + 6;
        }
        return returnValue;
    };

    forEachPair([...ticks, Infinity], (currentTime, nextTime) =>
        appendTicks(currentTime, nextTime));
    const deathTime = calcDeathTime();

    return deathTime;
}
