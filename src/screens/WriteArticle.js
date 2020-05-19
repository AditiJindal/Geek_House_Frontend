import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
  TextInput,
  BackHandler,
  FlatList,
} from 'react-native';
import {connect} from 'react-redux';
import {
  setContents,
  showAlert,
  clearPublish,
  setDraft,
} from '../actions/WriteAction';
import Ripple from '../components/Ripple';
import {
  FONTS,
  ERROR_BUTTONS,
  COLORS_LIGHT_THEME,
  ALL_CATEGORIES,
} from '../Constants';
import {Icon} from 'react-native-elements';
import {Dropdown} from '../components/Dropdown';
import {Actions} from 'react-native-router-flux';
import WriteView from '../components/WriteView';
import CustomAlert from '../components/CustomAlert';
import LinearGradient from 'react-native-linear-gradient';
import ArticleTile from '../components/ArticleTile';
import changeNavigationBarColor from 'react-native-navigation-bar-color';
import SView from 'react-native-simple-shadow-view';
import TimedAlert from '../components/TimedAlert';

class WriteArticle extends React.Component {
  constructor() {
    super();
    this.state = {
      contents: [],
      topic: '',
      category: '',
      keys: 0,
      childAlertVisible: false,
      backAlertVisible: false,
    };
  }

  componentDidMount() {
    BackHandler.addEventListener('hardwareBackPress', () => {
      if (this.state.topic.length !== 0 || this.state.contents.length !== 0) {
        this.props.setContents(
          this.state.contents,
          this.state.topic,
          this.state.category,
          this.props.editing_article_id,
        );
        this.props.setDraft();
      }
    });
    if (this.props.contents) {
      this.setState({
        contents: this.props.contents,
        topic: this.props.topic,
        category: this.props.category,
      });
    }
  }

  renderFloatingButton() {
    const {COLORS} = this.props;
    if (this.state.contents.length <= 9) {
      return (
        <Ripple
          style={{
            bottom: 15,
            left: 15,
            borderRadius: 29,
            overflow: 'hidden',
            position: 'absolute',
            elevation: 7,
            backgroundColor: COLORS.LIGHT,
            elevation: 7,
          }}
          rippleContainerBorderRadius={29}
          onPress={() => {
            this.addWriteView();
          }}>
          <LinearGradient
            style={{
              height: 58,
              width: 58,
              borderRadius: 29,
              justifyContent: 'center',
              alignItems: 'center',
            }}
            colors={['#fc6767', '#ec008c']}>
            <Icon
              name="plus"
              type="entypo"
              size={32}
              color={COLORS_LIGHT_THEME.LIGHT}
            />
          </LinearGradient>
        </Ripple>
      );
    } else {
      return null;
    }
  }

  renderNextButton() {
    const {COLORS} = this.props;
    let nextEnabled = true;
    let color = COLORS.GREEN;
    let error = {title: '', content: '', type: [{label: ERROR_BUTTONS.TICK}]};

    if (this.state.topic.length === 0) {
      nextEnabled = false;
      color = COLORS.GRAY;
      error.title = 'No title given';
      error.content = 'Please give a title to your article...';
    } else if (this.state.category.length === 0) {
      nextEnabled = false;
      color = COLORS.GRAY;
      error.title = 'No category provided';
      error.content = 'Please provide a category for your article...';
    } else if (this.state.contents.length < 2) {
      nextEnabled = false;
      color = COLORS.GRAY;
      error.title = 'Very less content';
      error.content =
        'You need to have atleast 2 cards in your article for publishing it';
    } else {
      this.state.contents.map(item => {
        if (item.sub_heading.length === 0) {
          nextEnabled = false;
          color = COLORS.GRAY;
          error.title = 'No heading of card';
          error.content = `You have not provided the heading for card ${item.key}, please provide it.`;
        } else if (item.sub_heading.length < 2) {
          nextEnabled = false;
          color = COLORS.GRAY;
          error.title = 'Very short heading';
          error.content = `Please elaborate the heading for card ${item.key}`;
        } else if (item.content.length === 0) {
          nextEnabled = false;
          color = COLORS.GRAY;
          error.title = 'No text in card';
          error.content = `Please add some text in card ${item.key}`;
        } else if (item.content.length < 5) {
          nextEnabled = false;
          color = COLORS.GRAY;
          error.title = 'Little text in card';
          error.content = `Please add some more text in card ${item.key}`;
        }
      });
    }

    return (
      <Ripple
        style={{
          borderRadius: 10,
          height: 58,
          paddingHorizontal: 15,
          backgroundColor: COLORS.LIGHT,
          elevation: 7,
          justifyContent: 'center',
          alignItems: 'center',
          bottom: 15,
          right: 15,
          position: 'absolute',
          borderColor: color,
        }}
        rippleContainerBorderRadius={10}
        onPress={
          nextEnabled
            ? () => {
                this.props.setContents(
                  this.state.contents,
                  this.state.topic,
                  this.state.category,
                  this.props.editing_article_id,
                );
                Actions.replace('imageupload');
              }
            : () => {
                this.props.showAlert(true, error);
              }
        }>
        <Text
          style={{fontFamily: FONTS.GOTHAM_BLACK, fontSize: 24, color: color}}>
          NEXT
        </Text>
        <Text
          style={{
            fontFamily: FONTS.PRODUCT_SANS_BOLD,
            fontSize: 12,
            color: color,
          }}>
          upload image
        </Text>
      </Ripple>
    );
  }

  onContentChange(value, i) {
    this.state.contents[i].content = value;
    this.setState({contents: this.state.contents});
  }

  onSubHeadingChange(value, i) {
    this.state.contents[i].sub_heading = value;
    this.setState({contents: this.state.contents});
  }

  onCardImageChange(value, i) {
    this.state.contents[i].image = value;
    this.setState({contents: this.state.contents});
  }

  onClosePressed(remove_index) {
    new_contents = [];
    this.state.contents.map((obj, i) => {
      if (i !== remove_index) {
        new_contents.push(obj);
      }
    });
    this.setState({contents: new_contents});
  }

  renderGuidelines() {
    return (
      <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
        <ArticleTile
          theme={this.props.theme}
          size={180}
          data={{
            image: this.props.image_adder + 'guidlines.jpg',
            topic: 'Article Guidelines',
            article_id: 'guidelines',
          }}
          COLORS={this.props.COLORS}
        />
      </View>
    );
  }

  onBackPress() {
    this.state.topic.length !== 0 || this.state.contents.length !== 0
      ? this.setState({backAlertVisible: true})
      : Actions.pop();
  }

  renderWriteView() {
    const {COLORS, theme, image_adder} = this.props;
    return (
      <FlatList
        ref={scrollView => (this.scrollView = scrollView)}
        keyboardShouldPersistTaps="always"
        data={this.state.contents}
        ListHeaderComponent={
          <>
            <View style={{height: 80, width: 1}} />
            {this.renderEditingArticle()}
            {this.renderCategoryDropdown()}
          </>
        }
        ListFooterComponent={<View style={{height: 70, width: 1}} />}
        keyExtractor={item => item.key.toString()}
        renderItem={({item, index}) => (
          <WriteView
            key={index}
            theme={theme}
            COLORS={COLORS}
            obj={item}
            index={index}
            timedAlert={this.timedAlert}
            onClose={this.onClosePressed.bind(this)}
            onClosePressed={() => {
              this.setState({childAlertVisible: true});
            }}
            image_adder={image_adder}
            onContentChange={this.onContentChange.bind(this)}
            onSubHeadingChange={this.onSubHeadingChange.bind(this)}
            onCardImageChange={this.onCardImageChange.bind(this)}
            onBackdropPress={() => {
              this.setState({childAlertVisible: false});
            }}
          />
        )}
      />
    );
  }

  addWriteView() {
    contents = this.state.contents;
    contents.push({
      sub_heading: '',
      content: '',
      key: this.state.keys,
      image: null,
    });
    this.setState({contents: contents, keys: this.state.keys + 1});
    if (this.scrollView) {
      this.scrollView.scrollToEnd({animated: true});
    }
  }

  getStatusBarColor() {
    const {COLORS, theme} = this.props;
    let barStyle = theme === 'light' ? 'dark-content' : 'light-content';
    let statusBarColor = COLORS.LIGHT;
    if (this.props.overlayVisible) {
      statusBarColor = COLORS.OVERLAY_COLOR;
      barStyle = 'light-content';
    }
    return {statusBarColor, barStyle};
  }

  renderAlertForBack() {
    const {COLORS} = this.props;
    return (
      <View>
        <CustomAlert
          theme={this.props.theme}
          COLORS={COLORS}
          isVisible={this.state.backAlertVisible}
          onFirstButtonPress={() => {
            this.setState({backAlertVisible: false});
            this.props.setContents(
              this.state.contents,
              this.state.topic,
              this.state.category,
              null,
            );
            this.props.setDraft();
            Actions.pop();
          }}
          onSecondButtonPress={() => {
            this.setState({backAlertVisible: false});
          }}
          onThirdButtonPress={() => {
            this.setState({backAlertVisible: false});
            this.props.clearPublish();
            Actions.pop();
          }}
          onBackdropPress={() => {
            this.setState({backAlertVisible: false});
          }}
          message={{
            title: 'Save article as draft',
            content:
              'You are writing an article, you can clear it, or save it as a draft',
            type: [
              {label: ERROR_BUTTONS.CROSS},
              {label: '  Clear  ', color: '#f5af19'},
              {label: ERROR_BUTTONS.TICK},
            ],
          }}
        />
      </View>
    );
  }

  renderCategoryDropdown() {
    const {COLORS} = this.props;
    let new_data = [];
    ALL_CATEGORIES.map(item => {
      new_data.push({value: item});
    });

    return (
      <View style={{marginHorizontal: 25}}>
        <Dropdown
          COLORS={COLORS}
          data={new_data}
          label="Select a Category"
          value={this.props.category || 'Select One'}
          itemCount={7}
          onChangeText={category => {
            this.setState({category});
          }}
        />
      </View>
    );
  }

  renderHeader() {
    const {COLORS} = this.props;
    return (
      <SView
        style={{
          shadowColor: '#202020',
          shadowOpacity: 0.3,
          shadowOffset: {width: 0, height: 10},
          shadowRadius: 8,
          borderRadius: 10,
          height: 55,
          justifyContent: 'space-between',
          alignSelf: 'center',
          zIndex: 10,
          alignItems: 'center',
          flexDirection: 'row',
          position: 'absolute',
          width: '92%',
          top: 10,
          backgroundColor:
            this.props.theme === 'light' ? COLORS.LIGHT : COLORS.LESS_LIGHT,
          paddingHorizontal: 10,
        }}>
        <TouchableOpacity
          onPress={() => {
            this.onBackPress();
          }}>
          <Icon
            name="arrow-left"
            type="material-community"
            size={26}
            containerStyle={{marginVertical: 5, marginRight: 15}}
            color={COLORS.LESS_DARK}
          />
        </TouchableOpacity>
        <TextInput
          textAlignVertical="top"
          keyboardAppearance="light"
          maxLength={128}
          onChangeText={value => {
            this.setState({topic: value});
          }}
          spellCheck={true}
          autoCapitalize="words"
          autoCorrect={true}
          placeholder={'Enter a title...'}
          value={this.state.topic}
          returnKeyType={'done'}
          placeholderTextColor={COLORS.LESSER_DARK}
          style={{...styles.TextStyle, color: COLORS.DARK, marginBottom: 3}}
        />
      </SView>
    );
  }

  renderAlert() {
    const {COLORS} = this.props;
    if (this.props.alertVisible) {
      return (
        <CustomAlert
          theme={this.props.theme}
          COLORS={COLORS}
          isVisible={this.props.alertVisible}
          onFirstButtonPress={() => {
            this.props.showAlert(false, {});
          }}
          onSecondButtonPress={() => {
            this.props.showAlert(false, {});
          }}
          onThirdButtonPress={() => {
            this.props.showAlert(false, {});
          }}
          onBackdropPress={() => {
            this.props.showAlert(false, {});
          }}
          message={this.props.alertMessage}
        />
      );
    }
    return null;
  }

  renderEditingArticle() {
    const {COLORS, editing_article_id} = this.props;
    if (!editing_article_id) {
      return null;
    }
    return (
      <View
        style={{
          marginHorizontal: 25,
          backgroundColor: COLORS.LIGHT_BLUE,
          padding: 3,
          borderRadius: 7,
        }}>
        <Text
          style={{
            fontFamily: FONTS.PRODUCT_SANS,
            fontSize: 12,
            color: COLORS.LIGHT,
            alignSelf: 'center',
          }}>
          You are editing an article
        </Text>
      </View>
    );
  }

  render() {
    const {statusBarColor, barStyle} = this.getStatusBarColor();
    return (
      <View style={{flex: 1, backgroundColor: this.props.COLORS.LIGHT}}>
        <StatusBar backgroundColor={statusBarColor} barStyle={barStyle} />
        <TimedAlert
          theme={this.props.theme}
          onRef={ref => (this.timedAlert = ref)}
          COLORS={COLORS}
        />
        {changeNavigationBarColor(statusBarColor, this.props.theme === 'light')}
        {this.renderAlert()}
        {this.renderAlertForBack()}
        {this.renderHeader()}
        {this.state.contents.length === 0
          ? this.renderGuidelines()
          : this.renderWriteView()}
        {this.renderFloatingButton()}
        {this.renderNextButton()}
      </View>
    );
  }
}

const mapStateToProps = state => {
  return {
    image_adder: state.home.image_adder,

    contents: state.write.contents,
    topic: state.write.topic,
    category: state.write.category,
    alertVisible: state.write.alertVisible,
    alertMessage: state.write.alertMessage,
    editing_article_id: state.write.editing_article_id,

    theme: state.chat.theme,
    COLORS: state.chat.COLORS,
  };
};

export default connect(mapStateToProps, {
  setContents,
  showAlert,
  clearPublish,
  setDraft,
})(WriteArticle);

const styles = StyleSheet.create({
  TextStyle: {
    fontSize: 24,
    marginTop: 6,
    flex: 1,
    fontFamily: FONTS.NOE_DISPLAY,
  },
});
