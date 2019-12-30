import React, {Component} from 'react';
import {View, Text, StatusBar,TouchableOpacity, StyleSheet, TextInput, Image} from 'react-native';
import {connect} from 'react-redux';
import { COLORS_LIGHT_THEME, COLORS_DARK_THEME, FONTS } from '../Constants';
import {submitFeedback} from '../actions/HomeAction';
import {Actions} from 'react-native-router-flux';
import changeNavigationBarColor from 'react-native-navigation-bar-color';
import Icon from 'react-native-vector-icons/Feather';
import SView from 'react-native-simple-shadow-view';
import LinearGradient from 'react-native-linear-gradient';
import ImagePicker from 'react-native-image-picker';
import ImageResizer from 'react-native-image-resizer';
import TimedAlert from '../components/TimedAlert';
import prettysize from 'prettysize';

const INITIAL_STATE = {
  subject:"",
  description: "",
  image_url: null,
  image_name:null,
  image_size:null,
  feedback_submitted: false
}
class Feedback extends Component {

  state=INITIAL_STATE

  renderHeader(){
    return (
      <View style={{borderRadius:10, margin:8, height:70, justifyContent:'space-between',
        marginHorizontal:15,
        alignItems:'center', flexDirection:'row'}}>
        <TouchableOpacity
          activeOpacity={1}
          
          onPress={() => {Actions.pop()}}
          style={{justifyContent:'center', alignItems:'center',padding:3}}>
          <Icon name="arrow-left" type="material-community" size={26}
            containerStyle={{marginVertical:5, marginRight:15}} 
            color={(this.props.theme==='light')?COLORS_LIGHT_THEME.LESS_DARK:COLORS_DARK_THEME.LESS_DARK}/>
        </TouchableOpacity>

        <Text style={{...styles.HeadingTextStyling, 
          color:(this.props.theme==='light')?COLORS_LIGHT_THEME.LESS_DARK:COLORS_DARK_THEME.LESS_DARK}}>feedback</Text>
      </View>
    )
  }

  getImageResize(imageSize){
    let resize = {...imageSize}
    const maxWidth = 1440;
    const maxHeight = 720;
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
      ImageResizer.createResizedImage(image.uri, resize.width, resize.height, "JPEG",50).then((resizedImage)=>{
        const image_url = resizedImage.uri
        this.setState({image_url, image_name:image.fileName, image_size:prettysize(resizedImage.size)})
      })
    }
  }

  selectImage(){
    if (this.state.image_url){
      this.setState({image_url:null, image_name:null, image_size:null})
    }
    else{
      ImagePicker.launchImageLibrary({
        noData: true,
        mediaType:'photo',
        chooseWhichLibraryTitle: "Select an App"
      }, (response)=>{
        this.handleImage(response)
      })
    }
  }

  renderFeedbackForm(){
    return (
      <SView style={{width:'85%', height:(this.state.image_url)?"55%":"40%", borderRadius:25, 
        backgroundColor:(this.props.theme==='light')?COLORS_LIGHT_THEME.LESSER_LIGHT:COLORS_DARK_THEME.LESSER_LIGHT,
        shadowOpacity:0.2, shadowColor:"rgba(20,20,20)", shadowRadius:8, marginTop:30,
        alignSelf:'center', shadowOffset:{width:0, height:10}}}>
        {
          (this.state.feedback_submitted)?(
            <View style={{flex:1, justifyContent:'center', alignItems:'center', flexWrap:'wrap'}}>
              <Icon name="check" size={72} style={{margin:20, padding:10, borderRadius:50,
                backgroundColor:(this.props.theme==='light')?COLORS_LIGHT_THEME.GREEN:COLORS_DARK_THEME.GREEN}} 
                color={(this.props.theme==='light')?COLORS_LIGHT_THEME.LESSER_LIGHT:COLORS_DARK_THEME.LESSER_LIGHT} />
              <Text style={{color:(this.props.theme==='light')?COLORS_LIGHT_THEME.LIGHT_GRAY:COLORS_DARK_THEME.LIGHT_GRAY,
                fontFamily:FONTS.RALEWAY_LIGHT, fontSize:36, marginHorizontal:20, textAlign:'center'}}>
                Thank You for Feedback
              </Text>
            </View>
          ):(
            <>
            <TextInput
              placeholder={"Subject of request"}
              value={this.state.subject}
              onChangeText={(subject)=>{this.setState({subject})}}
              placeholderTextColor={(this.props.theme==='light')?COLORS_LIGHT_THEME.GRAY:COLORS_DARK_THEME.GRAY}
              style={{fontFamily:FONTS.RALEWAY, fontSize:18,marginHorizontal:10, marginTop:10,paddingHorizontal:10,
              borderRadius:15,color:(this.props.theme==='light')?COLORS_LIGHT_THEME.LESS_DARK:COLORS_DARK_THEME.LESS_DARK,
              backgroundColor:(this.props.theme==='light')?COLORS_LIGHT_THEME.MID_LIGHT:COLORS_DARK_THEME.MID_LIGHT}}
            />
            <TextInput
              placeholder={"Enter a detailed description"}
              multiline={true}
              value={this.state.description}
              onChangeText={(description)=>{this.setState({description})}}
              placeholderTextColor={(this.props.theme==='light')?COLORS_LIGHT_THEME.GRAY:COLORS_DARK_THEME.GRAY}
              style={{fontFamily:FONTS.RALEWAY, fontSize:14,marginHorizontal:10, marginVertical:10,
              borderRadius:15, flex:1, textAlignVertical:'top', padding:10,
              color:(this.props.theme==='light')?COLORS_LIGHT_THEME.LESS_DARK:COLORS_DARK_THEME.LESS_DARK,
              backgroundColor:(this.props.theme==='light')?COLORS_LIGHT_THEME.MID_LIGHT:COLORS_DARK_THEME.MID_LIGHT}}
            />
            {
              (this.state.image_url)?(
                <View style={{flex:1, height:"37%",margin:10, borderRadius:20, overflow:'hidden', marginTop:0}}>
                  <Image source={{uri:this.state.image_url}} blurRadius={2} style={{flex:1, borderRadius:20}}/>
                  <View style={{position:'absolute',top:5, left:5, backgroundColor:"rgba(50,50,50,0.3)",
                    borderRadius:15, paddingVertical:5, paddingHorizontal:10}}>
                    <Text style={{color:COLORS_DARK_THEME.LESS_DARK,
                        fontFamily:FONTS.PRODUCT_SANS_BOLD, fontSize:8}}>
                        {this.state.image_name}
                    </Text>
                    <Text style={{color:COLORS_DARK_THEME.LESSER_DARK,
                        fontFamily:FONTS.PRODUCT_SANS, fontSize:8}}>
                        Image size: {this.state.image_size}
                    </Text>
                  </View>
                </View>
              ):null
            }
            <TouchableOpacity activeOpacity={1}
              multiline={true} onPress={()=>{this.selectImage()}}
              style={{flexDirection:'row', alignItems:'center', position:'absolute', bottom:0, right:0,
              backgroundColor:(this.props.theme==='light')?COLORS_LIGHT_THEME.LESSER_LIGHT:COLORS_DARK_THEME.LESSER_LIGHT,
              padding:10,borderBottomRightRadius:25,borderTopLeftRadius:25}}>
              <Icon name={(this.state.image_url)?"x":"plus"} size={22}
              color={(this.props.theme==='light')?COLORS_LIGHT_THEME.GRAY:COLORS_DARK_THEME.GRAY}/>
              {
                (!this.state.image_url)?(
                  <Text style={{color:(this.props.theme==='light')?COLORS_LIGHT_THEME.GRAY:COLORS_DARK_THEME.GRAY,
                    fontFamily:FONTS.PRODUCT_SANS, fontSize:14, marginRight:5, marginLeft:10}}>
                    Add an Image
                  </Text>
                ):null
              }
            </TouchableOpacity>
            </>
          )
        }
      </SView>
    )
  }

  onSubmit(){
    if (this.state.subject.length>10 || this.state.description.length>10){
      this.props.submitFeedback({
        subject: this.state.subject,
        description: this.state.description,
        image_url: this.state.image_url,
        author: this.props.data.name,
        email: this.props.data.email
      })
      this.setState({...INITIAL_STATE, feedback_submitted:true});
    }
    else{
      this.timedAlert.showAlert(3000, "Please provide something more useful");
    }
  }

  renderSubmitButton(){
    return (
      <TouchableOpacity activeOpacity={0.75} 
      style={{borderWidth:0, bottom:15,position:"absolute",alignSelf:'center'}}
        onPress={()=>{(!this.state.feedback_submitted)?this.onSubmit():Actions.pop();}}>
        <SView style={{borderRadius:15, shadowOpacity:0.3,shadowRadius:5,height:45,width:130,
        shadowOffset: { height:7}, shadowColor:'#b91d73', backgroundColor:COLORS_LIGHT_THEME.LIGHT}}>
          <LinearGradient style={{borderRadius:15,flex:1,justifyContent:'center', alignItems:"center"}} 
            colors={["#f953c6", "#b91d73"]} start={{x:1, y:0}} end={{x:1, y:1}}>
            <Text style={{fontFamily:FONTS.GOTHAM_BLACK, fontSize:22, color:COLORS_LIGHT_THEME.LIGHT}}>
              {`${(!this.state.feedback_submitted)?"SUBMIT":"Go Back"}`}
            </Text>
          </LinearGradient>
        </SView>
      </TouchableOpacity>
    )
  }

  render(){
    return (
      <View style={{flex:1,
        backgroundColor:(this.props.theme==='light')?COLORS_LIGHT_THEME.LIGHT:COLORS_DARK_THEME.LIGHT}}>
        <StatusBar
          backgroundColor={(this.props.theme==='light')?COLORS_LIGHT_THEME.LIGHT:COLORS_DARK_THEME.LIGHT}
          barStyle={(this.props.theme==='light')?"dark-content":"light-content"}
        />
        <TimedAlert onRef={ref=>this.timedAlert = ref} theme={this.props.theme}/>
        {changeNavigationBarColor((this.props.theme==='light')?COLORS_LIGHT_THEME.LIGHT:COLORS_DARK_THEME.LIGHT)}
        {this.renderHeader()}
        <Text style={{...styles.TextStyling,
          color:(this.props.theme==='light')?COLORS_LIGHT_THEME.LESSER_DARK:COLORS_DARK_THEME.LESSER_DARK}}>
          Please provide your feedback, suggestions or information on any bugs you encountered 
          while you were using this app. Your feedback will be seen and appropriate action will be taken
        </Text>
        {this.renderFeedbackForm()}
        {this.renderSubmitButton()}
      </View>
    )
  }
}

const mapStateToProps = (state) => {
  return {
    data: state.login.data,

    theme: state.chat.theme,
  }
}

export default connect(mapStateToProps, {submitFeedback})(Feedback);

const styles = StyleSheet.create({
  HeadingTextStyling:{
    fontSize:28,
    fontFamily:FONTS.GOTHAM_BLACK,
  },
  SubheadingTextStyle: {
    fontFamily:FONTS.PRODUCT_SANS_BOLD,
    fontSize:22,
    marginBottom:10
  },
  TextStyling: {
    fontFamily: FONTS.PRODUCT_SANS,
    fontSize: 14,
    marginVertical:2,
    textAlign:'justify',
    marginHorizontal:20
  }
})