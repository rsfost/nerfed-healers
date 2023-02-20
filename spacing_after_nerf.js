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
    const waveHps = [27, 32, 37, 43, 49, 55, 60, 67, 76, 60];
    const hp = waveHps[wave - 1] - reds * 3 - splash;
    const poisonTicks = [];

    const forEachPair = (arr, func) => {
        for (let i = 0; i < arr.length - 1; ++i) {
            func(arr[i], arr[i+1]);
        }
    };

    const appendTicks = (manualTime1, manualTime2) => {
        poisonTicks.pushTick(manualTime1, 4, 'manual');
        if (manualTime2 - manualTime1 < 3) {
            return;
        }

        let time = manualTime1 + 3;
        let count = 0;
        for (; time <= manualTime2; time += 3, ++count) {
            const dmg = Math.max(0, 4 - Math.floor(count / 5));
            if (dmg <= 0) {
                break;
            }
            poisonTicks.pushTick(time, dmg, 'natural');
        }
    };

    forEachPair([...ticks, Infinity], (currentTime, nextTime) =>
        appendTicks(currentTime, nextTime));

    console.log(poisonTicks);
}

calcHealerDeath(5, [12,12.6,13.2,19.2], 12, 0, 0, false);