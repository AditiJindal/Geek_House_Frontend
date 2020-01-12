import React, {Component} from 'react';
import { View, Text, StyleSheet, StatusBar, 
  TouchableOpacity, TextInput, ScrollView, BackHandler} from 'react-native';
import {connect} from 'react-redux'
import {setContents, showAlert, clearPublish, setDraft} from '../actions/WriteAction'
import {FONTS, ERROR_BUTTONS, COLORS_LIGHT_THEME,LOG_EVENT} from '../Constants';
import {Icon} from 'react-native-elements';
import {Dropdown} from '../components/Dropdown';
import {logEvent} from '../actions/ChatAction';
import {Actions} from 'react-native-router-flux';
import WriteView from '../components/WriteView';
import CustomAlert from '../components/CustomAlert';
import LinearGradient from 'react-native-linear-gradient';
import ArticleTile from '../components/ArticleTile';
import changeNavigationBarColor from 'react-native-navigation-bar-color';
import SView from 'react-native-simple-shadow-view';
import TimedAlert from '../components/TimedAlert'
// import console = require('console');


class WriteArticle extends Component {
  constructor() {
    super();
    this.state={
      contents:[],
      topic:'',
      category:'',
      childAlertVisible:false,
      backAlertVisible:false,
    }
  }

  componentDidMount(){
    BackHandler.addEventListener('hardwareBackPress', 
    ()=>{
      if (Actions.currentScene==='writearticle'){
        this.setState({backAlertVisible:false});
        this.props.setContents(this.state.contents, this.state.topic, 
        this.state.category);this.props.setDraft();
        Actions.pop();
      }
    });
    if (this.props.contents){
      this.setState({contents:this.props.contents, topic:this.props.topic, category:this.props.category})
    };
  }

  renderFloatingButton(){
    if (this.state.contents.length<=9){
      return (
        <TouchableOpacity  style={{bottom:15, left:15, position:"absolute"}}
          activeOpacity={1} onPress={()=>{this.addWriteView()}}>
          <LinearGradient style={{height:58,width:58, borderRadius:29, 
          backgroundColor:"#E23636", elevation:7, justifyContent:'center', alignItems:"center",
          }} colors={["#fc6767","#ec008c"]}>
            <Icon name="plus" type="entypo" size={32} 
              color={COLORS_LIGHT_THEME.LIGHT}/>
          </LinearGradient>
        </TouchableOpacity>
      )
    }
    else{
      return <View/>
    }
  }

  renderNextButton(){
    const {COLORS} = this.props;
    let nextEnabled = true;
    let color = COLORS.GREEN
    let error = {title:"", content:"", type:[{label:ERROR_BUTTONS.TICK},]}
    

    if (this.state.topic.length===0){
      nextEnabled=false;
      color = COLORS.GRAY
      error.title = "No title given";
      error.content = "Please give a title to your article...";
    }

    else if (this.state.category.length===0){
      nextEnabled=false;
      color = COLORS.GRAY
      error.title = "No category provided";
      error.content = "Please provide a category for your article...";
    }

    else if (this.state.contents.length<2) {
      nextEnabled=false;
      color = COLORS.GRAY
      error.title = "Very less content";
      error.content = "You need to have atleast 2 cards in your article for publishing it";
    }

    else{
      this.state.contents.map((item, i) => {
        i=i+1;
        if (item.sub_heading.length===0){
          nextEnabled=false;
          color = COLORS.GRAY
          error.title = "No heading of card";
          error.content = "You have not provided the heading for card "+i+", please provide it.";
        }
        else if (item.sub_heading.length<2){
          nextEnabled=false;
          color = COLORS.GRAY
          error.title = "Very short heading";
          error.content = "Please elaborate the heading for card "+i;
        }
        else if (item.content.length===0){
          nextEnabled=false;
          color = COLORS.GRAY
          error.title = "No text in card";
          error.content = "Please add some text in card "+i;
        }
        else if (item.content.length<5){
          nextEnabled=false;
          color = COLORS.GRAY
          error.title = "Little text in card";
          error.content = "Please add some more text in card "+i;
        }
      })
    }
    
    return (
      <TouchableOpacity style={{borderRadius:10, height:58, paddingHorizontal:15,
        backgroundColor:COLORS.LIGHT, 
        elevation:7, justifyContent:'center', alignItems:"center",
        bottom:15, right:15, position:"absolute", borderColor:color, borderWidth:2}} 
        activeOpacity={1} 
        onPress={(nextEnabled)?()=>{
          this.props.setContents(this.state.contents, this.state.topic, this.state.category);
          Actions.replace("imageupload");logEvent(LOG_EVENT.SCREEN_CHANGE, 'imageupload');}: () => {this.props.showAlert(true, error)} }>
        <Text style={{fontFamily:FONTS.GOTHAM_BLACK, fontSize:24, color:color}}>NEXT</Text>
        <Text style={{fontFamily:FONTS.PRODUCT_SANS_BOLD, fontSize:12, color:color}}>upload image</Text>
      </TouchableOpacity>
    );
  }

  onContentChange(value, i){
    new_contents = this.state.contents;
    const obj = this.state.contents[i];
    const new_content = value;
    const new_obj = {sub_heading: obj.sub_heading, content:new_content};
    new_contents[i] = new_obj;
    this.setState({contents:new_contents});
  }

  onSubHeadingChange(value, i){
    new_contents = this.state.contents;
    const obj = this.state.contents[i];
    const new_sub_heading = value;
    const new_obj = {sub_heading: new_sub_heading, content:obj.content};
    new_contents[i] = new_obj;
    this.setState({contents:new_contents});
  }

  onClosePressed(remove_index){
    new_contents = [];
    this.state.contents.map((obj, i) => {     
      if (i!==remove_index){
        new_contents.push(obj)
      }      
    });
    this.setState({contents:new_contents})
  }

  renderGuidelines(){
    return (
      <View style={{flex:1,justifyContent:'center', alignItems:'center'}}>
        <ArticleTile
          theme={this.props.theme}
          size={180}
          data = {{image:"https://geek-house.s3.ap-south-1.amazonaws.com/guidlines.jpg",
          "topic":"Article Guidelines", "article_id":'guidelines'
          }}
          COLORS = {this.props.COLORS}
        />
      </View>
    )
  }

  onBackPress(){
    (this.state.topic.length!==0 || this.state.contents.length!==0)?
    this.setState({backAlertVisible:true}):
    Actions.replace("write");logEvent(LOG_EVENT.SCREEN_CHANGE, 'write');
  }

  renderWriteView(){
    return (
      <ScrollView ref={(scrollView)=> this.scrollView = scrollView}
        keyboardShouldPersistTaps="always">
        <View style={{height:70, width:1}}/>
        {this.renderCategoryDropdown()}
        {this.state.contents.map((obj, i)=>{
          return (
          <WriteView key={i}
            theme={this.props.theme}
            COLORS = {this.props.COLORS}
            obj={obj} index={i}
            timedAlert = {this.timedAlert}
            onClose={(i)=>{this.onClosePressed(i);}}
            onClosePressed = {()=>{this.setState({childAlertVisible:true})}}
            onContentChange={(value, i)=>{this.onContentChange(value, i)}}
            onSubHeadingChange={(value, i) => {this.onSubHeadingChange(value, i)}}
            onBackdropPress = {()=>{this.setState({childAlertVisible:false})}}
          />
          )
        })}
        <View style={{height:180}}/>
      </ScrollView>
    );
  }

  addWriteView(){
    new_contents = this.state.contents;
    new_contents.push({sub_heading:'', content:''})
    this.setState({contents: new_contents})
    if (this.scrollView){
      this.scrollView.scrollToEnd({animated:true})
    }
  }

  getStatusBarColor(){
    const {COLORS} = this.props;
    let statusBarColor = COLORS.LIGHT
    if (this.props.alertVisible || this.state.backAlertVisible || this.state.childAlertVisible){
      statusBarColor = COLORS.OVERLAY_COLOR
    }
    return statusBarColor
  }

  renderAlertForBack(){
    const {COLORS} = this.props;
    return (
      <View>
        <CustomAlert
          theme={this.props.theme}
          COLORS = {COLORS}
          isVisible = {this.state.backAlertVisible}
          onFirstButtonPress = {() => {this.setState({backAlertVisible:false});
              this.props.setContents(this.state.contents, this.state.topic, 
              this.state.category);this.props.setDraft(); Actions.pop() }}
          onSecondButtonPress= {() => {this.setState({backAlertVisible:false})}}
          onThirdButtonPress = {() => {this.setState({backAlertVisible:false}); this.props.clearPublish(); Actions.pop() }}
          onBackdropPress = {() => {this.setState({backAlertVisible:false})}}
          message = {{
            title: "Save article as draft",
            content: "You are writing an article, you can clear it, or save it as a draft",
            type:[
              {label:ERROR_BUTTONS.CROSS},
              {label:'  Clear  ', color:"#f5af19"},
              {label:ERROR_BUTTONS.TICK},
            ]
          }}
        />
      </View>
    )
  }

  renderCategoryDropdown(){
    const {COLORS} = this.props;
    let new_data=[];
    this.props.all_categories.map((item) => {new_data.push({value:item})})

    return (
      <View style={{marginHorizontal:25}}>
        <Dropdown
          theme={this.props.theme}
          COLORS = {COLORS}
          data = {new_data}
          label = "Select a Category"
          itemColor={(this.props.theme==='light')?COLORS.LESS_DARK:COLORS.LESSER_DARK}
          value={this.props.category}
          fontSize={20}
          labelFontSize={14}
          itemCount={6}
          containerStyle={{marginVertical:15}}
          itemTextStyle={{fontFamily:FONTS.PRODUCT_SANS}}
          textColor={(this.props.theme==='light')?COLORS.LESS_DARK:COLORS.LESSER_DARK}
          textSubColor={COLORS.LIGHT_GRAY}
          itemPadding={6}
          pickerStyle={{elevation:20, borderRadius:25, flex:1, paddingHorizontal:10,
            backgroundColor:COLORS.LIGHT,
            borderWidth:2,
            borderColor:(this.props.theme==='light')?COLORS.LIGHT:COLORS.GRAY}}
          onChangeText={(category)=>{this.setState({category})}}
        />
      </View>
    )
  }

  renderHeader(){
    const {COLORS} = this.props;
    return (
      <SView style={{shadowColor:'#202020',shadowOpacity:0.3, shadowOffset:{width:0,height:10},shadowRadius:8, 
        borderRadius:10, height:55, justifyContent:'space-between',alignSelf:'center',zIndex:10,
        alignItems:'center', flexDirection:'row', position:'absolute', width:"92%",top:10,
        backgroundColor:(this.props.theme==='light')?COLORS.LIGHT:COLORS.LESS_LIGHT, 
        paddingHorizontal:10,}}>
          <TouchableOpacity onPress={()=>{this.onBackPress()}}>
            <Icon name="arrow-left" type="material-community" size={26}
              containerStyle={{marginVertical:5, marginRight:15}} 
              color={COLORS.LESS_DARK}/>
          </TouchableOpacity>
          <TextInput
            textAlignVertical='top'
            keyboardAppearance="light"
            maxLength={128}
            onChangeText={(value) => {this.setState({topic:value})}}
            spellCheck={true}
            autoCapitalize="words"
            autoCorrect={true}
            placeholder={"Enter a title..."}
            value={this.state.topic}
            returnKeyType={"done"}
            placeholderTextColor={COLORS.LESSER_DARK}
            style={{...styles.TextStyle,color:COLORS.DARK, marginBottom:3}}
          />
      </SView>
    )
  }
  

  renderAlert(){
    const {COLORS} = this.props;
    if (this.props.alertVisible){
      return (
        <CustomAlert
          theme={this.props.theme}
          COLORS = {COLORS}
          isVisible = {this.props.alertVisible}
          onFirstButtonPress = {() => {this.props.showAlert(false, {})}}
          onSecondButtonPress= {() => {this.props.showAlert(false, {})}}
          onThirdButtonPress = {() => {this.props.showAlert(false, {})}}
          onBackdropPress = {() => {this.props.showAlert(false, {})}}
          message = {this.props.alertMessage}
        />
      )
    }
    return (<View/>)
  }

  render() {
    return(
      <View style={{flex:1, backgroundColor:this.props.COLORS.LIGHT}}>
        <StatusBar
          backgroundColor={this.getStatusBarColor()}
          barStyle={(this.props.theme==='light')?'dark-content':'light-content'}/>
        <TimedAlert theme={this.props.theme} onRef={ref=>this.timedAlert = ref} 
          COLORS = {COLORS}
        />
        {changeNavigationBarColor(this.getStatusBarColor(), (this.props.theme==='light'))}
        {this.renderAlert()}
        {this.renderAlertForBack()}
        {this.renderHeader()}
        {
          (this.state.contents.length===0)?
          this.renderGuidelines():
          this.renderWriteView()
        }
        {this.renderFloatingButton()}
        {this.renderNextButton(() => {})}

      </View>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    contents: state.write.contents,
    topic: state.write.topic,
    category: state.write.category,
    alertVisible: state.write.alertVisible,
    alertMessage: state.write.alertMessage,
    all_categories: state.write.all_categories,

    theme: state.chat.theme,
    COLORS: state.chat.COLORS,
  }
}

export default connect(mapStateToProps, {setContents, showAlert, clearPublish, setDraft})(WriteArticle)


const styles = StyleSheet.create({
  TextStyle:{
    fontSize:24,
    marginTop:6,
    flex:1,
    fontFamily:FONTS.RALEWAY,
  }, 
})