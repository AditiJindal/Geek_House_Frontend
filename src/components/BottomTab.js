import React, {Component} from 'react';
import {connect} from 'react-redux';
import {View, StyleSheet, Text, TouchableOpacity} from 'react-native';
import {Icon} from 'react-native-elements';
import LinearGradient from 'react-native-linear-gradient';
import SView from 'react-native-simple-shadow-view';
import {Typing} from './index';
import {
  ICON_SIZE,
  SELECTED_ICON_SIZE,
  FONTS,
  COLORS_LIGHT_THEME,
  SCREENS,
} from '../Constants';

const COLOR_PALETE = [
  ['#FF585D', '#cc2b5e'],
  ['#f7b733', '#fc4a1a'],
  ['#a8e063', '#56ab2f'],
  ['#00cdac', '#02aab0'],
];

class BottomTab extends Component {
  state = {
    selectedIcon: 0,
  };

  renderChatBadge() {
    const {COLORS} = this.props;
    if (this.props.total_typing) {
      return (
        <View
          style={{
            ...styles.UnreadMessagesBadgeStyle,
            backgroundColor: COLORS.YELLOW,
          }}
        />
      );
    } else if (this.props.total_unread_messages !== 0) {
      return (
        <View
          style={{
            ...styles.UnreadMessagesBadgeStyle,
            backgroundColor: COLORS.URM_COLOR,
          }}>
          <Text
            style={{
              ...styles.UnreadMessagesTextStyle,
              color: COLORS_LIGHT_THEME.LIGHT,
            }}>
            {this.props.total_unread_messages}
          </Text>
        </View>
      );
    } else {
      return null;
    }
  }

  renderChatButton(iconName) {
    const {COLORS} = this.props;

    return (
      <View>
        <Icon
          name={iconName}
          size={ICON_SIZE + 4}
          type={'feather'}
          color={this.props.theme === 'light' ? COLORS.LESS_DARK : COLORS.DARK}
        />
        <View style={{position: 'absolute', bottom: 6, right: 4.5}}>
          {this.props.total_typing !== 0 ? (
            <Typing size={12} speed={1} theme={this.props.theme} />
          ) : (
            <Typing size={12} speed={0} theme={this.props.theme} />
          )}
        </View>
        {this.renderChatBadge()}
      </View>
    );
  }

  renderIcon(iconName, index, selectedIcon, screen) {
    const {COLORS} = this.props;

    if (index !== selectedIcon) {
      return (
        <TouchableOpacity
          onPress={() => {
            // NOTE: SOLVE icon tapping lag issue by making a redux state for bottombar
            // and making it independent from the scene
            this.setState({selectedIcon: index});
            this.props.navigation.navigate(screen);
          }}
          style={{
            height: 40,
            width: SELECTED_ICON_SIZE + 22,
            justifyContent: 'center',
            alignItems: 'center',
          }}>
          {index !== 3 ? (
            <Icon
              name={iconName}
              type={'feather'}
              size={ICON_SIZE}
              color={
                this.props.theme === 'light' ? COLORS.LESS_DARK : COLORS.DARK
              }
            />
          ) : (
            this.renderChatButton(iconName)
          )}
        </TouchableOpacity>
      );
    } else {
      return (
        <LinearGradient
          style={styles.SelectedIconView}
          colors={COLOR_PALETE[index]}>
          <Icon
            name={iconName}
            type={'feather'}
            size={index !== 3 ? SELECTED_ICON_SIZE : SELECTED_ICON_SIZE + 4}
            color={COLORS_LIGHT_THEME.LIGHT}
          />
        </LinearGradient>
      );
    }
  }

  render() {
    const {COLORS} = this.props;
    const selectedIcon = this.props.state.index;
    if (this.props.first_login) {
      return null;
    }

    return (
      <SView
        style={{
          ...styles.BottomTabStyle,
          shadowColor: '#202020',
          backgroundColor:
            this.props.theme === 'light' ? COLORS.LIGHT : COLORS.LESS_LIGHT,
        }}>
        {this.renderIcon('home', 0, selectedIcon, SCREENS.Home)}
        {this.renderIcon('search', 1, selectedIcon, SCREENS.Search)}
        {this.renderIcon('edit-2', 2, selectedIcon, SCREENS.Write)}
        {this.renderIcon('message-circle', 3, selectedIcon, SCREENS.Chat)}
      </SView>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    first_login: state.chat.first_login,
    total_typing: state.chat.total_typing,
    total_unread_messages: state.chat.total_unread_messages,
    theme: state.chat.theme,
    COLORS: state.chat.COLORS,
  };
};

export default connect(mapStateToProps, {})(BottomTab);

const styles = StyleSheet.create({
  BottomTabStyle: {
    height: 40,
    bottom: 10,
    position: 'absolute',
    width: '92%',
    shadowOpacity: 0.3,
    shadowRadius: 2.5,
    shadowOffset: {height: 3},
    justifyContent: 'space-around',
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    borderRadius: 10,
  },
  SelectedIconView: {
    borderRadius: 100,
    height: SELECTED_ICON_SIZE + 22,
    width: SELECTED_ICON_SIZE + 22,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
  },
  UnreadMessagesBadgeStyle: {
    elevation: 3,
    bottom: -2,
    right: -4,
    borderRadius: 20,
    minHeight: 10,
    minWidth: 10,
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  UnreadMessagesTextStyle: {
    fontFamily: FONTS.PRODUCT_SANS,
    fontSize: 6,
  },
});
