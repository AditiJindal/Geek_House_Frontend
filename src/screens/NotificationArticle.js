import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ImageBackground,
  StatusBar,
  StyleSheet,
} from 'react-native';
import {connect} from 'react-redux';
import Icon from 'react-native-vector-icons/Feather';

import {ArticleTile, Loading, ArticleInfo} from '../components';
import {imageUrlCorrector} from '../utilities';
import {getArticleInfo} from '../actions/ArticleInfoAction';
import {FONTS, COLORS_LIGHT_THEME, SCREENS, SCREEN_CLASSES} from '../Constants';

class NotificationArticle extends React.PureComponent {
  state = {articleData: {}, infoVisible: false};

  componentDidMount() {
    const {article_id} = this.props.route.params;
    this.props.getArticleInfo(article_id, false, false);
  }

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

  renderHeader() {
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
            style={styles.IconStyles}
            color={styles.HeadingTextStyling.color}
          />
        </TouchableOpacity>

        <Text style={styles.HeadingTextStyling}>for you</Text>
      </View>
    );
  }

  renderArticle() {
    if (
      this.props.selectedArticleInfo &&
      this.props.selectedArticleInfo.image
    ) {
      this.props.selectedArticleInfo.image = imageUrlCorrector(
        this.props.selectedArticleInfo.image,
      );
    }
    return (
      <View style={{flex: 1, padding: 10}}>
        {this.renderHeader()}
        {this.props.loading ? (
          <View
            style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
            <Loading size={96} />
          </View>
        ) : (
          <View
            style={{
              flex: 1,
              justifyContent: 'center',
              alignItems: 'center',
              marginBottom: 50,
            }}>
            <ArticleTile
              data={this.props.selectedArticleInfo}
              size={180}
              COLORS={this.props.COLORS}
              onPress={() =>
                this.setState({infoVisible: true, articleData: data})
              }
            />
          </View>
        )}
      </View>
    );
  }

  render() {
    return (
      <ImageBackground
        style={{flex: 1}}
        source={require('../../assets/calm.jpg')}
        blurRadius={2}>
        <StatusBar barStyle={'dark-content'} backgroundColor={'#f5e8f1'} />
        {this.renderArticle()}
        {this.renderArticleInfo()}
      </ImageBackground>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    selectedArticleInfo: state.articleInfo.selectedArticleInfo,
    loading: state.articleInfo.loading,

    theme: state.chat.theme,
    COLORS: state.chat.COLORS,
  };
};

export default connect(mapStateToProps, {getArticleInfo})(NotificationArticle);

const styles = StyleSheet.create({
  HeadingTextStyling: {
    fontSize: 24,
    fontFamily: FONTS.GOTHAM_BLACK,
    color: COLORS_LIGHT_THEME.LIGHT,
    backgroundColor: COLORS_LIGHT_THEME.GRAY,
    elevation: 10,
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 100,
  },
  SubheadingTextStyle: {
    fontFamily: FONTS.PRODUCT_SANS_BOLD,
    fontSize: 22,
    marginBottom: 10,
  },
  TextStyling: {
    fontFamily: FONTS.PRODUCT_SANS,
    fontSize: 18,
    marginVertical: 2,
  },
  IconStyles: {
    marginVertical: 5,
    marginRight: 15,
    backgroundColor: COLORS_LIGHT_THEME.GRAY,
    borderRadius: 100,
    elevation: 10,
    paddingHorizontal: 9,
    paddingVertical: 8,
  },
});
