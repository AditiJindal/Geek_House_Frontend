import React from 'react';
import {Text, StyleSheet}from 'react-native';
import {FONTS} from '../Constants';
import SView from 'react-native-simple-shadow-view';
// import console = require('console');

export default CardView = (props) => {
  const {COLORS} = props;
  return(
    <SView style={{...styles.CardViewStyle, 
      backgroundColor:(COLORS.THEME==='light')?COLORS.LIGHT:COLORS.LESS_LIGHT}}>
      <Text style={{...styles.SubHeadingStyle,
        borderColor:COLORS.GRAY,
        color:COLORS.DARK}}>
        {props.cardData.sub_heading}
      </Text>
      <Text style={{...styles.ContentStyle,
        color:COLORS.DARK}}>
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
    fontFamily:FONTS.RALEWAY_BOLD,
    fontSize:20,
    marginBottom:5,
    borderBottomWidth:0.5,
    paddingBottom:3,
  },
  ContentStyle:{
    textAlign:'justify',
    fontFamily:FONTS.MERRIWEATHER,
    fontSize:14
  }
})