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
import Icon from 'react-native-vector-icons/Feather';
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
  chatInfoGroupDetailsUpdateAction,
  addGroupParticipants,
  groupDetailsChange,
  chatInfoGroupIconUploadingAction,
} from '../actions/ChatAction';
import TimedAlert from './TimedAlert';
import Loading from './Loading';
import Ripple from './Ripple';
import ImageSelector from './ImageSelector';
import Avatar from './Avatar';
import ChatPeople from './ChatPeople';
import Overlay from './Overlay';
import {FONTS, MAX_USERS_IN_A_GROUP, COLORS_LIGHT_THEME} from '../Constants';
import {getRingColor, uploadImage, changeBarColors} from '../utilities';

const overlayWidth = Dimensions.get('screen').width * 0.85;

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
    const aws_image = uploadImage(crop_image, {
      type: 'group_image',
      image_type: 'jpeg',
    });
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
    let new_users = [];
    if (shouldRemove) {
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

  renderEmptyChatSelector() {
    return (
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
          No one To add
        </Text>
      </View>
    );
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
        isVisible={this.state.peopleSelectorVisible}
        overlayStyle={{
          width: '75%',
          height: '50%',
          borderRadius: 20,
          overflow: 'hidden',
          alignSelf: 'center',
          backgroundColor: COLORS.LIGHT,
        }}
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

          <FlatList
            data={DATA}
            keyboardShouldPersistTaps="always"
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={this.renderEmptyChatSelector()}
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
                    <TouchableOpacity
                      onPress={this.onPressAdd.bind(this)}
                      activeOpacity={0.5}
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
                      }}>
                      <Icon
                        name={'check'}
                        size={22}
                        color={
                          !this.state.peopleToAdd.length
                            ? COLORS.LIGHT
                            : COLORS_LIGHT_THEME.LIGHT
                        }
                      />
                    </TouchableOpacity>
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
                  isSelected={this.state.peopleToAdd.includes(DATA[index]._id)}
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
          containerStyle={{
            height: 40,
            marginBottom: 5,
            marginHorizontal: 5,
            flex: 1,
            backgroundColor: COLORS.GRAY,
          }}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
          <Text
            style={{
              fontFamily: FONTS.RALEWAY,
              fontSize: 18,
              color: COLORS.LIGHT,
              marginRight: 5,
            }}>
            Resign from Admin
          </Text>
          <Icon name="user-x" size={18} color={COLORS.LIGHT} />
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
            containerStyle={{
              backgroundColor: COLORS.GREEN,
              flex: 1,
              height: 40,
              marginRight: 5,
            }}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
            <Icon name={'check'} size={18} color={COLORS_LIGHT_THEME.LIGHT} />
          </Ripple>
          <Ripple
            onPress={() => {
              this.setState(
                {editMode: false, groupName: other_user_data.name},
                () => this.textInput.focus(),
              );
            }}
            containerStyle={{backgroundColor: COLORS.RED, height: 40, flex: 1}}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
            <Icon name={'x'} size={18} color={COLORS_LIGHT_THEME.LIGHT} />
          </Ripple>
        </View>
      );
    }
    return (
      <Ripple
        onPress={() => {
          this.setState({editMode: true}, () => this.textInput.focus());
        }}
        containerStyle={{
          marginRight: 5,
          flex: 1,
          backgroundColor: COLORS.GRAY,
          height: 40,
        }}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
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
        <Icon name={'edit-2'} size={12} color={COLORS.LIGHT} />
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
            containerStyle={{
              backgroundColor: COLORS.GRAY,
              marginLeft: 0,
              flex: 1,
              height: 40,
            }}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
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
            <Icon name={'image'} size={13} color={COLORS.LIGHT} />
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
        containerStyle={{backgroundColor: COLORS.GRAY, margin: 5}}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 10,
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
        <Icon name={'user-plus'} size={18} color={COLORS.LIGHT} />
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
        containerStyle={{
          marginBottom: 5,
          marginHorizontal: 5,
          height: 40,
          flex: 1,
          backgroundColor: COLORS.GRAY,
          borderBottomLeftRadius: 15,
          borderBottomRightRadius: 15,
        }}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
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
        <Icon name="log-out" size={18} color={COLORS.LIGHT} />
      </Ripple>
    );
  }

  renderLoading() {
    return (
      <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
        <Loading white={COLORS.THEME !== 'light'} size={108} />
      </View>
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
        onModalShow={() =>
          changeBarColors(COLORS.OVERLAY_COLOR, COLORS.IS_LIGHT_THEME)
        }
        onModalHide={() => changeBarColors(COLORS.LIGHT, COLORS.IS_LIGHT_THEME)}
        overlayStyle={{
          flex: 1,
          width: overlayWidth,
          marginTop: 30,
          marginBottom: 40,
          borderRadius: 20,
          elevation: 7,
          overflow: 'hidden',
          alignSelf: 'center',
          backgroundColor:
            COLORS.THEME === 'light' ? COLORS.LIGHT : COLORS.LESS_LIGHT,
        }}>
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
            this.renderLoading()
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
});
