import React from 'react';
import {View} from 'react-native';
import Modal from 'react-native-modal';

export default Overlay = (props) => {
  const {onBackdropPress, isVisible, overlayStyle, children} = props;
  return (
    <Modal
      onRequestClose={onBackdropPress}
      onBackdropPress={onBackdropPress}
      onBackButtonPress={onBackdropPress}
      isVisible={isVisible}
      animationInTiming={400}
      animationOutTiming={400}
      avoidKeyboard={true}
      useNativeDriver={true}
      style={{margin: 0}}
      hideModalContentWhileAnimating={true}
      transparent={true}>
      <View style={{...overlayStyle}}>{children}</View>
    </Modal>
  );
};
