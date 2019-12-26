import React, { Component } from 'react';
import { View, Text, TouchableOpacity, StatusBar, StyleSheet, ScrollView} from 'react-native';
import { connect } from 'react-redux';
import {logout} from '../actions';
import {logEvent} from '../actions/ChatAction';
import Loading from '../components/Loading';
import {setAuthToken, getSettingsData, settingsChangeFavouriteCategory, 
  changeTheme, changeAnimationSettings} from '../actions/SettingsAction';
import { Actions } from 'react-native-router-flux';
import {FONTS, COLORS_LIGHT_THEME, COLORS_DARK_THEME, LOG_EVENT} from '../Constants';
import LinearGradient from 'react-native-linear-gradient';
import { Icon } from 'react-native-elements';
import StarRating from 'react-native-star-rating';
import {Dropdown} from '../components/Dropdown';
import changeNavigationBarColor from 'react-native-navigation-bar-color';
import {Switch} from 'react-native-switch';


const getId = (id) => {
  id = id.replace('google','');
  id = id.replace('facebook','');
  return id
}

class Settings extends Component {

  componentDidMount(){

    this.props.setAuthToken();
    this.props.getSettingsData();
  }

  renderRating(rating){

    if (rating){
      return (
        <View style={{flexDirection:'row', alignItems:"center"}}>
          <StarRating
            activeOpacity={0.8}
            maxStars={rating}
            disabled={true}
            showRating={true}
            rating={rating}
            emptyStarColor={'#FFFFFF'}
            halfStarColor={(this.props.theme==='light')?'#f5af19':"rgb(243, 201, 33)"}
            fullStarColor={(this.props.theme==='light')?'#f5af19':"rgb(243, 201, 33)"}
            starSize={14}
            emptyStar={'star'}
            fullStar={'star'}
            halfStar={'star-half-o'}
          />
          <Text style={{...styles.TextStyling,fontSize:14, 
            color: (this.props.theme==='light')?COLORS_LIGHT_THEME.LESSER_DARK:COLORS_DARK_THEME.LESSER_DARK}}>
            {`  ${rating}/5`}
          </Text>
        </View>
      )
    }
    else{
      return (
        <Text style={{marginLeft:10, fontSize:10, 
          fontFamily:FONTS.HELVETICA_NEUE, 
            color:(this.props.theme==='light')?COLORS_LIGHT_THEME.LIGHT_GRAY:COLORS_DARK_THEME.LIGHT_GRAY}}>
          *Not yet rated
        </Text>
      )
    }
  }

  renderHeader(){
    return (
      <View style={{margin:8, height:70, justifyContent:'space-between',
        alignItems:'center', flexDirection:'row'}}>
        <TouchableOpacity
          activeOpacity={1}
          onPress={() => {Actions.pop()}}
          style={{justifyContent:'center', alignItems:'center',
          padding:3}}>
          <Icon name="arrow-left" type="material-community" size={26}
            containerStyle={{marginVertical:5, marginRight:15}} 
            color={(this.props.theme==='light')?COLORS_LIGHT_THEME.LESS_DARK:COLORS_DARK_THEME.LESS_DARK}/>
        </TouchableOpacity>

        <Text style={{...styles.HeadingTextStyling, 
          color:(this.props.theme==='light')?COLORS_LIGHT_THEME.DARK:COLORS_DARK_THEME.DARK}}>
          settings
        </Text>
      </View>
    )
  }

  renderLogoutButton(){
    return (
      <View style={{flex:1}}>
        <TouchableOpacity
          activeOpacity={1} style={{alignSelf:'flex-start', marginTop:15}}
          onPress={()=>{this.props.logout()}}>
          <LinearGradient
            colors={["#ef473a","#cb2d3e"]} 
            style={{elevation:5, justifyContent:'space-between',
            justifyContent:'center', alignItems:'center', flexDirection:'row', 
            backgroundColor:(this.props.theme==='light')?COLORS_LIGHT_THEME.LIGHT:COLORS_DARK_THEME.LIGHT,
            alignSelf:'flex-start', padding:15, borderRadius:15}}
            >
            <Text style={styles.LogoutButtonTextStyle}>Logout</Text>
            <Icon name="log-out" type="feather" size={20}
              color={COLORS_LIGHT_THEME.LIGHT}/>
          </LinearGradient>
          
        </TouchableOpacity>
      </View>
    )
  }

  renderThemeButton(){
    const oppositeTheme = (this.props.theme==='light')?'dark':'light'
    return (
      <View style={{flexDirection:'row',justifyContent:'space-between', alignItems:'center',borderColor:(this.props.theme==='light')?"#f953c6":"#6DD5FA",
        marginTop:10, borderRadius:15, padding:10, elevation:3,borderWidth:1,
        backgroundColor:(this.props.theme==='light')?COLORS_LIGHT_THEME.LIGHT:COLORS_DARK_THEME.LESS_LIGHT}}>
        <Text style={{marginRight:20, fontSize:26, fontFamily:FONTS.PRODUCT_SANS_BOLD,
          color:(this.props.theme==='light')?"#ff5ccd":"#8ce1ff"}}>
          Change Theme To
        </Text>
        <TouchableOpacity
          style={{alignSelf:'flex-start'}}
          activeOpacity={1}
          onPress={()=>{this.props.changeTheme((oppositeTheme)); logEvent(LOG_EVENT.CURRENT_VIEW_MODE, oppositeTheme)}}>
          <View style={{paddingVertical:8, borderRadius:8, elevation:2, borderWidth:1,
            backgroundColor:(this.props.theme==='light')?COLORS_LIGHT_THEME.LIGHT:COLORS_DARK_THEME.LESS_LIGHT,
            borderColor:(this.props.theme==='light')?"#f953c6":"#6DD5FA", width:80, justifyContent:'center', alignItems:'center'}}>
            <Text style={{fontFamily:FONTS.RALEWAY_BOLD, fontSize:16,
              color:(this.props.theme==='light')?"#f953c6":"#6DD5FA"}}>
              {oppositeTheme.toUpperCase()}
            </Text>
          </View>
        </TouchableOpacity>
      </View>
    )
  }

  renderUserInfo(){
    return (
      <View style={{
        borderRadius:10, padding:5, elevation: 5, 
        backgroundColor:(this.props.theme==='light')?COLORS_LIGHT_THEME.LIGHT:COLORS_DARK_THEME.LESS_LIGHT,
        paddingHorizontal:10,marginBottom:10}}>
        <View>
          <Text style={{...styles.SubheadingTextStyle, 
            color:(this.props.theme==='light')?COLORS_LIGHT_THEME.LESSER_DARK:COLORS_DARK_THEME.LESSER_DARK}}>Profile</Text>
        </View>
        <Text style={{...styles.TextStyling, color:(this.props.theme==='light')?COLORS_LIGHT_THEME.GRAY:COLORS_DARK_THEME.GRAY}}>
        <Text style={{fontSize:16, textDecorationLine:'underline'}}>Name</Text>: {this.props.data.name}</Text>

        <Text style={{...styles.TextStyling, color:(this.props.theme==='light')?COLORS_LIGHT_THEME.GRAY:COLORS_DARK_THEME.GRAY}}>
        <Text style={{fontSize:16, textDecorationLine:'underline'}}>Email</Text>: {this.props.data.email}</Text>
        
        <Text style={{...styles.TextStyling, color:(this.props.theme==='light')?COLORS_LIGHT_THEME.GRAY:COLORS_DARK_THEME.GRAY}}>
        <Text style={{fontSize:16, textDecorationLine:'underline'}}>Geek House ID</Text>: {getId(this.props.data.id)}</Text>

        <Text style={{...styles.TextStyling, color:(this.props.theme==='light')?COLORS_LIGHT_THEME.GRAY:COLORS_DARK_THEME.GRAY}}>
        <Text style={{fontSize:16, textDecorationLine:'underline'}}>Favourite Category</Text>: {this.props.fav_category}</Text>
      </View>
    )
  }

  renderArticlesYouViewedStats(){
    return (
      <View style={{
        borderRadius:10, padding:5, elevation: 5, backgroundColor:(this.props.theme==='light')?COLORS_LIGHT_THEME.LIGHT:COLORS_DARK_THEME.LESS_LIGHT,
        paddingHorizontal:10, marginVertical:10}}>
        <View>
          <Text style={{...styles.SubheadingTextStyle,
            color:(this.props.theme==='light')?COLORS_LIGHT_THEME.LESSER_DARK:COLORS_DARK_THEME.LESSER_DARK}}>Articles You Viewed</Text>
        </View>
        <Text style={{...styles.TextStyling, color:(this.props.theme==='light')?COLORS_LIGHT_THEME.GRAY:COLORS_DARK_THEME.GRAY}}>
        <Text style={{fontSize:14}}>Articles Viewed</Text>: {this.props.settingsData.articles_viewed}</Text>

        <View style={{flexDirection:'row', alignItems:'center'}}>
          <Text style={{...styles.TextStyling, color:(this.props.theme==='light')?COLORS_LIGHT_THEME.GRAY:COLORS_DARK_THEME.GRAY}}>
          <Text style={{fontSize:14}}>Average Rating Given by You</Text>{' :  '}</Text>
          {this.renderRating(this.props.settingsData.average_rating_given)}
        </View>
      </View>
    );
  }

  renderYourArticlesStats(){
    return (
      <View style={{
        borderRadius:10, padding:5, elevation: 5, backgroundColor:(this.props.theme==='light')?COLORS_LIGHT_THEME.LIGHT:COLORS_DARK_THEME.LESS_LIGHT,
        paddingHorizontal:10, marginVertical:10}}>
        <View>
          <Text style={{...styles.SubheadingTextStyle,
            color:(this.props.theme==='light')?COLORS_LIGHT_THEME.LESSER_DARK:COLORS_DARK_THEME.LESSER_DARK}}>On Your Articles</Text>
        </View>

        <Text style={{...styles.TextStyling, color:(this.props.theme==='light')?COLORS_LIGHT_THEME.GRAY:COLORS_DARK_THEME.GRAY}}>
        <Text style={{fontSize:14}}>Total Articles Written</Text>: {this.props.settingsData.articles_written}</Text>

        <Text style={{...styles.TextStyling, color:(this.props.theme==='light')?COLORS_LIGHT_THEME.GRAY:COLORS_DARK_THEME.GRAY}}>
        <Text style={{fontSize:14}}>Total Article Views</Text>: {this.props.settingsData.total_views_on_articles}</Text>
        
        <View style={{flexDirection:'row', alignItems:'center'}}>
          <Text style={{...styles.TextStyling, color:(this.props.theme==='light')?COLORS_LIGHT_THEME.GRAY:COLORS_DARK_THEME.GRAY}}>
          <Text style={{fontSize:14}}>Average Rating</Text>{' :  '}</Text>
          { this.renderRating(this.props.settingsData.average_rating_received)}
        </View>
      </View>
    );
  }

  renderDropdown(){
    let new_data=[];
    this.props.categories.forEach((item) => {new_data.push({value:item})})

    return (
      <View>
        <Text style={{...styles.TextStyling, color:(this.props.theme==='light')?COLORS_LIGHT_THEME.GRAY:COLORS_DARK_THEME.LESSER_DARK}}>Change Your Favourite Category</Text>
        <Dropdown
          theme={this.props.theme}
          data = {new_data}
          label = "Select a Category"
          value={this.props.fav_category}
          itemColor={(this.props.theme==='light')?COLORS_LIGHT_THEME.LESS_DARK:COLORS_DARK_THEME.LESSER_DARK}
          fontSize={20}
          labelFontSize={14}
          itemCount={6}
          textColor={(this.props.theme==='light')?COLORS_LIGHT_THEME.LESS_DARK:COLORS_DARK_THEME.LESSER_DARK}
          textSubColor={(this.props.theme==='light')?COLORS_LIGHT_THEME.LIGHT_GRAY:COLORS_DARK_THEME.LIGHT_GRAY}
          itemTextStyle={{fontFamily:FONTS.PRODUCT_SANS}}
          itemPadding={6}
          pickerStyle={{elevation:20, borderRadius:25, flex:1, paddingHorizontal:10, 
            backgroundColor:(this.props.theme==='light')?COLORS_LIGHT_THEME.LIGHT:COLORS_DARK_THEME.LIGHT, 
            borderWidth:2, 
            borderColor:(this.props.theme==='light')?COLORS_LIGHT_THEME.GRAY:COLORS_DARK_THEME.GRAY}}
          onChangeText={(selected_category) => {this.props.settingsChangeFavouriteCategory(selected_category)}}
        />
      </View>
    )
  }

  renderAnimationSwitch(){
    return(
      <View style={{marginVertical:5}}>
        <View style={{flexDirection:'row', alignItems:'center'}}>
          <Text style={{marginRight:30, fontSize:22, fontFamily:FONTS.PRODUCT_SANS_BOLD,
            color:(this.props.theme==='light')?COLORS_LIGHT_THEME.LESSER_DARK:COLORS_DARK_THEME.LESSER_DARK}}>
            Random Animations
          </Text>
          <Switch
            value = {this.props.animationOn}
            onValueChange = {()=>{this.props.changeAnimationSettings()}}
            backgroundActive={COLORS_LIGHT_THEME.GREEN}
            backgroundInactive={(this.props.theme==='light')?COLORS_LIGHT_THEME.GRAY:COLORS_DARK_THEME.GRAY}
            circleSize={22}
            barHeight={28}
            changeValueImmediately={true}
            innerCircleStyle={{elevation:5}}
            switchLeftPx={3}
            switchRightPx={3}
            circleBorderWidth={0}
            circleActiveColor={COLORS_LIGHT_THEME.LIGHT}
            circleInActiveColor={COLORS_LIGHT_THEME.LIGHT}
          />
        </View>
        <Text style={{fontSize:13, fontFamily:FONTS.RALEWAY, marginLeft:10,marginTop:5,
          color:(this.props.theme==='light')?COLORS_LIGHT_THEME.GRAY:COLORS_DARK_THEME.GRAY}}>
          {`Enable random animations and gestures\nwhich will occur from nowhere`}
        </Text>
      </View>
    )
  }

  renderSettings(){
    return (
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{paddingVertical:10, paddingHorizontal:25}}>
        {this.renderHeader()}
        {this.renderUserInfo()}
        {this.renderDropdown()}
        {this.renderArticlesYouViewedStats()}
        {this.renderYourArticlesStats()}
        {this.renderAnimationSwitch()}
        {this.renderThemeButton()}
        {this.renderLogoutButton()}
      </ScrollView>
    );
  }

  render(){
    return (
      <View style={{flex:1, backgroundColor:(this.props.theme==='light')?COLORS_LIGHT_THEME.LIGHT:COLORS_DARK_THEME.LIGHT}}>
        <StatusBar 
          barStyle={(this.props.theme==='light')?'dark-content':'light-content'}
          backgroundColor={(this.props.theme==='light')?COLORS_LIGHT_THEME.LIGHT:COLORS_DARK_THEME.LIGHT}
        />
        {changeNavigationBarColor((this.props.theme==='light')?COLORS_LIGHT_THEME.LIGHT:COLORS_DARK_THEME.LIGHT, (this.props.theme==='light'))}
        {
          (this.props.loading)?
          (<View style={{flex:1, justifyContent:'center', alignItems:'center'}}>
            <Loading size={128} white={(this.props.theme!=='light')} />
          </View>):
          this.renderSettings()
        }
      </View>
    );
  };
};

const mapStateToProps = (state) => {
  return {
    data: state.login.data,
    categories: state.login.categories,

    theme: state.chat.theme,

    settingsData: state.settings.settingsData,
    loading: state.settings.loading,
    fav_category: state.settings.fav_category,
    animationOn: state.chat.animationOn
  }
}

export default connect(mapStateToProps, {
  logout, setAuthToken, getSettingsData, settingsChangeFavouriteCategory, 
  changeTheme, changeAnimationSettings})(Settings);

const styles = StyleSheet.create({
  HeadingTextStyling:{
    fontSize:28,
    fontFamily:FONTS.GOTHAM_BLACK,
  },
  LogoutButtonTextStyle:{
    color:COLORS_LIGHT_THEME.LIGHT,
    fontFamily:FONTS.RALEWAY,
    fontSize:18,
    marginRight:15
  },
  SubheadingTextStyle: {
    fontFamily:FONTS.PRODUCT_SANS_BOLD,
    fontSize:22,
    marginBottom:10
  },
  TextStyling: {
    fontFamily: FONTS.PRODUCT_SANS,
    fontSize: 18,
    marginVertical:2
  }
})