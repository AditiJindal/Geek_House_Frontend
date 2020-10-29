import React, {Component} from 'react';
import {Text, StyleSheet, TouchableOpacity, View} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import Image from 'react-native-fast-image';
import {
  FONTS,
  COLOR_COMBOS,
  COLORS_LIGHT_THEME,
  COLORS_DARK_THEME,
} from '../Constants';
import LinearGradient from 'react-native-linear-gradient';

const IMAGE_GRADIENT = ['rgba(100, 100, 100, 0)', 'rgba(100, 100, 100, 0.5)'];
export default class ArticleTile extends Component {
  state = {
    failColors: COLOR_COMBOS[Math.floor(Math.random() * COLOR_COMBOS.length)],
  };

  renderStarRating(rating, size = 12) {
    if (!rating) {
      return null;
    }
    return (
      <View style={{flexDirection: 'row', alignItems: 'center'}}>
        <Text style={[styles.RatingText, {fontSize: size + 1}]}>{rating}</Text>
        <Icon name="star" color={COLORS_DARK_THEME.STAR_YELLOW} size={size} />
      </View>
    );
  }

  renderImageTile() {
    const {COLORS, data, size} = this.props;
    const {topic, rating, image} = data;

    return (
      <TouchableOpacity
        activeOpacity={0.8}
        style={{
          backgroundColor: COLORS.LIGHT,
          height: size,
          width: (size * 4) / 3,
          overflow: 'hidden',
          elevation: 4,
          borderRadius: 10,
        }}
        onPress={this.props.onPress}>
        <Image style={{flex: 1}} source={{uri: image}}>
          <LinearGradient
            style={{
              flex: 1,
              justifyContent: 'space-between',
              paddingHorizontal: 10,
              paddingVertical: 7,
            }}
            colors={IMAGE_GRADIENT}
            start={{x: 1, y: 0}}
            end={{x: 1, y: 1}}>
            <Text style={styles.ImageText}>{topic}</Text>
            {this.renderStarRating(rating)}
          </LinearGradient>
        </Image>
      </TouchableOpacity>
    );
  }

  renderGradientTile() {
    const {COLORS, data, size} = this.props;
    return (
      <TouchableOpacity
        activeOpacity={0.8}
        style={{
          height: size,
          width: (size * 4) / 3,
          backgroundColor: COLORS.LIGHT,
          elevation: 4,
          borderRadius: 10,
          overflow: 'hidden',
        }}
        onPress={this.props.onPress}>
        <LinearGradient
          style={{flex: 1, justifyContent: 'space-between', padding: 10}}
          colors={this.state.failColors}
          start={{x: 1, y: 0}}
          end={{x: 1, y: 1}}>
          <Text style={styles.GradientText}>{data.topic}</Text>
          {this.renderStarRating(data.rating, 18)}
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  render() {
    const {data} = this.props;

    return data.image ? this.renderImageTile() : this.renderGradientTile();
  }
}

const styles = StyleSheet.create({
  ImageText: {
    fontFamily: FONTS.NOE_DISPLAY,
    color: COLORS_LIGHT_THEME.LIGHT,
    fontSize: 14,
  },
  GradientText: {
    fontSize: 20,
    fontFamily: FONTS.HELVETICA_NEUE,
    color: COLORS_LIGHT_THEME.LIGHT,
  },
  RatingText: {
    fontFamily: FONTS.PRODUCT_SANS,
    color: COLORS_LIGHT_THEME.LIGHT,
    marginRight: 3,
    marginTop: 2,
  },
});
