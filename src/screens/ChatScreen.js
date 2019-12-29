import React, {Component} from 'react';
import { View, Text, StyleSheet, StatusBar, Keyboard, BackHandler} from 'react-native';
import {connect} from 'react-redux';
import {Badge} from 'react-native-elements';
import Icon from 'react-native-vector-icons/Feather'
import {FONTS, COLORS_LIGHT_THEME, COLORS_DARK_THEME} from '../Constants';
import {GiftedChat} from '../components/GiftedChat/index';
import { Actions } from 'react-native-router-flux';
import {sendMessage, checkMessagesObject, sendTyping, clearOtherUserData, setAuthToken,
  getChatPeopleExplicitly} from '../actions/ChatAction';
import Image from 'react-native-fast-image';
import changeNavigationBarColor from 'react-native-navigation-bar-color';
import SView from 'react-native-simple-shadow-view';
import TimedAlert from '../components/TimedAlert';

class ChatScreen extends Component {

  state={
    selectedImage: null,
    imageViewerSelected: false
  }

  componentDidMount(){
    this.props.setAuthToken();
    this.props.checkMessagesObject(this.props.other_user_data._id, this.props.messages);
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

  keyboardDidShow () {
    this.props.sendTyping(this.props.socket, true, this.props.other_user_data._id)
  }

  keyboardDidHide () {
    this.props.sendTyping(this.props.socket, false, this.props.other_user_data._id)
  }

  renderStatus(status){
    let jsx = <View/>

    if (this.props.other_user_data.newEntry){
      return <Text/>
    }

    if (status.typing){
      jsx = 
      (<Text style={{color: (this.props.theme==='light')?COLORS_LIGHT_THEME.YELLOW:COLORS_DARK_THEME.YELLOW}}>
        typing
      </Text>)
    }
    else if (status.online){
      jsx = <Text style={{color: (this.props.theme==='light')?COLORS_LIGHT_THEME.GREEN:COLORS_DARK_THEME.GREEN}}>online</Text>
    }
    else{
      jsx = <Text style={{color: (this.props.theme==='light')?COLORS_LIGHT_THEME.RED:COLORS_DARK_THEME.RED}}>offline</Text>
    }

    return (
      <Text style={{fontSize: 16, color: (this.props.theme==='light')?COLORS_LIGHT_THEME.LESS_DARK:COLORS_DARK_THEME.LESS_DARK}}>
        {' is '}{jsx}
      </Text>
    )
  }

  renderHeader(){
    return (
      <SView style={{borderRadius:10, margin:8, paddingVertical:10,
        alignItems:'center', flexDirection:'row', 
        backgroundColor:(this.props.theme==='light')?COLORS_LIGHT_THEME.LIGHT:COLORS_DARK_THEME.LESS_LIGHT, 
        paddingHorizontal:5, shadowColor:'#202020',
        shadowOpacity:0.25, shadowOffset:{width:0,height:10},shadowRadius:8,}}>
        <View style={{flexDirection:'row', alignItems:'center'}}>
          <View style={{marginLeft:10}}>
            <Image
              source={
                (this.props.other_user_data.image_url)?
                {uri:this.props.other_user_data.image_url}:
                require('../../assets/icons/user.png')
              }
              style={{height:48, width:48, borderRadius:24}}
            />
            {
              (!this.props.other_user_data.newEntry && this.props.status[this.props.other_user_data._id].online)?
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
              color:(this.props.theme==='light')?COLORS_LIGHT_THEME.LESS_DARK:COLORS_DARK_THEME.LESS_DARK}}>
              {this.props.other_user_data.name}
              {this.renderStatus(this.props.status[this.props.other_user_data._id])}
            </Text>
            {(this.props.other_user_data.fav_category)?
            (<Text style={{...styles.IntrestStyle, 
              color:(this.props.theme==='light')?COLORS_LIGHT_THEME.LIGHT_GRAY:COLORS_DARK_THEME.LESS_DARK}}>
              {this.props.other_user_data.fav_category}
            </Text>):<View/>}
          </View>
          {(!this.state.imageViewerSelected)?(
            <View style={{height:32, width:48, justifyContent:'center', alignItems:'center'}}>
              <Icon name="x-circle" size={22} 
                color={(this.props.theme==='light')?COLORS_LIGHT_THEME.RED:COLORS_DARK_THEME.RED} 
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
      </SView>
    )
  }

  render() {
    return(
      <View style={{backgroundColor:(this.props.theme==='light')?COLORS_LIGHT_THEME.LIGHT:COLORS_DARK_THEME.LIGHT}}>
        <View style={{height:"100%"}}>
          <StatusBar 
            barStyle={(this.props.theme==='light')?'dark-content':'light-content'}
            backgroundColor={(this.props.theme==='light')?COLORS_LIGHT_THEME.LIGHT:COLORS_DARK_THEME.LIGHT}
          />
          {changeNavigationBarColor((this.props.theme==='light')?COLORS_LIGHT_THEME.LIGHT:COLORS_DARK_THEME.LIGHT, (this.props.theme==='light'))}
          {this.renderHeader()}
          <TimedAlert onRef={ref=>this.timedAlert = ref} theme={this.props.theme}/>
            {
              (this.props.loading)?
                <Text>LOADING</Text>:
                (<View style={{flex:1}}>
                  <GiftedChat
                    theme={this.props.theme}
                    containerStyle={{backgroundColor:(this.props.theme==='light')?COLORS_LIGHT_THEME.LIGHT:COLORS_DARK_THEME.LIGHT}}
                    primaryStyle={{backgroundColor:(this.props.theme==='light')?COLORS_LIGHT_THEME.LIGHT:COLORS_DARK_THEME.LESSER_LIGHT}}
                    textInputStyle={{
                        color:(this.props.theme==='light')?COLORS_LIGHT_THEME.LESS_DARK:COLORS_DARK_THEME.LESS_DARK,
                        backgroundColor:(this.props.theme==='light')?COLORS_LIGHT_THEME.LIGHT:COLORS_DARK_THEME.LESSER_LIGHT
                      }}
                    messages={this.props.messages[this.props.other_user_data._id]}
                    onSend={(message) => {
                      this.setState({selectedImage:null});
                      this.props.sendMessage(this.props.socket, message, 
                      this.props.other_user_data._id, this.state.selectedImage)
                    }}
                    placeholder="Type to chat..."
                    renderAvatar={null}
                    alwaysShowSend
                    showTimedAlert = {(duration, message)=>{
                      this.timedAlert.showAlert(duration, message)
                    }}
                    user={{_id:this.props.authtoken}}
                    selectedImage = {this.state.selectedImage}
                    onImageSelect = {(image)=>{this.setState({selectedImage:image})}}
                    onImageCross = {()=>{this.setState({selectedImage:null})}}
                    image_adder={this.props.image_adder}
                    onViewerSelect = {(value)=>{this.setState({imageViewerSelected:value})}}
                  />
                </View>)
            }
        </View>
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
    messages: state.chat.messages,
    socket: state.chat.socket,
    status: state.chat.status,
    theme: state.chat.theme
  }
}

export default connect(mapStateToProps, {setAuthToken, sendMessage, getChatPeopleExplicitly,
  checkMessagesObject, sendTyping, clearOtherUserData})(ChatScreen);

const styles = StyleSheet.create({
  TextStyle:{
    fontSize:20,
    fontFamily:FONTS.PRODUCT_SANS_BOLD,
    flexWrap:'wrap'
  },
  IntrestStyle:{
    fontSize:14,
    fontFamily:FONTS.PRODUCT_SANS,
  },
})