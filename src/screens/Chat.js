import React, {Component} from 'react';
import {connect} from 'react-redux';
import { View, Text, StyleSheet, StatusBar,FlatList,
  RefreshControl, TouchableOpacity } from 'react-native';
import BottomTab from '../components/BottomTab';
import {Overlay, Icon} from 'react-native-elements';
import {logEvent} from '../actions/ChatAction';
import {FONTS,LOG_EVENT, COLORS_LIGHT_THEME} from '../Constants';
import {setAuthToken, setUserData, 
  chatPeopleSearchAction, getChatPeopleExplicitly} from '../actions/ChatAction';
import {Actions} from 'react-native-router-flux';
import LinearGradient from 'react-native-linear-gradient';
import ChatPeople from '../components/ChatPeople';
import changeNavigationBarColor from 'react-native-navigation-bar-color';
import SView from 'react-native-simple-shadow-view';
import ChatPeopleSearch from '../components/ChatPeopleSearch';
import Loading from '../components/Loading';
import TimedAlert from '../components/TimedAlert';
import analytics from '@react-native-firebase/analytics';
import { TextInput } from 'react-native-gesture-handler';

class Chat extends Component {

  constructor() {
    super();
    this.state={
      showStartTime: Date.now(),
      chatPeopleSearchText:"",
      peopleSelectorVisible:false,
      newGroupInfo: {name:'', users:[]}
    }
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

  onSearch(){
    if (this.state.chatPeopleSearchText.length===0){
      this.timedAlert.showAlert(2000, "Please enter some text");
    }
    else if (this.state.chatPeopleSearchText.length===0){
      this.timedAlert.showAlert(2000, "Please enter some more text");
    }
    else{
      this.props.chatPeopleSearchAction(this.state.chatPeopleSearchText)
    }
  }

  renderHeader(){
    const {COLORS} = this.props;
    return (
      <SView style={{borderRadius:10, height:55, paddingHorizontal:10,top:10, justifyContent:'space-between',
        alignItems:'center', flexDirection:'row', shadowColor:'#202020',zIndex:10,width:"92%",
        shadowOpacity:0.3, shadowOffset:{width:0,height:10},shadowRadius:8,position:'absolute',
        backgroundColor:(this.props.theme==='light')?COLORS.LIGHT:COLORS.LESS_LIGHT, alignSelf:'center'}}>
          <Text style={{...styles.TextStyle, color:COLORS.DARK}}>
            chat
          </Text>
          <TouchableOpacity activeOpacity={0.8}
            onPress={()=>{this.setState({peopleSelectorVisible:true})}}>
            <LinearGradient style={{paddingHorizontal:10, paddingVertical:6, borderRadius:6,
              flexDirection:'row', alignItems:'center'}}
              colors={["#EA384D", "#D31027"]}>
              <Text style={{fontSize:17,fontFamily:FONTS.RALEWAY_BOLD,color:COLORS_LIGHT_THEME.LIGHT}}>
                {'new group  '}
              </Text>
              <Icon name="user-plus" type="feather" size={18} color={COLORS_LIGHT_THEME.LIGHT}/>
            </LinearGradient>
          </TouchableOpacity>
      </SView>
    )
  }

  getSelectedUsers(user_id, shouldRemove){
    if (shouldRemove){
      new_users = [];
      this.state.newGroupInfo.users.map((item)=>{
        if (item!==user_id){
          new_users.push(item)
        }
      })
    }
    else{
      new_users = [...this.state.newGroupInfo.users, user_id]
    }
    
    this.setState({newGroupInfo:{...this.state.newGroupInfo, users:new_users}});
  }

  renderChatPeopleSelector(){
    const {COLORS}= this.props;
    const DATA = this.props.chats;

    return(
      <Overlay
        overlayStyle={{ borderRadius:25, elevation:10, paddingHorizontal:0, overflow:'hidden', 
          paddingVertical:0, marginBottom:27, backgroundColor:COLORS.LIGHT,}}
        isVisible={this.state.peopleSelectorVisible}
        onBackdropPress = {()=>{this.setState({peopleSelectorVisible:false})}}
        height="auto">
        <StatusBar 
          barStyle={(this.props.theme==='light')?'dark-content':'light-content'}
          backgroundColor={COLORS.OVERLAY_COLOR}/>
        <FlatList
          contentContainerStyle={{marginTop:15, flexGrow:1}}
          keyboardShouldPersistTaps="always"
          data={DATA}
          ListHeaderComponent = {
            <View style={{marginHorizontal:20, marginVertical:5}}>
              <TextInput
                keyboardType={"visible-password"}
                placeholder={"Enter name of the group..."}
                placeholderTextColor={COLORS.GRAY}
                value={this.state.newGroupInfo.name} maxLength={56}
                onChangeText={text=>this.setState({newGroupInfo: {...this.state.newGroupInfo, name:text}})}
                style={{fontFamily:FONTS.RALEWAY, fontSize:18, color:COLORS.DARK, 
                  borderColor:COLORS.GRAY, padding:0, margin:0, borderBottomWidth:1}}
              />
              <Text style={{color:COLORS.LESS_DARK, fontFamily:FONTS.RALEWAY_BOLD, 
                fontSize:18, marginTop:30}}>
                Select People To Add
              </Text>
              <Text style={{color:COLORS.LESS_DARK, fontFamily:FONTS.RALEWAY, fontSize:12}}>
                {(this.state.newGroupInfo.users.length)?(
                  `${this.state.newGroupInfo.users.length} people selected`
                ):" "}
              </Text>
            </View>
          }
          ListFooterComponent = {<View style={{height:8,width:1}}/>}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({item, index}) => {
            if (!this.props.status.hasOwnProperty(item._id)){
              this.props.status[item._id] = {online: true, typing: false, unread_messages: 0}
            }
            return (
              <>
                <ChatPeople 
                  data={item}
                  COLORS = {COLORS}
                  theme={this.props.theme}
                  image_adder = {this.props.image_adder}
                  isSelector={true}
                  isSelected={this.state.newGroupInfo.users.includes(DATA[index]._id)}
                  onPress={(user_id, shouldRemove)=>this.getSelectedUsers(user_id, shouldRemove)}
                />
                {
                  ((DATA.length-1)!==index)?(
                    <View style={{height:0.5, width:"80%", alignSelf:'center', backgroundColor:COLORS.GRAY}}/>
                  ):null
                }
              </>
              )
            }
          }
        />
      </Overlay>
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
              onSearch={()=>this.onSearch()}
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
        renderItem={({ item, index }) => {
        if (!this.props.status.hasOwnProperty(item._id)){
          this.props.status[item._id] = {online: true, typing: false, unread_messages: 0}
        }
        return (
        <>
          <ChatPeople data={item}
            COLORS = {COLORS}
            theme={this.props.theme}
            typing={this.props.status[item._id].typing} 
            online={this.props.status[item._id].online}
            unread_messages= {this.props.status[item._id].unread_messages}
            recentActivity = {this.props.status[item._id].recentActivity}
            recentMessage = {this.props.status[item._id].recentMessage}
            image_adder = {this.props.image_adder}
            onPress={()=>{
            this.props.setUserData(item);
            Actions.chatscreen();
            analytics().setCurrentScreen("ChatScreen", "ChatScreen");
            logEvent(LOG_EVENT.SCREEN_CHANGE, 'chatscreen');}}
          />
          <View style={{height:4, width:1}}/>
        </>
        )
        }}
      />
    );
  }

  renderChatSearchPeople(){
    const {COLORS} = this.props;
    return (
      <FlatList
        data={this.props.chatPeopleSearch}
        contentContainerStyle={{marginTop:15, flexGrow:1}}
        keyExtractor={(item, index)=>index.toString()}
        ListHeaderComponent = {
          <View>
            <View style={{height:70, width:1}}/>
            <ChatPeopleSearch 
              theme={this.props.theme}
              COLORS = {COLORS}
              value={this.state.chatPeopleSearchText}
              onTextChange={(value)=>{this.setState({chatPeopleSearchText:value})}}
              onSearch={()=>this.onSearch()}
              showSearchResults
              onCancel={()=>{this.setState({chatPeopleSearchText:""}); 
                this.props.chatPeopleSearchAction(null) }}
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
        renderItem={({item, index})=>{
          return (
          <>
            <ChatPeople data={item}
              finalElem={this.props.chatPeopleSearch && index===(this.props.chatPeopleSearch.length-1)}
              theme={this.props.theme}
              chatPeopleSearch = {true}
              data = {item}
              COLORS = {COLORS}
              image_adder = {this.props.image_adder}
              onPress={()=>{
              this.props.setUserData(item);
              Actions.chatscreen();
              analytics().setCurrentScreen("ChatScreen", "ChatScreen")
              logEvent(LOG_EVENT.SCREEN_CHANGE, 'chatscreen');}}
            />
            <View style={{height:4, width:1}}/>
          </>
          )
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
        {this.renderChatPeopleSelector()}
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
    image_adder: state.home.image_adder,

    theme:state.chat.theme,
    chats: state.chat.chats,
    status: state.chat.status,
    COLORS: state.chat.COLORS,
    loading: state.chat.loading,
    chatPeople: state.chat.chatPeople,
    authTokenSet:state.chat.authTokenSet,
    chatPeopleSearch:state.chat.chatPeopleSearch,
    chatPeopleSearchLoading: state.chat.chatPeopleSearchLoading,
  }
}

export default connect(mapStateToProps, {setAuthToken, setUserData, chatPeopleSearchAction,
  getChatPeopleExplicitly})(Chat);

const styles = StyleSheet.create({
  TextStyle:{
    fontSize:24,
    fontFamily:FONTS.GOTHAM_BLACK,
    marginLeft:10
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