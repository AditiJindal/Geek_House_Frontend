import React, {Component} from 'react';
import {
  View,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Text,
} from 'react-native';
import {Icon} from 'react-native-elements';
import SView from 'react-native-simple-shadow-view';
import Image from 'react-native-fast-image';
import vision from '@react-native-firebase/ml-vision';
import ImageResizer from 'react-native-image-resizer';
import {Loading, Ripple, ImageSelector, CustomAlert} from './index';
import {
  FONTS,
  ERROR_MESSAGES,
  LOG_EVENT,
  COLORS_LIGHT_THEME,
} from '../Constants';
import {logEvent} from '../actions/ChatAction';

const MIN_TI_HEIGHT = 120;
export default class WriteView extends Component {
  constructor() {
    super();
    this.state = {
      isVisible: false,
      imageSelectorOpen: false,
      visionLoading: false,
      cardWidth: 0,
    };
  }

  imageUrlCorrector(image_url) {
    if (!this.props.image_adder) {
      return '';
    }
    if (
      image_url.substring(0, 4) !== 'http' &&
      image_url.substring(0, 4) !== 'file'
    ) {
      image_url = this.props.image_adder + image_url;
    }
    return image_url;
  }

  async doTextRecognition(image_path) {
    if (!image_path) {
      return;
    }
    this.setState({visionLoading: true});
    vision()
      .textRecognizerProcessImage(image_path)
      .then((response) => {
        if (response.text.length === 0) {
          this.props.timedAlert.showAlert(
            3000,
            'Could not identify text in this image',
          );
          this.setState({visionLoading: false});
          return;
        } else if (response.text.length < 10) {
          this.timedAlert.showAlert(3000, 'Could not identify enough text');
        }
        this.props.onContentChange(response.text, this.props.index);
        this.setState({visionLoading: false});
      })
      .catch((e) =>
        logEvent(LOG_EVENT.ERROR, {
          errorLine: 'WRITE VIEW - 42',
          description: e.toString(),
        }),
      );
  }

  getImageResize(response) {
    const MAX_WIDTH = 512;
    const MAX_HEIGHT = 1024;

    if (response.originalRotation) {
      // means height and width are interchanged, we have to swap them
      let temp = response.height;
      response.height = response.width;
      response.width = temp;
    }

    let resize = {width: response.width, height: response.height};
    let ratio = response.width / response.height;
    if (resize.width > MAX_WIDTH) {
      resize = {width: MAX_WIDTH, height: Math.floor(MAX_WIDTH / ratio)};
    }
    if (resize.height > MAX_HEIGHT) {
      resize = {width: Math.floor(MAX_HEIGHT * ratio), height: MAX_HEIGHT};
    }
    return resize;
  }

  handleOnClose() {
    const {obj, onClosePressed} = this.props;
    if (obj.content || obj.sub_heading || obj.image) {
      this.setState({isVisible: true});
    }
    this.props.onClose(this.props.index);
    onClosePressed();
  }

  handleAddCardImage() {
    const {index, onCardImageChange} = this.props;
    this.imageSelector.showImageSelector(async (response) => {
      const resize = this.getImageResize(response);
      const resized_image = await ImageResizer.createResizedImage(
        response.uri,
        resize.width,
        resize.height,
        'JPEG',
        80,
      );
      onCardImageChange(resized_image, index);
    });
  }

  renderRemoveImageButton() {
    const {onCardImageChange, index} = this.props;
    return (
      <TouchableOpacity
        style={styles.RemoveImageButton}
        activeOpacity={0.8}
        onPress={() => onCardImageChange(null, index)}>
        <Icon
          type="feather"
          name="x"
          size={16}
          color={COLORS_LIGHT_THEME.LIGHT}
        />
        <Text style={styles.RemoveImageText}>Remove Image</Text>
      </TouchableOpacity>
    );
  }

  renderCardImage() {
    const {COLORS, obj} = this.props;

    if (obj.image) {
      const width = this.state.cardWidth;
      const height = (obj.image.height * width) / obj.image.width;

      return (
        <View style={{width: '100%', height, paddingHorizontal: 5}}>
          <Image
            source={{uri: this.imageUrlCorrector(obj.image.uri)}}
            style={{flex: 1, elevation: 5, borderRadius: 4}}>
            {this.renderRemoveImageButton()}
          </Image>
        </View>
      );
    }
    return (
      <Ripple
        style={{
          padding: 10,
          flexDirection: 'row',
          alignItems: 'center',
          elevation: 3,
          backgroundColor: COLORS.LESSER_LIGHT,
          marginHorizontal: 5,
          borderRadius: 7,
        }}
        rippleContainerBorderRadius={7}
        onPress={this.handleAddCardImage.bind(this)}>
        <Icon type="feather" name="image" size={14} color={COLORS.LESS_DARK} />
        <Text style={{...styles.CardImageText, color: COLORS.LESS_DARK}}>
          Optionally add an image for this card
        </Text>
      </Ripple>
    );
  }

  renderTextInput() {
    return (
      <>
        <TextInput
          numberOfLines={5}
          multiline={true}
          maxLength={512}
          textAlignVertical="top"
          value={this.props.obj.content}
          onChangeText={(value) => {
            this.props.onContentChange(value, this.props.index);
          }}
          textBreakStrategy="highQuality"
          placeholderTextColor={COLORS.LESSER_DARK}
          style={{...styles.ContentStyle, color: COLORS.DARK}}
          placeholder={'Enter something...'}
        />
        <View style={{height: 25}} />
        <TouchableOpacity
          activeOpacity={0.6}
          onPress={() => {
            this.imageSelector.showImageSelector((response) => {
              this.doTextRecognition(response.path);
            });
          }}
          style={{
            flexDirection: 'row',
            alignItems: 'flex-end',
            position: 'absolute',
            bottom: 0,
            paddingVertical: 5,
            paddingHorizontal: 12,
            backgroundColor: COLORS.LESSER_LIGHT,
            borderBottomLeftRadius: 15,
            borderTopRightRadius: 15,
            elevation: 2,
          }}>
          <Icon
            type="feather"
            name="camera"
            size={15}
            color={COLORS.LESS_DARK}
          />
          <Text
            style={{
              fontFamily: FONTS.RALEWAY_LIGHT,
              color: COLORS.LESS_DARK,
              fontSize: 14,
              marginLeft: 7,
            }}>
            Scan Text
          </Text>
        </TouchableOpacity>
      </>
    );
  }

  render() {
    const {COLORS} = this.props;
    return (
      <SView
        style={{
          ...styles.CardViewStyle,
          backgroundColor:
            this.props.theme === 'light' ? COLORS.LIGHT : COLORS.LESS_LIGHT,
        }}
        onLayout={(event) => {
          if (!this.state.cardWidth) {
            this.setState({cardWidth: event.nativeEvent.layout.width});
          }
        }}>
        <ImageSelector
          COLORS={this.props.COLORS}
          onRef={(ref) => (this.imageSelector = ref)}
        />
        <CustomAlert
          theme={this.props.theme}
          COLORS={COLORS}
          isVisible={this.state.isVisible}
          onFirstButtonPress={() => {
            this.setState({isVisible: false});
            this.props.onClose(this.props.index);
            this.props.onBackdropPress();
          }}
          onSecondButtonPress={() => {
            this.setState({isVisible: false});
            this.props.onBackdropPress();
          }}
          onThirdButtonPress={() => {
            this.setState({isVisible: false});
            this.props.onBackdropPress();
          }}
          onBackdropPress={() => {
            this.setState({isVisible: false});
            this.props.onBackdropPress();
          }}
          message={ERROR_MESSAGES.CONFIRM_WRITE_VIEW_DELETE}
        />
        <View
          style={{
            justifyContent: 'space-between',
            flexDirection: 'row',
            alignItems: 'center',
            marginHorizontal: 10,
          }}>
          <TextInput
            style={{...styles.SubHeadingStyle, flex: 1, color: COLORS.DARK}}
            placeholderTextColor={COLORS.LESSER_DARK}
            value={this.props.obj.sub_heading}
            maxLength={128}
            onChangeText={(value) => {
              this.props.onSubHeadingChange(value, this.props.index);
            }}
            textBreakStrategy="highQuality"
            multiline={false}
            textAlignVertical="top"
            multiline={true}
            placeholder={'Enter a heading'}
          />
          <TouchableOpacity onPress={this.handleOnClose.bind(this)}>
            <Icon
              size={24}
              name="close-circle"
              type="material-community"
              color={COLORS.RED}
            />
          </TouchableOpacity>
        </View>
        {this.renderCardImage()}
        {this.state.visionLoading ? (
          <View
            style={{
              justifyContent: 'center',
              alignItems: 'center',
              height: MIN_TI_HEIGHT + 30,
              alignSelf: 'center',
            }}>
            <Loading size={64} white={this.props.theme !== 'light'} />
          </View>
        ) : (
          this.renderTextInput()
        )}
        <Text
          style={{
            bottom: 10,
            right: 10,
            position: 'absolute',
            fontFamily: FONTS.PRODUCT_SANS,
            fontSize: 10,
            color:
              this.props.theme === 'light'
                ? COLORS.LESS_LIGHT
                : COLORS.LIGHT_GRAY,
          }}>
          Card {this.props.obj.key}
        </Text>
      </SView>
    );
  }
}

const styles = StyleSheet.create({
  CardViewStyle: {
    shadowColor: '#222222',
    shadowOpacity: 0.23,
    shadowOffset: {width: 0, height: 7},
    shadowRadius: 7,
    marginHorizontal: 25,
    marginVertical: 15,
    borderRadius: 15,
  },
  SubHeadingStyle: {
    fontFamily: FONTS.NOE_DISPLAY,
    fontSize: 22,
    marginBottom: 5,
    paddingBottom: 5,
  },
  RemoveImageButton: {
    backgroundColor: 'rgba(50,50,50,0.6)',
    paddingVertical: 5,
    paddingHorizontal: 8,
    borderTopRightRadius: 20,
    borderBottomRightRadius: 20,
    marginTop: 15,
    flexDirection: 'row',
    alignItems: 'flex-end',
    alignSelf: 'flex-start',
  },
  RemoveImageText: {
    fontFamily: FONTS.PRODUCT_SANS,
    fontSize: 14,
    color: COLORS_LIGHT_THEME.LIGHT,
    marginLeft: 5,
  },
  CardImageText: {
    fontFamily: FONTS.RALEWAY,
    fontSize: 14,
    marginLeft: 10,
  },
  ContentStyle: {
    textAlign: 'justify',
    fontFamily: FONTS.LATO,
    fontSize: 14,
    marginHorizontal: 10,
    marginBottom: 5,
    minHeight: MIN_TI_HEIGHT,
  },
});
