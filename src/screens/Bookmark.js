import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  ScrollView,
} from 'react-native';
import {Actions} from 'react-native-router-flux';
import {Icon} from 'react-native-elements';
import _ from 'lodash';
import {connect} from 'react-redux';
import {
  setAuthToken,
  getBookmarkedArticles,
} from '../actions/ArticleInfoAction';
import ShimmerPlaceHolder from 'react-native-shimmer-placeholder';
import ArticleTile from '../components/ArticleTile';
import ArticleTileAds from '../components/ArticleTileAds';
import {FONTS} from '../Constants';

class Bookmark extends React.Component {
  state = {adIndex: 0, adCategoryIndex: []};

  componentDidMount() {
    if (Object.keys(this.props.bookmarked_articles).length === 0) {
      this.props.setAuthToken();
      this.props.getBookmarkedArticles();
    }
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
          onPress={() => {
            Actions.pop();
          }}
          style={{justifyContent: 'center', alignItems: 'center', padding: 3}}>
          <Icon
            name="arrow-left"
            type="material-community"
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
        <View style={{flexGrow: 1}}>
          <ScrollView
            style={{flexGrow: 1}}
            nestedScrollEnabled={true}
            showsVerticalScrollIndicator={false}>
            {this.renderHeader()}
            <ShimmerPlaceHolder
              colorShimmer={COLORS.SHIMMER_COLOR}
              visible={false}
              autoRun={true}
              duration={600}
              delay={100}
              style={{
                height: 35,
                borderRadius: 5,
                marginTop: 30,
                marginLeft: 15,
                alignItems: 'center',
                elevation: 6,
              }}
            />
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <ShimmerPlaceHolder
                colorShimmer={COLORS.SHIMMER_COLOR}
                visible={false}
                style={{
                  width: 150,
                  height: 150,
                  borderRadius: 8,
                  margin: 15,
                  marginHorizontal: 5,
                  elevation: 6,
                }}
              />
              <ShimmerPlaceHolder
                colorShimmer={COLORS.SHIMMER_COLOR}
                visible={false}
                style={{
                  width: 150,
                  height: 150,
                  borderRadius: 8,
                  margin: 15,
                  marginHorizontal: 5,
                  elevation: 6,
                }}
              />
              <ShimmerPlaceHolder
                colorShimmer={COLORS.SHIMMER_COLOR}
                visible={false}
                style={{
                  width: 150,
                  height: 150,
                  borderRadius: 8,
                  margin: 15,
                  marginHorizontal: 5,
                  elevation: 6,
                }}
              />
            </ScrollView>

            <ShimmerPlaceHolder
              colorShimmer={COLORS.SHIMMER_COLOR}
              visible={false}
              autoRun={true}
              duration={650}
              delay={30}
              style={{
                height: 35,
                borderRadius: 5,
                marginTop: 30,
                marginLeft: 15,
                alignItems: 'center',
                elevation: 6,
              }}
            />
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <ShimmerPlaceHolder
                colorShimmer={COLORS.SHIMMER_COLOR}
                visible={false}
                style={{
                  width: 150,
                  height: 150,
                  borderRadius: 8,
                  margin: 15,
                  marginHorizontal: 5,
                  elevation: 6,
                }}
              />
              <ShimmerPlaceHolder
                colorShimmer={COLORS.SHIMMER_COLOR}
                visible={false}
                style={{
                  width: 150,
                  height: 150,
                  borderRadius: 8,
                  margin: 15,
                  marginHorizontal: 5,
                  elevation: 6,
                }}
              />
              <ShimmerPlaceHolder
                colorShimmer={COLORS.SHIMMER_COLOR}
                visible={false}
                style={{
                  width: 150,
                  height: 150,
                  borderRadius: 8,
                  margin: 15,
                  marginHorizontal: 5,
                  elevation: 6,
                }}
              />
            </ScrollView>

            <ShimmerPlaceHolder
              colorShimmer={COLORS.SHIMMER_COLOR}
              visible={false}
              autoRun={true}
              duration={700}
              delay={0}
              style={{
                height: 35,
                borderRadius: 5,
                marginTop: 30,
                marginLeft: 15,
                alignItems: 'center',
                elevation: 6,
              }}
            />
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <ShimmerPlaceHolder
                colorShimmer={COLORS.SHIMMER_COLOR}
                visible={false}
                style={{
                  width: 150,
                  height: 150,
                  borderRadius: 8,
                  margin: 15,
                  marginHorizontal: 5,
                  elevation: 6,
                }}
              />
              <ShimmerPlaceHolder
                colorShimmer={COLORS.SHIMMER_COLOR}
                visible={false}
                style={{
                  width: 150,
                  height: 150,
                  borderRadius: 8,
                  margin: 15,
                  marginHorizontal: 5,
                  elevation: 6,
                }}
              />
              <ShimmerPlaceHolder
                colorShimmer={COLORS.SHIMMER_COLOR}
                visible={false}
                style={{
                  width: 150,
                  height: 150,
                  borderRadius: 8,
                  margin: 15,
                  marginHorizontal: 5,
                  elevation: 6,
                }}
              />
            </ScrollView>
            <View style={{height: 200, width: 1}} />
          </ScrollView>
        </View>
      );
    } else {
      const category_list = Object.keys(this.props.bookmarked_articles);
      if (!this.state.adCategoryIndex.length) {
        this.setState({
          adCategoryIndex: [
            _.random(0, category_list.length),
            _.random(0, category_list.length),
            _.random(0, category_list.length),
            _.random(0, category_list.length),
            _.random(0, category_list.length),
          ],
        });
      }

      return (
        <View style={{flexGrow: 1}}>
          <FlatList
            data={category_list}
            showsVerticalScrollIndicator={false}
            ListHeaderComponent={this.renderHeader()}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({item, index}) => {
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
                  {this.renderTopics(
                    data[item],
                    this.state.adCategoryIndex.includes(index),
                  )}
                </View>
              );
            }}
          />
        </View>
      );
    }
  }

  renderTopics(articles, canShowAds) {
    const {COLORS, theme, adsManager, canShowAdsRemote} = this.props;

    if (!this.state.adIndex && articles && articles.length > 2) {
      this.setState({adIndex: _.random(2, articles.length - 1)});
    }
    return (
      <FlatList
        data={articles}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({item, index}) => {
          return (
            <View
              style={{
                marginVertical: 15,
                flexDirection: 'row',
                marginHorizontal: 5,
                alignItems: 'center',
              }}>
              {index === this.state.adIndex &&
              index &&
              adsManager &&
              canShowAds &&
              canShowAdsRemote ? (
                <View style={{marginRight: 10}}>
                  <ArticleTileAds
                    theme={theme}
                    COLORS={COLORS}
                    adsManager={adsManager}
                  />
                </View>
              ) : null}
              <ArticleTile data={item} theme={theme} COLORS={COLORS} />
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

const mapStateToProps = state => {
  return {
    adsManager: state.home.adsManager,
    canShowAdsRemote: state.home.welcomeData.canShowAdsRemote,

    bookmarks_loading: state.articleInfo.bookmarks_loading,
    bookmarks_error: state.articleInfo.bookmarks_error,
    bookmarked_articles: state.articleInfo.bookmarked_articles,

    theme: state.chat.theme,
    COLORS: state.chat.COLORS,
  };
};

export default connect(mapStateToProps, {getBookmarkedArticles, setAuthToken})(
  Bookmark,
);

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
