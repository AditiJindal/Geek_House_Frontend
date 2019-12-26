import React, {Component} from 'react';
import { View, StyleSheet, Text, StatusBar, Alert}from 'react-native';
import {connect} from 'react-redux'
import {FONTS, COLORS_LIGHT_THEME} from '../Constants'
import LinearGradient from 'react-native-linear-gradient';
import {
  gotLoginData, loginGoogle,loginFacebook, checkLogin
} from '../actions';
import Loading from '../components/Loading';
import { Button } from 'react-native-elements';
import changeNavigationBarColor from 'react-native-navigation-bar-color'
import Image from 'react-native-fast-image';
// import { GoogleSignin, GoogleSigninButton } from 'react-native-google-signin';


// import firebase from 'firebase';

// const firebaseConfig = {
//   apiKey: "AIzaSyB-b5_w7LqCjEVrVd_FvbIw3ZMHuF8mrWs",
//   authDomain: "bookings-d8824.firebaseapp.com",
//   databaseURL: "https://bookings-d8824.firebaseio.com",
//   projectId: "bookings-d8824",
//   storageBucket: "bookings-d8824.appspot.com",
//   messagingSenderId: "247553799156",
//   appId: "1:247553799156:web:7bc0128a8769b422",
//   measurementId: "G-9BVT126H1Z"
// };

// firebase.initializeApp(firebaseConfig)



class Login extends Component {
  constructor() {
    super();
    this.state={
      googleLoading:false,
      facebookLoading:false,
      // loading:true,
    }
  }

  async componentDidMount(){
    this.props.checkLogin();
    }

  renderGoogleButton(){
      if (!this.props.loading){
        if (!this.props.googleLoading){
          return (
            <Button
              buttonStyle={styles.GoogleButtonStyle}
              onPress={() => {
                if (!this.props.facebookLoading && !this.props.googleLoading)
                  this.props.loginGoogle();
                }
              }
              title="SignIn With Google"
              titleStyle={styles.GoogleButtonTextStyle}
              icon={
                <Image source={require('../../assets/icons/google.png')}
                  style={{height:32, width:32, marginRight:20}}
                />
              }
            />
          );
        }
        else{
          return (
            <View style={{...styles.GoogleButtonStyle, justifyContent:'center', alignItems:'center'}}>
              <Loading size={48}/>
            </View>
          );
        }
      }
      else{
        return <View/>
      }
    }

    renderFacebookButton(){
      if (!this.props.loading){
        if (!this.props.facebookLoading){
          return (
            <Button
              buttonStyle={styles.FacebookButtonStyle}
              onPress={() => {
                if (!this.props.facebookLoading && !this.props.googleLoading)
                  this.props.loginFacebook()
                }}
              loading = {this.props.facebookLoading}
              title="Continue with Facebook"
              titleStyle={styles.FacebookButtonTextStyle}
              loadingProps={{color:'white', size:'large'}}
              icon={
                <Image source={require('../../assets/icons/facebook.png')}
                  style={{height:32, width:32, marginRight:20}}
                />
              }
            />
          );
        }
        else{
          return (
            <View style={{...styles.FacebookButtonStyle, justifyContent:'center', alignItems:'center'}}>
              <Loading size={48} white/>
            </View>
          );
        }
      }
      else{
        return <View/>
      }
    }
  
  displayErrorMessage(){
    if (this.props.error){
      Alert.alert(this.props.error)
    }
  }

  _renderLogin(){
    return(
      <View style={{flex:1}}>
        <View style={{flex:2, justifyContent:'center', alignItems:'center', flexWrap:'wrap', paddingHorizontal:80}}>
          <Image
            style={{height:200, width:200}}
            source={require('../../assets/images/loginIcon.png')}
          />
          {
            (this.props.loading)?<View/>:
            <Text style={styles.InfoTextStyle}>
              ALL NEW PLATFORM FOR SHARING KNOWLEDGE
            </Text>
          }
        </View>
        <View style={{padding:10, flex:1, justifyContent:'center', alignItems:'center'}}>
          {this.renderGoogleButton()}
          {this.renderFacebookButton()}
          {this.displayErrorMessage()}
        </View>
      </View>
    );
  }

  render() {
    return(
      <LinearGradient
      colors={[COLORS_LIGHT_THEME.THEME1, COLORS_LIGHT_THEME.THEME2]}
      style={{flex:1, justifyContent:'flex-end', alignItems:'center'}}>
        <StatusBar 
          barStyle='light-content' 
          backgroundColor={COLORS_LIGHT_THEME.THEME1}/>
        {changeNavigationBarColor(COLORS_LIGHT_THEME.THEME2, false)}
        {
          (this.props.loading)?
          <View style={{flex:1, justifyContent:'center', alignItems:'center'}}>
            <Loading white size={128}/>
          </View>:
          this._renderLogin()
        }
      </LinearGradient>

    );
  }
}

const mapStateToProps = (state) => {
  return {
    googleLoading:state.login.googleLoading,
    facebookLoading:state.login.facebookLoading,
    error:state.login.error,
    loading: state.login.loading
  };
}

export default connect(mapStateToProps, {
  gotLoginData, loginGoogle,loginFacebook, checkLogin
})(Login);


const styles = StyleSheet.create({
    GoogleButtonStyle:{
      borderRadius:12,
      width:250,
      height:50,
      backgroundColor:'white',
      margin:5,
      elevation:7
    },

    FacebookButtonStyle:{
      borderRadius:12,
      width:250,
      height:50,
      backgroundColor:'rgb(24, 119, 242)',
      margin:5,
      elevation:7
    },
    
    GoogleButtonTextStyle:{
      color:'rgb(100,100,100)',
      fontFamily:FONTS.PRODUCT_SANS,
      marginHorizontal:5,
      fontSize:18
    },
    FacebookButtonTextStyle:{
      color:'white',
      fontFamily:FONTS.HELVETICA_NEUE,
      marginHorizontal:5,
      fontSize:15
    },
    InfoTextStyle:{
      color:'white',
      fontSize:16,
      fontFamily:FONTS.ROBOTO_BOLD,
      flexWrap:'wrap',
      textAlign:'center'
    }
 
})