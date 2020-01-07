import React, {Component} from 'react';
import {View, Text, UIManager, Platform, LayoutAnimation} from 'react-native';
import {FONTS} from '../Constants';


const ANIMATION_CONFIG = LayoutAnimation.create(
  75,LayoutAnimation.Types.easeInEaseOut, LayoutAnimation.Properties.scaleXY
)


export default class TimedAlert extends Component {
  state = {
    show:false,
    message:"",
  }
  
  componentDidMount() {
    this.props.onRef(this)
    if (
      Platform.OS === 'android' &&
      UIManager.setLayoutAnimationEnabledExperimental
    ) {
      UIManager.setLayoutAnimationEnabledExperimental(true);
    }
  }

  showAlert(duration, message){
    {LayoutAnimation.configureNext(ANIMATION_CONFIG)}
    this.setState({show:true, message})
    clearTimeout(this.timer);
    this.timer = setTimeout(()=>{
      {LayoutAnimation.configureNext(ANIMATION_CONFIG)}
      this.setState({show:false, message:""});}, duration+1000)
  }

  render(){
    if (!this.state.show){
      return null
    }
    const {COLORS} = this.props;

    return (
      <View style={{paddingHorizontal:15, paddingVertical:15,maxWidth:"92%", margin:15,
        backgroundColor:COLORS.LESSER_DARK, zIndex:10,flexDirection:'row',alignItems:'center',
        borderRadius:15, alignSelf:'center', top:80, position:'absolute', elevation:10}}>
        <Text style={{fontFamily:FONTS.PRODUCT_SANS_BOLD,
        fontSize:14, color:COLORS.LESSER_LIGHT}}>
          {this.state.message}
        </Text>
      </View>
    )
  }
}