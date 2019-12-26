import React, {Component} from 'react';
import {connect} from 'react-redux';
import { View, StyleSheet,TouchableOpacity,Text}from 'react-native';
import {Icon} from 'react-native-elements';
import {logEvent} from '../actions/ChatAction';
import LinearGradient from 'react-native-linear-gradient';
import {ICON_SIZE, SELECTED_ICON_SIZE, FONTS,LOG_EVENT, COLORS_DARK_THEME, COLORS_LIGHT_THEME} from '../Constants';
import {Actions} from "react-native-router-flux"
import Typing from '../components/Typing';
import SView from 'react-native-simple-shadow-view';




const COLOR_PALETE = [
  ['#FF585D','#cc2b5e'],
  ['#f7b733','#fc4a1a'],
  ['#a8e063','#56ab2f'],
  ['#00cdac','#02aab0']
]

class BottomTab extends Component {

  constructor(props) {
    super(props);
    this.state={
      selectedIcon:props.icon_index
    }
  }

  shouldComponentUpdate(nextState){
    if(this.state===nextState){
      return false
    }
    else {return true}
  }

  renderChatBadge(){
    if (this.props.total_typing){
      return (
        <View style={{...styles.UnreadMessagesBadgeStyle, backgroundColor:(this.props.theme==='light')?COLORS_LIGHT_THEME.YELLOW:COLORS_DARK_THEME.YELLOW}}/>
      )
    }
    else if (this.props.total_unread_messages!==0){
      return (
        <View style={{...styles.UnreadMessagesBadgeStyle, backgroundColor:(this.props.theme==='light')?COLORS_LIGHT_THEME.RED:COLORS_DARK_THEME.GREEN}}>
          <Text style={{...styles.UnreadMessagesTextStyle, color:COLORS_LIGHT_THEME.LIGHT}}>{this.props.total_unread_messages}</Text>
        </View>
      )
    }
    else {
      return <View/>
    }
  }

  renderChatButton(iconName, iconType){
    return (
      <View>
        <Icon name={iconName} type={iconType} size={ICON_SIZE+4}
          color={(this.props.theme==='light')?COLORS_LIGHT_THEME.LESS_DARK:COLORS_DARK_THEME.DARK}/>
        <View style={{position:'absolute', bottom:6, right:4.5}}>
          {(this.props.total_typing!==0)?<Typing size={12} speed={1} theme={this.props.theme}/>:<Typing size={12} speed={0} theme={this.props.theme}/>}
        </View>
        {this.renderChatBadge()}
      </View>
    )
  }

  renderIcon(iconName, iconType, index){
    if (index !== this.state.selectedIcon){
      return (
        <TouchableOpacity onPress={()=>{
          // NOTE: SOLVE icon tapping lag issue by making a redux state for bottombar
          // and making it independent from the scene
          this.setState({selectedIcon:index})
          if (index===0){Actions.replace('home'); logEvent(LOG_EVENT.SCREEN_CHANGE, 'home')}  
          if (index===1){Actions.replace('search'); logEvent(LOG_EVENT.SCREEN_CHANGE, 'search')}
          if (index===2){Actions.replace('write'); logEvent(LOG_EVENT.SCREEN_CHANGE, 'write')}
          if (index===3){Actions.replace('chat'); logEvent(LOG_EVENT.SCREEN_CHANGE, 'chat')}
        }}
        style={{height:40, width:SELECTED_ICON_SIZE+22, justifyContent:'center', alignItems:'center'}}>
          {
            (index!==3)?
            <Icon name={iconName} type={iconType} 
              size={ICON_SIZE}
              color={(this.props.theme==='light')?COLORS_LIGHT_THEME.LESS_DARK:COLORS_DARK_THEME.DARK}/>:
            this.renderChatButton(iconName, iconType)
          }
        </TouchableOpacity>
      )
    }
    else{
      return (
        <LinearGradient style={styles.SelectedIconView}
        colors={COLOR_PALETE[index]}>
        
          <Icon name={iconName} type={iconType} 
            size={(index!==3)?SELECTED_ICON_SIZE:SELECTED_ICON_SIZE+4}
            color={COLORS_LIGHT_THEME.LIGHT}/>
        </LinearGradient>
      )
    }
  }

  render() {
    return(
      <SView style={{...styles.BottomTabStyle, shadowColor:COLOR_PALETE[this.state.selectedIcon][1],
        backgroundColor:(this.props.theme==='light')?COLORS_LIGHT_THEME.LIGHT:COLORS_DARK_THEME.LESS_LIGHT}}>
        {this.renderIcon('home','octicon',0)}
        {this.renderIcon('search','feather',1)}
        {this.renderIcon('edit-2','feather',2)}
        {this.renderIcon('message-circle','feather',3)}
      </SView>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    total_typing: state.chat.total_typing,
    total_unread_messages: state.chat.total_unread_messages,
    theme: state.chat.theme
  }
}

export default connect(mapStateToProps, {})(BottomTab)

const styles = StyleSheet.create({
  BottomTabStyle:{
    height:40,
    shadowOpacity: 0.25,
    shadowRadius: 4,
    shadowOffset: { height:5},
    justifyContent:'space-around',
    flexDirection:'row',
    alignItems:'center',
    elevation:3,
    marginHorizontal:20,
    borderRadius:10,
  },
  SelectedIconView:{
    borderRadius:100,
    height:SELECTED_ICON_SIZE+22,
    width:SELECTED_ICON_SIZE+22,
    justifyContent:'center',
    alignItems:'center',
    elevation:3
  },
  UnreadMessagesBadgeStyle:{
    elevation:3, 
    bottom:-2,
    right:-4,
    borderRadius:20,
    minHeight:10,
    minWidth:10,
    position:'absolute',
    justifyContent:'center',
    alignItems:'center'
  },
  UnreadMessagesTextStyle:{
    fontFamily: FONTS.PRODUCT_SANS,
    fontSize:6,
  }
})