import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet, FlatList} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import _ from 'lodash';
import {connect} from 'react-redux';
import {getBookmarkedArticles} from '../actions/ArticleInfoAction';
import {ArticleTile, ShimmerScreen, ArticleInfo} from '../components';
import {FONTS} from '../Constants';

class Bookmark extends React.PureComponent {
  state = {infoVisible: false, articleData: {}};

  componentDidMount() {
    if (Object.keys(this.props.bookmarked_articles).length === 0) {
      this.props.getBookmarkedArticles();
    }
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
            containerStyle={{marginVertical: 5, marginRight: 15}}
            color={COLORS.LESS_DARK}
          />
        </TouchableOpacity>

        <Text style={{...styles.HeadingTextStyling, color: COLORS.LESS_DARK}}>
          your bookmarks
        </Text>
      </View>
    );
  }

  renderCategory() {
    const data = this.props.bookmarked_articles;
    const {COLORS} = this.props;

    if (this.props.bookmarks_loading) {
      return (
        <ShimmerScreen
          header={this.renderHeader()}
          rows={4}
          columns={5}
          COLORS={COLORS}
        />
      );
    } else {
      const category_list = Object.keys(this.props.bookmarked_articles);

      return (
        <View style={{flexGrow: 1}}>
          <FlatList
            data={category_list}
            showsVerticalScrollIndicator={false}
            ListHeaderComponent={this.renderHeader()}
            keyExtractor={(index) => index.toString()}
            renderItem={({item}) => {
              return (
                <View
                  style={{
                    marginTop: 25,
                    alignItems: 'flex-start',
                    justifyContent: 'flex-start',
                  }}>
                  <View style={{flex: 1, marginLeft: 15}}>
                    <View
                      style={{
                        borderRadius: 5,
                        padding: 5,
                        paddingHorizontal: 10,
                        borderWidth: 2,
                        borderColor:
                          this.props.theme === 'light'
                            ? COLORS.LIGHT_GRAY
                            : COLORS.GRAY,
                      }}>
                      <Text
                        style={{
                          ...styles.CategoryTextStyle,
                          color:
                            this.props.theme === 'light'
                              ? COLORS.LIGHT_GRAY
                              : COLORS.GRAY,
                        }}>
                        {item}
                      </Text>
                    </View>
                  </View>
                  {this.renderTopics(data[item])}
                </View>
              );
            }}
          />
          {this.renderArticleInfo()}
        </View>
      );
    }
  }

  renderTopics(articles) {
    const {COLORS} = this.props;

    return (
      <FlatList
        data={articles}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(index) => index.toString()}
        renderItem={({item}) => {
          return (
            <View
              style={{
                marginVertical: 15,
                flexDirection: 'row',
                marginHorizontal: 5,
                alignItems: 'center',
              }}>
              <ArticleTile
                size={150}
                data={item}
                navigation={this.props.navigation}
                onPress={() =>
                  this.setState({infoVisible: true, articleData: item})
                }
                COLORS={COLORS}
              />
            </View>
          );
        }}
      />
    );
  }

  render() {
    return (
      <View style={{flex: 1, backgroundColor: COLORS.LIGHT}}>
        {Object.keys(this.props.bookmarked_articles).length !== 0 ||
        this.props.bookmarks_loading ? (
          this.renderCategory()
        ) : (
          <View style={{flexGrow: 1}}>
            {this.renderHeader()}
            <View
              style={{
                flex: 1,
                justifyContent: 'center',
                alignItems: 'center',
                padding: 30,
              }}>
              <Text
                style={{
                  textAlign: 'center',
                  fontFamily: FONTS.PRODUCT_SANS_BOLD,
                  fontSize: 18,
                  color: COLORS.LESS_DARK,
                }}>
                {this.props.bookmarks_error
                  ? this.props.bookmarks_error
                  : "You currently don't have any articles bookmarked."}
              </Text>
            </View>
          </View>
        )}
      </View>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    canShowAdsRemote: state.home.welcomeData.canShowAdsRemote,

    bookmarks_loading: state.articleInfo.bookmarks_loading,
    bookmarks_error: state.articleInfo.bookmarks_error,
    bookmarked_articles: state.articleInfo.bookmarked_articles,

    theme: state.chat.theme,
    COLORS: state.chat.COLORS,
  };
};

export default connect(mapStateToProps, {getBookmarkedArticles})(Bookmark);

const styles = StyleSheet.create({
  HeadingTextStyling: {
    fontSize: 24,
    fontFamily: FONTS.GOTHAM_BLACK,
  },
  SubheadingTextStyle: {
    fontFamily: FONTS.PRODUCT_SANS_BOLD,
    fontSize: 20,
    marginBottom: 10,
  },
  TextStyle: {
    fontSize: 24,
    fontFamily: FONTS.GOTHAM_BLACK,
  },
  CategoryTextStyle: {
    fontFamily: FONTS.HELVETICA_NEUE,
    fontSize: 16,
  },
});
