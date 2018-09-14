var express = require('express');
var fs = require("fs");
var bodyParser = require('body-parser');
var multer = require('multer');
var upload = multer();
var router = express.Router();

var morgan      = require('morgan');
var mongoose    = require('mongoose');
var app = express();

var jwt    = require('jsonwebtoken');
var bcrypt = require('bcryptjs');
var config = require('./config'); // get our config file
var User   = require('./models/user');
var Products   = require('./models/user');


// for parsing application/json
router.use(bodyParser.json()); 

// for parsing application/xwww-
router.use(bodyParser.urlencoded({ extended: true })); 

var upload = multer({ dest: '/tmp/'});

// var mongoose = require('mongoose');
// mongoose.connect('mongodb://localhost/test_project',{ useNewUrlParser: true });



mongoose.connect(config.database,{ useNewUrlParser: true }); // connect to database
app.set('superSecret', config.secret); // secret variable

app.use(morgan('dev'));

var VerifyToken = require('./auth/VerifyToken');

// var UserSchema = mongoose.Schema({
//     userName: String,
//     password: Number,
//     token: String
//  });
 
//  var User = mongoose.model("User", UserSchema);


//  var ProductSchema = mongoose.Schema({
//     productName: String,
//     description: Number,
//     availability: Boolean
//  });
 
//  var Products = mongoose.model("Products", ProductSchema);

router.get('/', function(req, res) {
    res.json({ message: 'R35t AP! test!n9 ' });
});

router.get('/products', function(req, res){
console.log("test");
    
    Products.find(function(err, response){
       res.json(response);
    });
 });

 router.post('/signup', function(req, res){
    var personInfo = req.body; //Get the parsed information
    console.log('hi');
    if(!personInfo.name || !personInfo.password || !personInfo.admin){
    //    res.render('show_message', {
    //       message: "Sorry, you provided worng info", type: "error"});

    console.log('Error');
    res.json({ "error": true,message:"Sorry, you provided worng info"});

    } else {
        var hashedPassword = bcrypt.hashSync(personInfo.password, 8);
       var newPerson = new User({
          name: personInfo.name,
          //password: personInfo.password,
          password:hashedPassword,
          admin:personInfo.admin
       });
         
       newPerson.save(function(err,user){
        // if (err) throw err;

        // console.log('User saved successfully');
        // res.json({ success: true });

          if(err){
            // res.render('show_message', {message: "Database error", type: "error"});

             console.log('Database error');
        res.json({ "error": true });

        } else{
            //  res.render('show_message', {
            //     message: "New person added", type: "success", person: personInfo});
            //  }

            //  console.log('User saved successfully');
            //  res.json({ "error": false,message:"New person added "});

                 // create a token
    var token = jwt.sign({ id: user._id }, config.secret, {
       // expiresIn: 86400 // expires in 24 hours
      });
  
      res.status(200).send({ auth: true, token: token });
        }
       });

    // var newPerson = new User({
    //     name: 'Nick Cerminara', 
    //     password: 'password',
    //     admin: true 
    //  });
       
    //  newPerson.save(function(err){
    //     if(err)
    //        res.render('show_message', {message: "Database error", type: "error"});
    //     else
    //        res.render('show_message', {
    //           message: "New person added", type: "success", person: personInfo});
    //  });

    // newPerson.save(function(err) {
    //     if (err) throw err;
    
    //     console.log('User saved successfully');
    //     res.json({ success: true });
    //   });

    }

    // res.send('done '+req.body.name);
 });


//login for the user 
//  router.get('/authenticate', function(req, res){
//     var token = req.body.token || req.query.token || req.headers['x-access-token'];
//     var token = req.headers['x-access-token'];
//     if (!token) return res.status(401).send({ auth: false, message: 'No token provided.' });
    
//     jwt.verify(token, config.secret, function(err, decoded) {
//       if (err) return res.status(500).send({ auth: false, message: 'Failed to authenticate token.' });
      
//       //res.status(200).send(decoded);
//       User.findById(decoded.id,  { password: 0 },function (err, user) {
//         if (err) return res.status(500).send("There was a problem finding the user.");
//         if (!user) return res.status(404).send("No user found.");
        
//         res.status(200).send(user);
//     });
//  });
// });

//authenticate the token 
router.get('/authenticate2', VerifyToken, function(req, res, next) {

    User.findById(req.userId, { password: 0 }, function (err, user) {
      if (err) return res.status(500).send("There was a problem finding the user.");
      if (!user) return res.status(404).send("No user found.");
      
      res.status(200).send(user);
    });
  
  });

router.post('/login', function(req, res) {

    User.findOne({ name: req.body.name }, function (err, user) {
      if (err) return res.status(500).send('Error on the server.');
      if (!user) return res.status(404).send('No user found.');
  
      var passwordIsValid = bcrypt.compareSync(req.body.password, user.password);
      if (!passwordIsValid) return res.status(401).send({ auth: false, token: null });
  
      var token = jwt.sign({ id: user._id }, config.secret, {
        expiresIn: '365d' // expires in 24 hours
      });
  
      res.status(200).send({ auth: true, token: token });
    });
  
  });
 
//to get list of users
 router.get('/users', function(req, res) {
    User.find( {},{ password: 0 }, function(err, users) {
      res.json(users);
    });
  }); 

  //update user details based on the id
//   router.put('/users/:id',VerifyToken, function(req, res){
//     User.findByIdAndUpdate(req.params.id, req.body, function(err, response){
//        if(err) res.json({message: "Error in updating user with id " + req.params.id});
//        res.json(response);
//     });
//  });

 router.put('/users/:id',VerifyToken, function(request, response){

    console.log('PUT /user/:id');

    var id = request.params.id;

    User.findOne({ _id: id }, function (error, user) {

      if (error) {
        response.status(500).send(error);
        return;
      }

      if (user) {
        user.name = request.body.name;
        user.description = request.body.admin;
       
        
        user.save();

        response.json(user);
        return;
      }

      response.status(404).json({
        message: 'user with id ' + itemId + ' was not found.'
      });
});

// var newPerson = new User({
//     name: req.body.name,
//     //password: personInfo.password,
   
//     admin:req.body.admin
//  });
// console.log(newPerson);
//     User.findByIdAndUpdate(req.params.id, , function(err, response){
//        if(err) res.json({message: "Error in updating user with id " + req.params.id});
//        res.json(response);
//     });
 });

 //delete user details based on the id
 router.delete('/users/:id',VerifyToken, function(req, res){
    User.findByIdAndRemove(req.params.id, function(err, response){
       if(err) res.json({message: "Error in deleting record id " + req.params.id});
       else res.json({message: "User with id " + req.params.id + " removed."});
    });
 });


 

 module.exports = router;