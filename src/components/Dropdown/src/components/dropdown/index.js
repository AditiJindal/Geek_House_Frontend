import PropTypes from 'prop-types';
import React, {PureComponent} from 'react';
import {
  Text,
  View,
  FlatList,
  Animated,
  Modal,
  TouchableWithoutFeedback,
  Dimensions,
  Platform,
  ViewPropTypes,
  I18nManager,
  TouchableOpacity,
  TextInput,
  UIManager,
  LayoutAnimation,
} from 'react-native';
import {FONTS} from '../../../../../Constants';
import Icon from 'react-native-vector-icons/Feather';

import DropdownItem from '../item';
import styles from './styles';

export default class Dropdown extends PureComponent {
  static defaultProps = {
    hitSlop: {top: 6, right: 4, bottom: 6, left: 4},

    disabled: false,

    data: [],

    valueExtractor: ({value} = {}, index) => value,
    labelExtractor: ({label} = {}, index) => label,
    propsExtractor: () => null,

    absoluteRTLLayout: false,

    dropdownOffset: {
      top: 32,
      left: 0,
    },

    dropdownMargins: {
      min: 8,
      max: 16,
    },

    shadeOpacity: 0.12,

    animationDuration: 0,

    fontSize: 16,

    textColor: 'rgba(0, 0, 0, .87)',
    itemColor: 'rgba(0, 0, 0, .54)',
    baseColor: 'rgba(0, 0, 0, .38)',

    itemCount: 7,
    itemPadding: 5,

    supportedOrientations: [
      'portrait',
      'portrait-upside-down',
      'landscape',
      'landscape-left',
      'landscape-right',
    ],

    useNativeDriver: true,
  };

  static propTypes = {
    ...TouchableWithoutFeedback.propTypes,

    disabled: PropTypes.bool,

    value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),

    data: PropTypes.arrayOf(PropTypes.object),

    valueExtractor: PropTypes.func,
    labelExtractor: PropTypes.func,
    propsExtractor: PropTypes.func,

    absoluteRTLLayout: PropTypes.bool,

    dropdownOffset: PropTypes.shape({
      top: PropTypes.number.isRequired,
      left: PropTypes.number.isRequired,
    }),

    dropdownMargins: PropTypes.shape({
      min: PropTypes.number.isRequired,
      max: PropTypes.number.isRequired,
    }),

    dropdownPosition: PropTypes.number,

    shadeOpacity: PropTypes.number,

    animationDuration: PropTypes.number,

    fontSize: PropTypes.number,

    textColor: PropTypes.string,
    itemColor: PropTypes.string,
    selectedItemColor: PropTypes.string,
    disabledItemColor: PropTypes.string,
    baseColor: PropTypes.string,

    itemTextStyle: Text.propTypes.style,

    itemCount: PropTypes.number,
    itemPadding: PropTypes.number,

    onLayout: PropTypes.func,
    onFocus: PropTypes.func,
    onBlur: PropTypes.func,
    onChangeText: PropTypes.func,

    renderBase: PropTypes.func,
    renderAccessory: PropTypes.func,

    containerStyle: (ViewPropTypes || View.propTypes).style,
    overlayStyle: (ViewPropTypes || View.propTypes).style,
    pickerStyle: (ViewPropTypes || View.propTypes).style,

    supportedOrientations: PropTypes.arrayOf(PropTypes.string),

    useNativeDriver: PropTypes.bool,
  };

  constructor(props) {
    super(props);

    this.onPress = this.onPress.bind(this);
    this.onClose = this.onClose.bind(this);
    this.onSelect = this.onSelect.bind(this);
    this.onLayout = this.onLayout.bind(this);

    this.updateContainerRef = this.updateRef.bind(this, 'container');
    this.updateScrollRef = this.updateRef.bind(this, 'scroll');

    this.renderAccessory = this.renderAccessory.bind(this);
    this.renderItem = this.renderItem.bind(this);

    this.keyExtractor = this.keyExtractor.bind(this);

    this.blur = () => this.onClose();
    this.focus = this.onPress;

    let {value} = this.props;

    this.mounted = false;
    this.focused = false;

    this.state = {
      opacity: new Animated.Value(0),
      selected: -1,
      modal: false,
      value,
      searchValue: '',
    };
  }
  componentDidMount() {
    if (Platform.OS === 'android') {
      if (UIManager.setLayoutAnimationEnabledExperimental) {
        UIManager.setLayoutAnimationEnabledExperimental(true);
      }
    }
    this.mounted = true;
  }

  componentWillUnmount() {
    this.mounted = false;
  }

  onPress(event) {
    let {
      data,
      disabled,
      onFocus,
      itemPadding,
      dropdownOffset,
      dropdownMargins: {min: minMargin, max: maxMargin},
      absoluteRTLLayout,
    } = this.props;

    if (disabled) {
      return;
    }

    let itemCount = data.length;
    let timestamp = Date.now();

    if (!itemCount) {
      return;
    }

    this.focused = true;

    if ('function' === typeof onFocus) {
      onFocus();
    }

    let dimensions = Dimensions.get('window');

    this.container.measureInWindow((x, y, containerWidth, containerHeight) => {
      let {opacity} = this.state;

      /* Adjust coordinates for relative layout in RTL locale */
      if (I18nManager.isRTL && !absoluteRTLLayout) {
        x = dimensions.width - (x + containerWidth);
      }

      let selected = this.selectedIndex();

      let leftInset;
      let left = x + dropdownOffset.left - maxMargin;

      if (left > minMargin) {
        leftInset = maxMargin;
      } else {
        left = minMargin;
        leftInset = minMargin;
      }

      let right = x + containerWidth + maxMargin;
      let rightInset;

      if (dimensions.width - right > minMargin) {
        rightInset = maxMargin;
      } else {
        right = dimensions.width - minMargin;
        rightInset = minMargin;
      }

      let top = y + dropdownOffset.top - itemPadding;

      this.setState({
        modal: true,
        width: right - left,
        top,
        left,
        leftInset,
        rightInset,
        selected,
      });

      if (this.mounted) {
        this.resetScrollOffset();

        Animated.timing(opacity, {
          duration: 0,
          toValue: 1,
          useNativeDriver: true,
        }).start(() => {
          if (this.mounted && 'ios' === Platform.OS) {
            let {flashScrollIndicators} = this.scroll || {};

            if ('function' === typeof flashScrollIndicators) {
              flashScrollIndicators.call(this.scroll);
            }
          }
        });
      }
    });
  }

  onClose(value = this.state.value) {
    let {onBlur} = this.props;
    let {opacity} = this.state;

    Animated.timing(opacity, {
      duration: 0,
      toValue: 0,
      useNativeDriver: true,
    }).start(() => {
      this.focused = false;

      if ('function' === typeof onBlur) {
        onBlur();
      }

      if (this.mounted) {
        this.setState({value, modal: false});
      }
    });
  }

  onSelect(index) {
    let {data, valueExtractor, onChangeText} = this.props;

    let value = valueExtractor(data[index], index);

    if ('function' === typeof onChangeText) {
      onChangeText(value, index, data);
    }

    this.onClose(value);
  }

  onLayout(event) {
    let {onLayout} = this.props;

    if ('function' === typeof onLayout) {
      onLayout(event);
    }
  }

  value() {
    let {value} = this.state;

    return value;
  }

  selectedIndex() {
    let {value} = this.state;
    let {data, valueExtractor} = this.props;

    return data.findIndex(
      (item, index) => null != item && value === valueExtractor(item, index),
    );
  }

  selectedItem() {
    let {data} = this.props;

    return data[this.selectedIndex()];
  }

  isFocused() {
    return this.focused;
  }

  itemSize() {
    let {fontSize, itemPadding} = this.props;

    return Math.ceil(fontSize * 1.5 + itemPadding * 2);
  }

  visibleItemCount() {
    let {data, itemCount} = this.props;

    return Math.min(data.length, itemCount);
  }

  tailItemCount() {
    return Math.max(this.visibleItemCount() - 2, 0);
  }

  resetScrollOffset() {
    let {selected} = this.state;
    let {data, dropdownPosition} = this.props;

    let offset = 0;
    let itemCount = data.length;
    let itemSize = this.itemSize();
    let tailItemCount = this.tailItemCount();
    let visibleItemCount = this.visibleItemCount();

    if (itemCount > visibleItemCount) {
      if (null == dropdownPosition) {
        switch (selected) {
          case -1:
            break;

          case 0:
          case 1:
            break;

          default:
            if (selected >= itemCount - tailItemCount) {
              offset = itemSize * (itemCount - visibleItemCount);
            } else {
              offset = itemSize * (selected - 1);
            }
        }
      } else {
        let index = selected - dropdownPosition;

        if (dropdownPosition < 0) {
          index -= visibleItemCount;
        }

        index = Math.max(0, index);
        index = Math.min(index, itemCount - visibleItemCount);

        if (~selected) {
          offset = itemSize * index;
        }
      }
    }

    if (this.scroll) {
      this.scroll.scrollToOffset({offset, animated: false});
    }
  }

  updateRef(name, ref) {
    this[name] = ref;
  }

  keyExtractor(item, index) {
    let {valueExtractor} = this.props;

    return `${index}-${valueExtractor(item, index)}`;
  }

  renderBase(props) {
    const {COLORS} = this.props;
    let {value} = this.state;
    let {
      data,
      renderBase,
      labelExtractor,
      dropdownOffset,
      renderAccessory = this.renderAccessory,
    } = this.props;

    let index = this.selectedIndex();
    let title;

    if (~index) {
      title = labelExtractor(data[index], index);
    }

    if (null == title) {
      title = value;
    }

    if ('function' === typeof renderBase) {
      return renderBase({...props, title, value, renderAccessory});
    }

    title = null == title || 'string' === typeof title ? title : String(title);

    props.baseColor = COLORS.GRAY;
    props.tintColor = COLORS.GRAY;
    props.animationDuration = 0;
    return (
      <View
        style={{
          borderBottomWidth: 0.5,
          padding: 5,
          borderBottomColor: COLORS.LESS_DARK,
        }}>
        <Text
          style={{
            fontFamily: FONTS.RALEWAY,
            color: COLORS.LESS_DARK,
            fontSize: 12,
          }}>
          {this.props.label}
        </Text>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}>
          <Text
            style={{
              fontFamily: FONTS.PRODUCT_SANS_BOLD,
              color: COLORS.LESS_DARK,
              fontSize: 18,
            }}>
            {value}
          </Text>
          {renderAccessory()}
        </View>
      </View>
    );
  }

  renderAccessory() {
    let triangleStyle = {backgroundColor: this.props.COLORS.DARK};

    return (
      <View style={styles.accessory}>
        <View style={styles.triangleContainer}>
          <View style={[styles.triangle, triangleStyle]} />
        </View>
      </View>
    );
  }

  renderItem({item, index}) {
    if (null == item) {
      return null;
    }

    let {selected, leftInset, rightInset} = this.state;

    let {
      valueExtractor,
      labelExtractor,
      propsExtractor,
      textColor,
      itemColor,
      baseColor,
      selectedItemColor = textColor,
      disabledItemColor = baseColor,
      fontSize,
      itemTextStyle,
      shadeOpacity,
      COLORS,
    } = this.props;

    let props = propsExtractor(item, index);

    let {style, disabled} = (props = {
      shadeColor: baseColor,
      shadeOpacity,

      ...props,

      onPress: this.onSelect,
    });

    let value = valueExtractor(item, index);
    let label = labelExtractor(item, index);

    let title = null == label ? value : label;

    let textStyle = {color: COLORS.LESS_DARK, fontSize};

    props.style = [
      style,
      {
        height: this.itemSize(),
        paddingLeft: leftInset,
        paddingRight: rightInset,
      },
    ];

    if (!title.toUpperCase().includes(this.state.searchValue.toUpperCase())) {
      return null;
    }

    return (
      <DropdownItem index={index} {...props}>
        <Text
          style={[styles.item, {fontFamily: FONTS.PRODUCT_SANS}, textStyle]}
          numberOfLines={1}>
          {title}
        </Text>
      </DropdownItem>
    );
  }

  renderSearch() {
    const {COLORS} = this.props;
    return (
      <View
        style={{
          width: '100%',
          height: 40,
          justifyContent: 'center',
          paddingHorizontal: 10,
          borderRadius: 10,
          backgroundColor: COLORS.LESSER_LIGHT,
          top: 5,
          alignSelf: 'center',
          position: 'absolute',
          flexDirection: 'row',
          alignItems: 'center',
          elevation: 5,
        }}>
        <Icon
          name="search"
          style={{marginBottom: 3, marginHorizontal: 2}}
          color={COLORS.LESS_DARK}
          size={16}
        />
        <TextInput
          placeholder="Search for a Category"
          placeholderTextColor={COLORS.GRAY}
          value={this.state.searchValue}
          style={{
            flex: 1,
            fontFamily: FONTS.RALEWAY,
            color: COLORS.LESS_DARK,
            fontSize: 14,
          }}
          onChangeText={(text) => {
            LayoutAnimation.configureNext(
              LayoutAnimation.create(
                300,
                LayoutAnimation.Types.linear,
                LayoutAnimation.Properties.scaleXY,
              ),
            );
            this.setState({searchValue: text});
          }}
        />
        {this.state.searchValue ? (
          <TouchableOpacity
            onPress={() => {
              this.setState({searchValue: ''});
            }}
            activeOpacity={0.7}>
            <Icon
              name="x"
              style={{marginBottom: 3, marginHorizontal: 2}}
              color={COLORS.LESS_DARK}
              size={16}
            />
          </TouchableOpacity>
        ) : null}
      </View>
    );
  }

  render() {
    const {COLORS} = this.props;
    let {
      renderBase,
      renderAccessory,
      containerStyle,
      overlayStyle: overlayStyleOverrides,
      pickerStyle: pickerStyleOverrides,

      hitSlop,
      pressRetentionOffset,
      testID,
      nativeID,
      accessible,
      accessibilityLabel,

      supportedOrientations,

      ...props
    } = this.props;

    let {data, disabled, itemPadding, dropdownPosition} = props;

    let {left, top, width, opacity, selected, modal} = this.state;

    let itemCount = data.length;
    let visibleItemCount = this.visibleItemCount();
    let tailItemCount = this.tailItemCount();
    let itemSize = this.itemSize();

    let height = 2 * itemPadding + itemSize * visibleItemCount;
    let translateY = -itemPadding;

    if (null == dropdownPosition) {
      switch (selected) {
        case -1:
          translateY -= 1 === itemCount ? 0 : itemSize;
          break;

        case 0:
          break;

        default:
          if (selected >= itemCount - tailItemCount) {
            translateY -=
              itemSize * (visibleItemCount - (itemCount - selected));
          } else {
            translateY -= itemSize;
          }
      }
    } else {
      if (dropdownPosition < 0) {
        translateY -= itemSize * (visibleItemCount + dropdownPosition);
      } else {
        translateY -= itemSize * dropdownPosition;
      }
    }

    let overlayStyle = {opacity};

    let pickerStyle = {
      width,
      height,
      top,
      left,
      transform: [{translateY}],
    };

    let touchableProps = {
      disabled,
      hitSlop,
      pressRetentionOffset,
      onPress: this.onPress,
      testID,
      nativeID,
      accessible,
      accessibilityLabel,
    };

    return (
      <View
        onLayout={this.onLayout}
        ref={this.updateContainerRef}
        style={containerStyle}>
        <TouchableOpacity {...touchableProps} activeOpacity={0.8}>
          {this.renderBase(props)}
        </TouchableOpacity>
        <Modal visible={modal} transparent={true} onRequestClose={this.blur}>
          <Animated.View
            style={[styles.overlay, overlayStyle, overlayStyleOverrides]}
            onStartShouldSetResponder={() => true}
            onResponderRelease={this.blur}>
            <View
              style={[
                styles.picker,
                pickerStyle,
                {
                  elevation: 15,
                  borderRadius: 15,
                  paddingHorizontal: 5,
                  backgroundColor: COLORS.LIGHT,
                },
              ]}
              onStartShouldSetResponder={() => true}>
              {this.renderSearch()}
              <FlatList
                ref={this.updateScrollRef}
                data={data}
                keyboardShouldPersistTaps="always"
                showsVerticalScrollIndicator={false}
                ListHeaderComponent={<View style={{height: 45, width: 1}} />}
                ListFooterComponent={<View style={{height: 20, width: 1}} />}
                style={styles.scroll}
                renderItem={(item) => this.renderItem(item)}
                keyExtractor={this.keyExtractor}
                contentContainerStyle={styles.scrollContainer}
              />
            </View>
          </Animated.View>
        </Modal>
      </View>
    );
  }
}
