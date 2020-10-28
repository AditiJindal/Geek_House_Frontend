import React from 'react';
import {Text, StyleSheet, View} from 'react-native';
import Image from 'react-native-fast-image';
import {FONTS} from '../Constants';
import SView from 'react-native-simple-shadow-view';
// import console = require('console');

export default class CardView extends React.Component {
  state = {cardWidth: 0};

  imageUrlCorrector(image_url) {
    if (!this.props.image_adder) {
      return '';
    }
    if (image_url.substring(0, 4) !== 'http') {
      image_url = this.props.image_adder + image_url;
    }
    return image_url;
  }

  renderCardImage() {
    const {image} = this.props.cardData;
    if (!image) {
      return null;
    }

    const width = this.state.cardWidth;
    const height = (image.height * width) / image.width;
    return (
      <View style={{width: '100%', height, marginBottom: 10}}>
        <Image
          source={{uri: this.imageUrlCorrector(image.uri)}}
          style={{flex: 1, elevation: 5, borderRadius: 4}}
        />
      </View>
    );
  }

  render() {
    const {COLORS, cardData} = this.props;
    return (
      <SView
        style={{
          ...styles.CardViewStyle,
          backgroundColor: COLORS.IS_LIGHT_THEME
            ? COLORS.LIGHT
            : COLORS.LESS_LIGHT,
        }}
        onLayout={(event) => {
          if (!this.state.cardWidth) {
            this.setState({cardWidth: event.nativeEvent.layout.width});
          }
        }}>
        <Text
          style={{
            ...styles.SubHeadingStyle,
            borderColor: COLORS.GRAY,
            borderBottomWidth: cardData.image ? 0 : 0.5,
            color: COLORS.DARK,
          }}>
          {cardData.sub_heading}
        </Text>
        {this.renderCardImage()}
        <Text style={{...styles.ContentStyle, color: COLORS.DARK}}>
          {cardData.content}
        </Text>
      </SView>
    );
  }
}

const styles = StyleSheet.create({
  CardViewStyle: {
    shadowColor: '#202020',
    shadowOpacity: 0.25,
    shadowOffset: {width: 0, height: 8},
    shadowRadius: 6,
    margin: 10,
    marginBottom: 0,
    borderRadius: 15,
    padding: 10,
  },
  SubHeadingStyle: {
    fontFamily: FONTS.NOE_DISPLAY,
    fontSize: 22,
    marginBottom: 5,
    paddingBottom: 3,
  },
  ContentStyle: {
    textAlign: 'justify',
    fontFamily: FONTS.LATO,
    fontSize: 15,
  },
});
