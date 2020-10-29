import React from 'react';
import {connect} from 'react-redux';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  FlatList,
  RefreshControl,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import LinearGradient from 'react-native-linear-gradient';
import changeNavigationBarColor from 'react-native-navigation-bar-color';
import SView from 'react-native-simple-shadow-view';

import {ArticleTile, Ripple, ShimmerScreen, ArticleInfo} from '../components';
import {getMyArticles, clearPublish} from '../actions/WriteAction';
import {FONTS, COLORS_LIGHT_THEME, SCREENS, SCREEN_CLASSES} from '../Constants';

class Write extends React.PureComponent {
  state = {infoVisible: false, articleData: {}};

  componentDidMount() {
    this.props.getMyArticles(
      Object.keys(this.props.myArticles).length,
      this.props.reload,
    );
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

  renderTopics(articles, category) {
    return (
      <FlatList
        data={articles}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.article_id.toString()}
        renderItem={({item}) => {
          const data = {...item, category};
          return (
            <View
              style={{
                marginVertical: 15,
                flexDirection: 'row',
                marginHorizontal: 5,
              }}>
              <ArticleTile
                size={150}
                data={data}
                navigation={this.props.navigation}
                onPress={() =>
                  this.setState({infoVisible: true, articleData: data})
                }
                COLORS={this.props.COLORS}
              />
            </View>
          );
        }}
      />
    );
  }

  renderCategory() {
    const data = this.props.myArticles;
    const {COLORS} = this.props;

    if (this.props.loading) {
      return (
        <ShimmerScreen
          rows={4}
          columns={5}
          COLORS={COLORS}
          header={<View style={{height: 50}} />}
          footer={<View style={{height: 125}} />}
        />
      );
    } else {
      const category_list = Object.keys(data);
      return (
        <View style={{width: '100%', flex: 1}}>
          <FlatList
            data={category_list}
            contentContainerStyle={{flexGrow: 1}}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={false}
                colors={['rgb(0,181, 213)']}
                onRefresh={() => {
                  this.props.getMyArticles(
                    Object.keys(this.props.myArticles).length,
                    this.props.reload,
                  );
                }}
              />
            }
            ListEmptyComponent={
              <View
                style={{
                  flex: 1,
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginTop: 100,
                  paddingHorizontal: 30,
                }}>
                <Text
                  style={{
                    textAlign: 'center',
                    fontFamily: FONTS.PRODUCT_SANS_BOLD,
                    fontSize: 18,
                    color: COLORS.LESS_DARK,
                  }}>
                  You have not written any articles, you can start writing one
                  by tapping on the NEW button
                </Text>
              </View>
            }
            ListHeaderComponent={<View style={{height: 70, width: 1}} />}
            ListFooterComponent={<View style={{height: 200, width: 1}} />}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({item}) => {
              // item here is the category
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
                  {this.renderTopics(data[item], item)}
                </View>
              );
            }}
          />
        </View>
      );
    }
  }

  renderFloatingButton() {
    return (
      <LinearGradient
        style={{
          borderRadius: 10,
          elevation: 4,
          bottom: 65,
          left: 20,
          position: 'absolute',
        }}
        colors={
          this.props.isDraft ? ['#f12711', '#f5af19'] : ['#fc6767', '#ec008c']
        }
        start={{x: 0, y: 1}}
        end={{x: 1, y: 1}}>
        <Ripple
          containerStyle={{borderRadius: 10}}
          style={{paddingHorizontal: 15, paddingVertical: 10}}
          onPress={() => {
            this.props.isDraft ? () => {} : this.props.clearPublish();
            this.props.navigation.navigate(SCREENS.WriteArticle);
          }}>
          {this.props.isDraft ? (
            <View style={{alignItems: 'center'}}>
              <Text style={[styles.ButtonTextStyle, {fontSize: 20}]}>
                CONTINUE
              </Text>
              <Text
                style={{
                  fontSize: 12,
                  fontFamily: FONTS.LATO,
                  color: COLORS_LIGHT_THEME.LIGHT,
                }}>
                Previous Article
              </Text>
            </View>
          ) : (
            <View style={{alignItems: 'center', flexDirection: 'row'}}>
              <Text
                style={[
                  styles.ButtonTextStyle,
                  {fontSize: 24, marginHorizontal: 5},
                ]}>
                NEW
              </Text>
              <Icon name="plus" size={28} color={COLORS_LIGHT_THEME.LIGHT} />
            </View>
          )}
        </Ripple>
      </LinearGradient>
    );
  }

  render() {
    const {COLORS} = this.props;
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'space-between',
          backgroundColor: COLORS.LIGHT,
        }}>
        <StatusBar
          barStyle={
            this.props.theme === 'light' ? 'dark-content' : 'light-content'
          }
          backgroundColor={COLORS.LIGHT}
        />
        {changeNavigationBarColor(COLORS.LIGHT, this.props.theme === 'light')}

        <SView
          style={{
            borderRadius: 10,
            height: 55,
            paddingLeft: 20,
            paddingRight: 10,
            alignItems: 'center',
            flexDirection: 'row',
            shadowColor: '#202020',
            shadowOpacity: 0.3,
            position: 'absolute',
            top: 10,
            zIndex: 10,
            width: '92%',
            alignSelf: 'center',
            shadowOffset: {width: 0, height: 10},
            shadowRadius: 8,
            justifyContent: 'space-between',
            backgroundColor:
              this.props.theme === 'light' ? COLORS.LIGHT : COLORS.LESS_LIGHT,
          }}>
          <Text style={{...styles.TextStyle, color: COLORS.DARK}}>
            my articles
          </Text>

          <LinearGradient
            style={{borderRadius: 6}}
            colors={['#2193b0', '#6dd5ed']}
            start={{x: 0, y: 1}}
            end={{x: 1, y: 1}}>
            <Ripple
              containerStyle={{borderRadius: 6}}
              style={{
                paddingHorizontal: 10,
                paddingVertical: 6,
                flexDirection: 'row',
                alignItems: 'center',
              }}
              onPress={() => this.props.navigation.navigate(SCREENS.Bookmark)}>
              <Text
                style={{
                  fontSize: 16,
                  fontFamily: FONTS.RALEWAY_BOLD,
                  color: COLORS_LIGHT_THEME.LIGHT,
                }}>
                {'bookmarks '}
              </Text>
              <Icon
                name="arrow-right"
                size={20}
                color={COLORS_LIGHT_THEME.LIGHT}
              />
            </Ripple>
          </LinearGradient>
        </SView>
        {this.renderCategory()}
        {this.renderFloatingButton()}
        {this.renderArticleInfo()}
        {/* <BottomTab icon_index={2}/> */}
      </View>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    loading: state.write.loading,
    myArticles: state.write.myArticles,
    published: state.write.published,
    isDraft: state.write.isDraft,
    reload: state.write.reload,

    theme: state.chat.theme,
    COLORS: state.chat.COLORS,
  };
};

export default connect(mapStateToProps, {
  getMyArticles,
  clearPublish,
})(Write);

const styles = StyleSheet.create({
  TextStyle: {
    fontSize: 24,
    fontFamily: FONTS.GOTHAM_BLACK,
  },
  CategoryTextStyle: {
    fontFamily: FONTS.HELVETICA_NEUE,
    fontSize: 16,
  },
  ButtonTextStyle: {
    fontFamily: FONTS.GOTHAM_BLACK,
    fontSize: 30,
    color: COLORS_LIGHT_THEME.LIGHT,
  },
});
