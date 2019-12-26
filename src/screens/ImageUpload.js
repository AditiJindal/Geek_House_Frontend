import React, {Component} from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar, Image}from 'react-native';
import {connect} from 'react-redux';
import {setImage} from '../actions/WriteAction';
import {Icon} from 'react-native-elements';
import {Actions} from 'react-native-router-flux';
// import * as ImagePicker from 'expo-image-picker';
import {FONTS, ERROR_BUTTONS, COLORS_DARK_THEME,COLORS_LIGHT_THEME, LOG_EVENT} from '../Constants';
import LinearGradient from 'react-native-linear-gradient';
import ArticleTile from '../components/ArticleTile';
import CustomAlert from '../components/CustomAlert';
import {logEvent} from '../actions/ChatAction';
// import * as ImageManipulator from 'expo-image-manipulator';
import ImagePicker from 'react-native-image-picker';
import ImageResizer from 'react-native-image-resizer';
import ImageEditor from "@react-native-community/image-editor";
import changeNavigationBarColor from 'react-native-navigation-bar-color';
import SView from 'react-native-simple-shadow-view'


ImageManipulator = View;
// ImagePicker = View

class ImageUpload extends Component {

  constructor() {
    super();
    this.state={
      image:{},
      imageSize:{},
      alertVisible:false,
    }
  }

  componentDidMount(){
    if (this.props.image){
      this.setState({image: this.props.image})
    }
  }

  renderChangeImageButton(){
    if (this.state.image.uri){
      return (
        <TouchableOpacity  style={{bottom:15, left:15, position:"absolute"}}
          activeOpacity={0.7} onPress={()=>{this.pickImage()}}>
          <LinearGradient style={{borderRadius:10, height:58, paddingHorizontal:15, 
            elevation:7, justifyContent:'center', alignItems:"center"}} 
            colors={["#fc521a", "#f79c33"]} start={{x:0, y:1}} end={{x:1, y:1}}>
            <Text style={{fontFamily:FONTS.GOTHAM_BLACK, fontSize:22, color:COLORS_LIGHT_THEME.LESSER_LIGHT}}>Change</Text>
            <Text style={{fontFamily:FONTS.GOTHAM_BLACK, fontSize:14, color:COLORS_LIGHT_THEME.LESSER_LIGHT}}>Image</Text>
          </LinearGradient>
        </TouchableOpacity>
      )
    }
    else{
      return <View/>
    }
  }

  renderNextButton(){
    return (
      <TouchableOpacity style={{borderRadius:10, height:58, paddingHorizontal:15,
        backgroundColor:(this.props.theme==='light')?COLORS_LIGHT_THEME.LIGHT:COLORS_DARK_THEME.LIGHT, 
        elevation:7, justifyContent:'center', alignItems:"center",
        bottom:15, right:15, position:"absolute", 
        borderColor:(this.props.theme==='light')?COLORS_LIGHT_THEME.GREEN:COLORS_DARK_THEME.GREEN, 
        borderWidth:2}} activeOpacity={0.7} 
        onPress={()=>{(this.props.image.uri)?Actions.replace("publish"):this.setState({alertVisible:true})}}>
        <Text style={{fontFamily:FONTS.GOTHAM_BLACK, fontSize:24, 
          color:(this.props.theme==='light')?COLORS_LIGHT_THEME.GREEN:COLORS_DARK_THEME.GREEN}}>NEXT</Text>
        <Text style={{fontFamily:FONTS.PRODUCT_SANS_BOLD, fontSize:12, 
          color:(this.props.theme==='light')?COLORS_LIGHT_THEME.GREEN:COLORS_DARK_THEME.GREEN}}>Preview</Text>
      </TouchableOpacity>
    )
  }

  getImageResize(imageSize){
    let resize = {...imageSize}
    let ratio = imageSize.width/imageSize.height
    if (resize.width>800){
      resize={width:800, height:Math.floor(800/ratio)}
    }
    if (resize.height>600){
      resize={width:Math.floor(600*ratio), height:600}
    }
    return resize
  }

  getCropCoordinates({width,height}){
    let originX, originY, crop;

    if ((width/height)<(4/3)){
      let requiredHeight = Math.floor(width*(3/4))
      let remainingHeight = height-requiredHeight;
      originX = 0;
      originY = Math.floor(remainingHeight/2);
      crop = {offset:{x:originX, y:originY}, size:{width, height:requiredHeight}};
    }
    else{
      let requiredWidth = Math.floor(height * (4/3));
      let remainingWidth = width-requiredWidth;
      originY = 0;
      originX = Math.floor(remainingWidth/2);
      crop = {offset:{x:originX, y:originY}, size:{width:requiredWidth, height}}
    }
    return crop 
  }

  pickImage(){
    const ImageOptions={
      noData: true,
      mediaType:'photo',
      chooseWhichLibraryTitle: "Select an App"
    }
    // // console.log("in image")
    
    ImagePicker.launchImageLibrary(ImageOptions, (image)=>{
      if (!image.didCancel){
        delete image.data;
        const imageSize = {width:image.width, height:image.height};
        const resize = this.getImageResize(imageSize);
        crop = this.getCropCoordinates(resize);

        ImageResizer.createResizedImage(image.uri, resize.width, resize.height, "JPEG", 80).then((resized_image)=>{
          ImageEditor.cropImage(resized_image.uri, crop).then((crop_image)=>{
            image = {uri:crop_image}
            this.setState({image, imageSize:{width:resize.width, height:resize.height}});
            this.props.setImage(image);
          })  
        })
      }
    })
  }

  renderImagePicker(){
    return (
      <TouchableOpacity style={{backgroundColor:(this.props.theme==='light')?COLORS_LIGHT_THEME.LIGHT:COLORS_DARK_THEME.LIGHT, 
        borderRadius:10, elevation:3,
        alignSelf:'center', height:180, width:180, borderWidth:3, 
        borderColor:(this.props.theme==='light')?COLORS_LIGHT_THEME.GRAY:COLORS_DARK_THEME.LESSER_DARK,}} 
        onPress={()=>{this.pickImage()}}>
        <View style={{flex:1,justifyContent:'center', alignItems:'center'}}>
          <Icon name="image" type="material-community" size={128} 
            color={(this.props.theme==='light')?COLORS_LIGHT_THEME.GRAY:COLORS_DARK_THEME.LESSER_DARK}/>
          <Text style={{color:(this.props.theme==='light')?COLORS_LIGHT_THEME.LIGHT_GRAY:COLORS_DARK_THEME.LESSER_DARK, 
            fontFamily:FONTS.RALEWAY, fontSize:16}}>
            Select an Image
          </Text>
        </View>
      </TouchableOpacity>      
    );
  }

  renderChoosenImage(){
    const {image} = this.state;
    if (image.uri){
      data = {image: image.uri, article_id: -1, topic: this.props.topic,
        preview_contents:this.props.contents, category:this.props.category}
      return(
        <ArticleTile size={180} data={data} theme={this.props.theme}/>
      )
    }
    else{
      return this.renderImagePicker()
    }
  }

  renderBack(){
    return (
      <View style={{margin:8, height:70, justifyContent:'space-between',
        alignItems:'center', flexDirection:'row'}}>
          <TouchableOpacity onPress={()=>{Actions.replace("writearticle");logEvent(LOG_EVENT.SCREEN_CHANGE, 'writearticle');}}
            activeOpacity={0.75}>
            <SView
              style={{shadowColor:'#202020',shadowOpacity:0.2, shadowOffset:{width:0,height:7.5},shadowRadius:7, 
              borderRadius:30, padding:10, 
              backgroundColor:(this.props.theme==='light')?COLORS_LIGHT_THEME.LIGHT:COLORS_DARK_THEME.LESS_LIGHT,
              marginRight:15, justifyContent:'center', alignItems:'center', flexDirection:'row'}}>
              <Icon name="arrow-left" type="material-community" size={26}
                containerStyle={{height:26, width:26, justifyContent:'center', alignItems:'center'}} 
                color={(this.props.theme==='light')?COLORS_LIGHT_THEME.LESS_DARK:COLORS_DARK_THEME.LESS_DARK}/>
              <Text style={{color:(this.props.theme==='light')?COLORS_LIGHT_THEME.LESS_DARK:COLORS_DARK_THEME.LESS_DARK, 
                fontFamily:FONTS.RALEWAY,marginHorizontal:3, 
                fontSize:16, textAlignVertical:'center'}}>
                edit <Text style={{fontSize:14}}>article</Text>
              </Text>
            </SView>
          </TouchableOpacity>
          
          <Text style={{...styles.TextStyle, 
            color:(this.props.theme==='light')?COLORS_LIGHT_THEME.DARK:COLORS_DARK_THEME.DARK}}>
            upload image
          </Text>
      </View>
    )
  }

  getStatusBarColor(){
    let statusBarColor = (this.props.theme==='light')?COLORS_LIGHT_THEME.LIGHT:COLORS_DARK_THEME.LIGHT
    if (this.state.alertVisible){
      statusBarColor = (this.props.theme==='light')?COLORS_LIGHT_THEME.OVERLAY_COLOR:COLORS_DARK_THEME.OVERLAY_COLOR
    }
    return statusBarColor
  }

  renderAlert(){
    return (
      <View>
        <StatusBar
          backgroundColor={this.getStatusBarColor()}
          barStyle={(this.props.theme==='light')?'dark-content':'light-content'}/>
        {changeNavigationBarColor(this.getStatusBarColor(), (this.props.theme==='light'))}
        <CustomAlert
          theme={this.props.theme}
          isVisible = {this.state.alertVisible}
          onFirstButtonPress = {() => {this.setState({alertVisible:false})}}
          onThirdButtonPress = {() => {this.setState({alertVisible:false});Actions.replace("publish");logEvent(LOG_EVENT.SCREEN_CHANGE, 'publish');}}
          onBackdropPress = {() => {this.setState({alertVisible:false});}}
          message = {{
            title: "Warning ⚠️",
            content: "Adding an image is good for search results as well as increases user satisfaction from the article. It also looks cool",
            type:[
              {label:'  Skip  ', color:(this.props.theme==='light')?COLORS_LIGHT_THEME.RED:COLORS_DARK_THEME.RED},
              {label:ERROR_BUTTONS.TICK},
            ]
          }}
        />
      </View>
    )
  }

  render() {
    return(
      <View style={{flex:1, backgroundColor:(this.props.theme==='light')?COLORS_LIGHT_THEME.LIGHT:COLORS_DARK_THEME.LIGHT}}>
        {this.renderBack()}
        <View style={{alignSelf:'center', justifyContent:'center', flex:1, margin:20}}>
          {this.renderAlert()}
          <View style={{justifyContent:'center', alignItems:'center', width:"100%"}}>
            {this.renderChoosenImage()}
          </View>
        </View>
        
        
        
        {this.renderNextButton()}
        {this.renderChangeImageButton()}
      </View>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    contents: state.write.contents,
    topic: state.write.topic,
    category: state.write.category,
    image: state.write.image,

    theme: state.chat.theme
  }
}

export default connect(mapStateToProps, {setImage})(ImageUpload)

const styles = StyleSheet.create({
  TextStyle:{
    fontSize:28,
    fontFamily:FONTS.GOTHAM_BLACK,
  },
})