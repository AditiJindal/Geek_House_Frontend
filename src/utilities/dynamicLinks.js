import dynamicLinks from '@react-native-firebase/dynamic-links';
import queryString from 'query-string';
import {SCREENS} from '../Constants';

export const getDynamicLink = async (navigation) => {
  const response = await dynamicLinks().getInitialLink();
  if (response && response.url) {
    const result = queryString.parseUrl(response.url);
    const {query} = result;
    switch (query.type) {
      case 'article':
        navigation.navigate(SCREENS.NotificationArticle, {
          article_id: query.article_id,
        });

      default:
        return null;
    }
  }
};
