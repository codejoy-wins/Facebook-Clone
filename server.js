const express = require("express");
const app = express();
var session = require("express-session");
var path = require("path");
var bodyParser = require("body-parser");
var mongoose = require("mongoose");
var flash = require("express-flash");

mongoose.connect("mongodb://localhost/facebook");

var CommentSchema = new mongoose.Schema({
    name: {type: String, required: [true, "need name"], minlength: [1, 'no empty']},
    comment: {type: String, required: [true, "need comment"], minlength: [1, 'no empty']},
}, {timestamps: true});
mongoose.model('Comment', CommentSchema);
var Comment = mongoose.model('Comment');

var MessageSchema = new mongoose.Schema({
    name: {type: String, required: [true, "need name"], minlength: [1, 'no empty']},
    message: {type: String, required: [true, "need message"], minlength: [1, 'no empty']},
    comments: [CommentSchema]
}, {timestamps: true});
mongoose.model('Message', MessageSchema);
var Message = mongoose.model('Message');

app.use(session({
    secret: 'whatever',
    resave: false,
    saveUninitialized: true,
    cookie: {maxAge: 60000}
}))
app.use(flash());
app.use(bodyParser.urlencoded({ extended: true}));
app.use(express.static(path.join(__dirname, './views')));

app.set('views', path.join(__dirname, './views'));
app.set('view engine', 'ejs');
// render homepage but display comments AND messages
app.get('/', (req,res)=>{
    Message.find({}, (err, messages)=>{
        if(err) {
            console.log('find messages error');
        } else {
            res.render('index', {codejoy: messages});
        }
    })
})

app.post("/process", (req,res)=>{
    console.log('processing', req.body);
    var message = new Message({name: req.body.name, message: req.body.message});
    message.save((err)=>{
        if(err){
            console.log('error_x', err);
            for (var x in err.errors){
                req.flash('famous', err.errors[x].message);
            }
        res.redirect('/');
        } else {
            console.log('successfully added message to db');
            res.redirect('/');
        }
    });
});
// platform code I don't know what to do with:


app.post("/comment/:id", (req,res)=>{
    console.log('processing', req.body);
    console.log('req.params.id', req.params.id);
    // need to create comment by pushing to messages' comments array

    Comment.create(req.body, function(err, data){
        if(err){
            console.log('killjoy');
            res.redirect('/');
        }
        else{
            Message.findOneAndUpdate({_id: req.params.id}, {$push: {comments: data}}, function(err, data){
                if(err){
                    console.log('killjoy2');
                }
                else{
                    console.log('it worked!');
                    res.redirect('/');
                }
            })
        }
    })
});
    

app.listen(8000, ()=>{
    console.log('listening on port 8000');
})