import React from 'react';
import {Pressable, View} from 'react-native';

import {COLORS_LIGHT_THEME} from '../Constants';

export default Ripple = ({
  onPress,
  style,
  containerStyle,
  rippleColor,
  children,
}) => {
  return (
    <View style={[containerStyle, {overflow: 'hidden'}]}>
      <Pressable
        style={[style]}
        onPress={onPress}
        android_ripple={{color: rippleColor || COLORS_LIGHT_THEME.LIGHT_GRAY}}>
        {children}
      </Pressable>
    </View>
  );
};
