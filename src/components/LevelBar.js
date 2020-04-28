import React from 'react';
import {View, Text} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {getLevel} from '../extraUtilities';
import {FONTS} from '../Constants';

const LevelBar = props => {
  const {COLORS, userXP} = props;
  const XPObject = getLevel(userXP);
  if (!XPObject) {
    return null;
  }
  const widthPercent = Math.floor(
    (100 * (XPObject.levelXP - XPObject.XPToLevelUp)) / XPObject.levelXP,
  );

  return (
    <View
      style={{
        width: '100%',
        height: 28,
        justifyContent: 'center',
        paddingLeft: 24,
        paddingRight: 42,
      }}>
      <View
        style={{
          width: '100%',
          height: 20,
          backgroundColor: COLORS.LESSER_LIGHT,
          elevation: 4,
        }}>
        <LinearGradient
          style={{
            width: `${widthPercent}%`,
            flex: 1,
            borderTopRightRadius: 5,
            borderBottomRightRadius: 5,
          }}
          colors={[COLORS.GRADIENT_BLUE1, COLORS.GRADIENT_BLUE2]}
          start={{x: 0, y: 1}}
          end={{x: 1, y: 1}}
        />
      </View>
      <View
        style={{
          borderRadius: 14,
          height: 28,
          width: 28,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: COLORS.LESSER_LIGHT,
          position: 'absolute',
          elevation: 5,
        }}>
        <Text
          style={{
            fontFamily: FONTS.GOTHAM_BLACK,
            color: COLORS.GRAY,
            marginRight: 1,
            marginBottom: 1,
          }}>
          {XPObject.level}
        </Text>
      </View>
      <View
        style={{
          borderRadius: 14,
          height: 28,
          width: 48,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: COLORS.LESSER_LIGHT,
          alignSelf: 'flex-end',
          position: 'absolute',
          elevation: 5,
        }}>
        <Text
          style={{
            fontFamily: FONTS.PRODUCT_SANS_BOLD,
            fontSize: 9,
            color: COLORS.LESS_DARK,
          }}>
          {XPObject.XPToLevelUp}
        </Text>
        <Text
          style={{
            fontFamily: FONTS.PRODUCT_SANS,
            color: COLORS.GRAY,
            fontSize: 7,
          }}>
          XP More
        </Text>
      </View>
    </View>
  );
};

export default LevelBar;
