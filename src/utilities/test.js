import ASt from '@react-native-community/async-storage';

export const onTest = async () => {
  await ASt.clear();
  alert('CLEARED');
};
