import React from 'react';
import {View, TextInput, TouchableOpacity, Text, Keyboard} from 'react-native';
import {FONTS, COLORS_DARK_THEME, COLORS_LIGHT_THEME} from '../Constants';

let searchValue = ""

const ChatPeopleSearch = (props) => {
  return (
    <View style={{marginBottom:30, marginHorizontal:15, marginVertical:5}}>
      <View style={{alignItems:'flex-end', flexDirection:'row',justifyContent:'space-between'}}>
        <TextInput
          placeholder={"Search using email..."}
          placeholderTextColor={(props.theme==='light')?COLORS_LIGHT_THEME.LIGHT_GRAY:COLORS_DARK_THEME.LIGHT_GRAY}
          keyboardType="email-address"
          textContentType="emailAddress"
          style={{fontFamily:FONTS.RALEWAY, fontSize:16, 
            color:(props.theme==='light')?COLORS_LIGHT_THEME.LESSER_DARK:COLORS_DARK_THEME.LESSER_DARK,
            borderColor:(props.theme==='light')?COLORS_LIGHT_THEME.LIGHT_GRAY:COLORS_DARK_THEME.LIGHT_GRAY,
            borderBottomWidth:1, padding:2, flex:1, marginRight:10
          }}
          value={props.value}
          multiline={false}
          onChangeText={(value)=>{props.onTextChange(value)}}
        />
        <TouchableOpacity 
          style={{paddingHorizontal:10, paddingVertical:6, borderRadius:6,elevation:7,
          backgroundColor:(props.theme==='light')?COLORS_LIGHT_THEME.LESSER_DARK:COLORS_DARK_THEME.LESSER_DARK}}
          activeOpacity={0.75} onPress={()=>{Keyboard.dismiss();props.onSearch(); searchValue = props.value}}>
          <Text style={{fontFamily:FONTS.RALEWAY_BOLD, fontSize:18,
          color:(props.theme==='light')?COLORS_LIGHT_THEME.LESSER_LIGHT:COLORS_DARK_THEME.LESSER_LIGHT}}>
            search
          </Text>
        </TouchableOpacity>
      </View>
      {(props.showSearchResults)?(
        <View style={{flexDirection:'row', justifyContent:'space-between', alignItems:'flex-start',marginTop:5, }}>
          <View style={{flexWrap:'wrap'}}>
            <Text style={{fontFamily:FONTS.RALEWAY_BOLD, fontSize:20,
              color:(props.theme==='theme')?COLORS_LIGHT_THEME.LESSER_DARK:COLORS_DARK_THEME.LESSER_DARK}}>
              Showing results for
            </Text>
            <Text style={{fontFamily:FONTS.RALEWAY, fontSize:14,
              color:(props.theme==='theme')?COLORS_LIGHT_THEME.LESSER_DARK:COLORS_DARK_THEME.LESSER_DARK}}>
              {` ${searchValue}`}
            </Text>
          </View>
          <TouchableOpacity 
            style={{paddingHorizontal:10, paddingVertical:6, borderRadius:6,elevation:7,
            backgroundColor:(props.theme==='light')?COLORS_LIGHT_THEME.RED:COLORS_DARK_THEME.RED}}
            activeOpacity={0.75} onPress={()=>{Keyboard.dismiss();props.onCancel(); searchValue = ""}}>
            <Text style={{fontFamily:FONTS.RALEWAY_BOLD, fontSize:18,
            color:COLORS_LIGHT_THEME.LIGHT,}}>
              cancel
            </Text>
          </TouchableOpacity>
        </View>
      ):null}
    </View>
  )
}

export default ChatPeopleSearch;