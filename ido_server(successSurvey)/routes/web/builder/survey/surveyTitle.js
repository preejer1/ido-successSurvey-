var fs = require('fs');	//File System 모듈 추출
var formidable = require('formidable');	//파일 업로드
var moment = require('moment');	//형식변환
var mysql = require('mysql');	//mysql 모듈 추출

var client = mysql.createConnection({	//db와 연결
	host : 'localhost',
	user : 'root',	//계정
	password : '1234',	//pwd
	database : 'ido'	//db
});

//컨텐츠 새창 폼 추후 수정할 것
/*
exports.surveyForm = function(req, res){
	res.render('builder/survey/surveyForm.ejs');
}
*/

//대질문 등록폼 
exports.surveyTitleForm = function(req, res){
	res.render('builder/survey/surveyForm.ejs');
};

//대질문 등록
exports.surveyTitle = function(req, res){
	
	//body 선언
	var body = req.body;
	console.log('대질문:'+body.surveyTitle);
	
	var form = new formidable.IncomingForm();
	var files = [];	//파일 선언
	var fields = [];	//파일 제외한 필드 선언
	form.keepExtensions = true;
	//If you want the files written to form.uploadDir to include the extensions of the original files, set this property to true. (확장자 이름 써줄거냐 말거냐)
    //form.uploadDir = 'resources/upload_img'; //업로드할 위치 지정
    form.maxFieldsSize = 10 * 1024*1024; //최대 업로드 크기
    form.multiples = true; //다중업로드 여부
    form.encoding = 'utf-8'; //인코딩
    
    console.log(files);
    
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
	
	form.parse(req,function(err, fields, files){
		var surveyTitle = fields.surveyTitle;
		console.log('surveyTitle::'+surveyTitle);
		
		//파일 선언
		var file = files.file;
		console.log('?? : '+file);
		var surveyThumbnail = file.name;
		console.log('surveyThumbnail:'+surveyThumbnail);
//		
		//파일////////////////////////////////
		// userId 
		var userId = 'userId';
		
		// 파일path에서 슬래시 idx
		var pathIdx = surveyThumbnail.lastIndexOf('/');
		// 파일 path에서 dot idx
		var extIdx = surveyThumbnail.lastIndexOf('.');
		// 순수 파일명
		var fileName = surveyThumbnail.substring(pathIdx+1, extIdx);
		
		// 확장자
		var ext = surveyThumbnail.substring(extIdx+1);
		console.log('확장자:::::'+ext);
		
		// 날짜 선언
		var date = new Date().toISOString();
		console.log('날짜',date);
		
		// 날짜 형식 변환
		date = moment(date).format('YYYYMMDDHHmmss');
		console.log('날짜 형식변환 :::'+date);
		
		// 변경된 파일명                             //파일명 공백제거
		var renameFile = userId+'_'+fileName.replace(/\s/gi, '')+'_'+date+'.'+ext;
		console.log('renameFile:::::::'+renameFile);
		
		//db file컬럼 정보
		var fileDir = '/images/builder/survey/first_question/'+renameFile;  
		
		//실제 file path 정보
		var oldPath = file.path;
		console.log('::::::::::::::::::::'+oldPath);

		//변경된 path 정보
		var renamePath = 'resources'+fileDir;
		console.log('renameFile:::::'+renamePath);

		//기존 파일 변경하기
		fs.rename(oldPath, renamePath, function(err){
			console.log(err)
			if(err){
				res.end('error');
				return;
			}
			//res.end('seccess');
			console.log('seccess');
		});
		
		console.log('fileDir::::::::::::::::::'+fileDir);
		////////////////////////////////////////////////////////
	
		//대질문 tb insert												//임시로 contents_id는 1로 insert 추후 변경
		client.query('INSERT INTO survey_tb values(null, 1, ?, ?)', [surveyTitle, fileDir], function(error, rst){
			console.log('insert error::'+error);
			//survey_id 값 가져오기
			client.query('SELECT MAX(survey_id) AS surveyId FROM survey_tb', function(error, rst){
				console.log('select error::'+error);
				res.json(rst);
			});//end select query
		});//end insert query
	});//end form parse
};


//대질문 리스트 view
exports.listSurveyTitle = function(req, res){
	console.log('들어왔다.');
	client.query('SELECT * FROM survey_tb', function(error, rst){
		//결과 출력
		res.render('builder/survey/listSurveyTitle.ejs', { data : rst });
	});
}

//대질문 삭제하기
exports.deleteSurveyTitle = function(req, res){
	//해당 대질문 설문에 대한 컨텐츠 이미지 삭제
	client.query('select survey_type_id from survey_type_tb where survey_id=?', [req.params.surveyId], function(error, rst2){
		console.log(rst2);
		for(var i in rst2){
			console.log(rst2[i].survey_type_id);
			
			client.query('select survey_image_path from survey_contents_tb where survey_type_id=?', [rst2[i].survey_type_id], function(error, rst3){
				//console.log(rst3);
				for(var j in rst3){
					console.log('컨텐츠 삭제 파일:'+rst3[j].survey_image_path);
					
					//fs.unlinkSync('resources'+rst1[0].survey_thumbnail);
					if(rst3[j].survey_image_path!=null){
						fs.unlinkSync('resources'+rst3[j].survey_image_path);
					}//if
				}//for
			});//end query
		}//for
		
		//survey_image_path를 먼저 select한 후에 해야 되어 밑에 쿼리를 select쿼리 안에 넣은거임   
		//=> req.params.surveyId를 먼저 검색되므로  survey_image_path를 먼저 찾은 후에 아래의 쿼리가 실행
		///////////////////////////////////////////////////////
		client.query('DELETE FROM survey_tb WHERE survey_id=?', [req.params.surveyId], function(error, rst){
			console.log('surveyId::'+req.params.surveyId);
			//리스트로 리다이렉트
			res.redirect('/listSurveyTitle');
		});
		///////////////////////////////////////////////////////
	});//end query
	
	//설문 대질문 썸네일 삭제
	client.query('SELECT survey_thumbnail FROM survey_tb WHERE survey_id=?', [req.params.surveyId], function(error, rst1){
		console.log('썸네일 삭제 파일:'+rst1[0].survey_thumbnail);
		if(rst1[0].survey_thumbnail!=null){
			fs.unlinkSync('resources'+rst1[0].survey_thumbnail);
		}
	});//end query
}

//대질문 수정 조회
exports.selectSurveyTitle = function(req, res){
	var surveyId = req.param('surveyId');
	console.log('surveyId::'+surveyId);
	console.log('surveyId 타입::'+typeof surveyId);
	
	//int로 변환
	surveyId = parseInt(surveyId);
	console.log('surveyId::'+req.param('surveyId'));
	
	var title = {};
	
	//임시저장 조회 쿼리 실행
	client.query('SELECT * FROM survey_tb where survey_id=?',[surveyId], function(error, rst){
		res.json(rst);
	});
}

//대질문 수정 
exports.updateSurveyTitle = function(req, res){
	//body 선언
	var body = req.body;
	console.log('대질문:'+body.surveyTitle);
	
	//surveyId 값 선언
	var surveyId = req.params.surveyId;
	
	var form = new formidable.IncomingForm();
	var files = [];	//파일 선언
	var fields = [];	//파일 제외한 필드 선언
	form.keepExtensions = true;
	//If you want the files written to form.uploadDir to include the extensions of the original files, set this property to true. (확장자 이름 써줄거냐 말거냐)
    //form.uploadDir = 'resources/upload_img'; //업로드할 위치 지정
    form.maxFieldsSize = 10 * 1024*1024; //최대 업로드 크기
    form.multiples = true; //다중업로드 여부
    form.encoding = 'utf-8'; //인코딩
    
    console.log(files);
    
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
	
	form.parse(req,function(err, fields, files){
		var surveyTitle = fields.surveyTitle;
		console.log('surveyTitle::'+surveyTitle);
		
		//파일 선언
		var file = files.file;
		
		if(file!=undefined){//파일이 있으면
			var surveyThumbnail = file.name;
			console.log('surveyThumbnail:'+surveyThumbnail);
			
			//파일////////////////////////////////
			// userId 
			var userId = 'userId';
			
			// 파일path에서 슬래시 idx
			var pathIdx = surveyThumbnail.lastIndexOf('/');
			// 파일 path에서 dot idx
			var extIdx = surveyThumbnail.lastIndexOf('.');
			// 순수 파일명
			var fileName = surveyThumbnail.substring(pathIdx+1, extIdx);
			
			// 확장자
			var ext = surveyThumbnail.substring(extIdx+1);
			console.log('확장자:::::'+ext);
			
			// 날짜 선언
			var date = new Date().toISOString();
			console.log('날짜',date);
			
			// 날짜 형식 변환
			date = moment(date).format('YYYYMMDDHHmmss');
			console.log('날짜 형식변환 :::'+date);
			
			// 변경된 파일명                             //파일명 공백제거
			var renameFile = userId+'_'+fileName.replace(/\s/gi, '')+'_'+date+'.'+ext;
			console.log('renameFile:::::::'+renameFile);
			
			//db file컬럼 정보
			var fileDir = '/images/builder/survey/first_question/'+renameFile;  
			
			//실제 file path 정보
			var oldPath = file.path;
			console.log('::::::::::::::::::::'+oldPath);
			
			//변경된 path 정보
			var renamePath = 'resources'+fileDir;
			console.log('renameFile:::::'+renamePath);
			
			//기존 파일 변경하기
			fs.rename(oldPath, renamePath, function(err){
				if(err){
					res.end('error');
					return;
				}
				//res.end('seccess');
				console.log('seccess');
			});
			
			console.log('fileDir::::::::::::::::::'+fileDir);
			////////////////////////////////////////////////////////
			//대질문 tb update												//임시로 contents_id는 1로 insert 추후 변경
			client.query('UPDATE survey_tb SET survey_title=?, survey_thumbnail=? WHERE survey_id=?', [surveyTitle, fileDir, surveyId], function(error, rst){
				console.log('insert error::'+error);
			});//end insert query
		}else if(file==undefined) {//파일 없을 때 수정
			client.query('UPDATE survey_tb SET survey_title=? WHERE survey_id=?', [surveyTitle, surveyId], function(error, rst){
				console.log('insert error::'+error);
			});//end insert query
		}//if
	
		
		//survey_id 값 가져오기
		client.query('SELECT * FROM survey_tb WHERE survey_id=?',[surveyId], function(error, rst){
			console.log('select error::'+error);
			res.json(rst);
		});//end select query
	});//end form parse
}



