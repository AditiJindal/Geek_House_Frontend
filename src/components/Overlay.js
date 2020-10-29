import React from 'react';
import {View} from 'react-native';
import Modal from 'react-native-modal';

export default Overlay = (props) => {
  const {
    onBackdropPress,
    isVisible,
    overlayStyle,
    onModalShow,
    onModalHide,
    children,
  } = props;
  return (
    <Modal
      onRequestClose={onBackdropPress}
      onBackdropPress={onBackdropPress}
      onBackButtonPress={onBackdropPress}
      onModalWillShow={onModalShow}
      onModalWillHide={onModalHide}
      isVisible={isVisible}
      animationInTiming={500}
      animationOutTiming={500}
      avoidKeyboard={true}
      useNativeDriver={true}
      style={{margin: 0}}
      hideModalContentWhileAnimating={true}
      transparent={true}>
      <View style={{...overlayStyle}}>{children}</View>
    </Modal>
  );
};
