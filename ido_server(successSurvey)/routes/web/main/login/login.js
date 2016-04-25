var fs =require('fs');
var mysql = require('mysql');
//인증
var sys = require('sys');
var base64_encode = require('base-64').encode;
var Buffer = require('buffer').Buffer;
var formidable = require('formidable');
var FormData = require('form-data');
var imagePath = 'resources/images/user_profile/';
var client = mysql.createConnection({
	host : 'localhost',
	user : 'root',
	password : '1234',
	database : 'ido'
});


//회원가입
exports.sign_in = function(req,res){
	console.log('/sign_in');
	var form = new formidable.IncomingForm();
	var files = [];
	var fields = [];
	form.keepExtensions = true;
	//If you want the files written to form.uploadDir to include the extensions of the original files, set this property to true. (확장자 이름 써줄거냐 말거냐)
    form.uploadDir = imagePath; //업로드할 위치 지정
    form.maxFieldsSize = 10 * 1024*1024; //최대 업로드 크기
    form.multiples = true; //다중업로드 여부
    form.encoding = 'utf-8'; //인코딩
    
    form.on('fileBegin',function(name, file){ // 업로드 될때 관찰된다.
    	console.log('fileBegin-' + name + ':' + JSON.stringify(file));
    }).on('progress',function(bytesReceived,bytesExpected){ // 업로드 될때 상태바를 표시할 수 있다.
        console.log('progress-' + bytesReceived +'/' + bytesExpected);
    }).on('aborted', function(){ // 유저 요청이 중단되었을때, timeout, close 이벤트가 발생한다.
        console.log('aborted');
    }).on('error', function(){
        console.log('error');
    }).on('end', function(){
        console.log('end');
    });
    
    form.parse(req, function(err, fields, files){
       	var name = [];
    	var path = [];
    	var type = [];
    	var email = fields.email;
    	var password = fields.password;
    	var sex = fields.sex;
    	if(sex =='남자'){
    		sex = 'm';
    	}else if(sex == '여자'){
    		sex='w';
    	}
    	var nickName = fields.nickName;
    	var buf = new Buffer(email); //이메일값을 buffer로 바꿈
		var incoding_data = base64_encode(buf); //이메일값이 인코딩 되어서 들어감
    	//파일 업로드시
    	for(i in files){
    		console.log(files[i].length);
    		if(typeof files[i].length == 'undefined'){ //파일이 한개일 경우 이쪽 if를 돈다.
    			console.log('파일이 하나일 경우');
    			var one_file = files.file;
    			if(one_file.type.indexOf('image') != -1 || one_file.type.indexOf('multipart') != -1){
    				var outputPath = imagePath + email+'.png'; // 파일명을 바꾸고 싶으면 one_file.name을 바꾸자.
    				fs.rename(one_file.path, outputPath, function(err){ //파일명 변경부분
    					// one_file.path : 이상한 키값으로 들어간다.
    					// outputpath : 유저 이메일값으로 png파일을 만든 후 넣음.(최종 이미지 경로)
						
    					//프로필 사진 저장완료 후 회원가입 완료
    					client.query('insert into ido_user_tb values(null, null, "1", ?, ?, ?, ?, ?, null, null, 1)', [incoding_data, password, sex, outputPath, nickName], function(e,r){
    						console.log(e);
							res.end(); //회원가입 완료 후 
						}); 
    				});
    			}else{ //이미지 파일이 아닐경우.
    				fs.unlink(one_file.path, function(err){
    					res.send(400);
    				}); 
    			}
    		}
    	}
    });
}

//로그인
exports.login = function(req,res){
	if(req.user == undefined){ // 로그인 안했을 때 Main화면 그냥 보여줌
//		res.render('index2.ejs', { user: req.user });
		res.render('index.ejs', { user: req.user });
	}else{ //로그인시 session(req.user)값이 있으므로 index.ejs에 user값으로 같이 보냄.
		if(typeof req.user.emails =='undefined'){
			res.render('index.ejs', { user: "회원가입이 필요합니다." });
		}else{
			console.log(req.user.emails);
			if(req.user.emails == 'admin@neopad.com'){
				console.log('admin')
				res.render('main/admin/admin.ejs');	
			}else{
				res.render('index.ejs', { user: req.user });	
			}
		}
	}
}


exports.login2 = function(req,res){
	res.render('main1.ejs', { user: req.user });
}
//로그아웃
exports.logout = function(req,res){
	 req.logout();
	 res.redirect('/main_login');
};
