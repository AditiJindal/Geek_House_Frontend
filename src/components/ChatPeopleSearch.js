import React from 'react';
import {View, TextInput, TouchableOpacity, Text, Keyboard} from 'react-native';
import {FONTS,COLORS_LIGHT_THEME} from '../Constants';

let searchValue = ""

const ChatPeopleSearch = (props) => {
  const {COLORS} = props;
  return (
    <View style={{marginBottom:30, marginHorizontal:15, marginVertical:5}}>
      <View style={{alignItems:'flex-end', flexDirection:'row',justifyContent:'space-between'}}>
        <TextInput
          placeholder={"Search using email..."}
          placeholderTextColor={COLORS.LIGHT_GRAY}
          keyboardType="email-address"
          textContentType="emailAddress"
          style={{fontFamily:FONTS.RALEWAY, fontSize:16, 
            color:COLORS.LESSER_DARK,
            borderColor:COLORS.LIGHT_GRAY,
            borderBottomWidth:1, padding:2, flex:1, marginRight:10
          }}
          value={props.value}
          multiline={false}
          onChangeText={(value)=>{props.onTextChange(value)}}
        />
        <TouchableOpacity 
          style={{paddingHorizontal:10, paddingVertical:6, borderRadius:6,elevation:7,
          backgroundColor:COLORS.LESSER_DARK}}
          activeOpacity={0.75} onPress={()=>{Keyboard.dismiss();
          props.onSearch(); searchValue = props.value}}>
          <Text style={{fontFamily:FONTS.RALEWAY_BOLD, fontSize:18,
          color:COLORS.LESSER_LIGHT}}>
            search
          </Text>
        </TouchableOpacity>
      </View>
      {(props.showSearchResults)?(
        <View style={{flexDirection:'row', justifyContent:'space-between', alignItems:'flex-start',marginTop:5, }}>
          <View style={{flexWrap:'wrap'}}>
            <Text style={{fontFamily:FONTS.RALEWAY_BOLD, fontSize:20,
              color:COLORS.LESSER_DARK}}>
              Showing results for
            </Text>
            <Text style={{fontFamily:FONTS.RALEWAY, fontSize:14,
              color:COLORS.LESSER_DARK}}>
              {` ${searchValue}`}
            </Text>
          </View>
          <TouchableOpacity 
            style={{paddingHorizontal:10, paddingVertical:6, borderRadius:6,elevation:7,
            backgroundColor:COLORS.RED}}
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