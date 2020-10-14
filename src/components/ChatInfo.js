import React, {Component} from 'react';
import {
  View,
  Text,
  FlatList,
  Dimensions,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import {connect} from 'react-redux';
import {Overlay, Icon} from 'react-native-elements';
import Image from 'react-native-fast-image';
import ImageResizer from 'react-native-image-resizer';
import ImageEditor from '@react-native-community/image-editor';
import {
  Menu,
  MenuOptions,
  MenuOption,
  MenuTrigger,
  MenuProvider,
} from 'react-native-popup-menu';
import {
  modifyAdmins,
  leaveGroup,
  uploadGroupImage,
  chatInfoGroupDetailsUpdateAction,
  addGroupParticipants,
  groupDetailsChange,
  chatInfoGroupIconUploadingAction,
} from '../actions/ChatAction';
import {
  TimedAlert,
  Loading,
  Ripple,
  ImageSelector,
  Avatar,
  ChatPeople,
} from './index';
import {FONTS, MAX_USERS_IN_A_GROUP, COLORS_LIGHT_THEME} from '../Constants';
import {getRingColor} from '../extraUtilities';

const overlayWidth = Dimensions.get('screen').width * 0.86;

const imageUrlCorrector = (image_url, image_adder) => {
  if (!image_adder) {
    return '';
  }
  if (image_url.substring(0, 4) !== 'http') {
    image_url = image_adder + image_url;
  }
  return image_url;
};

class ChatInfo extends Component {
  state = {peopleSelectorVisible: false, peopleToAdd: [], editMode: false};

  componentDidMount() {
    const {other_user_data, chatInfoGroupDetailsUpdateAction} = this.props;
    chatInfoGroupDetailsUpdateAction({
      groupName: other_user_data.name,
      groupImage: other_user_data.image_url,
    });
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
    const {chatInfoGroupDetails, chatInfoGroupIconUploadingAction} = this.props;
    chatInfoGroupIconUploadingAction(true);

    const imageSize = {width: image.width, height: image.height};
    const resize = this.getImageResize(imageSize);
    const crop = this.getCropCoordinates(resize);
    const resized_image = await ImageResizer.createResizedImage(
      image.uri,
      resize.width,
      resize.height,
      'JPEG',
      80,
    );
    const crop_image = await ImageEditor.cropImage(resized_image.uri, crop);

    // now upload this image to the server
    const aws_image = await uploadGroupImage(crop_image);
    if (aws_image.error) {
      // means upload fail
      return;
    }

    this.setState({groupImage: aws_image});
    groupDetailsChange(this.props.other_user_data._id, {
      ...chatInfoGroupDetails,
      groupImage: aws_image,
    });
    return;
  };

  handleModifyAdmins(user_id, user_name, isUserAdmin) {
    const group_id = this.props.other_user_data._id;
    const add = !isUserAdmin;
    // data = {group_id:String, user_id:String, add:Boolean}
    const data = {group_id, user_id, add, user_name};
    modifyAdmins(data);
  }

  handleOnNameDone() {
    const {other_user_data, chatInfoGroupDetails} = this.props;
    chatInfoGroupDetails.groupName = chatInfoGroupDetails.groupName.trim();
    if (chatInfoGroupDetails.groupName.length < 1) {
      this.timedAlert.showAlert(2000, 'Enter more characters', 10);
      return;
    }

    groupDetailsChange(other_user_data._id, chatInfoGroupDetails);
    this.setState({editMode: false}, () => this.textInput.focus());
  }

  chatPeopleComponentHelper(user) {
    const {image_url, name, isAdmin, _id, userXP} = user;
    const {COLORS} = this.props;
    return (
      <View
        style={{
          flex: 1,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingHorizontal: 15,
        }}>
        <View style={{flexDirection: 'row', alignItems: 'center'}}>
          <Avatar
            size={48}
            uri={imageUrlCorrector(image_url, this.props.image_adder)}
            ring_color={getRingColor(userXP)}
          />
          <Text
            style={{
              fontFamily: FONTS.PRODUCT_SANS,
              color: COLORS.DARK,
              fontSize: 16,
              marginLeft: 5,
            }}>
            {name}
          </Text>
        </View>

        <View style={{flexDirection: 'row', alignItems: 'center'}}>
          {isAdmin ? (
            <View
              style={{
                paddingVertical: 4,
                paddingHorizontal: 6,
                borderWidth: 1.2,
                borderColor: COLORS.GREEN,
                borderRadius: 6,
              }}>
              <Text
                style={{
                  fontFamily: FONTS.PRODUCT_SANS_BOLD,
                  fontSize: 8,
                  color: COLORS.GREEN,
                }}>
                ADMIN
              </Text>
            </View>
          ) : null}
          {this.props.currentUserId === _id ? (
            <View
              style={{
                paddingVertical: 4,
                paddingHorizontal: 6,
                borderWidth: 1.2,
                borderColor: COLORS.YELLOW,
                borderRadius: 6,
                marginLeft: 5,
              }}>
              <Text
                style={{
                  fontFamily: FONTS.PRODUCT_SANS_BOLD,
                  fontSize: 8,
                  color: COLORS.YELLOW,
                }}>
                YOU
              </Text>
            </View>
          ) : null}
        </View>
      </View>
    );
  }

  renderChatPeople(group_participants) {
    const {COLORS} = this.props;
    if (!group_participants) {
      return null;
    }
    return (
      <View>
        <Text
          style={{
            fontFamily: FONTS.RALEWAY_BOLD,
            color: COLORS.GRAY,
            fontSize: 18,
            margin: 10,
            marginLeft: 15,
            textDecorationLine: 'underline',
          }}>
          Group Members
        </Text>
        {group_participants.users.map((user, index) => (
          <View key={index.toString()}>
            {index ? (
              <View
                style={{
                  width: '90%',
                  height: 0.7,
                  backgroundColor: COLORS.LIGHT_GRAY,
                  marginVertical: 7,
                  alignSelf: 'center',
                }}
              />
            ) : null}
            {this.renderChatPeopleComponent(
              user,
              index,
              group_participants.admins,
            )}
          </View>
        ))}
      </View>
    );
  }

  getMenuOptions(user) {
    const {name, _id, isAdmin} = user;
    const text = isAdmin ? 'Remove from Admin' : 'Make Admin';

    return (
      <MenuOptions
        optionsContainerStyle={{
          backgroundColor: COLORS.LESSER_LIGHT,
          borderRadius: 10,
          padding: 5,
        }}>
        <Text
          style={{
            fontFamily: FONTS.RALEWAY_BOLD,
            fontSize: 12,
            color: COLORS.LIGHT_GRAY,
            marginLeft: 5,
          }}>
          {`Options for ${name}`}
        </Text>
        <MenuOption
          customStyles={{
            optionText: {...styles.MenuText, color: COLORS.DARK},
            OptionTouchableComponent: TouchableOpacity,
          }}
          onSelect={this.handleModifyAdmins.bind(this, _id, name, isAdmin)}
          text={text}
        />
        <MenuOption
          customStyles={{
            optionText: {...styles.MenuText, color: COLORS.DARK},
            OptionTouchableComponent: TouchableOpacity,
          }}
          onSelect={() => {
            leaveGroup(this.props.other_user_data._id, _id);
          }}
          text="Remove from group"
        />
      </MenuOptions>
    );
  }

  getSelectedUsers(user_id, shouldRemove) {
    if (shouldRemove) {
      new_users = [];
      this.state.peopleToAdd.map((item) => {
        if (item !== user_id) {
          new_users.push(item);
        }
      });
    } else if (this.state.peopleToAdd.length < MAX_USERS_IN_A_GROUP) {
      new_users = [...this.state.peopleToAdd, user_id];
    } else {
      this.timedAlert.showAlert(2000, 'Maximum limit of 128 reached');
    }

    this.setState({peopleToAdd: new_users});
  }

  onPressAdd() {
    if (this.state.peopleToAdd.length) {
      addGroupParticipants(
        this.props.other_user_data._id,
        this.state.peopleToAdd,
      );
      this.setState({peopleSelectorVisible: false});
    }
  }

  renderChatPeopleSelector() {
    const {COLORS, chat_group_participants, other_user_data} = this.props;
    const group_participants = chat_group_participants[other_user_data._id];
    let group_participants_user_ids = [];

    if (!group_participants) {
      return;
    }

    group_participants.users.map((item) => {
      group_participants_user_ids.push(item._id);
    });

    const DATA = this.props.chats;
    let itemsRendered = -1;

    return (
      <Overlay
        overlayStyle={{
          backgroundColor: 'transparent',
          padding: 0,
          elevation: 0,
        }}
        isVisible={this.state.peopleSelectorVisible}
        onBackdropPress={() => {
          this.setState({peopleSelectorVisible: false});
        }}
        height="100%"
        width="100%">
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
                width: '75%',
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
                        ADD PARTICIPANTS
                      </Text>
                    </View>
                    <View style={{marginHorizontal: 20, marginVertical: 5}}>
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
                          {this.state.peopleToAdd.length ? (
                            <Text
                              style={{
                                color: COLORS.LESS_DARK,
                                fontFamily: FONTS.RALEWAY,
                                fontSize: 12,
                              }}>
                              {`${this.state.peopleToAdd.length} participants selected`}
                            </Text>
                          ) : null}
                        </View>
                        <Ripple
                          rippleContainerBorderRadius={30}
                          style={{
                            height: 42,
                            width: 42,
                            justifyContent: 'center',
                            alignItems: 'center',
                            borderRadius: 30,
                            elevation: 3,
                            backgroundColor: !this.state.peopleToAdd.length
                              ? COLORS.GRAY
                              : COLORS.GREEN,
                          }}
                          onPress={this.onPressAdd.bind(this)}>
                          <Icon
                            type={'feather'}
                            name={'check'}
                            size={22}
                            color={
                              !this.state.peopleToAdd.length
                                ? COLORS.LIGHT
                                : COLORS_LIGHT_THEME.LIGHT
                            }
                          />
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
                      image_adder={this.props.image_adder}
                      isSelector={true}
                      isSelected={this.state.peopleToAdd.includes(
                        DATA[index]._id,
                      )}
                      isAddedToGroup={group_participants_user_ids.includes(
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

  renderChatPeopleComponent(user, index, admins) {
    const isCurrentUserAdmin = admins.includes(this.props.currentUserId); // means if the user using the app is an admin of this group or not

    if (!isCurrentUserAdmin) {
      return this.chatPeopleComponentHelper(user, index);
    }
    return (
      <Menu>
        <MenuTrigger
          customStyles={{
            TriggerTouchableComponent: (props) => {
              if (this.props.currentUserId === user._id) {
                return <View children={props.children} />;
              }
              return <TouchableOpacity activeOpacity={0.9} {...props} />;
            },
          }}
          triggerOnLongPress={false}>
          {this.chatPeopleComponentHelper(user, index)}
        </MenuTrigger>
        {this.getMenuOptions(user)}
      </Menu>
    );
  }

  renderLeaveFromAdmin(admins) {
    const isCurrentUserAdmin = admins.includes(this.props.currentUserId);
    if (admins.length < 2 || !isCurrentUserAdmin) {
      return null;
    } else {
      return (
        <Ripple
          onPress={() => {
            this.handleModifyAdmins(
              this.props.currentUserId,
              this.props.user_name,
              true,
            );
          }}
          style={{...styles.EndButton, backgroundColor: COLORS.GRAY}}>
          <Text
            style={{
              fontFamily: FONTS.RALEWAY,
              fontSize: 18,
              color: COLORS.LIGHT,
              marginRight: 5,
            }}>
            Resign from Admin
          </Text>
          <Icon name="user-x" size={18} color={COLORS.LIGHT} type="feather" />
        </Ripple>
      );
    }
  }

  renderEditButton() {
    const {COLORS, other_user_data} = this.props;

    if (this.state.editMode) {
      return (
        <View style={{flex: 1, flexDirection: 'row', marginRight: 5}}>
          <Ripple
            onPress={this.handleOnNameDone.bind(this)}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: COLORS.GREEN,
              justifyContent: 'center',
              flex: 1,
              height: 40,
              marginRight: 5,
            }}>
            <Icon
              type={'feather'}
              name={'check'}
              size={18}
              color={COLORS_LIGHT_THEME.LIGHT}
            />
          </Ripple>
          <Ripple
            onPress={() => {
              this.setState(
                {editMode: false, groupName: other_user_data.name},
                () => this.textInput.focus(),
              );
            }}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: COLORS.RED,
              justifyContent: 'center',
              flex: 1,
              height: 40,
            }}>
            <Icon
              type={'feather'}
              name={'x'}
              size={18}
              color={COLORS_LIGHT_THEME.LIGHT}
            />
          </Ripple>
        </View>
      );
    }
    return (
      <Ripple
        onPress={() => {
          this.setState({editMode: true}, () => this.textInput.focus());
        }}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: COLORS.GRAY,
          marginRight: 5,
          justifyContent: 'center',
          flex: 1,
          height: 40,
        }}>
        <Text
          style={{
            fontFamily: FONTS.RALEWAY,
            fontSize: 12,
            color: COLORS.LIGHT,
            marginRight: 5,
          }}>
          Edit Group Name
        </Text>
        <Icon type={'feather'} name={'edit-2'} size={12} color={COLORS.LIGHT} />
      </Ripple>
    );
  }

  renderGroupOptions() {
    const {COLORS, chatInfoGroupIconUploading} = this.props;
    return (
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          flex: 1,
          margin: 5,
        }}>
        {this.renderEditButton()}
        {!chatInfoGroupIconUploading ? (
          <Ripple
            onPress={() => {
              this.imageSelector.showImageSelector(this.pickImage);
            }}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: COLORS.GRAY,
              justifyContent: 'center',
              marginLeft: 0,
              flex: 1,
              height: 40,
            }}>
            <Text
              style={{
                fontFamily: FONTS.RALEWAY,
                fontSize: 12,
                color: COLORS.LIGHT,
                marginRight: 5,
              }}>
              Change Group Icon
            </Text>
            <Icon
              type={'feather'}
              name={'image'}
              size={13}
              color={COLORS.LIGHT}
            />
          </Ripple>
        ) : (
          <View
            style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
            <Loading white={COLORS.THEME !== 'light'} size={36} />
          </View>
        )}
      </View>
    );
  }

  renderAddParticipant(admins) {
    const isCurrentUserAdmin = admins.includes(this.props.currentUserId);
    if (!isCurrentUserAdmin) {
      return null;
    }
    return (
      <Ripple
        onPress={() => {
          this.setState({peopleSelectorVisible: true});
        }}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: COLORS.GRAY,
          padding: 10,
          justifyContent: 'center',
          margin: 5,
        }}>
        <Text
          style={{
            fontFamily: FONTS.RALEWAY,
            fontSize: 18,
            color: COLORS.LIGHT,
            marginLeft: 15,
          }}>
          Add a new member
        </Text>
        <Icon
          type={'feather'}
          name={'user-plus'}
          size={18}
          color={COLORS.LIGHT}
        />
      </Ripple>
    );
  }

  renderLeaveGroup() {
    const {COLORS, other_user_data, authtoken} = this.props;
    const group_id = other_user_data._id;
    return (
      <Ripple
        onPress={() => {
          leaveGroup(group_id, authtoken);
        }}
        style={{
          ...styles.EndButton,
          backgroundColor: COLORS.GRAY,
          borderBottomLeftRadius: 15,
          borderBottomRightRadius: 15,
        }}>
        <Text
          style={{
            fontFamily: FONTS.RALEWAY,
            fontSize: 18,
            color: COLORS.LIGHT,
            marginRight: 5,
          }}>
          Leave Group
        </Text>
        <Icon name="log-out" size={18} color={COLORS.LIGHT} type="feather" />
      </Ripple>
    );
  }

  render() {
    const {
      COLORS,
      other_user_data,
      image_adder,
      isLoading,
      chat_group_participants,
      chatInfoGroupDetails,
      chatInfoGroupDetailsUpdateAction,
    } = this.props;
    const group_participants = chat_group_participants[other_user_data._id];

    if (this.props.chatGroupsLeft.includes(other_user_data._id)) {
      return null;
    }

    return (
      <Overlay
        isVisible={this.props.isVisible}
        borderRadius={20}
        onBackdropPress={this.props.onBackdropPress}
        overlayStyle={{
          marginBottom: 25,
          elevation: 0,
          padding: 0,
          overflow: 'hidden',
          width: overlayWidth,
          height: '82%',
        }}
        containerStyle={{padding: 0}}
        animationType="none"
        overlayBackgroundColor={
          COLORS.THEME === 'light' ? COLORS.LIGHT : COLORS.LESS_LIGHT
        }>
        <>
          {this.renderChatPeopleSelector()}
          <TimedAlert
            theme={this.props.theme}
            onRef={(ref) => (this.timedAlert = ref)}
            COLORS={COLORS}
          />
          <ImageSelector
            COLORS={this.props.COLORS}
            onRef={(ref) => (this.imageSelector = ref)}
          />
          {isLoading || !group_participants ? (
            <View
              style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
              <Loading white={COLORS.THEME !== 'light'} size={108} />
            </View>
          ) : (
            <MenuProvider>
              <ScrollView
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="always">
                <Image
                  style={{
                    height: overlayWidth,
                    width: overlayWidth,
                    justifyContent: 'flex-end',
                  }}
                  source={{
                    uri: imageUrlCorrector(
                      chatInfoGroupDetails.groupImage,
                      image_adder,
                    ),
                  }}>
                  <TextInput
                    style={{
                      ...styles.NameText,
                      color: COLORS.DARK,
                      backgroundColor: COLORS.LIGHT_GRAY + '72',
                    }}
                    value={chatInfoGroupDetails.groupName}
                    placeholder={'Groue Name'}
                    placeholderTextColor={COLORS.GRAY}
                    multiline
                    editable={this.state.editMode}
                    onChangeText={(text) => {
                      chatInfoGroupDetailsUpdateAction({
                        ...chatInfoGroupDetails,
                        groupName: text,
                      });
                    }}
                    ref={(ref) => (this.textInput = ref)}
                  />
                </Image>

                {this.renderGroupOptions()}
                {this.renderChatPeople(group_participants, image_adder)}
                <View style={{height: 20, width: 1}} />
                {this.renderAddParticipant(group_participants.admins)}
                {this.renderLeaveFromAdmin(group_participants.admins)}
                {this.renderLeaveGroup()}
              </ScrollView>
            </MenuProvider>
          )}
        </>
      </Overlay>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    authtoken: state.login.authtoken,
    user_name: state.login.data.name,

    chat_group_participants: state.chat.chat_group_participants,
    chatGroupsLeft: state.chat.chatGroupsLeft,
    chats: state.chat.chats,
    status: state.chat.status,
    chatInfoGroupDetails: state.chat.chatInfoGroupDetails,
    chatInfoGroupIconUploading: state.chat.chatInfoGroupIconUploading,
  };
};

export default connect(mapStateToProps, {
  chatInfoGroupIconUploadingAction,
  chatInfoGroupDetailsUpdateAction,
})(ChatInfo);

const styles = StyleSheet.create({
  NameText: {
    fontFamily: FONTS.PRODUCT_SANS,
    fontSize: 18,
    margin: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 7,
  },
  MenuText: {
    fontFamily: FONTS.PRODUCT_SANS,
    fontSize: 16,
  },
  ResignAdmin: {
    padding: 10,
    marginHorizontal: 10,
    borderRadius: 10,
    borderWidth: 1,
    alignSelf: 'flex-end',
    elevation: 4,
  },
  EndButton: {
    height: 40,
    marginBottom: 5,
    marginHorizontal: 5,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
});
