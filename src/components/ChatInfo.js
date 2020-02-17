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



class ChatInfo extends Component {

  renderChatPeopleComponent(data, index){
    return (
      <>
      {(index)?<View style={{width:"90%", height:0.7, backgroundColor:COLORS.LIGHT_GRAY,marginBottom:10, marginTop:5, alignSelf:'center'}}/>:null}
      <View style={{flex:1, flexDirection:'row', alignItems:'center', justifyContent:'space-between',
        paddingHorizontal:15}}>
      
        <View style={{flexDirection:'row', alignItems:'center'}}>
          <View style={{height:48, width:48, borderRadius:24, overflow:'hidden', elevation:7}}>
            <Image source={{uri:imageUrlCorrector(data.image_url, this.props.image_adder)}} style={{flex:1}}/>
          </View>
          <Text style={{fontFamily:FONTS.RALEWAY, color:COLORS.DARK, fontSize:20, marginLeft:10}}>
            {data.name}
          </Text>
        </View>
  
        {(data.isAdmin)?
          (
            <View style={{paddingVertical:5,paddingHorizontal:8, borderWidth:1.5, borderColor:COLORS.GREEN, borderRadius:8}}>
              <Text style={{fontFamily:FONTS.PRODUCT_SANS_BOLD, fontSize:10, color:COLORS.GREEN}}>
                ADMIN
              </Text>
            </View>
          )
          :null
        }
  
      </View>
      </>
    )
  }

  renderChatPeople(group_participants, image_adder){
    console.log("THIS : ", group_participants)
    if (!group_participants){return null}
    return (
      <View>
        <Text style={{fontFamily:FONTS.PRODUCT_SANS, color:COLORS.LESS_DARK, fontSize:18, margin:10}}>
          Participants:
        </Text>
        {
          group_participants.users.map((user, index)=>this.renderChatPeopleComponent(user, index))
        }
      </View>
    )
  }

  render(){
    const {COLORS, other_user_data, image_adder, isLoading, chat_group_participants} = this.props;
    group_participants = chat_group_participants[other_user_data._id]
    return (
      <Overlay isVisible={this.props.isVisible}
        borderRadius={20}
        onBackdropPress={this.props.onBackdropPress}
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
              {this.renderChatPeople(group_participants, image_adder)}
              <View style={{height:100, width:1}}/>
            </ScrollView>
          )
        }
      </Overlay>
    )
  }
}

export default ChatInfo;

const styles = StyleSheet.create({
  NameText: {
    fontFamily: FONTS.PRODUCT_SANS_BOLD,
    fontSize:24,
    margin:10
  }
})