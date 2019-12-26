import React, {Component} from 'react';
import { View, Text, StyleSheet,TouchableOpacity}from 'react-native';
import {FONTS, ERROR_BUTTONS, COLORS_LIGHT_THEME, COLORS_DARK_THEME} from '../Constants'
import {Overlay} from "react-native-elements";
import Image from 'react-native-fast-image'
// import console = require('console');


export default class CustomAlert extends Component {
  constructor() {
    super();
  }

  renderButton(obj){  
    if (obj.label === ERROR_BUTTONS.TICK){
      return (
        <TouchableOpacity onPress={this.props.onFirstButtonPress.bind(this)}
        activeOpacity={1}>
          <View style={{height:54, width:54, borderRadius:27, borderWidth:2,elevation:2,
            backgroundColor:(this.props.theme==='light')?COLORS_LIGHT_THEME.LIGHT:COLORS_DARK_THEME.LESS_LIGHT,
            justifyContent:'center', alignItems:'center', borderColor:(this.props.theme==='light')?COLORS_LIGHT_THEME.GREEN:COLORS_DARK_THEME.GREEN}}>
            <Image source={require('../../assets/icons/tick.png')} style={{height:22, width:22}}/>          
          </View>
        </TouchableOpacity>
      )
    }
    else if (obj.label === ERROR_BUTTONS.CROSS){
      return (
        <TouchableOpacity onPress={this.props.onSecondButtonPress.bind(this)}
        activeOpacity={1}>
          <View style={{height:54, width:54, borderRadius:27, borderWidth:2,elevation:2,
            backgroundColor:(this.props.theme==='light')?COLORS_LIGHT_THEME.LIGHT:COLORS_DARK_THEME.LESS_LIGHT,
            justifyContent:'center', alignItems:'center', borderColor:(this.props.theme==='light')?COLORS_LIGHT_THEME.RED:COLORS_DARK_THEME.RED}}>
            <Image source={require('../../assets/icons/cross.png')} style={{height:20, width:20}}/>          
          </View>
        </TouchableOpacity>
      )
    }
    else{
      return(
        <TouchableOpacity onPress={this.props.onThirdButtonPress.bind(this)}
        activeOpacity={1}>
          <View style={{justifyContent:'center', borderColor:obj.color, borderWidth:2, elevation:2,
          backgroundColor:(this.props.theme==='light')?COLORS_LIGHT_THEME.LIGHT:COLORS_DARK_THEME.LESS_LIGHT,
          alignItems:'center', borderRadius:8, paddingVertical:12, paddingHorizontal:10}}>
            <Text style={[styles.ButtonLabelStyle, {color:obj.color}]}>{obj.label}</Text>          
          </View>
        </TouchableOpacity>
      )
    }
  }

  renderButtonsFromList(){
    
    return(
      <View style={{justifyContent:'space-between', flexDirection:'row'}}>
        {this.props.message.type.map(
          (obj, key)=>{
            return (
              <View key={key}>{this.renderButton(obj)}</View>
            )
          }          
        )}
      </View>
    )
  }

  render() {
    return(
      <View>
        <Overlay isVisible={this.props.isVisible}
          borderRadius={15}
          onBackdropPress={this.props.onBackdropPress.bind(this)}
          overlayStyle={{margin:25, elevation:10}}
          animationType='none'
          overlayBackgroundColor={(this.props.theme==='light')?COLORS_LIGHT_THEME.LIGHT:COLORS_DARK_THEME.LESS_LIGHT}
          width="auto"
          height="auto">
          <View style={{padding:10, backgroundColor:(this.props.theme==='light')?COLORS_LIGHT_THEME.LIGHT:COLORS_DARK_THEME.LESS_LIGHT}}>

            <Text style={{...styles.TitleStyle,
              color:(this.props.theme==='light')?COLORS_LIGHT_THEME.DARK:COLORS_DARK_THEME.DARK}}>
              {this.props.message.title}
            </Text>
            <Text style={{...styles.ContentStyle, 
              color:(this.props.theme==='light')?COLORS_LIGHT_THEME.LIGHT_GRAY:COLORS_DARK_THEME.LESSER_DARK}}>
              {this.props.message.content}
            </Text>
            <View style={{padding:10}}>
              {this.renderButtonsFromList()} 
            </View>
          </View>
        </Overlay>
      </View>
    );
  }
}
const styles = StyleSheet.create({
  TitleStyle:{
    fontFamily:FONTS.GOTHAM_BLACK,
    fontSize:20,
    margin:5,
    textAlign:'center'
  },
  ContentStyle:{
    margin:5,
    flexWrap:'wrap',
    fontFamily:FONTS.LATO,
    fontSize:18,
    textAlign:'justify'
  },
  ButtonLabelStyle:{
    fontFamily:FONTS.PRODUCT_SANS,
    fontSize:20,
  }
})