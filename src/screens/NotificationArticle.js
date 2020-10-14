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
import {Actions} from 'react-native-router-flux';
import {Icon} from 'react-native-elements';
import analytics from '@react-native-firebase/analytics';

import {ArticleTile, Loading} from '../components';
import {setAuthToken, getArticleInfo} from '../actions/ArticleInfoAction';
import {FONTS, COLORS_LIGHT_THEME} from '../Constants';

class NotificationArticle extends React.PureComponent {
  componentDidMount() {
    this.props.setAuthToken();
    this.props.getArticleInfo(this.props.article_id, false, false);
    analytics().logScreenView({
      screen_class: 'Home',
      screen_name: 'notification_article',
    });
  }

  imageUrlCorrector(image_url) {
    if (!this.props.image_adder) {
      return '';
    }
    if (image_url.substring(0, 4) !== 'http') {
      image_url = this.props.image_adder + image_url;
    }
    return image_url;
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
          onPress={() => {
            Actions.pop();
          }}
          style={{justifyContent: 'center', alignItems: 'center', padding: 3}}>
          <Icon
            name="arrow-left"
            type="material-community"
            size={26}
            containerStyle={styles.IconStyles}
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
      this.props.selectedArticleInfo.image = this.imageUrlCorrector(
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
              notifictionArticle={true}
              size={180}
              theme={this.props.theme}
              COLORS={this.props.COLORS}
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
      </ImageBackground>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    image_adder: state.home.image_adder,

    selectedArticleInfo: state.articleInfo.selectedArticleInfo,
    loading: state.articleInfo.loading,

    theme: state.chat.theme,
    COLORS: state.chat.COLORS,
  };
};

export default connect(mapStateToProps, {setAuthToken, getArticleInfo})(
  NotificationArticle,
);

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
