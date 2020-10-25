import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Linking,
  Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import changeNavigationBarColor from 'react-native-navigation-bar-color';
import LottieView from 'lottie-react-native';

import RocketAnimation from '../../assets/animations/rocket.json';
import {
  PLAY_STORE_URL,
  COLORS_LIGHT_THEME,
  FORCE_UPDATE_TEXT,
  FONTS,
} from '../Constants';

const ForceUpdate = () => {
  const screenWidth = Dimensions.get('window').width;
  StatusBar.setHidden(true);
  changeNavigationBarColor(COLORS_LIGHT_THEME.LIGHT, false);

  return (
    <View
      style={{
        flex: 1,
        justifyContent: 'space-between',
        backgroundColor: COLORS_LIGHT_THEME.LIGHT,
      }}>
      <LottieView
        autoPlay
        loop
        style={{
          width: screenWidth * 1.2,
          height: (screenWidth * 1.2 * 9) / 16,
          marginLeft: -screenWidth * 0.05,
        }}
        source={RocketAnimation}
        speed={1}
      />
      <View style={styles.ForceUpdateView} blurRadius={3}>
        <View style={styles.ForceUpdateHeadingView}>
          <Text style={styles.ForceUpdateHeading}>New Update Available</Text>
          <Icon name="upload-cloud" color={COLORS_LIGHT_THEME.DARK} size={30} />
        </View>
        <Text style={styles.ForceUpdateText}>{FORCE_UPDATE_TEXT}</Text>
        <TouchableOpacity
          onPress={() => Linking.openURL(PLAY_STORE_URL)}
          style={styles.ForceUpdateButton}>
          <Text style={styles.ForceUpdateButtonText}>UPDATE</Text>
        </TouchableOpacity>
      </View>
      <View />
    </View>
  );
};

export default ForceUpdate;

const styles = StyleSheet.create({
  ForceUpdateView: {
    margin: 20,
  },
  ForceUpdateHeadingView: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 15,
    paddingTop: 15,
    paddingBottom: 10,
  },
  ForceUpdateHeading: {
    fontFamily: FONTS.RALEWAY_BOLD,
    fontSize: 24,
    textAlign: 'center',
    color: COLORS_LIGHT_THEME.DARK,
    marginRight: 10,
  },
  ForceUpdateText: {
    fontFamily: FONTS.PRODUCT_SANS,
    fontSize: 13,
    textAlign: 'center',
    marginVertical: 10,
    marginHorizontal: 10,
    color: COLORS_LIGHT_THEME.LESS_DARK,
  },
  ForceUpdateButton: {
    backgroundColor: COLORS_LIGHT_THEME.TWITTER_BLUE,
    elevation: 5,
    padding: 5,
    margin: 5,
    borderRadius: 5,
  },
  ForceUpdateButtonText: {
    fontFamily: FONTS.PRODUCT_SANS_BOLD,
    fontSize: 20,
    color: COLORS_LIGHT_THEME.LIGHT,
    alignSelf: 'center',
  },
});
