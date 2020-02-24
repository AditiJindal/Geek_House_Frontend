import React, {Component} from 'react';
import {View, Text, StatusBar, Dimensions, ScrollView, 
  StyleSheet, TouchableOpacity, TouchableNativeFeedback} from 'react-native';
import {connect} from 'react-redux';
import {Overlay, Icon} from 'react-native-elements';
import Image from 'react-native-fast-image';
import {FONTS} from '../Constants';
import Loading from '../components/Loading';
import TimedAlert from '../components/TimedAlert';
import {Menu, MenuOptions, MenuOption, 
  MenuTrigger, MenuProvider} from 'react-native-popup-menu';
import {modifyAdmins} from '../actions/ChatAction';

const overlayWidth = Dimensions.get('screen').width*0.86

const imageUrlCorrector = (image_url, image_adder) => {
  if (image_url.substring(0,4) !== 'http'){
    image_url = image_adder + image_url
  }
  return image_url
}

class ChatInfo extends Component {

  handleModifyAdmins(user_id, isUserAdmin){
    const group_id = this.props.other_user_data._id
    const add = !isUserAdmin
    // data = {group_id:String, user_id:String, add:Boolean}
    const data = {group_id, user_id, add}
    console.log("SENDING THIS : ", data)
    modifyAdmins(data)
  }

  chatPeopleComponentHelper(user){
    const {image_url, name, isAdmin, _id} = user
    return (      
      <View style={{flex:1, flexDirection:'row', alignItems:'center', justifyContent:'space-between',
        paddingHorizontal:15}}>
        <View style={{flexDirection:'row', alignItems:'center'}}>
          <View style={{height:48, width:48, borderRadius:24, overflow:'hidden', elevation:7}}>
            <Image source={{uri:imageUrlCorrector(image_url, this.props.image_adder)}} 
              style={{flex:1}}/>
          </View>
          <Text style={{fontFamily:FONTS.RALEWAY, color:COLORS.DARK, fontSize:20, marginLeft:10}}>
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
          onSelect={this.handleModifyAdmins.bind(this, _id, isAdmin)} text={text} />
        <MenuOption customStyles={{optionText:{...styles.MenuText, color:COLORS.DARK}, OptionTouchableComponent:TouchableOpacity}}
          onSelect={()=>{this.timedAlert.showAlert(2000, 'Feature coming in future update', 1)}} text='Remove from group' />
      </MenuOptions>
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
    if((admins.length<2) && !isCurrentUserAdmin){return null}
    else{
      return (
        <TouchableNativeFeedback background={TouchableNativeFeedback.Ripple(COLORS.DARK)}
          onPress = {()=>{
            this.handleModifyAdmins(this.props.currentUserId, true)
            this.timedAlert.showAlert(2000, "You are no longer an admin", 1);
          }}>
          <View activeOpacity={0.8}
            style={{...styles.EndButton, backgroundColor: COLORS.GRAY}}
            >
          <Text style={{fontFamily:FONTS.RALEWAY, fontSize:18, color:COLORS.LIGHT, marginRight:5}}>
            Resign from Admin
          </Text>
          <Icon name="user-x" size={18} color={COLORS.LIGHT} type="feather"/>
          </View>
        </TouchableNativeFeedback>
      )
    }
  }

  renderAddParticipant(admins){
    const isCurrentUserAdmin = admins.includes(this.props.currentUserId)
    if (!isCurrentUserAdmin){return null}
    return (
      <TouchableNativeFeedback background={TouchableNativeFeedback.Ripple(COLORS.DARK)}
        onPress={()=>{this.timedAlert.showAlert(2000, 'Feature coming in future update', 1)}}>
        <View style={{flexDirection:'row', alignItems:'center', backgroundColor:COLORS.GRAY, 
        padding:10, justifyContent:'center', margin:5}} activeOpacity={0.8}>
        <Icon type={'feather'} name={'user-plus'} size={26} color={COLORS.LIGHT}/>
        <Text style={{fontFamily:FONTS.RALEWAY, fontSize:20, color:COLORS.LIGHT, marginLeft:15}}>
          Add a new member
        </Text>
        </View>
      </TouchableNativeFeedback>

    )
  }

  renderLeaveGroup(){
    const {COLORS} = this.props;
    return (
      
      <TouchableNativeFeedback background={TouchableNativeFeedback.Ripple(COLORS.DARK)}
        onPress={()=>{this.timedAlert.showAlert(2000, 'Feature coming in future update', 1)}}>
        <View activeOpacity={0.5}
          style={{...styles.EndButton, backgroundColor: COLORS.GRAY, borderBottomLeftRadius:15,
          borderBottomRightRadius:15,}} >
          <Text style={{fontFamily:FONTS.RALEWAY, fontSize:18, color:COLORS.LIGHT, marginRight:5}}>
            Leave Group
          </Text>
          <Icon name="log-out" size={18} color={COLORS.LIGHT} type="feather"/>
        </View>
      </TouchableNativeFeedback>
    )
  }

  render(){
    const {COLORS, other_user_data, image_adder, isLoading, chat_group_participants} = this.props;
    const group_participants = chat_group_participants[other_user_data._id]

    return (
      <Overlay isVisible={this.props.isVisible}
        borderRadius={20}
        onBackdropPress={this.props.onBackdropPress}
        overlayStyle={{marginBottom:25, elevation:0, padding:0, 
          overflow:'hidden', width:overlayWidth, height:"82%"}}
        containerStyle={{padding:0}}
        animationType='none'
        overlayBackgroundColor={(COLORS.THEME==='light')?COLORS.LIGHT:COLORS.LESS_LIGHT}>
        <StatusBar 
          barStyle={(COLORS.THEME==='light')?'dark-content':'light-content'}
          backgroundColor={COLORS.OVERLAY_COLOR}/>
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
                {this.renderAddParticipant(group_participants.admins)}
                {this.renderChatPeople(group_participants, image_adder)}
                <View style={{height:20, width:1}}/>
                {this.renderLeaveFromAdmin(group_participants.admins)}
                {this.renderLeaveGroup()}
              </ScrollView>
            </MenuProvider>
          )
        }
      </Overlay>
    )
  }
}

const mapStateToProps = (state) => {
  return {
    authtoken: state.login.authtoken,

    chat_group_participants: state.chat.chat_group_participants
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