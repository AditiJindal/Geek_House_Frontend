import React, {Component} from 'react';
import {Text, View, StyleSheet} from 'react-native';
import {logEvent} from '../actions/ChatAction';
import {COLORS_LIGHT_THEME, LOG_EVENT} from '../Constants';
import {
  AdIconView,
  MediaView,
  AdChoicesView,
  TriggerableView,
  withNativeAd,
} from 'react-native-fbads';

class NativeAdsComponent extends Component {
  state = {size: 150};

  componentDidMount() {
    if (this.props.size) {
      this.setState({size: this.props.size});
    }
  }

  render() {
    const {COLORS} = this.props;
    return (
      <View
        style={{
          ...styles.TileViewStyle,
          height: this.state.size,
          width: this.state.size,
          backgroundColor:
            this.props.theme === 'light' ? COLORS.LIGHT : COLORS.LESS_LIGHT,
        }}
        renderToHardwareTextureAndroid>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}>
          <AdIconView style={{height: 22, width: 22}} />
          <AdChoicesView style={{height: 18, width: 18, marginRight: 5}} />
        </View>
        <MediaView style={{height: this.state.size / 1.3, width: null}} />

        <View
          style={{
            justifyContent: 'space-between',
            flexDirection: 'row',
            alignItems: 'center',
            margin: 3,
            position: 'absolute',
            bottom: 0,
            alignSelf: 'center',
            right: 0,
            left: 0,
          }}>
          <View style={{marginRight: 2}}>
            <Text style={{fontSize: 7, color: COLORS.DARK}}>
              {`  ${this.props.nativeAd.advertiserName}`}
            </Text>
            <Text style={{fontSize: 6, color: COLORS.GRAY}}>
              {`  ${this.props.nativeAd.sponsoredTranslation}`}
            </Text>
          </View>
          <TriggerableView
            onPress={() => {
              logEvent(LOG_EVENT.AD_CLICKED);
            }}
            style={{
              paddingHorizontal: 4,
              paddingVertical: 3,
              borderRadius: 7,
              elevation: 3,
              backgroundColor: 'rgb(66,134,244)',
              alignSelf: 'flex-start',
            }}>
            <Text style={{fontSize: 10, color: COLORS_LIGHT_THEME.LIGHT}}>
              {this.props.nativeAd.callToActionText}
            </Text>
          </TriggerableView>
        </View>
      </View>
    );
  }
}

export default __DEV__ ? null : withNativeAd(NativeAdsComponent);

const styles = StyleSheet.create({
  TileViewStyle: {
    elevation: 4,
    borderRadius: 10,
    overflow: 'hidden',
  },
});
