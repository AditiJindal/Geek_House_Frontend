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
import Icon from 'react-native-vector-icons/Feather';
import LinearGradient from 'react-native-linear-gradient';
import ShimmerPlaceHolder from 'react-native-shimmer-placeholder';
import changeNavigationBarColor from 'react-native-navigation-bar-color';
import ShadowView from 'react-native-simple-shadow-view';

import {
  Avatar,
  Ripple,
  Loading,
  RaisedText,
  ArticleTile,
  ArticleInfo,
} from '../components';
import {logout, getWelcome, exploreSearch} from '../actions/HomeAction';
import {getHumanTime, getRingColor, getDynamicLink} from '../utilities';
import {
  FONTS,
  COLORS_LIGHT_THEME,
  CATEGORY_IMAGES,
  LATEST_APP_VERSION,
  ALL_CATEGORIES,
  SCREENS,
} from '../Constants';

class Home extends React.PureComponent {
  state = {infoVisible: false, articleData: {}};

  componentDidMount() {
    getDynamicLink(this.props.navigation);
    if (this.props.loading) {
      this.props.getWelcome(() => this.props.navigation.replace(SCREENS.Login));
    }
  }

  renderArticleInfo() {
    const {articleData, infoVisible} = this.state;

    return (
      <ArticleInfo
        navigation={this.props.navigation}
        onBackdropPress={() => {
          this.setState({infoVisible: false});
        }}
        isVisible={infoVisible}
        article_id={articleData.article_id}
        // for preview
        preview_contents={articleData.preview_contents}
        topic={articleData.topic}
        category={articleData.category}
      />
    );
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
          <Icon name="menu" color={COLORS.DARK} size={16} />
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
    const {COLORS, theme} = this.props;
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
                <ArticleTile
                  size={180}
                  data={item}
                  onPress={() =>
                    this.setState({infoVisible: true, articleData: item})
                  }
                  COLORS={COLORS}
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
        {this.renderArticleInfo()}
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

        <LinearGradient
          style={{borderRadius: 8, margin: 15}}
          colors={[
            COLORS_LIGHT_THEME.LIGHT_BLUE,
            COLORS_LIGHT_THEME.DARK_BLUE,
          ]}>
          <Ripple
            containerStyle={{borderRadius: 8}}
            style={{
              justifyContent: 'center',
              alignItems: 'center',
              padding: 10,
            }}
            onPress={() => {
              this.props.getWelcome(() =>
                this.props.navigation.replace(SCREENS.Login),
              );
            }}>
            <Text
              style={{
                fontFamily: FONTS.HELVETICA_NEUE,
                fontSize: 24,
                color: COLORS_LIGHT_THEME.LIGHT,
              }}>
              {'Retry'}
            </Text>
          </Ripple>
        </LinearGradient>
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
                  containerStyle={{
                    height: 130,
                    width: 160,
                    elevation: 8,
                    backgroundColor: COLORS.DARK_GRAY,
                    borderRadius: 7,
                  }}
                  style={{flex: 1}}
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
    return (
      <View style={{flex: 1, backgroundColor: COLORS.LIGHT}}>
        <StatusBar
          barStyle={COLORS.THEME === 'light' ? 'dark-content' : 'light-content'}
          backgroundColor={COLORS.LIGHT}
        />
        {changeNavigationBarColor(COLORS.LIGHT, this.props.theme === 'light')}
        {changeNavigationBarColor(statusBarColor, this.props.theme === 'light')}
        {this.renderHeader()}
        {this.renderHome()}
      </View>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    data: state.login.data,
    authtoken: state.login.authtoken,

    error: state.home.error,
    loading: state.home.loading,
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
