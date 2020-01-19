import React, { Component } from 'react';
import { View, Text, TouchableOpacity,
  StatusBar, StyleSheet} from 'react-native';
import { connect } from 'react-redux';
import {setAuthToken} from '../actions/ArticleInfoAction';
import { Actions } from 'react-native-router-flux';
import {FONTS} from '../Constants';
import { Icon } from 'react-native-elements';
import changeNavigationBarColor from 'react-native-navigation-bar-color';
import analytics from '@react-native-firebase/analytics';
import ArticleTile from '../components/ArticleTile';

class NotificationArticle extends Component {

  componentDidMount(){
    this.props.setAuthToken();
    analytics().setCurrentScreen('About', 'About')
  }


  renderHeader(){
    const {COLORS} = this.props;
    return (
      <View style={{borderRadius:10, margin:8, height:70, justifyContent:'space-between',
        marginHorizontal:15,
        alignItems:'center', flexDirection:'row'}}>
        <TouchableOpacity
          activeOpacity={1}
          
          onPress={() => {Actions.pop()}}
          style={{justifyContent:'center', alignItems:'center',padding:3}}>
          <Icon name="arrow-left" type="material-community" size={26}
            containerStyle={{marginVertical:5, marginRight:15}} 
            color={COLORS.LESS_DARK}/>
        </TouchableOpacity>

        <Text style={{...styles.HeadingTextStyling, 
        color:COLORS.LESS_DARK}}>
          for you
        </Text>
      </View>
    )
  }

  renderArticle(){
    return (
      <View style={{flex:1, padding:10}}>
        {this.renderHeader()}
        <View style={{flex:1, justifyContent:'center', alignItems:'center', marginBottom:50}}>
          <ArticleTile data={this.props.articleData} 
          size={180} theme={this.props.theme} COLORS={this.props.COLORS}/>
        </View>
      </View>
    );
  }

  render(){
    return (
      <View style={{flex:1, 
        backgroundColor:COLORS.LIGHT}}>
        <StatusBar 
          barStyle={(this.props.theme==='light')?'dark-content':'light-content'}
          backgroundColor={COLORS.LIGHT}
        />
        {changeNavigationBarColor(COLORS.LIGHT, (this.props.theme==='light'))}
        {this.renderArticle()}
      </View>
    );
  };
};

const mapStateToProps = (state) => {
  return {
    theme: state.chat.theme,
    COLORS: state.chat.COLORS
  }
}

export default connect(mapStateToProps, {setAuthToken})(NotificationArticle);

const styles = StyleSheet.create({
  HeadingTextStyling:{
    fontSize:24,
    fontFamily:FONTS.GOTHAM_BLACK,
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
  }
})