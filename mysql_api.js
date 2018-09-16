var express = require('express');
var fs = require("fs");
var bodyParser = require('body-parser');
var multer = require('multer');
var upload = multer();
var router = express.Router();
var path = require('path');
var mysql = require('mysql');
var app = express();
var jwt    = require('jsonwebtoken');
var bcrypt = require('bcryptjs');
var config = require('./config'); // get our config file


app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');





// for parsing application/json
router.use(bodyParser.json()); 

// for parsing application/xwww-
router.use(bodyParser.urlencoded({ extended: true })); 



var con = mysql.createConnection({
    host     : 'localhost',
    user     : 'Your mysql username here',
    password : 'Your password here'
  });
  
  con.query('USE test_app');
  

  router.get('/users', function(req, res) {
  //  res.json({ message: 'R35t AP! test!n9 ' });

  con.query('SELECT id,name,admin FROM users', function(err, rows){
   // res.render('users', {users : rows});

   if (err) throw err;
   console.log(rows);
   res.json({ users: rows });

   
  });
});


router.post('/signup', function(req, res){
    var personInfo = req.body; //Get the parsed information
    
    if(!personInfo.name || !personInfo.password || !personInfo.admin){
        //    res.render('show_message', {
        //       message: "Sorry, you provided worng info", type: "error"});
    
        console.log('Error');
        res.json({ "error": true,message:"Sorry, you provided worng info"});
    
        } else {
            var hashedPassword = bcrypt.hashSync(personInfo.password, 8);
  var sql = "INSERT INTO users (name, password,admin) VALUES ('"+personInfo.name+"', '"+hashedPassword+"',"+personInfo.admin+")";
  con.query(sql, function (err, result) {
    if (err) throw err;
    console.log("1 record inserted");

   
   
       res.status(200).send({ auth: true,message:'User successfully created' });

  });
}
   
 });

 

router.post('/login', function(req, res) {

    var sql="SELECT * from users where name='"+req.body.name+"'";

    //res.json(rows);

     //var user = rows[0].userid;
    // var password= rows[0].password;


     con.query(sql, function(err, rows){
        // res.render('users', {users : rows});
     
        if (err) throw err;
        var password= rows[0].password;

        var passwordIsValid = bcrypt.compareSync(req.body.password, password);
        if (!passwordIsValid) return res.status(401).send({ auth: false, message: 'Invalid username and password' });

var userData="{name :"+
rows[0].name+",admin:"+
rows[0].admin+",id:"+
rows[0].id
+"}"

        res.status(200).send({ auth: true, user: userData });
   
    });
  });

 router.put('/users/:id', function(req, res){

    console.log('PUT /user/:id');
    var personInfo = req.body;
    var sql = "UPDATE users SET name = '"+personInfo.name+"' WHERE id = "+req.params.id;
    console.log(sql);
    con.query(sql, function (err, result) {
    if (err) throw err;
    //console.log("1 record inserted");

    console.log("1 record updated with id "+req.params.id);
   // res.json({ message: "1 record updated with id "+req.params.id });
   
       res.status(200).send({ message: "1 record updated with id "+req.params.id });
    });

    // con.query(sql, function (err, result) {
    //     if (err) throw err;
    //     console.log("1 record deleted with id "+req.params.id);
    //     res.json({ message: "1 record deleted with id "+req.params.id });
    //   });

});

 //delete user details based on the id
 router.delete('/users/:id', function(req, res){
   var sql="DELETE from users where id="+req.params.id;

   con.query(sql, function (err, result) {
    if (err) throw err;
    console.log("1 record deleted with id "+req.params.id);
    res.json({ message: "1 record deleted with id "+req.params.id });
  });
 });

module.exports = router;