import React from 'react';
import { View, Text, StyleSheet,  }from 'react-native';
import {FONTS,COLORS_LIGHT_THEME, COLORS_DARK_THEME} from '../Constants';
import SView from 'react-native-simple-shadow-view'
// import console = require('console');

export default CardView = (props) => {
  return(
    <SView style={{...styles.CardViewStyle, 
      backgroundColor:(props.theme==='light')?COLORS_LIGHT_THEME.LIGHT:COLORS_DARK_THEME.LESS_LIGHT}}>
      <Text style={{...styles.SubHeadingStyle,
        borderColor:(props.theme==='light')?COLORS_LIGHT_THEME.LESS_LIGHT:COLORS_DARK_THEME.GRAY,
        color:(props.theme==='light')?COLORS_LIGHT_THEME.DARK:COLORS_DARK_THEME.DARK}}>
        {props.cardData.sub_heading}
      </Text>
      <Text style={{...styles.ContentStyle,
        color:(props.theme==='light')?COLORS_LIGHT_THEME.DARK:COLORS_DARK_THEME.DARK}}>
        {props.cardData.content}
      </Text>
    </SView>
  );
}

const styles = StyleSheet.create({
  CardViewStyle:{
    shadowColor:'#202020',shadowOpacity:0.25,
    shadowOffset:{width:0,height:8},shadowRadius:6,
    margin:15,
    marginVertical:10,
    borderRadius:20,
    padding:15
  },
  SubHeadingStyle:{
    fontFamily:FONTS.MERRIWEATHER_BOLD,
    fontSize:20,
    marginBottom:5,
    borderBottomWidth:0.5,
    paddingBottom:3,
  },
  ContentStyle:{
    textAlign:'justify',
    fontFamily:FONTS.MERRIWEATHER,
    fontSize:16
  }
})