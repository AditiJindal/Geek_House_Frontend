import React from 'react';
import {
  Text,
  StyleSheet,
  View,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import toMaterialStyle from 'material-color-hash';
import Icon from 'react-native-vector-icons/Feather';
import TimeAgo from 'react-native-timeago';
import {FONTS, COLORS_LIGHT_THEME, MESSAGE_SPECIAL_ADDER} from '../Constants';
import SView from 'react-native-simple-shadow-view';
import Avatar from './Avatar';
import ImageViewer from './ImageViewer';
import Typing from './Typing';
import {getRingColor, imageUrlCorrector} from '../utilities';

const screenWidth = Dimensions.get('screen').width;

getInitials = (name) => {
  if (!name) {
    return null;
  }
  let initials = name.match(/\b\w/g) || [];
  initials = ((initials.shift() || '') + (initials.pop() || '')).toUpperCase();
  return initials;
};

const getBadge = (props) => {
  const {COLORS, data, typing, online} = props;
  if (typing) {
    return (
      <View
        style={{
          position: 'absolute',
          right: 0,
          top: 0,
          justifyContent: 'center',
          alignItems: 'center',
          borderColor: COLORS.LIGHT,
          borderWidth: 0.7,
          height: 12,
          width: 16,
          borderRadius: 6,
          elevation: 7,
          backgroundColor: COLORS.YELLOW,
        }}>
        <Typing size={14} />
      </View>
    );
  } else if (online && !data.isGroup) {
    return (
      <View
        style={{
          position: 'absolute',
          right: 3,
          top: 0,
          borderColor: COLORS.LIGHT,
          borderWidth: 0.7,
          backgroundColor: COLORS.GREEN,
          elevation: 7,
          height: 12,
          width: 12,
          borderRadius: 6,
        }}
      />
    );
  } else {
    return null;
  }
};

const getRecentTime = (time) => {
  const new_date = new Date(time);
  return (
    <Text
      style={{
        color: COLORS_LIGHT_THEME.THEME1,
        fontSize: 10,
        fontFamily: FONTS.PRODUCT_SANS_BOLD,
      }}>
      <TimeAgo time={Date.parse(new_date)} interval={20000} />
    </Text>
  );
};

const getRecentMessage = (message) => {
  if (
    message &&
    message.substring(0, MESSAGE_SPECIAL_ADDER.length) === MESSAGE_SPECIAL_ADDER
  ) {
    message = message.substring(MESSAGE_SPECIAL_ADDER.length);
  }

  if (message.length > 30) {
    message = message.substring(0, 28) + '...';
  }

  return message;
};

const getAppropriateAccessory = (props) => {
  const {
    COLORS,
    isSelector,
    isSelected,
    isAddedToGroup,
    unread_messages,
  } = props;

  if (!isSelector && unread_messages) {
    return (
      <View
        style={{
          ...styles.BadgeViewStyle,
          backgroundColor: COLORS.THEME === 'light' ? COLORS.RED : COLORS.GREEN,
        }}>
        <Text style={{...styles.BadgeTextStyle, color: COLORS.LIGHT}}>
          {unread_messages}
        </Text>
      </View>
    );
  }

  if (isSelector && !isAddedToGroup) {
    return isSelected ? (
      <Icon name={'check-square'} color={COLORS.GREEN} size={20} />
    ) : (
      <Icon name={'square'} color={COLORS.GRAY} size={20} />
    );
  }
  return null;
};

export default class ChatPeople extends React.Component {
  state = {imageViewerActive: false};

  render() {
    const {
      COLORS,
      isSelector,
      isSelected,
      data,
      onPress,
      recentMessage,
      recentActivity,
      isAddedToGroup,
    } = this.props;
    let IMAGE_SIZE = isSelector ? 42 : 56;

    return (
      <TouchableOpacity
        onPress={() => {
          isAddedToGroup ? null : onPress(data._id, isSelected);
        }}
        activeOpacity={0.9}
        style={{marginVertical: isSelector ? 0 : 5, marginHorizontal: 15}}>
        <ImageViewer
          isVisible={this.state.imageViewerActive}
          COLORS={COLORS}
          onClose={() => this.setState({imageViewerActive: false})}
          imageHeight={screenWidth * 0.92}
          imageWidth={screenWidth * 0.92}
          source={{uri: imageUrlCorrector(data.image_url)}}
        />
        <SView
          style={{
            ...styles.ViewStyling,
            shadowOpacity: isSelector
              ? 0
              : COLORS.THEME === 'light'
              ? 0.2
              : 0.3,
            backgroundColor: COLORS.LIGHT,
            borderRadius: isSelector ? 0 : IMAGE_SIZE / 4,
          }}>
          {data.isGroup ? (
            <View
              style={{
                height: '100%',
                width: 25,
                backgroundColor: toMaterialStyle(data.name).backgroundColor,
                position: 'absolute',
                alignSelf: 'center',
                borderBottomLeftRadius: IMAGE_SIZE / 4,
                borderTopLeftRadius: IMAGE_SIZE / 4,
              }}
            />
          ) : null}

          <View style={{marginVertical: 10}}>
            <Avatar
              size={IMAGE_SIZE}
              onPress={() => this.setState({imageViewerActive: true})}
              uri={imageUrlCorrector(data.image_url)}
              ring_color={getRingColor(data.userXP)}
            />
            {getBadge(this.props)}
          </View>

          <View
            style={{
              marginHorizontal: 10,
              justifyContent: 'center',
              alignItems: 'flex-start',
              flex: 1,
            }}>
            <Text style={{...styles.TextStyle, color: COLORS.LESS_DARK}}>
              {data.name}
            </Text>
            {isAddedToGroup ? (
              <Text
                style={{
                  color: COLORS.DARK_GRAY,
                  fontSize: 11,
                  fontFamily: FONTS.RALEWAY,
                  fontStyle: 'italic',
                }}>
                Already Added
              </Text>
            ) : null}
            {data.email ? (
              <Text
                style={{
                  ...styles.InterestStyle,
                  fontSize: 12,
                  color:
                    COLORS.THEME === 'light'
                      ? COLORS.LIGHT_GRAY
                      : COLORS.LESS_DARK,
                }}>
                {data.email}
              </Text>
            ) : null}
            {recentMessage && recentActivity ? (
              <Text
                style={{
                  ...styles.InterestStyle,
                  fontSize: 14,
                  color: COLORS.DARK_GRAY,
                }}>
                {getRecentMessage(recentMessage)}
              </Text>
            ) : null}
            {recentMessage && recentActivity
              ? getRecentTime(recentActivity)
              : null}
          </View>

          {getAppropriateAccessory(this.props)}
        </SView>
      </TouchableOpacity>
    );
  }
}

const styles = StyleSheet.create({
  ViewStyling: {
    alignItems: 'center',
    flexDirection: 'row',
    paddingHorizontal: 10,
    shadowColor: '#000000',
    shadowRadius: 6,
    shadowOffset: {height: 4},
  },
  TextStyle: {
    fontSize: 18,
    fontFamily: FONTS.PRODUCT_SANS_BOLD,
  },
  InterestStyle: {
    fontSize: 10,
    fontFamily: FONTS.PRODUCT_SANS,
  },
  BadgeTextStyle: {
    fontFamily: FONTS.PRODUCT_SANS_BOLD,
    fontSize: 12,
  },
  BadgeViewStyle: {
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 6,
    width: 28,
    height: 28,
  },
});
