import React, {PureComponent} from 'react';
import { View, Text, StyleSheet, 
  StatusBar, FlatList, Animated,
  TextInput,
  Dimensions, RefreshControl,
  TouchableOpacity}from 'react-native';
import _ from 'lodash';
import {connect} from 'react-redux';
import {Overlay,Icon} from 'react-native-elements';
import StarRating from 'react-native-star-rating';
import LinearGradient from 'react-native-linear-gradient';
import {getArticleInfo, setAuthToken, submitComment} from '../actions/ArticleInfoAction';
import {FONTS, COLOR_COMBOS,COLORS_LIGHT_THEME, COLORS_DARK_THEME} from '../Constants';
import CardView from './CardView';
import Loading from '../components/Loading';
import {NativeAdsManager, AdSettings} from 'react-native-fbads';
import NativeAdsComponent from '../components/NativeAdsComponent';
import Image from 'react-native-fast-image';
import changeNavigationBarColor from 'react-native-navigation-bar-color';
// import console = require('console');


OVERLAY_WIDTH_PERCENT=88
HEADER_MAX_HEIGHT = Math.floor(Dimensions.get('window').width * (OVERLAY_WIDTH_PERCENT/100)) *0.75;
HEADER_MIN_HEIGHT = 70;
PROFILE_IMAGE_MAX_HEIGHT = 76;
PROFILE_IMAGE_MIN_HEIGHT = 18;
BORDER_RADIUS=PROFILE_IMAGE_MAX_HEIGHT/2;
TOPIC_SIZE=36
TOPIC_SMALL_SIZE=18

class ArticleInfo extends PureComponent {

  constructor() {
    super();
    this.state = {
      scrollY: new Animated.Value(0),
      userCommentRating:-1,
      commentText:"",
      adIndex: 0
    };
  }

  componentDidMount(){
    AdSettings.addTestDevice(AdSettings.currentDeviceHash);
    this.adsManager = new NativeAdsManager('2329203993862500_2500411190075112', 1);
    this.adsManager.setMediaCachePolicy('all');
    this.adsManager.onAdsLoaded(()=>{console.log("Ad loaded!")})
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
              <View>
                {(i===this.state.adIndex)?
                  <NativeAdsComponent adsManager={this.adsManager} theme={this.props.theme}/>:
                  <View/>
                }
                <CardView 
                  theme={this.props.theme}
                  key={item.sub_heading}
                  cardData={item}/>
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

  showStarRating(){
    if (this.props.selectedArticleInfo.cannotComment){
      return <View/>
    }

    return (
      <StarRating
        selectedStar={(rating)=>{this.setState({userCommentRating:rating})}}
        activeOpacity={0.8}
        maxStars={5}
        rating={this.state.userCommentRating}
        halfStarEnabled={true}
        emptyStarColor={(this.props.theme==='light')?COLORS_LIGHT_THEME.LESS_LIGHT:COLORS_DARK_THEME.GRAY}
        halfStarColor={(this.props.theme==='light')?'#f5af19':"rgb(243, 201, 33)"}
        fullStarColor={(this.props.theme==='light')?'#f5af19':"rgb(243, 201, 33)"}
        starSize={28}
        containerStyle={{marginLeft:10, marginTop:5}}
        emptyStar={'star-o'}
        fullStar={'star'}
        halfStar={'star-half-o'}
      />
    )
  }

  renderCommentBox(){
    return (
      <View>
        <View style={{
          backgroundColor:(this.props.theme==='light')?COLORS_LIGHT_THEME.LESSER_LIGHT:COLORS_DARK_THEME.LESSER_LIGHT, 
          padding:10, borderRadius:15, marginBottom:15}}>
          <TextInput
            value={this.state.commentText}
            onChangeText={(text)=>{this.setState({commentText:text})}}
            textAlignVertical='top'
            keyboardAppearance="light"
            placeholderTextColor={(this.props.theme==='light')?COLORS_LIGHT_THEME.GRAY:COLORS_DARK_THEME.GRAY}
            numberOfLines={6}
            maxLength={2048}
            spellCheck={true}
            autoCapitalize="sentences"
            autoCorrect={true}
            multiline={true}
            placeholder={"What are your thoughts on this article..."}
            returnKeyType={"done"}
            style={{fontFamily:FONTS.LATO, fontSize:16, color:(this.props.theme==='light')?COLORS_LIGHT_THEME.DARK:COLORS_DARK_THEME.DARK}}
          />
          {this.showStarRating()}
          
        </View>
          <TouchableOpacity
            style={{backgroundColor:(this.props.theme==='light')?COLORS_LIGHT_THEME.GREEN:COLORS_DARK_THEME.GREEN, 
              alignSelf:'flex-end', padding:10, borderRadius:30,elevation:7, margin:15}}
            onPress={()=>{this.setState({scrollY: new Animated.Value(0)});this.props.submitComment({
              rating:this.state.userCommentRating,
              comment: this.state.commentText,
              article_id: this.props.article_id
            })}}>
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

  renderComments(comments){
    if (this.props.selectedArticleInfo.cannotComment){
      // // console.log("here not comment")
      return <View/>
    }
    // // console.log("ow here: ", this.props)
    return (
      <View style={{margin:5, marginTop:20}}>
        <Text style={{fontSize:32, 
          fontFamily:FONTS.GOTHAM_BLACK, 
          color:(this.props.theme==='light')?COLORS_LIGHT_THEME.LESS_DARK:COLORS_DARK_THEME.LESS_DARK, 
          marginLeft:15}}>Comments</Text>

        <View style={{
              backgroundColor:(this.props.theme==='light')?COLORS_LIGHT_THEME.LIGHT:COLORS_DARK_THEME.LESS_LIGHT, 
              borderColor:COLORS_DARK_THEME.GRAY, borderWidth:2,elevation:3,
              borderRadius:20, padding:10, margin:10}}>
          {
            (this.props.selectedArticleInfo.my_article)?
            <View/>:
            this.renderCommentBox()
          }
          
          {
            (comments && comments.length!==0)?
            (<FlatList
              horizontal={false}
              data={comments}
              keyExtractor={(item, i) => i.toString()}
      
              renderItem={
                ({item, index}) => {
                  return (
                    <View>
                      <View style={{flexDirection:'row', alignItems:'center'}}>
                        <Image
                          source={{uri:item.author_image}}
                          style={{height:48, width:48, borderRadius:25, marginRight:20}}
                        />
                        <Text style={{fontFamily:FONTS.HELVETICA_NEUE, fontSize:20, textDecorationLine:'underline',
                          color: (this.props.theme==='light')?COLORS_LIGHT_THEME.LESSER_DARK:COLORS_DARK_THEME.LESSER_DARK}}>
                          {item.author}
                        </Text>
                      </View>
                      <Text style={{fontFamily:FONTS.HELVETICA_NEUE, textAlign:'justify',
                        fontSize:14, marginTop:10, marginHorizontal:10,
                        color:(this.props.theme==='light')?COLORS_LIGHT_THEME.LESSER_DARK:COLORS_DARK_THEME.LESSER_DARK}}>
                        {item.comment}
                      </Text>
                      {
                        (index===comments.length-1)?
                        <View/>:
                        <View style={{width:"100%", height:0.5, marginTop:6, marginBottom:10,
                          backgroundColor:(this.props.theme==='light')?COLORS_LIGHT_THEME.LESS_LIGHT:COLORS_DARK_THEME.LESS_LIGHT, borderRadius:1}}/>
                      }
                    </View>
                  )
                }
              }
            />):
            (
              <View style={{flexDirection:'row', justifyContent:'center', alignItems:'center'}}>
                <Icon type='material-community' name="comment-outline" size={18} 
                  color={(this.props.theme==='light')?COLORS_LIGHT_THEME.LESS_DARK:COLORS_DARK_THEME.LESS_DARK}/>
                <Text style={{fontFamily:FONTS.LATO, fontSize:16, margin:10,
                  color:(this.props.theme==='light')?COLORS_LIGHT_THEME.LESS_DARK:COLORS_DARK_THEME.LESS_DARK}}>
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
        return topic.slice(0,22).toUpperCase() + '...'
      }
    }
  }


  renderArticle(){
    const {author, author_image, cards, 
      category, comments, rating, topic, viewed} = this.props.selectedArticleInfo;

    const headerHeight = this.state.scrollY.interpolate({
      inputRange: [0, HEADER_MAX_HEIGHT - HEADER_MIN_HEIGHT],
      outputRange: [HEADER_MAX_HEIGHT, HEADER_MIN_HEIGHT],
      extrapolate: 'clamp'
    });
    const profileImageHeight = this.state.scrollY.interpolate({
      inputRange: [0, HEADER_MAX_HEIGHT - BORDER_RADIUS/2],
      outputRange: [PROFILE_IMAGE_MAX_HEIGHT, PROFILE_IMAGE_MIN_HEIGHT],
      extrapolate: 'clamp'
    });

    const profileImageMarginTop = this.state.scrollY.interpolate({
      inputRange: [0, HEADER_MAX_HEIGHT - HEADER_MIN_HEIGHT],
      outputRange: [
        HEADER_MAX_HEIGHT - PROFILE_IMAGE_MAX_HEIGHT / 2,
        HEADER_MAX_HEIGHT + 5
      ],
      extrapolate: 'clamp'
    });
    const headerZindex = this.state.scrollY.interpolate({
      inputRange: [0, HEADER_MAX_HEIGHT - HEADER_MIN_HEIGHT, 1000],
      outputRange: [0, 0, 1000],
      extrapolate: 'clamp'
    });

    const textOpacity = this.state.scrollY.interpolate({
      inputRange: [0, HEADER_MAX_HEIGHT - BORDER_RADIUS/2],
      outputRange: (this.props.theme==='light')?['rgba(70,70,70,1)','rgba(70,70,70,0)']:['rgba(240,240,240,1)', 'rgba(240,240,240,0)'],
      extrapolate: 'clamp'
    });
    const categoryOpacity = this.state.scrollY.interpolate({
      inputRange: [0, HEADER_MAX_HEIGHT - BORDER_RADIUS],
      outputRange: (this.props.theme==='light')?['rgba(100,100,100,1)','rgba(100,100,100,0.2)']:['rgba(220,220,220,1)', 'rgba(220,220,220,0.2)'],
      extrapolate: 'clamp'
    });

    const bigImageOpacity = this.state.scrollY.interpolate({
      inputRange: [0, HEADER_MAX_HEIGHT - HEADER_MIN_HEIGHT],
      outputRange: [1,0.1],
      extrapolate: 'clamp'
    });

    const headerTitleBottom = this.state.scrollY.interpolate({
      inputRange: [
        0,
        HEADER_MAX_HEIGHT - HEADER_MIN_HEIGHT,
        HEADER_MAX_HEIGHT - HEADER_MIN_HEIGHT + 5 + PROFILE_IMAGE_MIN_HEIGHT,
        HEADER_MAX_HEIGHT -
          HEADER_MIN_HEIGHT +
          10 +
          PROFILE_IMAGE_MIN_HEIGHT +
          30
      ],
      outputRange: [-TOPIC_SMALL_SIZE-10, -TOPIC_SMALL_SIZE-10, -TOPIC_SMALL_SIZE-10, HEADER_MIN_HEIGHT/5],
      extrapolate: 'clamp'
    });

    return (
      <View style={{ flex: 1, width:"100%" }}>
        <Animated.View
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,  
            height: headerHeight,
            zIndex: headerZindex,
            alignItems: 'center',
          }}
        >
          <LinearGradient style={{width:"100%", height:"100%",
            borderTopLeftRadius:BORDER_RADIUS,
              borderTopRightRadius:BORDER_RADIUS,}}
            colors={(this.props.theme==='light')?
              ["rgb(20,20,20)", "rgb(50,50,50)"]:
              ["rgb(200,200,200)", "rgb(240,240,240)"]}>
            <Animated.Image
              style={{flex:1,
              borderTopLeftRadius:BORDER_RADIUS,
              borderTopRightRadius:BORDER_RADIUS,
              opacity:bigImageOpacity}}
              source={
                (this.props.loadSuccessful)?
                {uri:this.props.article_image}:
                require("../../assets/images/placeholder/building.jpg")
              }
            />
          </LinearGradient>
          <Animated.View
              style={{ position: 'absolute', bottom: headerTitleBottom, padding:10 }}
            >
              <Text style={{ 
                color: (this.props.theme==='light')?COLORS_LIGHT_THEME.LIGHT:COLORS_DARK_THEME.LIGHT, 
                fontSize:TOPIC_SMALL_SIZE, textAlign:'center',
                fontFamily:FONTS.HELVETICA_NEUE}}>
                {this.convertTopic(topic)}
              </Text>
            </Animated.View>
          
        </Animated.View>

        <Animated.ScrollView
          refreshControl={
            (this.props.article_id!==-1)?
            (
              <RefreshControl
                tintColor={'black'}
                onRefresh={()=>{
                this.props.getArticleInfo(this.props.article_id, false, true)
                }}
                  refreshing={this.props.loading}
                  colors={["rgb(0,181, 213)"]}
              />
            ):
            null
          }
          nestedScrollEnabled={true}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="always"
          decelerationRate={0.99}
          overScrollMode="always"
          contentContainerStyle={{borderRadius:BORDER_RADIUS, overflow:'hidden'}}
          
          style={{ flex: 1 }}
          scrollEventThrottle={16}
          scrollToOverflowEnabled={true}
          onScroll={Animated.event([
            { nativeEvent: { contentOffset: { y: this.state.scrollY } } }
          ])}
        >
          <Animated.View
            style={{
              height: profileImageHeight,
              width: profileImageHeight,
              borderRadius: BORDER_RADIUS,
              backgroundColor: (this.props.theme==='light')?COLORS_LIGHT_THEME.LIGHT:COLORS_DARK_THEME.LIGHT,
              overflow: 'hidden',
              marginTop: profileImageMarginTop,
              marginLeft: 10, flexDirection:'row',
              elevation:7, justifyContent:'center', alignItems:'center'
            }}
          >
            <Animated.Image
              source={
                (author_image)?
                {uri:author_image}:
                require('../../assets/icons/user.png')
              }
              style={{ flex: 1, width: profileImageHeight, height:profileImageHeight, 
              backgroundColor:(this.props.theme==='light')?COLORS_LIGHT_THEME.LIGHT:COLORS_DARK_THEME.LIGHT,
              borderRadius:BORDER_RADIUS}}
            />
          </Animated.View>
          <View>
            <Animated.Text style={{marginLeft:10, marginVertical:2, fontFamily:FONTS.LATO, fontSize:14, color:textOpacity}}>
              by <Text style={{fontFamily:FONTS.LATO_BOLD, fontSize:18}}>{author}</Text>
            </Animated.Text>
            <Animated.Text style={{ fontSize: 28, paddingLeft: 10, 
              fontFamily:FONTS.GOTHAM_BLACK, color:textOpacity}}>
              {topic}
            </Animated.Text>

              <Animated.Text 
                style={{fontFamily:FONTS.HELVETICA_NEUE,
                fontSize:12,
                marginLeft:10,
                color:categoryOpacity}}>
                  {category}
              </Animated.Text>
              {
                (rating)?
                <View style={{flexDirection:'row', alignItems:"center"}}>
                  <StarRating
                    activeOpacity={0.8}
                    maxStars={rating}
                    disabled={true}
                    showRating={true}
                    rating={rating}
                    emptyStarColor={'#FFFFFF'}
                    halfStarColor={'#f5af19'}
                    fullStarColor={'#f5af19'}
                    starSize={20}
                    containerStyle={{marginLeft:10, marginTop:5}}
                    emptyStar={'star'}
                    fullStar={'star'}
                    halfStar={'star-half-o'}
                  />
                  <Text style={{marginLeft:10, fontSize:14, 
                    fontFamily:FONTS.HELVETICA_NEUE, 
                      color:(this.props.theme==='light')?COLORS_LIGHT_THEME.LIGHT_GRAY:COLORS_DARK_THEME.LIGHT_GRAY}}>
                    {rating}/5
                  </Text>
                </View>:
                (
                  (this.props.selectedArticleInfo.cannotComment)? 
                  <View/>:
                  (
                    <Text style={{marginLeft:10, fontSize:10, 
                      fontFamily:FONTS.HELVETICA_NEUE, 
                        color:(this.props.theme==='light')?COLORS_LIGHT_THEME.LIGHT_GRAY:COLORS_DARK_THEME.LIGHT_GRAY}}>
                      {(this.props.article_id!==-1)?"*Not yet rated":"*In preview mode"}
                    </Text>
                  )
                )
              }

          </View>
          <View style={{height:50}}/>
          {this.renderCardViews(cards)}
          {
            (this.props.article_id!==-1)?
            this.renderComments(comments):
            <View style={{width:"100%", margin:10}}>
              <Text style={{marginLeft:10, fontSize:14, 
                fontFamily:FONTS.HELVETICA_NEUE,  
                color:(this.props.theme==='light')?COLORS_LIGHT_THEME.GRAY:COLORS_DARK_THEME.GRAY}}>
                *Comments not available in preview
              </Text>
            </View>
          }
          <View style={{height:450}}/>
        </Animated.ScrollView>
      </View>
    );
  }

  render() {
    if (!this.props.isVisible){
      
      return <View/>;
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
      
      if (this.props.selectedArticleInfo.article_id!==this.props.article_id){
        this.props.getArticleInfo(this.props.article_id, preview_article)
      }

      return(
        <Overlay
          isVisible={this.props.isVisible}
          overlayStyle={{...styles.OverlayStyle, backgroundColor:(this.props.theme==='light')?COLORS_LIGHT_THEME.LIGHT:COLORS_DARK_THEME.LIGHT}}
          onBackdropPress={()=>{this.props.getArticleInfo(this.props.article_id, false);
            this.setState({scrollY: new Animated.Value(0), adIndex:_.random});this.props.onBackdropPress()}}
          width={`${OVERLAY_WIDTH_PERCENT}%`}
          height="90%"
        >
          <View style={{flex:1, justifyContent:'center', alignItems:'center'}}>
            <StatusBar 
              barStyle={(this.props.theme==='light')?'dark-content':'light-content'}
              backgroundColor={(this.props.theme==='light')?COLORS_LIGHT_THEME.OVERLAY_COLOR:COLORS_DARK_THEME.OVERLAY_COLOR}/>
            {changeNavigationBarColor((this.props.theme==='light')?COLORS_LIGHT_THEME.LIGHT:COLORS_DARK_THEME.LIGHT, (this.props.theme==='light'))}
            {
              (this.props.loading)?
              <Loading size={128} white={(this.props.theme!=='light')}/>:
              this.renderArticle()
            }
          </View>
        </Overlay>
      );
    }
  }
}

const mapStateToProps =(state) => {
  // console.log("selected article info: ", state.articleInfo.selectedArticleInfo)
  return {
    userData: state.login.data,
    selectedArticleInfo: state.articleInfo.selectedArticleInfo,
    loading: state.articleInfo.loading,
  }
}

export default connect(mapStateToProps, {getArticleInfo, setAuthToken, submitComment})(ArticleInfo)

const styles = StyleSheet.create({
  OverlayStyle:{
    borderRadius:BORDER_RADIUS,
    elevation:10,
    paddingHorizontal:0,
    overflow:'hidden',
    paddingVertical:0,
    marginBottom:27
  } 
})