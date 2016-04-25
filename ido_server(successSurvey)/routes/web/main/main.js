var fs =require('fs');
var mysql = require('mysql');
var client = mysql.createConnection({
	host : 'localhost',
	user : 'root',
	password : '1234',
	database : 'ido'
});

exports.contents = function(req, res){
	console.log('main들어옴');
	//view에서 요청받은 no값 - string
	var reqNo = req.param('no');
	
	//string -> int로 변환 - 쿼리에서 파라미터값으로 사용하기 위해
	reqNo = parseInt(reqNo);
	
	//다시 view단으로 응답할 no - 요청받은 no값에 +6씩 ex) 0, 3, 6
	var resNo = reqNo + 6;
	
	//DB에서 file값 최신순으로 읽어오기 - view단에서 요청받은 no부터 6개씩  
	client.query('SELECT * FROM ido_contents_tb ORDER BY CONTENTS_ID DESC LIMIT ?, 6', parseInt(reqNo) , function(error, rst){
		console.log(rst);
		// +3한 no값과 쿼리에서 조회한 file값 
		var result = {"no":resNo, "contents":rst};
		console.log(rst);
		//view단으로 이미지 데이터 응답
		res.json(result);
	});
};