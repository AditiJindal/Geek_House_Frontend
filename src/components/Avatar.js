import React from 'react';
import {TouchableOpacity, Dimensions, View} from 'react-native';
import Image from 'react-native-fast-image';
import ImageViewer from './ImageViewer';
import Loading from '../components/Loading'

const screenWidth = Dimensions.get('screen').width

class Avatar extends React.Component {
  state={isVisible:false}

  render(){
    const {size, COLORS, uri, onPress, loading} = this.props;
    if (loading){
      return (
        <View style={{height:size, width:size, justifyContent:'center', alignItems:'center'}}>
          <Loading white={COLORS.THEME!=='light'} size={size/2}/>
        </View>
      )
    }
    return (
      <>
      <ImageViewer
        isVisible={this.state.isVisible}
        onClose = {()=>this.setState({isVisible:false})}
        COLORS={COLORS}
        imageWidth={screenWidth*0.92}
        imageHeight={screenWidth*0.92}
        source={{uri}}
      />
      <TouchableOpacity style={{backgroundColor:COLORS.LIGHT, borderRadius:size/2, elevation:5}}
        activeOpacity={1} onPress= {()=>{
          if (onPress){
            onPress()
          }
          else{
            this.setState({isVisible:true})
          }
        }}>
        <Image source={{uri}} style={{borderRadius:size/2, height:size, width:size}}/>
      </TouchableOpacity>
      </>
    )
  }
}

export default Avatar