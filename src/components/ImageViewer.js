import React from 'react';
import {View, StatusBar, TouchableOpacity} from 'react-native';
import Image from 'react-native-fast-image';
import ImageZoom from 'react-native-image-pan-zoom';
import Icon from 'react-native-vector-icons/Feather';

import Overlay from './Overlay';

const ImageViewer = (props) => {
  console.log('PROPS : ', props);
  const {isVisible, onClose, COLORS, imageHeight, imageWidth, source} = props;
  return (
    <Overlay
      isVisible={isVisible}
      onRequestClose={onClose}
      onBackdropPress={onClose}
      overlayStyle={{
        height: imageHeight,
        width: imageWidth,
        alignSelf: 'center',
      }}>
      <TouchableOpacity
        onPress={onClose}
        style={{
          padding: 10,
          zIndex: 10,
          top: -5,
          right: -3,
          position: 'absolute',
        }}>
        <Icon name="x-circle" size={22} color={COLORS.RED} />
      </TouchableOpacity>
      <ImageZoom
        imageHeight={imageHeight}
        imageWidth={imageWidth}
        cropHeight={imageHeight}
        cropWidth={imageWidth}
        style={{
          backgroundColor: 'rgba(0,0,0,0.4)',
          borderRadius: 15,
          overflow: 'hidden',
        }}
        enableSwipeDown={true}
        onSwipeDown={onClose}>
        <View style={{borderRadius: 15, overflow: 'hidden'}}>
          <Image
            source={source}
            style={{height: imageHeight, width: imageWidth}}
          />
        </View>
      </ImageZoom>
    </Overlay>
  );
};

export default ImageViewer;
