import React, {Component} from 'react';
import { View, Text, StyleSheet, StatusBar, Share,
  Animated, TextInput,Dimensions, TouchableOpacity} from 'react-native';
import _ from 'lodash';
import {connect} from 'react-redux';
import {Overlay,Icon} from 'react-native-elements';
import StarRating from 'react-native-star-rating';
import LinearGradient from 'react-native-linear-gradient';
import {getArticleInfo, setAuthToken, submitComment, bookmarkArticle} from '../actions/ArticleInfoAction';
import {FONTS, COLOR_COMBOS, COLORS_LIGHT_THEME, COLORS_DARK_THEME} from '../Constants';
import CardView from './CardView';
import Loading from './Loading';
import NativeAdsComponent from './NativeAdsComponent';
import Image from 'react-native-fast-image';
import changeNavigationBarColor from 'react-native-navigation-bar-color';
import TimedAlert from './TimedAlert';
import Ripple from './Ripple';

const screenWidth = Dimensions.get('screen').width
const OVERLAY_WIDTH_PERCENT=88
const HEADER_MAX_HEIGHT = Math.floor(screenWidth * (OVERLAY_WIDTH_PERCENT/100)) *0.75;
const HEADER_MIN_HEIGHT = 70;
const PROFILE_IMAGE_MAX_HEIGHT = 76;
const BORDER_RADIUS=25 // PROFILE_IMAGE_MAX_HEIGHT/2;
const TOPIC_SMALL_SIZE=18
const ATouchable = Animated.createAnimatedComponent(TouchableOpacity)

class ArticleInfo extends Component {

  constructor() {
    super();
    this.state = {
      scrollY: new Animated.Value(0),
      userCommentRating:-1,
      commentText:"",
      adIndex: 0,
      imageViewerActive: false
    };
  }

  componentDidMount(){
    if (this.props.article_id!==-1){
      this.props.setAuthToken()
    }
  }

  renderCardViews(cards){

    if (!this.state.adIndex && cards){
      this.setState({adIndex: _.random(1, cards.length-1)})
    }

    if (cards){
      return (
        <View>
          {cards.map(
            (item, i) => {
              return (
              <View key={i.toString()}>
                {(i===this.state.adIndex && this.props.adsManager && this.props.canShowAdsRemote)?
                  <NativeAdsComponent theme={this.props.theme}
                  COLORS = {this.props.COLORS} adsManager={this.props.adsManager} />:
                  null
                }
                <CardView 
                  theme={this.props.theme}
                  COLORS = {COLORS}
                  key={item.sub_heading}
                  cardData={item}
                  image_adder={this.props.image_adder}
                />
              </View>
              )
            }
          )}
        </View>
      )
    }
  }

  getInitials(name){
    if (!name){return null}
    let initials = name.match(/\b\w/g) || [];
    initials = ((initials.shift() || '') + (initials.pop() || '')).toUpperCase();
    return initials
  }

  imageUrlCorrector(image_url){
    if (!this.props.image_adder){return ''}
    if (image_url.substring(0,4) !== 'http'){
      image_url = this.props.image_adder + image_url
    }
    return image_url
  }

  showStarRating(){
    if (this.props.selectedArticleInfo.cannotComment){
      return null
    }
    const {COLORS} = this.props

    return (
      <StarRating
        selectedStar={(rating)=>{this.setState({userCommentRating:rating})}}
        activeOpacity={0.8}
        maxStars={5}
        rating={this.state.userCommentRating}
        halfStarEnabled={true}
        emptyStarColor={(this.props.theme==='light')?COLORS.LESS_LIGHT:COLORS.GRAY}
        halfStarColor={COLORS.STAR_YELLOW}
        fullStarColor={COLORS.STAR_YELLOW}
        starSize={28}
        containerStyle={{marginLeft:10, marginTop:5}}
        emptyStar={'star-o'}
        fullStar={'star'}
        halfStar={'star-half-o'}
      />
    )
  }

  renderCommentBox(){
    const {COLORS,  userData} = this.props

    return (
      <View>
        <View style={{
          backgroundColor:COLORS.LESSER_LIGHT, 
          padding:10, borderRadius:10, marginBottom:15}}>
          <TextInput
            value={this.state.commentText}
            onChangeText={(text)=>{this.setState({commentText:text})}}
            textAlignVertical='top'
            keyboardAppearance="light"
            placeholderTextColor={COLORS.GRAY}
            numberOfLines={4}
            maxLength={2048}
            spellCheck={true}
            autoCapitalize="sentences"
            autoCorrect={true}
            multiline={true}
            placeholder={"What are your thoughts on this article..."}
            returnKeyType={"done"}
            style={{fontFamily:FONTS.LATO, fontSize:16, 
            color:COLORS.DARK}}
          />
          {this.showStarRating()}
          
        </View>
          <TouchableOpacity
            style={{backgroundColor:COLORS.GREEN, 
              alignSelf:'flex-end', padding:10, borderRadius:30,elevation:7, margin:15}}
            onPress={()=>{
              if (this.state.userCommentRating!==-1 || this.state.commentText){
                this.props.submitComment({
                  rating:this.state.userCommentRating,
                  comment: this.state.commentText,
                  article_id: this.props.article_id
                }, userData.name, userData.image_url)
              }
              else{
                this.timedAlert.showAlert(2000,"Please provide a rating or comment")
              }
            }}>
            <Icon
              name='send'
              activeOpacity={0}
              type='material-community'
              color={COLORS_LIGHT_THEME.LIGHT}
              size={20}
            />
          </TouchableOpacity>
          
      </View>
    )
  }

  renderOptions(){
    const {COLORS, selectedArticleInfo} = this.props;

    if ((this.props.article_id===-1) || this.props.selectedArticleInfo.my_article || this.props.selectedArticleInfo.cannotComment){
      return null;
    }
    const { bookmarked } = this.props.selectedArticleInfo;
    return(
      <View style={{flexDirection:'row', alignItems:'center', justifyContent:'center', marginTop:15}}>
        <Ripple rippleContainerBorderRadius={7} style={{borderColor:(bookmarked)?COLORS.STAR_YELLOW:COLORS.LESSER_DARK,
          borderWidth:1.2, paddingVertical:10, borderRadius:7,
          alignItems:'center', flexDirection:'row', width:130, justifyContent:'space-evenly',
          alignSelf:'flex-start', marginVertical:10, elevation:4, backgroundColor:COLORS.LIGHT}}
          onPress = {()=>{this.props.bookmarkArticle(this.props.article_id, bookmarked)}}>
          <Icon name={(bookmarked)?"bookmark":"bookmark-border"} type="material" 
          size={20} color={(bookmarked)?COLORS.STAR_YELLOW:COLORS.LESSER_DARK}/>
          <Text style={{fontFamily:FONTS.RALEWAY, color:(bookmarked)?COLORS.STAR_YELLOW:COLORS.LESSER_DARK,
          fontSize:(bookmarked)?10.5:13}}>
            {(bookmarked)?'Bookmarked':'Bookmark'}
          </Text>
        </Ripple>
        <TouchableOpacity activeOpacity={1} style={{borderColor:COLORS.GREEN,
          paddingHorizontal:15,borderWidth:1.2, paddingVertical:10, borderRadius:7,
          alignItems:'center', flexDirection:'row', width:130, justifyContent:'space-evenly',
          alignSelf:'flex-start', marginVertical:10, marginLeft:20, elevation:4, backgroundColor:COLORS.GREEN}}
          onPress = {()=>{
            Share.share({message:`View my article on ${selectedArticleInfo.topic} in Geek House using this link ${selectedArticleInfo.dynamicLink}`})
          }}>
          <Icon name={"share"} type="material" 
            size={20} color={COLORS.LIGHT}/>
          <Text style={{fontFamily:FONTS.RALEWAY, color:COLORS.LIGHT,
          fontSize:13}}>
            Share
          </Text>
        </TouchableOpacity>
      </View>
    )
  }

  renderComments(comments){
    const {COLORS} = this.props;
    if (this.props.selectedArticleInfo.cannotComment){
      return null
    }
    return (
      <View style={{marginTop:20}}>
        <Text style={{fontSize:32, 
          fontFamily:FONTS.GOTHAM_BLACK, 
          color:COLORS.LESS_DARK, 
          marginLeft:15}}>Comments</Text>

        <View style={{
            backgroundColor:(this.props.theme==='light')?COLORS.LIGHT:COLORS.LESS_LIGHT, 
            borderColor:COLORS_DARK_THEME.GRAY, borderWidth:2,elevation:3,
            borderRadius:15, padding:10, margin:10}}>
          {
            (this.props.selectedArticleInfo.my_article)?
            null:
            this.renderCommentBox()
          }
          
          {
            (comments && comments.length!==0)?
            (
              comments.map(
                (item, index) => {
                  if (!item.rating){
                    item.rating=0
                  }
                  return (
                    <View key={index.toString()}>
                      <View style={{flexDirection:'row', alignItems:'center'}}>
                        <Image
                          source={{uri:this.imageUrlCorrector(item.author_image)}}
                          style={{height:48, width:48, borderRadius:25, marginRight:20}}
                        />
                        <View style={{flex:1, justifyContent:'space-evenly', alignItems:'flex-start'}}>
                          <Text style={{fontFamily:FONTS.HELVETICA_NEUE, fontSize:18,
                            color: COLORS.LESSER_DARK}}>
                            {item.author}
                          </Text>
                          {
                            (item.rating)?(
                              <StarRating
                                activeOpacity={0.8}
                                maxStars={item.rating}
                                disabled={true}
                                showRating={true}
                                rating={item.rating}
                                emptyStarColor={(this.props.theme==='light')?COLORS.LESS_LIGHT:COLORS.GRAY}
                                halfStarColor={COLORS.STAR_YELLOW}
                                fullStarColor={COLORS.STAR_YELLOW}
                                starSize={14}
                                emptyStar={'star'}
                                fullStar={'star'}
                                halfStar={'star-half-o'}
                              />
                            ):null
                          }
                        </View>
                      </View>
                      <Text style={{fontFamily:FONTS.HELVETICA_NEUE, textAlign:'justify',
                        fontSize:14, marginTop:10, marginHorizontal:10,
                        color:COLORS.LESSER_DARK}}>
                        {item.comment}
                      </Text>
                      {
                        (index===comments.length-1)?
                        null:
                        <View style={{width:"100%", height:0.5, marginTop:6, marginBottom:10,
                          backgroundColor:COLORS.LESS_LIGHT, borderRadius:1}}/>
                      }
                    </View>
                  )
                }
              )
            ):
            (
              <View style={{flexDirection:'row', justifyContent:'center', alignItems:'center'}}>
                <Icon type='material-community' name="comment-outline" size={18} 
                  color={COLORS.LESS_DARK}/>
                <Text style={{fontFamily:FONTS.LATO, fontSize:16, margin:10,
                  color:COLORS.LESS_DARK}}>
                  {
                    (!this.props.selectedArticleInfo.my_article)?
                    'Be the first to comment':
                    'No comments yet'
                  }
                </Text>
                
              </View>
            )
          }
        </View>
      </View>
    )

  }

  getGradientColor(){
    return COLOR_COMBOS[Math.floor(Math.random()*COLOR_COMBOS.length)];
  }

  convertTopic(topic){
    if (topic){
      if (topic.length<22){
        return topic.toUpperCase()
      }
      else{
        return topic.slice(0,20).toUpperCase() + '...'
      }
    }
  }

  renderArticle(){
    const {COLORS} = this.props;
    const {author, cards, views, category, comments, author_image,
      rating, topic} = this.props.selectedArticleInfo;
    
    const headerHeight = this.state.scrollY.interpolate({
      inputRange: [0, HEADER_MAX_HEIGHT - HEADER_MIN_HEIGHT],
      outputRange: [0, -HEADER_MAX_HEIGHT+HEADER_MIN_HEIGHT],
      extrapolate: 'clamp'
    });
    const imageAnim = this.state.scrollY.interpolate({
      inputRange: [0, HEADER_MAX_HEIGHT],
      outputRange: [0,-HEADER_MAX_HEIGHT],
      // extrapolate:'clamp'
    });
    const textAnim = this.state.scrollY.interpolate({
      inputRange: [0, HEADER_MAX_HEIGHT],
      outputRange: [0,(HEADER_MAX_HEIGHT-HEADER_MIN_HEIGHT)/2],
      // extrapolate:'clamp'
    });
    const textAnim2 = this.state.scrollY.interpolate({
      inputRange: [0, HEADER_MAX_HEIGHT],
      outputRange: [0,(HEADER_MAX_HEIGHT-HEADER_MIN_HEIGHT)/2],
      // extrapolate:'clamp'
    });
    const textAnim3 = this.state.scrollY.interpolate({
      inputRange: [0, HEADER_MAX_HEIGHT],
      outputRange: [0,(HEADER_MAX_HEIGHT-HEADER_MIN_HEIGHT)/2],
      // extrapolate:'clamp'
    });
    const textAnim4 = this.state.scrollY.interpolate({
      inputRange: [0, HEADER_MAX_HEIGHT],
      outputRange: [0,(HEADER_MAX_HEIGHT-HEADER_MIN_HEIGHT)/2],
      // extrapolate:'clamp'
    });

    const scaleToZero = this.state.scrollY.interpolate({
      inputRange: [0, HEADER_MAX_HEIGHT - HEADER_MIN_HEIGHT],
      outputRange: [1,0.4],
      extrapolate:'clamp'
    });

    const opacityChange = this.state.scrollY.interpolate({
      inputRange: [0, HEADER_MAX_HEIGHT*1.2],
      outputRange: [1,0],
      extrapolate:'clamp'
    });

    const bigImageOpacity = this.state.scrollY.interpolate({
      inputRange: [0, HEADER_MAX_HEIGHT - HEADER_MIN_HEIGHT],
      outputRange: [1,0.15],
      extrapolate:'clamp'
    });

    const bigImageScale = this.state.scrollY.interpolate({
      inputRange: [0, HEADER_MAX_HEIGHT - HEADER_MIN_HEIGHT],
      outputRange: [1, 1.1],
      extrapolate:'clamp'
    });

    const pictureRotate = this.state.scrollY.interpolate({
      inputRange: [0, HEADER_MAX_HEIGHT - HEADER_MIN_HEIGHT],
      outputRange: ['360deg','120deg'],
      extrapolate:'clamp'
    });
    const headerTextTranslate = this.state.scrollY.interpolate({
      inputRange: [0, HEADER_MAX_HEIGHT - HEADER_MIN_HEIGHT],
      outputRange: [HEADER_MAX_HEIGHT, HEADER_MAX_HEIGHT - HEADER_MIN_HEIGHT/2 - 10],
      extrapolate:'clamp'
    });

    return (
      <View style={{ flex: 1, width:"100%" }}>
        <Animated.View
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            zIndex:10,
            height: HEADER_MAX_HEIGHT,
            alignItems: 'center',
            transform:[{translateY:headerHeight}]
          }}
        >
          <LinearGradient style={{width:"100%", height:"100%",
            borderTopLeftRadius:BORDER_RADIUS, elevation:7,
              borderTopRightRadius:BORDER_RADIUS,overflow:'hidden'}}
            colors={(this.props.theme==='light')?
              ["rgb(20,20,20)", "rgb(50,50,50)"]:
              ["rgb(200,200,200)", "rgb(240,240,240)"]}>
            <Animated.Image
              style={{transform: [{scale:bigImageScale}], opacity:bigImageOpacity, 
                height:"100%", width:"100%"}}
              source={this.props.imageSource}
            />
          </LinearGradient>
          <Animated.View
              style={{ position: 'absolute', 
              transform:[{translateY:headerTextTranslate}],
              alignItems:'center', justifyContent:'center' }}
            >
              <Text style={{ 
                color: COLORS.LIGHT, 
                fontSize:TOPIC_SMALL_SIZE, textAlign:'center',
                fontFamily:FONTS.NOE_DISPLAY}}>
                {this.convertTopic(topic)}                
              </Text>
            </Animated.View>
            <Animated.View
              onPress={()=>this.setState({imageViewerActive:true})}
              style={{
                top:-PROFILE_IMAGE_MAX_HEIGHT/2, alignSelf:'flex-start',
                height: PROFILE_IMAGE_MAX_HEIGHT,
                width: PROFILE_IMAGE_MAX_HEIGHT,
                borderRadius: PROFILE_IMAGE_MAX_HEIGHT/2,
                marginLeft: 16, overflow:'hidden', zIndex:20,
                backgroundColor:COLORS.LIGHT,
                elevation:7,
                transform:[{translateX:imageAnim},{scaleX:scaleToZero},{scaleY:scaleToZero}],
              }}>
              <Animated.Image
                source={{uri:author_image}}
                style={{flex:1, transform: [{rotate:pictureRotate}],resizeMode:'cover'}}
              />
            </Animated.View>
        </Animated.View>

        <Animated.ScrollView
          nestedScrollEnabled={true}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="always"
          decelerationRate={0.99}
          overScrollMode="always"
          contentContainerStyle={{borderRadius:BORDER_RADIUS, overflow:'hidden'}}
          
          style={{ flex: 1 }}
          onScroll={Animated.event([
            { nativeEvent: { contentOffset: { y: this.state.scrollY } } }
          ], {useNativeDriver:true})}
        >
          <View style={{height:HEADER_MAX_HEIGHT + PROFILE_IMAGE_MAX_HEIGHT}}/>
          <View >
            <Animated.Text style={{marginLeft:16, marginVertical:2, fontFamily:FONTS.LATO,
            fontSize:14, color:COLORS.GRAY,opacity:opacityChange, 
            transform:[{translateY:textAnim}]}}>
              by <Text style={{fontFamily:FONTS.LATO_BOLD, fontSize:18}}>{author}</Text>
            </Animated.Text>
            <Animated.Text style={{ fontSize: 28, marginLeft: 15, 
              fontFamily:FONTS.NOE_DISPLAY, color:COLORS.LESS_DARK, opacity:opacityChange, 
              transform:[{translateY:textAnim2} ]}}>
              {topic}
            </Animated.Text>

              <Animated.Text 
                style={{fontFamily:FONTS.HELVETICA_NEUE,
                fontSize:12,
                marginLeft:16,
                color:COLORS.GRAY,
                transform:[{translateY: textAnim3} ],
                opacity:opacityChange}}>
                  {`${category}\n${views} View${(views!==1)?'s':''}`}
              </Animated.Text>
              {
                (rating)?
                <Animated.View style={{flexDirection:'row', alignItems:"center",
                  transform:[{translateY: textAnim4}],opacity:opacityChange
                }}>
                  <StarRating
                    activeOpacity={0.8}
                    maxStars={rating}
                    disabled={true}
                    showRating={true}
                    rating={rating}
                    emptyStarColor={(this.props.theme==='light')?COLORS.LESS_LIGHT:COLORS.GRAY}
                    halfStarColor={COLORS.STAR_YELLOW}
                    fullStarColor={COLORS.STAR_YELLOW}
                    starSize={20}
                    containerStyle={{marginLeft:10, marginTop:5}}
                    emptyStar={'star'}
                    fullStar={'star'}
                    halfStar={'star-half-o'}
                  />
                  <Text style={{marginLeft:10, fontSize:14, 
                    fontFamily:FONTS.HELVETICA_NEUE, 
                      color:COLORS.LIGHT_GRAY}}>
                    {rating}/5
                  </Text>
                </Animated.View>:
                (
                  (this.props.selectedArticleInfo.cannotComment)? 
                  null:
                  (
                    <Animated.Text style={{marginLeft:16, fontSize:10, 
                      fontFamily:FONTS.HELVETICA_NEUE,
                      transform:[{translateY: textAnim4}],opacity:opacityChange,
                      color:COLORS.LIGHT_GRAY}}>
                      {(this.props.article_id!==-1)?"*Not yet rated":"*In preview mode"}
                    </Animated.Text>
                  )
                )
              }
          </View>
          <View style={{height:20}}/>
          
          {this.renderCardViews(cards)}
          {this.renderOptions()}
          {
            (this.props.article_id!==-1)?
            this.renderComments(comments):
            <View style={{width:"100%", margin:10}}>
              <Text style={{marginLeft:10, fontSize:14, 
                fontFamily:FONTS.HELVETICA_NEUE,  
                color:COLORS.GRAY}}>
                *Comments not available in preview
              </Text>
            </View>
          }
          <View style={{height:250}}/>
        </Animated.ScrollView>
      </View>
    );
  }

  render() {
    const {COLORS} = this.props;
    if (!this.props.isVisible){
      return null;
    }
    else{
      if (this.props.article_id!==-1){
        preview_article=false
      }
      else{
        preview_article = {
          article_id:-1,
          already_viewed:false,
          topic:this.props.topic,
          category: this.props.category,
          author: this.props.userData.name,
          author_image:this.props.userData.image_url,
          cards:this.props.preview_contents
        }
      }
      
      if ((this.props.selectedArticleInfo.article_id!==this.props.article_id) && (!this.props.loading)){
        this.props.getArticleInfo(this.props.article_id, preview_article)
      }

      return(
        <Overlay
          isVisible={this.props.isVisible}
          overlayStyle={{...styles.OverlayStyle, backgroundColor:COLORS.LIGHT}}
          onBackdropPress={()=>{this.props.getArticleInfo(this.props.article_id, false);
            this.setState({scrollY: new Animated.Value(0), adIndex:_.random});this.props.onBackdropPress()}}
          width={`${OVERLAY_WIDTH_PERCENT}%`}
          height="90%"
        >
          <>
            <StatusBar 
              barStyle={'light-content'}
              backgroundColor={COLORS.OVERLAY_COLOR}/>
            {changeNavigationBarColor(COLORS.LIGHT, (this.props.theme==='light'))}
            <TimedAlert theme={this.props.theme} onRef={ref=>this.timedAlert = ref} 
              COLORS = {COLORS}
            />
            {
              (this.props.loading)?
              <View style={{flex:1, justifyContent:'center', alignItems:'center'}}>
              <Loading size={128} white={(this.props.theme!=='light')}/>
              </View>:
              this.renderArticle()
            }
          </>
        </Overlay>
      );
    }
  }
}

const mapStateToProps =(state) => {
  return {
    userData: state.login.data,

    adsManager: state.home.adsManager,
    image_adder: state.home.image_adder,
    canShowAdsRemote: state.home.welcomeData.canShowAdsRemote,

    selectedArticleInfo: state.articleInfo.selectedArticleInfo,
    loading: state.articleInfo.loading,

    theme: state.chat.theme,
    COLORS: state.chat.COLORS
  }
}

export default connect(mapStateToProps, {getArticleInfo, setAuthToken, submitComment, 
  bookmarkArticle})(ArticleInfo)

const styles = StyleSheet.create({
  OverlayStyle:{
    borderRadius:BORDER_RADIUS,
    elevation:0,
    paddingHorizontal:0,
    overflow:'hidden',
    paddingVertical:0,
    marginBottom:27
  } 
})