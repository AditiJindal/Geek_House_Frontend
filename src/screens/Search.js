import React, {Component} from 'react';
import { View, Text, StyleSheet, StatusBar, RefreshControl,Dimensions,
  FlatList, ScrollView, TouchableOpacity, TextInput}from 'react-native';
import {connect} from 'react-redux';
import Loading from '../components/Loading';
import BottomTab from '../components/BottomTab'
import {FONTS, ERROR_MESSAGES,COLORS_LIGHT_THEME} from '../Constants';
import ArticleTile from '../components/ArticleTile';
import LinearGradient from 'react-native-linear-gradient';
import RaisedText from '../components/RaisedText';
import {Icon} from 'react-native-elements';
import _ from 'lodash';
import {
  getPopularSearches,
  setAuthToken,
  updateSearchValue,
  selectCategory,
  doSearch,
  clearSearch,
  showAlert
} from '../actions/SearchAction';
import {Dropdown} from '../components/Dropdown';
import CustomAlert from '../components/CustomAlert';
import ShimmerPlaceHolder from 'react-native-shimmer-placeholder';
import SView from 'react-native-simple-shadow-view';
import changeNavigationBarColor from 'react-native-navigation-bar-color';
import analytics from '@react-native-firebase/analytics';
import ArticleTileAds from '../components/ArticleTileAds';

class Search extends Component {
  state = {adIndex:0, adCategoryIndex: []}

  componentDidMount(){
    if (!this.props.popularSearchesData.response){
      this.props.setAuthToken();
      analytics().setCurrentScreen('Search', 'Search')
      this.props.getPopularSearches();
    }
  }

  renderTopics(articles, category, canShowAds){
    const {theme, COLORS, adsManager, canShowAdsRemote} = this.props;
    if (!this.state.adIndex && articles && (articles.length>2)){
      this.setState({adIndex: _.random(2, articles.length-1)})
    }
    return(
      <FlatList data={articles}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.article_id.toString()}

        renderItem = {({item, index}) => {
          return (
            <View style={{marginVertical:15, flexDirection:'row', marginHorizontal:5, alignItems:'center'}}>
              {
                (index===this.state.adIndex && index && adsManager && canShowAds && canShowAdsRemote)?(
                  <View style={{marginRight:10}}>
                    <ArticleTileAds theme={theme} 
                      COLORS = {COLORS} adsManager={adsManager}/>
                  </View>
                ):null
              }
              <ArticleTile data={{...item, category}} theme={theme} 
                COLORS = {COLORS}
              />
            </View>
          )
        }}
      />
    )
  }

  renderHeader(){
    const {COLORS} = this.props;
    return (
      <SView style={{shadowColor:'#202020',shadowOpacity:0.3, shadowOffset:{width:0,height:10},shadowRadius:8, 
        borderRadius:10, height:55, justifyContent:'space-between',alignSelf:'center',zIndex:10,
        alignItems:'center', flexDirection:'row', position:'absolute', width:"92%",top:10,
        backgroundColor:(this.props.theme==='light')?COLORS.LIGHT:COLORS.LESS_LIGHT, 
        paddingHorizontal:10}}>
          <Icon name="search" size={20} style={{marginVertical:5, marginHorizontal:5}} 
            color={COLORS.LESS_DARK} type={'feather'}/>
          <TextInput
            textAlignVertical='top'
            keyboardAppearance="light"
            maxLength={128}
            onChangeText={(search)=>{this.props.updateSearchValue(search)}}
            spellCheck={true}
            autoCapitalize="words"
            autoCorrect={true}
            placeholder={"search an article"}
            value={this.props.searchValue}
            returnKeyType={"done"}
            placeholderTextColor={COLORS.LESSER_DARK}
            style={{fontSize:20,marginTop:6,flex:1, borderBottomWidth:1, padding:0,
            paddingHorizontal:5, marginHorizontal:5, borderColor:COLORS.LESSER_DARK,
            fontFamily:FONTS.RALEWAY, color:COLORS.DARK, marginBottom:3}}
          />
          {
            (this.props.searchValue.length>0)?(
              <Icon
                name="x" onPress={()=>{this.props.clearSearch()}} color={COLORS.LESS_DARK}
                size={20} style={{marginLeft:10, marginRight:10}} type={'feather'}
              />
            ):null
          }
          <TouchableOpacity activeOpacity={1}
            onPress={()=>{
              if (this.props.loading){
                this.props.showAlert(true, ERROR_MESSAGES.LET_PREVIOUS_SEARCH_COMPLETE)
              }
              else if(this.props.searchValue.length>1){
                analytics().logSearch({search_term:this.props.searchValue});
                this.props.doSearch(this.props.searchValue, this.props.categorySelected)                            
              }
              else if(this.props.searchValue){
                this.props.showAlert(true, ERROR_MESSAGES.ONE_SEARCH_CHARACTER)          
              }
              else{
                this.props.showAlert(true, ERROR_MESSAGES.NO_SEARCH_CHARACTER)
              }
            }}>
            <LinearGradient style={{paddingHorizontal:10, paddingVertical:6, borderRadius:6,
              marginLeft:10,}}
              colors={((this.props.searchValue.length>1) && (!this.props.loading))?
                ['rgb(0,181, 213)','rgb(0,224, 211)']:
                [COLORS_LIGHT_THEME.GRAY,COLORS_LIGHT_THEME.GRAY]}
              start={{x:1, y:0}} end={{x:1, y:1}}>
              <Text style={{...styles.TextStyle,color:COLORS_LIGHT_THEME.LIGHT}}>
                search
              </Text>
            </LinearGradient>
          </TouchableOpacity>
      </SView>
    )
  }

  renderPopularSearches(){
    const {COLORS} = this.props; 
    let jsx = (
      <View style={{alignSelf:'flex-end'}}>
        <RaisedText text={'Discover New'} animationEnabled = {this.props.animationOn}
          theme={this.props.theme} secondaryText={'नई खोज करें'} COLORS = {COLORS} />
      </View>)

    let response = this.props.popularSearchesData.response

    if (this.props.searchResults){
      response = this.props.searchResults;
      jsx = null
    }

    if (this.props.loading){
      return(
        <View style={{flex:1}}>
          <ScrollView style={{flexGrow:1}} nestedScrollEnabled={true} showsVerticalScrollIndicator={false}>
            <ShimmerPlaceHolder colorShimmer={COLORS.SHIMMER_COLOR} visible={!this.props.loading} autoRun={true} duration={650} delay={0} 
            style={{marginRight:25, borderRadius:8, height:50, width:200, marginTop:10, elevation:6}}/>
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
          </ScrollView>
        </View>
      )

    }

    else{
      const category_list = Object.keys(response);
      if (!this.state.adCategoryIndex.length){
        this.setState({adCategoryIndex : [
          _.random(0, category_list.length),
          _.random(0, category_list.length),
          _.random(0, category_list.length),
          _.random(0, category_list.length),
          _.random(0, category_list.length)
        ]})
      }

      if (category_list.length===0){
        return (
          <View style={{height:Dimensions.get('window').height, width:"100%",paddingBottom:70, justifyContent:'center', alignItems:'center'}}>
            <Text style={{textAlign:'center', fontFamily: FONTS.PRODUCT_SANS_BOLD, fontSize:18, 
            color:COLORS.LESS_DARK}}>
              No results found
            </Text>
          </View>
        )
      }
      return (
        <FlatList
          data={category_list}
          contentContainerStyle={{width:"100%", flexGrow:1}}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent = {
            <View>
              <View style={{height:70, width:1}}/>
              {jsx}
              {this.renderSearchSettings()}
            </View>
          }
          ListFooterComponent = {<View style={{height:200, width:1}}/>}
          refreshControl={
            <RefreshControl onRefresh={()=>{this.props.getPopularSearches()}}
              colors={["rgb(0,181, 213)"]}
              refreshing={false}
            />
          }
          keyExtractor={(item, index) => index.toString()}
          renderItem = {({item, index}) => {  // item here is the category
            return (
              <View style={{marginTop:25, alignItems:'flex-start', justifyContent:'flex-start'}}>
                <View style={{flex:1, marginLeft:15 }}>
                  <View style={{borderRadius:5, padding:5, paddingHorizontal:10, borderWidth:2, borderColor:(this.props.theme==='light')?COLORS.LIGHT_GRAY:COLORS.GRAY}}>
                    <Text style={{...styles.CategoryTextStyle, 
                    color:(this.props.theme==='light')?COLORS.LIGHT_GRAY:COLORS.GRAY}}>
                      {item}
                    </Text>
                  </View>
                </View>
                {this.renderTopics(response[item], item, this.state.adCategoryIndex.includes(index) )}
              </View>
            )
          }}
        /> 
      )
    }
  }

  renderSearchSettings(){
    const {COLORS} = this.props;
    const {all_categories} = this.props.popularSearchesData;
    let new_data = [{value: "All Categories"}];
    if (all_categories){
      all_categories.map((item) => {new_data.push({value:item})})
      if(this.props.searchValue.length>1){
        
        return (
          <View style={{marginHorizontal:25}}>
            <Dropdown
              theme={this.props.theme}
              COLORS = {COLORS}
              data = {new_data}
              label = "Category Selection"
              itemColor={COLORS.LESS_DARK}
              value="All Categories"
              fontSize={20}
              labelFontSize={14}
              itemCount={6}
              containerStyle={{marginVertical:15}}
              itemTextStyle={{fontFamily:FONTS.PRODUCT_SANS}}
              textColor={COLORS.LESS_DARK}
              textSubColor={COLORS.LIGHT_GRAY}
              itemPadding={6}
              pickerStyle={{elevation:20, borderRadius:25, flex:1, paddingHorizontal:10,
                backgroundColor:COLORS.LIGHT,
                borderWidth:2,
                borderColor:(this.props.theme==='light')?COLORS.LIGHT:COLORS.GRAY}}
              onChangeText={(category)=>{this.props.selectCategory(category)}}
            />
          </View>
        )
      }
      else{
        return null
      }
    }
    else{
      return null
    }
  }

  renderAlert(){
    if (this.props.alertVisible){
      return (
        <CustomAlert
          theme={this.props.theme}
          COLORS = {this.props.COLORS}
          isVisible = {this.props.alertVisible}
          onFirstButtonPress = {() => {this.props.showAlert(false, {})}}
          onSecondButtonPress= {() => {this.props.showAlert(false, {})}}
          onThirdButtonPress = {() => {this.props.showAlert(false, {})}}
          onBackdropPress = {() => {this.props.showAlert(false, {})}}
          message = {this.props.alertMessage}
        />
      )
    }
    return (null)
  }

  getStatusBarColor(){
    const {COLORS} = this.props;
    let statusBarColor = COLORS.LIGHT
    if (this.props.alertVisible){
      statusBarColor = COLORS.OVERLAY_COLOR
    }
    return statusBarColor
  }

  render() {
    const {COLORS} = this.props;
    return(
      <View style={{flex:1,justifyContent:'space-between', 
      backgroundColor:COLORS.LIGHT}}>
        <StatusBar 
          barStyle={(this.props.theme==='light')?'dark-content':'light-content'}
          backgroundColor={this.getStatusBarColor()}/>
        {changeNavigationBarColor(this.getStatusBarColor(), (this.props.theme==='light'))}
        {this.renderAlert()}
        {this.renderHeader()}
        {
          
          (this.props.doingSearch)?
          <View style={{flex:1, justifyContent:'center', alignItems:'center'}}>
            <Loading size={128} white={(this.props.theme!=='light')}/>
          </View>:this.renderPopularSearches()
        }
        
        <BottomTab icon_index={1}/>
      </View>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    adsManager: state.home.adsManager,
    canShowAdsRemote: state.home.welcomeData.canShowAdsRemote,

    popularSearchesData: state.search.popularSearchesData,
    loading: state.search.loading,
    searchValue: state.search.searchValue,
    categorySelected: state.search.categorySelected,
    alertVisible: state.search.alertVisible,
    alertMessage: state.search.alertMessage,
    statusBarColor: state.search.statusBarColor,
    searchResults: state.search.searchResults,
    doingSearch: state.search.doingSearch,

    theme: state.chat.theme,
    COLORS: state.chat.COLORS,

    animationOn: state.chat.animationOn
  }  
}

export default connect(mapStateToProps, 
  {getPopularSearches, 
    setAuthToken,
    updateSearchValue,
    selectCategory,
    doSearch,
    clearSearch,
    showAlert}
  )(Search);


const styles = StyleSheet.create({
  TextStyle:{
    fontSize:18,
    fontFamily:FONTS.RALEWAY_BOLD,
  },
  SearchContainerStyle:{
    marginRight:0,
    padding:5,
    borderWidth:0,
    borderTopWidth:0,
    borderBottomWidth:0,
    elevation:3.5,
    borderRadius:12,
    flex:1,
    margin:10,
    height:50,
  },
  CategoryTextStyle:{
    fontFamily:FONTS.HELVETICA_NEUE,
    fontSize:16,
  }
})