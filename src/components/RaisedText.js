import React, {Component} from 'react';
import {Text, StyleSheet,Animated,View,
  PanResponder,
  UIManager,
  Dimensions} from 'react-native';
import {FONTS} from '../Constants';
import CardFlip from 'react-native-card-flip';
import _ from 'lodash';

const SCREEN_WIDTH = Dimensions.get('window').width

export default class RaisedText extends Component {

  constructor() {
    super();
    const position = new Animated.ValueXY();
    const panResponder = PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (event, gesture) => {
        if (this.props.animationEnabled) {
          position.setValue({ x: gesture.dx, y: gesture.dy });
        }
      },
      onPanResponderRelease: (event, gesture) => {
        if (this.props.animationEnabled) {
          this.resetPosition();
        } 
      }
    });

    this.state={
      panResponder, 
      position,
      card:null
    }
  }

  componentDidMount(){
    if(this.props.animationEnabled){
      this.interval = setInterval(()=>{
        this.timer = setTimeout(()=>{
          if (this.state.card){
            this.state.card.flip()
          }
        }, _.random(7000,10000))
      }, _.random(7000,10000))
    }
  }

  componentWillUnmount(){
    if (this.props.animationEnabled){
      clearInterval(this.interval)
      clearTimeout(this.timer)
    }
  }

  componentDidUpdate(){
    UIManager.setLayoutAnimationEnabledExperimental && UIManager.setLayoutAnimationEnabledExperimental(true);
  }

  resetPosition() {
    Animated.timing(
      this.state.position,
      {
        toValue: { x: 0, y: 0 },
        duration:700,
        delay:10,
      }
    ).start()
  }

  getCardStyle() {
    const { position } = this.state;
    const rotate = position.x.interpolate({
      inputRange: [-SCREEN_WIDTH * 1.5, 0, SCREEN_WIDTH * 1.5],
      outputRange: ['-180deg', '0deg', '180deg']
    });

    return {
      ...position.getLayout(),
      transform: [{ rotate }]
    };
  }

  render() {
    const {COLORS} = this.props;
    return(
      <Animated.View 
        style={[this.getCardStyle(), {...styles.AnimatedViewStyle,
        borderColor:COLORS.LESS_DARK,
        backgroundColor:(this.props.theme==='light')?COLORS.LIGHT:COLORS.LESS_LIGHT}]}
        {...this.state.panResponder.panHandlers}>
        <CardFlip duration={1000} 
          ref={(card) => {
            if(!this.state.card){
              this.setState({card})
            }
          }} style={{zIndex:100, height:30, width:200, alignItems:'center', justifyContent:'center'}}>
          <View style={{flex:1, justifyContent:'center', alignItems:'center'}}>
            <Text 
              style={{...styles.AnimatedWelcomeHeading,
              color: COLORS.LESSER_DARK}}
            >
              {this.props.text}
            </Text>
          </View>

          <View style={{flex:1, justifyContent:'center', alignItems:'center'}}>
            <Text 
              style={{...styles.AnimatedWelcomeHeading,
              color: COLORS.LESSER_DARK}}
            >
              {this.props.secondaryText}
            </Text>
          </View>
        </CardFlip>
      </Animated.View>
    );
  }
}

const styles = StyleSheet.create({
  AnimatedWelcomeHeading:{
    fontFamily:FONTS.RALEWAY_BOLD,
    fontSize:24,
  },
  AnimatedViewStyle:{
    elevation:4, 
    margin:10, 
    padding:10, 
    marginRight:25,
    borderRadius:12
  }    
})