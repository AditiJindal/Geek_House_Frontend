import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  BackHandler,
  FlatList,
} from 'react-native';
import {connect} from 'react-redux';
import Icon from 'react-native-vector-icons/Feather';
import LinearGradient from 'react-native-linear-gradient';
import SView from 'react-native-simple-shadow-view';

import {
  TimedAlert,
  ArticleTile,
  WriteView,
  CustomAlert,
  Dropdown,
  Ripple,
  ArticleInfo,
} from '../components';
import {imageUrlCorrector} from '../utilities';
import {
  setContents,
  showAlert,
  clearPublish,
  setDraft,
} from '../actions/WriteAction';
import {
  FONTS,
  ERROR_BUTTONS,
  COLORS_LIGHT_THEME,
  ALL_CATEGORIES,
  SCREENS,
} from '../Constants';

class WriteArticle extends React.Component {
  state = {
    contents: [],
    topic: '',
    category: '',
    keys: 0,
    childAlertVisible: false,
    backAlertVisible: false,
    infoVisible: false,
    articleData: {},
  };

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

  renderArticleInfo() {
    const {articleData, infoVisible} = this.state;

    return (
      <ArticleInfo
        navigation={this.props.navigation}
        onBackdropPress={() => {
          this.setState({infoVisible: false});
        }}
        isVisible={infoVisible}
        article_id={articleData.article_id}
        // for preview
        preview_contents={articleData.preview_contents}
        topic={articleData.topic}
        category={articleData.category}
      />
    );
  }

  renderFloatingButton() {
    const {COLORS} = this.props;
    if (this.state.contents.length <= 9) {
      return (
        <Ripple
          containerStyle={{
            bottom: 15,
            left: 15,
            borderRadius: 29,
            position: 'absolute',
            elevation: 7,
            backgroundColor: COLORS.LIGHT,
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
            <Icon name="plus" size={32} color={COLORS_LIGHT_THEME.LIGHT} />
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
      this.state.contents.map((item) => {
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
        containerStyle={{
          borderRadius: 10,
          height: 60,
          width: 100,
          backgroundColor: COLORS.LIGHT,
          elevation: 7,
          bottom: 15,
          right: 15,
          position: 'absolute',
          borderColor: color,
        }}
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
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
                this.props.navigation.replace(SCREENS.ImageUpload);
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
    const new_contents = [];
    this.state.contents.map((obj, i) => {
      if (i !== remove_index) {
        new_contents.push(obj);
      }
    });
    this.setState({contents: new_contents});
  }

  renderGuidelines() {
    const articleData = {
      image: imageUrlCorrector('guidlines.jpg'),
      topic: 'Article Guidelines',
      article_id: 'guidelines',
    };
    return (
      <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
        <ArticleTile
          size={180}
          data={articleData}
          COLORS={this.props.COLORS}
          onPress={() => this.setState({infoVisible: true, articleData})}
        />
      </View>
    );
  }

  onBackPress() {
    this.state.topic.length !== 0 || this.state.contents.length !== 0
      ? this.setState({backAlertVisible: true})
      : this.props.navigation.goBack();
  }

  renderWriteView() {
    const {COLORS, theme} = this.props;
    return (
      <FlatList
        ref={(scrollView) => (this.scrollView = scrollView)}
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
        keyExtractor={(item) => item.key.toString()}
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
    const new_content = {
      sub_heading: '',
      content: '',
      key: this.state.keys,
      image: null,
    };
    const contents = [...this.state.contents, new_content];
    this.setState({contents, keys: this.state.keys + 1});
    if (this.scrollView) {
      this.scrollView.scrollToEnd({animated: true});
    }
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
            this.props.navigation.goBack();
          }}
          onSecondButtonPress={() => {
            this.setState({backAlertVisible: false});
          }}
          onThirdButtonPress={() => {
            this.setState({backAlertVisible: false});
            this.props.clearPublish();
            this.props.navigation.goBack();
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
    ALL_CATEGORIES.map((item) => {
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
          onChangeText={(category) => {
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
            size={26}
            containerStyle={{marginVertical: 5, marginRight: 15}}
            color={COLORS.LESS_DARK}
          />
        </TouchableOpacity>
        <TextInput
          textAlignVertical="top"
          keyboardAppearance="light"
          maxLength={128}
          onChangeText={(value) => {
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
    return (
      <View style={{flex: 1, backgroundColor: this.props.COLORS.LIGHT}}>
        <TimedAlert
          theme={this.props.theme}
          onRef={(ref) => (this.timedAlert = ref)}
          COLORS={COLORS}
        />
        {this.renderAlert()}
        {this.renderAlertForBack()}
        {this.renderHeader()}
        {this.state.contents.length === 0
          ? this.renderGuidelines()
          : this.renderWriteView()}
        {this.renderFloatingButton()}
        {this.renderNextButton()}
        {this.renderArticleInfo()}
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
