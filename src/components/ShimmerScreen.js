import React from 'react';
import {FlatList, View} from 'react-native';
import ShimmerPlaceHolder from 'react-native-shimmer-placeholder';

const LOADING_CARD_SIZE = 150;
const LOADING_CARD_SIZE_RATIO = 4 / 3;

const ShimmerScreen = ({rows, columns, COLORS, header, footer}) => {
  return (
    <FlatList
      data={Array(rows ?? 4).fill(0)}
      keyExtractor={(_, index) => index.toString()}
      ListHeaderComponent={header ?? null}
      ListFooterComponent={footer ?? <View style={{height: 50}} />}
      showsHorizontalScrollIndicator={false}
      renderItem={() => (
        <View>
          <ShimmerPlaceHolder
            colorShimmer={COLORS.SHIMMER_COLOR}
            visible={false}
            autoRun={true}
            duration={650}
            delay={30}
            style={{
              height: 35,
              borderRadius: 5,
              marginTop: 30,
              marginLeft: 15,
              alignItems: 'center',
              elevation: 6,
            }}
          />
          <FlatList
            data={Array(columns ?? 5).fill(0)}
            keyExtractor={(_, index) => index.toString()}
            horizontal
            contentContainerStyle={{paddingHorizontal: 10}}
            showsHorizontalScrollIndicator={false}
            renderItem={() => (
              <ShimmerPlaceHolder
                colorShimmer={COLORS.SHIMMER_COLOR}
                visible={false}
                style={{
                  width: LOADING_CARD_SIZE * LOADING_CARD_SIZE_RATIO,
                  height: LOADING_CARD_SIZE,
                  borderRadius: 8,
                  margin: 15,
                  marginHorizontal: 5,
                  elevation: 6,
                }}
              />
            )}
          />
        </View>
      )}
    />
  );
};

export default ShimmerScreen;
