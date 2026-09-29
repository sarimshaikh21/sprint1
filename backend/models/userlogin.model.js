const mongoose= require('mongoose')

const UserSchema = new mongoose.Schema(
  {
    empid: {
      type: String
    },
    pass: {
      type: String
    },
    phone: {
      type: String
    },
    email: {
      type: String
    },
    fullname: {
      type: String
    },
    location: {
      type: String
    }

  },{ collection: 'userlogin' });

const UserModel= mongoose.model("userlogin",UserSchema)
module.exports= UserModel
