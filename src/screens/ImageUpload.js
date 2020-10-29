import React from 'react';
import {View, Text, StyleSheet, ImageBackground} from 'react-native';
import {connect} from 'react-redux';
import _ from 'lodash';
import Icon from 'react-native-vector-icons/Feather';
import LinearGradient from 'react-native-linear-gradient';
import ImagePicker from 'react-native-image-picker';
import ImageResizer from 'react-native-image-resizer';
import ImageEditor from '@react-native-community/image-editor';
import SView from 'react-native-simple-shadow-view';
import vision from '@react-native-firebase/ml-vision';

import {
  TimedAlert,
  CustomAlert,
  ArticleTile,
  Ripple,
  ArticleInfo,
} from '../components';
import {setImage} from '../actions/WriteAction';
import {
  FONTS,
  ERROR_BUTTONS,
  COLORS_LIGHT_THEME,
  SCREENS,
  CATEGORY_IMAGES,
} from '../Constants';

class ImageUpload extends React.PureComponent {
  state = {
    image: {},
    imageSize: {},
    alertVisible: false,
    relatedImageWords: '',
    articleData: {},
    infoVisible: false,
  };

  renderArticleInfo() {
    const {articleData, infoVisible} = this.state;

    return (
      <ArticleInfo
        navigation={this.props.navigation}
        onBackdropPress={() => {
          this.setState({infoVisible: false});
        }}
        isVisible={infoVisible}
        article_id={articleData.article_id}
        // for preview
        preview_contents={articleData.preview_contents}
        topic={articleData.topic}
        category={articleData.category}
      />
    );
  }

  imageUrlCorrector(image_url) {
    if (!image_url) {
      return null;
    }
    if (!this.props.image_adder) {
      return '';
    }
    if (
      image_url.substring(0, 4) !== 'http' &&
      image_url.substring(0, 4) !== 'file'
    ) {
      image_url = this.props.image_adder + image_url;
    }
    return image_url;
  }

  componentDidMount() {
    if (this.props.image) {
      this.setState({
        image: {uri: this.imageUrlCorrector(this.props.image.uri)},
      });
    }
  }

  renderChangeImageButton() {
    if (this.state.image.uri) {
      return (
        <LinearGradient
          style={{
            bottom: 15,
            left: 15,
            position: 'absolute',
            elevation: 7,
            height: 58,
            borderRadius: 10,
            width: 120,
          }}
          colors={['#fc521a', '#f79c33']}
          start={{x: 0, y: 1}}
          end={{x: 1, y: 1}}>
          <Ripple
            containerStyle={{
              borderRadius: 10,
              flex: 1,
            }}
            style={{
              flex: 1,
              justifyContent: 'center',
              alignItems: 'center',
            }}
            onPress={() => {
              this.pickImage();
            }}>
            <Text
              style={{
                fontFamily: FONTS.GOTHAM_BLACK,
                fontSize: 22,
                color: COLORS_LIGHT_THEME.LESSER_LIGHT,
              }}>
              Change
            </Text>
            <Text
              style={{
                fontFamily: FONTS.GOTHAM_BLACK,
                fontSize: 14,
                color: COLORS_LIGHT_THEME.LESSER_LIGHT,
              }}>
              Image
            </Text>
          </Ripple>
        </LinearGradient>
      );
    } else {
      return null;
    }
  }

  renderNextButton() {
    const {COLORS} = this.props;
    return (
      <Ripple
        containerStyle={{
          borderRadius: 10,
          height: 60,
          width: 100,
          backgroundColor: COLORS.LIGHT,
          elevation: 7,
          bottom: 15,
          right: 15,
          position: 'absolute',
          borderColor: COLORS.GREEN,
        }}
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
        }}
        onPress={() => {
          this.props.image.uri
            ? this.props.navigation.replace(SCREENS.Publish)
            : this.setState({alertVisible: true});
        }}>
        <Text
          style={{
            fontFamily: FONTS.GOTHAM_BLACK,
            fontSize: 24,
            color: COLORS.GREEN,
          }}>
          NEXT
        </Text>
        <Text
          style={{
            fontFamily: FONTS.PRODUCT_SANS_BOLD,
            fontSize: 12,
            color: COLORS.GREEN,
          }}>
          preview
        </Text>
      </Ripple>
    );
  }

  getImageResize(imageSize) {
    const MAX_WIDTH = 800;
    const MAX_HEIGHT = 600;

    let resize = {...imageSize};
    let ratio = imageSize.width / imageSize.height;
    if (resize.width > MAX_WIDTH) {
      resize = {width: MAX_WIDTH, height: Math.floor(MAX_WIDTH / ratio)};
    }
    if (resize.height > MAX_HEIGHT) {
      resize = {width: Math.floor(MAX_HEIGHT * ratio), height: MAX_HEIGHT};
    }
    return resize;
  }

  getCropCoordinates({width, height}) {
    let originX, originY, crop;
    if (width / height < 4 / 3) {
      let requiredHeight = Math.floor(width * (3 / 4));
      let remainingHeight = height - requiredHeight;
      originX = 0;
      originY = Math.floor(remainingHeight / 2);
      crop = {
        offset: {x: originX, y: originY},
        size: {width, height: requiredHeight},
      };
    } else {
      let requiredWidth = Math.floor(height * (4 / 3));
      let remainingWidth = width - requiredWidth;
      originY = 0;
      originX = Math.floor(remainingWidth / 2);
      crop = {
        offset: {x: originX, y: originY},
        size: {width: requiredWidth, height},
      };
    }
    return crop;
  }

  async ImageLabelDetection(image_path) {
    let response = await vision().imageLabelerProcessImage(image_path);
    let filterList = [];
    let relatedImageWords = '';
    response.map((item) => {
      if (item.confidence > 0.5) {
        filterList.push(item);
      }
    });

    if (filterList.length > 5) {
      filterList = _.sortBy(filterList, ['confidence']).reverse();
      filterList = filterList.splice(0, 5);
    }
    if (filterList.length !== 0) {
      filterList.map((item, index) => {
        if (index === filterList.length - 1) {
          relatedImageWords += item.text;
        } else {
          relatedImageWords += item.text + ', ';
        }
      });
    } else {
      relatedImageWords = "Sorry, I couldn't find anything useful here";
    }
    this.setState({relatedImageWords});
  }

  onPickImage = async (image) => {
    if (image.error) {
      this.timedAlert.showAlert(3000, 'Image permission needed');
      return;
    }
    this.ImageLabelDetection(image.path);
    if (!image.didCancel) {
      delete image.data;
      const imageSize = {width: image.width, height: image.height};
      const resize = this.getImageResize(imageSize);
      const crop = this.getCropCoordinates(resize);

      const resized_image = await ImageResizer.createResizedImage(
        image.uri,
        resize.width,
        resize.height,
        'JPEG',
        80,
      );
      const crop_image = await ImageEditor.cropImage(resized_image.uri, crop);
      image = {uri: crop_image};
      this.setState({
        image,
        imageSize: {width: resize.width, height: resize.height},
      });
      this.props.setImage(image);
    }
  };

  pickImage() {
    const ImageOptions = {
      noData: true,
      mediaType: 'photo',
      chooseWhichLibraryTitle: 'Select an App',
    };

    ImagePicker.launchImageLibrary(ImageOptions, this.onPickImage);
  }

  renderImagePicker() {
    const {COLORS, category} = this.props;
    const image = CATEGORY_IMAGES[category];

    return (
      <Ripple
        containerStyle={{
          alignSelf: 'center',
          backgroundColor: COLORS.LESSER_LIGHT,

          borderRadius: 10,
          height: 180,
          width: (180 * 4) / 3,
          elevation: 10,
        }}
        style={{flex: 1, padding: 5}}
        onPress={() => {
          this.pickImage();
        }}>
        <ImageBackground
          blurRadius={2}
          style={{
            flex: 1,
            borderRadius: 6,
            overflow: 'hidden',
            elevation: 7,
          }}
          source={image}>
          <View
            style={{
              backgroundColor: COLORS_LIGHT_THEME.DARK_GRAY + '60',
              flex: 1,
              justifyContent: 'center',
              alignItems: 'center',
            }}>
            <Text
              style={{
                color: COLORS_LIGHT_THEME.LIGHT,
                fontFamily: FONTS.RALEWAY,
                fontSize: 16,
              }}>
              Select an Image
            </Text>
          </View>
        </ImageBackground>
      </Ripple>
    );
  }

  renderChoosenImage() {
    const {image} = this.state;
    const {COLORS} = this.props;
    if (image.uri) {
      data = {
        image: image.uri,
        article_id: -1,
        topic: this.props.topic,
        preview_contents: this.props.contents,
        category: this.props.category,
      };
      const articleData = {...data, category: this.props.category};
      return (
        <View style={{alignItems: 'center', justifyContent: 'center'}}>
          <ArticleTile
            size={180}
            data={articleData}
            COLORS={COLORS}
            onPress={() => this.setState({articleData, infoVisible: true})}
          />
          {this.state.relatedImageWords ? (
            <View
              style={{
                alignItems: 'flex-start',
                flexDirection: 'row',
                marginTop: 20,
                width: '60%',
              }}>
              <Icon
                name="message-square"
                size={15}
                color={COLORS.GRAY}
                containerStyle={{marginTop: 2}}
              />
              <Text
                style={{
                  fontFamily: FONTS.PRODUCT_SANS,
                  color: COLORS.GRAY,
                  fontSize: 12,
                  marginLeft: 10,
                  textAlign: 'justify',
                }}>
                {`This is what I see in this image : `}
                <Text style={{fontFamily: FONTS.PRODUCT_SANS_BOLD}}>
                  {this.state.relatedImageWords}
                </Text>
              </Text>
            </View>
          ) : null}
        </View>
      );
    } else {
      return this.renderImagePicker();
    }
  }

  renderBack() {
    const {COLORS} = this.props;
    return (
      <View
        style={{
          margin: 8,
          height: 70,
          justifyContent: 'space-between',
          alignItems: 'center',
          flexDirection: 'row',
          marginRight: 15,
        }}>
        <SView
          style={{
            shadowColor: '#202020',
            shadowOpacity: 0.2,
            shadowOffset: {width: 0, height: 7.5},
            shadowRadius: 7,
            backgroundColor:
              this.props.theme === 'light' ? COLORS.LIGHT : COLORS.LESS_LIGHT,
            borderRadius: 30,
          }}>
          <Ripple
            containerStyle={{borderRadius: 30}}
            style={{
              padding: 10,
              justifyContent: 'center',
              alignItems: 'center',
              flexDirection: 'row',
            }}
            onPress={() =>
              this.props.navigation.navigate(SCREENS.WriteArticle)
            }>
            <Icon name="arrow-left" size={26} color={COLORS.LESS_DARK} />
            <Text
              style={{
                color: COLORS.LESS_DARK,
                fontFamily: FONTS.RALEWAY,
                marginHorizontal: 3,
                fontSize: 16,
                textAlignVertical: 'center',
              }}>
              edit
              <Text style={{fontSize: 14}}>{' article'}</Text>
            </Text>
          </Ripple>
        </SView>

        <Text style={{...styles.TextStyle, color: COLORS.DARK}}>
          upload image
        </Text>
      </View>
    );
  }

  renderAlert() {
    const {COLORS} = this.props;
    return (
      <View>
        <CustomAlert
          COLORS={COLORS}
          isVisible={this.state.alertVisible}
          onFirstButtonPress={() => {
            this.setState({alertVisible: false});
          }}
          onThirdButtonPress={() => {
            this.setState({alertVisible: false});
            this.props.navigation.replace(SCREENS.Publish);
          }}
          onBackdropPress={() => {
            this.setState({alertVisible: false});
          }}
          message={{
            title: 'Warning ⚠️',
            content:
              'Adding an image is good for search results as well as increases user satisfaction from the article. It also looks cool',
            type: [
              {label: '  Skip  ', color: COLORS.RED},
              {label: ERROR_BUTTONS.TICK},
            ],
          }}
        />
      </View>
    );
  }

  render() {
    const {COLORS} = this.props;
    return (
      <View style={{flex: 1, backgroundColor: COLORS.LIGHT}}>
        {this.renderBack()}
        <TimedAlert
          theme={this.props.theme}
          onRef={(ref) => (this.timedAlert = ref)}
          COLORS={COLORS}
        />
        <View
          style={{
            alignSelf: 'center',
            justifyContent: 'center',
            flex: 1,
            margin: 20,
          }}>
          {this.renderAlert()}
          <View
            style={{
              justifyContent: 'center',
              alignItems: 'center',
              width: '100%',
              marginBottom: 50,
            }}>
            {this.renderChoosenImage()}
          </View>
        </View>
        {this.renderNextButton()}
        {this.renderChangeImageButton()}
        {this.renderArticleInfo()}
      </View>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    image_adder: state.home.image_adder,

    contents: state.write.contents,
    topic: state.write.topic,
    category: state.write.category,
    image: state.write.image,
    editing_article_id: state.write.editing_article_id,

    theme: state.chat.theme,
    COLORS: state.chat.COLORS,
  };
};

export default connect(mapStateToProps, {setImage})(ImageUpload);

const styles = StyleSheet.create({
  TextStyle: {
    fontSize: 24,
    fontFamily: FONTS.GOTHAM_BLACK,
  },
});
