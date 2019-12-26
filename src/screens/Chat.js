import React, {Component} from 'react';
import {connect} from 'react-redux'
import { View, Text, StyleSheet, StatusBar, SectionList } from 'react-native';
import BottomTab from '../components/BottomTab';
import {logEvent} from '../actions/ChatAction';
import {FONTS, COLORS_LIGHT_THEME, COLORS_DARK_THEME, LOG_EVENT} from '../Constants';
import {setAuthToken, setUserData} from '../actions/ChatAction';
import {Actions} from 'react-native-router-flux'
import ChatPeople from '../components/ChatPeople';
import changeNavigationBarColor from 'react-native-navigation-bar-color';
import SView from 'react-native-simple-shadow-view'

class Chat extends Component {

  constructor() {
    super();
    this.state={showStartTime: Date.now()}
  }

  componentDidMount(){
    if (!this.props.chatPeople.recents){
      this.props.setAuthToken()
    }
  }

  componentWillUnmount(){
    // console.log("unmounting chat")
    logEvent(LOG_EVENT.TIME_IN_CHAT, Date.now()-this.state.showStartTime)
  }
  
  renderSection(title){
    return(
      <View style={{alignItems:'center'}}>
        {(title==="Chats")?<View style={{height:0.5, width:'94%', 
          backgroundColor:(this.props.theme==='light')?COLORS_LIGHT_THEME.LIGHT_GRAY:COLORS_DARK_THEME.GRAY, 
        margin:10}}/>:<View/>}
        <View style={styles.SectionViewStyling}>
          <Text style={{...styles.SectionHeadingStyle, color:(this.props.theme)?COLORS_LIGHT_THEME.LIGHT_GRAY:COLORS_DARK_THEME.LIGHT_GRAY}}>
            {title}
          </Text>
        </View>
      </View>
    );
  };

  renderChatPeople(){
    const DATA = [
      {title: "Recents", data: this.props.chatPeople.recents},
      {title: "Chats", data: this.props.chatPeople.chats}
    ]
    return (
      <SectionList
      contentContainerStyle={{marginTop:15}}
        sections={DATA}
        keyExtractor={(item, index) => item + index}
        renderItem={({ item }) => {

        return (
        <ChatPeople data={item}
          theme={this.props.theme}
          typing={this.props.status[item._id].typing} 
          online={this.props.status[item._id].online}
          unread_messages= {this.props.status[item._id].unread_messages}
          onPress={()=>{
          this.props.setUserData(item);
          Actions.chatscreen();logEvent(LOG_EVENT.SCREEN_CHANGE, 'chatscreen');}}
        />)
        }}
        renderSectionHeader={({ section: { title } }) => this.renderSection(title)}
      />
    );
  }

  renderNoChatAvailable(){
    return(
      <View style={{flex:1, justifyContent:'center', alignItems:'center'}}>
        <Text style={{textAlign:'center', fontFamily: FONTS.PRODUCT_SANS_BOLD, fontSize:18, color:(this.props.theme==='light')?COLORS_LIGHT_THEME.LESS_DARK:COLORS_DARK_THEME.LESS_DARK}}>
          No one available for chat
        </Text>
      </View>
    )
  }

  render() {
    return(
      <View style={{flex:1,justifyContent:'space-between', backgroundColor:(this.props.theme==='light')?COLORS_LIGHT_THEME.LIGHT:COLORS_DARK_THEME.LIGHT}}>
        <StatusBar
          backgroundColor={(this.props.theme==='light')?COLORS_LIGHT_THEME.LIGHT:COLORS_DARK_THEME.LIGHT}
          barStyle={(this.props.theme==='light')?'dark-content':'light-content'}/>
        {changeNavigationBarColor((this.props.theme==='light')?COLORS_LIGHT_THEME.LIGHT:COLORS_DARK_THEME.LIGHT, (this.props.theme==='light'))}
        <SView style={{borderRadius:10, margin:8, height:70, justifyContent:'space-between',
          alignItems:'center', flexDirection:'row', shadowColor:'#202020',
          shadowOpacity:0.3, shadowOffset:{width:0,height:10},shadowRadius:8,
          backgroundColor:(this.props.theme==='light')?COLORS_LIGHT_THEME.LIGHT:COLORS_DARK_THEME.LESS_LIGHT, 
          paddingHorizontal:25}}>
            <Text style={{...styles.TextStyle, color:(this.props.theme==='light')?COLORS_LIGHT_THEME.DARK:COLORS_DARK_THEME.DARK }}>
              chat
            </Text>
        </SView>
        {
          (this.props.loading)?
          this.renderNoChatAvailable():
          this.renderChatPeople()
        }

        <View style={{bottom:50, height:0}}>
          <BottomTab icon_index={3}/>
        </View>
      </View>
    );
  }
}

const mapStateToProps = (state) => {
  // console.log('chat state: ', state.chat)
  return {
    loading: state.chat.loading,
    chatPeople: state.chat.chatPeople,
    status: state.chat.status,

    theme:state.chat.theme
  }
}

export default connect(mapStateToProps, {setAuthToken, setUserData})(Chat);

const styles = StyleSheet.create({
  TextStyle:{
    fontSize:28,
    fontFamily:FONTS.GOTHAM_BLACK,
  },
  SectionViewStyling:{
    alignSelf:'flex-end',
    marginRight:20,
  },
  SectionHeadingStyle:{
    fontSize:22,
    fontFamily:FONTS.HELVETICA_NEUE,
  },
})