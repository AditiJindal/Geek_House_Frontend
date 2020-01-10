import React from 'react';
import {View, TouchableOpacity, Text} from 'react-native';
import {Overlay} from 'react-native-elements';
import {FONTS} from '../Constants';
import Icon from 'react-native-vector-icons/Feather'
import ImagePicker from 'react-native-image-picker';


// USAGE : write this in render() of the component
// <ImageSelector
//   COLORS = {this.props.COLORS}
//   onRef={ref=>this.imageSelector = ref}
//   onSelect = {(response)=>{console.log(response)}}
// />

// call this.showImageSelector() from anywhere, when user selects an image,
// onSelect will be called, else it won't be called

class ImageSelector extends React.Component{

  state = {
    imageSelectorOpen:false
  }

  componentDidMount(){
    this.props.onRef(this)
  }

  showImageSelector(){
    this.setState({imageSelectorOpen:true})
  }

  render(){
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
                if (!response.didCancel){this.props.onSelect(response)}
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
              <Icon size={72} name="image" type="feather"
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
                if (!response.didCancel){this.props.onSelect(response)}
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
            <Icon size={72} name="camera" type="feather"
            color={COLORS.LESSER_DARK}/>
            <View style={{height:50, justifyContent:'center'}}>
              <Text style={{color:COLORS.LESSER_DARK,
                fontFamily:FONTS.PRODUCT_SANS, textAlign:'center', fontSize:12}}>
                {`Click from\nCamera`}
              </Text>
            </View>
          </TouchableOpacity>
        </Overlay>
      </View>
    )
  }
}

export default ImageSelector;