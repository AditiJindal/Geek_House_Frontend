import React from 'react';
import {View} from 'react-native';
import { BannerView } from 'react-native-fbads';

const BannerAd = (props) => {
  return (
    <View style={{elevation:7, overflow:'hidden', borderRadius:8}}>
      <BannerView
        placementId="2458153354447665_2496866597243007"
        type="standard"
        // onPress={() => console.log('click')}
        // onLoad={() => console.log('loaded')}
        // onError={err => console.log('error', err)}
      />
    </View>
  );
}

export default BannerAd