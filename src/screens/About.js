import React, { Component } from 'react';
import { View, Text, TouchableOpacity, StatusBar, StyleSheet, ScrollView, FlatList} from 'react-native';
import { connect } from 'react-redux';
import Loading from '../components/Loading';
import {setAuthToken, getSettingsData} from '../actions/SettingsAction';
import { Actions } from 'react-native-router-flux';
import {FONTS} from '../Constants';
import { Icon } from 'react-native-elements';
import changeNavigationBarColor from 'react-native-navigation-bar-color';
import SView from 'react-native-simple-shadow-view';
import analytics from '@react-native-firebase/analytics'

class Settings extends Component {

  componentDidMount(){
    this.props.setAuthToken();
    analytics().setCurrentScreen('About', 'About')
    this.props.getSettingsData();
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
          about
        </Text>
      </View>
    )
  }

  renderCard(item){
    const {COLORS} = this.props;
    return (
      <SView style={{
        borderRadius:10, padding:5, marginVertical:5, marginHorizontal:15,
        shadowColor:'#202020',shadowOpacity:0.25,shadowOffset:{width:0,height:8},shadowRadius:6,
        backgroundColor:(this.props.theme==='light')?COLORS.LIGHT:COLORS.LESS_LIGHT,
        paddingHorizontal:10, marginBottom:10}}>
        <View>
          <Text style={{...styles.SubheadingTextStyle, color:COLORS.LESSER_DARK}}>{
            item.heading}
          </Text>
        </View>
        <Text style={{...styles.TextStyling, color:COLORS.LESSER_DARK}}>
          {item.text}
        </Text>
      </SView>
    )
  }

  renderAboutCards(){
    return (
      <FlatList
        data={this.props.settingsData.about}
        keyExtractor={(item, i)=>{return i.toString()}}
        renderItem={({item})=>{return this.renderCard(item)}}
        contentContainerStyle={{paddingBottom:20}}
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
        backgroundColor:COLORS.LIGHT}}>
        <StatusBar 
          barStyle={(this.props.theme==='light')?'dark-content':'light-content'}
          backgroundColor={COLORS.LIGHT}
        />
        {changeNavigationBarColor(COLORS.LIGHT, (this.props.theme==='light'))}
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

    theme: state.chat.theme,
    COLORS: state.chat.COLORS
  }
}

export default connect(mapStateToProps, {setAuthToken, getSettingsData})(Settings);

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