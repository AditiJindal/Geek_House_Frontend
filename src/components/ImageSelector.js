import React from 'react';
import {View, Keyboard, Text, StyleSheet} from 'react-native';
import ImagePicker from 'react-native-image-picker';
import Icon from 'react-native-vector-icons/Feather';

import {changeBarColors} from '../utilities';
import Overlay from './Overlay';
import Ripple from './Ripple';
import {FONTS} from '../Constants';

// USAGE : write this in render() of the component
// <ImageSelector
//   COLORS = {this.props.COLORS}
//   onRef={ref=>this.imageSelector = ref}
//   onSelect = {(response)=>{console.log(response)}}
// />

// call this.imageSelector.showImageSelector(callbackFunc)
// from anywhere, when user selects an image,
// onSelect will be called, else it won't be called

// callbackFunc is the function which will be called once the user selects an image
// and it will be passed a response argument

const ImageOptions = {
  noData: true,
  mediaType: 'photo',
  chooseWhichLibraryTitle: 'Select an App',
  permissionDenied: {
    title: 'Permission Required',
    text:
      "We need your permission to access your camera/photos. To be able to do that, press 'Grant', and\
allow the storage and camera permissions",
    reTryTitle: 'Grant',
    okTitle: 'Not Now',
  },
};

class ImageSelector extends React.Component {
  state = {
    imageSelectorOpen: false,
    callbackFunc: () => {},
  };

  componentDidMount() {
    Keyboard.dismiss();
    this.props.onRef(this);
  }

  showImageSelector(callbackFunc) {
    this.setState({imageSelectorOpen: true, callbackFunc});
  }

  onPressGallery() {
    this.setState({imageSelectorOpen: false});
    ImagePicker.launchImageLibrary(ImageOptions, (response) => {
      if (!response.didCancel) {
        this.state.callbackFunc(response);
      }
    });
  }

  onPressCamera() {
    this.setState({imageSelectorOpen: false});
    ImagePicker.launchCamera(ImageOptions, (response) => {
      if (!response.didCancel) {
        this.state.callbackFunc(response);
      }
    });
  }

  renderSelector(title, iconName, subTitle, onPress) {
    return (
      <Ripple
        onPress={onPress}
        containerStyle={{
          height: 180,
          width: 120,
          marginRight: 15,
          borderRadius: 15,
          backgroundColor: COLORS.LESSER_LIGHT,
          elevation: 20,
        }}
        style={{
          justifyContent: 'space-around',
          alignItems: 'center',
        }}>
        <View style={{height: 50, justifyContent: 'center'}}>
          <Text style={[styles.SelectorTitle, {color: COLORS.LESSER_DARK}]}>
            {title}
          </Text>
        </View>
        <Icon size={72} name={iconName} color={COLORS.LESSER_DARK} />
        <View style={{height: 50, justifyContent: 'center'}}>
          <Text style={[styles.SelectorSubTitle, {color: COLORS.LESSER_DARK}]}>
            {subTitle}
          </Text>
        </View>
      </Ripple>
    );
  }

  render() {
    const {COLORS} = this.props;
    return (
      <Overlay
        isVisible={this.state.imageSelectorOpen}
        overlayStyle={{flexDirection: 'row', alignSelf: 'center'}}
        onModalShow={() =>
          changeBarColors(COLORS.OVERLAY_COLOR, COLORS.IS_LIGHT_THEME)
        }
        onModalHide={() => changeBarColors(COLORS.LIGHT, COLORS.IS_LIGHT_THEME)}
        onBackdropPress={() => {
          this.setState({imageSelectorOpen: false});
        }}>
        {this.renderSelector(
          'Gallery',
          'image',
          'Select from\nGallery',
          this.onPressGallery.bind(this),
        )}
        {this.renderSelector(
          'Camera',
          'camera',
          'Click fromCamera',
          this.onPressCamera.bind(this),
        )}
      </Overlay>
    );
  }
}

export default ImageSelector;

const styles = StyleSheet.create({
  SelectorView: {
    height: 180,
    width: 120,
    justifyContent: 'space-around',
    alignItems: 'center',
    marginRight: 15,
    borderRadius: 15,
    elevation: 20,
  },
  SelectorTitle: {
    fontFamily: FONTS.RALEWAY_BOLD,
    textAlign: 'center',
    fontSize: 16,
  },
  SelectorSubTitle: {
    fontFamily: FONTS.PRODUCT_SANS,
    textAlign: 'center',
    fontSize: 12,
  },
});
