import {COLORS_LIGHT_THEME, FONTS, SCREENS} from '../Constants';
import {
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  checkLogin,
  internetHandler,
  loginFacebook,
  loginGoogle,
} from '../actions/LoginAction';

import Image from 'react-native-fast-image';
import LinearGradient from 'react-native-linear-gradient';
import {Loading} from '../components';
import NetInfo from '@react-native-community/netinfo';
import React from 'react';
import SplashScreen from 'react-native-splash-screen';
import changeNavigationBarColor from 'react-native-navigation-bar-color';
import {connect} from 'react-redux';

class Login extends React.PureComponent {
  componentDidMount = async () => {
    changeNavigationBarColor(COLORS_LIGHT_THEME.THEME2, false);
    this.props.checkLogin(this.onLoginSuccess, this.onForceUpdate);
    SplashScreen.hide();
    NetInfo.fetch().then((state) =>
      this.props.internetHandler(state.isInternetReachable),
    );
    NetInfo.addEventListener((state) =>
      this.props.internetHandler(state.isInternetReachable),
    );
  };

  onLoginSuccess = () => {
    if (this.props.first_login) {
      this.props.navigation.replace(SCREENS.AppIntroSlider);
    } else {
      this.props.navigation.replace(SCREENS.Main);
    }
  };

  onForceUpdate = () => {
    this.props.navigation.replace(SCREENS.ForceUpdate);
  };

  renderGoogleButton() {
    return (
      <TouchableOpacity
        activeOpacity={1}
        style={styles.GoogleButtonStyle}
        onPress={() => {
          if (!this.props.facebookLoading && !this.props.googleLoading)
            this.props.loginGoogle(this.onLoginSuccess);
        }}>
        <View
          style={{
            height: 40,
            paddingHorizontal: 20,
            alignItems: 'center',
            justifyContent: 'center',
            margin: 5,
            elevation: 5,
            borderRadius: 7,
            backgroundColor: COLORS_LIGHT_THEME.LIGHT,
          }}>
          <Image
            source={require('../../assets/icons/google.png')}
            style={{height: 28, width: 28}}
          />
        </View>
        <View style={{flex: 3, alignItems: 'center', justifyContent: 'center'}}>
          {this.props.googleLoading ? (
            <Loading size={48} />
          ) : (
            <Text style={styles.GoogleButtonTextStyle}>
              Sign in with Google
            </Text>
          )}
        </View>
        {this.props.googleLoading ? (
          <View style={{height: 1, width: 28 + 20 * 2}} />
        ) : null}
      </TouchableOpacity>
    );
  }

  renderFacebookButton() {
    return (
      <TouchableOpacity
        activeOpacity={1}
        style={styles.FacebookButtonStyle}
        onPress={() => {
          if (!this.props.facebookLoading && !this.props.googleLoading)
            this.props.loginFacebook(this.onLoginSuccess);
        }}>
        <View
          style={{
            height: 40,
            paddingHorizontal: 20,
            alignItems: 'center',
            margin: 5,
            borderRadius: 7,
            elevation: 5,
            backgroundColor: COLORS_LIGHT_THEME.FACEBOOK_BLUE,
            justifyContent: 'center',
          }}>
          <Image
            source={require('../../assets/icons/facebook.png')}
            style={{height: 28, width: 28}}
          />
        </View>
        <View style={{flex: 3, alignItems: 'center', justifyContent: 'center'}}>
          {this.props.facebookLoading ? (
            <Loading size={48} white={false} />
          ) : (
            <Text style={styles.FacebookButtonTextStyle}>
              Continue with Facebook
            </Text>
          )}
        </View>
        {this.props.facebookLoading ? (
          <View style={{height: 1, width: 28 + 20 * 2}} />
        ) : null}
      </TouchableOpacity>
    );
  }

  renderPolicy() {
    return (
      <TouchableOpacity
        style={{alignSelf: 'center'}}
        onPress={() => {
          this.props.navigation.navigate(SCREENS.Policy, {
            navBar: COLORS_LIGHT_THEME.THEME2,
          });
        }}>
        <Text
          style={{
            fontSize: 10,
            textDecorationLine: 'underline',
            fontFamily: FONTS.HELVETICA_NEUE,
            color: COLORS_LIGHT_THEME.LIGHT,
          }}>
          T&C and Policies
        </Text>
      </TouchableOpacity>
    );
  }

  renderLogin() {
    if (this.props.loading) {
      return (
        <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
          <Loading white size={128} />
        </View>
      );
    }
    return (
      <View style={{flex: 1, justifyContent: 'flex-end', alignItems: 'center'}}>
        <View
          style={{
            flex: 2,
            justifyContent: 'center',
            alignItems: 'center',
            flexWrap: 'wrap',
            paddingHorizontal: 80,
          }}>
          <Image
            style={{height: 200, width: 200}}
            source={require('../../assets/images/logo_light.png')}
          />
          {this.props.loading ? null : (
            <Text style={styles.InfoTextStyle}>
              ALL NEW PLATFORM FOR SHARING KNOWLEDGE
            </Text>
          )}
        </View>

        <View
          style={{
            padding: 10,
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
          }}>
          {this.renderGoogleButton()}
          {this.renderFacebookButton()}
          {/* {this.renderTwitterButton()} */}
        </View>

        {this.renderPolicy()}
      </View>
    );
  }

  render() {
    return (
      <LinearGradient
        colors={[COLORS_LIGHT_THEME.THEME1, COLORS_LIGHT_THEME.THEME2]}
        style={{flex: 1}}>
        <StatusBar
          barStyle="light-content"
          backgroundColor={COLORS_LIGHT_THEME.THEME1}
        />

        {this.renderLogin()}
      </LinearGradient>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    googleLoading: state.login.googleLoading,
    facebookLoading: state.login.facebookLoading,
    loading: state.login.loading,

    first_login: state.chat.first_login,
  };
};

export default connect(mapStateToProps, {
  loginGoogle,
  loginFacebook,
  checkLogin,
  internetHandler,
})(Login);

const styles = StyleSheet.create({
  UpdateText: {
    fontFamily: FONTS.RALEWAY,
    fontSize: 14,
    color: COLORS_LIGHT_THEME.LIGHT,
  },
  GoogleButtonStyle: {
    borderRadius: 12,
    width: '75%',
    height: 50,
    backgroundColor: COLORS_LIGHT_THEME.LIGHT,
    margin: 5,
    elevation: 7,
    flexDirection: 'row',
  },
  FacebookButtonStyle: {
    borderRadius: 12,
    width: '75%',
    height: 50,
    backgroundColor: COLORS_LIGHT_THEME.LIGHT,
    margin: 5,
    elevation: 7,
    flexDirection: 'row',
  },
  GoogleButtonTextStyle: {
    color: COLORS_LIGHT_THEME.LESS_DARK,
    fontFamily: FONTS.PRODUCT_SANS,
    marginHorizontal: 5,
    fontSize: 17,
  },
  FacebookButtonTextStyle: {
    color: COLORS_LIGHT_THEME.LESS_DARK,
    fontFamily: FONTS.PRODUCT_SANS,
    fontSize: 16,
  },
  InfoTextStyle: {
    color: COLORS_LIGHT_THEME.LIGHT,
    fontSize: 16,
    fontFamily: FONTS.ROBOTO_BOLD,
    flexWrap: 'wrap',
    textAlign: 'center',
  },
});
