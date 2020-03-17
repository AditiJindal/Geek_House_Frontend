import PropTypes from 'prop-types';
import React from 'react';
import { Linking, View, ViewPropTypes, } from 'react-native';
// @ts-ignore
import ParsedText from 'react-native-parsed-text';
import Communications from 'react-native-communications';
import {COLORS_LIGHT_THEME, FONTS} from '../../Constants';
const WWW_URL_PATTERN = /^www\./i;
const textStyle = {
    fontSize: 16,
    fontFamily:FONTS.PRODUCT_SANS,
    marginTop: 2,
    marginBottom: 3,
    marginLeft: 10,
    marginRight: 10,
};
const styles = {
    left: {
        container: {},
        text: {
            color: COLORS_LIGHT_THEME.LESS_DARK,
            ...textStyle,
        },
        link: {
            color: COLORS_LIGHT_THEME.LESSER_DARK,
            fontFamily:FONTS.PRODUCT_SANS_BOLD,
            fontSize:16,
            textDecorationLine: 'underline',
        },
    },
    right: {
        container: {},
        text: {
            color: COLORS_LIGHT_THEME.LIGHT,
            ...textStyle,marginTop:5,
        },
        link: {
            fontFamily:FONTS.PRODUCT_SANS_BOLD,
            color: COLORS_LIGHT_THEME.LIGHT,
            textDecorationLine: 'underline',
        },
    },
};

const isEmoji = (text) => {
    let regex_test = text.match(/(\u00a9|\u00ae|[\u2000-\u3300]|\ud83c[\ud000-\udfff]|\ud83d[\ud000-\udfff]|\ud83e[\ud000-\udfff])/);
    return (regex_test && (text.length===2))
}

const getAppropriateSize = (text) => {
    let length = Number(text.length);

    if (isEmoji(text)){return 30}
    else if(length===1){return 20}
    else if(20>length){return 16}
    return 14
}

export default class MessageText extends React.Component {
    constructor() {
        super(...arguments);
        this.onUrlPress = (url) => {
            // When someone sends a message that includes a website address beginning with "www." (omitting the scheme),
            // react-native-parsed-text recognizes it as a valid url, but Linking fails to open due to the missing scheme.
            if (WWW_URL_PATTERN.test(url)) {
                this.onUrlPress(`http://${url}`);
            }
            else {
                Linking.canOpenURL(url).then(supported => {
                    if (supported) {
                        Linking.openURL(url);
                    }
                });
            }
        };
        this.onPhonePress = (phone) => {
            const options = ['Call', 'Text', 'Cancel'];
            const cancelButtonIndex = options.length - 1;
            this.context.actionSheet().showActionSheetWithOptions({
                options,
                cancelButtonIndex,
            }, (buttonIndex) => {
                switch (buttonIndex) {
                    case 0:
                        Communications.phonecall(phone, true);
                        break;
                    case 1:
                        Communications.text(phone);
                        break;
                    default:
                        break;
                }
            });
        };
        this.onEmailPress = (email) => Communications.email([email], null, null, null, null);
    }
    shouldComponentUpdate(nextProps) {
        return (!!this.props.currentMessage &&
            !!nextProps.currentMessage &&
            this.props.currentMessage.text !== nextProps.currentMessage.text);
    }
    render() {
        const linkStyle = [
            styles[this.props.position].link,
            this.props.linkStyle && this.props.linkStyle[this.props.position],
        ];
        return (<View style={[
            styles[this.props.position].container,
            this.props.containerStyle &&
                this.props.containerStyle[this.props.position],
        ]}>
        <ParsedText style={[
            styles[this.props.position].text,
            this.props.textStyle && this.props.textStyle[this.props.position],
            this.props.customTextStyle, {fontSize: getAppropriateSize(this.props.currentMessage.text)}
        ]} parse={[
            ...this.props.parsePatterns(linkStyle),
            { type: 'url', style: linkStyle, onPress: this.onUrlPress },
            { type: 'phone', style: linkStyle, onPress: this.onPhonePress },
            { type: 'email', style: linkStyle, onPress: this.onEmailPress },
        ]} childrenProps={{ ...this.props.textProps }}>
          {this.props.currentMessage.text}
        </ParsedText>
      </View>);
    }
}
MessageText.contextTypes = {
    actionSheet: PropTypes.func,
};
MessageText.defaultProps = {
    position: 'left',
    currentMessage: {
        text: '',
    },
    containerStyle: {},
    textStyle: {},
    linkStyle: {},
    customTextStyle: {},
    textProps: {},
    parsePatterns: () => [],
};
MessageText.propTypes = {
    position: PropTypes.oneOf(['left', 'right']),
    currentMessage: PropTypes.object,
    containerStyle: PropTypes.shape({
        left: ViewPropTypes.style,
        right: ViewPropTypes.style,
    }),
    textStyle: PropTypes.shape({
        left: PropTypes.object,
        right: PropTypes.object,
    }),
    linkStyle: PropTypes.shape({
        left: PropTypes.object,
        right: PropTypes.object,
    }),
    parsePatterns: PropTypes.func,
    textProps: PropTypes.object,
    customTextStyle: PropTypes.object,
};
//# sourceMappingURL=MessageText.js.map