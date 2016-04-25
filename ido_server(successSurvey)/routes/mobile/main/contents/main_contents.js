//fs - FileSystem을 구현하기 위한 모듈
var fs =require('fs');
//mysql - 모듈을 사용하기 위해 require함.
var mysql = require('mysql');
//htmlPath 지정   
var htmlPath = 'resources/html/';
var imagePath = 'resources/images/';
var url = require('url');

//client = Sql의 정보들을 지정하는 모듈이다.
var client = mysql.createConnection({
	host : 'localhost',
	user : 'root',
	password : '1234',
	database : 'ido'
});

exports.contents = function(req,res){
	console.log(req);
//	console.log('param1 : '+req.query.id);  Android 에서 보내는 값
	client.query('select * from test_tb', function(e,r){
		console.log(r[0].IMAGE_PATH);
		var imagePath = '172.16.75.5:5555/';
		console.log('image id : '+r[0].IMAGE_PATH);
		
		var image = imagePath + r[0].IMAGE_PATH;
		var image1 = imagePath + r[1].IMAGE_PATH;
		
		var accountObj = [{"index":r[0].TEST_ID,"url":image},{"index":r[1].TEST_ID,"url":image1}];
		var acc = JSON.stringify(accountObj);
		res.render('index.ejs', { user: acc });
		res.end(acc);
	});
};

