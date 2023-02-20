# Calcuate post-nerf healer death time. This is the original Python implementation
# by Raki Suta (Raki Suta#8520) and Solar754 (md#9935).
#
# EXAMPLE:
# healer_death(wave = 8, ticks = [12,12.6,24,35.6], spawn = 12, reds = 1, splash = 0, verbose = False)
# returns
# Healer dies at: 57.2
#
# https://discord.com/channels/255528818305925131/371048954583842816/1076395713719701646
# https://discord.gg/cba
def healer_death( wave, ticks, spawn = None, reds = 0, splash = 0, verbose = False ):

    hp_list = [27,32,37,43,49,55,60,67,76,60]
    hp = float(hp_list[wave-1] - reds*3 - splash)
    
    def poison_ticks(wave, poison_times = []):
        hp_list = [27,32,37,43,49,55,60,67,76,60]
        hp = float(hp_list[wave-1])
        ticks = []
        for i,j in enumerate(poison_times):
            if i == len(poison_times)-1:
                ticks.append((j,4,'manual'))
            elif poison_times[1+i] - j >= 3:
                k = j
                count = 0
                while k <= poison_times[i+1]:
                    dmg = max(0 , 4 - (count//5))
                    
                    if not k==j:
                        count +=1
                        ticks.append((k,dmg,'natural'))
                    else:
                        ticks.append((k,dmg,'manual'))
                    k += 3
            else:
                ticks.append((j,4,'manual'))
        count = 0
        while len(ticks) < hp:
            dmg = max(0 , 4 - (count//5))
            ticks.append((ticks[-1][0] + 3 , dmg,'natural'))
            count +=1
        return list(map(lambda x : (float(x[0]),x[1],x[2]) , ticks))
    
    
    ticks = poison_ticks(wave,ticks)
    
    counter = 0
    if spawn == None:
        spawn = ticks[0][0] - 3
    while hp > 0:
        if counter >= len(ticks):
            print('Does not die')
            return 
        hp += abs(ticks[counter][0] - spawn)//60
        hp -= ticks[counter][1]
        if verbose == True:
            print('Time: ',ticks[counter][0],'     Health: ',hp,'     Damage: ',ticks[counter][1],'     Type: ',ticks[counter][2])

        counter +=1
    time = ticks[counter-1][0] + 0.6
    print()
    print('Healer dies at: ', round(time,1))
    return
