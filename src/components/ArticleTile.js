import React, {Component} from 'react';
import { Text, StyleSheet, TouchableOpacity, View}from 'react-native';
import Loading from './Loading'
import ArticleInfo from './ArticleInfo';
import {logEvent} from '../actions/ChatAction';
import {Icon} from 'react-native-elements';
import Image from 'react-native-fast-image';
import {FONTS,COLOR_COMBOS, LOG_EVENT, COLORS_LIGHT_THEME,
  CATEGORY_IMAGES, COLORS_DARK_THEME} from '../Constants';
import LinearGradient from 'react-native-linear-gradient';
import analytics from '@react-native-firebase/analytics';



const LG_SUCCESS = [
    'rgba(100, 100, 100, 0)','rgba(100, 100, 100, 0.7)'
]

export default class ArticleTile extends Component {
  constructor(props) {
    super(props);
    this.state = {
      imageLoaded: false,
      loadSuccessful: false,
      size:150,
      infoVisible:false,
      failColors:false,
      showStartTime: ''
    }
  }

  shouldComponentUpdate(nextState){
    if(this.state===nextState){return false}
    else {return true}
  }

  componentDidMount(){
    this.setState({imageLoaded: true,loadSuccessful: true})
    if (this.props.size){
      this.setState({size:this.props.size})
    }
  }

  getLoadingFailColors(){
    if (this.state.failColors){
      return this.state.failColors
    }
    else{
      this.setState({failColors:COLOR_COMBOS[Math.floor(Math.random()*COLOR_COMBOS.length)]})
      return COLOR_COMBOS[Math.floor(Math.random()*COLOR_COMBOS.length)];
    }
  }

  renderStarRating(rating, size=12){
    if (!rating){return null}
    return(
      <View style={{flexDirection:'row', alignItems:'center'}}>
        <Text style={{fontFamily:FONTS.PRODUCT_SANS, color:COLORS_LIGHT_THEME.LIGHT,
          fontSize:size+1, marginRight:3, marginTop:2}}>
          {rating}
        </Text>
        <Icon
          type="font-awesome"
          name="star"
          color={COLORS_DARK_THEME.STAR_YELLOW}
          size={size}
        />
      </View>
    )
  }

  renderLinearGradient(){
    const {COLORS, data} = this.props;

    if (!this.state.imageLoaded){
      return (
        <View style={{flex:1, justifyContent:'center', alignItems:'center',
          backgroundColor:COLORS.LIGHT, 
          zIndex:100, height:this.state.size, width:this.state.size}}>
          <Loading size={64} white={(this.props.theme!=='light')}/>
        </View>
      );
    }
    if ((this.state.imageLoaded && !this.state.loadSuccessful) || !data.image){
      const imageSource = CATEGORY_IMAGES[data.category]
      return (
        <TouchableOpacity onPress={() => {
          analytics().logViewItem({
            item_id:data.article_id.toString(),
            item_category:data.category,
            item_name:data.topic
          })
          this.setState({infoVisible:true, showStartTime:Date.now()});
          logEvent(LOG_EVENT.SCREEN_CHANGE, 'articleinfo');
          }} 
          activeOpacity={1} style={{flex:1}}>
          <LinearGradient style={{flex:1,justifyContent:'space-between',padding:10,}}
            colors={this.getLoadingFailColors()}>
            <View style={{ justifyContent:'space-between', flex:1}}>
              <Text style={{...styles.TextStyleFail, color:COLORS_LIGHT_THEME.LIGHT}}>
                {data.topic}
              </Text>
              {this.renderStarRating(data.rating, 18)}
            </View>
            {
              (data.image)?
              (
                <Text style={{...styles.TextStyleImageFail, color:COLORS_LIGHT_THEME.LIGHT}}>
                  *Image could not load
                </Text>
              ):
              null
            }
            <ArticleInfo 
              onBackdropPress={() => {
                this.setState({infoVisible:false});
                logEvent(LOG_EVENT.TIME_IN_ARTICLE_INFO, {mili_seconds: Date.now()-this.state.showStartTime,
                endTime:Date.now()})
              }}
              isVisible = {this.state.infoVisible}
              article_id = {data.article_id}
              imageSource = {imageSource}
              loadSuccessful = {this.state.loadSuccessful}

              // for preview
              preview_contents = {data.preview_contents}
              topic = {data.topic}
              category = {data.category}
            />
          </LinearGradient>
        </TouchableOpacity>
      );
    }
    if (this.state.imageLoaded && this.state.loadSuccessful){
      return (
        <LinearGradient style={{flex:1, justifyContent:'flex-end' ,padding:10}} 
          colors={LG_SUCCESS}
          start={{x:1, y:0}} end={{x:1, y:1}}>
          <View style={{alignItems:'flex-start', flexDirection:'row', justifyContent:'space-between'}}>
            <Text style={{...styles.TextStyle, color:COLORS_LIGHT_THEME.LIGHT}}>
              {data.topic}
            </Text>
            {this.renderStarRating(data.rating)}
          </View>
        </LinearGradient>
      );
    }
  }

  render() {
    const {COLORS, data} = this.props;
    const imageSource = (data.image)?{uri:data.image}:CATEGORY_IMAGES[data.category]

    return(
      <TouchableOpacity activeOpacity={0.8}
        style={{overflow:'hidden',elevation:4, height:this.state.size, width:this.state.size*4/3, 
          backgroundColor:COLORS.LIGHT, borderRadius:10}} 
        onPress={() => {
        this.setState({infoVisible:true, showStartTime:Date.now()});
        logEvent(LOG_EVENT.SCREEN_CHANGE, 'articleinfo')}}>

        <Image source={imageSource}
          style={{flex:1}}
          onLoad = {() => {this.setState({imageLoaded: true,loadSuccessful: true})}}
          onError = {() => {this.setState({imageLoaded:true,loadSuccessful: false})}}>
          <ArticleInfo 
            theme={this.props.theme}
            onBackdropPress={() => {
              this.setState({infoVisible:false});
              logEvent(LOG_EVENT.TIME_IN_ARTICLE_INFO, {mili_seconds: Date.now()-this.state.showStartTime,
              endTime:Date.now()})
            }}
            isVisible = {this.state.infoVisible}
            article_id = {data.article_id}
            imageSource = {imageSource}
            loadSuccessful = {this.state.loadSuccessful}

            // for preview
            preview_contents = {data.preview_contents}
            topic = {data.topic}
            category = {data.category}
          />
          {this.renderLinearGradient()}
        </Image>
      </TouchableOpacity>
    );
  }
}

const styles = StyleSheet.create({
  TileViewStyle:{
    borderRadius:10,
    overflow:'hidden'
  },
  TextStyle:{
    fontFamily:FONTS.NOE_DISPLAY,
  },
  TextStyleFail:{
    fontFamily:FONTS.HELVETICA_NEUE,
    fontSize:20
  },
  TextStyleImageFail:{
    fontFamily:FONTS.RALEWAY_LIGHT,
    fontSize:9,
    bottom:5, left:7,
    position:'absolute'
  }
})