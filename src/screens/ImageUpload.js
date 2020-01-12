import React, {Component} from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar}from 'react-native';
import {connect} from 'react-redux';
import _ from 'lodash'
import {setImage} from '../actions/WriteAction';
import {Icon} from 'react-native-elements';
import {Actions} from 'react-native-router-flux';
import {FONTS, ERROR_BUTTONS,COLORS_LIGHT_THEME, LOG_EVENT} from '../Constants';
import LinearGradient from 'react-native-linear-gradient';
import ArticleTile from '../components/ArticleTile';
import CustomAlert from '../components/CustomAlert';
import {logEvent} from '../actions/ChatAction';
import ImagePicker from 'react-native-image-picker';
import ImageResizer from 'react-native-image-resizer';
import ImageEditor from "@react-native-community/image-editor";
import changeNavigationBarColor from 'react-native-navigation-bar-color';
import SView from 'react-native-simple-shadow-view';
import vision from '@react-native-firebase/ml-vision';

class ImageUpload extends Component {

  constructor() {
    super();
    this.state={
      image:{},
      imageSize:{},
      alertVisible:false,
      relatedImageWords:""
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
    const {COLORS} = this.props;
    return (
      <TouchableOpacity style={{borderRadius:10, height:58, paddingHorizontal:15,
        backgroundColor:COLORS.LIGHT, 
        elevation:7, justifyContent:'center', alignItems:"center",
        bottom:15, right:15, position:"absolute", 
        borderColor:COLORS.GREEN, 
        borderWidth:2}} activeOpacity={0.7} 
        onPress={()=>{(this.props.image.uri)?Actions.replace("publish"):this.setState({alertVisible:true})}}>
        <Text style={{fontFamily:FONTS.GOTHAM_BLACK, fontSize:24, 
          color:COLORS.GREEN}}>NEXT</Text>
        <Text style={{fontFamily:FONTS.PRODUCT_SANS_BOLD, fontSize:12, 
          color:COLORS.GREEN}}>Preview</Text>
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

  async ImageLabelDetection(image_path){
    let response = await vision().imageLabelerProcessImage(image_path)
    let filterList = [];
    let relatedImageWords= "";
    response.map((item)=>{
      if (item.confidence>0.5){
        filterList.push(item)
      }
    })

    if (filterList.length>5){
      filterList = _.sortBy(filterList, ['confidence']).reverse();
      filterList = filterList.splice(0,5)
    }
    if (filterList.length!==0){
      filterList.map((item, index)=>{
        if (index===filterList.length-1) { relatedImageWords += item.text}
        else { relatedImageWords += item.text+", "}
      });
    }
    else{
      relatedImageWords = "Sorry, I couldn't find anything useful here"
    }
    this.setState({relatedImageWords})
  }

  pickImage(){
    const ImageOptions={
      noData: true,
      mediaType:'photo',
      chooseWhichLibraryTitle: "Select an App"
    }
    // // console.log("in image")
    
    ImagePicker.launchImageLibrary(ImageOptions, (image)=>{
      this.ImageLabelDetection(image.path)
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
    const {COLORS} = this.props; 
    return (
      <TouchableOpacity style={{backgroundColor:COLORS.LESSER_LIGHT, borderRadius:10,
        alignSelf:'center', height:180, width:180, borderWidth:3, 
        borderColor:COLORS.LESSER_DARK,}} 
        onPress={()=>{this.pickImage()}}>
        <View style={{flex:1,justifyContent:'center', alignItems:'center'}}>
          <Icon name="image" type="material-community" size={128} 
            color={COLORS.LESSER_DARK}/>
          <Text style={{color:COLORS.LESSER_DARK, 
            fontFamily:FONTS.RALEWAY, fontSize:16}}>
            Select an Image
          </Text>
        </View>
      </TouchableOpacity>      
    );
  }

  renderChoosenImage(){
    const {image} = this.state;
    const {COLORS} = this.props;
    if (image.uri){
      data = {image: image.uri, article_id: -1, topic: this.props.topic,
        preview_contents:this.props.contents, category:this.props.category}
      return(
        <View style={{alignItems:'center', justifyContent:'center'}}>
          <ArticleTile size={180} data={data} theme={this.props.theme} COLORS={this.props.COLORS}/>
          {
            (this.state.relatedImageWords)?(
              <View style={{alignItems:'flex-start', flexDirection:'row',
                marginTop:20, marginHorizontal:50}}>
                <Icon name="comment" type="octicon" size={15}
                  color={COLORS.GRAY} containerStyle={{marginTop:2}}/>
                <Text style={{fontFamily:FONTS.PRODUCT_SANS, color:COLORS.GRAY,
                  fontSize:12, marginLeft:10}}>
                  {`This is what I see in this image : `} 
                  <Text style={{fontFamily:FONTS.PRODUCT_SANS_BOLD}}>{this.state.relatedImageWords}</Text>
                </Text>
              </View>
            ):(null)
          }
        </View>
      )
    }
    else{
      return this.renderImagePicker()
    }
  }

  renderBack(){
    const {COLORS} = this.props;
    return (
      <View style={{margin:8, height:70, justifyContent:'space-between',
        alignItems:'center', flexDirection:'row'}}>
          <TouchableOpacity onPress={()=>{Actions.replace("writearticle");
            logEvent(LOG_EVENT.SCREEN_CHANGE, 'writearticle');}}
            activeOpacity={0.75}>
            <SView
              style={{shadowColor:'#202020',shadowOpacity:0.2, shadowOffset:{width:0,height:7.5},shadowRadius:7, 
              borderRadius:30, padding:10, 
              backgroundColor:(this.props.theme==='light')?COLORS.LIGHT:COLORS.LESS_LIGHT,
              marginRight:15, justifyContent:'center', alignItems:'center', flexDirection:'row'}}>
              <Icon name="arrow-left" type="material-community" size={26}
                containerStyle={{height:26, width:26, justifyContent:'center', alignItems:'center'}} 
                color={COLORS.LESS_DARK}/>
              <Text style={{color:COLORS.LESS_DARK, 
                fontFamily:FONTS.RALEWAY,marginHorizontal:3, 
                fontSize:16, textAlignVertical:'center'}}>
                edit <Text style={{fontSize:14}}>article</Text>
              </Text>
            </SView>
          </TouchableOpacity>
          
          <Text style={{...styles.TextStyle, 
            color:COLORS.DARK}}>
            upload image
          </Text>
      </View>
    )
  }

  getStatusBarColor(){
    const {COLORS} = this.props;
    let statusBarColor = COLORS.LIGHT
    if (this.state.alertVisible){
      statusBarColor = COLORS.OVERLAY_COLOR
    }
    return statusBarColor
  }

  renderAlert(){
    const {COLORS} = this.props;
    return (
      <View>
        <StatusBar
          backgroundColor={this.getStatusBarColor()}
          barStyle={(this.props.theme==='light')?'dark-content':'light-content'}/>
        {changeNavigationBarColor(this.getStatusBarColor(), (this.props.theme==='light'))}
        <CustomAlert
          theme={this.props.theme}
          COLORS = {COLORS}
          isVisible = {this.state.alertVisible}
          onFirstButtonPress = {() => {this.setState({alertVisible:false})}}
          onThirdButtonPress = {() => {this.setState({alertVisible:false});Actions.replace("publish");logEvent(LOG_EVENT.SCREEN_CHANGE, 'publish');}}
          onBackdropPress = {() => {this.setState({alertVisible:false});}}
          message = {{
            title: "Warning ⚠️",
            content: "Adding an image is good for search results as well as increases user satisfaction from the article. It also looks cool",
            type:[
              {label:'  Skip  ', color:COLORS.RED},
              {label:ERROR_BUTTONS.TICK},
            ]
          }}
        />
      </View>
    )
  }

  render() {
    const {COLORS} = this.props;
    return(
      <View style={{flex:1, backgroundColor:COLORS.LIGHT}}>
        {this.renderBack()}
        <View style={{alignSelf:'center', justifyContent:'center', flex:1, margin:20}}>
          {this.renderAlert()}
          <View style={{justifyContent:'center', alignItems:'center', width:"100%",marginBottom:50,}}>
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

    theme: state.chat.theme,
    COLORS: state.chat.COLORS,
  }
}

export default connect(mapStateToProps, {setImage})(ImageUpload)

const styles = StyleSheet.create({
  TextStyle:{
    fontSize:24,
    fontFamily:FONTS.GOTHAM_BLACK,
  },
})