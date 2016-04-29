var http = require('http');
var express = require('express')
  , router = express.Router();
var routes = require('./routes');

var main = require('./routes/web/main/main.js');
var m_main = require('./routes/mobile/main/contents/main_contents.js'); //mobile 서버
var user = require('./routes/web/main/user/manage_user.js') //유저관리
var partner = require('./routes/web/partner/partner.js');
var login = require('./routes/web/main/login/login.js') // 로그인 관련
var id_check = require('./routes/web/main/login/id_check.js') //id확인

//builder 관련
var upload = require('./routes/web/builder/upload.js') // 이미지 업로드 관련
var viewContents = require('./routes/web/contents/contents.js') //컨텐츠 띄우기.
var path = require('path');
111


var favicon = require('serve-favicon');
var logger = require('morgan');
var methodOverride = require('method-override');
var session = require('express-session');
var bodyParser = require('body-parser');
//삭
var allowCORS = function(req, res, next) {
	  res.header('Acess-Control-Allow-Origin', '*');
	  res.header('Access-Control-Allow-Methods', 'GET, PUT, POST, DELETE, OPTIONS');
	  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');
	  (req.method === 'OPTIONS') ?
	    res.send(200) :
	    next();
};
var imagePath = 'resources/images/builder/contents/'; //********** 이미지 저장 경로를 바꾸고 싶으면 이쪽 path를 변경해주면 된다.
var realPath = '/images/builder/contents/';
var url = require('url');
var formidable = require('formidable');
//삭제	
var multer = require('multer');
var errorHandler = require('errorhandler');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var FacebookStrategy = require('passport-facebook').Strategy;
var KakaoStrategy = require('passport-kakao').Strategy;

var CORS = require('cors')();//크로
var base64_encode = require('base-64').encode;
var base64_decode = require('base-64').decode;
var Buffer = require('buffer').Buffer;
var mysql = require('mysql');
var client = mysql.createConnection({
	host : 'localhost',
	user : 'root',
	password : '1234',
	database : 'ido'
});

var flash = require('connect-flash')
var app = express();

// all environments
app.set('port', process.env.PORT || 5555);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(allowCORS); //크로스 
app.use(CORS);// 크로스
app.use(methodOverride());
// in latest body-parser use like below.
app.use(bodyParser.urlencoded({ extended: true }));
app.use(require('express-session')({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(express.static(path.join(__dirname, 'resources')));
app.use('/upload', express.static(path.join(__dirname, 'resources'))); //upload부분은 path경로추가 

app.get('/', routes.index);

// error handling middleware should be loaded after the loading the routes
if ('development' == app.get('env')) {
  app.use(errorHandler()); 
}


// [ Main ]
	//Mobile Main
app.route('/m_main_contents')
.get(m_main.contents);
	//Web Main
app.route('/main_contents')
.get(main.contents);


//Login
app.get('/main_login', login.login);
app.get('/logout', login.logout);


// 회원가입부분
app.route('/sign_in')
.post(login.sign_in);
	// 회원가입 -> id_checheck
	app.get('/check_id/:id', id_check.check_id);

	
app.get('/partner/:id', partner.main);
// [ Builder ]
	// -upload
app.route('/upload/:id')
.get(upload.upload_form)
.post(upload.post_upload);

// [ User ]
app.route('/user/:id')
.get(user.manage_user)
.post(user.p_manager_user);

// [View Contents]
app.route('/view_contents')
.get(viewContents.contents);

app.route('/admin')
.get(user.admin);

app.use('/', router); //라우터를 실행해주는 middleware
var server = http.createServer(app);
server.listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});

























///////////////////////////////로그인 쪽 - 추후에 학습후 다른곳으로 옮기자


//Passport 로컬
passport.use(new LocalStrategy({
	usernameField : 'userid',
	passwordField : 'password',
	passReqToCallback : true
},
function(req, userid, password, done) {
	var email = userid;
	var buf = new Buffer(email); //이메일값을 buffer로 바꿈
	var incoding_data = base64_encode(buf); //이메일값이 인코딩 되어서 들어감
	console.log(incoding_data)
	client.query('select * from ido_user_tb where user_email = ? and password = ?', [incoding_data, password], function(e,r){
		if(r[0] == undefined){ //값이 없으면 로그인 실패
			return done(null,false);
		}else{ //값이 있으면 fail
			var dec_email = base64_decode(r[0].USER_EMAIL);
			console.log('디코더 된 이미지 : '+dec_email);
			 var user = {'emails':dec_email};
			 return done(null,user);
		}
	});	
}));



passport.serializeUser(function(user, done) {
	console.log('serializeUser');
	  done(null, user); //세션에 userID값만 저장한다.
	});

	passport.deserializeUser(function(user, done) {
	console.log('deserializeUser')
		 done(null, user); //req.user <--- 여기 안에 userid값이 저장되고 콜백함.
	});

//Passport FaceBook
passport.use(new FacebookStrategy({
	clientID: '508794649269040',
    clientSecret: '10f047768363b9208dd1c6ec90dc449d',
    callbackURL: "http://172.16.75.5:5555/auth/facebook/callback",
    profileFields: ['id', 'name', 'photos', 'emails']
  },
  function(accessToken, refreshToken, profile, done) {
    process.nextTick(function () {
      return done(null, profile);
    });
  }
));

//Local 로그인
app.post('/login',
		  passport.authenticate('local', { failureRedirect: '/main_login', failureFlash: true }),
		  function(req, res) {
		    res.redirect('/main_login');
		  });
//FaceBook 로그인
app.get('/auth/facebook', passport.authenticate('facebook'));
app.get('/auth/facebook/callback',
		  passport.authenticate('facebook', { successRedirect:'/check_id/facebook' , failureRedirect: '/'})),



function ensureAuthenticated(req, res, next) {
	  if (req.isAuthenticated()) { return next(); }
	  res.redirect('/');
	}