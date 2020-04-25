import React from 'react';
import {View} from 'react-native';
import LottieView from 'lottie-react-native';
import data from '../../assets/animations/loader.json';
import data_white from '../../assets/animations/loader_white.json';

let new_data = data;
let new_data_white = data_white;
new_data.fr = 120;
new_data_white.fr = 120;

export default Loading = props => {
  return (
    <View>
      <LottieView
        autoPlay
        loop
        style={{width: props.size, height: props.size}}
        source={props.white ? new_data_white : new_data}
        speed={1}
      />
    </View>
  );
};
