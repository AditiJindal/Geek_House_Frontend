import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { StyleSheet, View, ViewPropTypes, Dimensions,
    TouchableOpacity,StatusBar, Image} from 'react-native';
import {check, request, PERMISSIONS, RESULTS} from 'react-native-permissions';
import RNFileSystem from 'react-native-fs';
import { Overlay,Icon} from 'react-native-elements';
import ImageZoom from 'react-native-image-pan-zoom';

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
    state={
        imageViewerActive: false
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
        
        this.props.showTimedAlert(2000, 'Saving image...');


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
        const { containerStyle, imageProps, imageStyle, currentMessage,COLORS } = this.props;
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
                delayLongPress={1500} activeOpacity={0.9}
                onPress={()=>{this.props.onViewerSelect(true);this.setState({imageViewerActive:true})}}>
                <Image {...imageProps} 
                style={{...styles.image, ...imageStyle, height:150/currentMessage.image.aspectRatio}} 
                source={{ uri: image_url, cache:'cacheOnly'}} blurRadius={this.state.imageViewerActive?8:0} />
            </TouchableOpacity>
            <Overlay isVisible={this.state.imageViewerActive} height="100%" width="100%"
                onRequestClose={()=>{this.props.onViewerSelect(false);this.setState({imageViewerActive:false})}}
                overlayBackgroundColor={"rgba(0,0,0,0)"}
                containerStyle={{padding:0, margin:0, elevation:0}}>
                <>
                <StatusBar 
                    barStyle={(this.props.theme==='light')?'dark-content':'light-content'}
                    backgroundColor={COLORS.OVERLAY_COLOR}
                />
                <TouchableOpacity style={{flex:1, justifyContent:'center', alignItems:'center'}}
                    onPress={()=>{this.props.onViewerSelect(false);this.setState({imageViewerActive:false})}} activeOpacity={1}>
                    
                    <TouchableOpacity
                        onPress={()=>{this.props.onViewerSelect(false);this.setState({imageViewerActive:false})}}
                        style={{padding:10, zIndex:10, top:-5, right:5, position:'absolute'}}>
                        <Icon name="x-circle" size={22} 
                        color={COLORS.RED} type={'feather'}/>
                    </TouchableOpacity>
                    
                    <ImageZoom  imageHeight={showHeight} imageWidth={showWidth}
                        cropHeight={showHeight} cropWidth={showWidth}  
                        style={{backgroundColor:'rgba(0,0,0,0.75)', borderRadius:15, overflow:'hidden'}}
                        enableSwipeDown={true}
                        onSwipeDown ={()=>{this.props.onViewerSelect(false);this.setState({imageViewerActive:false})}}>
                        <Image source={{uri:image_url}} style={{height:showHeight, width:showWidth}}/>
                    </ImageZoom>
                </TouchableOpacity>
                </>
            </Overlay>
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