import React, {Component} from 'react';
import {connect} from 'react-redux'
import { View, Text, StyleSheet, StatusBar,FlatList, RefreshControl } from 'react-native';
import BottomTab from '../components/BottomTab';
import {logEvent} from '../actions/ChatAction';
import {FONTS,LOG_EVENT} from '../Constants';
import {setAuthToken, setUserData, chatPeopleSearchAction, getChatPeopleExplicitly} from '../actions/ChatAction';
import {Actions} from 'react-native-router-flux'
import ChatPeople from '../components/ChatPeople';
import changeNavigationBarColor from 'react-native-navigation-bar-color';
import SView from 'react-native-simple-shadow-view';
import ChatPeopleSearch from '../components/ChatPeopleSearch';
import Loading from '../components/Loading';
import TimedAlert from '../components/TimedAlert';
import analytics from '@react-native-firebase/analytics'

class Chat extends Component {

  constructor() {
    super();
    this.state={showStartTime: Date.now(), chatPeopleSearchText:""}
  }

  componentDidMount(){
    analytics().setCurrentScreen('Chat', 'Chat')
    if (!this.props.authTokenSet){
      this.props.setAuthToken()
    }
  }

  componentWillUnmount(){
    logEvent(LOG_EVENT.TIME_IN_CHAT, {mili_seconds: Date.now()-this.state.showStartTime,
    endTime:Date.now()})
  }
  
  renderSection(title){
    const {COLORS} = this.props;
    return(
      <View style={{alignItems:'center'}}>
        {(title==="Chats")?<View style={{height:0.5, width:'94%', 
          backgroundColor:COLORS.GRAY, 
        margin:10}}/>:<View/>}
        <View style={styles.SectionViewStyling}>
          <Text style={{...styles.SectionHeadingStyle, color:COLORS.LIGHT_GRAY}}>
            {title}
          </Text>
        </View>
      </View>
    );
  };

  showTimedAlert(){
    if (!this.state.chatPeopleSearchText){
      this.timedAlert.showAlert(3000, "Please enter some text");
    }
  }

  renderHeader(){
    const {COLORS} = this.props;
    return (
      <SView style={{borderRadius:10, height:55, paddingLeft:20,top:10,
        alignItems:'center', flexDirection:'row', shadowColor:'#202020',zIndex:10,width:"92%",
        shadowOpacity:0.3, shadowOffset:{width:0,height:10},shadowRadius:8,position:'absolute',
        backgroundColor:(this.props.theme==='light')?COLORS.LIGHT:COLORS.LESS_LIGHT, alignSelf:'center'}}>
          <Text style={{...styles.TextStyle, color:COLORS.DARK}}>
            chat
          </Text>
      </SView>
    )
  }

  renderChatPeopleDefault(){
    const DATA = this.props.chats;
    const {COLORS} = this.props;
    return (
      <FlatList
        refreshControl = {
          <RefreshControl
            onRefresh={()=>{this.props.getChatPeopleExplicitly()}}
            colors={["rgb(0,181, 213)"]}
            refreshing={false}
          />
        }
        contentContainerStyle={{marginTop:15, flexGrow:1}}
        keyboardShouldPersistTaps="always"
        data={DATA}
        ListHeaderComponent = {
          <View>
            <View style={{height:70, width:1}}/>
            <ChatPeopleSearch 
              theme={this.props.theme}
              COLORS = {COLORS}
              value={this.state.chatPeopleSearchText}
              onTextChange={(value)=>{this.setState({chatPeopleSearchText:value})}}
              onSearch={()=>{this.showTimedAlert()
              ;this.props.chatPeopleSearchAction(this.state.chatPeopleSearchText)}}
            />
          </View>
        }
        ListEmptyComponent = {
          <View style={{flex:1, justifyContent:'center', alignItems:'center', marginBottom:50,
            padding:40,}}>
            <Text style={{textAlign:'center',fontFamily:FONTS.PRODUCT_SANS_BOLD, fontSize:18,
            color:COLORS.LESSER_DARK}}>
              No one for chat, search people with their email to start chatting
            </Text>
          </View>
        }
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => {
        if (!this.props.status.hasOwnProperty(item._id)){
          this.props.status[item._id] = {online: true, typing: false, unread_messages: 0}
        }
        return (
        <ChatPeople data={item}
          COLORS = {COLORS}
          theme={this.props.theme}
          typing={this.props.status[item._id].typing} 
          online={this.props.status[item._id].online}
          unread_messages= {this.props.status[item._id].unread_messages}
          onPress={()=>{
          this.props.setUserData(item);
          Actions.chatscreen();
          analytics().setCurrentScreen("ChatScreen", "ChatScreen")
          logEvent(LOG_EVENT.SCREEN_CHANGE, 'chatscreen');}}
        />)
        }}
      />
    );
  }

  renderChatSearchPeople(){
    const {COLORS} = this.props;
    return (
      <FlatList
        data={this.props.chatPeopleSearch}
        contentContainerStyle={{marginTop:15, flex:1}}
        keyExtractor={(item, index)=>index.toString()}
        ListHeaderComponent = {
          <View>
            <View style={{height:70, width:1}}/>
            <ChatPeopleSearch 
              theme={this.props.theme}
              COLORS = {COLORS}
              value={this.state.chatPeopleSearchText}
              onTextChange={(value)=>{this.setState({chatPeopleSearchText:value})}}
              onSearch={()=>{this.showTimedAlert();
              this.props.chatPeopleSearchAction(this.state.chatPeopleSearchText)}}
              showSearchResults
              onCancel={()=>{this.setState({chatPeopleSearchText:""}); this.props.chatPeopleSearchAction(null) }}
            />
          </View>
        }
      ListEmptyComponent = {
        <View style={{flex:1, justifyContent:'center', alignItems:'center', marginBottom:50}}>
          <Text style={{fontFamily:FONTS.PRODUCT_SANS_BOLD, fontSize:18,
          color:COLORS.LESSER_DARK}}>
            No results found
          </Text>
        </View>
      }
        renderItem={({item})=>{
          return (
          <ChatPeople data={item}
            theme={this.props.theme}
            chatPeopleSearch = {true}
            data = {item}
            COLORS = {COLORS}
            onPress={()=>{
            this.props.setUserData(item);
            Actions.chatscreen();
            analytics().setCurrentScreen("ChatScreen", "ChatScreen")
            logEvent(LOG_EVENT.SCREEN_CHANGE, 'chatscreen');}}
          />)
        }}
      />
    )
  }

  renderChatPeople(){
    if (this.props.chatPeopleSearch){
      return this.renderChatSearchPeople()
    }
    else{
      return this.renderChatPeopleDefault()
    }
  }

  renderNoChatAvailable(){
    const {COLORS} = this.props;
    return(
      <View style={{flex:1, justifyContent:'center', alignItems:'center'}}>
        <Text style={{textAlign:'center', fontFamily: FONTS.PRODUCT_SANS_BOLD, fontSize:18, 
          color:COLORS.LESS_DARK}}>
          No one available for chat
        </Text>
      </View>
    )
  }

  renderLoader(){
    return(
      <View style={{flex:1, justifyContent:'center', alignItems:'center'}}>
        <Loading size={128}/>
      </View>
    )
  }

  render() {
    const {COLORS} = this.props;
    return(
      <View style={{flex:1,justifyContent:'space-between', 
        backgroundColor:COLORS.LIGHT}}>
        <StatusBar
          backgroundColor={COLORS.LIGHT}
          barStyle={(this.props.theme==='light')?'dark-content':'light-content'}/>
        {changeNavigationBarColor(COLORS.LIGHT, (this.props.theme==='light'))}
        <TimedAlert theme={this.props.theme} onRef={ref=>this.timedAlert = ref} 
          COLORS = {COLORS}
        />
        {this.renderHeader()}
        {
          (this.props.loading)?
          this.renderLoader():
          this.renderChatPeople()
        }
        <BottomTab icon_index={3}/>
      </View>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    loading: state.chat.loading,
    chatPeople: state.chat.chatPeople,
    chats: state.chat.chats,
    status: state.chat.status,
    chatPeopleSearchLoading: state.chat.chatPeopleSearchLoading,

    theme:state.chat.theme,
    COLORS: state.chat.COLORS,
    authTokenSet:state.chat.authTokenSet,
    chatPeopleSearch:state.chat.chatPeopleSearch
  }
}

export default connect(mapStateToProps, {setAuthToken, setUserData, chatPeopleSearchAction,
  getChatPeopleExplicitly})(Chat);

const styles = StyleSheet.create({
  TextStyle:{
    fontSize:24,
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