import React, {Component} from 'react';
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import Image from 'react-native-fast-image';

import {FONTS, ERROR_BUTTONS} from '../Constants';
import {Overlay} from '../components';
// import console = require('console');

export default class CustomAlert extends Component {
  constructor() {
    super();
  }

  renderButton(obj) {
    const {COLORS} = this.props;
    if (obj.label === ERROR_BUTTONS.TICK) {
      return (
        <TouchableOpacity
          onPress={this.props.onFirstButtonPress.bind(this)}
          activeOpacity={1}>
          <View
            style={{
              height: 54,
              width: 54,
              borderRadius: 27,
              borderWidth: 2,
              elevation: 2,
              backgroundColor:
                this.props.theme === 'light' ? COLORS.LIGHT : COLORS.LESS_LIGHT,
              justifyContent: 'center',
              alignItems: 'center',
              borderColor: COLORS.GREEN,
            }}>
            <Image
              source={require('../../assets/icons/tick.png')}
              style={{height: 22, width: 22}}
            />
          </View>
        </TouchableOpacity>
      );
    } else if (obj.label === ERROR_BUTTONS.CROSS) {
      return (
        <TouchableOpacity
          onPress={this.props.onSecondButtonPress.bind(this)}
          activeOpacity={1}>
          <View
            style={{
              height: 54,
              width: 54,
              borderRadius: 27,
              borderWidth: 2,
              elevation: 2,
              backgroundColor:
                this.props.theme === 'light' ? COLORS.LIGHT : COLORS.LESS_LIGHT,
              justifyContent: 'center',
              alignItems: 'center',
              borderColor: COLORS.RED,
            }}>
            <Image
              source={require('../../assets/icons/cross.png')}
              style={{height: 20, width: 20}}
            />
          </View>
        </TouchableOpacity>
      );
    } else {
      return (
        <TouchableOpacity
          onPress={this.props.onThirdButtonPress.bind(this)}
          activeOpacity={1}>
          <View
            style={{
              justifyContent: 'center',
              borderColor: obj.color,
              borderWidth: 2,
              elevation: 2,
              backgroundColor:
                this.props.theme === 'light' ? COLORS.LIGHT : COLORS.LESS_LIGHT,
              alignItems: 'center',
              borderRadius: 8,
              paddingVertical: 12,
              paddingHorizontal: 10,
            }}>
            <Text style={[styles.ButtonLabelStyle, {color: obj.color}]}>
              {obj.label}
            </Text>
          </View>
        </TouchableOpacity>
      );
    }
  }

  renderButtonsFromList() {
    return (
      <View style={{justifyContent: 'space-between', flexDirection: 'row'}}>
        {this.props.message.type.map((obj, key) => {
          return <View key={key}>{this.renderButton(obj)}</View>;
        })}
      </View>
    );
  }

  render() {
    const {COLORS} = this.props;
    return (
      <View>
        <Overlay
          isVisible={this.props.isVisible}
          borderRadius={15}
          onBackdropPress={this.props.onBackdropPress.bind(this)}
          overlayStyle={{margin: 25, elevation: 0}}
          animationType="none"
          overlayBackgroundColor={
            this.props.theme === 'light' ? COLORS.LIGHT : COLORS.LESS_LIGHT
          }>
          <View
            style={{
              padding: 10,
              backgroundColor:
                this.props.theme === 'light' ? COLORS.LIGHT : COLORS.LESS_LIGHT,
            }}>
            <Text style={{...styles.TitleStyle, color: COLORS.DARK}}>
              {this.props.message.title}
            </Text>
            <Text
              style={{
                ...styles.ContentStyle,
                color:
                  this.props.theme === 'light'
                    ? COLORS.LIGHT_GRAY
                    : COLORS.LESSER_DARK,
              }}>
              {this.props.message.content}
            </Text>
            <View style={{padding: 10}}>{this.renderButtonsFromList()}</View>
          </View>
        </Overlay>
      </View>
    );
  }
}
const styles = StyleSheet.create({
  TitleStyle: {
    fontFamily: FONTS.GOTHAM_BLACK,
    fontSize: 20,
    margin: 5,
    textAlign: 'center',
  },
  ContentStyle: {
    margin: 5,
    flexWrap: 'wrap',
    fontFamily: FONTS.LATO,
    fontSize: 18,
    textAlign: 'justify',
  },
  ButtonLabelStyle: {
    fontFamily: FONTS.PRODUCT_SANS,
    fontSize: 20,
  },
});
