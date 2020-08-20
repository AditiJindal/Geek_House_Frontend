import React from 'react';
import {TouchableOpacity, Dimensions, View} from 'react-native';
import {connect} from 'react-redux';
import {getLevel} from '../extraUtilities';
import Image from 'react-native-fast-image';
import ImageViewer from './ImageViewer';
import Loading from '../components/Loading';

const screenWidth = Dimensions.get('screen').width;

class Avatar extends React.Component {
  state = {isVisible: false};

  render() {
    const {size, COLORS, userXP, uri, onPress, loading} = this.props;
    const {level} = getLevel(userXP);
    let ringColor = null;
    if (level >= 5) {
      ringColor = '#C0C0C0';
    }
    if (level >= 10) {
      ringColor = '#FFD700';
    }

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
            borderWidth: ringColor ? 2 : 0,
            borderColor: ringColor,
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

const mapStateToProps = state => {
  return {
    userXP: state.home.welcomeData.userXP,

    COLORS: state.chat.COLORS,
  };
};

export default connect(mapStateToProps, {})(Avatar);
