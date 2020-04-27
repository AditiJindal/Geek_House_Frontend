import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import {connect} from 'react-redux';
import {Icon} from 'react-native-elements';
import {FONTS} from '../Constants';
import {Actions} from 'react-native-router-flux';

const EXPERIENCE_TEXT =
  'In Geek House, you can can get various rewards and perks based on your usage.\
The more you use Geek House for reading articles, the more you will get XP \
or experience. Once you reach a certain level of experice, you will unlock certain\
perks and rewards.';

class Rewards extends React.PureComponent {
  renderHeader() {
    const {COLORS} = this.props;
    return (
      <View
        style={{
          margin: 8,
          height: 70,
          justifyContent: 'space-between',
          alignItems: 'center',
          flexDirection: 'row',
        }}>
        <TouchableOpacity
          activeOpacity={1}
          onPress={() => {
            Actions.pop();
          }}
          style={{justifyContent: 'center', alignItems: 'center', padding: 3}}>
          <Icon
            name="arrow-left"
            type="material-community"
            size={26}
            containerStyle={{marginVertical: 5, marginRight: 15}}
            color={COLORS.LESS_DARK}
          />
        </TouchableOpacity>

        <Text style={{...styles.HeadingTextStyling, color: COLORS.DARK}}>
          expreience
        </Text>
      </View>
    );
  }

  renderText() {
    const {COLORS} = this.props;
    return (
      <View>
        <Text style={{...styles.ExperienceText, color: COLORS.LESS_DARK}}>
          {EXPERIENCE_TEXT}
        </Text>
      </View>
    );
  }

  renderRewards() {
    const {COLORS} = this.props;
    return (
      <View style={{marginTop: 30}}>
        <Text style={{...styles.SubHeading, color: COLORS.LESS_DARK}}>
          Rewards & Perks
        </Text>
        <Text
          style={{
            fontFamily: FONTS.RALEWAY,
            fontSize: 12,
            color: COLORS.LESS_DARK,
            textAlign: 'justify',
          }}>
          # We are currently deciding exciting rewards and perks for you, until
          then keep using the app and gain XP to get rewards as soon as they
          arrive.
        </Text>
      </View>
    );
  }

  render() {
    const {COLORS} = this.props;
    return (
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          backgroundColor: COLORS.LIGHT,
          paddingVertical: 10,
          paddingHorizontal: 25,
        }}>
        {this.renderHeader()}
        {this.renderText()}
        {this.renderRewards()}
      </ScrollView>
    );
  }
}

const mapStateToProps = state => {
  return {
    COLORS: state.chat.COLORS,
  };
};

// export default Rewards;
export default connect(mapStateToProps, {})(Rewards);

const styles = StyleSheet.create({
  HeadingTextStyling: {
    fontSize: 24,
    fontFamily: FONTS.GOTHAM_BLACK,
  },
  ExperienceText: {
    fontFamily: FONTS.RALEWAY,
    textAlign: 'justify',
    fontSize: 14,
  },
  SubHeading: {
    fontFamily: FONTS.RALEWAY_LIGHT,
    fontSize: 28,
  },
});
