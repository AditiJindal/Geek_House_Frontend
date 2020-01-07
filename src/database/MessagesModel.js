// Messages ->
//{ "user_id": [ {_id:Number, text:String, createdAt: Date, user: {_id:String}}, 
//                image:{url:"", height:1, width:1, aspectRatio:1 } ]}

// all messages will be stored in on place
// other_user_id will be primary key
// props -> other_user_id (user_id), message_id (_id), text, createdAt, user_id (user:{_id:String})
//          image_url, image_height, image_width, image_ar

import { Model } from '@nozbe/watermelondb';
import { field, action } from '@nozbe/watermelondb/decorators';
import uuid from 'uuid';

const incomingMessageConverter = (item) => {
  new_message = [
    {_id:uuid(), createdAt: item.createdAt, text:item.text,image:item.image, user:{_id:item.from}}
  ]
  return new_message
}

export default class Messages extends Model {
  static table = 'messages'

  @field('other_user_id') other_user_id
  @field('message_id') message_id
  @field('created_at') created_at
  @field('user_id') user_id
  @field('text') text
  @field('image_url') image_url
  @field('image_height') image_height
  @field('image_width') image_width
  @field('image_ar') image_ar

  @action insertUnreadMessages = (unread_messages) => {
    let batch_array = []
    batch_array = unread_messages.map(item=>{
      return this.prepareCreate(message => {
        message.other_user_id = item.from;
        message.message_id = uuid();
        message.createdAt = Date.parse(item.createdAt);
        message.user_id = item.from;

        message.text = (item.text)?item.text:null;
        message.image_url = (item.image)?item.image.url:null;
        message.image_height = (item.image)?item.image.height:null;
        message.image_width = (item.image)?item.image.width:null;
        message.image_image_ar = (item.image)?item.image.aspectRatio:null;
      })
    });

    this.batch(...batch_array).then((obj)=>{console.log("Saved Unread Messages:", obj)})
  }
}
