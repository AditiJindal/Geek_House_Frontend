import React from 'react';
import {
  View,
  Text,
  StatusBar,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Image,
  ScrollView,
} from 'react-native';
import {connect} from 'react-redux';
import {COLORS_LIGHT_THEME, COLORS_DARK_THEME, FONTS} from '../Constants';
import {submitFeedback} from '../actions/HomeAction';
import {Actions} from 'react-native-router-flux';
import changeNavigationBarColor from 'react-native-navigation-bar-color';
import {Icon} from 'react-native-elements';
import SView from 'react-native-simple-shadow-view';
import LinearGradient from 'react-native-linear-gradient';
import ImagePicker from 'react-native-image-picker';
import ImageResizer from 'react-native-image-resizer';
import TimedAlert from '../components/TimedAlert';
import {Switch} from 'react-native-switch';
import analytics from '@react-native-firebase/analytics';
import prettysize from 'prettysize';

const INITIAL_STATE = {
  subject: '',
  description: '',
  image_url: null,
  image_name: null,
  image_size: null,
  feedback_submitted: false,
  isAnonymous: false,
};
class Feedback extends React.PureComponent {
  state = INITIAL_STATE;

  renderHeader() {
    const {COLORS} = this.props;
    return (
      <View
        style={{
          borderRadius: 10,
          margin: 8,
          height: 70,
          justifyContent: 'space-between',
          marginHorizontal: 15,
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
            type={'feather'}
            containerStyle={{marginVertical: 5, marginRight: 15}}
            color={COLORS.LESS_DARK}
          />
        </TouchableOpacity>

        <Text style={{...styles.HeadingTextStyling, color: COLORS.LESS_DARK}}>
          feedback
        </Text>
      </View>
    );
  }

  getImageResize(imageSize) {
    let resize = {...imageSize};
    const maxWidth = 1440;
    const maxHeight = 720;
    let ratio = imageSize.width / imageSize.height;
    if (resize.width > maxWidth) {
      resize = {width: maxWidth, height: Math.floor(maxWidth / ratio)};
    }
    if (resize.height > maxHeight) {
      resize = {width: Math.floor(maxHeight * ratio), height: maxHeight};
    }
    return resize;
  }
  handleImage(image) {
    if (image.uri) {
      const imageSize = {width: image.width, height: image.height};
      const resize = this.getImageResize(imageSize);
      ImageResizer.createResizedImage(
        image.uri,
        resize.width,
        resize.height,
        'JPEG',
        50,
      ).then(resizedImage => {
        const image_url = resizedImage.uri;
        this.setState({
          image_url,
          image_name: image.fileName,
          image_size: prettysize(resizedImage.size),
        });
      });
    }
  }

  selectImage() {
    if (this.state.image_url) {
      this.setState({image_url: null, image_name: null, image_size: null});
    } else {
      ImagePicker.launchImageLibrary(
        {
          noData: true,
          mediaType: 'photo',
          chooseWhichLibraryTitle: 'Select an App',
        },
        response => {
          this.handleImage(response);
        },
      );
    }
  }

  renderFeedbackForm() {
    const {COLORS} = this.props;
    return (
      <SView
        style={{
          width: '85%',
          height: this.state.image_url ? '55%' : '40%',
          borderRadius: 25,
          backgroundColor: COLORS.LESSER_LIGHT,
          shadowOpacity: 0.2,
          shadowColor: 'rgba(20,20,20)',
          shadowRadius: 8,
          marginTop: 30,
          alignSelf: 'center',
          shadowOffset: {width: 0, height: 10},
        }}>
        {this.state.feedback_submitted ? (
          <View
            style={{
              flex: 1,
              justifyContent: 'center',
              alignItems: 'center',
              flexWrap: 'wrap',
            }}>
            <Text
              style={{
                color: COLORS.LIGHT_GRAY,
                fontFamily: FONTS.RALEWAY_LIGHT,
                fontSize: 36,
                marginHorizontal: 20,
                textAlign: 'center',
              }}>
              Thank You for Feedback
            </Text>
          </View>
        ) : (
          <>
            <TextInput
              placeholder={'Subject of request'}
              value={this.state.subject}
              onChangeText={subject => {
                this.setState({subject});
              }}
              placeholderTextColor={COLORS.GRAY}
              style={{
                fontFamily: FONTS.RALEWAY,
                fontSize: 18,
                marginHorizontal: 10,
                marginTop: 10,
                paddingHorizontal: 10,
                borderRadius: 15,
                color: COLORS.LESS_DARK,
                backgroundColor: COLORS.MID_LIGHT,
              }}
            />
            <TextInput
              placeholder={'Enter a detailed description'}
              multiline={true}
              value={this.state.description}
              onChangeText={description => {
                this.setState({description});
              }}
              placeholderTextColor={COLORS.GRAY}
              style={{
                fontFamily: FONTS.RALEWAY,
                fontSize: 14,
                marginHorizontal: 10,
                marginVertical: 10,
                borderRadius: 15,
                flex: 1,
                textAlignVertical: 'top',
                padding: 10,
                color: COLORS.LESS_DARK,
                backgroundColor: COLORS.MID_LIGHT,
              }}
            />
            {this.state.image_url ? (
              <View
                style={{
                  flex: 1,
                  height: '37%',
                  margin: 10,
                  borderRadius: 20,
                  overflow: 'hidden',
                  marginTop: 0,
                }}>
                <Image
                  source={{uri: this.state.image_url}}
                  blurRadius={2}
                  style={{flex: 1, borderRadius: 20}}
                />
                <View
                  style={{
                    position: 'absolute',
                    top: 5,
                    left: 5,
                    backgroundColor: 'rgba(50,50,50,0.3)',
                    borderRadius: 15,
                    paddingVertical: 5,
                    paddingHorizontal: 10,
                  }}>
                  <Text
                    style={{
                      color: COLORS_DARK_THEME.LESS_DARK,
                      fontFamily: FONTS.PRODUCT_SANS_BOLD,
                      fontSize: 8,
                    }}>
                    {this.state.image_name}
                  </Text>
                  <Text
                    style={{
                      color: COLORS_DARK_THEME.LESSER_DARK,
                      fontFamily: FONTS.PRODUCT_SANS,
                      fontSize: 8,
                    }}>
                    Image size: {this.state.image_size}
                  </Text>
                </View>
              </View>
            ) : null}
            <TouchableOpacity
              activeOpacity={1}
              multiline={true}
              onPress={() => {
                this.selectImage();
              }}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                position: 'absolute',
                bottom: 0,
                right: 0,
                backgroundColor: COLORS.LESSER_LIGHT,
                padding: 10,
                borderBottomRightRadius: 25,
                borderTopLeftRadius: 25,
              }}>
              <Icon
                name={this.state.image_url ? 'x' : 'plus'}
                size={22}
                color={COLORS.GRAY}
                type={'feather'}
              />
              {!this.state.image_url ? (
                <Text
                  style={{
                    color: COLORS.GRAY,
                    fontFamily: FONTS.PRODUCT_SANS,
                    fontSize: 14,
                    marginRight: 5,
                    marginLeft: 10,
                  }}>
                  Add an Image
                </Text>
              ) : null}
            </TouchableOpacity>
          </>
        )}
      </SView>
    );
  }

  onSubmit() {
    if (this.state.subject.length > 10 || this.state.description.length > 10) {
      this.props.submitFeedback({
        subject: this.state.subject,
        description: this.state.description,
        image_url: this.state.image_url,
        author: this.props.data.name,
        email: this.props.data.email,
        isAnonymous: this.state.isAnonymous,
      });
      this.setState({...INITIAL_STATE, feedback_submitted: true});
      analytics().logEvent('given_feedback');
    } else {
      this.timedAlert.showAlert(3000, 'Please provide something more useful');
    }
  }

  renderAnonymous() {
    const {COLORS} = this.props;
    if (this.state.feedback_submitted) {
      return null;
    }
    return (
      <View
        style={{marginTop: 30, marginHorizontal: 20, justifyContent: 'center'}}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
          <Text
            style={{
              marginRight: 15,
              fontSize: 18,
              fontFamily: FONTS.RALEWAY,
              paddingVertical: 5,
              color: COLORS.GRAY,
            }}>
            Submit as anonymous user
          </Text>
          <Switch
            value={this.state.isAnonymous}
            onValueChange={() => {
              this.setState({isAnonymous: !this.state.isAnonymous});
            }}
            backgroundActive={COLORS_LIGHT_THEME.GREEN}
            backgroundInactive={COLORS.LESSER_DARK}
            circleSize={16}
            barHeight={22}
            changeValueImmediately={true}
            innerCircleStyle={{elevation: 4}}
            switchLeftPx={3}
            switchRightPx={3}
            circleBorderWidth={0}
            circleActiveColor={COLORS_LIGHT_THEME.LIGHT}
            circleInActiveColor={COLORS_LIGHT_THEME.LIGHT}
          />
        </View>

        <Text
          style={{
            fontSize: 11,
            fontFamily: FONTS.RALEWAY,
            paddingHorizontal: 30,
            textAlign: 'center',
            color: COLORS.GRAY,
          }}>
          * Your name and email will not be submitted with when anonymous
        </Text>
      </View>
    );
  }

  renderSubmitButton() {
    return (
      <TouchableOpacity
        activeOpacity={0.75}
        style={{
          borderWidth: 0,
          bottom: 15,
          position: 'absolute',
          alignSelf: 'center',
        }}
        onPress={() => {
          !this.state.feedback_submitted ? this.onSubmit() : Actions.pop();
        }}>
        <SView
          style={{
            borderRadius: 15,
            shadowOpacity: 0.3,
            shadowRadius: 5,
            height: 45,
            width: 130,
            shadowOffset: {height: 7},
            shadowColor: '#b91d73',
            backgroundColor: COLORS_LIGHT_THEME.LIGHT,
          }}>
          <LinearGradient
            style={{
              borderRadius: 15,
              flex: 1,
              justifyContent: 'center',
              alignItems: 'center',
            }}
            colors={['#f953c6', '#b91d73']}
            start={{x: 1, y: 0}}
            end={{x: 1, y: 1}}>
            <Text
              style={{
                fontFamily: FONTS.GOTHAM_BLACK,
                fontSize: 22,
                color: COLORS_LIGHT_THEME.LIGHT,
              }}>
              {`${!this.state.feedback_submitted ? 'SUBMIT' : 'BACK'}`}
            </Text>
          </LinearGradient>
        </SView>
      </TouchableOpacity>
    );
  }

  render() {
    const {COLORS} = this.props;
    return (
      <View style={{flex: 1, backgroundColor: COLORS.LIGHT}}>
        <StatusBar
          backgroundColor={COLORS.LIGHT}
          barStyle={
            this.props.theme === 'light' ? 'dark-content' : 'light-content'
          }
        />
        <TimedAlert
          onRef={ref => (this.timedAlert = ref)}
          theme={this.props.theme}
          COLORS={COLORS}
        />
        {changeNavigationBarColor(COLORS.LIGHT, this.props.theme === 'light')}
        <ScrollView keyboardShouldPersistTaps="always">
          {this.renderHeader()}
          <Text style={{...styles.TextStyling, color: COLORS.LESSER_DARK}}>
            Please provide your feedback, suggestions or information on any bugs
            you encountered while you were using this app. Your feedback will be
            seen and appropriate action will be taken
          </Text>
          {this.renderFeedbackForm()}
          {this.renderAnonymous()}
          <View style={{height: 180, width: 1}} />
        </ScrollView>
        {this.renderSubmitButton()}
      </View>
    );
  }
}

const mapStateToProps = state => {
  return {
    data: state.login.data,

    theme: state.chat.theme,
    COLORS: state.chat.COLORS,
  };
};

export default connect(mapStateToProps, {submitFeedback})(Feedback);

const styles = StyleSheet.create({
  HeadingTextStyling: {
    fontSize: 24,
    fontFamily: FONTS.GOTHAM_BLACK,
  },
  SubheadingTextStyle: {
    fontFamily: FONTS.PRODUCT_SANS_BOLD,
    fontSize: 22,
    marginBottom: 10,
  },
  TextStyling: {
    fontFamily: FONTS.PRODUCT_SANS,
    fontSize: 14,
    marginVertical: 2,
    textAlign: 'justify',
    marginHorizontal: 20,
  },
});
