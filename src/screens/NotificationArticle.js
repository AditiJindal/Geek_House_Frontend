import React, { Component } from 'react';
import { View, Text, TouchableOpacity, ImageBackground,
  StatusBar, StyleSheet} from 'react-native';
import { connect } from 'react-redux';
import {setAuthToken, getArticleInfo} from '../actions/ArticleInfoAction';
import { Actions } from 'react-native-router-flux';
import {FONTS, LOG_EVENT, COLORS_LIGHT_THEME} from '../Constants';
import { Icon } from 'react-native-elements';
import Loading from '../components/Loading';
import analytics from '@react-native-firebase/analytics';
import ArticleTile from '../components/ArticleTile';
import {logEvent} from '../actions/ChatAction';

class NotificationArticle extends Component {

  componentDidMount(){
    this.props.setAuthToken();
    this.props.getArticleInfo(this.props.article_id, false, false)
    analytics().setCurrentScreen('NotificationArticle', 'NotificationArticle');
    logEvent(LOG_EVENT.SCREEN_CHANGE, 'notification_article')
  }


  renderHeader(){
    return (
      <View style={{borderRadius:10, margin:8, height:70, justifyContent:'space-between',
        marginHorizontal:15,
        alignItems:'center', flexDirection:'row'}}>
        <TouchableOpacity
          activeOpacity={1}
          
          onPress={() => {Actions.pop()}}
          style={{justifyContent:'center', alignItems:'center',padding:3}}>
          <Icon name="arrow-left" type="material-community" size={26}
            containerStyle={styles.IconStyles} 
            color={styles.HeadingTextStyling.color}/>
        </TouchableOpacity>

        <Text style={styles.HeadingTextStyling}>
          for you
        </Text>
      </View>
    )
  }

  renderArticle(){
    return (
      <View style={{flex:1, padding:10}}>
        {this.renderHeader()}
        {
          (this.props.loading)?(
            <View style={{flex:1, justifyContent:'center', alignItems:"center"}}>
              <Loading size={96}/>
            </View>
          ):(
            <View style={{flex:1, justifyContent:'center', alignItems:'center', marginBottom:50}}>
              <ArticleTile data={this.props.selectedArticleInfo} 
                size={180} theme={this.props.theme} COLORS={this.props.COLORS}/>
            </View>
          )
        }
      </View>
    );
  }

  render(){
    return (
      <ImageBackground style={{flex:1,}} source={require('../../assets/calm.jpg')} blurRadius={2} >
        <StatusBar 
          barStyle={'dark-content'}
          backgroundColor={"#f5e8f1"}
        />
        {this.renderArticle()}
      </ImageBackground>
    );
  };
};

const mapStateToProps = (state) => {
  return {
    selectedArticleInfo: state.articleInfo.selectedArticleInfo,
    loading: state.articleInfo.loading,

    theme: state.chat.theme,
    COLORS: state.chat.COLORS
  }
}

export default connect(mapStateToProps, {setAuthToken, getArticleInfo})(NotificationArticle);

const styles = StyleSheet.create({
  HeadingTextStyling:{
    fontSize:24,
    fontFamily:FONTS.GOTHAM_BLACK,
    color:COLORS_LIGHT_THEME.LIGHT,
    backgroundColor:COLORS_LIGHT_THEME.GRAY,
    elevation:10,
    paddingHorizontal:15,
    paddingVertical:8,
    borderRadius:100
  },
  SubheadingTextStyle: {
    fontFamily:FONTS.PRODUCT_SANS_BOLD,
    fontSize:22,
    marginBottom:10
  },
  TextStyling: {
    fontFamily: FONTS.PRODUCT_SANS,
    fontSize: 18,
    marginVertical:2
  },
  IconStyles:{
    marginVertical:5, 
    marginRight:15, 
    backgroundColor:COLORS_LIGHT_THEME.GRAY,
    borderRadius:100,
    elevation:10, 
    paddingHorizontal:9, 
    paddingVertical:8
  }
})