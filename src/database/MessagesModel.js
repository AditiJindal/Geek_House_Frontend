// Messages ->
//{ "user_id": [ {_id:Number, text:String, created_at: Date, user: {_id:String}}, 
//                image:{url:"", height:1, width:1, aspectRatio:1 } ]}

// all messages will be stored in on place
// other_user_id will be primary key
// props -> other_user_id (user_id), message_id (_id), text, created_at, user_id (user:{_id:String})
//          image_url, image_height, image_width, image_ar

import { Model } from '@nozbe/watermelondb';
import { field } from '@nozbe/watermelondb/decorators';
// import uuid from 'uuid';


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
  @field('image_name') image_name
}