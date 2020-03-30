import PropTypes from 'prop-types';
import React from 'react';
import { StyleSheet, View, Keyboard, ViewPropTypes, Text, 
    TouchableOpacity, ImageBackground} from 'react-native';
import Composer from './Composer';
import Image from 'react-native-fast-image';
import Send from './Send';
import Actions from './Actions';
import {COLORS_DARK_THEME, FONTS} from '../../Constants';
import Loading from '../Loading';
import {Overlay, Icon} from 'react-native-elements';
import ImagePicker from 'react-native-image-picker';
import ImageResizer from 'react-native-image-resizer';
import prettysize from 'prettysize';
import GiphyView from '../GiphyView';


const styles = StyleSheet.create({
    container: {
        // borderTopWidth: StyleSheet.hairlineWidth,
        bottom: 0,
        left: 0,
        right: 0,
        position:'absolute'
    },
    primary: {
        margin:10,
        marginTop:0,
        padding:5,
        borderRadius:15,
    },
    accessory: {
        height: 44,
    },
});
export default class InputToolbar extends React.Component {
    constructor() {
        super(...arguments);
        this.state = {
            imageSelectorOpen: false,
            isKeyboardVisible:false,
            giphyViewVisible: false
        };
    }
    componentDidMount() {
        this.keyboardWillShowListener = Keyboard.addListener('keyboardDidShow', ()=>{this.setState({isKeyboardVisible:true})});
        this.keyboardWillHideListener = Keyboard.addListener('keyboardDidHide', ()=>{this.setState({isKeyboardVisible:false})});
    }
    componentWillUnmount() {
        if (this.keyboardWillShowListener) {
            this.keyboardWillShowListener.remove();
        }
        if (this.keyboardWillHideListener) {
            this.keyboardWillHideListener.remove();
        }
    }

    renderActions() {
        const { containerStyle, ...props } = this.props;
        if (this.props.renderActions) {
            return this.props.renderActions(props);
        }
        else if (this.props.onPressActionButton) {
            return <Actions {...props}/>;
        }
        return null;
    }
    renderSend() {
        if (this.props.renderSend) {
            return this.props.renderSend(this.props);
        }
        return <Send {...this.props}/>;
    }
    renderComposer() {
        if (this.props.renderComposer) {
            return this.props.renderComposer(this.props);
        }
        return <Composer {...this.props}/>;
    }
    renderAccessory() {
        if (this.props.renderAccessory) {
            return (<View style={[styles.accessory, this.props.accessoryStyle]}>
          {this.props.renderAccessory(this.props)}
        </View>);
        }
        return null;
    }
    getImageResize(imageSize){
        let resize = {...imageSize}
        const maxWidth = 2160;
        const maxHeight = 1080;
        let ratio = imageSize.width/imageSize.height
        if (resize.width>maxWidth){
        resize={width:maxWidth, height:Math.floor(maxWidth/ratio)}
        }
        if (resize.height>maxHeight){
        resize={width:Math.floor(maxHeight*ratio), height:maxHeight}
        }
        return resize
    }
    handleImage(image){
        if (image.uri){
            const imageSize = {width:image.width, height:image.height};
            const resize = this.getImageResize(imageSize);
            ImageResizer.createResizedImage(image.uri, resize.width, resize.height, "JPEG", 90).then((resizedImage)=>{
                const aspectRatio = resize.width/resize.height;
                const to_send = {
                    url:resizedImage.uri, 
                    height:resize.height, 
                    width: resize.width, aspectRatio
                }
                const imageMetaData = {newSize:resizedImage.size, name: image.fileName}
                this.props.onImageSelect(to_send, imageMetaData)
            })
        }
    }
    renderPhotoSelector(){
        const {COLORS} = this.props;
        const ImageOptions={
            noData: true,
            mediaType:'photo',
            chooseWhichLibraryTitle: "Select an App",
            permissionDenied : {
              title: "Permission Required",
              text: "We need your permission to access your camera/photos. To be able to do that, press 'Grant', and\
 allow the storage and camera permissions",
              reTryTitle: "Grant",
              okTitle: "Not Now"
            }
          }
        return (
            <View style={{marginHorizontal:5}}>
                <Overlay isVisible={this.state.imageSelectorOpen}
                    height="auto" width="auto"
                    overlayStyle={{flexDirection:'row',backgroundColor:'rgba(0,0,0,0)', elevation:0}}
                    onBackdropPress={()=>{this.setState({imageSelectorOpen:false})}}>
                    <>
                    <TouchableOpacity
                        onPress={()=>{
                            this.setState({imageSelectorOpen:false});
                            ImagePicker.launchImageLibrary(ImageOptions, (response)=>{
                                this.handleImage(response)
                            })
                        }}
                        activeOpacity={0.8} 
                        style={{height:180, width:120, justifyContent:'space-around', alignItems:'center', elevation:20,borderRadius:15,
                        backgroundColor:COLORS.LESSER_LIGHT, marginRight:15}}>
                        <View style={{height:50, justifyContent:'center'}}>
                            <Text style={{color:COLORS.LESSER_DARK,
                                fontFamily:FONTS.RALEWAY_BOLD, textAlign:'center', fontSize:16}}>
                                Gallery
                            </Text>
                        </View>
                        <Icon size={72} name="image" type={'feather'}
                        color={COLORS.LESSER_DARK}/>
                        <View style={{height:50, justifyContent:'center'}}>
                            <Text style={{color:COLORS.LESSER_DARK,
                                fontFamily:FONTS.PRODUCT_SANS, textAlign:'center', fontSize:12}}>
                                {`Select from\nGallery`}
                            </Text>
                        </View>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={()=>{
                            this.setState({imageSelectorOpen:false});
                            ImagePicker.launchCamera(ImageOptions, (response)=>{
                                this.handleImage(response)
                            })
                        }}
                        activeOpacity={0.8}
                        style={{height:180, width:120, justifyContent:'space-around', alignItems:'center', elevation:20,borderRadius:15,
                        backgroundColor:COLORS.LESSER_LIGHT}}>
                        <View style={{height:50, justifyContent:'center'}}>
                            <Text style={{color:COLORS.LESSER_DARK,
                                fontFamily:FONTS.RALEWAY_BOLD, textAlign:'center', fontSize:16}}>
                                Camera
                            </Text>
                        </View>
                        <Icon size={72} name="camera" type={'feather'}
                        color={COLORS.LESSER_DARK}/>
                        <View style={{height:50, justifyContent:'center'}}>
                            <Text style={{color:COLORS.LESSER_DARK,
                                fontFamily:FONTS.PRODUCT_SANS, textAlign:'center', fontSize:12}}>
                                {`Click from\nCamera`}
                            </Text>
                        </View>
                    </TouchableOpacity>
                    </>
                </Overlay>
                {(!this.state.imageSelectorOpen)?(
                    <TouchableOpacity activeOpacity={0.8}
                    onPress={()=>{this.setState({imageSelectorOpen:true})}}>
                        <Icon size={22} name="image" type={'feather'} color={COLORS.LESSER_DARK} />
                    </TouchableOpacity>
                    
                ):null}
            </View>
        )
    }
    renderGifButton(){
        const {COLORS} = this.props

        if (this.state.giphyViewVisible){
            return(
                <TouchableOpacity activeOpacity={0.8} style={{marginRight:5}}
                    onPress={()=>{this.setState({giphyViewVisible:false})}}>
                    <Icon size={26} name="chevron-down" type={'material-community'} color={COLORS.LESSER_DARK} />
                </TouchableOpacity>
            )
        }

        return(
            <TouchableOpacity activeOpacity={0.8} style={{marginRight:5}}
                onPress={()=>{this.setState({giphyViewVisible:true})}}>
                <Icon size={30} name="gif" type={'material-community'} color={COLORS.LESSER_DARK} />
            </TouchableOpacity>
        )
    }
    renderSelectedImage(){
        const {COLORS, imageUploading, imageMetaData} = this.props;
        const image = this.props.selectedImage;

        if (image){
            return (
                <View style={{flex:1, borderRadius:10, overflow:'hidden', height:100, marginBottom:5}}>
                    <ImageBackground blurRadius={(!imageMetaData.isGif)?1.5:0}
                        source={{uri:image.url}} style={{flex:1, alignItems:'flex-end'}}>
                        {
                            (imageMetaData.isGif)?(
                                <View style={{height:100,width:"100%",zIndex:10,
                                    backgroundColor:'rgba(150,150,150,0.3)', position:'absolute'}}/>
                            ):null
                        }
                        {
                            (imageUploading)?(
                                <View style={{alignItems:'center',right:0, left:0, justifyContent:'center',
                                    bottom:0, top:0, position:'absolute', 
                                    backgroundColor:(this.props.theme==='light')?"rgba(255,255,255,0.4)":"rgba(50,50,50,0.4)"}}>
                                    <Loading size={42} white={(this.props.theme!=='light')}/>
                                </View>
                            ):null
                        }
                        <Icon size={24} name="x" type={'feather'} onPress={()=>{this.props.onImageCross()}}
                            containerStyle={{backgroundColor:this.props.primaryStyle.backgroundColor, 
                            position:'relative',right:-3, top:-3,zIndex:10,
                            borderBottomLeftRadius:15, paddingLeft:2.5, paddingBottom:2.5}}
                            color={COLORS.LIGHT_GRAY}
                        />
                        {
                            (!imageMetaData.isGif)?(
                                <View style={{position:'absolute',bottom:5, left:5, 
                                    backgroundColor:"rgba(50,50,50,0.3)",
                                    borderRadius:7.5, paddingVertical:5, paddingHorizontal:10}}>
                                    <Text style={{color:COLORS_DARK_THEME.LESS_DARK,
                                        fontFamily:FONTS.PRODUCT_SANS_BOLD, fontSize:8}}>
                                        {imageMetaData.name}
                                    </Text>
                                    <Text style={{color:COLORS_DARK_THEME.LESSER_DARK,
                                        fontFamily:FONTS.PRODUCT_SANS, fontSize:8}}>
                                        Image size: {prettysize(imageMetaData.newSize)}
                                    </Text>
                                </View>
                            ):null
                        }
                    </ImageBackground>
                </View>
            )
        }
    }

    render() {
        return (<View style={[
            styles.container,
            this.props.containerStyle,
        ]}> 
        <View style={[styles.primary, this.props.primaryStyle]}>
            {this.renderSelectedImage()}
            <View style={{flexDirection:'row', alignItems:'center'}}>
                {this.renderActions()}
                {this.renderComposer()}
                {this.renderPhotoSelector()}
                {this.renderGifButton()}
                {this.renderSend()}
            </View>
            {
                (this.state.giphyViewVisible)?(
                    <GiphyView 
                        onSelect = {(gif) => {
                            this.setState({giphyViewVisible:false})
                            this.props.onImageSelect(gif, {isGif:true});
                            Keyboard.dismiss();
                        }}
                        isKeyboardVisible={this.state.isKeyboardVisible}/>
                ):null
            }
        </View>
        {this.renderAccessory()}
      </View>);
    }
}
InputToolbar.defaultProps = {
    renderAccessory: null,
    renderActions: null,
    renderSend: null,
    renderComposer: null,
    containerStyle: {},
    primaryStyle: {},
    accessoryStyle: {},
    onPressActionButton: () => { },
};
InputToolbar.propTypes = {
    renderAccessory: PropTypes.func,
    renderActions: PropTypes.func,
    renderSend: PropTypes.func,
    renderComposer: PropTypes.func,
    onPressActionButton: PropTypes.func,
    containerStyle: ViewPropTypes.style,
    primaryStyle: ViewPropTypes.style,
    accessoryStyle: ViewPropTypes.style,
};
//# sourceMappingURL=InputToolbar.js.map