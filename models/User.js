const mongoose = require('mongoose');
const { isEmail } = require('validator');
const bcrypt = require('bcrypt');
// User
const userSchema = new mongoose.Schema({
    FirstName: {
        type: String,
        required: [true, 'Please enter your first name']
    },
    LastName: {
        type: String,
        required: [true, 'Please enter your last name']
    },
    email: {
        type: String,
        required: [true, 'Please enter your email id'],
        unique: true,
        lowercase: true,
        validate: [isEmail, 'Please enter a valid email']
    },
    password: {
        type: String,
        required: [true, 'Please enter a password'],
        minlength: [6, 'Minimum password length is a 6 characters']
    },
    PhnNo: {
        type: Number,
        required: [true, 'Please enter your contact number']
    },
    file:{
        type: String,
        required: [true, 'Please choose a profile picture']
    }
});
// fire a function before doc saved to db
userSchema.pre('save', async function (next){
    const salt = await bcrypt.genSalt();
    this.password = await bcrypt.hash(this.password, salt);
    next();
});
//static method to sign in user
userSchema.statics.signin = async function(email, password){
   const user = await this.findOne({ email });
   if (user) {
      const auth = await bcrypt.compare(password, user.password);
      if(auth){
          return user;
      }
      throw Error('incorrect password');
   } 
   throw Error('incorrect email')
}
// Task
const taskSchema = new mongoose.Schema({
    email:{
        type: String
    },
    Description:{
        type: String,
        required: true
    },
    Completed:{
        type: Boolean,
        required: true
    },
    Deadline:{
        type: Date,
        required: true
    }
},{ timestamps: true });
//Learning status 
const statusSchema = new mongoose.Schema({
    email:{
        type: String
    },
    lsn1Status:{
        type: String
    },
    lsn2Status:{
        type: String
    },
    lsn3Status:{
        type: String 
    }
});
const User = mongoose.model('user',userSchema);
const Task = mongoose.model('task',taskSchema);
const Lesson = mongoose.model('lesson',statusSchema);
module.exports = { User, Task, Lesson };