import React, {Component} from 'react';
import { View, StyleSheet, TextInput, TouchableOpacity, Text, ActivityIndicator}from 'react-native';
import {Icon, Overlay} from 'react-native-elements'
import CustomAlert from '../components/CustomAlert';
import {FONTS, ERROR_MESSAGES} from '../Constants';
import SView from 'react-native-simple-shadow-view';
import vision from '@react-native-firebase/ml-vision';
import ImagePicker from 'react-native-image-picker';
import Loading from './Loading';
import crashlytics from '@react-native-firebase/crashlytics';


const MIN_TI_HEIGHT = 120;
export default class WriteView extends Component {

  constructor() {
    super();
    this.state={
      isVisible:false,
      imageSelectorOpen:false,
      visionLoading: false,
    }
  }

  async doTextRecognition(image_path){
    if (!image_path){
      return
    }
    this.setState({visionLoading:true})
    vision().textRecognizerProcessImage(image_path).then((response)=>{
      if (response.text.length===0){
        this.props.timedAlert.showAlert(3000,"Could not identify text in this image")
        this.setState({visionLoading:false})
        return
      }
      else if (response.text.length<10){
        this.timedAlert.showAlert(3000,"Could not identify enough text")
      }
      this.props.onContentChange(response.text, this.props.index);
      this.setState({visionLoading:false})
    }).catch(e=>crashlytics().log("WriteView LINE 40"+e.toString()))

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
                this.doTextRecognition(response.path)
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
                this.doTextRecognition(response.path)
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

  renderTextInput(){
    return(
      <>  
        <TextInput 
          numberOfLines={5}
          multiline={true}
          maxLength={512}
          textAlignVertical="top"
          value={this.props.obj.content}
          onChangeText={(value)=>{this.props.onContentChange(value, this.props.index)}}
          textBreakStrategy="highQuality"
          placeholderTextColor={COLORS.LESSER_DARK}
          style={{...styles.ContentStyle, color:COLORS.DARK}} 
          placeholder={"Enter something..."}/>
        <View style={{height:25}}/>
        <TouchableOpacity activeOpacity={0.6} onPress={()=>{this.setState({imageSelectorOpen:true})}}
          style={{flexDirection:'row', alignItems:'flex-end', position:'absolute', bottom:0,
          paddingVertical:5, paddingHorizontal:12, backgroundColor:COLORS.LESSER_LIGHT,
          borderBottomLeftRadius:15, borderTopRightRadius:15, elevation:2}}>
          <Icon type="feather" name="camera" size={15} color={COLORS.LESS_DARK}/>
          <Text style={{fontFamily:FONTS.RALEWAY_LIGHT, color:COLORS.LESS_DARK, 
            fontSize:14, marginLeft:7}}>
            Scan Text
          </Text>
        </TouchableOpacity>
      </>
    )
  }

  render() {
    const {COLORS} = this.props;
    return(
      <SView style={{...styles.CardViewStyle, 
        backgroundColor:(this.props.theme==='light')?COLORS.LIGHT:COLORS.LESS_LIGHT}}>
        {this.renderPhotoSelector()}
        <CustomAlert
          theme={this.props.theme}
          COLORS = {COLORS}
          isVisible={this.state.isVisible}
          onFirstButtonPress={() => {this.setState({isVisible:false});this.props.onClose(this.props.index); this.props.onBackdropPress()}}
          onSecondButtonPress={()=>{this.setState({isVisible:false});this.props.onBackdropPress()}}
          onThirdButtonPress={()=>{this.setState({isVisible:false});this.props.onBackdropPress()}}
          onBackdropPress={()=>{this.setState({isVisible:false});this.props.onBackdropPress()}}
          message = {ERROR_MESSAGES.CONFIRM_WRITE_VIEW_DELETE}
        />
        <View style={{justifyContent:'space-between', flexDirection:'row', alignItems:'center',
          borderColor:(this.props.theme==='light')?COLORS.LESS_LIGHT:COLORS.LIGHT_GRAY,
          borderBottomWidth:0.6, marginHorizontal:10}}>
          <TextInput style={{...styles.SubHeadingStyle, flex:1,
            color:COLORS.DARK,}}
            placeholderTextColor={COLORS.LESSER_DARK}
            value={this.props.obj.sub_heading}
            maxLength={128}
            
            onChangeText={(value)=>{this.props.onSubHeadingChange(value, this.props.index)}}
            textBreakStrategy="highQuality"
            multiline={false}
            textAlignVertical="top"
            multiline={true}
            placeholder={'Enter a heading'}/>
          <TouchableOpacity 
            onPress={() => {this.setState({isVisible:true}); this.props.onClosePressed()}}>
            <Icon size={24} name='close-circle' type='material-community'
              color={COLORS.RED}/>          
          </TouchableOpacity>
        </View>
        {
          (this.state.visionLoading)?(
            <View style={{justifyContent:'center', alignItems:'center',
              height:MIN_TI_HEIGHT+30, alignSelf:'center'}}>
              <Loading size={64} white={(this.props.theme!=='light')}/>
            </View>
          ):
          (this.renderTextInput())
        }
        <Text style={{bottom:10, right:10, position:'absolute', fontFamily:FONTS.PRODUCT_SANS, fontSize:10,
          color:(this.props.theme==='light')?COLORS.LESS_LIGHT:COLORS.LIGHT_GRAY}}>
          Card {this.props.index}
        </Text>
      </SView>
    );
  }
}

const styles = StyleSheet.create({
  CardViewStyle:{
    shadowColor:'#222222',shadowOpacity:0.23,
    shadowOffset:{width:0,height:7},shadowRadius:7,
    marginHorizontal:25,
    marginVertical:15,
    borderRadius:15,
  },
  SubHeadingStyle:{
    fontFamily:FONTS.MERRIWEATHER,
    fontSize:20,
    marginBottom:5,
    paddingBottom:3,
  },
  ContentStyle:{
    textAlign:'justify',
    fontFamily:FONTS.MERRIWEATHER,
    fontSize:16,
    marginHorizontal:10,
    marginBottom:5,
    minHeight:MIN_TI_HEIGHT
  }
})