import PropTypes from 'prop-types';
import React, {PureComponent} from 'react';
import {StyleSheet, Text, View, ViewPropTypes} from 'react-native';
import moment from 'moment';
import Color from './Color';
import {isSameDay} from './utils';
import {DATE_FORMAT} from './Constant';
import {FONTS, COLORS_LIGHT_THEME} from '../../Constants';

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 5,
    marginBottom: 10,
  },
  text: {
    backgroundColor: Color.backgroundTransparent,
    color: Color.defaultColor,
    fontSize: 18,
    fontWeight: '600',
  },
});
export default class Day extends PureComponent {
  render() {
    const {COLORS} = this.props;
    const {
      dateFormat,
      currentMessage,
      previousMessage,
      nextMessage,
      containerStyle,
      wrapperStyle,
      textStyle,
      inverted,
    } = this.props;
    if (
      currentMessage &&
      !isSameDay(currentMessage, inverted ? previousMessage : nextMessage)
    ) {
      return (
        <View style={[styles.container, containerStyle]}>
          <View
            style={{
              backgroundColor: COLORS.LIGHT + '86',
              borderRadius: 10,
              paddingVertical: 3,
              paddingHorizontal: 7,
            }}>
            <Text
              style={[
                styles.text,
                textStyle,
                {
                  fontFamily: FONTS.PRODUCT_SANS_BOLD,
                  color: COLORS_LIGHT_THEME.LIGHT,
                  fontSize: 20,
                },
              ]}>
              {moment(currentMessage.createdAt)
                .locale(this.context.getLocale())
                .format(dateFormat)
                .toUpperCase()}
            </Text>
          </View>
        </View>
      );
    }
    return null;
  }
}
Day.contextTypes = {
  getLocale: PropTypes.func,
};
Day.defaultProps = {
  currentMessage: {
    createdAt: null,
  },
  previousMessage: {},
  nextMessage: {},
  containerStyle: {},
  wrapperStyle: {},
  textStyle: {},
  dateFormat: DATE_FORMAT,
};
Day.propTypes = {
  currentMessage: PropTypes.object,
  previousMessage: PropTypes.object,
  nextMessage: PropTypes.object,
  inverted: PropTypes.bool,
  containerStyle: ViewPropTypes.style,
  wrapperStyle: ViewPropTypes.style,
  textStyle: PropTypes.any,
  dateFormat: PropTypes.string,
};
//# sourceMappingURL=Day.js.map
