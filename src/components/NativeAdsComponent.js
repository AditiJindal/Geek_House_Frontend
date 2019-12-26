import React, {Component} from 'react';
import {Text, View} from 'react-native';
// import * as FacebookAds from 'expo-ads-facebook';
import {logEvent} from '../actions/ChatAction';
import { COLORS_LIGHT_THEME, COLORS_DARK_THEME, LOG_EVENT } from '../Constants';
import {
  AdIconView,
  MediaView,
  AdChoicesView,
  TriggerableView, 
  withNativeAd
} from 'react-native-fbads';
import SView from 'react-native-simple-shadow-view'



class NativeAdsComponent extends Component {
  render() {
    return (
      <SView style={{
        shadowColor:'#202020',shadowOpacity:0.25,shadowOffset:{width:0,height:8},shadowRadius:6,
        backgroundColor:(this.props.theme==='light')?COLORS_LIGHT_THEME.LIGHT:COLORS_DARK_THEME.LESS_LIGHT,
        borderRadius:20, margin:15, padding:10}}>
        <View style={{flexDirection:'row', justifyContent:'space-between', paddingHorizontal:5, paddingVertical:3}}>
          <View style={{flexDirection:'row'}}>
            <AdIconView style={{height:32, width:32}}/>
            <View>
              <Text style={{fontSize:12, color:(this.props.theme==='light')?COLORS_LIGHT_THEME.DARK:COLORS_DARK_THEME.DARK }}>
                {`  ${this.props.nativeAd.advertiserName}`}
              </Text>
              <Text style={{fontSize:10, color:(this.props.theme==='light')?COLORS_LIGHT_THEME.GRAY:COLORS_DARK_THEME.GRAY}}>
                {`  ${this.props.nativeAd.sponsoredTranslation}`}
              </Text>
            </View>
          </View>
          <AdChoicesView/>

        </View>
        <MediaView style={{height:232, width:null}}/>
        <View style={{justifyContent:'space-between', padding:5, flexDirection:'row'}}>
          <View style={{flex:1}}>
            <Text style={{fontSize:10, color:(this.props.theme==='light')?COLORS_LIGHT_THEME.GRAY:COLORS_DARK_THEME.GRAY}}>
              {`${this.props.nativeAd.socialContext}`}
            </Text>
            <Text style={{fontSize:11, flexWrap:'wrap',
              color:(this.props.theme==='light')?COLORS_LIGHT_THEME.DARK:COLORS_DARK_THEME.DARK}}>
              {`${this.props.nativeAd.bodyText}`}
            </Text>
          </View>
          <TriggerableView onPress={()=>{logEvent(LOG_EVENT.AD_CLICKED)}}
            style={{paddingHorizontal:15, paddingVertical:10, borderRadius:8,elevation:5,
            backgroundColor:'rgb(66,134,244)',alignSelf:'flex-start'}}>
            <Text style={{fontSize:16,color:COLORS_LIGHT_THEME.LIGHT}}>
              {this.props.nativeAd.callToActionText}
            </Text>
          </TriggerableView>
        </View>
      </SView>
    );
  }
}

export default withNativeAd(NativeAdsComponent)
