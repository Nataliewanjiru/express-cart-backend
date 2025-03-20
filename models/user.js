const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  firstname:{type:String ,required:true},
  lastname:{type:String ,required:true},
  email:{type:String ,required:true, unique:true},
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  userpicture:{type:String,  default:"https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar…"},
  groups: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Group' }]
},
{ timestamps: true } 
);

module.exports = mongoose.model('User', UserSchema);