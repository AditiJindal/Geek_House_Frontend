import React, {Component} from 'react';
import {View, Text, StatusBar,TouchableOpacity} from 'react-native';
import {connect} from 'react-redux';
import { COLORS_LIGHT_THEME, COLORS_DARK_THEME } from '../Constants';
import {Actions} from 'react-native-router-flux';
import changeNavigationBarColor from 'react-native-navigation-bar-color';

class Feedback extends Component {
  render(){
    return (
      <View style={{flex:1,
        backgroundColor:(this.props.theme==='light')?COLORS_LIGHT_THEME.LIGHT:COLORS_DARK_THEME.LIGHT}}>
        <StatusBar
          backgroundColor={(this.props.theme==='light')?COLORS_LIGHT_THEME.LIGHT:COLORS_DARK_THEME.LIGHT}
          barStyle={(this.props.theme==='light')?"dark-content":"light-content"}
        />
        {changeNavigationBarColor((this.props.theme==='light')?COLORS_LIGHT_THEME.LIGHT:COLORS_DARK_THEME.LIGHT)}
        <Text>Feedback screen</Text>
        <TouchableOpacity onPress={()=>{Actions.pop()}}>
          <Text>Hello</Text>
        </TouchableOpacity>
      </View>
    )
  }
}


const mapStateToProps = (state) => {
  return {
    theme: state.chat.theme
  }
}

export default connect(mapStateToProps, {})(Feedback);