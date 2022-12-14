import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  RefreshControl,
  FlatList,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import {connect} from 'react-redux';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Feather';
import _ from 'lodash';
import SView from 'react-native-simple-shadow-view';
import changeNavigationBarColor from 'react-native-navigation-bar-color';

import {
  CustomAlert,
  Dropdown,
  RaisedText,
  ArticleTile,
  Loading,
  ShimmerScreen,
  ArticleInfo,
} from '../components';
import {
  getPopularSearches,
  updateSearchValue,
  selectCategory,
  doSearch,
  clearSearch,
  showAlert,
} from '../actions/SearchAction';
import {
  FONTS,
  ERROR_MESSAGES,
  COLORS_LIGHT_THEME,
  ALL_CATEGORIES,
} from '../Constants';

class Search extends React.PureComponent {
  state = {infoVisible: false, articleData: {}};

  componentDidMount() {
    if (!this.props.popularSearchesData) {
      this.props.getPopularSearches();
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

  renderTopics(articles, category) {
    const {COLORS} = this.props;

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
                alignItems: 'center',
              }}>
              <ArticleTile
                data={data}
                COLORS={COLORS}
                navigation={this.props.navigation}
                size={150}
                onPress={() =>
                  this.setState({infoVisible: true, articleData: data})
                }
              />
            </View>
          );
        }}
      />
    );
  }

  renderHeader() {
    const {COLORS} = this.props;
    return (
      <SView
        style={{
          shadowColor: '#202020',
          shadowOpacity: 0.3,
          shadowOffset: {width: 0, height: 10},
          shadowRadius: 8,
          borderRadius: 10,
          height: 55,
          justifyContent: 'space-between',
          alignSelf: 'center',
          zIndex: 10,
          alignItems: 'center',
          flexDirection: 'row',
          position: 'absolute',
          width: '92%',
          top: 10,
          backgroundColor:
            this.props.theme === 'light' ? COLORS.LIGHT : COLORS.LESS_LIGHT,
          paddingHorizontal: 10,
        }}>
        <Icon
          name="search"
          size={20}
          style={{marginVertical: 5, marginHorizontal: 5}}
          color={COLORS.LESS_DARK}
        />
        <TextInput
          textAlignVertical="top"
          keyboardAppearance="light"
          maxLength={128}
          onChangeText={(search) => {
            this.props.updateSearchValue(search);
          }}
          spellCheck={true}
          autoCapitalize="words"
          autoCorrect={true}
          placeholder={'search an article'}
          value={this.props.searchValue}
          returnKeyType={'done'}
          placeholderTextColor={COLORS.LESSER_DARK}
          style={{
            fontSize: 20,
            marginTop: 6,
            flex: 1,
            borderBottomWidth: 1,
            padding: 0,
            paddingHorizontal: 5,
            marginHorizontal: 5,
            borderColor: COLORS.LESSER_DARK,
            fontFamily: FONTS.RALEWAY,
            color: COLORS.DARK,
            marginBottom: 3,
          }}
        />
        {this.props.searchValue.length > 0 ? (
          <Icon
            name="x"
            onPress={() => {
              this.props.clearSearch();
            }}
            color={COLORS.LESS_DARK}
            size={20}
            style={{marginLeft: 10, marginRight: 10}}
          />
        ) : null}
        <TouchableOpacity
          activeOpacity={1}
          onPress={() => {
            if (this.props.loading) {
              this.props.showAlert(
                true,
                ERROR_MESSAGES.LET_PREVIOUS_SEARCH_COMPLETE,
              );
            } else if (this.props.searchValue.length > 1) {
              this.props.doSearch(
                this.props.searchValue,
                this.props.categorySelected,
              );
            } else if (this.props.searchValue) {
              this.props.showAlert(true, ERROR_MESSAGES.ONE_SEARCH_CHARACTER);
            } else {
              this.props.showAlert(true, ERROR_MESSAGES.NO_SEARCH_CHARACTER);
            }
          }}>
          <LinearGradient
            style={{
              paddingHorizontal: 10,
              paddingVertical: 6,
              borderRadius: 6,
              marginLeft: 10,
            }}
            colors={
              this.props.searchValue.length > 1 && !this.props.loading
                ? ['rgb(0,181, 213)', 'rgb(0,224, 211)']
                : [COLORS_LIGHT_THEME.GRAY, COLORS_LIGHT_THEME.GRAY]
            }
            start={{x: 1, y: 0}}
            end={{x: 1, y: 1}}>
            <Text
              style={{...styles.TextStyle, color: COLORS_LIGHT_THEME.LIGHT}}>
              search
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </SView>
    );
  }

  renderPopularSearches() {
    const {
      COLORS,
      doingSearch,
      animationOn,
      popularSearchesData,
      searchResults,
      loading,
    } = this.props;
    if (doingSearch) {
      return (
        <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
          <Loading size={128} white={COLORS.THEME !== 'light'} />
        </View>
      );
    }

    let response = popularSearchesData;

    if (searchResults) {
      response = searchResults;
    }

    if (loading) {
      return (
        <ShimmerScreen
          rows={4}
          columns={5}
          COLORS={COLORS}
          header={<View style={{height: 50}} />}
        />
      );
    } else {
      const category_list = Object.keys(response);
      return (
        <FlatList
          data={category_list}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{flexGrow: 1}}
          ListHeaderComponent={
            <View>
              <View style={{height: 70, width: 1}} />
              {searchResults ? (
                <View style={{alignSelf: 'flex-end'}}>
                  <RaisedText
                    text={'Discover New'}
                    animationEnabled={animationOn}
                    theme={this.props.theme}
                    COLORS={COLORS}
                  />
                </View>
              ) : null}
              {this.renderSearchSettings()}
            </View>
          }
          ListFooterComponent={<View style={{height: 80, width: 1}} />}
          refreshControl={
            <RefreshControl
              onRefresh={() => {
                this.props.getPopularSearches();
              }}
              colors={['rgb(0,181, 213)']}
              refreshing={false}
            />
          }
          ListEmptyComponent={
            <View
              style={{
                flex: 1,
                justifyContent: 'center',
                alignItems: 'center',
                marginTop: 100,
              }}>
              <Text
                style={{
                  textAlign: 'center',
                  fontFamily: FONTS.PRODUCT_SANS_BOLD,
                  fontSize: 18,
                  color: COLORS.LESS_DARK,
                }}>
                No results found
              </Text>
            </View>
          }
          keyExtractor={(item, index) => index.toString()}
          renderItem={({item, index}) => {
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
                        COLORS.THEME === 'light'
                          ? COLORS.LIGHT_GRAY
                          : COLORS.GRAY,
                    }}>
                    <Text
                      style={{
                        ...styles.CategoryTextStyle,
                        color:
                          COLORS.THEME === 'light'
                            ? COLORS.LIGHT_GRAY
                            : COLORS.GRAY,
                      }}>
                      {item}
                    </Text>
                  </View>
                </View>
                {this.renderTopics(response[item], item)}
              </View>
            );
          }}
        />
      );
    }
  }

  renderSearchSettings() {
    const {COLORS} = this.props;
    let new_data = [{value: 'All Categories'}];

    ALL_CATEGORIES.map((item) => {
      new_data.push({value: item});
    });
    if (this.props.searchValue.length > 1) {
      return (
        <View style={{marginHorizontal: 25}}>
          <Dropdown
            COLORS={COLORS}
            data={new_data}
            label="Category Selection"
            value="All Categories"
            itemCount={6}
            onChangeText={(category) => {
              this.props.selectCategory(category);
            }}
          />
        </View>
      );
    } else {
      return null;
    }
  }

  renderAlert() {
    if (this.props.alertVisible) {
      return (
        <CustomAlert
          theme={this.props.theme}
          COLORS={this.props.COLORS}
          isVisible={this.props.alertVisible}
          onFirstButtonPress={() => {
            this.props.showAlert(false, {});
          }}
          onSecondButtonPress={() => {
            this.props.showAlert(false, {});
          }}
          onThirdButtonPress={() => {
            this.props.showAlert(false, {});
          }}
          onBackdropPress={() => {
            this.props.showAlert(false, {});
          }}
          message={this.props.alertMessage}
        />
      );
    }
    return null;
  }

  getStatusBarColor() {
    const {COLORS, theme} = this.props;
    let barStyle = theme === 'light' ? 'dark-content' : 'light-content';
    let statusBarColor = COLORS.LIGHT;
    if (this.props.overlayVisible) {
      statusBarColor = COLORS.OVERLAY_COLOR;
      barStyle = 'light-content';
    }
    return {statusBarColor, barStyle};
  }

  render() {
    const {COLORS} = this.props;
    const {statusBarColor, barStyle} = this.getStatusBarColor();
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'space-between',
          backgroundColor: COLORS.LIGHT,
        }}>
        <StatusBar barStyle={barStyle} backgroundColor={statusBarColor} />
        {changeNavigationBarColor(statusBarColor, this.props.theme === 'light')}
        {this.renderAlert()}
        {this.renderHeader()}
        {this.renderPopularSearches()}
        {this.renderArticleInfo()}
      </View>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    canShowAdsRemote: state.home.welcomeData.canShowAdsRemote,

    popularSearchesData: state.search.popularSearchesData,
    loading: state.search.loading,
    searchValue: state.search.searchValue,
    categorySelected: state.search.categorySelected,
    alertVisible: state.search.alertVisible,
    alertMessage: state.search.alertMessage,
    statusBarColor: state.search.statusBarColor,
    searchResults: state.search.searchResults,
    doingSearch: state.search.doingSearch,

    theme: state.chat.theme,
    COLORS: state.chat.COLORS,

    animationOn: state.chat.animationOn,
  };
};

export default connect(mapStateToProps, {
  getPopularSearches,
  updateSearchValue,
  selectCategory,
  doSearch,
  clearSearch,
  showAlert,
})(Search);

const styles = StyleSheet.create({
  TextStyle: {
    fontSize: 18,
    fontFamily: FONTS.RALEWAY_BOLD,
  },
  SearchContainerStyle: {
    marginRight: 0,
    padding: 5,
    borderWidth: 0,
    borderTopWidth: 0,
    borderBottomWidth: 0,
    elevation: 3.5,
    borderRadius: 12,
    flex: 1,
    margin: 10,
    height: 50,
  },
  CategoryTextStyle: {
    fontFamily: FONTS.HELVETICA_NEUE,
    fontSize: 16,
  },
});
