import React from 'react';
import {View, Text, Linking} from 'react-native';
import {connect} from 'react-redux';
import analytics from '@react-native-firebase/analytics';
import {Icon} from 'react-native-elements';
import InAppReview from 'react-native-in-app-review';
import {Switch} from 'react-native-switch';

import {
  APP_VERSION,
  FONTS,
  SCREENS,
  SCREEN_CLASSES,
  COLORS_LIGHT_THEME,
  LATEST_APP_VERSION,
} from '../Constants';
import {getRingColor} from '../extraUtilities';
import {Avatar, LevelBar, Ripple} from '../components';
import {changeTheme} from '../actions/SettingsAction';

class Drawer extends React.Component {
  imageUrlCorrector(image_url) {
    if (!this.props.image_adder) {
      return '';
    }
    if (image_url.substring(0, 4) !== 'http') {
      image_url = this.props.image_adder + image_url;
    }
    return image_url;
  }

  onSettings() {
    this.props.navigation.navigate(SCREENS.Settings);
    analytics().logScreenView({
      screen_class: SCREEN_CLASSES.Settings,
      screen_name: SCREENS.Settings,
    });
  }

  onFeedback() {
    this.props.navigation.navigate(SCREENS.Feedback);
    analytics().logScreenView({
      screen_class: SCREEN_CLASSES.Feedback,
      screen_name: SCREENS.Feedback,
    });
  }

  onAboutUs() {
    this.props.navigation.navigate(SCREENS.About);
    analytics().logScreenView({
      screen_class: SCREEN_CLASSES.About,
      screen_name: SCREENS.About,
    });
  }

  onRate() {
    analytics().logEvent('app_rating');
    InAppReview.RequestInAppReview();
  }

  onNotification() {
    this.props.navigation.navigate(SCREENS.Notification);
  }

  renderProfile() {
    const {data, welcomeData, loading} = this.props;
    return (
      <View>
        <View
          style={{
            justifyContent: 'space-around',
            alignItems: 'center',
            flexDirection: 'row',
            marginTop: 10,
          }}>
          {!loading ? (
            <Avatar
              size={56}
              uri={this.imageUrlCorrector(data.image_url)}
              ring_color={getRingColor(welcomeData.userXP)}
            />
          ) : (
            <View
              style={{
                height: 42,
                width: 42,
                justifyContent: 'center',
                alignItems: 'center',
              }}>
              <Loading size={42} white={COLORS.THEME !== 'light'} />
            </View>
          )}
          <View style={{flex: 1}}>
            <Text
              style={{
                fontSize: 22,
                fontFamily: FONTS.RALEWAY_LIGHT,
                color: COLORS.DARK,
                textAlign: 'right',
              }}>
              {data.name}
            </Text>
            <Text
              style={{
                fontSize: 22,
                fontFamily: FONTS.RALEWAY_LIGHT,
                fontSize: 12,
                alignSelf: 'flex-end',
                color: COLORS.GRAY,
              }}>
              {data.email}
            </Text>
          </View>
        </View>
        <View style={{marginVertical: 20}}>
          <LevelBar COLORS={COLORS} userXP={welcomeData.userXP} />
        </View>
      </View>
    );
  }

  renderUpdateButton() {
    const {welcomeData, COLORS} = this.props;
    const isUpdateAvailable = welcomeData.latestVersion > LATEST_APP_VERSION;

    if (!isUpdateAvailable) {
      return null;
    }

    return (
      <Ripple
        rippleColor={COLORS.DARK}
        onPress={() => {
          analytics().logEvent('app_updating');
          Linking.openURL(welcomeData.playStoreUrl);
        }}
        style={{
          elevation: 3,
          paddingVertical: 10,
          paddingHorizontal: 18,
          justifyContent: 'space-between',
          alignItems: 'center',
          flexDirection: 'row',
          backgroundColor:
            COLORS.THEME === 'light' ? COLORS.LIGHT : COLORS.LESSER_LIGHT,
          borderRadius: 10,
          marginVertical: 5,
        }}>
        <View>
          <Text
            style={{
              color: COLORS_LIGHT_THEME.LIGHT,
              fontFamily: FONTS.RALEWAY_BOLD,
              fontSize: 16,
              color: COLORS.DARK,
            }}>
            New Update Available
          </Text>

          <Text
            style={{
              fontFamily: FONTS.RALEWAY_LIGHT,
              fontSize: 12,
              color: COLORS.YELLOW,
            }}>
            You are using outdated version
          </Text>
        </View>
        <Icon
          name="chevron-right"
          color={COLORS.DARK}
          size={24}
          type={'feather'}
        />
      </Ripple>
    );
  }

  renderButton(text, icon, onPress, extraText = null) {
    const {COLORS} = this.props;
    return (
      <Ripple
        rippleColor={COLORS.DARK}
        onPress={onPress}
        style={{
          elevation: 3,
          marginVertical: 5,
          justifyContent: 'flex-start',
          alignItems: 'center',
          flexDirection: 'row',
          backgroundColor:
            COLORS.THEME === 'light' ? COLORS.LIGHT : COLORS.LESSER_LIGHT,
          borderRadius: 10,
          paddingVertical: 10,
          paddingHorizontal: 18,
        }}>
        <Icon name={icon} color={COLORS.DARK} size={18} type={'feather'} />
        <Text
          style={{
            fontFamily: FONTS.RALEWAY_BOLD,
            fontSize: 16,
            marginHorizontal: 10,
            color: COLORS.DARK,
          }}>
          {text}
        </Text>
        {extraText ? (
          <View style={{flex: 1, alignItems: 'flex-end'}}>
            <Text
              style={{
                fontFamily: FONTS.PRODUCT_SANS_BOLD,
                fontSize: 10,
                color: COLORS.RED,
              }}>
              {extraText}
            </Text>
          </View>
        ) : null}
      </Ripple>
    );
  }

  renderAppVersion() {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'flex-end',
        }}>
        {this.renderThemeChangeSwitch()}
        <Text
          style={{
            fontFamily: FONTS.PRODUCT_SANS,
            fontSize: 11,
            marginLeft: 2,
            color: COLORS.GRAY,
          }}>
          {`Geek House v${APP_VERSION}`}
        </Text>
      </View>
    );
  }

  renderThemeChangeSwitch() {
    const {COLORS} = this.props;
    const oppositeTheme = COLORS.THEME === 'light' ? 'dark' : 'light';
    return (
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
        <Text
          style={{
            fontSize: 24,
            fontFamily: FONTS.PRODUCT_SANS_BOLD,
            color: COLORS.LESSER_DARK,
          }}>
          Dark Mode
        </Text>

        <Switch
          value={COLORS.THEME === 'dark'}
          onValueChange={() => {
            analytics().setUserProperties({Theme: oppositeTheme});
            this.props.changeTheme(oppositeTheme);
          }}
          backgroundActive={COLORS_LIGHT_THEME.GREEN}
          backgroundInactive={COLORS.GRAY}
          circleSize={22}
          barHeight={28}
          changeValueImmediately={true}
          innerCircleStyle={{elevation: 5}}
          switchLeftPx={3}
          switchRightPx={3}
          circleBorderWidth={0}
          circleActiveColor={COLORS_LIGHT_THEME.LIGHT}
          circleInActiveColor={COLORS_LIGHT_THEME.LIGHT}
        />
      </View>
    );
  }

  render() {
    const {COLORS, new_notifications} = this.props;
    return (
      <View style={{flex: 1, backgroundColor: COLORS.LIGHT, padding: 10}}>
        {this.renderProfile()}
        {this.renderUpdateButton()}
        {this.renderButton('settings', 'settings', this.onSettings.bind(this))}
        {this.renderButton(
          'feedback',
          'message-square',
          this.onFeedback.bind(this),
        )}
        {this.renderButton(
          'notifications',
          'bell',
          this.onNotification.bind(this),
          new_notifications ? 'NEW' : null,
        )}
        {this.renderButton('about us', 'user', this.onAboutUs.bind(this))}
        {this.renderButton('rate', 'thumbs-up', this.onRate.bind(this))}

        {this.renderAppVersion()}
      </View>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    data: state.login.data,

    loading: state.home.loading,
    welcomeData: state.home.welcomeData,
    image_adder: state.home.image_adder,
    new_notifications: !!state.home.welcomeData.notifications.length,

    COLORS: state.chat.COLORS,
  };
};

export default connect(mapStateToProps, {changeTheme})(Drawer);