import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import {connect} from 'react-redux';
import Image from 'react-native-fast-image';
import LottieView from 'lottie-react-native';
import LinearGradient from 'react-native-linear-gradient';
import changeNavigationBarColor from 'react-native-navigation-bar-color';

import Slider from './AppIntroSlider';
import {Dropdown} from '../../components';
import {settingsChangeFavoriteCategory} from '../../actions/SettingsAction';
import {setupComplete} from '../../actions/ChatAction';
import {changeTheme} from '../../actions/SettingsAction';
import {FONTS, ALL_CATEGORIES, SCREENS} from '../../Constants';

class AppIntroSlider extends React.Component {
  componentDidMount() {
    const {COLORS} = this.props;
    changeNavigationBarColor(COLORS.LIGHT, COLORS.IS_LIGHT_THEME);
    StatusBar.setBackgroundColor(COLORS.LIGHT);
    StatusBar.setBarStyle(
      COLORS.IS_LIGHT_THEME ? 'dark-content' : 'light-content',
    );
  }

  changeTheme() {
    const {COLORS} = this.props;
    const oppositeTheme = COLORS.IS_LIGHT_THEME ? 'dark' : 'light';
    changeNavigationBarColor(COLORS.DARK, !COLORS.IS_LIGHT_THEME);
    StatusBar.setBackgroundColor(COLORS.DARK);
    StatusBar.setBarStyle(
      !COLORS.IS_LIGHT_THEME ? 'dark-content' : 'light-content',
    );
    this.props.changeTheme(oppositeTheme);
  }

  renderThemeButton() {
    const {COLORS} = this.props;
    const oppositeTheme = COLORS.IS_LIGHT_THEME ? 'dark' : 'light';
    return (
      <TouchableOpacity
        style={{alignSelf: 'center', marginTop: 30}}
        activeOpacity={1}
        onPress={this.changeTheme.bind(this)}>
        <View
          style={{
            paddingVertical: 8,
            paddingHorizontal: 15,
            borderRadius: 8,
            borderWidth: 2,
            backgroundColor: COLORS.IS_LIGHT_THEME
              ? COLORS.LIGHT
              : COLORS.LESS_LIGHT,
            borderColor: COLORS.IS_LIGHT_THEME ? '#f953c6' : '#6DD5FA',
          }}>
          <Text
            style={{
              fontFamily: FONTS.RALEWAY_BOLD,
              fontSize: 16,
              color: COLORS.IS_LIGHT_THEME ? '#f953c6' : '#6DD5FA',
            }}>
            {`Switch To ${oppositeTheme} THEME`.toUpperCase()}
          </Text>
        </View>
      </TouchableOpacity>
    );
  }

  getSlide1 = () => ({
    key: '0',
    fullyCustom: true,
    source: (
      <View style={[styles.Slide1View, {backgroundColor: COLORS.LIGHT}]}>
        <Text
          style={[styles.Slide1WelcomeText, {color: this.props.COLORS.DARK}]}>
          WELCOME
        </Text>
        <Text
          style={[styles.Slide1Name, {color: this.props.COLORS.LESSER_DARK}]}>
          {this.props.data.name.split(' ')[0]}
        </Text>
      </View>
    ),
  });

  getSlide2 = () => ({
    key: '1',
    title: 'What is Geek House?',
    source: require('../../../assets/images/welcome/thinking.png'),
    text: 'Geek House is a knowledge\nplatform in simple terms',
    color: this.props.COLORS.LIGHT,
    boxColors: ['rgb(255, 218, 45)', 'rgb(253, 191,0)'],
  });

  getSlide3 = () => ({
    key: '3',
    title: 'Concept of Articles',
    source: require('../../../assets/images/welcome/reading.png'),
    text:
      'You can simply search the articles of your choice and read them. You can also write your own articles',
    color: this.props.COLORS.LIGHT,
    boxColors: ['#2193b0', '#6dd5ed'],
  });

  getSlide4 = () => ({
    key: '4',
    title: 'Get in Touch',
    text:
      'Geek House lets you chat with people having similar interest ar yours, so you can never stop talking',
    source: require('../../../assets/images/welcome/chatting.png'),
    color: this.props.COLORS.LIGHT,
    boxColors: ['#11ad8e', '#19dc98'],
  });

  getSlide5 = () => {
    const {COLORS} = this.props;
    allCategories = ALL_CATEGORIES.map((value) => ({value}));
    return {
      key: '2',
      title: 'Before we Begin',
      customSource: true,
      text:
        'Select your favorite category of topic from the given ones and choose your preferred theme, you can change these easily in the settings later',
      source: (
        <View style={styles.Slide3View}>
          <Dropdown
            COLORS={COLORS}
            data={allCategories}
            label="Category Selection"
            value="Select One"
            itemCount={6}
            onChangeText={(selected_category) => {
              this.props.settingsChangeFavoriteCategory(selected_category);
            }}
          />
          {this.renderThemeButton()}
        </View>
      ),
      color: COLORS.LIGHT,
      boxColors: ['#ec008c', '#fc6767'],
    };
  };

  renderBottom = ({item}) => {
    const {
      color,
      fullyCustom,
      source,
      title,
      customSource,
      boxColors,
      text,
    } = item;

    if (fullyCustom) {
      return source;
    }
    return (
      <View style={[styles.BottomCard, {backgroundColor: color}]}>
        <Text
          style={[
            styles.BottomCardText,
            {color: this.props.COLORS.LESSER_DARK},
          ]}>
          {title}
        </Text>
        {customSource ? (
          source
        ) : (
          <View style={{height: 256, width: '100%'}}>
            <Image style={{flex: 1}} source={source} resizeMode="contain" />
          </View>
        )}
        <LinearGradient
          start={{x: 0, y: 1}}
          end={{x: 1, y: 1}}
          colors={boxColors}
          style={styles.BottomGradient}>
          <Text
            style={[
              styles.BottomGradientText,
              {color: this.props.COLORS.LIGHT},
            ]}>
            {text}
          </Text>
        </LinearGradient>
      </View>
    );
  };

  renderNextButton = () => {
    const {COLORS} = this.props;
    return (
      <TouchableOpacity
        style={[styles.NextButton, {backgroundColor: COLORS.LIGHT}]}
        activeOpacity={0.8}
        onPress={() => this.appIntroSlider._onNextPress()}>
        <Text style={{fontFamily: FONTS.GOTHAM_BLACK, color: '#f953c6'}}>
          NEXT
        </Text>
      </TouchableOpacity>
    );
  };

  renderDoneButton = () => {
    const {selected_category} = this.props;
    return (
      <TouchableOpacity
        disabled={!selected_category}
        style={[
          styles.DoneButton,
          {
            backgroundColor: COLORS.LIGHT,
            borderColor: selected_category ? '#f953c6' : COLORS.GRAY,
          },
        ]}
        activeOpacity={0.8}
        onPress={this.onDone}>
        <Text
          style={{
            fontFamily: FONTS.GOTHAM_BLACK,
            color: selected_category ? '#f953c6' : COLORS.GRAY,
          }}>
          DONE
        </Text>
      </TouchableOpacity>
    );
  };

  onDone = () => {
    this.props.setupComplete();
    this.props.navigation.replace(SCREENS.Main);
  };

  render() {
    const {COLORS} = this.props;
    const slides = [
      this.getSlide1(),
      this.getSlide2(),
      this.getSlide3(),
      this.getSlide4(),
      this.getSlide5(),
    ];
    return (
      <Slider
        ref={(appIntroSlider) => (this.appIntroSlider = appIntroSlider)}
        renderItem={this.renderBottom}
        slides={slides}
        activeDotStyle={{backgroundColor: COLORS.LIGHT_BLUE}}
        renderNextButton={this.renderNextButton}
        renderDoneButton={this.renderDoneButton}
      />
    );
  }
}

const mapStateToProps = (state) => {
  return {
    data: state.login.data,

    selected_category: state.home.selected_category,

    first_login: state.chat.first_login,
    COLORS: state.chat.COLORS,
  };
};

export default connect(mapStateToProps, {
  settingsChangeFavoriteCategory,
  setupComplete,
  changeTheme,
})(AppIntroSlider);

const styles = StyleSheet.create({
  Slide1View: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  Slide1WelcomeText: {
    fontFamily: FONTS.RALEWAY_LIGHT,
    fontSize: 20,
  },
  Slide1Name: {
    fontFamily: FONTS.RALEWAY_BOLD,
    fontSize: 42,
  },
  Slide2View: {
    width: 256,
    height: 256,
    justifyContent: 'center',
    alignItems: 'center',
  },
  Slide3View: {
    width: '100%',
    height: 256,
    paddingHorizontal: 20,
    justifyContent: 'center',
  },
  BottomCard: {
    flex: 1,
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  BottomCardText: {
    fontFamily: FONTS.RALEWAY,
    fontSize: 24,
  },
  BottomGradient: {
    height: 150,
    width: '80%',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    marginBottom: 40,
    paddingHorizontal: 15,
  },
  BottomGradientText: {
    fontFamily: FONTS.LATO_BOLD,
    fontSize: 18,
    textAlign: 'center',
  },
  NextButton: {
    padding: 10,
    borderWidth: 2,
    borderColor: '#f953c6',
    borderRadius: 10,
    elevation: 4,
  },
  DoneButton: {
    padding: 10,
    borderWidth: 2,
    borderRadius: 10,
    elevation: 4,
  },
});
