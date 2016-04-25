var formidable = require('formidable');
var imagePath = 'resources/images/builder/thumbnail/'; //********** 이미지 저장 경로를 바꾸고 싶으면 이쪽 path를 변경해주면 된다.
var fs =require('fs');
var mysql = require('mysql');
var client = mysql.createConnection({
	host : 'localhost',
	user : 'root',
	password : '1234',
	database : 'ido'
});
exports.upload_thumbnail = function(req,res){
	var form = new formidable.IncomingForm();
	var files = [];
	var fields = [];
	form.keepExtensions = true;
	//If you want the files written to form.uploadDir to include the extensions of the original files, set this property to true. (확장자 이름 써줄거냐 말거냐)
    form.uploadDir = imagePath; //업로드할 위치 지정
    form.maxFieldsSize = 10 * 1024*1024; //최대 업로드 크기
    form.multiples = true; //다중업로드 여부
    form.encoding = 'utf-8'; //인코딩
    
    form.parse(req,function(err, fields, files){
    	var title = fields.title;
    	var category = fields.category;
    	var imageType = fields.imageType;
    	console.log(category);
    	//파일 업로드시
		console.log('파일이 하나일 경우');
		var one_file = files.thumbnail;
		console.log('oneFile : '+one_file.type);
		if(one_file.type.indexOf('image') != -1 || one_file.type.indexOf('multipart') != -1){
			var outputPath = imagePath + one_file.name; // 파일명을 바꾸고 싶으면 one_file.name 앞에 바꾸자.
			fs.rename(one_file.path, outputPath, function(err){ //파일명 변경부분
				var insertPath = outputPath.split('resources/'); //view단에서 이미지를 받아올때는 resources폴더가 기준이기 때문에 내부 폴더부터 경로가 시작되어야한다. 그래서 경로 resources부분을 잘라야함.
				client.query('SET foreign_key_checks = 0');
				client.query('INSERT INTO IDO_CONTENTS_TB VALUES(null, 1111, ?, ?, now(), ?, ?, "n", 1)',[title, insertPath[1], category, imageType], function(e,r){ //썸네일과 제목입력하는 query부분
					console.log('upload_thumbnail error : '+e);
					client.query('SELECT LAST_INSERT_ID()',function(e,r){
						if(e == null){
							for(i in r[0]){
								console.log(r[0][i])
								res.json(r[0][i]);
							}
						}else{
								res.json('fail');
						}	
					})
				});
			});
		}else{ //이미지 파일이 아닐경우.
			fs.unlink(one_file.path, function(err){
				res.send(400);
			}); 
    	}
    });

}

exports.revise_thumbnail = function(req,res){
	console.log('썸네일 수정 ');
	var form = new formidable.IncomingForm();
	var files = [];
	var fields = [];
	form.keepExtensions = true;
	//If you want the files written to form.uploadDir to include the extensions of the original files, set this property to true. (확장자 이름 써줄거냐 말거냐)
    form.uploadDir = imagePath; //업로드할 위치 지정
    form.maxFieldsSize = 10 * 1024*1024; //최대 업로드 크기
    form.multiples = true; //다중업로드 여부
    form.encoding = 'utf-8'; //인코딩
    
    form.parse(req,function(err, fields, files){
    	var title = fields.title;
    	var category = fields.category;
    	var contents_id = req.param('contentsId');
    	console.log(category);
    	//파일 업로드시
		if(typeof files.thumbnail == 'undefined'){ //파일 여부 확인
			client.query('UPDATE IDO_CONTENTS_TB SET TITLE=?, CATEGORY=? WHERE CONTENTS_ID =?',[title, category, contents_id], function(e,r){
				console.log('upload_thumbnail error : '+e);
				res.send('update_success')
			});
		}else{
			var one_file = files.thumbnail;
			if(one_file.type.indexOf('image') != -1 || one_file.type.indexOf('multipart') != -1){
				var outputPath = imagePath + one_file.name; // 파일명을 바꾸고 싶으면 one_file.name 앞에 바꾸자.
				fs.rename(one_file.path, outputPath, function(err){ //파일명 변경부분
					var insertPath = outputPath.split('resources/'); //view단에서 이미지를 받아올때는 resources폴더가 기준이기 때문에 내부 폴더부터 경로가 시작되어야한다. 그래서 경로 resources부분을 잘라야함.
					client.query('UPDATE IDO_CONTENTS_TB SET TITLE=?, THUMBNAIL_IMAGE_PATH=?, CATEGORY=? WHERE CONTENTS_ID =?',[title, insertPath[1], category, contents_id], function(e,r){
						console.log('upload_thumbnail error : '+e);
						res.send('update_success');
					});
				});
			}else{ //이미지 파일이 아닐경우.
				fs.unlink(one_file.path, function(err){
					res.send(400);
				}); 
	    	}
		}
    });
};