import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity, FlatList} from 'react-native';
import {connect} from 'react-redux';
import SView from 'react-native-simple-shadow-view';
import Icon from 'react-native-vector-icons/Feather';

import {Ripple} from '../components';
import {FONTS, SCREENS} from '../Constants';

class Notification extends React.Component {
  renderHeader() {
    const {COLORS} = this.props;
    return (
      <View
        style={{
          borderRadius: 10,
          margin: 8,
          height: 70,
          justifyContent: 'space-between',
          marginHorizontal: 15,
          alignItems: 'center',
          flexDirection: 'row',
        }}>
        <TouchableOpacity
          activeOpacity={1}
          onPress={() => this.props.navigation.goBack()}
          style={{justifyContent: 'center', alignItems: 'center', padding: 3}}>
          <Icon
            name="arrow-left"
            size={26}
            type={'feather'}
            style={{marginVertical: 5, marginRight: 15}}
            color={COLORS.LESS_DARK}
          />
        </TouchableOpacity>

        <Text style={{...styles.HeadingTextStyling, color: COLORS.LESS_DARK}}>
          notifications
        </Text>
      </View>
    );
  }

  getCTAText(type) {
    let text = '';
    switch (type) {
      case 'article':
        text = 'Tap to view the article';
        break;
      default:
        break;
    }
    return text;
  }

  onPressNotification(item) {
    switch (item.type) {
      case 'article':
        this.props.navigation.navigate(SCREENS.NotificationArticle, {
          article_id: item.data.article_id,
        });
        return;
      default:
        return;
    }
  }

  renderNotification({item}) {
    const {COLORS} = this.props;
    return (
      <SView
        style={{...styles.NotificationView, backgroundColor: COLORS.LIGHT}}>
        <Ripple
          style={{padding: 10}}
          onPress={() => this.onPressNotification(item)}
          rippleContainerBorderRadius={7}>
          <Text style={{...styles.TitleStyle, color: COLORS.DARK}}>
            {item.title}
          </Text>
          <Text style={{...styles.MessageStyle, color: COLORS.LESS_DARK}}>
            {item.message}
          </Text>
          <Text style={{...styles.CTAStyle, color: COLORS.GRAY}}>
            {this.getCTAText(item.type)}
          </Text>
        </Ripple>
      </SView>
    );
  }

  renderNotifications() {
    const {notifications} = this.props;
    return (
      <FlatList
        data={notifications}
        keyExtractor={(_, index) => index.toString()}
        renderItem={this.renderNotification.bind(this)}
        contentContainerStyle={{flexGrow: 1}}
        ListHeaderComponent={this.renderHeader()}
        ListEmptyComponent={
          <View
            style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
            <Text style={{...styles.NoNotifications, color: COLORS.DARK}}>
              No new notifications
            </Text>
            <View style={{height: 60}} />
          </View>
        }
      />
    );
  }

  render() {
    const {COLORS} = this.props;
    return (
      <View style={{flex: 1, backgroundColor: COLORS.LIGHT}}>
        {this.renderNotifications()}
      </View>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    notifications: state.home.welcomeData.notifications,

    COLORS: state.chat.COLORS,
  };
};

export default connect(mapStateToProps, {})(Notification);

const styles = StyleSheet.create({
  HeadingTextStyling: {
    fontSize: 24,
    fontFamily: FONTS.GOTHAM_BLACK,
  },
  NotificationView: {
    margin: 10,
    borderRadius: 7,
    shadowColor: '#161616',
    shadowOpacity: 0.22,
    shadowOffset: {width: 0, height: 5},
    shadowRadius: 5,
  },
  TitleStyle: {
    fontFamily: FONTS.PRODUCT_SANS_BOLD,
    fontSize: 18,
  },
  MessageStyle: {
    fontFamily: FONTS.PRODUCT_SANS,
    fontSize: 16,
  },
  CTAStyle: {
    fontFamily: FONTS.PRODUCT_SANS,
    fontSize: 10,
    marginTop: 5,
  },
  NoNotifications: {
    fontFamily: FONTS.PRODUCT_SANS_BOLD,
    fontSize: 18,
  },
});
