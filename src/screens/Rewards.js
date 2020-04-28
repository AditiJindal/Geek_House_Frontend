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
or experience. Once you reach a certain level of experience, you will unlock certain\
perks and rewards.';

const HOW_TO_GET_XP = [
  'XP or Experience is gained by using the app regularly, reading and writing articles and using chat.',
  'You get 10 XP for reading an article. You can get a maximum of 100 XP every hour from this method.',
  'You get a minimum of 150 XP for writing an article. The longer and better your article is, the more XP you get',
  'You get 1 XP for every view on your articles. You can get a maximum of 500 XP every hour using this method, till a certain number of views.',
  'You get XP for using the chat based on the time spent. You can get a maximum of 200 XP every hour from this method.',
  'You get additional 100 XP for using the app every hour.',
];

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
        {HOW_TO_GET_XP.map(item => (
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
        {this.renderHowToGetXP()}
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
