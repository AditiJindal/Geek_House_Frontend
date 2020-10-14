import React, {Component} from 'react';
import {
  Text,
  StyleSheet,
  Animated,
  PanResponder,
  UIManager,
  Dimensions,
} from 'react-native';
import {FONTS} from '../Constants';
import _ from 'lodash';

const SCREEN_WIDTH = Dimensions.get('window').width;

export default class RaisedText extends Component {
  constructor() {
    super();
    const position = new Animated.ValueXY();
    const panResponder = PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (event, gesture) => {
        if (this.props.animationEnabled) {
          position.setValue({x: gesture.dx, y: gesture.dy});
        }
      },
      onPanResponderRelease: (event, gesture) => {
        if (this.props.animationEnabled) {
          this.resetPosition();
        }
      },
    });

    this.state = {
      panResponder,
      position,
      card: null,
    };
  }

  componentDidMount() {
    UIManager.setLayoutAnimationEnabledExperimental &&
      UIManager.setLayoutAnimationEnabledExperimental(true);
  }

  resetPosition() {
    Animated.timing(this.state.position, {
      toValue: {x: 0, y: 0},
      duration: 700,
      delay: 10,
    }).start();
  }

  getCardStyle() {
    const {position} = this.state;
    const rotate = position.x.interpolate({
      inputRange: [-SCREEN_WIDTH * 1.5, 0, SCREEN_WIDTH * 1.5],
      outputRange: ['-180deg', '0deg', '180deg'],
    });

    return {
      ...position.getLayout(),
      transform: [{rotate}],
    };
  }

  render() {
    const {COLORS, text} = this.props;
    return (
      <Animated.View
        style={[
          this.getCardStyle(),
          {
            ...styles.AnimatedViewStyle,
            borderColor: COLORS.LESS_DARK,
            backgroundColor:
              COLORS.THEME === 'light' ? COLORS.LIGHT : COLORS.LESS_LIGHT,
          },
        ]}
        {...this.state.panResponder.panHandlers}>
        <Text
          style={{
            ...styles.AnimatedWelcomeHeading,
            color: COLORS.LESSER_DARK,
          }}>
          {text}
        </Text>
      </Animated.View>
    );
  }
}

const styles = StyleSheet.create({
  AnimatedWelcomeHeading: {
    fontFamily: FONTS.RALEWAY_BOLD,
    fontSize: 24,
  },
  AnimatedViewStyle: {
    elevation: 4,
    margin: 10,
    padding: 10,
    marginRight: 25,
    borderRadius: 12,
    alignItems: 'center',
    width: 200,
  },
});
