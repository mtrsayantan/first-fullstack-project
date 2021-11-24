const { User, Task, Lesson } = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
//handle errors
const handleErrors = (err) => {
    console.log(err.message, err.code);  
    let errors = { FirstName: '', LastName: '', email: '', password: '', PhnNo: '', file: ''};
    
    
    //incorrect email
    if (err.message === 'incorrect email') {
        errors.email = 'This email not exist';
    }
    //incorrect password
    if (err.message === 'incorrect password') {
        errors.password = 'This password is incorrect';
    }
    //duplicate error code
    if(err.code === 11000) {
        errors.email = 'This email already exist';
        return errors; 
    }
    //image error
    if(err === 'wrong mimetype'){
        errors.file = 'Only accept jpg, jpeg & png file';
        return errors;
    }
    //validation errors
    if (err.message.includes('user validation failed')){
        Object.values(err.errors).forEach(({properties}) => {
            errors[properties.path] = properties.message;
        });
    }
    return errors;
    
}

//Create Token
const maxAge = 5 * 60 * 60;
const createToken = (id) => {
    return jwt.sign({ id }, 'mtr secret', {
        expiresIn: maxAge
    });
}

module.exports.signup_get = (req,res) => {
    res.render('signup');
}

module.exports.signin_get = (req,res) => {
    res.render('signin');
}

module.exports.signup_post = (req,res,next) => {
   if (!(req.errMimetype)) {
        console.log(req.file);
        if(!req.file){
            var user = new User({
                FirstName: req.body.FirstName,
                LastName: req.body.LastName,
                email: req.body.email,
                password: req.body.password,
                PhnNo: req.body.PhnNo,
            })    
        }else{
            var user = new User({
                FirstName: req.body.FirstName,
                LastName: req.body.LastName,
                email: req.body.email,
                password: req.body.password,
                PhnNo: req.body.PhnNo,
                file: req.file.filename,
            });
        }
        
            user.save()
                .then((result) => {
                    const token = createToken(user._id);
                    res.cookie('jwt', token, { httpOnly: true, maxAge: maxAge * 1000});
                    res.status(201).json({ user: user._id });
                })
                .catch((err) => {
                    const errors = handleErrors(err);
                    res.status(400).json({ errors });
                })
            
    }else{
        const errors = handleErrors(req.errMimetype);
        res.status(400).json({ errors });
    }
}

module.exports.signin_post = async (req,res) => {
    const { email, password } = req.body;
    try {
        const user = await User.signin(email,password);
        const token = createToken(user._id);
        res.cookie('jwt', token, { httpOnly: true, maxAge: maxAge * 1000});
        res.status(200).json({ user: user._id })
    } catch (err) {
        const errors = handleErrors(err);
        res.status(400).json({ errors });
    }
}
module.exports.signout = (req,res) => {
    res.cookie('jwt', '', { maxAge:1 });
    res.redirect('/');
}
module.exports.profile = (req,res) => {
    token = req.cookies.jwt;
    jwt.verify(token, 'mtr secret', (err,decodedToken) => {
        if(err){
            console.log(err.message);
        }else{
            User.findById(decodedToken.id)
                .then((result) => {
                    res.render('userProfile',{user: result});
                })
                .catch((err) => {
                    console.log(err);
                })
        }
    })
}
module.exports.editUser_get = (req, res) => {
    token = req.cookies.jwt;
    jwt.verify(token, 'mtr secret', (err,decodedToken) => {
        if(err){
            console.log(err.message);
        }else{
            User.findById(decodedToken.id)
                .then((result) => {
                    res.render('editUser',{user: result});
                })
                .catch((err) => {
                    console.log(err);
                })
        }
    })
}
module.exports.editUser_post = (req, res) => {
    token = req.cookies.jwt;
    jwt.verify(token, 'mtr secret', async (err,decodedToken) => {
        if(err){
            console.log(err.message);
        }else{
            console.log(req.file);
            const id = decodedToken.id;
            if(req.file){
                if(req.body.password){
                    const salt = await bcrypt.genSalt();
                    req.body.password = await bcrypt.hash(req.body.password,salt)
                    var updatedData = {
                        FirstName: req.body.FirstName,
                        LastName: req.body.LastName,
                        email: req.body.email,
                        password: req.body.password,
                        PhnNo: req.body.PhnNo,
                        file: req.file.filename,
                    }
                }else{
                    var updatedData = {
                        FirstName: req.body.FirstName,
                        LastName: req.body.LastName,
                        email: req.body.email,
                        PhnNo: req.body.PhnNo,
                        file: req.file.filename,
                    }
                }    
            }else{
                if(req.body.password){
                    const salt = await bcrypt.genSalt();
                    req.body.password = await bcrypt.hash(req.body.password,salt)
                    var updatedData = {
                        FirstName: req.body.FirstName,
                        LastName: req.body.LastName,
                        email: req.body.email,
                        password: req.body.password,
                        PhnNo: req.body.PhnNo,
                    }
                }else{
                    var updatedData = {
                        FirstName: req.body.FirstName,
                        LastName: req.body.LastName,
                        email: req.body.email,
                        PhnNo: req.body.PhnNo,
                    }
                }            
            }
            User.findByIdAndUpdate(id, updatedData, { useFindAndModify: false})
                .then((result) => {
                    if(!result){
                        res.status(404).send({message : `Cannot Update user with ${id}. Maybe user not found!`})
                    }else{ 
                        res.status(201).json('profile successfully updated');
                    }
                })
                .catch(err => {
                    console.log(err);
                })
        }
    })        
}
module.exports.course_get = (req,res) => {
    Lesson.find({ email: req.query.email })
        .then((result) => {
            res.render('course',{course: result})
        })
        .catch((err) => {
            console.log(err);
        })
}
module.exports.lsn_status = (req,res) => {
    const lsn = new Lesson(req.body);
    lsn.save()
        .then((result) => {
            res.status(201).json('complete');
        })
        .catch((err) => {
            console.log(err);
        })
}
module.exports.task_get = (req,res) => {
    Task.find({ email: req.query.email})
    .then((result) => {
        res.render('task',{tasks: result})
    })
    .catch((err) => {
        console.log(err);
    })
}
module.exports.task_post = (req, res) => {
    const task = new Task(req.body);
    task.save()
        .then((result) => {
            res.redirect(`/task?email=${req.query.email}`);
        })
        .catch((err) => {
            console.log(err);
        })
}
module.exports.taskEdit_pg = (req,res) => {
    const id = req.params.id;
    Task.findById(id)
        .then((result) => {
            res.render('editTask',{task: result});
        })
        .catch((err) => {
            console.log(err);
        })
}
module.exports.task_edit = (req,res) => {
    const id = req.params.id;
    const email = req.body.email;
    if(req.body.Deadline){
        var updateTask = {
            Description: req.body.Description,
            Completed: req.body.Completed,
            Deadline: req.body.Deadline,
        }
    }else{
        var updateTask = {
            Description: req.body.Description,
            Completed: req.body.Completed,
        }
    }
    Task.findByIdAndUpdate(id, updateTask, { useFindAndModify: false})
        .then((result) => {
            if(!result){
                res.status(404).send({message : `Cannot Update user with ${id}. Maybe user not found!`})
            }else{ 
                res.json({redirect:`/task?email=${email}`}); 
            }
        })
        .catch(err => {
            console.log(err);
        })
}
module.exports.task_delete = (req,res) => {
    const id = req.params.id;
    Task.findByIdAndDelete(id)
        .then(result => {
           res.send("Task deleted!") 
        })
        .catch(err => {
            console.log(err);
        })
}