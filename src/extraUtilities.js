import dynamicLinks from '@react-native-firebase/dynamic-links';
import queryString from 'query-string';
import {Actions} from 'react-native-router-flux';

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

export const getDynamicLink = async () => {
  const response = await dynamicLinks().getInitialLink()
  if (response && response.url){
    const result = queryString.parseUrl(response.url)
    const {query} = result;
    switch(query.type){
      case "article":
          Actions.jump('notification_article', {article_id: query.article_id})

      default:
        return null;
    }
  }
}

