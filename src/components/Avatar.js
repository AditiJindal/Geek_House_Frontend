import React from 'react';
import {TouchableOpacity, Dimensions, View} from 'react-native';
import {connect} from 'react-redux';
import Image from 'react-native-fast-image';
import {Loading, ImageViewer} from './index';

const screenWidth = Dimensions.get('screen').width;

class Avatar extends React.Component {
  state = {isVisible: false};

  render() {
    const {size, COLORS, uri, onPress, loading, ring_color} = this.props;

    if (loading) {
      return (
        <View
          style={{
            height: size,
            width: size,
            justifyContent: 'center',
            alignItems: 'center',
          }}>
          <Loading white={COLORS.THEME !== 'light'} size={size / 2} />
        </View>
      );
    }
    return (
      <>
        <ImageViewer
          isVisible={this.state.isVisible}
          onClose={() => this.setState({isVisible: false})}
          COLORS={COLORS}
          imageWidth={screenWidth * 0.92}
          imageHeight={screenWidth * 0.92}
          source={{uri}}
        />
        <TouchableOpacity
          style={{
            backgroundColor: COLORS.LIGHT,
            borderRadius: size / 2,
            elevation: 5,
            borderWidth: ring_color ? 2 : 0,
            borderColor: ring_color,
            height: size,
            width: size,
            overflow: 'hidden',
          }}
          activeOpacity={1}
          onPress={() => {
            if (onPress) {
              onPress();
            } else {
              this.setState({isVisible: true});
            }
          }}>
          <Image source={{uri}} style={{flex: 1}} />
        </TouchableOpacity>
      </>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    COLORS: state.chat.COLORS,
  };
};

export default connect(mapStateToProps, {})(Avatar);
