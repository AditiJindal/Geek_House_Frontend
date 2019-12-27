import React, {Component} from 'react';
import { View, Text, StyleSheet, StatusBar, Keyboard, BackHandler, TouchableOpacity} from 'react-native';
import {connect} from 'react-redux';
import {Icon, Badge} from 'react-native-elements';
import {FONTS, COLORS_LIGHT_THEME, COLORS_DARK_THEME} from '../Constants';
import {GiftedChat} from '../components/GiftedChat/index';
import { Actions } from 'react-native-router-flux';
import {sendMessage, checkMessagesObject, sendTyping, clearOtherUserData, setAuthToken} from '../actions/ChatAction';
import Image from 'react-native-fast-image';
import changeNavigationBarColor from 'react-native-navigation-bar-color';
import SView from 'react-native-simple-shadow-view';

class ChatScreen extends Component {

  state={
    selectedImage: null
  }

  componentDidMount(){
    this.props.setAuthToken()
    this.props.checkMessagesObject(this.props.other_user_data._id, this.props.messages);
    this.keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', ()=>this.keyboardDidShow());
    this.keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', ()=>this.keyboardDidHide());
    BackHandler.addEventListener('hardwareBackPress', ()=>{
      if (Actions.currentScene==="chatscreen"){
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
              (this.props.status[this.props.other_user_data._id].online)?
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
          <TouchableOpacity
            activeOpacity={1}
            onPress={() => {this.props.clearOtherUserData();Actions.pop()}}
            style={{justifyContent:'center', alignItems:'center', elevation:4,borderWidth:2,
            backgroundColor:(this.props.theme==='light')?COLORS_LIGHT_THEME.LIGHT:COLORS_DARK_THEME.LESS_LIGHT,
            borderColor:(this.props.theme==='light')?COLORS_LIGHT_THEME.RED:COLORS_DARK_THEME.RED,
            borderRadius:100, marginRight:10}}>
            <Icon name="close" size={18} color={(this.props.theme==='light')?COLORS_LIGHT_THEME.RED:COLORS_DARK_THEME.RED} />
          </TouchableOpacity>
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
            {
              (this.props.loading)?
                <Text>LOADING</Text>:
                (<View style={{flex:1}}>
                  {console.log(this.props.messages[this.props.other_user_data._id])}
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
                    user={{_id:this.props.authtoken}}
                    selectedImage = {this.state.selectedImage}
                    onImageSelect = {(image)=>{this.setState({selectedImage:image})}}
                    onImageCross = {()=>{this.setState({selectedImage:null})}}
                    image_adder={this.props.image_adder}
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

export default connect(mapStateToProps, {setAuthToken, sendMessage, checkMessagesObject, sendTyping, clearOtherUserData})(ChatScreen);

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