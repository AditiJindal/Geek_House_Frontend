import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import {connect} from 'react-redux';
import Icon from 'react-native-vector-icons/Feather';
import {FONTS, EXPERIENCE_TEXT, HOW_TO_GET_XP, REWARDS} from '../Constants';

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
          onPress={() => this.props.navigation.goBack()}
          style={{justifyContent: 'center', alignItems: 'center', padding: 3}}>
          <Icon
            name="arrow-left"
            size={26}
            style={{marginVertical: 5, marginRight: 15}}
            color={COLORS.LESS_DARK}
          />
        </TouchableOpacity>

        <Text style={{...styles.HeadingTextStyling, color: COLORS.DARK}}>
          experience
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

  renderHowToGetXP() {
    const {COLORS} = this.props;
    return (
      <View style={{marginTop: 30}}>
        <Text style={{...styles.SubHeading, color: COLORS.LESS_DARK}}>
          How to get XP?
        </Text>
        {HOW_TO_GET_XP.map((item) => (
          <View style={{flexDirection: 'row', flex: 1}}>
            <Text style={{fontSize: 16, color: COLORS.LESS_DARK}}>•</Text>
            <Text
              style={{
                fontFamily: FONTS.RALEWAY,
                fontSize: 13,
                marginTop: 3,
                color: COLORS.LESS_DARK,
                textAlign: 'justify',
                marginBottom: 5,
                marginLeft: 10,
              }}>
              {item}
            </Text>
          </View>
        ))}
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
        {REWARDS.map(({level, reward}) => (
          <View style={{flexDirection: 'row', flex: 1, alignItems: 'center'}}>
            <Text style={{fontSize: 16, color: COLORS.LESS_DARK}}>•</Text>
            <Text
              style={{
                fontSize: 14,
                color: COLORS.LESS_DARK,
                fontFamily: FONTS.RALEWAY_BOLD,
                marginHorizontal: 5,
              }}>
              {level}
            </Text>
            <Text
              style={{
                fontFamily: FONTS.RALEWAY,
                fontSize: 14,
                color: COLORS.LESS_DARK,
              }}>
              {reward}
            </Text>
          </View>
        ))}
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
        {this.renderHowToGetXP()}
        {this.renderRewards()}
      </ScrollView>
    );
  }
}

const mapStateToProps = (state) => {
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
