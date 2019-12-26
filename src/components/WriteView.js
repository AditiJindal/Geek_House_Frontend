import React, {Component} from 'react';
import { View, StyleSheet, TextInput, TouchableOpacity, Text}from 'react-native';
import {Icon} from 'react-native-elements';
import CustomAlert from '../components/CustomAlert';
import {FONTS, ERROR_MESSAGES, COLORS_LIGHT_THEME, COLORS_DARK_THEME} from '../Constants';
import SView from 'react-native-simple-shadow-view';
// import console = require('console');


export default class WriteView extends Component {

  constructor() {
    super();
    this.state={
      isVisible:false,
    }
  }

  render() {
    return(
      <SView style={{...styles.CardViewStyle, 
        backgroundColor:(this.props.theme==='light')?COLORS_LIGHT_THEME.LIGHT:COLORS_DARK_THEME.LESS_LIGHT}}>
        <CustomAlert
          theme={this.props.theme}
          isVisible={this.state.isVisible}
          onFirstButtonPress={() => {this.setState({isVisible:false});this.props.onClose(this.props.index); this.props.onBackdropPress()}}
          onSecondButtonPress={()=>{this.setState({isVisible:false});this.props.onBackdropPress()}}
          onThirdButtonPress={()=>{this.setState({isVisible:false});this.props.onBackdropPress()}}
          onBackdropPress={()=>{this.setState({isVisible:false});this.props.onBackdropPress()}}
          message = {ERROR_MESSAGES.CONFIRM_WRITE_VIEW_DELETE}
        />
        <View style={{justifyContent:'space-between', flexDirection:'row', alignItems:'center',
          borderColor:(this.props.theme==='light')?COLORS_LIGHT_THEME.LESS_LIGHT:COLORS_DARK_THEME.LIGHT_GRAY,
          borderBottomWidth:0.6, marginHorizontal:10}}>
          <TextInput style={{...styles.SubHeadingStyle, flex:1,
            color:(this.props.theme==='light')?COLORS_LIGHT_THEME.DARK:COLORS_DARK_THEME.DARK,}}
            placeholderTextColor={(this.props.theme==='light')?COLORS_LIGHT_THEME.LESSER_DARK:COLORS_DARK_THEME.LESSER_DARK}
            value={this.props.obj.sub_heading}
            maxLength={128}
            
            onChangeText={(value)=>{this.props.onSubHeadingChange(value, this.props.index)}}
            textBreakStrategy="highQuality"
            multiline={false}
            textAlignVertical="top"
            multiline={true}
            placeholder={'Enter a heading'}/>
            <TouchableOpacity 
              onPress={() => {this.setState({isVisible:true}); this.props.onClosePressed()}}>
              <Icon size={24} name='close-circle' type='material-community'
                color={(this.props.theme==='light')?COLORS_LIGHT_THEME.RED:COLORS_DARK_THEME.RED}/>          
            </TouchableOpacity>
        </View>
        
        <TextInput 
          numberOfLines={5}
          multiline={true}
          maxLength={2048}
          textAlignVertical="top"
          value={this.props.obj.content}
          onChangeText={(value)=>{this.props.onContentChange(value, this.props.index)}}
          textBreakStrategy="highQuality"
          placeholderTextColor={(this.props.theme==='light')?COLORS_LIGHT_THEME.LESSER_DARK:COLORS_DARK_THEME.LESSER_DARK}
          style={{...styles.ContentStyle, color:(this.props.theme==='light')?COLORS_LIGHT_THEME.DARK:COLORS_DARK_THEME.DARK}} 
          placeholder={"Enter something..."}/>
        <Text style={{bottom:10, right:10, position:'absolute', fontFamily:FONTS.PRODUCT_SANS, fontSize:10,
          color:(this.props.theme==='light')?COLORS_LIGHT_THEME.LESS_LIGHT:COLORS_DARK_THEME.LIGHT_GRAY}}>
          Card {this.props.index}
        </Text>
      </SView>
    );
  }
}

const styles = StyleSheet.create({
  CardViewStyle:{
    shadowColor:'#222222',shadowOpacity:0.23,
    shadowOffset:{width:0,height:7},shadowRadius:7,
    marginHorizontal:25,
    marginVertical:15,
    borderRadius:18,
  },
  SubHeadingStyle:{
    fontFamily:FONTS.MERRIWEATHER,
    fontSize:20,
    marginBottom:5,
    paddingBottom:3,
  },
  ContentStyle:{
    textAlign:'justify',
    fontFamily:FONTS.MERRIWEATHER,
    fontSize:16,
    marginHorizontal:10,marginBottom:5
  }
})