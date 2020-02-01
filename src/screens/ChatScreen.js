import React, {Component} from 'react';
import { View, Text, StyleSheet, Keyboard, BackHandler, 
  ImageBackground, TouchableOpacity} from 'react-native';
import {connect} from 'react-redux';
import {Badge, Icon} from 'react-native-elements';
import {FONTS} from '../Constants';
import {GiftedChat} from '../components/GiftedChat/index';
import { Actions } from 'react-native-router-flux';
import {sendMessage, checkMessagesObject, sendTyping, clearOtherUserData, setAuthToken,
  getChatPeopleExplicitly, getCurrentUserMessages, onImageSelect, onComposerTextChanged
} from '../actions/ChatAction';
import Image from 'react-native-fast-image';
import TimedAlert from '../components/TimedAlert';

class ChatScreen extends Component {

  state={imageViewerSelected: false}

  componentDidMount(){
    this.props.setAuthToken();
    this.props.getCurrentUserMessages(this.props.other_user_data._id, 
      this.props.user_id, this.props.quickRepliesEnabled)
    this.keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', ()=>this.keyboardDidShow());
    this.keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', ()=>this.keyboardDidHide());
    BackHandler.addEventListener('hardwareBackPress', ()=>{
      if (Actions.currentScene==="chatscreen"){
        if (this.props.other_user_data.newEntry){
          this.props.getChatPeopleExplicitly()
        }
        this.props.clearOtherUserData();
      };
    });
  }

  componentWillUnmount(){
    this.keyboardDidHideListener.remove();
    this.keyboardDidShowListener.remove();
  }

  keyboardDidShow () {
    this.props.sendTyping(this.props.socket, true, this.props.other_user_data._id)
  }

  keyboardDidHide () {
    this.props.sendTyping(this.props.socket, false, this.props.other_user_data._id)
  }

  renderStatus(status){
    const {COLORS} = this.props;
    let jsx = <View/>

    if (this.props.other_user_data.newEntry || !status){
      return <Text/>
    }

    if (status.typing){
      jsx = 
      (<Text style={{color:COLORS.YELLOW}}>
        typing
      </Text>)
    }
    else if (status.online){
      jsx = <Text style={{color:COLORS.GREEN}}>online</Text>
    }
    else{
      jsx = <Text style={{color:COLORS.RED}}>offline</Text>
    }

    return (
      <Text style={{fontSize: 16, color:COLORS.LESS_DARK}}>
        {' is '}{jsx}
      </Text>
    )
  }

  imageUrlCorrector(image_url){
    if (image_url.substring(0,4) !== 'http'){
      image_url = this.props.image_adder + image_url
    }
    return image_url
  }

  renderHeader(){
    const {COLORS} = this.props;
    return (
      <View style={{paddingBottom:4,elevation:25,
        alignItems:'center', flexDirection:'row', width:"100%",
        backgroundColor:COLORS.LIGHT, 
        paddingHorizontal:10}}>
        <View style={{flexDirection:'row', alignItems:'center'}}>
          <View style={{marginLeft:10}}>
            <Image
              source={
                (this.props.other_user_data.image_url)?
                {uri:this.imageUrlCorrector(this.props.other_user_data.image_url)}:
                require('../../assets/icons/user.png')
              }
              style={{height:48, width:48, borderRadius:24,
              backgroundColor:COLORS.LIGHT, elevation:4}}
            />
            {
              (!this.props.other_user_data.newEntry 
              && this.props.status.hasOwnProperty(this.props.other_user_data._id) 
              && this.props.status[this.props.other_user_data._id].online)?
              (
                <Badge
                  status="success"
                  containerStyle={{ position: 'absolute', top: 2, right: 0, elevation:7}}
                  badgeStyle={{height:12, width:12, borderRadius:6,
                  borderWidth:1.2, borderColor:COLORS.LIGHT}}
                />
              ):null
            } 
          </View>
          <View style={{justifyContent:'center', marginLeft:10, flex:6, alignItems:'center'}}>
            <Text style={{...styles.TextStyle, 
              color:COLORS.LESS_DARK}}>
              {this.props.other_user_data.name}
              {this.renderStatus(this.props.status[this.props.other_user_data._id])}
            </Text>
            {(this.props.other_user_data.fav_category)?
            (<Text style={{...styles.InterestStyle, 
              color:(this.props.theme==='light')?COLORS.LIGHT_GRAY:COLORS.LESS_DARK}}>
              {this.props.other_user_data.fav_category}
            </Text>):<View/>}
          </View>
          {(!this.state.imageViewerSelected)?(
            <TouchableOpacity style={{height:32, width:48, justifyContent:'center', alignItems:'center'}}
            onPress={() => {
              if (this.props.other_user_data.newEntry){
                this.props.getChatPeopleExplicitly()
              }
              Actions.pop()
              this.props.clearOtherUserData();
            }}>
              <Icon name="x-circle" size={22} color={COLORS.RED} type={'feather'}/>
            </TouchableOpacity>
          ):<View style={{height:32, width:48}}/>}
        </View>
      </View>
    )
  }

  render() {
    const {COLORS, chatScreenState} = this.props;
    return(
      <View style={{backgroundColor:COLORS.LIGHT}}>
        <ImageBackground style={{height:"100%", width:"100%"}} blurRadius={this.props.chat_background.blur}
        source={(!!this.props.chat_background.image)?(
          {uri:this.props.chat_background.image}
          ):(
          require('../../assets/default_chat_background.jpg')
          )}>
          {this.renderHeader()}
          <TimedAlert onRef={ref=>this.timedAlert = ref} theme={this.props.theme}
            COLORS = {COLORS}
          />
          {
            (this.props.loading)?
              <Text>LOADING</Text>:
              (<View style={{flex:1}}>
                <GiftedChat
                  theme={this.props.theme}
                  COLORS = {COLORS}
                  primaryStyle={{backgroundColor:
                    (this.props.theme==='light')?COLORS.LIGHT:COLORS.LESSER_LIGHT, elevation:7}}
                  textInputStyle={{
                      color:COLORS.LESS_DARK,
                      backgroundColor:'rgba(0,0,0,0)',marginTop:2
                    }}
                  messages={this.props.currentMessages}
                  onSend={(message) => {
                    this.props.sendMessage(this.props.socket, message, 
                    this.props.other_user_data._id, chatScreenState.selectedImage)
                  }}
                  placeholder="Type to chat..."
                  renderAvatar={null}
                  showTimedAlert = {(duration, message)=>{
                    this.timedAlert.showAlert(duration, message, 46)
                  }}
                  quick_replies = {this.props.quick_replies}
                  user={{_id:this.props.authtoken}}
                  selectedImage = {chatScreenState.selectedImage}
                  onComposerTextChanged = {this.props.onComposerTextChanged}
                  onImageSelect = {this.props.onImageSelect}
                  onImageCross = {()=>{
                    this.props.onImageSelect(null,{name:"", oldSize:null, newSize:null})
                  }}
                  image_adder={this.props.image_adder}
                  onViewerSelect = {(value)=>{this.setState({imageViewerSelected:value})}}
                  internetReachable={this.props.internetReachable}
                  text={chatScreenState.text}
                  imageMetaData={chatScreenState.imageMetaData}
                  imageUploading={chatScreenState.imageUploading}
                />
              </View>)
          }
        </ImageBackground>
      </View>
    );
  }
}


const mapStateToProps = (state) => {
  return {
    authtoken: state.login.authtoken,
    internetReachable: state.login.internetReachable,

    image_adder:state.home.image_adder,

    loading: state.chat.loading,
    other_user_data: state.chat.other_user_data,
    user_id: state.chat.user_id,
    socket: state.chat.socket,
    status: state.chat.status,
    theme: state.chat.theme,
    COLORS: state.chat.COLORS,
    currentMessages: state.chat.currentMessages,
    chat_background: state.chat.chat_background,
    quick_replies: state.chat.quick_replies,
    quickRepliesEnabled: state.chat.quickRepliesEnabled,
    chatScreenState: state.chat.chatScreenState
  }
}

export default connect(mapStateToProps, {setAuthToken, sendMessage, getChatPeopleExplicitly,
  checkMessagesObject, sendTyping, clearOtherUserData, getCurrentUserMessages,
  onImageSelect, onComposerTextChanged
})(ChatScreen);

const styles = StyleSheet.create({
  TextStyle:{
    fontSize:20,
    fontFamily:FONTS.PRODUCT_SANS_BOLD,
    flexWrap:'wrap'
  },
  InterestStyle:{
    fontSize:10,
    fontFamily:FONTS.PRODUCT_SANS,
  },
})