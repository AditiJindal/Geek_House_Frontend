import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { StyleSheet, Text, TouchableOpacity, View, ViewPropTypes, } from 'react-native';
import Color from './Color';
import {COLORS_LIGHT_THEME, FONTS} from '../../Constants'
import LinearGradient from 'react-native-linear-gradient';
const styles = StyleSheet.create({
    container: {
        padding:10,
        borderRadius:10,
        marginRight:5
    },
    text: {
        color: COLORS_LIGHT_THEME.LIGHT,
        fontSize: 16,
        fontFamily:FONTS.GOTHAM_BLACK,
        backgroundColor: Color.backgroundTransparent,
    },
});
export default class Send extends Component {
    render() {
        const { text, containerStyle, onSend, children, textStyle, label, alwaysShowSend, disabled, } = this.props;
        if (alwaysShowSend || (text && text.trim().length > 0) || this.props.selectedImage) {
            return (
        <TouchableOpacity testID='send' accessible accessibilityLabel='send' activeOpacity={1} onPress={() => {
            if ((text || this.props.selectedImage) && onSend) {
                onSend({ text: text.trim(), image:this.props.selectedImage }, true);
            }
            }} accessibilityTraits='button' disabled={disabled} style={{justifyContent: 'flex-end',alignSelf:'center'}}>
            <LinearGradient style={[styles.container, containerStyle]} colors={["#97e063", "#a8e063"]}
            start={{x:0.75, y:0.75}} end={{x:0.25, y:0.25}}>
                <View>
                    {children || <Text style={[styles.text, textStyle]}>{'SEND'}</Text>}
                </View>
            </LinearGradient>
        </TouchableOpacity>
        );
        }
        return <View />;
    }
}
Send.defaultProps = {
    text: '',
    onSend: () => { },
    label: 'Send',
    containerStyle: {},
    textStyle: {},
    children: null,
    alwaysShowSend: false,
    disabled: false,
};
Send.propTypes = {
    text: PropTypes.string,
    onSend: PropTypes.func,
    label: PropTypes.string,
    containerStyle: ViewPropTypes.style,
    textStyle: PropTypes.any,
    children: PropTypes.element,
    alwaysShowSend: PropTypes.bool,
    disabled: PropTypes.bool,
};
//# sourceMappingURL=Send.js.map