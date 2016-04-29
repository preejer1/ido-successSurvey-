

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

var qs = require('querystring');	//쿼리스트링 

//중질문 리스트 가져오기
exports.listSurveySecondTitle = function(req, res){
	
	var surveyId = req.param('surveyId');
	console.log('surveyId::'+surveyId);
	console.log('surveyId 타입::'+typeof surveyId);
	
	//int로 변환
	surveyId = parseInt(surveyId);
	console.log('surveyId::'+req.param('surveyId'));
	
	var title = {};
	
	//임시저장 조회 쿼리 실행
	client.query('SELECT survey_type_id, survey_type, survey_answer_type, second_survey_title FROM survey_type_tb WHERE survey_id=?', [surveyId], function(error, rst){
		//질문 tb 값
		title = {"title":rst};
		//배열 선언
		var arr= new Array();
		//console.log(rst[1]);
		for(var i in rst){
			client.query('select survey_contents_id, survey_contents, survey_image_path from survey_contents_tb where survey_type_id=?', [rst[i].survey_type_id], function(error,rst1){
				//arr 배열에 contents 결과값 담음
				arr.push(rst1);
				console.log('rst.length title의 값 개수 : '+rst.length);
				console.log('arr.length contents 배열의 개수:'+arr.length);
				console.log('i = title idx: '+ (parseInt(i)));
				console.log('rst1.length 해당 title에 대한 contents의 개수: '+rst1.length);
				//title의 값 개수 == contents 배열의 개수  
				if(rst.length==arr.length){
					//질문의 키 값 reply에 contents 결과값이 있는 배열을 담음
					title.reply = arr;
					console.log(title);
					//console.log(title.reply);
					//(질문 값+content 값)을 view로 보냄
					res.json(title);
				}//if
			});	
		}
	});
};

//중질문 저장하기
exports.insertSurveySecondTitle = function(req, res){
	
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
		var surveyType = fields.surveyType;
		var surveyId = fields.surveyId;
		var data = fields.data;
		console.log('surveyType::'+surveyType);
		console.log('surveyId::'+surveyId);
		console.log('data::'+data);
		
		//쿼리를 object로 변환
		var qsObj = qs.parse(fields.data);
		console.log('secondSurveyTitle::'+qsObj.secondSurveyTitle);
		
		//답변 타입 1:텍스트, 2:이미지
		var surveyAnswerType='';
		
		//files.file 변수 선언
		var file = files.file;
		
		if(file===undefined) {//텍스트 타입
			surveyAnswerType='1';
			var surveyImagePath = null;
			
			//설문 유형 tb insert 쿼리
			client.query('INSERT INTO survey_type_tb(survey_id, survey_type, survey_answer_type, second_survey_title) VALUES(?, ?, ?, ?)', 
					[ surveyId, surveyType, surveyAnswerType, qsObj.secondSurveyTitle ], function(error, rst){
				//res.json(rst);
				console.log('설문유형 tb insert success!');
				console.log(rst);
				console.log(error);
				
				for(var i in qsObj.surveyContents){
					
					console.log('i : '+qsObj.surveyContents[i]);
					//설문 컨텐츠 tb insert 쿼리
					client.query('INSERT INTO survey_contents_tb(survey_type_id, survey_contents, survey_image_path)'+
							' (SELECT (SELECT MAX(survey_type_id) FROM survey_type_tb), ?, ?)',
							[ qsObj.surveyContents[i], surveyImagePath ] , function(error, rst){
						//res.json(rst);
						console.log('설문컨텐츠 tb insert success!');
						console.log(rst);
						console.log(error);
						
						//res.json(rst);
					});//end query
				}//for
				
				res.end();
			});//end query
			
		}else {//이미지 타입
			//답변 타입 이미지:2
			surveyAnswerType='2';
			
			//설문 유형 tb insert 쿼리
			client.query('INSERT INTO survey_type_tb(survey_id, survey_type, survey_answer_type, second_survey_title) VALUES(?, ?, ?, ?)', 
					[ surveyId, surveyType, surveyAnswerType, qsObj.secondSurveyTitle ], function(error, rst){
				//res.json(rst);
				console.log('설문유형 tb insert success!');
				console.log(rst);
				console.log(error);
				
				for(var i in files){
					//console.log(files[i]);
					for(var j in files[i]){
						
						////////////////////////////////////////////
						//이미지 파일명 
						var surveyImagePath = files[i][j].name;
						
						// userId 
						var userId = 'userId';
						
						// 파일path에서 슬래시 idx
						var pathIdx = surveyImagePath.lastIndexOf('/');
						// 파일 path에서 dot idx
						var extIdx = surveyImagePath.lastIndexOf('.');
						// 순수 파일명
						var fileName = surveyImagePath.substring(pathIdx+1, extIdx);
						
						// 확장자
						var ext = surveyImagePath.substring(extIdx+1);
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
						var fileDir = '/images/builder/survey/second_question/'+renameFile;  
						
						//실제 file path 정보
						var oldPath = files[i][j].path;
						console.log('oldPath:::::'+files[i][j].path);
						console.log('::::::::::::::::::::'+typeof filePath);
					
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
						
						//////////////////////////////////////////////////////////
						
						console.log('surveyContents : '+qsObj.surveyContents[j]);
						
						//설문 컨텐츠 tb insert 쿼리
						client.query('INSERT INTO survey_contents_tb(survey_type_id, survey_contents, survey_image_path)'+
								' (SELECT (SELECT MAX(survey_type_id) FROM survey_type_tb), ?, ?)',
								[ qsObj.surveyContents[j], fileDir ] , function(error, rst){
							//res.json(rst);
							console.log('설문컨텐츠 tb insert success!');
							console.log(rst);
							console.log(error);
							
							//res.json(rst);
						});//end contents query
					}//for
				}//for
				
				res.end();
			});//end title query
		}//if
    });//end form.parse 
}

//중질문 임시저장
exports.tempStoreSvySecTitle = function(req, res){
	
	console.log('들어옴');
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
    
    //설문조사 유형 id
    var surveyTypeId = req.param('surveyTypeId');
	
	form.parse(req, function(err, fields, files){
		//질문 값
		var secondSurveyTitle = fields.secondSurveyTitle;
		console.log('secondSurveyTitle::'+secondSurveyTitle);
		
		//contsId 값
		var surveyContentsId = fields.surveyContentsId;
		console.log('surveyContentsId::'+surveyContentsId);
		contsIdObj = qs.parse(surveyContentsId);
		console.log('surveyContentsId[0]::'+contsIdObj.surveyContentsId[0]);
		
		
		//conts txt 값
		var surveyContents = fields.surveyContents;
		console.log('surveyContents::'+surveyContents);
		ContsTxtObj = qs.parse(surveyContents);
		console.log('surveyContents[0]::'+ContsTxtObj.surveyContents[0]);
		
		//컨텐츠 전체(이미지, id, 컨텐츠 txt)
		var contsJson = fields.contsJson;
		contsJson = JSON.parse(contsJson);
		console.log(files.file);
		
		//질문 수정
		client.query('UPDATE survey_type_tb SET second_survey_title=? WHERE survey_type_id=?', [secondSurveyTitle, surveyTypeId], function(error, rst){

		});
		
		if(files.file != undefined) {//파일 수정시
			console.log('이미지 수정');
			var surveyImagePath = '';
			function renameFile(surveyImagePath){
			}//end function 
			
			//해당 질문의 contents 추가시
			for(var i in files){
				console.log('file length:'+files[i].length);
				if(typeof files[i].length=='undefined'){// 1개만 수정
					console.log('이미지 한개 수정');
					//이미지 파일명 
					surveyImagePath = files[i].name;
					
					console.log('surveyImagePath::'+surveyImagePath);
					
					// userId 
					var userId = 'userId';
					
					// 파일path에서 슬래시 idx
					var pathIdx = surveyImagePath.lastIndexOf('/');
					// 파일 path에서 dot idx
					var extIdx = surveyImagePath.lastIndexOf('.');
					// 순수 파일명
					var fileName = surveyImagePath.substring(pathIdx+1, extIdx);
					console.log('fileName::'+fileName);
					
					// 확장자
					var ext = surveyImagePath.substring(extIdx+1);
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
					var fileDir = '/images/builder/survey/second_question/'+renameFile;
					
					//실제 file path 정보
					var oldPath = files[i].path;
					console.log('oldPath:::::'+files[i].path);
					console.log('::::::::::::::::::::'+typeof filePath);
				
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
					
					//////////////////////////////////////////////////////////
					//이미지 파일 수정할 때
					//console.log('no::::'+no);
					
					//해당 질문의 contents 추가시
					for(var i in ContsTxtObj.surveyContents){
						if(contsIdObj.surveyContentsId[i]==null){
							console.log('insert surveyContents : '+ContsTxtObj.surveyContents[i]);
							console.log('insert surveyContentsId:'+contsIdObj.surveyContentsId[i]);
							client.query('INSERT INTO survey_contents_tb(survey_type_id, survey_contents, survey_image_path) VALUES(?, ?, ?)', 
									[ surveyTypeId, ContsTxtObj.surveyContents[i], fileDir ], function(error, rst){
								//res.json(rst);
								console.log(rst);
								console.log(error);
							});//end query
						}//if
					}//for
							
					for(var no in contsJson){
						//이미지 파일 수정할 때
						console.log('no::::'+no);
						console.log('contsJson[no].txtContsVal::'+contsJson[no].txtContsVal);
						//return false;
						client.query('UPDATE survey_contents_tb SET survey_image_path=? WHERE survey_type_id=? and survey_contents_id=?', 
								[ fileDir, surveyTypeId, contsJson[no].contsId], function(error, rst){
							//res.json(rst);
							console.log(rst);
							console.log(error);
						});//end query
					}//for
				}else {//여러 개일 경우
					for(var j in files[i]){
						console.log('이미지 여러개 수정');
						console.log('i ,j::'+i+', '+j);
						////////////////////////////////////////////
						//이미지 파일명 
						var surveyImagePath = files[i][j].name;
						
						console.log('surveyImagePath::'+surveyImagePath);
						
						// userId 
						var userId = 'userId';
						
						// 파일path에서 슬래시 idx
						var pathIdx = surveyImagePath.lastIndexOf('/');
						// 파일 path에서 dot idx
						var extIdx = surveyImagePath.lastIndexOf('.');
						// 순수 파일명
						var fileName = surveyImagePath.substring(pathIdx+1, extIdx);
						
						// 확장자
						var ext = surveyImagePath.substring(extIdx+1);
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
						
						//var fileDir = new Array();
						
						//db file컬럼 정보
						fileDir = '/images/builder/survey/second_question/'+renameFile;
						//console.log('fileDir::'+fileDir);
						//console.log('fileDir[j]::'+fileDir[j]);
						
						//실제 file path 정보
						var oldPath = files[i][j].path;
						console.log('oldPath:::::'+files[i][j].path);
						console.log('::::::::::::::::::::'+typeof filePath);
					
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
						
						console.log('contsJson[j].contsId:::'+contsJson[j].contsId);
						console.log('contsJson[j].txtContsVal:::'+contsJson[j].txtContsVal);
						
						if(contsJson[j].contsId==null){
							console.log('i, j::'+i+', '+j);
							console.log('insert surveyContents : '+ContsTxtObj.surveyContents[j]);
							console.log('insert surveyContentsId:'+contsIdObj.surveyContentsId[j]);
							//답변 추가시 이미지 파일 추가
							client.query('INSERT INTO survey_contents_tb(survey_type_id, survey_contents, survey_image_path) VALUES(?, ?, ?)', 
									[ surveyTypeId, contsJson[j].txtContsVal, fileDir ], function(error, rst){
								//res.json(rst);
								console.log(rst);
								console.log(error);
							});//end query
						}else if(contsJson[j].contsId!=null){
							//이미지 파일 수정할 때
							client.query('UPDATE survey_contents_tb SET survey_image_path=? WHERE survey_type_id=? and survey_contents_id=?', 
									[fileDir, surveyTypeId, contsJson[j].contsId], function(error, rst){
								console.log('이미지 파일 여러개 update!!!!');
							});//end query
						}//if
					}//for
				}//if
			}//for				
			
			//이미지 수정시 텍스트만 수정할 때
			for(var i in contsIdObj.surveyContentsId){
				client.query('UPDATE survey_contents_tb SET survey_contents=? WHERE survey_type_id=? and survey_contents_id=?', 
						[ContsTxtObj.surveyContents[i], surveyTypeId, contsIdObj.surveyContentsId[i]], function(error, rst){
					//res.json(rst);
					console.log(rst);
					console.log(error);
				});//end query
			}//for
	
		}else if(files.file == undefined){
			//텍스트만 수정할 때
			console.log('텍스트만 수정');
			//해당 질문의 contents 추가시
			for(var i in ContsTxtObj.surveyContents){
				if(contsIdObj.surveyContentsId[i]==null){
					console.log('insert surveyContents : '+ContsTxtObj.surveyContents[i]);
					console.log('insert surveyContentsId:'+contsIdObj.surveyContentsId[i]);
					client.query('INSERT INTO survey_contents_tb(survey_type_id, survey_contents) VALUES(?, ?)', 
							[ surveyTypeId, ContsTxtObj.surveyContents[i] ], function(error, rst){
						//res.json(rst);
						console.log(rst);
						console.log(error);
					});//end query
				}//if
			}//for
			
			for(var i in contsIdObj.surveyContentsId){
				//기존 contentsId 가 있으면(해당 질문에 Contents 수정)
				if(contsIdObj.surveyContentsId[i]!=null){
					console.log('기존 surveyContentsId:'+contsIdObj.surveyContentsId[i]);
					//contents 값이 있으면 해당 질문 update
					if(ContsTxtObj.surveyContents[i]!=null){
						console.log('들어옴22');
						console.log('기존 update surveyContents : '+ContsTxtObj.surveyContents[i]);
						console.log('기존 update surveyContentsId:'+contsIdObj.surveyContentsId[i]);
						//update 수정
						client.query('UPDATE survey_contents_tb SET survey_contents=? WHERE survey_type_id=? and survey_contents_id=?', 
								[ContsTxtObj.surveyContents[i], surveyTypeId, contsIdObj.surveyContentsId[i]], function(error, rst){
							//res.json(rst);
							console.log(rst);
							console.log(error);
						});//end query
					}else if(ContsTxtObj.surveyContents[i]==null) {//contents 값이 없으면 해당 contents 삭제
						console.log('기존 delete surveyContents : '+ContsTxtObj.surveyContents[i]);
						console.log('기존 delete surveyContentsId:'+contsIdObj.surveyContentsId[i]);
						client.query('DELETE FROM survey_contents_tb WHERE survey_contents_id=?', 
								[contsIdObj.surveyContentsId[i]], function(error, rst){
							//res.json(rst);
							console.log(rst);
							console.log(error);
						});//end query
					}//if
				}//if
			}//for	
		}//if
		res.end();
	});//end form parse
};

//중질문 삭제
exports.deleteSurveyType = function(req, res){
	var surveyTypeId = req.param('surveyTypeId');
	console.log('surveyTypeId::'+surveyTypeId);
	//설문 삭제시 컨텐츠 이미지들 삭제
	client.query('SELECT survey_image_path FROM survey_contents_tb WHERE survey_type_id=?', [surveyTypeId], function(error, rst){
		for(var i in rst){
			//console.log('survey_image_path'+rst[i].survey_image_path);
			if(rst[i].survey_image_path!=null){
				fs.unlinkSync('resources'+rst[i].survey_image_path);
			}
		}//for
	});
	
	//return false;
	client.query('DELETE FROM survey_type_tb WHERE survey_type_id=?', [surveyTypeId], function(error, rst){
		console.log('surveyTypeId::'+surveyTypeId);
	});
}

//이미지일 때 중질문에 대한 해당 답변 삭제
exports.deleteConts = function(req, res){
	var contsId = req.param('contsId');
	console.log('contsId::'+contsId);
	//설문 컨텐츠 이미지 삭제
	if(contsId != null){
		client.query('SELECT survey_image_path FROM survey_contents_tb WHERE survey_contents_id=?', [contsId], function(error, rst){
			//console.log(rst[0].survey_image_path);
			if(rst[0].survey_image_path!=null){
				fs.unlinkSync('resources'+rst[0].survey_image_path);
			}
		});
	}
	
	client.query('DELETE FROM survey_contents_tb WHERE survey_contents_id=?', [contsId], function(error, rst){
		console.log('contsId::'+contsId);
	});
}

