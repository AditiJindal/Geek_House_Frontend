import React, {Component} from 'react';
import {connect} from 'react-redux'
import { View, Text, StyleSheet, StatusBar,FlatList, RefreshControl } from 'react-native';
import BottomTab from '../components/BottomTab';
import {logEvent} from '../actions/ChatAction';
import {FONTS, COLORS_LIGHT_THEME, COLORS_DARK_THEME, LOG_EVENT} from '../Constants';
import {setAuthToken, setUserData, chatPeopleSearchAction, getChatPeopleExplicitly} from '../actions/ChatAction';
import {Actions} from 'react-native-router-flux'
import ChatPeople from '../components/ChatPeople';
import changeNavigationBarColor from 'react-native-navigation-bar-color';
import SView from 'react-native-simple-shadow-view';
import ChatPeopleSearch from '../components/ChatPeopleSearch';
import Loading from '../components/Loading';

class Chat extends Component {

  constructor() {
    super();
    this.state={showStartTime: Date.now(), chatPeopleSearchText:""}
  }

  componentDidMount(){
    if (!this.props.authTokenSet){
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

  renderChatPeopleDefault(){
    const DATA = this.props.chatPeople.recents
    return (
      <FlatList
        refreshControl = {
          <RefreshControl
            onRefresh={()=>{this.props.getChatPeopleExplicitly()}}
            colors={["rgb(0,181, 213)"]}
            refreshing={false}
          />
        }
        contentContainerStyle={{marginTop:15, flex:1}}
        keyboardShouldPersistTaps="always"
        data={DATA}
        ListHeaderComponent = {
          <ChatPeopleSearch 
            theme={this.props.theme} 
            value={this.state.chatPeopleSearchText}
            onTextChange={(value)=>{this.setState({chatPeopleSearchText:value})}}
            onSearch={()=>{this.props.chatPeopleSearchAction(this.state.chatPeopleSearchText)}}
          />}
        ListFooterComponent = {
          <Text style={{fontFamily:FONTS.PRODUCT_SANS, fontSize:10, margin:20,
            color:(this.props.theme)?COLORS_LIGHT_THEME.GRAY:COLORS_DARK_THEME.GRAY}}>
            {`* Long press on an image to save it in gallery\n* Long press on text to copy it to clipboard`}
          </Text>
        }
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => {
        return (
        <ChatPeople data={item}
          theme={this.props.theme}
          typing={this.props.status[item._id].typing} 
          online={this.props.status[item._id].online}
          unread_messages= {this.props.status[item._id].unread_messages}
          onPress={()=>{
          console.log("Item is: ", item);
          this.props.setUserData(item);
          Actions.chatscreen();logEvent(LOG_EVENT.SCREEN_CHANGE, 'chatscreen');}}
        />)
        }}
      />
    );
  }

  renderChatSearchPeople(){
    return (
      <FlatList
        data={this.props.chatPeopleSearch}
        contentContainerStyle={{marginTop:15, flex:1}}
        keyExtractor={(item, index)=>{index.toString()}}
        ListHeaderComponent = {
          <ChatPeopleSearch 
            theme={this.props.theme} 
            value={this.state.chatPeopleSearchText}
            onTextChange={(value)=>{this.setState({chatPeopleSearchText:value})}}
            onSearch={()=>{this.props.chatPeopleSearchAction(this.state.chatPeopleSearchText)}}
            showSearchResults
            onCancel={()=>{this.setState({chatPeopleSearchText:""}); this.props.chatPeopleSearchAction(null) }}
          />}
      ListEmptyComponent = {
        <View style={{flex:1, justifyContent:'center', alignItems:'center', marginBottom:50}}>
          <Text style={{fontFamily:FONTS.PRODUCT_SANS_BOLD, fontSize:18,
          color:(this.props.theme==='light')?COLORS_LIGHT_THEME.LESSER_DARK:COLORS_DARK_THEME.LESSER_DARK}}>
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
            onPress={()=>{
            this.props.setUserData(item);
            Actions.chatscreen();
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
    return(
      <View style={{flex:1, justifyContent:'center', alignItems:'center'}}>
        <Text style={{textAlign:'center', fontFamily: FONTS.PRODUCT_SANS_BOLD, fontSize:18, color:(this.props.theme==='light')?COLORS_LIGHT_THEME.LESS_DARK:COLORS_DARK_THEME.LESS_DARK}}>
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
        {/* {
          (this.props.loading)?
          this.renderNoChatAvailable():
          this.renderChatPeople()
        } */}
        {
          (this.props.loading)?
          this.renderLoader():
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
    chatPeopleSearchLoading: state.chat.chatPeopleSearchLoading,
    theme:state.chat.theme,
    authTokenSet:state.chat.authTokenSet,
    chatPeopleSearch:state.chat.chatPeopleSearch
  }
}

export default connect(mapStateToProps, {setAuthToken, setUserData, chatPeopleSearchAction,
  getChatPeopleExplicitly})(Chat);

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