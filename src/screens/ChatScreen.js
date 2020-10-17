import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Keyboard,
  BackHandler,
  ImageBackground,
  TouchableOpacity,
} from 'react-native';
import {connect} from 'react-redux';
import {Badge, Icon} from 'react-native-elements';
import {FONTS, SCREENS} from '../Constants';
import {
  sendMessage,
  checkMessagesObject,
  sendTyping,
  clearOtherUserData,
  setAuthToken,
  getChatPeopleExplicitly,
  getCurrentUserMessages,
  onImageSelect,
  onComposerTextChanged,
  getChatGroupParticipants,
} from '../actions/ChatAction';
import {Avatar, ChatInfo, TimedAlert, GiftedChat} from '../components';
import {getRingColor} from '../utilities/experience';

class ChatScreen extends React.PureComponent {
  state = {
    imageViewerSelected: false,
    chatInfoVisible: false,
    chatInfoLoading: false,
  };
  backHandler = null;

  componentDidMount() {
    this.props.setAuthToken();
    this.props.getCurrentUserMessages(
      this.props.other_user_data._id,
      this.props.user_id,
      this.props.quick_replies_enabled,
    );
    this.keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', () =>
      this.keyboardDidShow(),
    );
    this.keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () =>
      this.keyboardDidHide(),
    );
    this.backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      if (this.props.other_user_data.newEntry) {
        this.props.getChatPeopleExplicitly();
      }
      this.props.clearOtherUserData();
    });
  }

  componentWillUnmount() {
    this.keyboardDidHideListener.remove();
    this.keyboardDidShowListener.remove();
    this.backHandler.remove();
  }

  keyboardDidShow() {
    this.props.sendTyping(
      this.props.socket,
      true,
      this.props.other_user_data._id,
    );
  }

  keyboardDidHide() {
    this.props.sendTyping(
      this.props.socket,
      false,
      this.props.other_user_data._id,
    );
  }

  renderStatus(status) {
    const {COLORS} = this.props;
    let jsx = null;

    if (this.props.other_user_data.newEntry || !status) {
      return <Text />;
    }

    if (status.typing) {
      jsx = <Text style={{color: COLORS.YELLOW}}>typing</Text>;
    } else if (status.online) {
      jsx = <Text style={{color: COLORS.GREEN}}>online</Text>;
    } else {
      jsx = <Text style={{color: COLORS.RED}}>offline</Text>;
    }

    return (
      <Text style={{fontSize: 16, color: COLORS.LESS_DARK}}>
        {' is '}
        {jsx}
      </Text>
    );
  }

  imageUrlCorrector(image_url) {
    if (!this.props.image_adder) {
      return '';
    }
    if (image_url.substring(0, 4) !== 'http') {
      image_url = this.props.image_adder + image_url;
    }
    return image_url;
  }

  handleChatInfo = async () => {
    if (this.props.other_user_data.isGroup) {
      const {chat_group_participants} = this.props;
      const groupParticipants =
        chat_group_participants[this.props.other_user_data._id];
      if (!groupParticipants) {
        this.props.getChatGroupParticipants(this.props.other_user_data._id);
      }
      this.setState({chatInfoVisible: true});
    }
  };

  renderHeaderAvatar() {
    const {COLORS, other_user_data} = this.props;
    return (
      <View>
        <Avatar
          size={48}
          uri={this.imageUrlCorrector(other_user_data.image_url)}
          ring_color={getRingColor(other_user_data.userXP)}
          onPress={this.handleChatInfo}
        />
        {!other_user_data.newEntry &&
        !other_user_data.isGroup &&
        this.props.status.hasOwnProperty(other_user_data._id) &&
        this.props.status[other_user_data._id].online ? (
          <Badge
            status="success"
            containerStyle={{position: 'absolute', top: 2, right: 2}}
            badgeStyle={{
              height: 10,
              width: 10,
              borderRadius: 5,
              borderWidth: 1,
              borderColor: COLORS.LIGHT,
            }}
          />
        ) : null}
      </View>
    );
  }

  renderHeader() {
    const {COLORS, chatGroupsLeft, other_user_data} = this.props;
    return (
      <View
        style={{
          paddingVertical: 4,
          elevation: 25,
          alignItems: 'center',
          flexDirection: 'row',
          width: '100%',
          backgroundColor: COLORS.LIGHT,
          paddingHorizontal: 10,
        }}>
        <View style={{flexDirection: 'row', alignItems: 'center'}}>
          {this.renderHeaderAvatar()}
          <View
            style={{
              justifyContent: 'center',
              marginLeft: 10,
              flex: 6,
              alignItems: 'center',
            }}>
            <Text style={{...styles.TextStyle, color: COLORS.LESS_DARK}}>
              {other_user_data.name}
              {!other_user_data.isGroup
                ? this.renderStatus(this.props.status[other_user_data._id])
                : null}
            </Text>
            {other_user_data.fav_category ? (
              <Text
                style={{
                  ...styles.InterestStyle,
                  color:
                    this.props.theme === 'light'
                      ? COLORS.LIGHT_GRAY
                      : COLORS.LESS_DARK,
                }}>
                {other_user_data.fav_category}
              </Text>
            ) : null}

            {chatGroupsLeft.includes(other_user_data._id) ? (
              <Text
                style={{
                  ...styles.InterestStyle,
                  color:
                    this.props.theme === 'light'
                      ? COLORS.LIGHT_GRAY
                      : COLORS.LESS_DARK,
                }}>
                You are not a member anymore
              </Text>
            ) : null}
          </View>
          {!this.state.imageViewerSelected ? (
            <TouchableOpacity
              style={{
                height: 32,
                width: 48,
                justifyContent: 'center',
                alignItems: 'center',
              }}
              onPress={() => {
                if (other_user_data.newEntry) {
                  this.props.getChatPeopleExplicitly();
                }
                this.props.navigation.goBack();
                this.props.clearOtherUserData();
              }}>
              <Icon
                name="x-circle"
                size={22}
                color={COLORS.RED}
                type={'feather'}
              />
            </TouchableOpacity>
          ) : (
            <View style={{height: 32, width: 48}} />
          )}
        </View>
      </View>
    );
  }

  render() {
    const {
      COLORS,
      chatScreenState,
      other_user_data,
      chatGroupsLeft,
    } = this.props;

    return (
      <View style={{backgroundColor: COLORS.LIGHT}}>
        {other_user_data.isGroup ? (
          <ChatInfo
            COLORS={COLORS}
            isVisible={this.state.chatInfoVisible}
            onBackdropPress={() => this.setState({chatInfoVisible: false})}
            isLoading={this.props.chatInfoLoading}
            currentUserId={this.props.user_id}
            other_user_data={other_user_data}
            image_adder={this.props.image_adder}
          />
        ) : null}
        <ImageBackground
          style={{height: '100%', width: '100%'}}
          blurRadius={this.props.chat_background.blur}
          source={
            !!this.props.chat_background.image
              ? {uri: this.props.chat_background.image}
              : require('../../assets/default_chat_background.jpg')
          }>
          {this.renderHeader()}
          <TimedAlert
            onRef={(ref) => (this.timedAlert = ref)}
            theme={this.props.theme}
            COLORS={COLORS}
          />
          {this.props.loading ? (
            <Text>LOADING</Text>
          ) : (
            <View style={{flex: 1}}>
              <GiftedChat
                theme={this.props.theme}
                COLORS={COLORS}
                primaryStyle={{
                  backgroundColor:
                    this.props.theme === 'light'
                      ? COLORS.LIGHT
                      : COLORS.LESSER_LIGHT,
                  elevation: 7,
                }}
                textInputStyle={{
                  color: COLORS.LESS_DARK,
                  backgroundColor: 'rgba(0,0,0,0)',
                  marginTop: 2,
                }}
                messages={this.props.currentMessages}
                onSend={(message) => {
                  this.props.sendMessage(
                    this.props.socket,
                    [{...message[0], isGroup: other_user_data.isGroup}],
                    other_user_data._id,
                    chatScreenState.selectedImage,
                  );
                }}
                placeholder="Type something"
                renderAvatar={null}
                showTimedAlert={(duration, message) => {
                  this.timedAlert.showAlert(duration, message, 46);
                }}
                quick_replies={this.props.quick_replies}
                user={{_id: this.props.authtoken}}
                selectedImage={chatScreenState.selectedImage}
                onComposerTextChanged={this.props.onComposerTextChanged}
                onImageSelect={this.props.onImageSelect}
                hasLeftGroup={chatGroupsLeft.includes(other_user_data._id)}
                onImageCross={() => {
                  this.props.onImageSelect(null, {
                    name: '',
                    oldSize: null,
                    newSize: null,
                  });
                }}
                image_adder={this.props.image_adder}
                onViewerSelect={(value) => {
                  this.setState({imageViewerSelected: value});
                }}
                internetReachable={this.props.internetReachable}
                text={chatScreenState.text}
                imageMetaData={chatScreenState.imageMetaData}
                imageUploading={chatScreenState.imageUploading}
              />
            </View>
          )}
        </ImageBackground>
      </View>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    authtoken: state.login.authtoken,
    internetReachable: state.login.internetReachable,

    image_adder: state.home.image_adder,

    loading: state.chat.loading,
    other_user_data: state.chat.other_user_data,
    user_id: state.chat.user_id,
    socket: state.chat.socket,
    status: state.chat.status,
    theme: state.chat.theme,
    COLORS: state.chat.COLORS,
    currentMessages: state.chat.currentMessages,
    chat_background: state.chat.chat_background,
    quick_replies: state.chat.quick_replies,
    quick_replies_enabled: state.chat.quick_replies_enabled,
    chatScreenState: state.chat.chatScreenState,
    chat_group_participants: state.chat.chat_group_participants,
    chatInfoLoading: state.chat.chatInfoLoading,
    chatGroupsLeft: state.chat.chatGroupsLeft,
  };
};

export default connect(mapStateToProps, {
  setAuthToken,
  sendMessage,
  getChatPeopleExplicitly,
  checkMessagesObject,
  sendTyping,
  clearOtherUserData,
  getCurrentUserMessages,
  onImageSelect,
  onComposerTextChanged,
  getChatGroupParticipants,
})(ChatScreen);

const styles = StyleSheet.create({
  TextStyle: {
    fontSize: 20,
    fontFamily: FONTS.PRODUCT_SANS_BOLD,
    flexWrap: 'wrap',
  },
  InterestStyle: {
    fontSize: 10,
    fontFamily: FONTS.PRODUCT_SANS,
  },
});
