import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { StyleSheet, View, ViewPropTypes, Dimensions, } from 'react-native';
import Image from 'react-native-fast-image';

// @ts-ignore
import Lightbox from 'react-native-lightbox';
const styles = StyleSheet.create({
    container: {},
    image: {
        width: 150,
        borderRadius: 13,
        margin: 3,
        resizeMode: 'cover',
    },
    imageActive: {
        flex: 1,
        resizeMode: 'contain',
    },
});
export default class MessageImage extends Component {
    // aspect ratio is width/height
    render() {
        let screenWidth = Dimensions.get('window').width;
        const { containerStyle, lightboxProps, imageProps, imageStyle, currentMessage, } = this.props;
        if (!!currentMessage) {
            return (<View style={[styles.container, containerStyle]}>
          <Lightbox activeProps={{
                style: styles.imageActive,
                height: screenWidth/currentMessage.image.aspectRatio,
                width: screenWidth,

            }} {...lightboxProps}>
            <Image {...imageProps} style={{...styles.image, ...imageStyle, height:150/currentMessage.image.aspectRatio}} 
                source={{ uri: currentMessage.image.url }}/>
          </Lightbox>
        </View>);
        }
        return null;
    }
}
MessageImage.defaultProps = {
    currentMessage: {
        image: null,
    },
    containerStyle: {},
    imageStyle: {},
    imageProps: {},
    lightboxProps: {},
};
MessageImage.propTypes = {
    currentMessage: PropTypes.object,
    containerStyle: ViewPropTypes.style,
    imageStyle: PropTypes.object,
    imageProps: PropTypes.object,
    lightboxProps: PropTypes.object,
};
//# sourceMappingURL=MessageImage.js.map