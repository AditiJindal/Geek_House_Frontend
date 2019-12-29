import React, {PureComponent} from 'react';
import { View, StyleSheet, Text, StatusBar,
  FlatList, ScrollView, TouchableNativeFeedback,
  TouchableOpacity}from 'react-native';
import {connect} from 'react-redux';
import {
  logout,
  toggleOverlay,
  getWelcome,
  setAuthToken,
  changeSelectedCategory,
  sendFavouriteCategory,
  showRealApp,
} from '../actions';
import Image from 'react-native-fast-image';
import {logEvent} from '../actions/ChatAction';
import {Dropdown} from '../components/Dropdown';
import LottieView from 'lottie-react-native'
import AppIntroSlider from '../components/AppIntroSlider/AppIntroSlider';
import ArticleTile from '../components/ArticleTile';
import {Overlay} from 'react-native-elements';
import Icon from 'react-native-vector-icons/Feather';
import {FONTS,COLORS_LIGHT_THEME, COLORS_DARK_THEME, LOG_EVENT} from '../Constants';
import LinearGradient from 'react-native-linear-gradient';
import RaisedText from '../components/RaisedText';
import BottomTab from '../components/BottomTab';
import ShimmerPlaceHolder from 'react-native-shimmer-placeholder'
import { Actions } from 'react-native-router-flux';
import changeNavigationBarColor from 'react-native-navigation-bar-color';
import ShadowView from 'react-native-simple-shadow-view';
import APP_INFO from '../../package.json';

const OVERLAY_WIDTH_PERCENT=75
class Home extends PureComponent {
  constructor() {
    super();
    this.slides = [];
  }

  componentDidMount(){
    this.props.setAuthToken();
    if (this.props.loading){
      this.props.getWelcome();
    }
    let new_data=[];
    this.props.categories.forEach((item) => {new_data.push({value:item})})
    this.slides = [
      {
        fullyCustom:true,
        source:(
          <View style={{flex:1, justifyContent:'center', alignItems:'center', backgroundColor:COLORS_LIGHT_THEME.LIGHT}}>
            <Text style={{fontFamily: FONTS.RALEWAY_LIGHT, fontSize:20, color:COLORS_LIGHT_THEME.DARK}}>WELCOME</Text>
            <Text style={{fontFamily: FONTS.RALEWAY_BOLD, fontSize:42, color:COLORS_LIGHT_THEME.LESSER_DARK}}>{this.props.data.name.split(' ')[0]}</Text>
          </View>
        )
      },
      {
        key: '1',
        title: 'What is Geek House?',
        customSource:true,
        text: 'Geek House is a knowledge\nplatform in simple terms',
        source: (
          <View style={{width:256, height:256, justifyContent:'center', alignItems:'center'}}>
            <Image
              style={{width:128, height:128}}
              source = {require('../../assets/images/welcome/light-bulb.png')}
            />
          </View>
        ),
        color:COLORS_LIGHT_THEME.LIGHT,
        boxColors: ["rgb(255, 218, 45)", "rgb(253, 191,0)"]
      },
      {
        key: '2',
        title: 'Before we Begin',
        customSource:true,
        text: 'Select your favourite category of topic from the given ones, you can change this easily in the settings later',
        source: (
          <View style={{width:256, height:256}}>
            <View style={{width:"100%", height:80, justifyContent:'center'}}>
              <Dropdown
                theme={this.props.theme}
                data = {new_data}
                label = "Category Selection"
                itemColor={COLORS_LIGHT_THEME.LESS_DARK}
                value="Categories"
                fontSize={20}
                labelFontSize={14}
                itemCount={6}
                containerStyle={{marginVertical:15, width:"100%",justifyContent:'center', alignItems:'center'}}
                itemTextStyle={{fontFamily:FONTS.PRODUCT_SANS}}
                textColor={COLORS_LIGHT_THEME.LESS_DARK}
                textSubColor={COLORS_LIGHT_THEME.LIGHT_GRAY}
                itemPadding={6}
                pickerStyle={{elevation:20, borderRadius:25, flex:1, paddingHorizontal:10,
                  backgroundColor:COLORS_LIGHT_THEME.LIGHT}}
                onChangeText={(selected_category) => {this.props.changeSelectedCategory(selected_category)}}
              />
            </View>
          </View>
        ),
        color:COLORS_LIGHT_THEME.LIGHT,
        boxColors: ["#ec008c", "#fc6767"]
      },
      {
        key: '3',
        title: 'Conpect of Articles',
        text: 'You can simply search the articles of your choice and read them. You can also write your own articles',
        source: require('../../assets/animations/welcome/book.json'),
        color:COLORS_LIGHT_THEME.LIGHT,
        boxColors: ["#4776E6", '#3931ac']//"#8E54E9"]
      },
      {
        key: '4',
        title: 'Get in Touch',
        text: 'Geek House lets you chat with people having similar interest ar yours, so you can never stop talking',
        source: require('../../assets/animations/welcome/chat.json'),
        color:COLORS_LIGHT_THEME.LIGHT,
        boxColors: ["#2193b0", "#6dd5ed"]
      }
    ];
  }

  getInitials(name){
    if (!name){return null}
    let initials = name.match(/\b\w/g) || [];
    initials = ((initials.shift() || '') + (initials.pop() || '')).toUpperCase();
    return initials
  }

  renderOverlay(){
    return (
      <Overlay isVisible={this.props.overlayVisible}
        borderRadius={20}
        overlayBackgroundColor={(this.props.theme==='light')?COLORS_LIGHT_THEME.LIGHT:COLORS_DARK_THEME.LIGHT}              
        onBackdropPress={()=>{this.props.toggleOverlay({overlayVisible:false})}}
        width={`${OVERLAY_WIDTH_PERCENT}%`}
        height="auto">
        <View>
          <View style={{justifyContent:'space-around', alignItems:'center', flexDirection:'row', }}>
            <Image
              source={{uri:this.props.data.image_url}}
              style={{marginRight:10, marginBottom:15, height:64, width:64, borderRadius:32}}
            />
            <Text style={{...styles.AvatarTextStyle, 
              color:(this.props.theme==='light')?COLORS_LIGHT_THEME.DARK:COLORS_DARK_THEME.DARK}}>
              {this.props.data.name}
            </Text>
          </View>
          <View>
            <View style={{justifyContent:'space-around', flexDirection:'row'}}>
              <TouchableOpacity
                onPress={() => {this.props.toggleOverlay({overlayVisible:false});Actions.jump('settings'); logEvent(LOG_EVENT.SCREEN_CHANGE, 'settings');}}
                style={{marginTop:15, elevation:3, justifyContent:'space-between',
                justifyContent:'center', alignItems:'center', flexDirection:'row', 
                backgroundColor:(this.props.theme==='light')?COLORS_LIGHT_THEME.LIGHT:COLORS_DARK_THEME.LESSER_LIGHT, alignSelf:'flex-end', padding:8, borderRadius:10}}
              >
                <Icon name="settings" color={(this.props.theme==='light')?COLORS_LIGHT_THEME.DARK:COLORS_DARK_THEME.DARK} size={28}/>
                <Text style={{...styles.LogoutButtonTextStyle, color:(this.props.theme==='light')?COLORS_LIGHT_THEME.DARK:COLORS_DARK_THEME.DARK}}>settings</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {this.props.toggleOverlay({overlayVisible:false});Actions.jump('about'); logEvent(LOG_EVENT.SCREEN_CHANGE, 'about');}}
                style={{marginTop:15, elevation:3, justifyContent:'space-between',
                justifyContent:'center', alignItems:'center', flexDirection:'row', 
                backgroundColor:(this.props.theme==='light')?COLORS_LIGHT_THEME.LIGHT:COLORS_DARK_THEME.LESSER_LIGHT, alignSelf:'flex-end', padding:8, borderRadius:10}}
              >
                <Icon name="user" color={(this.props.theme==='light')?COLORS_LIGHT_THEME.DARK:COLORS_DARK_THEME.DARK} size={28}/>
                <Text style={{...styles.LogoutButtonTextStyle, marginLeft:10, color:(this.props.theme==='light')?COLORS_LIGHT_THEME.DARK:COLORS_DARK_THEME.DARK}}>about us</Text>
              </TouchableOpacity>
            </View>
            <View style={{justifyContent:'space-around', flexDirection:'row'}}>
              <TouchableOpacity
                onPress={() => {this.props.toggleOverlay({overlayVisible:false});Actions.jump('feedback'); logEvent(LOG_EVENT.SCREEN_CHANGE, 'feedback');}}
                style={{marginTop:15, elevation:3, justifyContent:'space-between',flex:1,margin:10,
                justifyContent:'center', alignItems:'center', flexDirection:'row', 
                backgroundColor:(this.props.theme==='light')?COLORS_LIGHT_THEME.LIGHT:COLORS_DARK_THEME.LESSER_LIGHT, padding:8, borderRadius:10}}
              >
                <Icon name="message-square" color={(this.props.theme==='light')?COLORS_LIGHT_THEME.DARK:COLORS_DARK_THEME.DARK} size={22}/>
                <Text style={{...styles.LogoutButtonTextStyle, fontSize:14,
                  color:(this.props.theme==='light')?COLORS_LIGHT_THEME.DARK:COLORS_DARK_THEME.DARK}}>feedback</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {this.props.toggleOverlay({overlayVisible:false});Actions.jump('about'); logEvent(LOG_EVENT.SCREEN_CHANGE, 'about');}}
                style={{marginTop:15, elevation:3, justifyContent:'space-between',flex:1, margin:10,marginLeft:12,
                justifyContent:'center', alignItems:'center', flexDirection:'row', 
                backgroundColor:(this.props.theme==='light')?COLORS_LIGHT_THEME.LIGHT:COLORS_DARK_THEME.LESSER_LIGHT, padding:8, borderRadius:10}}
              >
                <Icon name="share-2" color={(this.props.theme==='light')?COLORS_LIGHT_THEME.DARK:COLORS_DARK_THEME.DARK} size={24}/>
                <Text style={{...styles.LogoutButtonTextStyle, marginLeft:10, color:(this.props.theme==='light')?COLORS_LIGHT_THEME.DARK:COLORS_DARK_THEME.DARK}}>
                  about us
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Overlay>
    )
  }

  renderAvatar(){
    // console.log("Url: ", this.props.data.image_url)
    if (this.props.overlayVisible){
      return <View/>
    }
    else{
      return(
        <View style={{borderRadius:30, padding:2, 
          backgroundColor:(this.props.theme==='light')?COLORS_LIGHT_THEME.LIGHT:COLORS_DARK_THEME.LIGHT, elevation:4}}>
          <TouchableOpacity onPress={this.props.toggleOverlay.bind(this, {overlayVisible:true})}>
            <Image
              source={{uri:this.props.data.image_url}}
              style={{height:48, width:48, borderRadius:24}}/>
          </TouchableOpacity>
        </View>
      )
    }
  }

  renderWelcome(){
    const {
      welcome_header,
      welcome_body
    } = this.props.welcomeData
    return (
      <View style={{justifyContent:'flex-start', alignItems:'flex-end', zIndex:100}}>
        <View style={{zIndex:120}}>
          <ShimmerPlaceHolder colorShimmer={(this.props.theme==='light')?COLORS_LIGHT_THEME.SHIMMER_COLOR:COLORS_DARK_THEME.SHIMMER_COLOR} autoRun={true} visible={!this.props.loading} 
            style={{height:50, borderRadius:6, marginRight:25, marginTop:15, elevation:6}} duration={650}>
              <RaisedText text = {welcome_header} animationEnabled = {this.props.animationOn} 
              theme={this.props.theme} secondaryText={'स्वागत'}/>
          </ShimmerPlaceHolder>
        </View>
        {
          (this.props.loading)?
          <View style={{justifyContent:'flex-end', alignItems:'flex-end', padding:10, marginRight:15}}>
            <ShimmerPlaceHolder colorShimmer={(this.props.theme==='light')?COLORS_LIGHT_THEME.SHIMMER_COLOR:COLORS_DARK_THEME.SHIMMER_COLOR} style={{marginBottom:5, width:230, borderRadius:4, height:18, elevation:5}} autoRun={true} duration={700}/>
            <ShimmerPlaceHolder colorShimmer={(this.props.theme==='light')?COLORS_LIGHT_THEME.SHIMMER_COLOR:COLORS_DARK_THEME.SHIMMER_COLOR} style={{marginBottom:5, width:190, borderRadius:4, height:18, elevation:5}} autoRun={true} duration={900}/>
            <ShimmerPlaceHolder colorShimmer={(this.props.theme==='light')?COLORS_LIGHT_THEME.SHIMMER_COLOR:COLORS_DARK_THEME.SHIMMER_COLOR} style={{marginBottom:5, width:180, borderRadius:4, height:18, elevation:5}} autoRun={true} duration={1100}/>
            <ShimmerPlaceHolder colorShimmer={(this.props.theme==='light')?COLORS_LIGHT_THEME.SHIMMER_COLOR:COLORS_DARK_THEME.SHIMMER_COLOR} style={{marginBottom:5, width:250, borderRadius:4, height:18, elevation:5}} autoRun={true} duration={1300}/>
          </View>:
          <View style={{flex:1, padding:15}}>
            <View style={{borderColor:(this.props.theme==='light')?COLORS_LIGHT_THEME.LIGHT_GRAY:COLORS_DARK_THEME.LIGHT_GRAY,borderBottomWidth:0.5, padding:15, zIndex:0}}>
              <Text style={{...styles.WelcomeBody, 
              color:(this.props.theme==='light')?COLORS_LIGHT_THEME.LESS_DARK:COLORS_DARK_THEME.LESS_DARK}}>
              {welcome_body}
            </Text>
            </View>
          </View>
        }
      </View>
    )
  }

  renderArticleTiles(){
    data_list = this.props.welcomeData.popular_topics;
    return(
      <FlatList data={data_list}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(x) => x.article_id.toString()}
        renderItem = {({item}) => {
          return (
            <View style={{marginVertical:15, marginHorizontal:5}}>
              <ArticleTile data={item} size={180} theme={this.props.theme}/>
            </View>
          )
        }}
      />
    )
  }

  renderPopularArticles(){
    return(
      <View style={{justifyContent:'flex-start', alignItems:'flex-end',paddingTop:0, flex:1}}>
        <ShimmerPlaceHolder colorShimmer={(this.props.theme==='light')?COLORS_LIGHT_THEME.SHIMMER_COLOR:COLORS_DARK_THEME.SHIMMER_COLOR} autoRun={true} visible={!this.props.loading}
          style={{height:50, borderRadius:6, elevation:6,
          marginRight:25, marginTop:5}} duration={750}>
          <RaisedText text={"Popular Articles"} animationEnabled = {this.props.animationOn} 
          theme={this.props.theme} secondaryText={'लोकप्रिय लेख'}/>
        </ShimmerPlaceHolder>
        {
          (this.props.loading)?
          <ScrollView horizontal={true} showsHorizontalScrollIndicator={false}>
            <ShimmerPlaceHolder colorShimmer={(this.props.theme==='light')?COLORS_LIGHT_THEME.SHIMMER_COLOR:COLORS_DARK_THEME.SHIMMER_COLOR} visible={false} style={{width:175, height:175, borderRadius:8,margin:15, marginHorizontal:5, elevation:3}}/>
            <ShimmerPlaceHolder colorShimmer={(this.props.theme==='light')?COLORS_LIGHT_THEME.SHIMMER_COLOR:COLORS_DARK_THEME.SHIMMER_COLOR} visible={false} style={{width:175, height:175, borderRadius:8,margin:15, marginHorizontal:5, elevation:3}}/>
            <ShimmerPlaceHolder colorShimmer={(this.props.theme==='light')?COLORS_LIGHT_THEME.SHIMMER_COLOR:COLORS_DARK_THEME.SHIMMER_COLOR} visible={false} style={{width:175, height:175, borderRadius:8,margin:15, marginHorizontal:5, elevation:3}}/>
          </ScrollView>:
          this.renderArticleTiles()
        }
      </View>
    )
  }

  renderHome(){
    if (this.props.error){
      return (
        this.renderError()
      )
    }
    return (
      <ScrollView showsVerticalScrollIndicator={false}>
        {this.renderWelcome()}
        {this.renderPopularArticles()}
        <View style={{height:50}}/>
      </ScrollView>
    )
  }

  renderError(){
    return (
      <View style={{flex:1, justifyContent:'center', alignItems:'center', padding:40}}>
        <Text style={{...styles.ErrorTextStyle,
        color:(this.props.theme==='light')?COLORS_LIGHT_THEME.GRAY:COLORS_DARK_THEME.GRAY}}>
          {this.props.error}
        </Text>
        <TouchableNativeFeedback onPress={() => {this.props.getWelcome();}}>
          <LinearGradient style={{justifyContent:'center', alignItems:'center', 
            padding:10, elevation:7, backgroundColor:(this.props.theme==='light')?COLORS_LIGHT_THEME.LIGHT_BLUE:COLORS_DARK_THEME.LIGHT_BLUE, borderRadius:8, margin:15}}
            colors={[COLORS_LIGHT_THEME.LIGHT_BLUE, COLORS_LIGHT_THEME.DARK_BLUE]}>
            <Text style={{fontFamily:FONTS.HELVETICA_NEUE, fontSize:24, color:COLORS_LIGHT_THEME.LIGHT}}>{'Retry'}</Text>
          </LinearGradient>
        </TouchableNativeFeedback>        
      </View>
    )
  }

  _renderItem(item){
    if (item.fullyCustom){
      return item.source
    }
    return (
      <View style={{flex:1, justifyContent:'space-around', alignItems:'center', backgroundColor:item.color}}>
        <Text style={{fontFamily:FONTS.RALEWAY, color:COLORS_LIGHT_THEME.LESSER_DARK, fontSize:24}}>{item.title}</Text>
        {
          (item.customSource)?
          item.source:
          <LottieView autoPlay source={item.source} style={{height:256, width:256}}/>
        }
        <LinearGradient
          start={{x:0, y:1}} end={{x:1, y:1}}
          colors={item.boxColors}
          style={{
            backgroundColor:COLORS_LIGHT_THEME.LIGHT, height:150, width:"80%", justifyContent:'center', alignItems:'center',
            borderRadius:8, marginBottom:40, paddingHorizontal:15}}>
          <Text style={{fontFamily:FONTS.LATO_BOLD, color:COLORS_LIGHT_THEME.LIGHT, fontSize:18, textAlign:'center'}}>{item.text}</Text>
        </LinearGradient>
      </View>
    );
  }

  _renderNextButton(){
    return(
      <View style={{padding:10, borderWidth:2, borderColor:"#f953c6", borderRadius:10, elevation:4, backgroundColor:COLORS_LIGHT_THEME.LIGHT}}>
        <Text style={{fontFamily:FONTS.GOTHAM_BLACK, color:"#f953c6"}}>NEXT</Text>
      </View>
    )
  }

  _renderDoneButton(){
    return(
      <View style={{padding:10, borderWidth:2, borderColor:"#32cd32", borderRadius:10, elevation:4, backgroundColor:COLORS_LIGHT_THEME.LIGHT}}>
        <Text style={{fontFamily:FONTS.GOTHAM_BLACK, color:"#32cd32"}}>DONE</Text>
      </View>
    )
  }

  _onDone(){    
    if (this.props.selected_category){
      this.props.showRealApp()
      this.props.sendFavouriteCategory(this.props.selected_category)
    }
    else{
      this.appIntroSlider.goToSlide(2)
    }
  }

  renderTour(){
    return (
      <View style={{flex:1, backgroundColor:COLORS_LIGHT_THEME.LIGHT}}>
        <StatusBar 
          barStyle={'dark-content'}
          backgroundColor={COLORS_LIGHT_THEME.LIGHT}/>
        {changeNavigationBarColor(COLORS_LIGHT_THEME.LIGHT, (this.props.theme==='light'))}
        <AppIntroSlider 
          ref={(appIntroSlider) => this.appIntroSlider = appIntroSlider}
          renderItem={({item})=>this._renderItem(item)} 
          slides={this.slides}
          activeDotStyle={{backgroundColor:COLORS_LIGHT_THEME.LIGHT_BLUE}}
          renderNextButton={this._renderNextButton}
          renderDoneButton={this._renderDoneButton}
          onDone={()=>this._onDone()}/>
      </View>
      )
  }

  getStatusBarColor(){
    let statusBarColor = (this.props.theme==='light')?COLORS_LIGHT_THEME.LIGHT:COLORS_DARK_THEME.LIGHT
    if (this.props.overlayVisible){
      statusBarColor = (this.props.theme==='light')?COLORS_LIGHT_THEME.OVERLAY_COLOR:COLORS_DARK_THEME.OVERLAY_COLOR
    }
    return statusBarColor
  }

  render() {
    if (this.props.showRealAppValue || !this.props.first_login){
      return(
      <View style={{flex:1, backgroundColor:(this.props.theme==='light')?COLORS_LIGHT_THEME.LIGHT:COLORS_DARK_THEME.LIGHT}}>
        <StatusBar 
          barStyle={(this.props.theme==='light')?'dark-content':'light-content'}
          backgroundColor={this.getStatusBarColor()}/>
        {changeNavigationBarColor(this.getStatusBarColor(), (this.props.theme==='light'))}
        <ShadowView style={{...styles.GeekHouseView,
          backgroundColor:(this.props.theme==='light')?COLORS_LIGHT_THEME.LIGHT:COLORS_DARK_THEME.LESS_LIGHT}}>
          <Text style={{...styles.TextStyle, 
            color:(this.props.theme==='light')?COLORS_LIGHT_THEME.DARK:COLORS_DARK_THEME.DARK}}>
            home {APP_INFO.version}
          </Text>
          {this.renderAvatar()}
        </ShadowView>
        {this.renderOverlay()}
        {this.renderHome()}
        <View style={{bottom:50, height:0}}>
          <BottomTab icon_index={0}/>
        </View>
      </View>
      );
    }
    else{
      return this.renderTour();
    }
  }
}

const mapStateToProps = (state) => {
  return {
    data: state.login.data,
    authtoken: state.login.authtoken,
    categories: state.login.categories,
    first_login: state.login.first_login,

    overlayVisible: state.home.overlayVisible,
    welcomeData: state.home.welcomeData,
    loading: state.home.loading,
    error: state.home.error,
    selected_category: state.home.selected_category,
    showRealAppValue: state.home.showRealApp,

    theme: state.chat.theme,

    animationOn: state.chat.animationOn
  }
}

export default connect(mapStateToProps, {
  logout, 
  toggleOverlay, 
  getWelcome, 
  setAuthToken, 
  changeSelectedCategory,
  sendFavouriteCategory,
  showRealApp
})(Home);

const styles = StyleSheet.create({
  TextStyle:{
    fontSize:28,
    fontFamily:FONTS.GOTHAM_BLACK,
  },
  AvatarTextStyle:{
    fontSize:22,
    fontFamily:FONTS.RALEWAY_LIGHT,
  },
  LogoutButtonTextStyle:{
    color:COLORS_LIGHT_THEME.LIGHT,
    fontFamily:FONTS.RALEWAY_BOLD,
    fontSize:16,
    marginLeft:8
  },
  WelcomeBody:{
    fontFamily:FONTS.HELVETICA_NEUE,
    fontSize:16,
    textAlign:'justify',   
  },
  ErrorTextStyle:{
    fontFamily:FONTS.RALEWAY_LIGHT,
    fontSize:24,
    textAlign:'center'
  },
  GeekHouseView:{
    shadowColor:'#202020',
    shadowOpacity:0.3, 
    shadowOffset:{width:0,height:10},
    shadowRadius:8,
    borderRadius:10,
    margin:8, 
    height:70, 
    justifyContent:'space-between',
    alignItems:'center', 
    flexDirection:'row', 
    paddingHorizontal:25
  }
})