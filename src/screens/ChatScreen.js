import React, {Component} from 'react';
import { View, Text, StyleSheet, Keyboard, BackHandler, ImageBackground} from 'react-native';
import {connect} from 'react-redux';
import {Badge} from 'react-native-elements';
import Icon from 'react-native-vector-icons/Feather'
import {FONTS} from '../Constants';
import {GiftedChat} from '../components/GiftedChat/index';
import { Actions } from 'react-native-router-flux';
import {sendMessage, checkMessagesObject, sendTyping, clearOtherUserData, setAuthToken,
  getChatPeopleExplicitly, getCurrentUserMessages} from '../actions/ChatAction';
import Image from 'react-native-fast-image';
import TimedAlert from '../components/TimedAlert';

class ChatScreen extends Component {

  state={
    selectedImage: null,
    imageViewerSelected: false
  }

  componentDidMount(){
    this.props.setAuthToken();
    this.props.getCurrentUserMessages(this.props.other_user_data._id, this.props.user_id)
    // this.props.checkMessagesObject(this.props.other_user_data._id, this.props.messages);
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
                {uri:this.props.other_user_data.image_url}:
                require('../../assets/icons/user.png')
              }
              style={{height:42, width:42, borderRadius:24}}
            />
            {
              (!this.props.other_user_data.newEntry 
              && this.props.status.hasOwnProperty(this.props.other_user_data._id) 
              && this.props.status[this.props.other_user_data._id].online)?
              (
                <Badge
                  status="success"
                  containerStyle={{ position: 'absolute', top: 2, right: 0,}}
                  badgeStyle={{height:12, width:12, borderRadius:6, borderWidth:1}}
                />
              ):<View/>
            }
          </View>
          <View style={{justifyContent:'center', marginLeft:10, flex:6, alignItems:'center'}}>
            <Text style={{...styles.TextStyle, 
              color:COLORS.LESS_DARK}}>
              {this.props.other_user_data.name}
              {this.renderStatus(this.props.status[this.props.other_user_data._id])}
            </Text>
            {(this.props.other_user_data.fav_category)?
            (<Text style={{...styles.IntrestStyle, 
              color:(this.props.theme==='light')?COLORS.LIGHT_GRAY:COLORS.LESS_DARK}}>
              {this.props.other_user_data.fav_category}
            </Text>):<View/>}
          </View>
          {(!this.state.imageViewerSelected)?(
            <View style={{height:32, width:48, justifyContent:'center', alignItems:'center'}}>
              <Icon name="x-circle" size={22} 
                color={COLORS.RED} 
                onPress={() => {
                  if (this.props.other_user_data.newEntry){
                    this.props.getChatPeopleExplicitly()
                  }
                  this.props.clearOtherUserData();
                  Actions.pop()
                }}
              />
            </View>
          ):<View style={{height:32, width:48}}/>}
        </View>
      </View>
    )
  }

  render() {
    const {COLORS} = this.props;
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
                    this.setState({selectedImage:null});
                    this.props.sendMessage(this.props.socket, message, 
                    this.props.other_user_data._id, this.state.selectedImage)
                  }}
                  placeholder="Type to chat..."
                  renderAvatar={null}
                  showTimedAlert = {(duration, message)=>{
                    this.timedAlert.showAlert(duration, message)
                  }}
                  quick_replies = {this.props.quick_replies}
                  user={{_id:this.props.authtoken}}
                  selectedImage = {this.state.selectedImage}
                  onImageSelect = {(image)=>{this.setState({selectedImage:image})}}
                  onImageCross = {()=>{this.setState({selectedImage:null})}}
                  image_adder={this.props.image_adder}
                  onViewerSelect = {(value)=>{this.setState({imageViewerSelected:value})}}
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
    image_adder:state.home.image_adder,
    loading: state.chat.loading,
    authtoken: state.login.authtoken,

    other_user_data: state.chat.other_user_data,
    user_id: state.chat.user_id,
    socket: state.chat.socket,
    status: state.chat.status,
    theme: state.chat.theme,
    COLORS: state.chat.COLORS,
    currentMessages: state.chat.currentMessages,
    chat_background: state.chat.chat_background,
    quick_replies: state.chat.quick_replies
  }
}

export default connect(mapStateToProps, {setAuthToken, sendMessage, getChatPeopleExplicitly,
  checkMessagesObject, sendTyping, clearOtherUserData, getCurrentUserMessages})(ChatScreen);

const styles = StyleSheet.create({
  TextStyle:{
    fontSize:20,
    fontFamily:FONTS.PRODUCT_SANS_BOLD,
    flexWrap:'wrap'
  },
  IntrestStyle:{
    fontSize:10,
    fontFamily:FONTS.PRODUCT_SANS,
  },
})