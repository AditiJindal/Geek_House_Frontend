import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import {connect} from 'react-redux';
import LottieView from 'lottie-react-native';
import Icon from 'react-native-vector-icons/Feather';
import LinearGradient from 'react-native-linear-gradient';
import SView from 'react-native-simple-shadow-view';

import {Loading, ArticleTile, Ripple, ArticleInfo} from '../components';
import {
  publishArticle,
  getMyArticles,
  uploadArticleImages,
} from '../actions/WriteAction';
import {imageUrlCorrector} from '../utilities';
import {FONTS, COLORS_LIGHT_THEME, SCREENS} from '../Constants';

const ConfettiData = require('../../assets/animations/confetti.json');

class Publish extends React.PureComponent {
  state = {value: 180, articleData: {}, infoVisible: false};

  renderArticleInfo() {
    const {articleData, infoVisible} = this.state;

    return (
      <ArticleInfo
        navigation={this.props.navigation}
        onBackdropPress={() => {
          this.setState({infoVisible: false});
        }}
        isVisible={infoVisible}
        article_id={articleData.article_id}
        // for preview
        preview_contents={articleData.preview_contents}
        topic={articleData.topic}
        category={articleData.category}
      />
    );
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
        <SView
          style={{
            shadowColor: '#202020',
            shadowOpacity: 0.2,
            shadowOffset: {width: 0, height: 7.5},
            shadowRadius: 7,
            backgroundColor:
              this.props.theme === 'light' ? COLORS.LIGHT : COLORS.LESS_LIGHT,
            borderRadius: 30,
          }}>
          <Ripple
            containerStyle={{borderRadius: 30}}
            style={{
              padding: 10,
              justifyContent: 'center',
              alignItems: 'center',
              flexDirection: 'row',
            }}
            onPress={() => this.props.navigation.replace(SCREENS.ImageUpload)}>
            <Icon name="arrow-left" size={26} color={COLORS.LESS_DARK} />
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
          </Ripple>
        </SView>

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
            this.props.navigation.goBack();
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
          <Icon name="x" size={26} color={COLORS.LESS_DARK} />
        </TouchableOpacity>
        <Text style={{...styles.TextStyle, color: COLORS.DARK}}>published</Text>
      </View>
    );
  }

  renderPreview() {
    const {image, topic, contents, category} = this.props;
    const data = {
      image: imageUrlCorrector(image.uri),
      article_id: -1,
      topic: topic,
      preview_contents: contents,
      category: category,
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
            data={data}
            COLORS={this.props.COLORS}
            onPress={() =>
              this.setState({infoVisible: true, articleData: data})
            }
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

    return this.props.loading ? (
      <View
        style={{
          width: '100%',
          height: 58,
          justifyContent: 'center',
          alignItems: 'center',
        }}>
        <Loading size={50} white={COLORS.IS_LIGHT_THEME} />
      </View>
    ) : (
      <SView
        style={{
          shadowOffset: {height: 7},
          shadowOpacity: 0.3,
          shadowRadius: 6,
          shadowColor: '#202020',

          borderRadius: 10,
          height: 58,
          width: 170,
          backgroundColor: COLORS_LIGHT_THEME.LIGHT,
          bottom: 15,
          position: 'absolute',
          alignSelf: 'center',
        }}>
        <LinearGradient
          style={{flex: 1, borderRadius: 10}}
          colors={gradient}
          start={{x: 0, y: 1}}
          end={{x: 1, y: 1}}>
          <Ripple
            containerStyle={{borderRadius: 10, flex: 1}}
            style={{justifyContent: 'center', alignItems: 'center', flex: 1}}
            onPress={() => onPress(data_to_send)}>
            <Text
              style={{
                fontFamily: FONTS.GOTHAM_BLACK,
                fontSize: 26,
                color: COLORS_LIGHT_THEME.LIGHT,
              }}>
              {text}
            </Text>
          </Ripple>
        </LinearGradient>
      </SView>
    );
  }

  renderSuccess() {
    return (
      <LottieView
        ref={(animation) => {
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
    const {COLORS, editing_article_id} = this.props;
    return (
      <View style={{flex: 1, backgroundColor: COLORS.LIGHT}}>
        {this.props.published ? this.renderClose() : this.renderBack()}
        {this.renderPreview()}
        {this.props.published
          ? this.renderBottomButton('CONTINUE', ['#ec008c', '#fc6767'], () => {
              this.props.getMyArticles();
              this.props.navigation.goBack();
            })
          : this.renderBottomButton(
              editing_article_id ? 'SAVE' : 'PUBLISH',
              ['#11998e', '#38ef7d'],
              async (data_to_send) => {
                const article = await uploadArticleImages(data_to_send);
                this.props.publishArticle(
                  article,
                  this.animation,
                  editing_article_id,
                );
              },
            )}
        {this.renderArticleInfo()}
      </View>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    contents: state.write.contents,
    topic: state.write.topic,
    category: state.write.category,
    image: state.write.image,
    loading: state.write.loading,
    published: state.write.published,
    editing_article_id: state.write.editing_article_id,

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
