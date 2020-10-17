export const getLevel = (userXP) => {
  if (!userXP) {
    return null;
  }
  let level = 0;
  let xpLeft = userXP;
  let levelXP = 0;
  while (true) {
    levelXP = Math.ceil(150 * level ** 1.5);
    xpLeft -= levelXP;
    if (xpLeft < 0) {
      break;
    }
    level++;
  }

  return {level, XPToLevelUp: -xpLeft, levelXP};
};

export const getRingColor = (userXP) => {
  if (!userXP) {
    return null;
  }
  // get the color of ring of the user from his XP
  const {level} = getLevel(userXP);
  let ring_color = null;

  if (level >= 5) {
    ring_color = '#C0C0C0';
  }
  if (level >= 10) {
    ring_color = '#FFD700';
  }

  return ring_color;
};
