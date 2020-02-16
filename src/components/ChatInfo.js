import React, {Component} from 'react';
import {View, Text, StatusBar, Dimensions, ScrollView, StyleSheet} from 'react-native';
import {Overlay} from 'react-native-elements';
import Image from 'react-native-fast-image';
import {FONTS} from '../Constants';
import Loading from '../components/Loading';

const overlayWidth = Dimensions.get('screen').width*0.8

const imageUrlCorrector = (image_url, image_adder) => {
  if (image_url.substring(0,4) !== 'http'){
    image_url = image_adder + image_url
  }
  return image_url
}

const ChatInfo = (props) => {
  const {COLORS, other_user_data, image_adder, isLoading} = props;
  return (
    <Overlay isVisible={props.isVisible}
      borderRadius={20}
      onBackdropPress={props.onBackdropPress}
      overlayStyle={{marginBottom:25, elevation:0, padding:0, 
        overflow:'hidden', width:overlayWidth, maxHeight:"90%"}}
      containerStyle={{padding:0}}
      animationType='none'
      overlayBackgroundColor={(COLORS.THEME==='light')?COLORS.LIGHT:COLORS.LESS_LIGHT}>
      <StatusBar 
        barStyle={(COLORS.THEME==='light')?'dark-content':'light-content'}
        backgroundColor={COLORS.OVERLAY_COLOR}/>
      {
        (isLoading)?
        <View style={{flex:1, justifyContent:'center', alignItems:'center'}}>
          <Loading white={COLORS.THEME!=='light'} size={108}/>
        </View>:
        (
          <ScrollView>
            <Image
              style={{height:overlayWidth, width:overlayWidth}}
              source={{uri: imageUrlCorrector(other_user_data.image_url, image_adder)}}
            />
            <Text style={{...styles.NameText, color: COLORS.DARK}}>
              {other_user_data.name}
            </Text>
          </ScrollView>
        )
      }
    </Overlay>
  )
}

export default ChatInfo;

const styles = StyleSheet.create({
  NameText: {
    fontFamily: FONTS.PRODUCT_SANS_BOLD,
    fontSize:24,
    margin:10
  }
})