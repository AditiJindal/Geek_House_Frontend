import { appSchema, tableSchema } from '@nozbe/watermelondb'

export default appSchema({
  version: 23,
  tables: [
    tableSchema({
      name:'messages',
      columns:[
        {name: "other_user_id", type:"string", isOptional:false, isIndexed:true},
        {name: "this_user_id", type:"string", isOptional:false},
        {name: "message_id", type: "string", isOptional:false},
        {name: "created_at",type: "number",isOptional:false},
        {name: "user_id", type:"string", isOptional:false},
        {name: "text",type: "string",isOptional:true},
        {name: "image_url", type:"string",isOptional:true},
        {name: "image_height", type:"number", isOptional:true},
        {name: "image_width", type: "number", isOptional:true},
        {name: "image_ar", type:"number", isOptional:true},
        {name: "image_name", type:"string", isOptional:true}
      ]
    })
  ]
})