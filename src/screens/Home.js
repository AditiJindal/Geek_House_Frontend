import React from 'react';
import {
  View,
  StyleSheet,
  Text,
  StatusBar,
  FlatList,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import {connect} from 'react-redux';
import _ from 'lodash';
import Image from 'react-native-fast-image';
import LottieView from 'lottie-react-native';
import {Icon} from 'react-native-elements';
import LinearGradient from 'react-native-linear-gradient';
import ShimmerPlaceHolder from 'react-native-shimmer-placeholder';
import changeNavigationBarColor from 'react-native-navigation-bar-color';
import ShadowView from 'react-native-simple-shadow-view';
import analytics from '@react-native-firebase/analytics';

import {
  Avatar,
  ArticleTileAds,
  Ripple,
  Loading,
  RaisedText,
  ArticleTile,
  Dropdown,
  AppIntroSlider,
} from '../components';
import {settingsChangeFavoriteCategory} from '../actions/SettingsAction';
import {setupComplete} from '../actions/ChatAction';
import {
  logout,
  getWelcome,
  setAuthToken,
  exploreSearch,
} from '../actions/HomeAction';
import {getHumanTime, getRingColor, getDynamicLink} from '../utilities';
import {
  FONTS,
  COLORS_LIGHT_THEME,
  CATEGORY_IMAGES,
  LATEST_APP_VERSION,
  ALL_CATEGORIES,
  SCREENS,
  SCREEN_CLASSES,
} from '../Constants';

class Home extends React.PureComponent {
  state = {adIndex: 0};

  constructor() {
    super();
    this.slides = [];
  }

  componentDidMount() {
    this.props.setAuthToken();
    setAuthToken();
    getDynamicLink(this.props.navigation);
    analytics().logScreenView({
      screen_class: SCREEN_CLASSES.Home,
      screen_name: SCREENS.Home,
    });
    if (this.props.loading) {
      this.props.getWelcome(() => this.props.navigation.replace(SCREENS.Login));
      analytics().logTutorialBegin();
    }
    let new_data = [];
    ALL_CATEGORIES.map((item) => {
      new_data.push({value: item});
    });
    this.slides = [
      {
        fullyCustom: true,
        source: (
          <View
            style={{
              flex: 1,
              justifyContent: 'center',
              alignItems: 'center',
              backgroundColor: COLORS_LIGHT_THEME.LIGHT,
            }}>
            <Text
              style={{
                fontFamily: FONTS.RALEWAY_LIGHT,
                fontSize: 20,
                color: COLORS_LIGHT_THEME.DARK,
              }}>
              WELCOME
            </Text>
            <Text
              style={{
                fontFamily: FONTS.RALEWAY_BOLD,
                fontSize: 42,
                color: COLORS_LIGHT_THEME.LESSER_DARK,
              }}>
              {this.props.data.name.split(' ')[0]}
            </Text>
          </View>
        ),
      },
      {
        key: '1',
        title: 'What is Geek House?',
        customSource: true,
        text: 'Geek House is a knowledge\nplatform in simple terms',
        source: (
          <View
            style={{
              width: 256,
              height: 256,
              justifyContent: 'center',
              alignItems: 'center',
            }}>
            <Image
              style={{width: 128, height: 128}}
              source={require('../../assets/images/welcome/light-bulb.png')}
            />
          </View>
        ),
        color: COLORS_LIGHT_THEME.LIGHT,
        boxColors: ['rgb(255, 218, 45)', 'rgb(253, 191,0)'],
      },
      {
        key: '2',
        title: 'Before we Begin',
        customSource: true,
        text:
          'Select your favourite category of topic from the given ones, you can change this easily in the settings later',
        source: (
          <View
            style={{
              width: '100%',
              height: 256,
              paddingHorizontal: 20,
              justifyContent: 'center',
            }}>
            <Dropdown
              COLORS={COLORS_LIGHT_THEME}
              data={new_data}
              label="Category Selection"
              value="Select One"
              itemCount={6}
              onChangeText={(selected_category) => {
                this.props.settingsChangeFavoriteCategory(selected_category);
              }}
            />
          </View>
        ),
        color: COLORS_LIGHT_THEME.LIGHT,
        boxColors: ['#ec008c', '#fc6767'],
      },
      {
        key: '3',
        title: 'Concept of Articles',
        text:
          'You can simply search the articles of your choice and read them. You can also write your own articles',
        source: require('../../assets/animations/welcome/book.json'),
        color: COLORS_LIGHT_THEME.LIGHT,
        boxColors: ['#4776E6', '#3931ac'], //"#8E54E9"]
      },
      {
        key: '4',
        title: 'Get in Touch',
        text:
          'Geek House lets you chat with people having similar interest ar yours, so you can never stop talking',
        source: require('../../assets/animations/welcome/chat.json'),
        color: COLORS_LIGHT_THEME.LIGHT,
        boxColors: ['#2193b0', '#6dd5ed'],
      },
    ];
  }

  renderHeader() {
    const {
      COLORS,
      data: {name},
    } = this.props;

    return (
      <ShadowView
        style={{
          ...styles.GeekHouseView,
          backgroundColor:
            this.props.theme === 'light' ? COLORS.LIGHT : COLORS.LESS_LIGHT,
        }}>
        <TouchableOpacity
          onPress={() => this.props.navigation.openDrawer()}
          style={{
            padding: 10,
            backgroundColor:
              this.props.theme === 'light' ? '#F8F8F8' : '#282828',
            borderRadius: 100,
          }}>
          <Icon name="menu" color={COLORS.DARK} size={16} type={'feather'} />
        </TouchableOpacity>
        <View style={{flex: 1, marginLeft: 10}}>
          <Text style={{...styles.TextStyle, color: COLORS.DARK}}>home</Text>
          <Text
            style={{
              fontFamily: FONTS.RALEWAY,
              color: COLORS.DARK,
              fontSize: 12,
            }}>
            {name ? getHumanTime(name.split(' ')[0]) : ''}
          </Text>
        </View>
        {this.renderAvatar()}
      </ShadowView>
    );
  }

  getInitials(name) {
    if (!name) {
      return null;
    }
    let initials = name.match(/\b\w/g) || [];
    initials = (
      (initials.shift() || '') + (initials.pop() || '')
    ).toUpperCase();
    return initials;
  }

  imageUrlCorrector(image_url) {
    if (!this.props.image_adder) {
      return '';
    }
    if (image_url.substring(0, 4) !== 'http') {
      image_url = this.props.image_adder + image_url;
    }
    return image_url;
  }

  renderAvatar() {
    const {COLORS, loading, theme, error, welcomeData} = this.props;

    const isUpdateAvailable =
      this.props.welcomeData.latestVersion > LATEST_APP_VERSION;

    if (error) {
      return null;
    }

    if (loading) {
      return <Loading size={42} white={theme !== 'light'} />;
    }

    return (
      <View>
        {isUpdateAvailable ? (
          <View
            style={{
              height: 10,
              width: 10,
              borderRadius: 5,
              borderColor: COLORS.LESS_LIGHT,
              borderWidth: 1,
              position: 'absolute',
              top: 1,
              right: 1,
              backgroundColor: COLORS.YELLOW,
              elevation: 6,
            }}
          />
        ) : null}
        <Avatar
          size={42}
          uri={this.imageUrlCorrector(this.props.data.image_url)}
          onPress={() => this.props.navigation.navigate(SCREENS.Settings)}
          ring_color={getRingColor(welcomeData.userXP)}
        />
      </View>
    );
  }

  renderWelcome() {
    const {welcome_header, welcome_body} = this.props.welcomeData;
    const {COLORS} = this.props;
    return (
      <View
        style={{
          justifyContent: 'flex-start',
          alignItems: 'flex-end',
          zIndex: 100,
        }}>
        <View style={{zIndex: 120}}>
          <ShimmerPlaceHolder
            colorShimmer={COLORS.SHIMMER_COLOR}
            autoRun={true}
            visible={!this.props.loading}
            style={{
              height: 50,
              borderRadius: 6,
              marginRight: 25,
              marginTop: 15,
              elevation: 6,
            }}
            duration={650}>
            <RaisedText
              text={welcome_header}
              animationEnabled={this.props.animationOn}
              theme={this.props.theme}
              COLORS={COLORS}
            />
          </ShimmerPlaceHolder>
        </View>
        {this.props.loading ? (
          <View
            style={{
              justifyContent: 'flex-end',
              alignItems: 'flex-end',
              padding: 10,
              marginRight: 15,
            }}>
            <ShimmerPlaceHolder
              colorShimmer={COLORS.SHIMMER_COLOR}
              style={{
                marginBottom: 5,
                width: 230,
                borderRadius: 4,
                height: 18,
                elevation: 5,
              }}
              autoRun={true}
              duration={700}
            />
            <ShimmerPlaceHolder
              colorShimmer={COLORS.SHIMMER_COLOR}
              style={{
                marginBottom: 5,
                width: 190,
                borderRadius: 4,
                height: 18,
                elevation: 5,
              }}
              autoRun={true}
              duration={900}
            />
            <ShimmerPlaceHolder
              colorShimmer={COLORS.SHIMMER_COLOR}
              style={{
                marginBottom: 5,
                width: 180,
                borderRadius: 4,
                height: 18,
                elevation: 5,
              }}
              autoRun={true}
              duration={1100}
            />
            <ShimmerPlaceHolder
              colorShimmer={COLORS.SHIMMER_COLOR}
              style={{
                marginBottom: 5,
                width: 250,
                borderRadius: 4,
                height: 18,
                elevation: 5,
              }}
              autoRun={true}
              duration={1300}
            />
          </View>
        ) : (
          <View style={{flex: 1, padding: 15}}>
            <View
              style={{
                borderColor: COLORS.LIGHT_GRAY,
                borderBottomWidth: 0.5,
                padding: 15,
                zIndex: 0,
              }}>
              <Text style={{...styles.WelcomeBody, color: COLORS.LESS_DARK}}>
                {welcome_body}
              </Text>
            </View>
          </View>
        )}
      </View>
    );
  }

  renderArticleTiles() {
    data_list = this.props.welcomeData.popular_topics;
    const {COLORS, theme, adsManager, canShowAdsRemote} = this.props;
    if (!this.state.adIndex && data_list && data_list.length > 2) {
      this.setState({adIndex: _.random(2, data_list.length - 1)});
    }
    return (
      <>
        <FlatList
          data={data_list}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item.article_id.toString()}
          renderItem={({item, index}) => {
            return (
              <View
                style={{
                  marginVertical: 15,
                  marginHorizontal: 5,
                  flexDirection: 'row',
                  alignItems: 'center',
                }}>
                {index === this.state.adIndex &&
                adsManager &&
                canShowAdsRemote ? (
                  <View style={{marginRight: 10}}>
                    <ArticleTileAds
                      theme={theme}
                      size={180}
                      COLORS={COLORS}
                      adsManager={adsManager}
                    />
                  </View>
                ) : null}
                <ArticleTile
                  data={item}
                  size={180}
                  theme={theme}
                  COLORS={COLORS}
                  navigation={this.props.navigation}
                />
              </View>
            );
          }}
        />
        <View style={{width: 1, height: 100}} />
      </>
    );
  }

  renderPopularArticles() {
    const {COLORS, theme, animationOn, loading} = this.props;
    const data_list = this.props.welcomeData.popular_topics;
    if (loading || data_list.length) {
      return (
        <View
          style={{
            justifyContent: 'flex-start',
            alignItems: 'flex-end',
            paddingTop: 0,
            flex: 1,
          }}>
          <ShimmerPlaceHolder
            colorShimmer={COLORS.SHIMMER_COLOR}
            autoRun={true}
            visible={!loading}
            style={{
              height: 50,
              borderRadius: 6,
              elevation: 6,
              marginRight: 25,
              marginTop: 5,
            }}
            duration={750}>
            <RaisedText
              text={'Popular Articles'}
              animationEnabled={animationOn}
              theme={theme}
              COLORS={COLORS}
            />
          </ShimmerPlaceHolder>
          {loading ? (
            <ScrollView
              horizontal={true}
              showsHorizontalScrollIndicator={false}>
              <ShimmerPlaceHolder
                colorShimmer={COLORS.SHIMMER_COLOR}
                visible={false}
                style={{
                  width: 175,
                  height: 175,
                  borderRadius: 8,
                  margin: 15,
                  marginHorizontal: 5,
                  elevation: 3,
                }}
              />
              <ShimmerPlaceHolder
                colorShimmer={COLORS.SHIMMER_COLOR}
                visible={false}
                style={{
                  width: 175,
                  height: 175,
                  borderRadius: 8,
                  margin: 15,
                  marginHorizontal: 5,
                  elevation: 3,
                }}
              />
              <ShimmerPlaceHolder
                colorShimmer={COLORS.SHIMMER_COLOR}
                visible={false}
                style={{
                  width: 175,
                  height: 175,
                  borderRadius: 8,
                  margin: 15,
                  marginHorizontal: 5,
                  elevation: 3,
                }}
              />
            </ScrollView>
          ) : (
            this.renderArticleTiles()
          )}
        </View>
      );
    }
  }

  renderHome() {
    if (this.props.error) {
      return this.renderError();
    }
    return (
      <View style={{flex: 1}}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{flexGrow: 1}}>
          <View style={{height: 70, width: 1}} />
          {this.renderWelcome()}
          {this.renderExploreCategory()}
          {this.renderPopularArticles()}
        </ScrollView>
      </View>
    );
  }

  renderError() {
    const {COLORS} = this.props;
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          padding: 40,
        }}>
        <Text style={{...styles.ErrorTextStyle, color: COLORS.GRAY}}>
          {this.props.error}
        </Text>
        <Ripple
          onPress={() => {
            this.props.getWelcome(() =>
              this.props.navigation.replace(SCREENS.Login),
            );
          }}>
          <LinearGradient
            style={{
              justifyContent: 'center',
              alignItems: 'center',
              padding: 10,
              elevation: 7,
              backgroundColor: COLORS.LIGHT_BLUE,
              borderRadius: 8,
              margin: 15,
            }}
            colors={[
              COLORS_LIGHT_THEME.LIGHT_BLUE,
              COLORS_LIGHT_THEME.DARK_BLUE,
            ]}>
            <Text
              style={{
                fontFamily: FONTS.HELVETICA_NEUE,
                fontSize: 24,
                color: COLORS_LIGHT_THEME.LIGHT,
              }}>
              {'Retry'}
            </Text>
          </LinearGradient>
        </Ripple>
      </View>
    );
  }

  _renderItem(item) {
    if (item.fullyCustom) {
      return item.source;
    }
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'space-around',
          alignItems: 'center',
          backgroundColor: item.color,
        }}>
        <Text
          style={{
            fontFamily: FONTS.RALEWAY,
            color: COLORS_LIGHT_THEME.LESSER_DARK,
            fontSize: 24,
          }}>
          {item.title}
        </Text>
        {item.customSource ? (
          item.source
        ) : (
          <LottieView
            autoPlay
            source={item.source}
            style={{height: 256, width: 256}}
          />
        )}
        <LinearGradient
          start={{x: 0, y: 1}}
          end={{x: 1, y: 1}}
          colors={item.boxColors}
          style={{
            backgroundColor: COLORS_LIGHT_THEME.LIGHT,
            height: 150,
            width: '80%',
            justifyContent: 'center',
            alignItems: 'center',
            borderRadius: 8,
            marginBottom: 40,
            paddingHorizontal: 15,
          }}>
          <Text
            style={{
              fontFamily: FONTS.LATO_BOLD,
              color: COLORS_LIGHT_THEME.LIGHT,
              fontSize: 18,
              textAlign: 'center',
            }}>
            {item.text}
          </Text>
        </LinearGradient>
      </View>
    );
  }

  _renderNextButton() {
    return (
      <View
        style={{
          padding: 10,
          borderWidth: 2,
          borderColor: '#f953c6',
          borderRadius: 10,
          elevation: 4,
          backgroundColor: COLORS_LIGHT_THEME.LIGHT,
        }}>
        <Text style={{fontFamily: FONTS.GOTHAM_BLACK, color: '#f953c6'}}>
          NEXT
        </Text>
      </View>
    );
  }

  _renderDoneButton() {
    return (
      <View
        style={{
          padding: 10,
          borderWidth: 2,
          borderColor: '#32cd32',
          borderRadius: 10,
          elevation: 4,
          backgroundColor: COLORS_LIGHT_THEME.LIGHT,
        }}>
        <Text style={{fontFamily: FONTS.GOTHAM_BLACK, color: '#32cd32'}}>
          DONE
        </Text>
      </View>
    );
  }

  _onDone() {
    if (this.props.selected_category) {
      this.props.setupComplete();
    } else {
      this.appIntroSlider.goToSlide(2);
    }
  }

  renderTour() {
    return (
      <View style={{flex: 1, backgroundColor: COLORS_LIGHT_THEME.LIGHT}}>
        <StatusBar
          barStyle={'dark-content'}
          backgroundColor={COLORS_LIGHT_THEME.LIGHT}
        />
        {changeNavigationBarColor(
          COLORS_LIGHT_THEME.LIGHT,
          this.props.theme === 'light',
        )}
        <AppIntroSlider
          ref={(appIntroSlider) => (this.appIntroSlider = appIntroSlider)}
          renderItem={({item}) => this._renderItem(item)}
          slides={this.slides}
          activeDotStyle={{backgroundColor: COLORS_LIGHT_THEME.LIGHT_BLUE}}
          renderNextButton={this._renderNextButton}
          renderDoneButton={this._renderDoneButton}
          onDone={() => {
            analytics().logTutorialComplete();
            this._onDone();
          }}
        />
      </View>
    );
  }

  getStatusBarColor() {
    const {COLORS, theme} = this.props;
    let barStyle = theme === 'light' ? 'dark-content' : 'light-content';
    let statusBarColor = COLORS.LIGHT;
    return {statusBarColor, barStyle};
  }

  renderExploreCategory() {
    const {COLORS, loading, animationOn, theme} = this.props;
    if (loading) {
      return null;
    }
    return (
      <View style={{alignItems: 'flex-end'}}>
        <RaisedText
          text={'Explore'}
          animationEnabled={animationOn}
          theme={theme}
          COLORS={COLORS}
        />
        <FlatList
          data={ALL_CATEGORIES}
          keyExtractor={(item) => item}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{paddingHorizontal: 5}}
          renderItem={({item}) => {
            return (
              <View style={{padding: 5, paddingBottom: 15}}>
                <Ripple
                  style={{
                    height: 130,
                    width: 160,
                    elevation: 8,
                    backgroundColor: COLORS.DARK_GRAY,
                    borderRadius: 7,
                    overflow: 'hidden',
                  }}
                  onPress={() => {
                    this.props.exploreSearch(item);
                    this.props.navigation.navigate(SCREENS.Explore);
                  }}>
                  <Image source={CATEGORY_IMAGES[item]} style={{flex: 1}} />
                  <Text
                    style={{
                      color: COLORS.DARK,
                      fontSize: 10,
                      alignSelf: 'center',
                      color: COLORS.LIGHT,
                      fontFamily: FONTS.HELVETICA_NEUE,
                      marginVertical: 3,
                    }}>
                    {item}
                  </Text>
                </Ripple>
              </View>
            );
          }}
        />
      </View>
    );
  }

  render() {
    const {COLORS} = this.props;
    const {statusBarColor} = this.getStatusBarColor();
    if (!this.props.first_login) {
      return (
        <View style={{flex: 1, backgroundColor: COLORS.LIGHT}}>
          <StatusBar
            barStyle={
              COLORS.THEME === 'light' ? 'dark-content' : 'light-content'
            }
            backgroundColor={COLORS.LIGHT}
          />
          {changeNavigationBarColor(COLORS.LIGHT, this.props.theme === 'light')}
          {changeNavigationBarColor(
            statusBarColor,
            this.props.theme === 'light',
          )}
          {this.renderHeader()}
          {this.renderHome()}
        </View>
      );
    } else {
      return this.renderTour();
    }
  }
}

const mapStateToProps = (state) => {
  return {
    data: state.login.data,
    authtoken: state.login.authtoken,
    first_login: state.chat.first_login,

    error: state.home.error,
    loading: state.home.loading,
    adsManager: state.home.adsManager,
    image_adder: state.home.image_adder,
    welcomeData: state.home.welcomeData,
    selected_category: state.home.selected_category,
    canShowAdsRemote: state.home.welcomeData.canShowAdsRemote,

    theme: state.chat.theme,
    COLORS: state.chat.COLORS,
    animationOn: state.chat.animationOn,
  };
};

export default connect(mapStateToProps, {
  logout,
  getWelcome,
  setAuthToken,
  settingsChangeFavoriteCategory: settingsChangeFavoriteCategory,
  setupComplete,
  exploreSearch,
})(Home);

const styles = StyleSheet.create({
  TextStyle: {
    fontSize: 20,
    fontFamily: FONTS.GOTHAM_BLACK,
  },
  AvatarTextStyle: {
    fontSize: 22,
    fontFamily: FONTS.RALEWAY_LIGHT,
  },
  LogoutButtonTextStyle: {
    color: COLORS_LIGHT_THEME.LIGHT,
    fontFamily: FONTS.RALEWAY_BOLD,
    fontSize: 16,
    marginLeft: 8,
  },
  WelcomeBody: {
    fontFamily: FONTS.HELVETICA_NEUE,
    fontSize: 16,
    textAlign: 'justify',
  },
  ErrorTextStyle: {
    fontFamily: FONTS.RALEWAY_LIGHT,
    fontSize: 24,
    textAlign: 'center',
  },
  GeekHouseView: {
    shadowColor: '#202020',
    shadowOpacity: 0.3,
    shadowOffset: {width: 0, height: 10},
    shadowRadius: 8,
    borderRadius: 10,
    position: 'absolute',
    height: 55,
    width: '92%',
    alignSelf: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    top: 10,
    zIndex: 10,
  },
});
