import React from 'react';
import {connect} from 'react-redux';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import LinearGradient from 'react-native-linear-gradient';
import SView from 'react-native-simple-shadow-view';
import ImageResizer from 'react-native-image-resizer';
import ImageEditor from '@react-native-community/image-editor';

import {changeBarColors, imageUrlCorrector} from '../utilities';
import {
  ImageSelector,
  Ripple,
  ChatPeople,
  ChatPeopleSearch,
  Loading,
  TimedAlert,
  Avatar,
  Overlay,
} from '../components';
import {
  FONTS,
  COLORS_LIGHT_THEME,
  MAX_USERS_IN_A_GROUP,
  SCREENS,
} from '../Constants';
import {
  setUserData,
  createGroup,
  chatPeopleSearchAction,
  getChatPeopleExplicitly,
} from '../actions/ChatAction';

class Chat extends React.PureComponent {
  state = {
    chatPeopleSearchText: '',
    peopleSelectorVisible: false,
    newGroupData: {
      name: '',
      group_image: imageUrlCorrector('extra_images/group_icon.png'),
      users: [],
    },
    groupPeopleSelectorLoading: false,
    chatInfoVisible: false,
  };

  renderSection(title) {
    const {COLORS} = this.props;
    return (
      <View style={{alignItems: 'center'}}>
        {title === 'Chats' ? (
          <View
            style={{
              height: 0.5,
              width: '94%',
              backgroundColor: COLORS.GRAY,
              margin: 10,
            }}
          />
        ) : null}
        <View style={styles.SectionViewStyling}>
          <Text
            style={{...styles.SectionHeadingStyle, color: COLORS.LIGHT_GRAY}}>
            {title}
          </Text>
        </View>
      </View>
    );
  }

  onSearch() {
    if (this.state.chatPeopleSearchText.length === 0) {
      this.timedAlert.showAlert(2000, 'Please enter some text');
    } else if (this.state.chatPeopleSearchText.length === 0) {
      this.timedAlert.showAlert(2000, 'Please enter some more text');
    } else {
      this.props.chatPeopleSearchAction(this.state.chatPeopleSearchText);
    }
  }

  getImageResize(imageSize) {
    const MAX_WIDTH = 512;
    const MAX_HEIGHT = MAX_WIDTH;

    let resize = {...imageSize};
    let ratio = imageSize.width / imageSize.height;
    if (resize.width > MAX_WIDTH) {
      resize = {width: MAX_WIDTH, height: Math.floor(MAX_WIDTH / ratio)};
    }
    if (resize.height > MAX_HEIGHT) {
      resize = {width: Math.floor(MAX_HEIGHT * ratio), height: MAX_HEIGHT};
    }
    return resize;
  }

  getCropCoordinates({width, height}) {
    // needs to be in 1:1 aspect ratio
    let originX, originY, crop;
    if (width < height) {
      const requiredHeight = width;
      const remainingHeight = height - requiredHeight;
      originX = 0;
      originY = Math.floor(remainingHeight / 2);
      crop = {
        offset: {x: originX, y: originY},
        size: {width, height: requiredHeight},
      };
    } else {
      const requiredWidth = height;
      const remainingWidth = width - requiredWidth;
      originY = 0;
      originX = Math.floor(remainingWidth / 2);
      crop = {
        offset: {x: originX, y: originY},
        size: {width: requiredWidth, height},
      };
    }
    return crop;
  }

  pickImage = async (image) => {
    if (image.didCancel) {
      return null;
    }

    const imageSize = {width: image.width, height: image.height};
    const resize = this.getImageResize(imageSize);
    crop = this.getCropCoordinates(resize);

    const resized_image = await ImageResizer.createResizedImage(
      image.uri,
      resize.width,
      resize.height,
      'JPEG',
      80,
    );
    const crop_image = await ImageEditor.cropImage(resized_image.uri, crop);
    this.setState({
      newGroupData: {...this.state.newGroupData, group_image: crop_image},
    });
  };

  onChatPeoplePress(item) {
    this.props.setUserData(item);
    this.props.navigation.navigate(SCREENS.ChatScreen);
  }

  renderGroupImageSelector() {
    const {COLORS} = this.props;
    return (
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingTop: 20,
          paddingBottom: 5,
        }}>
        <View>
          <Text
            style={{
              color: COLORS.LESS_DARK,
              fontFamily: FONTS.RALEWAY_BOLD,
              fontSize: 22,
            }}>
            Group Icon
          </Text>
          <Text
            style={{
              color: COLORS.LESS_DARK,
              fontFamily: FONTS.RALEWAY,
              fontSize: 12,
            }}>
            Add a group icon
          </Text>
        </View>
        <Ripple
          containerStyle={{
            backgroundColor: COLORS.GRAY,
            height: 42,
            width: 42,
            borderRadius: 21,
            elevation: 3,
          }}
          style={{
            alignSelf: 'center',
            justifyContent: 'center',
            alignItems: 'center',
          }}
          onPress={() => {
            if (this.state.groupPeopleSelectorLoading) {
              return null;
            }
            this.imageSelector.showImageSelector(this.pickImage.bind(this));
          }}>
          <Avatar size={42} uri={this.state.newGroupData.group_image} />
        </Ripple>
        <ImageSelector
          COLORS={this.props.COLORS}
          onRef={(ref) => (this.imageSelector = ref)}
        />
      </View>
    );
  }

  renderHeader() {
    const {COLORS} = this.props;
    return (
      <SView
        style={{
          borderRadius: 10,
          height: 55,
          paddingHorizontal: 10,
          top: 10,
          justifyContent: 'space-between',
          alignItems: 'center',
          flexDirection: 'row',
          shadowColor: '#202020',
          zIndex: 10,
          width: '92%',
          shadowOpacity: 0.3,
          shadowOffset: {width: 0, height: 10},
          shadowRadius: 8,
          position: 'absolute',
          backgroundColor:
            this.props.theme === 'light' ? COLORS.LIGHT : COLORS.LESS_LIGHT,
          alignSelf: 'center',
        }}>
        <Text style={{...styles.TextStyle, color: COLORS.DARK}}>chat</Text>

        <LinearGradient
          style={{borderRadius: 6}}
          colors={['#EA384D', '#D31027']}>
          <Ripple
            containerStyle={{borderRadius: 6}}
            style={{
              paddingHorizontal: 10,
              paddingVertical: 6,
              flexDirection: 'row',
              alignItems: 'center',
            }}
            onPress={() => {
              this.setState({peopleSelectorVisible: true});
            }}>
            <Text
              style={{
                fontSize: 17,
                fontFamily: FONTS.RALEWAY_BOLD,
                color: COLORS_LIGHT_THEME.LIGHT,
                marginRight: 5,
              }}>
              {'new group'}
            </Text>
            <Icon name="user-plus" size={18} color={COLORS_LIGHT_THEME.LIGHT} />
          </Ripple>
        </LinearGradient>
      </SView>
    );
  }

  getSelectedUsers(user_id, shouldRemove) {
    if (shouldRemove) {
      new_users = [];
      this.state.newGroupData.users.map((item) => {
        if (item !== user_id) {
          new_users.push(item);
        }
      });
    } else if (this.state.newGroupData.users.length < MAX_USERS_IN_A_GROUP) {
      new_users = [...this.state.newGroupData.users, user_id];
    } else {
      this.timedAlert.showAlert(2000, 'Maximum limit of 128 reached');
    }

    this.setState({
      newGroupData: {...this.state.newGroupData, users: new_users},
    });
  }

  onGroupDone() {
    if (this.state.groupPeopleSelectorLoading) {
      return null;
    }
    if (this.state.newGroupData.users.length < 2) {
      this.timedAlert2.showAlert(
        2000,
        'You need to have atleast 2 prticipants',
        false,
      );
    } else {
      this.setState({groupPeopleSelectorLoading: true});
      if (!this.state.newGroupData.name) {
        this.state.newGroupData.name = 'New Group';
      }
      createGroup(
        {...this.state.newGroupData},
        () => {
          this.setState({
            peopleSelectorVisible: false,
            groupPeopleSelectorLoading: false,
            newGroupData: {name: '', group_image: null, users: []},
          });
        },
        (msg) => {
          this.setState({
            peopleSelectorVisible: false,
            groupPeopleSelectorLoading: false,
          });
          this.timedAlert2.showAlert(2000, msg, false);
        },
      );
    }
  }

  renderChatPeopleSelector() {
    const {COLORS} = this.props;
    const DATA = this.props.chats;
    let itemsRendered = -1;

    return (
      <Overlay
        overlayStyle={{flex: 1}}
        isVisible={this.state.peopleSelectorVisible}
        onModalShow={() =>
          changeBarColors(COLORS.OVERLAY_COLOR, COLORS.IS_LIGHT_THEME)
        }
        onModalHide={() => changeBarColors(COLORS.LIGHT, COLORS.IS_LIGHT_THEME)}
        onBackdropPress={() => {
          this.setState({peopleSelectorVisible: false});
        }}>
        <>
          <TimedAlert
            theme={this.props.theme}
            onRef={(ref) => (this.timedAlert2 = ref)}
            COLORS={COLORS}
          />
          <TouchableOpacity
            style={{
              flexGrow: 1,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            activeOpacity={1}
            onPress={() => {
              this.setState({peopleSelectorVisible: false});
            }}>
            <TouchableOpacity
              style={{
                maxHeight: '70%',
                width: '85%',
                borderRadius: 20,
                elevation: 10,
                backgroundColor: COLORS.LIGHT,
                overflow: 'hidden',
              }}
              activeOpacity={1}>
              <FlatList
                data={DATA}
                keyboardShouldPersistTaps="always"
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={
                  <View
                    style={{
                      flex: 1,
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}>
                    <Text
                      style={{
                        fontFamily: FONTS.PRODUCT_SANS_BOLD,
                        fontSize: 18,
                        color: COLORS.LESS_DARK,
                      }}>
                      No person To add
                    </Text>
                  </View>
                }
                ListHeaderComponent={
                  <>
                    <View
                      style={{
                        width: '100%',
                        padding: 10,
                        backgroundColor: COLORS.GRAY,
                      }}>
                      <Text
                        style={{
                          fontFamily: FONTS.GOTHAM_BLACK,
                          fontSize: 20,
                          color: COLORS.LIGHT,
                          alignSelf: 'center',
                          marginLeft: 10,
                        }}>
                        CREATE NEW GROUP
                      </Text>
                    </View>
                    <View style={{marginHorizontal: 20, marginBottom: 10}}>
                      <TextInput
                        placeholder={'Enter group name'}
                        placeholderTextColor={COLORS.GRAY}
                        value={this.state.newGroupData.name}
                        maxLength={56}
                        onChangeText={(text) =>
                          this.setState({
                            newGroupData: {
                              ...this.state.newGroupData,
                              name: text,
                            },
                          })
                        }
                        style={{
                          fontFamily: FONTS.RALEWAY,
                          fontSize: 18,
                          color: COLORS.DARK,
                          borderColor: COLORS.GRAY,
                          padding: 0,
                          margin: 0,
                          borderBottomWidth: 1,
                          marginTop: 10,
                        }}
                      />
                      {this.renderGroupImageSelector()}
                      <View
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          paddingTop: 10,
                          paddingBottom: 5,
                        }}>
                        <View>
                          <Text
                            style={{
                              color: COLORS.LESS_DARK,
                              fontFamily: FONTS.RALEWAY,
                              fontSize: 18,
                              marginRight: 10,
                            }}>
                            Select People To Add
                          </Text>
                          {this.state.newGroupData.users.length ? (
                            <Text
                              style={{
                                color: COLORS.LESS_DARK,
                                fontFamily: FONTS.RALEWAY,
                                fontSize: 12,
                              }}>
                              {`${this.state.newGroupData.users.length} participants selected`}
                            </Text>
                          ) : null}
                        </View>
                        <Ripple
                          containerStyle={{
                            borderRadius: 21,
                            elevation: 3,
                            backgroundColor:
                              this.state.newGroupData.users.length < 2
                                ? COLORS.GRAY
                                : COLORS.GREEN,
                          }}
                          style={{
                            justifyContent: 'center',
                            alignItems: 'center',
                            height: 42,
                            width: 42,
                          }}
                          onPress={this.onGroupDone.bind(this)}>
                          {this.state.groupPeopleSelectorLoading ? (
                            <Loading size={40} white={true} />
                          ) : (
                            <Icon
                              name="check"
                              size={22}
                              color={
                                this.state.newGroupData.users.length < 2
                                  ? COLORS.LIGHT
                                  : COLORS_LIGHT_THEME.LIGHT
                              }
                            />
                          )}
                        </Ripple>
                      </View>
                    </View>
                  </>
                }
                ListFooterComponent={<View style={{height: 8, width: 1}} />}
                keyExtractor={(item, index) => {
                  if (!item._id.toString()) {
                    return index.toString();
                  } else {
                    return item._id.toString();
                  }
                }}
                renderItem={({item, index}) => {
                  if (!this.props.status.hasOwnProperty(item._id)) {
                    this.props.status[item._id] = {
                      online: true,
                      typing: false,
                      unread_messages: 0,
                    };
                  }
                  if (item.isGroup) {
                    return null;
                  }
                  itemsRendered += 1;
                  return (
                    <ChatPeople
                      data={item}
                      COLORS={COLORS}
                      theme={this.props.theme}
                      isSelector={true}
                      isSelected={this.state.newGroupData.users.includes(
                        DATA[index]._id,
                      )}
                      onPress={(user_id, shouldRemove) =>
                        this.getSelectedUsers(user_id, shouldRemove)
                      }
                    />
                  );
                }}
              />
            </TouchableOpacity>
          </TouchableOpacity>
        </>
      </Overlay>
    );
  }

  renderChatPeopleDefault() {
    const DATA = this.props.chats;
    const {COLORS} = this.props;
    return (
      <FlatList
        refreshControl={
          <RefreshControl
            onRefresh={() => {
              this.props.getChatPeopleExplicitly();
            }}
            colors={['rgb(0,181, 213)']}
            refreshing={false}
          />
        }
        contentContainerStyle={{marginTop: 15, flexGrow: 1}}
        keyboardShouldPersistTaps="always"
        data={DATA}
        ListHeaderComponent={
          <View>
            <View style={{height: 70, width: 1}} />
            <ChatPeopleSearch
              theme={this.props.theme}
              COLORS={COLORS}
              value={this.state.chatPeopleSearchText}
              onTextChange={(value) => {
                this.setState({chatPeopleSearchText: value});
              }}
              onSearch={() => this.onSearch()}
            />
          </View>
        }
        ListFooterComponent={<View style={{height: 100, width: 1}} />}
        ListEmptyComponent={
          <View
            style={{
              flex: 1,
              justifyContent: 'center',
              alignItems: 'center',
              marginBottom: 50,
              padding: 40,
            }}>
            <Text
              style={{
                textAlign: 'center',
                fontFamily: FONTS.PRODUCT_SANS_BOLD,
                fontSize: 18,
                color: COLORS.LESSER_DARK,
              }}>
              No one for chat, search people with their email to start chatting
            </Text>
          </View>
        }
        keyExtractor={(item, index) => {
          if (!item._id.toString()) {
            return index.toString();
          } else {
            return item._id.toString();
          }
        }}
        renderItem={({item, index}) => {
          if (!this.props.status.hasOwnProperty(item._id)) {
            this.props.status[item._id] = {
              online: true,
              typing: false,
              unread_messages: 0,
            };
          }
          return (
            <>
              <ChatPeople
                data={item}
                COLORS={COLORS}
                theme={this.props.theme}
                typing={this.props.status[item._id].typing}
                online={this.props.status[item._id].online}
                unread_messages={this.props.status[item._id].unread_messages}
                recentActivity={this.props.status[item._id].recentActivity}
                recentMessage={this.props.status[item._id].recentMessage}
                onPress={this.onChatPeoplePress.bind(this, item)}
              />
              <View style={{height: 4, width: 1}} />
            </>
          );
        }}
      />
    );
  }

  renderChatSearchPeople() {
    const {COLORS} = this.props;
    return (
      <FlatList
        data={this.props.chatPeopleSearch}
        contentContainerStyle={{marginTop: 15, flexGrow: 1}}
        keyExtractor={(item, index) => {
          if (!item._id.toString()) {
            return index.toString();
          } else {
            return item._id.toString();
          }
        }}
        ListHeaderComponent={
          <View>
            <View style={{height: 70, width: 1}} />
            <ChatPeopleSearch
              theme={this.props.theme}
              COLORS={COLORS}
              value={this.state.chatPeopleSearchText}
              onTextChange={(value) => {
                this.setState({chatPeopleSearchText: value});
              }}
              onSearch={() => this.onSearch()}
              showSearchResults
              onCancel={() => {
                this.setState({chatPeopleSearchText: ''});
                this.props.chatPeopleSearchAction(null);
              }}
            />
          </View>
        }
        ListFooterComponent={<View style={{height: 100, width: 1}} />}
        ListEmptyComponent={
          <View
            style={{
              flex: 1,
              justifyContent: 'center',
              alignItems: 'center',
              marginBottom: 50,
            }}>
            <Text
              style={{
                fontFamily: FONTS.PRODUCT_SANS_BOLD,
                fontSize: 18,
                color: COLORS.LESSER_DARK,
              }}>
              No results found
            </Text>
          </View>
        }
        renderItem={({item, index}) => {
          return (
            <>
              <ChatPeople
                data={item}
                finalElem={
                  this.props.chatPeopleSearch &&
                  index === this.props.chatPeopleSearch.length - 1
                }
                theme={this.props.theme}
                chatPeopleSearch={true}
                data={item}
                COLORS={COLORS}
                onPress={this.onChatPeoplePress.bind(this, item)}
              />
              <View style={{height: 4, width: 1}} />
            </>
          );
        }}
      />
    );
  }

  renderChatPeople() {
    if (this.props.chatPeopleSearch) {
      return this.renderChatSearchPeople();
    } else {
      return this.renderChatPeopleDefault();
    }
  }

  renderNoChatAvailable() {
    const {COLORS} = this.props;
    return (
      <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
        <Text
          style={{
            textAlign: 'center',
            fontFamily: FONTS.PRODUCT_SANS_BOLD,
            fontSize: 18,
            color: COLORS.LESS_DARK,
          }}>
          No one available for chat
        </Text>
      </View>
    );
  }

  renderLoader() {
    return (
      <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
        <Loading size={128} white={this.props.theme !== 'light'} />
      </View>
    );
  }

  render() {
    const {COLORS} = this.props;
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'space-between',
          backgroundColor: COLORS.LIGHT,
        }}>
        {this.renderChatPeopleSelector()}
        <TimedAlert
          theme={this.props.theme}
          onRef={(ref) => (this.timedAlert = ref)}
          COLORS={COLORS}
        />
        {this.renderHeader()}
        {this.props.loading ? this.renderLoader() : this.renderChatPeople()}
      </View>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    theme: state.chat.theme,
    chats: state.chat.chats,
    status: state.chat.status,
    COLORS: state.chat.COLORS,
    loading: state.chat.loading,
    authTokenSet: state.chat.authTokenSet,
    chatPeopleSearch: state.chat.chatPeopleSearch,
    chatPeopleSearchLoading: state.chat.chatPeopleSearchLoading,
  };
};

export default connect(mapStateToProps, {
  setUserData,
  chatPeopleSearchAction,
  getChatPeopleExplicitly,
})(Chat);

const styles = StyleSheet.create({
  TextStyle: {
    fontSize: 24,
    fontFamily: FONTS.GOTHAM_BLACK,
    marginLeft: 10,
  },
  SectionViewStyling: {
    alignSelf: 'flex-end',
    marginRight: 20,
  },
  SectionHeadingStyle: {
    fontSize: 22,
    fontFamily: FONTS.HELVETICA_NEUE,
  },
});
