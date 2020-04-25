import PropTypes from 'prop-types';
import React, {PureComponent} from 'react';
import {TouchableOpacity} from 'react-native';
import styles from './styles';

export default class DropdownItem extends PureComponent {
  static defaultProps = {
    color: 'transparent',
    disabledColor: 'transparent',
    shadeBorderRadius: 0,
  };

  static propTypes = {
    index: PropTypes.number.isRequired,
  };

  constructor(props) {
    super(props);

    this.onPress = this.onPress.bind(this);
  }

  onPress() {
    let {onPress, index} = this.props;

    if ('function' === typeof onPress) {
      onPress(index);
    }
  }

  render() {
    let {children, style} = this.props;

    return (
      <TouchableOpacity
        activeOpacity={0.3}
        style={[styles.container, style]}
        onPress={this.onPress}>
        {children}
      </TouchableOpacity>
    );
  }
}
