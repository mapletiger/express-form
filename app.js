//Required packages
const express = require('express');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const helmet = require('helmet');
const validator = require('express-validator');
const xss = require('xss');
const path = require("path");
const db = require('./db');
const nodeMailer = require('nodemailer');

//app and port info
const app = express();
const port = 1000;

if (app.get('env') === 'production') {
  app.set('trust proxy', 1) // trust first proxy
}

app.use(cookieParser());
app.use(helmet());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(validator());

//Store all HTML files in view folder.
app.use(express.static(__dirname + '/views'));
//Store all JS and CSS in Scripts folder.
app.use(express.static(__dirname + '/public'));

// set the view engine to ejs
app.set('view engine', 'ejs');

//Routes and controls
//// INDEX ROUTE
app.get('/intake/',function(req,res){
  res.render('index');
  });
//get a submit
app.get('/intake/submit',function(req,res) {
    res.redirect('back');
});
//post a submit
app.post('/intake/submit', function (req, res) {
    //process form and show completion screen
    
    //sanitize all inputs
    Object.keys(req.body).forEach(function(key,index) {
        req.body[key] = xss(req.body[key],{
  whiteList: [],
  stripIgnoreTag: true,
  stripIgnoreTagBody: ["script"]
        });
    });
    //verification functions
    req.checkBody('firstname','please enter a correct last name').notEmpty();
    req.checkBody('lastname','please enter a correct first name').notEmpty();
    req.checkBody('furifirstname','Please enter your name in hiragana').matches(/^[\u3041-\u3096\s]+$/);
    req.checkBody('furilastname','Please enter your last name in hiragana').matches(/^[\u3041-\u3096\s]+$/);
    req.checkBody('email','Please enter a correct email').isEmail(); 
    req.checkBody('email','Please enter a correct last name').notEmpty(); 
    req.checkBody('phone','Please enter a correct phone number').isMobilePhone('any');
    req.checkBody('phone','Please enter a correct phone number').notEmpty('any');
    req.checkBody('phone','-Please enter a hyphen between the phone number digits').matches(/^\d{2}\d?-\d{4}-\d{4}$/);

    let errors = req.validationErrors();
    if (errors)
    {
        res.render('index',{ errors:errors, email:req.body.email , firstname: req.body.firstname, lastname: req.body.lastname, furilastname: req.body.furilastname,furifirstname: req.body.furifirstname, phone: req.body.phone, joinday: req.body.joinday});
        return;
    }
    //printout data (insert into database)
    let data = {
        'email': req.body.email,
        'firstname': req.body.firstname, 
        'lastname': req.body.lastname, 
        'furifirstname': req.body.furifirstname, 
        'furilastname': req.body.furilastname, 
        'phone': req.body.phone,
        'joinday': req.body.joinday
    };
    db.query(`insert into table_name (field list) values ( ?, ?, ?, ?, ?, ?, ?)`,[data.email,data.firstname,data.lastname,data.furifirstname,data.furilastname,data.phone, data.joinday],function(err, result) {
        if (err) { 
            throw err;
        }
        else {
            res.render('done');
            return;
        }
    });
	let userMail = req.body.email;
    //send user email after submission
	let transporter = nodeMailer.createTransport({
        service: "gmail",
        host: "smtp.gmail.com",
        port: 465,
        auth: {
            user: "",
            pass: ""
        }
    });
let messageHeader = `
=============================
=============================
\n`;

    
let messageContents = `
---------------------------------------
`;
      let mailOptions = {
          from: '', // sender address
          to: userMail, // list of receivers (userMail)
          subject: "", // Subject line
          text: messageHeader + messageContents // plain text body
      };
      transporter.sendMail(mailOptions, (error, info) => {
          if (error) {
				console.log("mail error:" + error);
				console.log("info:" + info);
              }
          });
});

//Listen on port and wait for input
// Local
app.listen(port); 
console.log(`server is running on port: ${port}`);
