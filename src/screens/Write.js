import React, {Component} from 'react';
import {connect} from 'react-redux'
import { View, Text, StyleSheet, StatusBar, FlatList, TouchableOpacity, Image} from 'react-native';
import ArticleTile from '../components/ArticleTile';
import {setAuthToken, getMyArticles, clearPublish} from '../actions/WriteAction';
import {Icon} from "react-native-elements"; 
import BottomTab from '../components/BottomTab';
import ShimmerPlaceHolder from 'react-native-shimmer-placeholder';
import {logEvent} from '../actions/ChatAction'
import {FONTS, COLORS_LIGHT_THEME, COLORS_DARK_THEME, LOG_EVENT} from '../Constants';
import { Actions } from 'react-native-router-flux';
import LinearGradient from 'react-native-linear-gradient';
import { ScrollView } from 'react-native-gesture-handler';
import changeNavigationBarColor from 'react-native-navigation-bar-color';
import SView from 'react-native-simple-shadow-view';
// import console = require('console');



class Write extends Component {

  constructor() {
    super();
  }

  componentDidMount(){
    this.props.setAuthToken();
    this.props.getMyArticles(Object.keys(this.props.myArticles).length, this.props.reload);
  }

  renderTopics(articles){
    return(
      <FlatList data={articles}

        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(x) => x.article_id.toString()}

        renderItem = {({item}) => {
          return (
            <View style={{marginVertical:15, flexDirection:'row', marginHorizontal:5}}>
              <ArticleTile data={item} theme={this.props.theme}/>
            </View>
          )
        }}
      />
    )
  }

  renderCategory(){
    const data= this.props.myArticles;

    if (this.props.loading){
      return(
        <View style={{width:"100%"}}>
          <ScrollView style={{flex:1}} nestedScrollEnabled={true} showsVerticalScrollIndicator={false}>
            <ShimmerPlaceHolder colorShimmer={(this.props.theme==='light')?COLORS_LIGHT_THEME.SHIMMER_COLOR:COLORS_DARK_THEME.SHIMMER_COLOR} visible={false} autoRun={true} duration={600} delay={100}
              style={{height:35, borderRadius:5, marginTop:30, marginLeft:15, alignItems:'center', elevation:6}}
            />
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <ShimmerPlaceHolder colorShimmer={(this.props.theme==='light')?COLORS_LIGHT_THEME.SHIMMER_COLOR:COLORS_DARK_THEME.SHIMMER_COLOR} visible={false} style={{width:150, height:150, borderRadius:8,margin:15, marginHorizontal:5, elevation:6}}/>
              <ShimmerPlaceHolder colorShimmer={(this.props.theme==='light')?COLORS_LIGHT_THEME.SHIMMER_COLOR:COLORS_DARK_THEME.SHIMMER_COLOR} visible={false} style={{width:150, height:150, borderRadius:8,margin:15, marginHorizontal:5, elevation:6}}/>
              <ShimmerPlaceHolder colorShimmer={(this.props.theme==='light')?COLORS_LIGHT_THEME.SHIMMER_COLOR:COLORS_DARK_THEME.SHIMMER_COLOR} visible={false} style={{width:150, height:150, borderRadius:8,margin:15, marginHorizontal:5, elevation:6}}/>
            </ScrollView>

            <ShimmerPlaceHolder colorShimmer={(this.props.theme==='light')?COLORS_LIGHT_THEME.SHIMMER_COLOR:COLORS_DARK_THEME.SHIMMER_COLOR} visible={false} autoRun={true} duration={650} delay={30}
              style={{height:35, borderRadius:5, marginTop:30, marginLeft:15, alignItems:'center', elevation:6}}
            />
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <ShimmerPlaceHolder colorShimmer={(this.props.theme==='light')?COLORS_LIGHT_THEME.SHIMMER_COLOR:COLORS_DARK_THEME.SHIMMER_COLOR} visible={false} style={{width:150, height:150, borderRadius:8,margin:15, marginHorizontal:5, elevation:6}}/>
              <ShimmerPlaceHolder colorShimmer={(this.props.theme==='light')?COLORS_LIGHT_THEME.SHIMMER_COLOR:COLORS_DARK_THEME.SHIMMER_COLOR} visible={false} style={{width:150, height:150, borderRadius:8,margin:15, marginHorizontal:5, elevation:6}}/>
              <ShimmerPlaceHolder colorShimmer={(this.props.theme==='light')?COLORS_LIGHT_THEME.SHIMMER_COLOR:COLORS_DARK_THEME.SHIMMER_COLOR} visible={false} style={{width:150, height:150, borderRadius:8,margin:15, marginHorizontal:5, elevation:6}}/>
            </ScrollView>

            <ShimmerPlaceHolder colorShimmer={(this.props.theme==='light')?COLORS_LIGHT_THEME.SHIMMER_COLOR:COLORS_DARK_THEME.SHIMMER_COLOR} visible={false} autoRun={true} duration={700} delay={0}
              style={{height:35, borderRadius:5, marginTop:30, marginLeft:15, alignItems:'center', elevation:6}}
            />
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <ShimmerPlaceHolder colorShimmer={(this.props.theme==='light')?COLORS_LIGHT_THEME.SHIMMER_COLOR:COLORS_DARK_THEME.SHIMMER_COLOR} visible={false} style={{width:150, height:150, borderRadius:8,margin:15, marginHorizontal:5, elevation:6}}/>
              <ShimmerPlaceHolder colorShimmer={(this.props.theme==='light')?COLORS_LIGHT_THEME.SHIMMER_COLOR:COLORS_DARK_THEME.SHIMMER_COLOR} visible={false} style={{width:150, height:150, borderRadius:8,margin:15, marginHorizontal:5, elevation:6}}/>
              <ShimmerPlaceHolder colorShimmer={(this.props.theme==='light')?COLORS_LIGHT_THEME.SHIMMER_COLOR:COLORS_DARK_THEME.SHIMMER_COLOR} visible={false} style={{width:150, height:150, borderRadius:8,margin:15, marginHorizontal:5, elevation:6}}/>
            </ScrollView>
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
            showsVerticalScrollIndicator={false}
            keyExtractor={(x) => x}
            renderItem = {({item}) => {
              return (
                <View style={{marginTop:25, alignItems:'flex-start', justifyContent:'flex-start'}}>
                  <View style={{flex:1, marginLeft:15 }}>
                    <View style={{borderRadius:5, padding:5, paddingHorizontal:10, borderWidth:2, 
                      borderColor:(this.props.theme==='light')?COLORS_LIGHT_THEME.LIGHT_GRAY:COLORS_DARK_THEME.GRAY}}>
                      <Text style={{...styles.CategoryTextStyle, 
                        color:(this.props.theme==='light')?COLORS_LIGHT_THEME.LIGHT_GRAY:COLORS_DARK_THEME.GRAY}}>{item}</Text>
                    </View>
                  </View>
                  {this.renderTopics(data[item])}
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
      <TouchableOpacity style={{justifyContent:'center', alignItems:"center",bottom:70, 
        left:15, position:"absolute"}} activeOpacity={0.5} 
        onPress={()=>{(this.props.isDraft)?()=>{}:this.props.clearPublish(); Actions.jump('writearticle');logEvent(LOG_EVENT.SCREEN_CHANGE, 'writearticle');}}>
        <SView style={{borderRadius:10, shadowOpacity:0.4,shadowRadius:6,
          shadowOffset: { height:7}, shadowColor:'#f12711', 
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
      </TouchableOpacity>
    )
  }

  render() {
    return(
      <View style={{flex:1,justifyContent:'space-between',backgroundColor:(this.props.theme==='light')?COLORS_LIGHT_THEME.LIGHT:COLORS_DARK_THEME.LIGHT}}>
        <StatusBar 
          barStyle={(this.props.theme==='light')?'dark-content':'light-content'}
          backgroundColor={(this.props.theme==='light')?COLORS_LIGHT_THEME.LIGHT:COLORS_DARK_THEME.LIGHT}
        />
        {changeNavigationBarColor((this.props.theme==='light')?COLORS_LIGHT_THEME.LIGHT:COLORS_DARK_THEME.LIGHT, (this.props.theme==='light'))}
        
        <SView style={{borderRadius:10, margin:8, height:70, justifyContent:'space-between',
          alignItems:'center', flexDirection:'row', shadowColor:'#202020',shadowOpacity:0.3,
          shadowOffset:{width:0,height:10},shadowRadius:8,
          backgroundColor:(this.props.theme==='light')?COLORS_LIGHT_THEME.LIGHT:COLORS_DARK_THEME.LESS_LIGHT, paddingHorizontal:25}}>
            <Text style={{...styles.TextStyle, 
              color:(this.props.theme==='light')?COLORS_LIGHT_THEME.DARK:COLORS_DARK_THEME.DARK}}>
              my articles
            </Text>
        </SView>
        {
          (Object.keys(this.props.myArticles).length!==0)?
          (<ScrollView showsVerticalScrollIndicator={false}>
            {this.renderCategory()}
            <View style={{height:150}}/>
          </ScrollView> ):
          (
          <View style={{flex:1, justifyContent:'center', alignItems:'center', marginHorizontal:30, marginBottom:50}}>
            <Text style={{textAlign:'center', fontFamily: FONTS.PRODUCT_SANS_BOLD, fontSize:18, 
              color:(this.props.theme==='light')?COLORS_LIGHT_THEME.LESS_DARK:COLORS_DARK_THEME.LESS_DARK}}>
              You have not written any articles, you can start writing one by tapping on the NEW button
            </Text>
          </View>
          )
        }
        {this.renderFloatingButton()}

        <View style={{bottom:50, height:0}}>
          <BottomTab icon_index={2}/>
        </View>

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

    theme: state.chat.theme
  })
}

export default connect(mapStateToProps, {setAuthToken, getMyArticles, clearPublish})(Write);

const styles = StyleSheet.create({
  TextStyle:{
    fontSize:28,
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