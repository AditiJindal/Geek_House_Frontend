import React from 'react';
import {View, StyleSheet, FlatList, TextInput} from 'react-native';
import {connect} from 'react-redux';
import Image from 'react-native-fast-image';
import Icon from 'react-native-vector-icons/Feather';
import Ripple from './Ripple';
import {getGifs, gifSearch} from '../actions/ChatAction';
import Loading from './Loading';
import {COLORS_LIGHT_THEME, FONTS} from '../Constants';

const GIPHY_VIEW_HEGHT = 280;

class GiphyView extends React.Component {
  state = {giphyViewWidth: 0};

  componentDidMount() {
    const {gifs} = this.props;
    if (!gifs.data) {
      this.props.getGifs();
    }
  }

  renderGifSearch() {
    const {COLORS, gifs, gifSearch, getGifs} = this.props;
    return (
      <View
        style={{
          paddingHorizontal: 5,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
        <View
          style={{...styles.SearchView, backgroundColor: COLORS.LESS_LIGHT}}>
          <Icon name="search" size={14} color={COLORS.GRAY} />
          <TextInput
            placeholder={'Search Gifs'}
            style={{...styles.SearchTextInput, color: COLORS.DARK}}
            value={gifs.search}
            onChangeText={(text) => gifSearch(text)}
            onSubmitEditing={() => getGifs(gifs.search)}
            placeholderTextColor={COLORS.GRAY}
          />
          {gifs.search ? (
            <Icon
              name="x"
              size={14}
              color={COLORS.GRAY}
              onPress={() => gifSearch('')}
            />
          ) : null}
        </View>
      </View>
    );
  }

  renderGif(item) {
    const width = (this.state.giphyViewWidth - 40) / 3;
    const height = (width * item.height) / item.width;
    const {onSelect} = this.props;
    const aspectRatio = item.width / item.height;
    item = {...item, aspectRatio, isGif: true};
    return (
      <Ripple
        containerStyle={{
          height,
          width,
          margin: 5,
          backgroundColor: COLORS_LIGHT_THEME.LIGHT,
          borderRadius: 7,
          elevation: 7,
        }}
        onPress={() => onSelect(item)}>
        <Image source={{uri: item.url}} style={{flex: 1}} />
      </Ripple>
    );
  }

  renderGifs() {
    const {gifs, isKeyboardVisible} = this.props;

    if (!gifs.data || !this.state.giphyViewWidth || isKeyboardVisible) {
      return;
    }

    return (
      <FlatList
        data={gifs.data}
        numColumns={3}
        ListFooterComponent={<View style={{height: 20, width: 1}} />}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{paddingHorizontal: 5}}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({item}) => this.renderGif(item)}
      />
    );
  }

  render() {
    const {COLORS, gifs_loading, isKeyboardVisible} = this.props;
    return (
      <View
        style={{
          width: '100%',
          height: isKeyboardVisible ? null : GIPHY_VIEW_HEGHT,
          backgroundColor:
            COLORS.THEME === 'light' ? COLORS.LIGHT : COLORS.LESSER_LIGHT,
        }}
        onLayout={({nativeEvent}) =>
          this.setState({giphyViewWidth: nativeEvent.layout.width})
        }>
        {gifs_loading ? (
          <View
            style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
            <Loading white={COLORS.THEME !== 'light'} size={72} />
          </View>
        ) : (
          <>
            {this.renderGifSearch()}
            {this.renderGifs()}
          </>
        )}
      </View>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    gifs: state.chat.gifs,
    gifs_loading: state.chat.gifs_loading,
    COLORS: state.chat.COLORS,
  };
};

export default connect(mapStateToProps, {getGifs, gifSearch})(GiphyView);

const styles = StyleSheet.create({
  SearchView: {
    flex: 1,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    margin: 7,
    paddingHorizontal: 5,
    marginLeft: 0,
  },
  SearchTextInput: {
    paddingVertical: 0,
    paddingHorizontal: 5,
    flex: 1,
    fontFamily: FONTS.PRODUCT_SANS,
  },
  PBGText: {
    fontFamily: FONTS.LATO,
    fontSize: 12,
  },
});
