import React from 'react';
import { View}from 'react-native';
import LottieView from 'lottie-react-native'
import data_light from '../../assets/animations/typing_light.json'
import data_dark from '../../assets/animations/typing_dark.json'

let new_data_light = data_light;
new_data_light.fr =40
let new_data_dark = data_dark;
new_data_dark.fr =40

export default Typing = (props) => {
  return(
    <View>
      <LottieView
        autoPlay loop
        style={{width: props.size,height: props.size}}
        source = {(props.theme==='light')?new_data_light:new_data_dark}
        speed={props.speed}
      />
    </View>
  );
}