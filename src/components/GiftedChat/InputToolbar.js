import PropTypes from 'prop-types';
import React from 'react';
import { StyleSheet, View, Keyboard, ViewPropTypes, Text, StatusBar} from 'react-native';
import Composer from './Composer';
import Send from './Send';
import Actions from './Actions';
import Color from './Color';
import {COLORS_DARK_THEME, COLORS_LIGHT_THEME, FONTS} from '../../Constants'
import Icon from 'react-native-vector-icons/Feather';
import {Overlay} from 'react-native-elements';

const getStatusBarColor = (theme, i) => {
    if (i){
        if (theme==='light'){
            return COLORS_LIGHT_THEME.OVERLAY_COLOR
        }
        else{
            return COLORS_DARK_THEME.OVERLAY_COLOR
        }
    }
    else{
        if (theme==='light'){
            return COLORS_LIGHT_THEME.LIGHT
        }
        else{
            return COLORS_DARK_THEME.LIGHT
        }
    }
}


const styles = StyleSheet.create({
    container: {
        // borderTopWidth: StyleSheet.hairlineWidth,
        borderTopColor: Color.defaultColor,
        backgroundColor: Color.white,
        bottom: 0,
        left: 0,
        right: 0,
    },
    primary: {
        flexDirection: 'row',
        alignItems: 'center',
        margin:10,
        marginTop:0,
        padding:5,
        backgroundColor:'white',
        elevation:5,
        borderRadius:15
    },
    accessory: {
        height: 44,
    },
});
export default class InputToolbar extends React.Component {
    constructor() {
        super(...arguments);
        this.state = {
            position: 'absolute',
            imageSelectorOpen: false
        };
        this.keyboardWillShowListener = undefined;
        this.keyboardWillHideListener = undefined;
        this.keyboardWillShow = () => {
            if (this.state.position !== 'relative') {
                this.setState({
                    position: 'relative',
                });
            }
        };
        this.keyboardWillHide = () => {
            if (this.state.position !== 'absolute') {
                this.setState({
                    position: 'absolute',
                });
            }
        };
    }
    componentDidMount() {
        this.keyboardWillShowListener = Keyboard.addListener('keyboardWillShow', this.keyboardWillShow);
        this.keyboardWillHideListener = Keyboard.addListener('keyboardWillHide', this.keyboardWillHide);
    }
    componentDidUnmount() {
        if (this.keyboardWillShowListener) {
            this.keyboardWillShowListener.remove();
        }
        if (this.keyboardWillHideListener) {
            this.keyboardWillHideListener.remove();
        }
    }

    renderActions() {
        const { containerStyle, ...props } = this.props;
        if (this.props.renderActions) {
            return this.props.renderActions(props);
        }
        else if (this.props.onPressActionButton) {
            return <Actions {...props}/>;
        }
        return null;
    }
    renderSend() {
        if (this.props.renderSend) {
            return this.props.renderSend(this.props);
        }
        return <Send {...this.props}/>;
    }
    renderComposer() {
        if (this.props.renderComposer) {
            return this.props.renderComposer(this.props);
        }
        return <Composer {...this.props}/>;
    }
    renderAccessory() {
        if (this.props.renderAccessory) {
            return (<View style={[styles.accessory, this.props.accessoryStyle]}>
          {this.props.renderAccessory(this.props)}
        </View>);
        }
        return null;
    }
    renderCamera(){
        return (
            <View style={{paddingHorizontal:10}}>
                <Overlay isVisible={this.state.imageSelectorOpen}
                    height="auto" width="auto"
                    overlayStyle={{flexDirection:'row',backgroundColor:'rgba(0,0,0,0)', elevation:0}}
                    onBackdropPress={()=>{this.setState({imageSelectorOpen:false})}}>
                    <View style={{height:180, width:120, justifyContent:'space-around', alignItems:'center', elevation:20,borderRadius:15,
                        backgroundColor:(this.props.theme==='light')?COLORS_LIGHT_THEME.LESSER_LIGHT:COLORS_DARK_THEME.LESSER_LIGHT, marginRight:15}}>
                        <View style={{height:50, justifyContent:'center'}}>
                            <Text style={{color:(this.props.theme==='light')?COLORS_LIGHT_THEME.LESSER_DARK:COLORS_DARK_THEME.LESSER_DARK,
                                fontFamily:FONTS.RALEWAY_BOLD, textAlign:'center', fontSize:16}}>
                                Gallery
                            </Text>
                        </View>
                        <Icon size={72} name="image"
                        color={(this.props.theme==='light')?COLORS_LIGHT_THEME.LESSER_DARK:COLORS_DARK_THEME.LESSER_DARK}/>
                        <View style={{height:50, justifyContent:'center'}}>
                            <Text style={{color:(this.props.theme==='light')?COLORS_LIGHT_THEME.LESSER_DARK:COLORS_DARK_THEME.LESSER_DARK,
                                fontFamily:FONTS.PRODUCT_SANS, textAlign:'center', fontSize:12}}>
                                {`Select from\nGallery`}
                            </Text>
                        </View>
                    </View>
                    <View style={{height:180, width:120, justifyContent:'space-around', alignItems:'center', elevation:20,borderRadius:15,
                        backgroundColor:(this.props.theme==='light')?COLORS_LIGHT_THEME.LESSER_LIGHT:COLORS_DARK_THEME.LESSER_LIGHT}}>
                        <View style={{height:50, justifyContent:'center'}}>
                            <Text style={{color:(this.props.theme==='light')?COLORS_LIGHT_THEME.LESSER_DARK:COLORS_DARK_THEME.LESSER_DARK,
                                fontFamily:FONTS.RALEWAY_BOLD, textAlign:'center', fontSize:16}}>
                                Camera
                            </Text>
                        </View>
                        <Icon size={72} name="camera"
                        color={(this.props.theme==='light')?COLORS_LIGHT_THEME.LESSER_DARK:COLORS_DARK_THEME.LESSER_DARK}/>
                        <View style={{height:50, justifyContent:'center'}}>
                            <Text style={{color:(this.props.theme==='light')?COLORS_LIGHT_THEME.LESSER_DARK:COLORS_DARK_THEME.LESSER_DARK,
                                fontFamily:FONTS.PRODUCT_SANS, textAlign:'center', fontSize:12}}>
                                {`Click from\nCamera`}
                            </Text>
                        </View>
                    </View>
                </Overlay>
                <Icon size={22} name="image"
                    onPress={()=>{this.setState({imageSelectorOpen:true})}}
                    color={(this.props.theme==='light')?COLORS_LIGHT_THEME.LESSER_DARK:COLORS_DARK_THEME.LESSER_DARK}
                />
            </View>
        )
    }
    render() {
        return (<View style={[
            styles.container,
            this.props.containerStyle,
            { position: this.state.position },
        ]}>
        <View style={[styles.primary, this.props.primaryStyle]}>
        <StatusBar 
            barStyle={(this.props.theme==='light')?'dark-content':'light-content'}
            backgroundColor={getStatusBarColor(this.props.theme, this.state.imageSelectorOpen)}/>
          {this.renderActions()}
          {this.renderComposer()}
          {this.renderSend()}
          {this.renderCamera()}
        </View>
        {this.renderAccessory()}
      </View>);
    }
}
InputToolbar.defaultProps = {
    renderAccessory: null,
    renderActions: null,
    renderSend: null,
    renderComposer: null,
    containerStyle: {},
    primaryStyle: {},
    accessoryStyle: {},
    onPressActionButton: () => { },
};
InputToolbar.propTypes = {
    renderAccessory: PropTypes.func,
    renderActions: PropTypes.func,
    renderSend: PropTypes.func,
    renderComposer: PropTypes.func,
    onPressActionButton: PropTypes.func,
    containerStyle: ViewPropTypes.style,
    primaryStyle: ViewPropTypes.style,
    accessoryStyle: ViewPropTypes.style,
};
//# sourceMappingURL=InputToolbar.js.map