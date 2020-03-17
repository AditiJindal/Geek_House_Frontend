import React, {Component} from 'react';
import {View, Text, FlatList, Dimensions, ScrollView,
  StyleSheet, TouchableOpacity} from 'react-native';
import {connect} from 'react-redux';
import {Overlay, Icon} from 'react-native-elements';
import Ripple from './Ripple';
import Image from 'react-native-fast-image';
import ChatPeople from './ChatPeople';
import {FONTS, MAX_USERS_IN_A_GROUP, COLORS_LIGHT_THEME} from '../Constants';
import Loading from '../components/Loading';
import TimedAlert from '../components/TimedAlert';
import {Menu, MenuOptions, MenuOption, 
  MenuTrigger, MenuProvider} from 'react-native-popup-menu';
import {modifyAdmins, leaveGroup, addGroupParticipants} from '../actions/ChatAction';

const overlayWidth = Dimensions.get('screen').width*0.86

const imageUrlCorrector = (image_url, image_adder) => {
  if (image_url.substring(0,4) !== 'http'){
    image_url = image_adder + image_url
  }
  return image_url
}

class ChatInfo extends Component {
  state={peopleSelectorVisible:false, peopleToAdd: []}

  handleModifyAdmins(user_id,user_name, isUserAdmin){
    const group_id = this.props.other_user_data._id
    const add = !isUserAdmin
    // data = {group_id:String, user_id:String, add:Boolean}
    const data = {group_id, user_id, add, user_name}
    modifyAdmins(data)
  }

  chatPeopleComponentHelper(user){
    const {image_url, name, isAdmin, _id} = user
    return (      
      <View style={{flex:1, flexDirection:'row', alignItems:'center', justifyContent:'space-between',
        paddingHorizontal:15}}>
        <View style={{flexDirection:'row', alignItems:'center'}}>
          <View style={{height:48, width:48, borderRadius:24, overflow:'hidden', elevation:7, backgroundColor:COLORS.LIGHT}}>
            <Image source={{uri:imageUrlCorrector(image_url, this.props.image_adder)}} 
              style={{flex:1}}/>
          </View>
          <Text style={{fontFamily:FONTS.PRODUCT_SANS, color:COLORS.DARK, fontSize:16, marginLeft:5}}>
            {name}
          </Text>
        </View>
  
        <View style={{flexDirection:'row', alignItems:'center'}}>
          {(isAdmin)?
            (
              <View style={{paddingVertical:5,paddingHorizontal:8, borderWidth:1.5, 
                borderColor:COLORS.GREEN, borderRadius:8, }}>
                <Text style={{fontFamily:FONTS.PRODUCT_SANS_BOLD, fontSize:10, color:COLORS.GREEN}}>
                  ADMIN
                </Text>
              </View>
            )
            :null
          }
          {
            (this.props.currentUserId === _id)?(
              <View style={{paddingVertical:5,paddingHorizontal:8, borderWidth:1.5, 
                borderColor:COLORS.YELLOW, borderRadius:8, marginLeft:5}}>
                <Text style={{fontFamily:FONTS.PRODUCT_SANS_BOLD, fontSize:10, color:COLORS.YELLOW}}>
                  ME
                </Text>
              </View>
            ):null
          }
        </View>
  
      </View>
    )
  }

  renderChatPeople(group_participants){
    const {COLORS} = this.props;
    if (!group_participants){return null}
    return (
      <View>
        <Text style={{fontFamily:FONTS.RALEWAY_BOLD, color:COLORS.GRAY, 
          fontSize:18, margin:10, marginLeft:15, textDecorationLine:'underline'}}>
          Group Members
        </Text>
        {group_participants.users.map((user, index)=>(
          <View key={index.toString()}>
          {(index)?<View style={{width:"90%", height:0.7, backgroundColor:COLORS.LIGHT_GRAY,
            marginVertical:7, alignSelf:'center'}}/>:null}
          {this.renderChatPeopleComponent(user, index, group_participants.admins)}
          </View>
        ))}
      </View>
    )
  }

  getMenuOptions(user){
    const {name, _id, isAdmin} = user;
    const text = isAdmin?'Remove from Admin':'Make Admin';


    return(
      <MenuOptions optionsContainerStyle={{backgroundColor:COLORS.LESSER_LIGHT,
        borderRadius:10, padding:5}}>
        <Text style={{fontFamily:FONTS.RALEWAY_BOLD, fontSize:12, color:COLORS.LIGHT_GRAY, marginLeft:5}}>
          {`Options for ${name}`}
        </Text>
        <MenuOption customStyles={{optionText:{...styles.MenuText, color:COLORS.DARK}, OptionTouchableComponent:TouchableOpacity }} 
          onSelect={this.handleModifyAdmins.bind(this, _id, name, isAdmin)} text={text} />
        <MenuOption customStyles={{optionText:{...styles.MenuText, color:COLORS.DARK}, OptionTouchableComponent:TouchableOpacity}}
          onSelect={()=>{leaveGroup(this.props.other_user_data._id, _id)}} text='Remove from group' />
      </MenuOptions>
    );
  }

  getSelectedUsers(user_id, shouldRemove){
    if (shouldRemove){
      new_users = [];
      this.state.peopleToAdd.map((item)=>{
        if (item!==user_id){
          new_users.push(item)
        }
      })
    }
    else if(this.state.peopleToAdd.length<MAX_USERS_IN_A_GROUP) {new_users = [...this.state.peopleToAdd, user_id]}
    else {this.timedAlert.showAlert(2000, 'Maximum limit of 128 reached')}
    
    this.setState({peopleToAdd :new_users});
  }

  onPressAdd(){
    if (this.state.peopleToAdd.length){
      addGroupParticipants(this.props.other_user_data._id, this.state.peopleToAdd)
      this.setState({peopleSelectorVisible:false})
    }
  }

  renderChatPeopleSelector(){
    const {COLORS, chat_group_participants, other_user_data}= this.props;
    const group_participants = chat_group_participants[other_user_data._id];
    let group_participants_user_ids = [];

    if (!group_participants){
      return
    }

    group_participants.users.map(item=>{
      group_participants_user_ids.push(item._id)
    });

    const DATA = this.props.chats;
    let itemsRendered=-1;

    return(
      <Overlay
        overlayStyle={{backgroundColor:'transparent', padding:0, elevation:0}}
        isVisible={this.state.peopleSelectorVisible}
        onBackdropPress = {()=>{this.setState({peopleSelectorVisible:false})}}
        height="100%" width="100%">
        <>
        <TimedAlert theme={this.props.theme} onRef={ref=>this.timedAlert2 = ref} COLORS = {COLORS} />
        <TouchableOpacity style={{flexGrow:1, flexDirection:'row',alignItems:'center', justifyContent:'center'}} 
          activeOpacity={1}
          onPress = {()=>{this.setState({peopleSelectorVisible:false})}}>
          <View style={{maxHeight:"70%", width:"75%", borderRadius:20, elevation:10, 
            backgroundColor:COLORS.LIGHT,}}>
            <FlatList
              contentContainerStyle={{marginTop:15}}
              keyboardShouldPersistTaps="always"
              data={DATA}
              ListEmptyComponent={(
                <View style={{flex:1, justifyContent:'center', alignItems:'center'}}>
                  <Text style={{fontFamily:FONTS.PRODUCT_SANS_BOLD, fontSize:18, color:COLORS.LESS_DARK}}>
                    No person To add
                  </Text>
                </View>
              )}
              ListHeaderComponent = {
                <View style={{marginHorizontal:20, marginVertical:5}}>
                  <View style={{flexDirection:'row', alignItems:'center', justifyContent:'space-between',
                    paddingTop:10, paddingBottom:5}}>
                    <View>
                      <Text style={{color:COLORS.LESS_DARK, fontFamily:FONTS.RALEWAY, fontSize:18, marginRight:10}}>
                        Select People To Add
                      </Text>
                      {
                        (this.state.peopleToAdd.length)?(
                          <Text style={{color:COLORS.LESS_DARK, fontFamily:FONTS.RALEWAY, fontSize:12}}>
                            {`${this.state.peopleToAdd.length} participants selected`}
                          </Text>
                        ):null
                      }
                    </View>
                    <Ripple rippleContainerBorderRadius={30}
                      style={{height:42, width:42, justifyContent:'center', alignItems:'center', 
                        borderRadius:30, elevation:3,
                        backgroundColor:(!this.state.peopleToAdd.length)?(COLORS.GRAY):(COLORS.GREEN)}} 
                      onPress={this.onPressAdd.bind(this)}>
                        <Icon type={'feather'} name={'check'} size={22} color={(!this.state.peopleToAdd.length)?(COLORS.LIGHT):(COLORS_LIGHT_THEME.LIGHT)}/>
                    </Ripple>
                  </View>
                </View>
              }
              ListFooterComponent = {<View style={{height:8,width:1}}/>}
              keyExtractor={(item, index) => {
                if (!item._id.toString()){return index.toString()}
                else{ return item._id.toString()}
              }}
              renderItem={({item, index}) => {
                if (!this.props.status.hasOwnProperty(item._id)){
                  this.props.status[item._id] = {online: true, typing: false, unread_messages: 0}
                }
                if (item.isGroup){return null}
                itemsRendered+=1;
                return (
                  <ChatPeople 
                    data={item}
                    COLORS = {COLORS}
                    theme={this.props.theme}
                    image_adder = {this.props.image_adder}
                    isSelector={true}
                    isSelected={this.state.peopleToAdd.includes(DATA[index]._id)}
                    isAddedToGroup={group_participants_user_ids.includes(DATA[index]._id)}
                    onPress={(user_id, shouldRemove)=>this.getSelectedUsers(user_id, shouldRemove)}
                  />
                  )
                }
              }
            />
          </View>
        </TouchableOpacity>
        </>
      </Overlay>
    )
  }

  renderChatPeopleComponent(user, index, admins){
    const isCurrentUserAdmin = admins.includes(this.props.currentUserId) // means if the user using the app is an admin of this group or not

    if (!isCurrentUserAdmin){
      return this.chatPeopleComponentHelper(user, index)
    }
    return (
      <Menu>
        <MenuTrigger customStyles={{TriggerTouchableComponent:
        (props)=>{
          if (this.props.currentUserId === user._id){return <View children={props.children} />}
          return <TouchableOpacity activeOpacity={0.9} {...props}/>
          }
        }} 
        triggerOnLongPress={false}>
          {this.chatPeopleComponentHelper(user, index)}
        </MenuTrigger>
        {this.getMenuOptions(user)}
      </Menu>
    )
  }

  renderLeaveFromAdmin(admins){
    const isCurrentUserAdmin = admins.includes(this.props.currentUserId)
    if((admins.length<2) || !isCurrentUserAdmin){return null}
    else{
      return (
        <Ripple 
          onPress = {()=>{
            this.handleModifyAdmins(this.props.currentUserId,this.props.user_name, true)
          }} style={{...styles.EndButton, backgroundColor: COLORS.GRAY}}>

          <Text style={{fontFamily:FONTS.RALEWAY, fontSize:18, color:COLORS.LIGHT, marginRight:5}}>
            Resign from Admin
          </Text>
          <Icon name="user-x" size={18} color={COLORS.LIGHT} type="feather"/>
        </Ripple>
      )
    }
  }

  renderAddParticipant(admins){
    const isCurrentUserAdmin = admins.includes(this.props.currentUserId)
    if (!isCurrentUserAdmin){return null}
    return (
      <Ripple
        onPress={()=>{this.setState({peopleSelectorVisible:true})}}
        style={{flexDirection:'row', alignItems:'center', backgroundColor:COLORS.GRAY, 
          padding:10, justifyContent:'center', margin:5}}>
        <Text style={{fontFamily:FONTS.RALEWAY, fontSize:18, color:COLORS.LIGHT, marginLeft:15}}>
          Add a new member
        </Text>
        <Icon type={'feather'} name={'user-plus'} size={18} color={COLORS.LIGHT}/>
      </Ripple>

    )
  }

  renderLeaveGroup(){
    const {COLORS, other_user_data, authtoken} = this.props;
    const group_id = other_user_data._id
    return (
      
      <Ripple
        onPress={()=>{leaveGroup(group_id, authtoken)}}
        style={{...styles.EndButton, backgroundColor: COLORS.GRAY, borderBottomLeftRadius:15,
          borderBottomRightRadius:15,}}>
        <Text style={{fontFamily:FONTS.RALEWAY, fontSize:18, color:COLORS.LIGHT, marginRight:5}}>
          Leave Group
        </Text>
        <Icon name="log-out" size={18} color={COLORS.LIGHT} type="feather"/>
      </Ripple>
    )
  }

  render(){
    const {COLORS, other_user_data, image_adder, isLoading, chat_group_participants} = this.props;
    const group_participants = chat_group_participants[other_user_data._id];

    if (this.props.chatGroupsLeft.includes(other_user_data._id)){
      return null
    }

    return (
      <Overlay isVisible={this.props.isVisible}
        borderRadius={20}
        onBackdropPress={this.props.onBackdropPress}
        overlayStyle={{marginBottom:25, elevation:0, padding:0,
          overflow:'hidden', width:overlayWidth, height:"82%"}}
        containerStyle={{padding:0}}
        animationType='none'
        overlayBackgroundColor={(COLORS.THEME==='light')?COLORS.LIGHT:COLORS.LESS_LIGHT}>
        <>
        {this.renderChatPeopleSelector()}
        <TimedAlert theme={this.props.theme} onRef={ref=>this.timedAlert = ref} COLORS = {COLORS}/>
        {
          (isLoading || !group_participants)?
          <View style={{flex:1, justifyContent:'center', alignItems:'center'}}>
            <Loading white={COLORS.THEME!=='light'} size={108}/>
          </View>:
          (
            <MenuProvider>
              <ScrollView showsVerticalScrollIndicator={false}>
                <Image
                  style={{height:overlayWidth, width:overlayWidth}}
                  source={{uri: imageUrlCorrector(other_user_data.image_url, image_adder)}}
                />
                <Text style={{...styles.NameText, color: COLORS.DARK}}>
                  {other_user_data.name}
                </Text>
                
                {this.renderChatPeople(group_participants, image_adder)}
                <View style={{height:20, width:1}}/>
                {this.renderAddParticipant(group_participants.admins)}
                {this.renderLeaveFromAdmin(group_participants.admins)}
                {this.renderLeaveGroup()}
              </ScrollView>
            </MenuProvider>
          )
        }
        </>
      </Overlay>
    )
  }
}

const mapStateToProps = (state) => {
  return {
    authtoken: state.login.authtoken,
    user_name: state.login.data.name,

    chat_group_participants: state.chat.chat_group_participants,
    chatGroupsLeft: state.chat.chatGroupsLeft,
    chats: state.chat.chats,
    status: state.chat.status,
  }
}

export default connect(mapStateToProps, {})(ChatInfo);

const styles = StyleSheet.create({
  NameText: {
    fontFamily: FONTS.PRODUCT_SANS_BOLD,
    fontSize:24,
    margin:10
  },
  MenuText: {
    fontFamily:FONTS.PRODUCT_SANS,
    fontSize:16,
  },
  ResignAdmin: {
    padding:10,
    marginHorizontal:10,
    borderRadius:10,
    borderWidth:1,
    alignSelf:'flex-end', 
    elevation:4
  },
  EndButton:{
    height:40,
    marginBottom:5,
    marginHorizontal:5,
    flexDirection:'row', 
    alignItems:'center',
    justifyContent:'center',
    flex:1, 
  }
})