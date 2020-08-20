import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StatusBar,
  StyleSheet,
  ScrollView,
  TextInput,
} from 'react-native';
import {connect} from 'react-redux';
import {logout} from '../actions/HomeAction';
import Loading from '../components/Loading';
import {
  setAuthToken,
  getSettingsData,
  settingsChangeFavouriteCategory,
  changeTheme,
  changeAnimationSettings,
  changeQuickRepliesSettings,
  submitName,
  changeChatWallpaper,
  changeBlurRadius,
  changeName,
  revertName,
  changeImageUrl,
} from '../actions/SettingsAction';
import {Actions} from 'react-native-router-flux';
import LevelBar from '../components/LevelBar';
import Ripple from '../components/Ripple';
import {FONTS, COLORS_LIGHT_THEME, ALL_CATEGORIES} from '../Constants';
import LinearGradient from 'react-native-linear-gradient';
import {Icon} from 'react-native-elements';
import StarRating from 'react-native-star-rating';
import {Dropdown} from '../components/Dropdown';
import changeNavigationBarColor from 'react-native-navigation-bar-color';
import {Switch} from 'react-native-switch';
import SView from 'react-native-simple-shadow-view';
import analytics from '@react-native-firebase/analytics';
import ImageSelector from '../components/ImageSelector';
import TimedAlert from '../components/TimedAlert';
import Avatar from '../components/Avatar';
import ImageResizer from 'react-native-image-resizer';
import ImageEditor from '@react-native-community/image-editor';

class Settings extends React.PureComponent {
  state = {
    blur: this.props.chat_background.blur,
  };

  componentDidMount() {
    this.props.setAuthToken();
    this.props.getSettingsData();
  }

  componentWillUnmount() {
    this.props.revertName();
  }

  getImageResize(imageSize) {
    const MAX_WIDTH = 512;
    const MAX_HEIGHT = MAX_WIDTH;

    let resize = {...imageSize};
    let ratio = imageSize.width / imageSize.height;
    if (resize.width > MAX_WIDTH) {
      resize = {width: MAX_WIDTH, height: Math.floor(MAX_WIDTH / ratio)};
    }
    if (resize.height > MAX_HEIGHT) {
      resize = {width: Math.floor(MAX_HEIGHT * ratio), height: MAX_HEIGHT};
    }
    return resize;
  }

  getCropCoordinates({width, height}) {
    // needs to be in 1:1 aspect ratio
    let originX, originY, crop;
    if (width < height) {
      const requiredHeight = width;
      const remainingHeight = height - requiredHeight;
      originX = 0;
      originY = Math.floor(remainingHeight / 2);
      crop = {
        offset: {x: originX, y: originY},
        size: {width, height: requiredHeight},
      };
    } else {
      const requiredWidth = height;
      const remainingWidth = width - requiredWidth;
      originY = 0;
      originX = Math.floor(remainingWidth / 2);
      crop = {
        offset: {x: originX, y: originY},
        size: {width: requiredWidth, height},
      };
    }
    return crop;
  }

  pickImage(image) {
    if (image.didCancel) {
      return null;
    }

    const imageSize = {width: image.width, height: image.height};
    const resize = this.getImageResize(imageSize);
    crop = this.getCropCoordinates(resize);

    ImageResizer.createResizedImage(
      image.uri,
      resize.width,
      resize.height,
      'JPEG',
      80,
    ).then(resized_image => {
      ImageEditor.cropImage(resized_image.uri, crop).then(crop_image => {
        this.props.changeImageUrl(crop_image, msg => {
          this.timedAlert.showAlert(3000, msg, false);
        });
      });
    });
  }

  renderRating(rating) {
    const {COLORS} = this.props;
    if (rating) {
      return (
        <StarRating
          activeOpacity={0.8}
          maxStars={rating}
          disabled={true}
          showRating={true}
          rating={rating}
          emptyStarColor={'#FFFFFF'}
          halfStarColor={
            this.props.theme === 'light' ? '#f5af19' : 'rgb(243, 201, 33)'
          }
          fullStarColor={
            this.props.theme === 'light' ? '#f5af19' : 'rgb(243, 201, 33)'
          }
          starSize={14}
          emptyStar={'star'}
          fullStar={'star'}
          halfStar={'star-half-o'}
        />
      );
    } else {
      return (
        <Text style={{...styles.TextStyling, fontSize: 14, color: COLORS.GRAY}}>
          *Not yet rated
        </Text>
      );
    }
  }

  renderHeader() {
    const {COLORS} = this.props;
    return (
      <View
        style={{
          margin: 8,
          height: 70,
          justifyContent: 'space-between',
          alignItems: 'center',
          flexDirection: 'row',
        }}>
        <TouchableOpacity
          activeOpacity={1}
          onPress={() => {
            Actions.pop();
          }}
          style={{justifyContent: 'center', alignItems: 'center', padding: 3}}>
          <Icon
            name="arrow-left"
            type="material-community"
            size={26}
            containerStyle={{marginVertical: 5, marginRight: 15}}
            color={COLORS.LESS_DARK}
          />
        </TouchableOpacity>

        <Text style={{...styles.HeadingTextStyling, color: COLORS.DARK}}>
          settings
        </Text>
      </View>
    );
  }

  renderLogoutButton() {
    return (
      <SView style={{flex: 1}}>
        <Ripple
          rippleContainerBorderRadius={10}
          style={{
            alignSelf: 'flex-start',
            marginTop: 50,
            elevation: 6,
            backgroundColor: '#ef473a',
            borderRadius: 10,
          }}
          onPress={() => {
            if (this.props.internetReachable) {
              this.props.logout();
            } else {
              this.timedAlert.showAlert(3000, 'Internet required to logout');
            }
          }}>
          <LinearGradient
            colors={
              this.props.internetReachable
                ? ['#ef473a', '#cb2d3e']
                : [COLORS.GRAY, COLORS.GRAY]
            }
            style={{
              justifyContent: 'space-evenly',
              alignItems: 'center',
              flexDirection: 'row',
              paddingVertical: 7,
              alignSelf: 'flex-start',
              paddingHorizontal: 10,
              borderRadius: 10,
            }}>
            <Text
              style={{
                ...styles.LogoutButtonTextStyle,
                color: this.props.internetReachable
                  ? COLORS_LIGHT_THEME.LIGHT
                  : COLORS.LIGHT,
              }}>
              Logout
            </Text>
            <Icon
              name="log-out"
              type="feather"
              size={20}
              color={
                this.props.internetReachable
                  ? COLORS_LIGHT_THEME.LIGHT
                  : COLORS.LIGHT
              }
            />
          </LinearGradient>
        </Ripple>
      </SView>
    );
  }

  renderThemeButton() {
    const {COLORS} = this.props;
    const oppositeTheme = this.props.theme === 'light' ? 'dark' : 'light';
    return (
      <SView
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginTop: 10,
          borderRadius: 15,
          padding: 10,
          shadowColor: '#202020',
          shadowOpacity: 0.2,
          shadowOffset: {width: 0, height: 8},
          shadowRadius: 6,
          backgroundColor:
            this.props.theme === 'light' ? COLORS.LIGHT : COLORS.LESS_LIGHT,
        }}>
        <Text
          style={{
            marginRight: 20,
            fontSize: 26,
            fontFamily: FONTS.PRODUCT_SANS_BOLD,
            color: this.props.theme === 'light' ? '#ff5ccd' : '#8ce1ff',
          }}>
          Change Theme To
        </Text>
        <TouchableOpacity
          style={{alignSelf: 'flex-start'}}
          activeOpacity={0.4}
          onPress={() => {
            analytics().setUserProperties({Theme: oppositeTheme});
            this.props.changeTheme(oppositeTheme);
          }}>
          <View
            style={{
              paddingVertical: 8,
              borderRadius: 8,
              borderWidth: 1,
              backgroundColor:
                this.props.theme === 'light' ? COLORS.LIGHT : COLORS.LESS_LIGHT,
              borderColor: this.props.theme === 'light' ? '#f953c6' : '#6DD5FA',
              width: 80,
              justifyContent: 'center',
              alignItems: 'center',
            }}>
            <Text
              style={{
                fontFamily: FONTS.RALEWAY_BOLD,
                fontSize: 16,
                color: this.props.theme === 'light' ? '#f953c6' : '#6DD5FA',
              }}>
              {oppositeTheme.toUpperCase()}
            </Text>
          </View>
        </TouchableOpacity>
      </SView>
    );
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

  renderProfilePictureEditor() {
    const {COLORS, data} = this.props;

    return (
      <View style={{margin: 10}}>
        <Avatar
          size={64}
          uri={this.imageUrlCorrector(data.image_url)}
          onPress={() => {
            this.imageSelector.showImageSelector(this.pickImage.bind(this));
          }}
          loading={this.props.profile_pic_loading}
        />
      </View>
    );
  }

  renderNameInput() {
    const {COLORS, data, submitName, changeName} = this.props;

    return (
      <TextInput
        value={data.name}
        onChangeText={name => changeName(name)}
        onSubmitEditing={() =>
          submitName(data.name, msg => {
            this.timedAlert.showAlert(3000, msg, false);
          })
        }
        maxLength={36}
        style={{
          ...styles.AvatarTextStyle,
          margin: 0,
          padding: 0,
          flexWrap: 'wrap',
          color: COLORS.DARK,
          textDecorationLine: 'underline',
          borderColor: COLORS.DARK,
          width: '100%',
          textAlign: 'right',
        }}
      />
    );
  }

  renderUserInfo() {
    const {COLORS, data, welcomeData} = this.props;

    return (
      <SView
        style={{
          borderRadius: 12,
          shadowColor: '#202020',
          shadowOpacity: 0.2,
          shadowOffset: {width: 0, height: 7},
          shadowRadius: 5,
          flex: 1,
          backgroundColor:
            this.props.theme === 'light' ? COLORS.LIGHT : COLORS.LESS_LIGHT,
          marginBottom: 10,
        }}>
        <View
          style={{
            justifyContent: 'space-between',
            alignItems: 'center',
            flexDirection: 'row',
            marginHorizontal: 10,
            flexWrap: 'wrap',
          }}>
          {this.renderProfilePictureEditor()}
          <View style={{flex: 1}}>
            {this.renderNameInput()}
            <Text
              style={{
                ...styles.AvatarTextStyle,
                fontSize: 14,
                alignSelf: 'flex-end',
                marginTop: 3,
                color: COLORS.GRAY,
              }}>
              {data.email}
            </Text>
          </View>
        </View>
        <View style={{paddingHorizontal: 10, marginBottom: 10}}>
          <LevelBar COLORS={COLORS} userXP={welcomeData.userXP} />
          <Ripple
            rippleContainerBorderRadius={7}
            onPress={() => {
              Actions.rewards();
            }}>
            <LinearGradient
              style={{
                flex: 1,
                justifyContent: 'center',
                alignItems: 'center',
                marginTop: 10,
                paddingVertical: 7,
                borderRadius: 7,
                elevation: 7,
                backgroundColor: COLORS.LIGHT,
                flexDirection: 'row',
              }}
              colors={['#ad5389', '#3c1053']}
              start={{x: 0, y: 1}}
              end={{x: 1, y: 1}}>
              <Text
                style={{
                  fontFamily: FONTS.GOTHAM_BLACK,
                  color: COLORS_LIGHT_THEME.LIGHT,
                  fontSize: 18,
                }}>
                XP
              </Text>
              <Text
                style={{
                  fontFamily: FONTS.HELVETICA_NEUE,
                  color: COLORS_LIGHT_THEME.LIGHT,
                  fontSize: 14,
                  marginLeft: 10,
                  marginTop: 2,
                }}>
                View experience perks
              </Text>
            </LinearGradient>
          </Ripple>
        </View>
        <View
          style={{
            height: 15,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: COLORS.DARK_GRAY,
            flex: 1,
            borderBottomLeftRadius: 12,
            borderBottomRightRadius: 12,
          }}>
          <Text
            style={{
              fontFamily: FONTS.PRODUCT_SANS,
              fontSize: 10,
              color:
                this.props.theme === 'light' ? COLORS.LIGHT : COLORS.LESS_LIGHT,
            }}>
            You can edit your name and profile picture
          </Text>
        </View>
      </SView>
    );
  }

  renderArticlesYouViewedStats() {
    const {COLORS} = this.props;
    return (
      <SView
        style={{
          borderRadius: 10,
          padding: 5,
          shadowColor: '#202020',
          shadowOpacity: 0.2,
          shadowOffset: {width: 0, height: 7},
          shadowRadius: 5,
          backgroundColor:
            this.props.theme === 'light' ? COLORS.LIGHT : COLORS.LESS_LIGHT,
          paddingHorizontal: 10,
          marginVertical: 10,
        }}>
        <View>
          <Text
            style={{...styles.SubheadingTextStyle, color: COLORS.LESSER_DARK}}>
            Articles You Viewed
          </Text>
        </View>

        <View
          style={{
            flexDirection: 'row',
            alignItems: 'flex-end',
            marginVertical: 2,
          }}>
          <Text
            style={{
              ...styles.TextStyling,
              color: COLORS.GRAY,
              fontFamily: FONTS.PRODUCT_SANS_BOLD,
            }}>
            {'Articles Viewed: '}
          </Text>
          <Text
            style={{
              ...styles.TextStyling,
              color: COLORS.GRAY,
              marginBottom: 1,
            }}>
            {this.props.settingsData.articles_viewed}
          </Text>
        </View>

        <View
          style={{
            flexDirection: 'row',
            alignItems: 'flex-end',
            marginVertical: 2,
          }}>
          <Text
            style={{
              ...styles.TextStyling,
              color: COLORS.GRAY,
              fontFamily: FONTS.PRODUCT_SANS_BOLD,
            }}>
            {'Average Rating Given: '}
          </Text>
          <View style={{marginBottom: 3}}>
            {this.renderRating(this.props.settingsData.average_rating_given)}
          </View>
        </View>
      </SView>
    );
  }

  renderYourArticlesStats() {
    const {COLORS} = this.props;
    return (
      <SView
        style={{
          borderRadius: 10,
          padding: 5,
          shadowColor: '#202020',
          shadowOpacity: 0.2,
          shadowOffset: {width: 0, height: 7},
          shadowRadius: 5,
          backgroundColor:
            this.props.theme === 'light' ? COLORS.LIGHT : COLORS.LESS_LIGHT,
          paddingHorizontal: 10,
          marginVertical: 10,
        }}>
        <View>
          <Text
            style={{...styles.SubheadingTextStyle, color: COLORS.LESSER_DARK}}>
            Your Articles
          </Text>
        </View>

        <View
          style={{
            flexDirection: 'row',
            alignItems: 'flex-end',
            marginVertical: 2,
          }}>
          <Text
            style={{
              ...styles.TextStyling,
              color: COLORS.GRAY,
              fontFamily: FONTS.PRODUCT_SANS_BOLD,
            }}>
            {'Total Articles Written: '}
          </Text>
          <Text
            style={{
              ...styles.TextStyling,
              color: COLORS.GRAY,
              marginBottom: 1,
            }}>
            {this.props.settingsData.articles_written}
          </Text>
        </View>

        <View
          style={{
            flexDirection: 'row',
            alignItems: 'flex-end',
            marginVertical: 2,
          }}>
          <Text
            style={{
              ...styles.TextStyling,
              color: COLORS.GRAY,
              fontFamily: FONTS.PRODUCT_SANS_BOLD,
            }}>
            {'Total Article Views: '}
          </Text>
          <Text
            style={{
              ...styles.TextStyling,
              color: COLORS.GRAY,
              marginBottom: 1,
            }}></Text>
        </View>

        <View
          style={{
            flexDirection: 'row',
            alignItems: 'flex-end',
            marginVertical: 2,
          }}>
          <Text
            style={{
              ...styles.TextStyling,
              color: COLORS.GRAY,
              fontFamily: FONTS.PRODUCT_SANS_BOLD,
            }}>
            {'Average Rating: '}
          </Text>
          <View style={{marginBottom: 3}}>
            {this.renderRating(this.props.settingsData.average_rating_received)}
          </View>
        </View>
      </SView>
    );
  }

  renderCategorySelector() {
    let new_data = [];
    ALL_CATEGORIES.map(item => {
      new_data.push({value: item});
    });
    const {COLORS} = this.props;

    return (
      <View style={{marginVertical: 10}}>
        <Text
          style={{
            marginRight: 30,
            fontSize: 22,
            fontFamily: FONTS.PRODUCT_SANS_BOLD,
            color: COLORS.LESSER_DARK,
          }}>
          Change Favourite Category
        </Text>
        <Dropdown
          COLORS={COLORS}
          data={new_data}
          label="Select a Category"
          value={this.props.fav_category}
          itemCount={7}
          onChangeText={selected_category => {
            this.props.settingsChangeFavouriteCategory(selected_category);
          }}
        />
      </View>
    );
  }

  renderThemeChangeSwitch() {
    const {COLORS, theme} = this.props;
    const oppositeTheme = this.props.theme === 'light' ? 'dark' : 'light';
    return (
      <View style={{marginVertical: 5}}>
        <View
          style={{flexDirection: 'row', alignItems: 'center', marginTop: 20}}>
          <Text
            style={{
              marginRight: 30,
              fontSize: 22,
              fontFamily: FONTS.PRODUCT_SANS_BOLD,
              color: COLORS.LESSER_DARK,
            }}>
            Switch Theme
          </Text>
          <View style={{flex: 1, alignItems: 'flex-end', paddingRight: 15}}>
            <Switch
              value={theme === 'dark'}
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
        </View>
        <Text
          style={{
            fontSize: 13,
            fontFamily: FONTS.RALEWAY,
            marginLeft: 10,
            marginTop: 5,
            color: COLORS.GRAY,
          }}>
          {oppositeTheme === 'light'
            ? `Currently in Dark theme, switch to\nLight theme for vibrant colors`
            : `Currently in Light theme, switch to\nDark theme for less strain on eyes`}
        </Text>
      </View>
    );
  }

  renderAnimationSwitch() {
    const {COLORS} = this.props;
    return (
      <View style={{marginVertical: 5}}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            marginVertical: 5,
          }}>
          <Text
            style={{
              marginRight: 30,
              fontSize: 22,
              fontFamily: FONTS.PRODUCT_SANS_BOLD,
              color: COLORS.LESSER_DARK,
            }}>
            Random Animations
          </Text>
          <View style={{flex: 1, alignItems: 'flex-end', paddingRight: 15}}>
            <Switch
              value={this.props.animationOn}
              onValueChange={() => {
                this.props.changeAnimationSettings();
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
        </View>
        <Text
          style={{
            fontSize: 13,
            fontFamily: FONTS.RALEWAY,
            marginLeft: 10,
            marginTop: 5,
            color: COLORS.GRAY,
          }}>
          {`Enable random animations and gestures\nwhich will occur from no-where`}
        </Text>
      </View>
    );
  }

  renderQuickRepliesSwitch() {
    const {COLORS} = this.props;
    return (
      <View style={{marginVertical: 5}}>
        <View style={{flexDirection: 'row', alignItems: 'center'}}>
          <Text
            style={{
              marginRight: 30,
              fontSize: 22,
              fontFamily: FONTS.PRODUCT_SANS_BOLD,
              color: COLORS.LESSER_DARK,
            }}>
            Smart Replies
          </Text>
          <View style={{flex: 1, alignItems: 'flex-end', paddingRight: 15}}>
            <Switch
              value={this.props.quick_replies_enabled}
              onValueChange={() => {
                this.props.changeQuickRepliesSettings();
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
        </View>
        <Text
          style={{
            fontSize: 13,
            fontFamily: FONTS.RALEWAY,
            marginLeft: 10,
            marginTop: 5,
            color: COLORS.GRAY,
          }}>
          {`Enable smart replies to get suggestions\nin chat, for quick responses`}
        </Text>
      </View>
    );
  }

  handleBlurOption(isIncrease) {
    if (isIncrease && this.state.blur < 15) {
      this.setState({blur: this.state.blur + 0.5});
    }
    if (!isIncrease && this.state.blur > 0) {
      this.setState({blur: this.state.blur - 0.5});
    }

    clearTimeout(this.timer);
    this.timer = setTimeout(() => {
      this.props.changeBlurRadius(this.state.blur);
    }, 1);
  }

  changeChatWallpaper() {
    const {COLORS} = this.props;
    return (
      <View style={{marginBottom: 30}}>
        <Text
          style={{
            marginRight: 30,
            fontSize: 22,
            fontFamily: FONTS.PRODUCT_SANS_BOLD,
            marginTop: 5,
            color: COLORS.LESSER_DARK,
          }}>
          Change your chat wallpaper
        </Text>
        <Ripple
          rippleContainerBorderRadius={10}
          style={{
            backgroundColor:
              this.props.theme === 'light' ? COLORS.LIGHT : COLORS.LESS_LIGHT,
            paddingHorizontal: 12,
            paddingVertical: 6,
            elevation: 8,
            borderRadius: 10,
            alignSelf: 'flex-start',
            marginVertical: 10,
            flexDirection: 'row',
            justifyContent: 'space-between',
            width: 195,
            alignItems: 'center',
          }}
          onPress={() => {
            this.imageSelector.showImageSelector(response => {
              this.props.changeChatWallpaper(
                response,
                this.props.chat_background.image,
              );
              this.timedAlert.showAlert(3000, 'Image applied', false);
            });
          }}>
          <Icon
            name="plus-circle"
            type="feather"
            size={20}
            color={COLORS.LESSER_DARK}
          />
          <Text
            style={{
              fontFamily: FONTS.PRODUCT_SANS,
              color: COLORS.LESSER_DARK,
              fontSize: 18,
            }}>
            Choose an Image
          </Text>
        </Ripple>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
          <Text
            style={{
              fontSize: 16,
              fontFamily: FONTS.PRODUCT_SANS,
              color: COLORS.LESSER_DARK,
              marginRight: 20,
            }}>
            Wallpaper blur effect
          </Text>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              width: 120,
              justifyContent: 'space-between',
              marginRight: 10,
            }}>
            <TouchableOpacity
              onPress={() => {
                this.handleBlurOption(false);
              }}
              style={{padding: 10}}>
              <Icon name="minus" type="feather" size={18} color={COLORS.GRAY} />
            </TouchableOpacity>
            <Text
              style={{
                fontSize: 16,
                fontFamily: FONTS.PRODUCT_SANS,
                color: COLORS.GRAY,
              }}>
              {this.state.blur}
            </Text>
            <TouchableOpacity
              onPress={() => {
                this.handleBlurOption(true);
              }}
              style={{padding: 10}}>
              <Icon name="plus" type="feather" size={18} color={COLORS.GRAY} />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  renderSettings() {
    return (
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{paddingVertical: 10, paddingHorizontal: 25}}>
        {this.renderHeader()}
        {this.renderUserInfo()}
        {this.renderArticlesYouViewedStats()}
        {this.renderYourArticlesStats()}
        {/* {this.renderThemeButton()} */}
        {this.renderCategorySelector()}
        {this.renderThemeChangeSwitch()}
        {this.renderAnimationSwitch()}
        {this.renderQuickRepliesSwitch()}
        {this.changeChatWallpaper()}
        {this.renderLogoutButton()}
        <View style={{height: 20, width: 1}} />
      </ScrollView>
    );
  }

  render() {
    const {COLORS} = this.props;
    return (
      <View style={{flex: 1, backgroundColor: COLORS.LIGHT}}>
        <StatusBar
          barStyle={
            this.props.theme === 'light' ? 'dark-content' : 'light-content'
          }
          backgroundColor={COLORS.LIGHT}
        />
        {changeNavigationBarColor(COLORS.LIGHT, this.props.theme === 'light')}
        <ImageSelector
          COLORS={this.props.COLORS}
          onRef={ref => (this.imageSelector = ref)}
        />
        <TimedAlert onRef={ref => (this.timedAlert = ref)} COLORS={COLORS} />
        {this.props.loading ? (
          <View
            style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
            <Loading size={128} white={this.props.theme !== 'light'} />
          </View>
        ) : (
          this.renderSettings()
        )}
      </View>
    );
  }
}

const mapStateToProps = state => {
  return {
    data: state.login.data,
    internetReachable: state.login.internetReachable,

    image_adder: state.home.image_adder,
    welcomeData: state.home.welcomeData,

    loading: state.settings.loading,
    fav_category: state.settings.fav_category,
    settingsData: state.settings.settingsData,
    profile_pic_loading: state.settings.profile_pic_loading,

    theme: state.chat.theme,
    COLORS: state.chat.COLORS,
    animationOn: state.chat.animationOn,
    chat_background: state.chat.chat_background,
    quick_replies_enabled: state.chat.quick_replies_enabled,
  };
};

export default connect(mapStateToProps, {
  logout,
  setAuthToken,
  getSettingsData,
  settingsChangeFavouriteCategory,
  changeTheme,
  changeAnimationSettings,
  changeQuickRepliesSettings,
  submitName,
  changeChatWallpaper,
  changeBlurRadius,
  changeName,
  revertName,
  changeImageUrl,
})(Settings);

const styles = StyleSheet.create({
  HeadingTextStyling: {
    fontSize: 24,
    fontFamily: FONTS.GOTHAM_BLACK,
  },
  LogoutButtonTextStyle: {
    color: COLORS_LIGHT_THEME.LIGHT,
    fontFamily: FONTS.PRODUCT_SANS,
    fontSize: 18,
    marginRight: 15,
  },
  SubheadingTextStyle: {
    fontFamily: FONTS.PRODUCT_SANS_BOLD,
    fontSize: 22,
  },
  TextStyling: {
    fontFamily: FONTS.PRODUCT_SANS,
    fontSize: 16,
    textAlignVertical: 'bottom',
  },
  AvatarTextStyle: {
    fontSize: 16,
    fontFamily: FONTS.RALEWAY_LIGHT,
  },
});
