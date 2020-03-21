import React from 'react';
import {View, StatusBar, TouchableOpacity} from 'react-native';
import Image from 'react-native-fast-image';
import ImageZoom from 'react-native-image-pan-zoom';
import {Overlay, Icon} from 'react-native-elements';

const ImageViewer = props => {
  const {isVisible, onClose, COLORS, imageHeight, imageWidth, source} = props;
  return (
    <Overlay
      isVisible={isVisible}
      height="100%"
      width="100%"
      onRequestClose={onClose}
      overlayBackgroundColor={'rgba(0,0,0,0)'}
      containerStyle={{padding: 0, margin: 0, elevation: 0}}>
      <>
        <StatusBar
          barStyle={'light-content'}
          backgroundColor={COLORS.OVERLAY_COLOR}
        />
        <TouchableOpacity
          style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}
          onPress={onClose}
          activeOpacity={1}>
          <View style={{height: imageHeight, width: imageWidth}}>
            <TouchableOpacity
              onPress={onClose}
              style={{
                padding: 10,
                zIndex: 10,
                top: -5,
                right: -3,
                position: 'absolute',
              }}>
              <Icon
                name="x-circle"
                size={22}
                color={COLORS.RED}
                type={'feather'}
              />
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
          </View>
        </TouchableOpacity>
      </>
    </Overlay>
  );
};

export default ImageViewer;