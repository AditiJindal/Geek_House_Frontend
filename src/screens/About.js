import React, { Component } from 'react';
import { View, Text, TouchableOpacity, StatusBar, StyleSheet, ScrollView, FlatList} from 'react-native';
import { connect } from 'react-redux';
import Loading from '../components/Loading';
import {setAuthToken, getSettingsData} from '../actions/SettingsAction';
import { Actions } from 'react-native-router-flux';
import {FONTS, COLORS_LIGHT_THEME, COLORS_DARK_THEME } from '../Constants';
import { Icon } from 'react-native-elements';
import changeNavigationBarColor from 'react-native-navigation-bar-color';

class Settings extends Component {

  componentDidMount(){
    this.props.setAuthToken();
    this.props.getSettingsData();
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
            containerStyle={{marginVertical:5, marginRight:15}} 
            color={(this.props.theme==='light')?COLORS_LIGHT_THEME.LESS_DARK:COLORS_DARK_THEME.LESS_DARK}/>
        </TouchableOpacity>

        <Text style={{...styles.HeadingTextStyling, 
          color:(this.props.theme==='light')?COLORS_LIGHT_THEME.LESS_DARK:COLORS_DARK_THEME.LESS_DARK}}>about</Text>
      </View>
    )
  }

  renderCard(item){
    return (
      <View style={{
        borderRadius:10, padding:5, elevation: 5, marginVertical:5, marginHorizontal:15,
        backgroundColor:(this.props.theme==='light')?COLORS_LIGHT_THEME.LIGHT:COLORS_DARK_THEME.LESS_LIGHT,
        paddingHorizontal:10, marginBottom:10}}>
        <View>
          <Text style={{...styles.SubheadingTextStyle, color:(this.props.theme==='light')?COLORS_LIGHT_THEME.LESSER_DARK:COLORS_DARK_THEME.LESSER_DARK}}>{
            item.heading}
          </Text>
        </View>
        <Text style={{...styles.TextStyling, color:(this.props.theme==='light')?COLORS_LIGHT_THEME.LESSER_DARK:COLORS_DARK_THEME.LESSER_DARK}}>
          {item.text}
        </Text>
      </View>
    )
  }

  renderAboutCards(){
    return (
      <FlatList
        data={this.props.settingsData.about}
        keyExtractor={(item, i)=>{return i.toString()}}
        renderItem={({item})=>{return this.renderCard(item)}}
      />
    )
  }

  renderAbout(){
    return (
      <ScrollView contentContainerStyle={{flex:1, paddingVertical:10, paddingHorizontal:10}}>
        {this.renderHeader()}
        {this.renderAboutCards()}
      </ScrollView>
    );
  }

  render(){
    return (
      <View style={{flex:1, 
        backgroundColor:(this.props.theme==='light')?COLORS_LIGHT_THEME.LIGHT:COLORS_DARK_THEME.LIGHT}}>
        <StatusBar 
          barStyle={(this.props.theme==='light')?'dark-content':'light-content'}
          backgroundColor={(this.props.theme==='light')?COLORS_LIGHT_THEME.LIGHT:COLORS_DARK_THEME.LIGHT}
        />
        {changeNavigationBarColor((this.props.theme==='light')?COLORS_LIGHT_THEME.LIGHT:COLORS_DARK_THEME.LIGHT, (this.props.theme==='light'))}
        {
          (this.props.loading)?
          (<View style={{flex:1, justifyContent:'center', alignItems:'center'}}>
            <Loading size={128} white={(this.props.theme!=='light')} />
          </View>):
          this.renderAbout()
        }
      </View>
    );
  };
};

const mapStateToProps = (state) => {
  return {
    data: state.login.data,

    settingsData: state.settings.settingsData,
    loading: state.settings.loading,

    theme: state.chat.theme
  }
}

export default connect(mapStateToProps, {setAuthToken, getSettingsData})(Settings);

const styles = StyleSheet.create({
  HeadingTextStyling:{
    fontSize:28,
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