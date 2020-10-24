import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StatusBar,
  StyleSheet,
  ScrollView,
  Linking,
  BackHandler,
} from 'react-native';
import {connect} from 'react-redux';
import Icon from 'react-native-vector-icons/Feather';
import changeNavigationBarColor from 'react-native-navigation-bar-color';
import SView from 'react-native-simple-shadow-view';

import {Loading} from '../components';
import {getPolicy} from '../actions/LoginAction';
import {FONTS} from '../Constants';

class Policy extends React.PureComponent {
  componentDidMount() {
    if (!this.props.policy) {
      this.props.getPolicy();
    }

    const {navBar} = this.props.route.params;
    BackHandler.addEventListener('hardwareBackPress', () => {
      changeNavigationBarColor(navBar, false);
    });
  }

  componentWillUnmount() {
    BackHandler.removeEventListener('hardwareBackPress');
  }

  renderHeader() {
    const {COLORS} = this.props;
    return (
      <View
        key={'header'}
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
          onPress={() => {
            changeNavigationBarColor(this.props.route.params.navBar, false);
            this.props.navigation.goBack();
          }}
          style={{justifyContent: 'center', alignItems: 'center', padding: 3}}>
          <Icon
            name="arrow-left"
            size={26}
            style={{marginVertical: 5, marginRight: 15}}
            color={COLORS.LESS_DARK}
          />
        </TouchableOpacity>

        <Text style={{...styles.HeadingTextStyling, color: COLORS.LESS_DARK}}>
          T&C and Policies
        </Text>
      </View>
    );
  }

  renderCard(item, index) {
    const {COLORS} = this.props;
    return (
      <SView
        key={index.toString()}
        style={{
          borderRadius: 10,
          padding: 5,
          marginVertical: 5,
          marginHorizontal: 15,
          shadowColor: '#202020',
          shadowOpacity: 0.25,
          shadowOffset: {width: 0, height: 8},
          shadowRadius: 6,
          backgroundColor:
            this.props.theme === 'light' ? COLORS.LIGHT : COLORS.LESS_LIGHT,
          paddingHorizontal: 10,
          marginBottom: 10,
        }}>
        <View>
          <Text
            style={{...styles.SubheadingTextStyle, color: COLORS.LESSER_DARK}}>
            {item.heading}
          </Text>
        </View>
        <Text style={{...styles.TextStyling, color: COLORS.LESSER_DARK}}>
          {item.text}
        </Text>
      </SView>
    );
  }

  renderPolicyCards() {
    return this.props.policy.cards.map((item, index) =>
      this.renderCard(item, index),
    );
  }

  renderLinks() {
    const {COLORS} = this.props;
    if (this.props.policy.links.length === 0) {
      return null;
    }
    return (
      <SView
        style={{
          borderRadius: 10,
          padding: 5,
          marginVertical: 5,
          marginHorizontal: 15,
          shadowColor: '#202020',
          shadowOpacity: 0.25,
          shadowOffset: {width: 0, height: 8},
          shadowRadius: 6,
          backgroundColor:
            this.props.theme === 'light' ? COLORS.LIGHT : COLORS.LESS_LIGHT,
          paddingHorizontal: 10,
          marginBottom: 10,
        }}>
        <Text
          style={{...styles.SubheadingTextStyle, color: COLORS.LESSER_DARK}}>
          Other Links
        </Text>
        {this.props.policy.links.map((item, index) => {
          return (
            <View
              style={{flexDirection: 'row', alignItems: 'flex-end'}}
              key={index.toString()}>
              <Text
                style={{
                  ...styles.TextStyling,
                  color: COLORS.LESS_DARK,
                  fontSize: 16,
                }}>
                {`${index + 1}) `}
              </Text>
              <TouchableOpacity
                onPress={() => {
                  Linking.openURL(item.link);
                }}>
                <Text
                  style={{
                    ...styles.TextStyling,
                    color: COLORS.DARK_BLUE,
                    textDecorationLine: 'underline',
                    fontSize: 16,
                  }}>
                  {item.text}
                </Text>
              </TouchableOpacity>
            </View>
          );
        })}
      </SView>
    );
  }

  renderPolicy() {
    return (
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          paddingTop: 10,
          paddingHorizontal: 10,
          paddingBottom: 20,
        }}>
        {this.renderHeader()}
        {this.renderPolicyCards()}
        {this.renderLinks()}
      </ScrollView>
    );
  }

  render() {
    const {COLORS} = this.props;
    return (
      <View style={{flex: 1, backgroundColor: COLORS.LIGHT}}>
        <StatusBar
          barStyle={
            this.props.theme === 'light' ? 'dark-content' : 'light-content'
          }
          backgroundColor={COLORS.LIGHT}
        />
        {changeNavigationBarColor(COLORS.LIGHT, this.props.theme === 'light')}
        {this.props.policyLoading ? (
          <View
            style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
            <Loading size={128} white={this.props.theme !== 'light'} />
          </View>
        ) : (
          this.renderPolicy()
        )}
      </View>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    policy: state.login.policy,
    policyLoading: state.login.policyLoading,

    theme: state.chat.theme,
    COLORS: state.chat.COLORS,
  };
};

export default connect(mapStateToProps, {getPolicy})(Policy);

const styles = StyleSheet.create({
  HeadingTextStyling: {
    fontSize: 24,
    fontFamily: FONTS.GOTHAM_BLACK,
  },
  SubheadingTextStyle: {
    fontFamily: FONTS.PRODUCT_SANS_BOLD,
    fontSize: 22,
    marginBottom: 10,
  },
  TextStyling: {
    fontFamily: FONTS.PRODUCT_SANS,
    fontSize: 14,
    marginVertical: 2,
    textAlign: 'justify',
  },
});
