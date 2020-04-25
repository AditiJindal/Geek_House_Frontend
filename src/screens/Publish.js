import React, {Component} from 'react';
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import {FONTS, COLORS_LIGHT_THEME, } from '../Constants';
import {connect} from 'react-redux';
import {Actions} from 'react-native-router-flux';
import Ripple from '../components/Ripple';
import {
  publishArticle,
  getMyArticles,
  uploadArticleImages,
} from '../actions/WriteAction';
import LottieView from 'lottie-react-native';
import {Icon} from 'react-native-elements';
import LinearGradient from 'react-native-linear-gradient';
import ArticleTile from '../components/ArticleTile';
import Loading from '../components/Loading';
import SView from 'react-native-simple-shadow-view';
import analytics from '@react-native-firebase/analytics';
const ConfettiData = require('../../assets/animations/confetti.json');

class Publish extends Component {
  constructor() {
    super();
    this.state = {
      value: 180,
    };
  }

  componentDidMount() {
    analytics().setCurrentScreen('Publish', 'Publish');
  }

  renderBack() {
    const {COLORS} = this.props;
    return (
      <View
        style={{
          margin: 8,
          height: 70,
          justifyContent: 'space-between',
          alignItems: 'center',
          flexDirection: 'row',
          marginRight: 15,
        }}>
        <Ripple
          onPress={() => {
            Actions.replace('imageupload');
          }}
          rippleContainerBorderRadius={30}>
          <SView
            style={{
              shadowColor: '#202020',
              shadowOpacity: 0.2,
              shadowOffset: {width: 0, height: 7.5},
              shadowRadius: 7,
              borderRadius: 30,
              padding: 10,
              backgroundColor:
                this.props.theme === 'light' ? COLORS.LIGHT : COLORS.LESS_LIGHT,
              justifyContent: 'center',
              alignItems: 'center',
              flexDirection: 'row',
            }}>
            <Icon
              name="arrow-left"
              type="material-community"
              size={26}
              containerStyle={{
                height: 26,
                width: 26,
                justifyContent: 'center',
                alignItems: 'center',
              }}
              color={COLORS.LESS_DARK}
            />
            <Text
              style={{
                color: COLORS.LESS_DARK,
                fontFamily: FONTS.RALEWAY,
                marginHorizontal: 3,
                fontSize: 16,
                textAlignVertical: 'center',
              }}>
              image <Text style={{fontSize: 14}}>upload</Text>
            </Text>
          </SView>
        </Ripple>
        <Text style={{...styles.TextStyle, color: COLORS.DARK}}>preview</Text>
      </View>
    );
  }

  renderClose() {
    const {COLORS} = this.props;
    return (
      <View
        style={{
          borderRadius: 10,
          margin: 8,
          height: 70,
          justifyContent: 'space-between',
          alignItems: 'center',
          flexDirection: 'row',
        }}>
        <TouchableOpacity
          onPress={() => {
            this.props.getMyArticles();
            Actions.pop();
          }}
          activeOpacity={1}
          style={{
            borderRadius: 30,
            padding: 10,
            marginRight: 15,
            justifyContent: 'center',
            alignItems: 'center',
            flexDirection: 'row',
          }}>
          <Icon
            name="close"
            type="material-community"
            size={26}
            containerStyle={{
              height: 26,
              width: 26,
              justifyContent: 'center',
              alignItems: 'center',
            }}
            color={COLORS.LESS_DARK}
          />
        </TouchableOpacity>
        <Text style={{...styles.TextStyle, color: COLORS.DARK}}>published</Text>
      </View>
    );
  }

  renderPreview() {
    data = {
      image: this.props.image.uri,
      article_id: -1,
      topic: this.props.topic,
      preview_contents: this.props.contents,
      category: this.props.category,
    };

    return (
      <View
        style={{
          flex: 3,
          justifyContent: 'center',
          alignItems: 'center',
          marginBottom: 50,
        }}>
        <View style={{position: 'absolute', zIndex: 10, alignItems: 'center'}}>
          <ArticleTile
            size={this.state.value}
            data={{...data, category: this.props.category}}
            animate
            theme={this.props.theme}
            COLORS={this.props.COLORS}
          />
          {!this.props.image.uri ? (
            <Text
              style={{
                fontFamily: FONTS.PRODUCT_SANS,
                color: COLORS.GRAY,
                fontSize: 10,
                marginTop: 20,
                width: '60%',
                textAlign: 'center',
              }}>
              An image will be automatically assigned to your article when your
              publish it
            </Text>
          ) : null}
        </View>
        {this.renderSuccess()}
      </View>
    );
  }

  renderBottomButton(text, gradient, onPress) {
    const {COLORS} = this.props;
    data_to_send = {
      image: this.props.image.uri,
      topic: this.props.topic,
      contents: this.props.contents,
      category: this.props.category,
    };
    return (
      <Ripple
        activeOpacity={0.5}
        style={{
          borderWidth: 0,
          bottom: 15,
          position: 'absolute',
          alignSelf: 'center',
        }}
        onPress={() => onPress(data_to_send)}
        rippleContainerBorderRadius={10}>
        {this.props.loading ? (
          <Loading size={50} white={this.props.theme !== 'light'} />
        ) : (
          <SView
            style={{
              borderRadius: 10,
              shadowOpacity: 0.3,
              shadowRadius: 6,
              height: 58,
              width: 170,
              shadowOffset: {height: 7},
              shadowColor: '#202020',
              backgroundColor: COLORS_LIGHT_THEME.LIGHT,
            }}>
            <LinearGradient
              style={{
                borderRadius: 10,
                flex: 1,
                justifyContent: 'center',
                alignItems: 'center',
                backgroundColor: COLORS.GREEN,
              }}
              colors={gradient}
              start={{x: 0, y: 1}}
              end={{x: 1, y: 1}}>
              <Text
                style={{
                  fontFamily: FONTS.GOTHAM_BLACK,
                  fontSize: 26,
                  color: COLORS_LIGHT_THEME.LIGHT,
                }}>
                {text}
              </Text>
            </LinearGradient>
          </SView>
        )}
      </Ripple>
    );
  }

  renderSuccess() {
    return (
      <LottieView
        ref={animation => {
          this.animation = animation;
        }}
        autoPlay={false}
        loop={false}
        style={{width: 400, height: 320}}
        source={ConfettiData}
        speed={1}
      />
    );
  }

  render() {
    const {COLORS} = this.props;
    return (
      <View style={{flex: 1, backgroundColor: COLORS.LIGHT}}>
        {this.props.published ? this.renderClose() : this.renderBack()}
        {this.renderPreview()}
        {this.props.published
          ? this.renderBottomButton('CONTINUE', ['#ec008c', '#fc6767'], () => {
              this.props.getMyArticles();
              Actions.pop();
            })
          : this.renderBottomButton(
              'PUBLISH',
              ['#11998e', '#38ef7d'],
              async data_to_send => {
                const article = await uploadArticleImages(data_to_send);
                this.props.publishArticle(article, this.animation);
              },
            )}
      </View>
    );
  }
}

const mapStateToProps = state => {
  return {
    contents: state.write.contents,
    topic: state.write.topic,
    category: state.write.category,
    image: state.write.image,
    loading: state.write.loading,
    published: state.write.published,

    theme: state.chat.theme,
    COLORS: state.chat.COLORS,
  };
};

export default connect(mapStateToProps, {publishArticle, getMyArticles})(
  Publish,
);

const styles = StyleSheet.create({
  TextStyle: {
    fontSize: 24,
    fontFamily: FONTS.GOTHAM_BLACK,
    marginRight: 10,
  },
});
