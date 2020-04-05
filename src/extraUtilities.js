export const getLevel = (userXP) => {
  if (!userXP){
    return null
  }
  let level=0;
  let xpLeft = userXP;
  let levelXP = 0;
  while (true){
    levelXP = Math.ceil(150 * (level**1.5))
    xpLeft -= levelXP
    if (xpLeft<0){
      break
    }
    level++
  }

  return {level, XPToLevelUp: -xpLeft, levelXP}
}