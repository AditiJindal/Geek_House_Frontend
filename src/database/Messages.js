// Messages ->
//{ "user_id": [ {_id:Number, text:String, createdAt: Date, user: {_id:String}}, 
//                image:{url:"", height:1, width:1, aspectRatio:1 } ]}

// all messages will be stored in on place
// other_user_id will be primary key
// props -> other_user_id (user_id), message_id (_id), text, createdAt, user_id (user:{_id:String})
//          image_url, image_height, image_width, image_ar

export default class Messages {
  name="Messages"
  props={
    other_user_id: "string",
    message_id: "string",
    createdAt: "datetime",
    user_id: "string",

    text: "?string",
    image_url: "?string",
    image_height: "?int",
    image_width: "?int",
    image_ar: "?int"
  }
}