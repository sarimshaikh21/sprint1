const mongoose= require('mongoose')

const EmployeeSchema = new mongoose.Schema(
  {
    username: {
      type: String
    },
    password: {
      type: String
    },
    name:{
      type: String
    }
  },{ collection: 'logininfo' });

const EmployeeModel= mongoose.model("logininfo",EmployeeSchema)
module.exports= EmployeeModel
