import React from 'react';
import { Text, StyleSheet, TouchableOpacity, View } from 'react-native';
import {FONTS, COLORS_LIGHT_THEME} from '../Constants';
import Typing from '../components/Typing';
import Image from 'react-native-fast-image';
import TimeAgo from 'react-native-timeago';

getInitials = (name) => {
  if (!name){return null}
  let initials = name.match(/\b\w/g) || [];
  initials = ((initials.shift() || '') + (initials.pop() || '')).toUpperCase();
  return initials
}

const getBadge = (props) => {
  const {COLORS} = props;

  if (props.typing){
    return (
      <View style={{
        position:'absolute', right:-4, top:0, justifyContent:'center', alignItems:'center',
        borderColor:COLORS.LIGHT, borderWidth:1,
        height:10 , width:14, borderRadius:5, 
        backgroundColor:COLORS.YELLOW
        }}>
        <Typing size={14}/>
      </View>
    );
  }
  else if (props.online){
    return (
      <View style={{
        position:'absolute', right:0, top:0, borderColor:COLORS.LIGHT, borderWidth:1,
        backgroundColor:'rgb(82, 196, 27)', height:10, width:10, borderRadius:5}}>
      </View>
    );
  }
  else{
    return <View/>
  }
}

const getRecentTime = (time) => {
  return (
    <Text style={{color:COLORS_LIGHT_THEME.THEME1, fontSize:10, 
      fontFamily:FONTS.PRODUCT_SANS_BOLD}}>
      <TimeAgo time={Date.parse(time)} interval={30000}/>
    </Text>
  )
}

const getRecentMessage = (message) => {
  if (message.length>30){
    message = message.substring(0,28) + "..."
  }
  return message
}

export default ChatPeople = (props) => {
  let IMAGE_SIZE = 40;
  if (props.chatPeopleSearch){
    IMAGE_SIZE = 48
  }
  const {COLORS} = props;
  
  return(
    <TouchableOpacity activeOpacity={1} onPress={() => {props.onPress()}}>
      <View style={{...styles.ViewStyling, borderColor:COLORS.GRAY, 
        backgroundColor:COLORS.LIGHT,borderRadius:IMAGE_SIZE/4}}>
        <View style={{justifyContent:'center', flexDirection:'row', alignItems:'center'}}>
          <View>
            <Image
              source={(props.data.image_url)?{uri:props.data.image_url}:require('../../assets/icons/user.png')}
              style={{height:IMAGE_SIZE, width:IMAGE_SIZE, borderRadius:IMAGE_SIZE/2}}
            />
            {getBadge(props)}
          </View>
          
          <View style={{marginHorizontal:10, justifyContent:'center', alignItems:'flex-start'}}>
            <Text style={{...styles.TextStyle, 
              color:COLORS.LESS_DARK}}>
              {props.data.name}
            </Text>
            {(props.data.email)?(
              <Text style={{...styles.InterestStyle, fontSize:12,
              color:(props.theme==='light')?COLORS.LIGHT_GRAY:COLORS.LESS_DARK}}>
                {props.data.email}
              </Text>
            ):null}
            {(props.recentMessage && props.recentActivity)?(
              <Text style={{...styles.InterestStyle, fontSize:14, 
                color:COLORS.DARK_GRAY}}>
                {getRecentMessage(props.recentMessage)}
            </Text>
            ):null}
            {(props.recentMessage && props.recentActivity)?(
              getRecentTime(props.recentActivity)
            ):null}
          </View>
        </View>

        {
          (props.unread_messages)?
          (
            <View style={{...styles.BadgeViewStyle,
              backgroundColor:(props.theme==='light')?COLORS.RED:COLORS.GREEN}}>
              <Text style={{...styles.BadgeTextStyle, 
                color:COLORS.LIGHT}}>
                {props.unread_messages}
              </Text>
            </View>
          ):null
        }
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  ViewStyling:{
    alignItems:'center',
    flexDirection:'row',
    paddingHorizontal:15,
    paddingVertical:10,
    width:"90%",
    margin:8, 
    flex:1,
    justifyContent:'space-between',
    alignSelf:'center',
    borderWidth:0.5,
    overflow:'hidden',
  },
  TextStyle:{
    fontSize:18,
    fontFamily:FONTS.PRODUCT_SANS_BOLD,
  },
  InterestStyle:{
    fontSize:10,
    fontFamily:FONTS.PRODUCT_SANS,
  },
  BadgeTextStyle:{
    fontFamily: FONTS.PRODUCT_SANS_BOLD,
    fontSize:12
  },
  BadgeViewStyle:{
    borderRadius:20,
    justifyContent:'center',
    alignItems:'center',
    padding:3,
    elevation:6,
    minWidth: 28,
    minHeight:28,
  }
})