var mysql = require('mysql');
var client = mysql.createConnection({
	host : 'localhost',
	user : 'root',
	password : '1234',
	database : 'ido'
});
exports.contents = function(req, res){
	console.log(req.param('contentsId'));
	var contentsId = req.param('contentsId');
	client.query('select ido_contents_tb.TITLE, DATE_FORMAT(REG_DATE, "%Y/%m/%d") REG_DATE, CONTENTS_IMAGE_PATH, CONTENTS_IMAGE_ORIGIN, CONTENTS from contents_image_tb  join ido_contents_tb on ido_contents_tb.contents_id = contents_image_tb.contents_id where contents_image_tb.CONTENTS_ID=?',[contentsId], function(e,r){
		console.log(r);
		//res.render('main/contents/test.ejs', {data : r});	
		client.query('SELECT SURVEY_ID, CONTENTS_ID, SURVEY_TITLE, SURVEY_THUMBNAIL FROM survey_tb WHERE contents_id=?', [contentsId], function(error, rst){
			//결과 출력
			console.log('error : '+ e);
			console.log(r);
			console.log('-------------');
			console.log(rst);
			res.render('main/contents/test.ejs', {data:r, data1:rst});
		});
	})
}
