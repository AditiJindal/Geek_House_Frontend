import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { StyleSheet, View, ViewPropTypes, Dimensions, TouchableOpacity, Text} from 'react-native';
import Image from 'react-native-fast-image';
import {check, request, PERMISSIONS, RESULTS} from 'react-native-permissions';
import RNFileSystem from 'react-native-fs';
import ImageViewer from '../ImageViewer';
import { FONTS, COLORS_LIGHT_THEME } from '../../Constants';

const DEVICE_WIDTH = Dimensions.get('screen').width
const IMAGE_WIDTH = 0.7*DEVICE_WIDTH

const styles = StyleSheet.create({
    container: {},
    imageView: {
        borderRadius: 13,
        margin: 3,
        overflow:'hidden'
    },
    imageActive: {
        flex: 1,
        resizeMode: 'contain',
    },
});
export default class MessageImage extends Component {
    // aspect ratio is width/height
    state={
        imageViewerActive: false,
        imageLoadError: false
    }

    getImageShowDimenstions(imageWidth, aspectRatio){
        let {height, width} = Dimensions.get('screen');
        height=height-30; width=width-30;
        let showWidth = width;
        if (width<width){
            showWidth = imageWidth;
        }
        let showHeight = showWidth/aspectRatio;
        if (showHeight>height){
            showHeight = height;
            showWidth = showHeight*aspectRatio;
        }
        return {showHeight, showWidth}
    }

    async saveFileToGallery(image_url, name){
        const folder = RNFileSystem.ExternalStorageDirectoryPath+"/GeekHouse/";
        const file_path = `${folder}${name}.jpg`
        const exists = await RNFileSystem.exists(file_path)
        
        this.props.showTimedAlert(10000, 'Saving image...');


        const permission = await check(PERMISSIONS.ANDROID.WRITE_EXTERNAL_STORAGE);
        if (permission!==RESULTS.GRANTED){
            const granted = await request(PERMISSIONS.ANDROID.WRITE_EXTERNAL_STORAGE);
            if (granted!==RESULTS.GRANTED){
                this.props.showTimedAlert(2000, 'Permission not granted');
                return null
            }
        }

        if (!exists){

            await RNFileSystem.mkdir(folder);
            await RNFileSystem.downloadFile({
                fromUrl:image_url,
                toFile: file_path,
                background:true,discretionary:true, cacheable:true,
            }).promise
            this.props.showTimedAlert(3000, 'Image Saved');
            
        }
        else{
            this.props.showTimedAlert(3000, 'Image already saved');
        }
        
    }

    render() {
        const { containerStyle, imageProps, imageStyle, currentMessage, COLORS } = this.props;
        let image_url = currentMessage.image.url
        const {width, aspectRatio} = currentMessage.image;
        if (image_url.substring(0,4) !== 'http'){
            image_url = this.props.image_adder + currentMessage.image.url
        }
        
        const {showHeight,showWidth} = this.getImageShowDimenstions(width, aspectRatio);

        if (currentMessage.hasOwnProperty('image') && currentMessage.image) {
            return (
        <View style={[styles.container, containerStyle]}>
            <TouchableOpacity
                onLongPress={()=>{this.saveFileToGallery(image_url, currentMessage.image.name)}}
                activeOpacity={0.9}
                onPress={()=>{this.props.onViewerSelect(true);this.setState({imageViewerActive:true})}}>
                <View style={{...styles.imageView, ...imageStyle, width:IMAGE_WIDTH,
                    height:IMAGE_WIDTH/currentMessage.image.aspectRatio, backgroundColor:COLORS.LIGHT}}>
                    {
                        (!this.state.imageLoadError)?(
                            <Image {...imageProps} 
                                style={{flex:1}} 
                                source={{ uri: image_url, cache:'immutable'}}
                                onError={()=>this.setState({imageLoadError:true})}
                            />
                        ):(
                            <View style={{flex:1, justifyContent:'center', alignItems:'center'}}>
                                <Text style={{fontFamily:FONTS.GOTHAM_BLACK, fontSize:24, 
                                    color: COLORS.DARK, 
                                    textAlign:'center'}}>
                                    IMAGE REMOVED FROM SERVER
                                </Text>
                            </View>
                        )
                    }
                </View>
                
            </TouchableOpacity>
            <ImageViewer
                isVisible={this.state.imageViewerActive}
                onClose = {()=>{this.props.onViewerSelect(false);this.setState({imageViewerActive:false})}}
                COLORS = {COLORS}
                imageHeight = {showHeight}
                imageWidth = {showWidth}
                source = {{uri:image_url}}
            />
        </View>
            );
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