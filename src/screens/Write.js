import React, {Component} from 'react';
import {connect} from 'react-redux';
import { View, Text, StyleSheet, StatusBar, FlatList, Dimensions,
  RefreshControl, ScrollView} from 'react-native';
import Ripple from '../components/Ripple';
import ArticleTile from '../components/ArticleTile';
import {setAuthToken, getMyArticles, clearPublish} from '../actions/WriteAction';
import {Icon} from "react-native-elements"; 
import ShimmerPlaceHolder from 'react-native-shimmer-placeholder';
import {logEvent} from '../actions/ChatAction';
import {FONTS, COLORS_LIGHT_THEME, LOG_EVENT} from '../Constants';
import { Actions } from 'react-native-router-flux';
import LinearGradient from 'react-native-linear-gradient';
import changeNavigationBarColor from 'react-native-navigation-bar-color';
import SView from 'react-native-simple-shadow-view';
import analytics from '@react-native-firebase/analytics';



class Write extends Component {

  constructor() {
    super();
  }

  componentDidMount(){
    this.props.setAuthToken();
    analytics().setCurrentScreen('MyArticles', 'MyArticles')
    this.props.getMyArticles(Object.keys(this.props.myArticles).length, this.props.reload);
  }

  renderTopics(articles, category){
    return(
      <FlatList data={articles}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.article_id.toString()}
        renderItem = {({item}) => {
          return (
            <View style={{marginVertical:15, flexDirection:'row', marginHorizontal:5}}>
              <ArticleTile data={{...item, category}} theme={this.props.theme}
                COLORS = {this.props.COLORS}
              />
            </View>
          )
        }}
      />
    )
  }

  renderCategory(){
    const data= this.props.myArticles;
    const {COLORS} = this.props;

    if (this.props.loading){
      return(
        <View style={{width:"100%"}}>
          <ScrollView style={{flexGrow:1}} nestedScrollEnabled={true} showsVerticalScrollIndicator={false}>
            <View style={{height:70, width:1}}/>
            <ShimmerPlaceHolder colorShimmer={COLORS.SHIMMER_COLOR} visible={false} autoRun={true} duration={600} delay={100}
              style={{height:35, borderRadius:5, marginTop:30, marginLeft:15, alignItems:'center', elevation:6}}
            />
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <ShimmerPlaceHolder colorShimmer={COLORS.SHIMMER_COLOR} visible={false} style={{width:150, height:150, borderRadius:8,margin:15, marginHorizontal:5, elevation:6}}/>
              <ShimmerPlaceHolder colorShimmer={COLORS.SHIMMER_COLOR} visible={false} style={{width:150, height:150, borderRadius:8,margin:15, marginHorizontal:5, elevation:6}}/>
              <ShimmerPlaceHolder colorShimmer={COLORS.SHIMMER_COLOR} visible={false} style={{width:150, height:150, borderRadius:8,margin:15, marginHorizontal:5, elevation:6}}/>
            </ScrollView>

            <ShimmerPlaceHolder colorShimmer={COLORS.SHIMMER_COLOR} visible={false} autoRun={true} duration={650} delay={30}
              style={{height:35, borderRadius:5, marginTop:30, marginLeft:15, alignItems:'center', elevation:6}}
            />
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <ShimmerPlaceHolder colorShimmer={COLORS.SHIMMER_COLOR} visible={false} style={{width:150, height:150, borderRadius:8,margin:15, marginHorizontal:5, elevation:6}}/>
              <ShimmerPlaceHolder colorShimmer={COLORS.SHIMMER_COLOR} visible={false} style={{width:150, height:150, borderRadius:8,margin:15, marginHorizontal:5, elevation:6}}/>
              <ShimmerPlaceHolder colorShimmer={COLORS.SHIMMER_COLOR} visible={false} style={{width:150, height:150, borderRadius:8,margin:15, marginHorizontal:5, elevation:6}}/>
            </ScrollView>

            <ShimmerPlaceHolder colorShimmer={COLORS.SHIMMER_COLOR} visible={false} autoRun={true} duration={700} delay={0}
              style={{height:35, borderRadius:5, marginTop:30, marginLeft:15, alignItems:'center', elevation:6}}
            />
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <ShimmerPlaceHolder colorShimmer={COLORS.SHIMMER_COLOR} visible={false} style={{width:150, height:150, borderRadius:8,margin:15, marginHorizontal:5, elevation:6}}/>
              <ShimmerPlaceHolder colorShimmer={COLORS.SHIMMER_COLOR} visible={false} style={{width:150, height:150, borderRadius:8,margin:15, marginHorizontal:5, elevation:6}}/>
              <ShimmerPlaceHolder colorShimmer={COLORS.SHIMMER_COLOR} visible={false} style={{width:150, height:150, borderRadius:8,margin:15, marginHorizontal:5, elevation:6}}/>
            </ScrollView>
            <View style={{height:200, width:1}}/>
          </ScrollView>
        </View>
      )
    }

    else{
      const category_list = Object.keys(data);
      return (
        <View style={{width:"100%", flex:1}}>
          <FlatList
            data={category_list}
            contentContainerStyle={{flexGrow:1}}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={false}
                colors={["rgb(0,181, 213)"]}
                onRefresh={()=>
                {this.props.getMyArticles(Object.keys(this.props.myArticles).length, this.props.reload);}}
              />
            }
            ListEmptyComponent={
              <View style={{flex:1, justifyContent:'center', alignItems:'center', marginTop:100, paddingHorizontal:30}}>
                <Text style={{textAlign:'center', fontFamily: FONTS.PRODUCT_SANS_BOLD, fontSize:18, 
                  color:COLORS.LESS_DARK}}>
                  You have not written any articles, you can start writing one by tapping on the NEW button
                </Text>
              </View>
            }
            ListHeaderComponent={<View style={{height:70, width:1}}/>}
            ListFooterComponent={<View style={{height:200, width:1}}/>}
            keyExtractor={(item, index) => index.toString()}
            renderItem = {({item}) => {   // item here is the category
              return (
                <View style={{marginTop:25, alignItems:'flex-start', justifyContent:'flex-start'}}>
                  <View style={{flex:1, marginLeft:15 }}>
                    <View style={{borderRadius:5, padding:5, paddingHorizontal:10, borderWidth:2, 
                      borderColor:(this.props.theme==='light')?COLORS.LIGHT_GRAY:COLORS.GRAY}}>
                      <Text style={{...styles.CategoryTextStyle, 
                        color:(this.props.theme==='light')?COLORS.LIGHT_GRAY:COLORS.GRAY}}>{item}</Text>
                    </View>
                  </View>
                  {this.renderTopics(data[item], item)}
                </View>
              )
            }}
          /> 
        </View>     
      )
    }
  }

  renderFloatingButton(){
    return (
      <Ripple style={{justifyContent:'center', alignItems:"center",bottom:70, 
        left:15, position:"absolute"}} rippleContainerBorderRadius={5}
        onPress={()=>{(this.props.isDraft)?()=>{}:this.props.clearPublish();
        Actions.jump('writearticle'); analytics().setCurrentScreen('Write', 'Write');
        logEvent(LOG_EVENT.SCREEN_CHANGE, 'writearticle');}}>
        <SView style={{borderRadius:10, shadowOpacity:0.4,shadowRadius:6,
          shadowOffset: { height:7}, shadowColor:'#202020', 
          backgroundColor:COLORS_LIGHT_THEME.LIGHT}}>
          <LinearGradient style={{flex:1,paddingHorizontal:15, paddingVertical:10, borderRadius:10}}
            colors={(this.props.isDraft)?["#f12711","#f5af19"]:["#fc6767","#ec008c"]} start={{x:0, y:1}} end={{x:1, y:1}}>
              {
                (this.props.isDraft)?
                <View style={{alignItems:'center'}}>
                  <Text style={[styles.ButtonTextStyle, {fontSize:20}]}>CONTINUE</Text>
                  <Text style={{fontSize:12, fontFamily:FONTS.LATO, 
                    color:COLORS_LIGHT_THEME.LIGHT}}>
                    Previous Article
                  </Text>
                </View>:
                <View style={{alignItems:'center', flexDirection:'row'}}>

                  <Text style={[styles.ButtonTextStyle, {fontSize:24, marginHorizontal:5}]}>NEW</Text>
                  <Icon name="plus-circle" type="material-community" size={24} 
                    color={COLORS_LIGHT_THEME.LIGHT}/>
                </View>
              }
          </LinearGradient>
        </SView>
      </Ripple>
    )
  }

  render() {
    const {COLORS} = this.props;
    return(
      <View style={{flex:1,justifyContent:'space-between',backgroundColor:COLORS.LIGHT}}>
        <StatusBar 
          barStyle={(this.props.theme==='light')?'dark-content':'light-content'}
          backgroundColor={COLORS.LIGHT}
        />
        {changeNavigationBarColor(COLORS.LIGHT, (this.props.theme==='light'))}
        
        <SView style={{borderRadius:10, height:55,paddingLeft:20,paddingRight:10,
          alignItems:'center', flexDirection:'row', shadowColor:"#202020", shadowOpacity:0.3,
          position:'absolute', top:10, zIndex:10,width:'92%', alignSelf:'center',
          shadowOffset:{width:0,height:10},shadowRadius:8,justifyContent:'space-between',
          backgroundColor:(this.props.theme==='light')?COLORS.LIGHT:COLORS.LESS_LIGHT}}>
            <Text style={{...styles.TextStyle, color:COLORS.DARK}}>
              my articles
            </Text>
            <Ripple rippleContainerBorderRadius={6}
              onPress={()=>{Actions.bookmark()}}>
              <LinearGradient style={{paddingHorizontal:10, paddingVertical:6, borderRadius:6,
                flexDirection:'row', alignItems:'center'}}
                colors={["#2193b0", "#6dd5ed"]}
                start={{x:0, y:1}} end={{x:1, y:1}}>
                <Text style={{fontSize:16,fontFamily:FONTS.RALEWAY_BOLD,color:COLORS_LIGHT_THEME.LIGHT}}>
                  {'bookmarks '}
                </Text>
                <Icon name="arrow-right" type="feather" size={20} color={COLORS_LIGHT_THEME.LIGHT}/>
              </LinearGradient>
            </Ripple>
        </SView>
        {this.renderCategory()}
        {this.renderFloatingButton()}
        {/* <BottomTab icon_index={2}/> */}
      </View>
    );
  }
}

const mapStateToProps = (state) =>{
  return({
    loading: state.write.loading,
    myArticles: state.write.myArticles,
    published: state.write.published,
    isDraft: state.write.isDraft,
    reload: state.write.reload,

    theme: state.chat.theme,
    COLORS: state.chat.COLORS,
  })
}

export default connect(mapStateToProps, {setAuthToken, getMyArticles, clearPublish})(Write);

const styles = StyleSheet.create({
  TextStyle:{
    fontSize:24,
    fontFamily:FONTS.GOTHAM_BLACK,
  },
  CategoryTextStyle:{
    fontFamily:FONTS.HELVETICA_NEUE,
    fontSize:16,
  },
  ButtonTextStyle:{
    fontFamily:FONTS.GOTHAM_BLACK,
    fontSize:30,
    color:COLORS_LIGHT_THEME.LIGHT
  }
})