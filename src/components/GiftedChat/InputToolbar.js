import PropTypes from 'prop-types';
import React from 'react';
import { StyleSheet, View, Keyboard, ViewPropTypes, Text, 
    StatusBar, TouchableOpacity,ImageBackground, Image} from 'react-native';
import Composer from './Composer';
import Send from './Send';
import Actions from './Actions';
import {COLORS_DARK_THEME, COLORS_LIGHT_THEME, FONTS} from '../../Constants'
import Icon from 'react-native-vector-icons/Feather';
import {Overlay} from 'react-native-elements';
import ImagePicker from 'react-native-image-picker';
import ImageResizer from 'react-native-image-resizer';
import prettysize from 'prettysize';

const getStatusBarColor = (theme, i) => {
    if (i){
        if (theme==='light'){
            return COLORS_LIGHT_THEME.OVERLAY_COLOR
        }
        else{
            return COLORS_DARK_THEME.OVERLAY_COLOR
        }
    }
    else{
        if (theme==='light'){
            return COLORS_LIGHT_THEME.LIGHT
        }
        else{
            return COLORS_DARK_THEME.LIGHT
        }
    }
}


const styles = StyleSheet.create({
    container: {
        // borderTopWidth: StyleSheet.hairlineWidth,
        bottom: 0,
        left: 0,
        right: 0,
    },
    primary: {
        margin:10,
        marginTop:0,
        padding:5,
        elevation:5,
        borderRadius:15
    },
    accessory: {
        height: 44,
    },
});
export default class InputToolbar extends React.Component {
    constructor() {
        super(...arguments);
        this.state = {
            position: 'absolute',
            imageSelectorOpen: false,
            imageMetaData: {name:"", oldSize:null, newSize:null}
        };
        this.keyboardWillShowListener = undefined;
        this.keyboardWillHideListener = undefined;
        this.keyboardWillShow = () => {
            if (this.state.position !== 'relative') {
                this.setState({
                    position: 'relative',
                });
            }
        };
        this.keyboardWillHide = () => {
            if (this.state.position !== 'absolute') {
                this.setState({
                    position: 'absolute',
                });
            }
        };
    }
    componentDidMount() {
        this.keyboardWillShowListener = Keyboard.addListener('keyboardWillShow', this.keyboardWillShow);
        this.keyboardWillHideListener = Keyboard.addListener('keyboardWillHide', this.keyboardWillHide);
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
                const to_send = {url:resizedImage.uri, height:resize.height, width: resize.width, aspectRatio }
                this.setState({imageMetaData:{newSize:resizedImage.size, name: image.fileName}})
                this.props.onImageSelect(to_send)
            })
        }
    }
    renderPhotoSelector(){
        const {COLORS} = this.props;
        const ImageOptions={
            noData: true,
            mediaType:'photo',
            chooseWhichLibraryTitle: "Select an App"
        }
        return (
            <View style={{paddingHorizontal:10}}>
                <Overlay isVisible={this.state.imageSelectorOpen}
                    height="auto" width="auto"
                    overlayStyle={{flexDirection:'row',backgroundColor:'rgba(0,0,0,0)', elevation:0}}
                    onBackdropPress={()=>{this.setState({imageSelectorOpen:false})}}>
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
                        <Icon size={72} name="image"
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
                        <Icon size={72} name="camera"
                        color={COLORS.LESSER_DARK}/>
                        <View style={{height:50, justifyContent:'center'}}>
                            <Text style={{color:COLORS.LESSER_DARK,
                                fontFamily:FONTS.PRODUCT_SANS, textAlign:'center', fontSize:12}}>
                                {`Click from\nCamera`}
                            </Text>
                        </View>
                    </TouchableOpacity>
                </Overlay>
                {(!this.state.imageSelectorOpen)?(
                    <Icon size={22} name="image"
                    onPress={()=>{this.setState({imageSelectorOpen:true})}}
                    color={COLORS.LESSER_DARK}
                    />
                ):<View/>}
            </View>
        )
    }
    renderSelectedImage(){
        const {COLORS} = this.props;
        const image = this.props.selectedImage;
        if (image){
            return (
                <View style={{flex:1, borderRadius:10, overflow:'hidden', height:100, marginBottom:5}}>
                    <ImageBackground blurRadius = {2} 
                        source={{uri:image.url}} style={{flex:1, alignItems:'flex-end'}}>
                        <Icon size={24} name="x" onPress={()=>{this.props.onImageCross()}}
                            style={{backgroundColor:this.props.primaryStyle.backgroundColor, position:'relative',
                            right:-3, top:-3, color:COLORS.LIGHT_GRAY,
                            borderBottomLeftRadius:15, paddingLeft:2.5, paddingBottom:2.5}}/>
                        <View style={{alignSelf:'flex-start', justifyContent:'flex-end', flex:1, padding:5}}>
                            <Text style={{color:COLORS_DARK_THEME.LESSER_DARK,
                                fontFamily:FONTS.PRODUCT_SANS_BOLD, fontSize:8}}>
                                {this.state.imageMetaData.name}
                            </Text>
                            <Text style={{color:COLORS_DARK_THEME.GRAY,
                                fontFamily:FONTS.PRODUCT_SANS, fontSize:8}}>
                                After compression size: {prettysize(this.state.imageMetaData.newSize)}
                            </Text>
                        </View>
                    </ImageBackground>
                </View>
            )
        }
    }
    render() {
        return (<View style={[
            styles.container,
            this.props.containerStyle,
            { position: this.state.position },
        ]}>
        <StatusBar 
            barStyle={(this.props.theme==='light')?'dark-content':'light-content'}
            backgroundColor={getStatusBarColor(this.props.theme, this.state.imageSelectorOpen)}/>
            
        <View style={[styles.primary, this.props.primaryStyle]}>
            {this.renderSelectedImage()}
            <View style={{flexDirection:'row', alignItems:'center'}}>
                {this.renderActions()}
                {this.renderComposer()}
                {this.renderPhotoSelector()}
                {this.renderSend()}
            </View>
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