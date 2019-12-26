import React from 'react';
import { Text, StyleSheet, TouchableOpacity, View } from 'react-native';
import {FONTS, COLORS_LIGHT_THEME, COLORS_DARK_THEME} from '../Constants';
import Typing from '../components/Typing';
import Image from 'react-native-fast-image';

getInitials = (name) => {
  if (!name){return null}
  let initials = name.match(/\b\w/g) || [];
  initials = ((initials.shift() || '') + (initials.pop() || '')).toUpperCase();
  return initials
}

const getBadge = (props) => {

  if (props.typing){
    return (
      <View style={{
        position:'absolute', right:-4, top:0, justifyContent:'center', alignItems:'center',
        borderColor:(props.theme==='light')?COLORS_LIGHT_THEME.LIGHT:COLORS_DARK_THEME.LESSER_LIGHT, borderWidth:1,
        height:10 , width:14, borderRadius:5, 
        backgroundColor:(props.theme==='light')?COLORS_LIGHT_THEME.YELLOW:COLORS_DARK_THEME.YELLOW
        }}>
        <Typing size={14}/>
      </View>
    );
  }
  else if (props.online){
    return (
      <View style={{
        position:'absolute', right:0, top:0, borderColor:(props.theme==='light')?COLORS_LIGHT_THEME.LIGHT:COLORS_DARK_THEME.LESSER_LIGHT, borderWidth:1,
        backgroundColor:'rgb(82, 196, 27)', height:10, width:10, borderRadius:5}}>
      </View>
    );
  }
  else{
    return <View/>
  }
}

export default ChatPeople = (props) => {
  
  return(
    <TouchableOpacity style={{...styles.ViewStyling, 
      backgroundColor:(props.theme==='light')?COLORS_LIGHT_THEME.LIGHT:COLORS_DARK_THEME.LESS_LIGHT}} 
      activeOpacity={1}
      onPress={() => {props.onPress()}}>
      <View>
        <Image
          source={(props.data.image_url)?{uri:props.data.image_url}:require('../../assets/icons/user.png')}
          style={{height:36, width:36, borderRadius:18}}
        />
        {getBadge(props)}
      </View>
      
      <View style={{marginHorizontal:10, justifyContent:'center', alignItems:'center'}}>
        <Text style={{...styles.TextStyle, 
          color:(props.theme==='light')?COLORS_LIGHT_THEME.LESS_DARK:COLORS_DARK_THEME.DARK}}>
          {props.data.name}
        </Text>
        {(props.data.fav_category)?
        (<Text style={{...styles.IntrestStyle, 
          color:(props.theme==='light')?COLORS_LIGHT_THEME.LIGHT_GRAY:COLORS_DARK_THEME.LESS_DARK}}>
          {props.data.fav_category}
        </Text>):
        <View/>}
      </View>

      {
        (props.unread_messages)?
        (
          <View style={{...styles.BadgeViewStyle, right: -10 - (props.unread_messages.toString().length*5), 
            borderColor:(props.theme==='light')?COLORS_LIGHT_THEME.RED:COLORS_DARK_THEME.GREEN,
            backgroundColor:(props.theme==='light')?COLORS_LIGHT_THEME.LIGHT:COLORS_DARK_THEME.LESS_LIGHT}}>
            <Text style={{...styles.BadgeTextStyle, 
              color:(props.theme==='light')?COLORS_LIGHT_THEME.RED:COLORS_DARK_THEME.GREEN}}>
              {props.unread_messages}
            </Text>
          </View>
        ):<View/>
      }
      
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  ViewStyling:{
    alignItems:'center',
    flexDirection:'row',
    alignSelf:'flex-start',
    paddingHorizontal:10,
    paddingVertical:7,
    margin:10,
    marginRight:80,
    elevation:4,
    borderRadius:10
  },
  TextStyle:{
    fontSize:18,
    fontFamily:FONTS.PRODUCT_SANS_BOLD,
  },
  IntrestStyle:{
    fontSize:12,
    fontFamily:FONTS.PRODUCT_SANS,
  },
  BadgeTextStyle:{
    fontFamily: FONTS.PRODUCT_SANS_BOLD,
    fontSize:12
  },
  BadgeViewStyle:{
    position: 'absolute',
    borderWidth:2,
    borderRadius:20,
    justifyContent:'center',
    alignItems:'center',
    padding:3,
    elevation:5,
    minWidth: 28,
    minHeight:28,
  }
})