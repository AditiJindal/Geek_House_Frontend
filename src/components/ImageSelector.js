import React from 'react';
import {View, TouchableOpacity, Text, StatusBar} from 'react-native';
import {Overlay, Icon} from 'react-native-elements';
import {FONTS} from '../Constants';
import Ripple from './Ripple';
import ImagePicker from 'react-native-image-picker';


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

class ImageSelector extends React.Component{

  state = {
    imageSelectorOpen:false,
    callbackFunc: ()=>{}
  }

  componentDidMount(){
    this.props.onRef(this)
  }

  showImageSelector(callbackFunc){
    this.setState({imageSelectorOpen:true, callbackFunc})
  }

  render(){
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
      <Overlay isVisible={this.state.imageSelectorOpen}
        height="auto" width="auto"
        overlayStyle={{flexDirection:'row',backgroundColor:'rgba(0,0,0,0)', elevation:0}}
        onBackdropPress={()=>{this.setState({imageSelectorOpen:false})}}>
        <>
        <StatusBar 
          barStyle={'light-content'}
          backgroundColor={COLORS.OVERLAY_COLOR}/>
        <Ripple rippleContainerBorderRadius={15}
          onPress={()=>{
            this.setState({imageSelectorOpen:false});
            ImagePicker.launchImageLibrary(ImageOptions, (response)=>{
              if (!response.didCancel){this.state.callbackFunc(response)}
            })
          }}
          style={{height:180, width:120, justifyContent:'space-around', alignItems:'center',
          backgroundColor:COLORS.LESSER_LIGHT, marginRight:15, borderRadius:15, elevation:20,}}>
          <View style={{height:50, justifyContent:'center'}}>
            <Text style={{color:COLORS.LESSER_DARK,
              fontFamily:FONTS.RALEWAY_BOLD, textAlign:'center', fontSize:16}}>
              Gallery
            </Text>
            </View>
            <Icon size={72} name="image" type="feather"
            color={COLORS.LESSER_DARK}/>
            <View style={{height:50, justifyContent:'center'}}>
              <Text style={{color:COLORS.LESSER_DARK,
                fontFamily:FONTS.PRODUCT_SANS, textAlign:'center', fontSize:12}}>
                {`Select from\nGallery`}
              </Text>
            </View>
          </Ripple>
          <Ripple
          onPress={()=>{
            this.setState({imageSelectorOpen:false});
            ImagePicker.launchCamera(ImageOptions, (response)=>{
              if (!response.didCancel){this.state.callbackFunc(response)}
            })
          }}
          rippleContainerBorderRadius={15}
          style={{height:180, width:120, justifyContent:'space-around', alignItems:'center', 
          borderRadius:15, elevation:20, backgroundColor:COLORS.LESSER_LIGHT}}>
          <View style={{height:50, justifyContent:'center'}}>
            <Text style={{color:COLORS.LESSER_DARK,
                fontFamily:FONTS.RALEWAY_BOLD, textAlign:'center', fontSize:16}}>
                Camera
            </Text>
          </View>
          <Icon size={72} name="camera" type="feather"
          color={COLORS.LESSER_DARK}/>
          <View style={{height:50, justifyContent:'center'}}>
            <Text style={{color:COLORS.LESSER_DARK,
              fontFamily:FONTS.PRODUCT_SANS, textAlign:'center', fontSize:12}}>
              {`Click from\nCamera`}
            </Text>
          </View>
        </Ripple>
        </>
      </Overlay>
    )
  }
}

export default ImageSelector;