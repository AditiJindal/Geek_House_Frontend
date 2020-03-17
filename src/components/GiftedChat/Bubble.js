import PropTypes from 'prop-types';
import React from 'react';
import { Text, Clipboard, StyleSheet, TouchableOpacity, 
    View, ViewPropTypes, Dimensions } from 'react-native';
import QuickReplies from './QuickReplies';
import MessageText from './MessageText';
import MessageImage from './MessageImage';
import LinearGradient from 'react-native-linear-gradient';
import Time from './Time';
import Color from './Color';
import {FONTS} from '../../Constants';
import toMaterialStyle from 'material-color-hash';
import { isSameUser, isSameDay } from './utils';

const DEVICE_WIDTH = Dimensions.get('screen').width
const MAX_WIDTH = 0.7*DEVICE_WIDTH

const styles = {
    left: {
        gradientColor: ["#F4F4F4", "#F4F4F4"],
        container: {
            flex: 1,
            alignItems: 'flex-start',
            // elevation:4
        },
        wrapper: {
            borderRadius: 15,
            marginRight: 60,
            minHeight: 20,
            justifyContent: 'flex-end',
        },
        containerToNext: {
            borderBottomLeftRadius: 3,
            // elevation:4
        },
        containerToPrevious: {
            borderTopLeftRadius: 3,
            // elevation:4
        },
        bottom: {
            flexDirection: 'row',
            justifyContent: 'flex-start',
        },
    },
    right: {
        gradientColor: ["#00B4DB", "#00ccdb"],
        container: {
            flex: 1,
            alignItems: 'flex-end',
            // elevation:4
        },
        wrapper: {
            borderRadius: 15,
            // elevation:3,
            marginLeft: 60,
            minHeight: 20,
            justifyContent: 'flex-end',
        },
        containerToNext: {
            borderBottomRightRadius: 3,
            // elevation:4
        },
        containerToPrevious: {
            borderTopRightRadius: 3,
            
            // elevation:4
        },
        bottom: {
            flexDirection: 'row',
            justifyContent: 'flex-end',
        },
    },
    content: {
        tick: {
            fontSize: 10,
            backgroundColor: Color.backgroundTransparent,
            color: Color.white,
        },
        tickView: {
            flexDirection: 'row',
            marginRight: 10,
        },
        username: {
            fontSize: 12,
            fontFamily:FONTS.PRODUCT_SANS,
        },
        usernameView: {
            flexDirection: 'row',
            marginHorizontal: 10,
            marginTop:5, 
        },
    },
};
const DEFAULT_OPTION_TITLES = ['Copy Text', 'Cancel'];
export default class Bubble extends React.Component {
    constructor() {
        super(...arguments);
        this.onLongPress = () => {
            const { currentMessage } = this.props;
            if (this.props.onLongPress) {
                this.props.onLongPress(this.context, this.props.currentMessage);
            }
            else if (currentMessage && currentMessage.text) {
                const { optionTitles } = this.props;
                const options = optionTitles && optionTitles.length > 0
                    ? optionTitles.slice(0, 2)
                    : DEFAULT_OPTION_TITLES;
                Clipboard.setString(currentMessage.text);
                this.props.showTimedAlert(2000, 'Text copied to clipboard');
            }
        };
    }
    handleBubbleToNext() {
        const { currentMessage, nextMessage, position, containerToNextStyle, } = this.props;
        if (currentMessage &&
            nextMessage &&
            position &&
            isSameUser(currentMessage, nextMessage) &&
            isSameDay(currentMessage, nextMessage)) {
            return [
                styles[position].containerToNext,
                containerToNextStyle && containerToNextStyle[position],
            ];
        }
        return {elevation:10};
    }
    handleBubbleToPrevious() {
        const { currentMessage, previousMessage, position, containerToPreviousStyle, } = this.props;
        if (currentMessage &&
            previousMessage &&
            position &&
            isSameUser(currentMessage, previousMessage) &&
            isSameDay(currentMessage, previousMessage)) {
            return [
                styles[position].containerToPrevious,
                containerToPreviousStyle && containerToPreviousStyle[position],
            ];
        }
        return null;
    }
    renderQuickReplies() {
        const { currentMessage, onQuickReply, nextMessage, renderQuickReplySend, quickReplyStyle, } = this.props;
        if (currentMessage && currentMessage.quickReplies) {
            const { containerStyle, wrapperStyle, ...quickReplyProps } = this.props;
            if (this.props.renderQuickReplies) {
                return this.props.renderQuickReplies(quickReplyProps);
            }
            return (<QuickReplies {...{
                currentMessage,
                onQuickReply,
                nextMessage,
                renderQuickReplySend,
                quickReplyStyle,
            }}/>);
        }
        return null;
    }
    renderMessageText() {
        if (this.props.currentMessage && this.props.currentMessage.text) {
            const { containerStyle, wrapperStyle, ...messageTextProps } = this.props;
            if (this.props.renderMessageText) {
                return this.props.renderMessageText(messageTextProps);
            }
            return <MessageText {...messageTextProps}  />;
        }
        return null;
    }
    renderMessageImage() {
        if (this.props.currentMessage && this.props.currentMessage.image) {
            const { containerStyle, wrapperStyle, ...messageImageProps } = this.props;
            if (this.props.renderMessageImage) {
                return this.props.renderMessageImage(messageImageProps);
            }
            return <MessageImage {...messageImageProps}/>;
        }
        return null;
    }
    renderTicks() {
        const { currentMessage, renderTicks, user } = this.props;
        if (renderTicks && currentMessage) {
            return renderTicks(currentMessage);
        }
        if (currentMessage && user && currentMessage.user._id !== user._id) {
            return null;
        }
        if (currentMessage &&
            (currentMessage.sent || currentMessage.received || currentMessage.pending)) {
            return (<View style={styles.content.tickView}>
          {!!currentMessage.sent && (<Text style={[styles.content.tick, this.props.tickStyle]}>✓</Text>)}
          {!!currentMessage.received && (<Text style={[styles.content.tick, this.props.tickStyle]}>✓</Text>)}
          {!!currentMessage.pending && (<Text style={[styles.content.tick, this.props.tickStyle]}>🕓</Text>)}
        </View>);
        }
        return null;
    }
    renderTime() {
        if (this.props.currentMessage && this.props.currentMessage.createdAt) {
            const { containerStyle, wrapperStyle, textStyle, ...timeProps } = this.props;
            if (this.props.renderTime) {
                return this.props.renderTime(timeProps);
            }
            return <Time {...timeProps}/>;
        }
        return null;
    }
    renderUsername() {
        const { currentMessage, user } = this.props;
        if (currentMessage && currentMessage.user.name) {
            if (user && currentMessage.user._id === user._id) {
                return null;
            }
            return (
            <View style={styles.content.usernameView}>
                <Text style={[styles.content.username, this.props.usernameStyle, 
                    {color:toMaterialStyle(currentMessage.user.name, '400').backgroundColor}]}>
                    {currentMessage.user.name}
                </Text>
            </View>
        );}
        return null;
    }
    renderCustomView() {
        if (this.props.renderCustomView) {
            return this.props.renderCustomView(this.props);
        }
        return null;
    }
    render() {
        const { position, containerStyle, wrapperStyle, bottomContainerStyle, } = this.props;
        return (<View style={[
            styles[position].container,
            containerStyle && containerStyle[position],
            {maxWidth:MAX_WIDTH}
        ]}>

        <LinearGradient style={[
            styles[position].wrapper,
            wrapperStyle && wrapperStyle[position],
            this.handleBubbleToNext(),
            this.handleBubbleToPrevious()
            ]} 
            colors={styles[position].gradientColor} 
            start={{x:0, y:1}} end={{x:1, y:1}}>
            {this.renderUsername()}
          <TouchableOpacity activeOpacity={1}
            onLongPress={()=>{this.onLongPress()}} accessibilityTraits='text' {...this.props.touchableProps}>
            <View>
              {this.renderCustomView()}
              {this.renderMessageImage()}
              {this.renderMessageText()}
              <View style={[
            styles[position].bottom,
            bottomContainerStyle && bottomContainerStyle[position],
        ]}>
                
                {this.renderTime()}
                {this.renderTicks()}
              </View>
            </View>
          </TouchableOpacity>
        </LinearGradient>

        {this.renderQuickReplies()}
      </View>);
    }
}
Bubble.contextTypes = {
    actionSheet: PropTypes.func,
};
Bubble.defaultProps = {
    touchableProps: {},
    onLongPress: null,
    renderMessageImage: null,
    renderMessageText: null,
    renderCustomView: null,
    renderUsername: null,
    renderTicks: null,
    renderTime: null,
    renderQuickReplies: null,
    onQuickReply: null,
    position: 'left',
    optionTitles: DEFAULT_OPTION_TITLES,
    currentMessage: {
        text: null,
        createdAt: null,
        image: null,
    },
    nextMessage: {},
    previousMessage: {},
    containerStyle: {},
    wrapperStyle: {},
    bottomContainerStyle: {},
    tickStyle: {},
    usernameStyle: {},
    containerToNextStyle: {},
    containerToPreviousStyle: {},
};
Bubble.propTypes = {
    user: PropTypes.object.isRequired,
    touchableProps: PropTypes.object,
    onLongPress: PropTypes.func,
    renderMessageImage: PropTypes.func,
    renderMessageText: PropTypes.func,
    renderCustomView: PropTypes.func,
    renderUsernameOnMessage: PropTypes.bool,
    renderUsername: PropTypes.func,
    renderTime: PropTypes.func,
    renderTicks: PropTypes.func,
    renderQuickReplies: PropTypes.func,
    onQuickReply: PropTypes.func,
    position: PropTypes.oneOf(['left', 'right']),
    optionTitles: PropTypes.arrayOf(PropTypes.string),
    currentMessage: PropTypes.object,
    nextMessage: PropTypes.object,
    previousMessage: PropTypes.object,
    containerStyle: PropTypes.shape({
        left: ViewPropTypes.style,
        right: ViewPropTypes.style,
    }),
    wrapperStyle: PropTypes.shape({
        left: ViewPropTypes.style,
        right: ViewPropTypes.style,
    }),
    bottomContainerStyle: PropTypes.shape({
        left: ViewPropTypes.style,
        right: ViewPropTypes.style,
    }),
    tickStyle: PropTypes.any,
    usernameStyle: PropTypes.any,
    containerToNextStyle: PropTypes.shape({
        left: ViewPropTypes.style,
        right: ViewPropTypes.style,
    }),
    containerToPreviousStyle: PropTypes.shape({
        left: ViewPropTypes.style,
        right: ViewPropTypes.style,
    }),
};
//# sourceMappingURL=Bubble.js.map