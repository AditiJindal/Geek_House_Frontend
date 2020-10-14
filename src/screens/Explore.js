import React from 'react';
import {
  View,
  Text,
  Dimensions,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  ImageBackground,
  BackHandler,
} from 'react-native';
import {Icon} from 'react-native-elements';
import {connect} from 'react-redux';
import {clearSearch} from '../actions/SearchAction';
import {ArticleTile, Loading} from '../components';
import {FONTS, CATEGORY_IMAGES, COLORS_LIGHT_THEME} from '../Constants';

const screenWidth = Dimensions.get('screen').width;

class Explore extends React.PureComponent {
  componentDidMount() {
    BackHandler.addEventListener('hardwareBackPress', () => {
      this.props.clearSearch();
    });
  }

  renderHeader() {
    const {COLORS} = this.props;
    return (
      <View
        style={{
          margin: 8,
          height: 70,
          justifyContent: 'space-between',
          alignItems: 'center',
          flexDirection: 'row',
          paddingHorizontal: 25,
          paddingVertical: 10,
        }}>
        <TouchableOpacity
          activeOpacity={1}
          onPress={() => {
            this.props.clearSearch();
            this.props.navigation.goBack();
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

        <Text style={{...styles.HeadingTextStyling, color: COLORS.DARK}}>
          explore
        </Text>
      </View>
    );
  }

  renderBigImage() {
    const {exploreCategory, COLORS, exploreData} = this.props;
    const {categoryInfo} = exploreData;
    return (
      <View style={{flex: 1, justifyContent: 'space-around'}}>
        <View
          style={{
            width: screenWidth - 20,
            height: 120,
            overflow: 'hidden',
            borderRadius: 10,
            elevation: 7,
            alignSelf: 'center',
          }}>
          <ImageBackground
            source={CATEGORY_IMAGES[exploreCategory]}
            style={{flex: 1}}
            resizeMode={'cover'}>
            <View
              style={{
                flex: 1,
                backgroundColor: 'rgba(60,60,60,0.35)',
                justifyContent: 'center',
                alignItems: 'center',
              }}>
              <Text style={styles.CategoryText}>{exploreCategory}</Text>
            </View>
          </ImageBackground>
        </View>
        <Text style={{...styles.CategoryInfoText, color: COLORS.LESS_DARK}}>
          {categoryInfo}
        </Text>
      </View>
    );
  }

  renderArticle({item}) {
    const {COLORS, theme} = this.props;
    return (
      <View
        style={{
          width: screenWidth - 40,
          alignItems: 'center',
          marginBottom: 10,
        }}>
        <ArticleTile
          data={item}
          size={((screenWidth - 60) * 3) / 4}
          theme={theme}
          COLORS={COLORS}
          navigation={this.props.navigation}
        />
      </View>
    );
  }

  renderCarousel() {
    const {exploreCategory, exploreData, COLORS} = this.props;
    const data = exploreData[exploreCategory];
    return (
      <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
        <FlatList
          data={data}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item.article_id.toString()}
          renderItem={this.renderArticle.bind(this)}
          contentContainerStyle={{alignItems: 'center'}}
          ListEmptyComponent={
            <Text
              style={{
                fontFamily: FONTS.PRODUCT_SANS,
                color: COLORS.DARK,
                fontSize: 18,
              }}>
              Sorry we couldn't find any article
            </Text>
          }
        />
      </View>
    );
  }

  render() {
    const {COLORS, loading} = this.props;
    if (loading) {
      return (
        <View
          style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: COLORS.LIGHT,
          }}>
          <Loading white={COLORS.THEME !== 'light'} size={128} />
        </View>
      );
    }
    return (
      <View style={{flex: 1, backgroundColor: COLORS.LIGHT}}>
        {this.renderHeader()}
        {this.renderBigImage()}
        {this.renderCarousel()}
      </View>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    loading: state.home.exploreLoading,
    exploreData: state.home.exploreData,
    exploreCategory: state.home.exploreCategory,

    COLORS: state.chat.COLORS,
  };
};

export default connect(mapStateToProps, {clearSearch})(Explore);

const styles = StyleSheet.create({
  HeadingTextStyling: {
    fontSize: 24,
    fontFamily: FONTS.GOTHAM_BLACK,
  },
  CategoryText: {
    fontFamily: FONTS.NOE_DISPLAY,
    fontSize: 32,
    alignSelf: 'center',
    marginVertical: 5,
    color: COLORS_LIGHT_THEME.LIGHT,
  },
  CategoryInfoText: {
    fontFamily: FONTS.PRODUCT_SANS,
    fontSize: 18,
    paddingHorizontal: 25,
    textAlign: 'justify',
  },
});
