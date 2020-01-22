import React from 'react';
import {View, TextInput, TouchableOpacity, Text, Keyboard} from 'react-native';
import {FONTS,COLORS_LIGHT_THEME} from '../Constants';
import LinearGradient from 'react-native-linear-gradient';

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
        <TouchableOpacity activeOpacity={1}
          onPress={()=>{Keyboard.dismiss();
          props.onSearch(); searchValue = props.value}}>
          <LinearGradient style={{paddingHorizontal:10, paddingVertical:6, borderRadius:6,elevation:7,
            backgroundColor:COLORS.LESSER_DARK}}
            colors={(props.value.length>0)?
              ['rgb(0,181, 213)','rgb(0,224, 211)']:
              [COLORS_LIGHT_THEME.GRAY,COLORS_LIGHT_THEME.GRAY]}
            start={{x:1, y:0}} end={{x:1, y:1}}>
            <Text style={{fontSize:18,fontFamily:FONTS.RALEWAY_BOLD,color:COLORS_LIGHT_THEME.LIGHT}}>
              search
            </Text>
          </LinearGradient>
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