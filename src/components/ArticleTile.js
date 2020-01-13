import React, {Component} from 'react';
import { Text, StyleSheet, TouchableOpacity, View}from 'react-native';
import Loading from './Loading'
import ArticleInfo from './ArticleInfo';
import {logEvent} from '../actions/ChatAction';
import Image from 'react-native-fast-image';
import {FONTS,COLOR_COMBOS, LOG_EVENT, COLORS_LIGHT_THEME} from '../Constants';
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

  renderLinearGradient(){
    const {COLORS} = this.props;
    if (!this.state.imageLoaded){
      return (
        <View style={{flex:1, justifyContent:'center', alignItems:'center', borderRadius:10, 
          backgroundColor:COLORS.LIGHT, 
          zIndex:100, height:this.state.size, width:this.state.size}}>
          <Loading size={64} white={(this.props.theme!=='light')}/>
        </View>
      );
    }
    if ((this.state.imageLoaded && !this.state.loadSuccessful) || !this.props.data.image){
      return (
        <TouchableOpacity onPress={() => {
          analytics().logViewItem({
            item_id:this.props.data.article_id,
            item_category:this.props.data.category,
            item_name:this.props.data.topic
          })
          this.setState({infoVisible:true, showStartTime:Date.now()});
          logEvent(LOG_EVENT.SCREEN_CHANGE, 'articleinfo');
          }} 
          activeOpacity={1} style={{flex:1}}>
          <LinearGradient style={{flex:1,justifyContent:'space-between',padding:10, borderRadius:10}}
            colors={this.getLoadingFailColors()}>
            <Text style={{...styles.TextStyleFail, color:COLORS_LIGHT_THEME.LIGHT}}>
              {this.props.data.topic}
            </Text>
            {
              (this.props.data.image)?
              (
                <Text style={{...styles.TextStyleImageFail, color:COLORS_LIGHT_THEME.LIGHT}}>
                  *Image could not load
                </Text>
              ):
              <View/>
            }
            <ArticleInfo 
              onBackdropPress={() => {
                this.setState({infoVisible:false});
                logEvent(LOG_EVENT.TIME_IN_ARTICLE_INFO, {mili_seconds: Date.now()-this.state.showStartTime,
                endTime:Date.now()})
              }}
              isVisible = {this.state.infoVisible}
              article_id = {this.props.data.article_id}
              article_image = {this.props.data.image}
              loadSuccessful = {this.state.loadSuccessful}

              // for preview
              preview_contents = {this.props.data.preview_contents}
              topic = {this.props.data.topic}
              category = {this.props.data.category}
            />
          </LinearGradient>
        </TouchableOpacity>
      );
    }
    if (this.state.imageLoaded && this.state.loadSuccessful){
      return (
        <LinearGradient style={{flex:1, justifyContent:'flex-end' ,padding:10, borderRadius:10}} 
          colors={LG_SUCCESS}
          start={{x:1, y:0}} end={{x:1, y:1}}>
          <Text style={{...styles.TextStyle, color:COLORS_LIGHT_THEME.LIGHT}}>
            {this.props.data.topic}
          </Text>
        </LinearGradient>
      );
    }
  }

  render() {
    const {COLORS} = this.props; 
    return(
      <TouchableOpacity onPress={() => {
        this.setState({infoVisible:true, showStartTime:Date.now()});
        logEvent(LOG_EVENT.SCREEN_CHANGE, 'articleinfo');
        }} 
        activeOpacity={1}>
        <View style={{...styles.TileViewStyle, height:this.state.size, width:this.state.size, 
          backgroundColor:COLORS.LIGHT}} 
          renderToHardwareTextureAndroid>
          {(this.props.data.image)?
          (
            <Image source={{uri:this.props.data.image}}
              style={{height:this.state.size, width:this.state.size,borderRadius:10}}
              blurRadius={0.15} resizeMode="cover"
              onLoadEnd = {() => {console.log('Image loaded successfully');this.setState({imageLoaded: true,loadSuccessful: true})}}
              onError = {() => {console.log('Error loading');this.setState({imageLoaded: false,loadSuccessful: false})}}>
              <ArticleInfo 
                theme={this.props.theme}
                onBackdropPress={() => {
                  this.setState({infoVisible:false});
                  logEvent(LOG_EVENT.TIME_IN_ARTICLE_INFO, {mili_seconds: Date.now()-this.state.showStartTime,
                  endTime:Date.now()})
                }}
                isVisible = {this.state.infoVisible}
                article_id = {this.props.data.article_id}
                article_image = {this.props.data.image}
                loadSuccessful = {this.state.loadSuccessful}

                // for preview
                preview_contents = {this.props.data.preview_contents}
                topic = {this.props.data.topic}
                category = {this.props.data.category}
              />
              {this.renderLinearGradient()}
            </Image>
          ):
          this.renderLinearGradient()}
        </View>
      </TouchableOpacity>
    );
  }
}

const styles = StyleSheet.create({
  TileViewStyle:{
    elevation:4,
    borderRadius:10,
    overflow:'hidden'
  },
  TextStyle:{
    fontFamily:FONTS.HELVETICA_NEUE,
  },
  TextStyleFail:{
    fontFamily:FONTS.HELVETICA_NEUE,
    fontSize:20
  },
  TextStyleImageFail:{
    fontFamily:FONTS.LATO,
    fontSize:10
  }
})