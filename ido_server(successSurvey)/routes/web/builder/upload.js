var builder_thumbnail = require('./thumbnail/upload_thumbnail.js');
var builder_contents = require('./contents/upload_contents.js'); //upload_buider_contents 부분
var viewSurveyTitle = require('./survey/surveyTitle.js');	//대질문 등록폼 띄우기
var viewSurveySecondTitle = require('./survey/surveySecondTitle.js');	//중질문

//fs - FileSystem을 구현하기 위한 모듈
var fs =require('fs');
//mysql - 모듈을 사용하기 위해 require함.
var mysql = require('mysql');
//htmlPath 지정   
var htmlPath = 'resources/html/';
var imagePath = 'resources/images/';
var url = require('url');
var formidable = require('formidable');
//client = Sql의 정보들을 지정하는 모듈이다.
var client = mysql.createConnection({
	host : 'localhost',
	user : 'root',
	password : '1234',
	database : 'ido'
});


//upload위한 GET요청시 들어오는 곳
exports.upload_form = function(req,res){ // Upload 부분 (Get 요청시)
	//list부분
	if(req.params.id == 'builder_list'){
		client.query('select CONTENTS_ID, TITLE, DATE_FORMAT(REG_DATE, "%Y/%m/%d") REG_DATE from ido_contents_tb  where PARTNER_ID = 1111;', function(e,r){
			res.render('builder/list/list.ejs', { list: r });
		});
	}
	//builder_thumbnail 작성부분
	if (req.params.id == 'builder_thumbnail'){ 
		var contents_id = req.param('contents_id');
		if(contents_id == 'new'){ //list에서 contents_id 유무를 확인한다. 새로만들기 부분을 클릭시 new라는 값을 받아 비어있는 틀을 제공
			res.render('builder/thumbnail/upload_thumbnail.ejs');
		}else{ //contents_id값이 있으면 그 값으로 쿼리를 확인 후 수정작업을 위한 ejs 제공
			client.query('select CATEGORY, TITLE, THUMBNAIL_IMAGE_PATH, CONTENTS_ID from ido_contents_tb where CONTENTS_ID=?;', contents_id, function(e,r){
				res.render('builder/thumbnail/adjust_thumbnail.ejs',{data : r[0]});
			});
		}
	}
	
	//contents 부분
	if(req.params.id == 'builder_contents'){
		//builder_contents 작성부분
		var contentsId = req.param('contentsId');
		client.query('select CONTENTS_ID, LI_VALUE, CONTENTS_TYPE, CONTENTS_IMAGE_PATH, CONTENTS_IMAGE_ORIGIN, CONTENTS, ORDER_NUM from contents_image_tb where CONTENTS_ID=? ORDER BY ORDER_NUM', contentsId, function(e,r){
			//console.log('error : '+ e);
			//console.log('result : '+ r);
			//res.render('builder/contents/upload_contents.ejs',{data : r});
			client.query('SELECT SURVEY_ID, CONTENTS_ID, SURVEY_TITLE, SURVEY_THUMBNAIL FROM survey_tb WHERE contents_id=?', [contentsId], function(error, rst){
				//결과 출력
				console.log('error : '+ e);
				console.log(r);
				console.log('-------------');
				console.log(rst);
				res.render('builder/contents/upload_contents.ejs', {data:r, data1:rst});
			});
		});
	}else if(req.params.id == 'update_builder_contents'){ //기존에 작성중이던 builder_contents에서 update를 위한 부분
		var contentsId = req.param('contentsId');
		client.query('select CONTENTS_ID, LI_VALUE, CONTENTS_TYPE, CONTENTS_IMAGE_PATH, CONTENTS_IMAGE_ORIGIN, CONTENTS, ORDER_NUM from contents_image_tb where CONTENTS_ID=? ORDER BY ORDER_NUM', contentsId, function(e,r){
			
			client.query('SELECT SURVEY_ID, CONTENTS_ID, SURVEY_TITLE, SURVEY_THUMBNAIL FROM survey_tb WHERE contents_id=?', [contentsId], function(error, rst){
				//결과 출력
				console.log('error : '+ e);
				console.log(r);
				console.log('-------------');
				console.log(rst);
				res.render('builder/contents/adjust_contents.ejs', {data:r, data1:rst});
			});
		});
	}else if(req.params.id == 'check_contents_image_id'){ //빌더부분에서 name값들을 지정하기 위해 가장 최근에 작성된 컨텐츠의 id값을 받아서 보내줌.
		var contentsId = 1;
		client.query('select ORDER_NUM, LI_VALUE from contents_image_tb where CONTENTS_ID=? ORDER BY LI_VALUE DESC LIMIT 1', contentsId, function(e,r){
			console.log('liValue : '+r[0])
			if(r[0] == undefined){
				res.json('1')
			}else{
				
				res.json(r[0]);	
			}
		})
	}else if(req.params.id == 'delete_contents'){ 
		console.log(req.query.contents_id);
		var contents_id = req.query.contents_id.split('check_')[1];
		console.log(contents_id);
		client.query('SET foreign_key_checks = 0');
		client.query('DELETE t2, t1 from ido_contents_tb AS t1 LEFT JOIN contents_image_tb AS t2 on t1.contents_id = t2.contents_id where t1.contents_id = ?', [contents_id], function(e,r){
			client.query('SET foreign_key_checks = 1');
			console.log(e);
			res.end();
		});
	}else if(req.params.id == 'm_update_builder_contents'){ //모바일 화면(지워도됨)
		var contentsId = req.param('contentsId');
		client.query('select CONTENTS_ID, LI_VALUE, CONTENTS_TYPE, CONTENTS_IMAGE_PATH, CONTENTS_IMAGE_ORIGIN, CONTENTS, ORDER_NUM from contents_image_tb where CONTENTS_ID=?', contentsId, function(e,r){
			console.log('error : '+ e);
			console.log('result : '+ r);
			res.json(r);
		});
	}else if(req.params.id == 'change_order'){ //컨텐츠 순서 바꿀 때
		var li_value = req.query.li_value.split('image_preview')[1];
		var order_num = req.query.order_num;
		var contents_id = req.query.contents_id;
		
		console.log('li_value : ' + li_value)
		console.log('order_num : '+order_num);
		client.query('UPDATE CONTENTS_IMAGE_TB SET ORDER_NUM=? WHERE LI_VALUE=? AND CONTENTS_ID =?',[order_num, li_value, contents_id], function(e,r){
			console.log(e);
		});
		res.end();
	}else if(req.params.id == 'delete_contents_image'){
		console.log('contents_image 삭제 부분');
		var contents_id = req.query.contents_id; //삭제할 컨텐츠 아이디
		var li_value = req.query.li_value; //삭제할 컨텐츠의 li_value 값
		console.log(contents_id);
		console.log(li_value);
		client.query('delete from contents_image_tb where contents_id=? and li_value=?', [contents_id, li_value], function(e,r){
			console.log(e);
		});
	}else if(req.params.id == 'latest_value'){
		console.log('li_value값 조회');
		console.log(req.param('contentsId'));
		var contents_id = req.param('contentsId');
		client.query('SELECT LI_VALUE FROM contents_image_tb WHERE CONTENTS_ID=? ORDER BY LI_VALUE DESC LIMIT 1',[contents_id], function(error, result){
			console.log(result[0]);
			if(typeof result[0]=='undefined'){
				console.log('ff');
				res.send('0');
			}else{
				res.send(result[0]);
			}
			
		});
	}
	
	//대질문 리스트 view
	if(req.params.id == 'listSurveyTitle'){
		console.log('대질문 리스트 조회');
		client.query('SELECT SURVEY_ID, CONTENTS_ID, SURVEY_TITLE, SURVEY_THUMBNAIL FROM survey_tb', function(error, rst){
			console.log(rst);
			//결과 출력
			res.render('builder/survey/listSurveyTitle.ejs', { data : rst });
		});
	}
	
	//해당 컨텐츠에 대한 대질문 조회
	/*
	if(req.params.id == 'selectSurveyTitleByContsId'){
		console.log('해당 컨텐츠에 대한 대질문  조회');
		var contentsId = req.param('contentsId');
		console.log('contentsId::'+contentsId);
		client.query('SELECT SURVEY_ID, CONTENTS_ID, SURVEY_TITLE, SURVEY_THUMBNAIL FROM survey_tb WHERE contents_id=?', [contentsId], function(error, rst){
			//결과 출력
			res.json(rst);
			//res.render('builder/contents/adjust_contents.ejs', {data1:r});
		});
	}
	*/
	
	//대질문 수정 조회
	if(req.params.id == 'selectSurveyTitle'){
		console.log('대질문 수정 조회');
		var surveyId = req.param('surveyId');
		console.log('surveyId::'+surveyId);
		console.log('surveyId 타입::'+typeof surveyId);
		
		//int로 변환
		surveyId = parseInt(surveyId);
		console.log('surveyId::'+req.param('surveyId'));
		
		//임시저장 조회 쿼리 실행
		client.query('SELECT SURVEY_ID, SURVEY_TITLE, SURVEY_THUMBNAIL FROM survey_tb where survey_id=?',[surveyId], function(error, rst){
			res.json(rst);
		});
	}
	
	//중질문 리스트 조회
	if(req.params.id == 'listSurveySecondTitle'){
		console.log('중질문 리스트 조회');
		var surveyId = req.param('surveyId');
		console.log('surveyId::'+surveyId);
		console.log('surveyId 타입::'+typeof surveyId);
		
		//int로 변환
		surveyId = parseInt(surveyId);
		console.log('surveyId::'+req.param('surveyId'));
		
		var title = {};
		
		//임시저장 조회 쿼리 실행
		client.query('SELECT SURVEY_TYPE_ID, SURVEY_TYPE, SURVEY_ANSWER_TYPE, SECOND_SURVEY_TITLE FROM SURVEY_TYPE_TB WHERE SURVEY_ID=?', [surveyId], function(error, rst){
			//질문 tb 값
			title = {"title":rst};
			//배열 선언
			var arr= new Array();
			//console.log(rst[1]);
			for(var i in rst){
				client.query('SELECT SURVEY_CONTENTS_ID, SURVEY_CONTENTS, SURVEY_IMAGE_PATH FROM SURVEY_CONTENTS_TB WHERE SURVEY_TYPE_ID=?', [rst[i].SURVEY_TYPE_ID], function(error,rst1){
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
	}
};





//upload위한 POST요청시 들어오는 곳
//파일 입력 받는 곳
exports.post_upload = function(req,res){ // Upload 부분 (Post 요청시)
	if (req.params.id == 'builder_thumbnail'){ //builder_thumbnail 작성부분
		builder_thumbnail.upload_thumbnail(req, res); //위쪽에 선언한 [var builder_thumbnail 확인할 것] 
	}else if(req.params.id == 'builder_contents'){ //builder_contents 작성부분
		builder_contents.upload_contents(req, res); //최상단에 선언한 [var builder_contents 확인할 것]
		res.end();
	}else if(req.params.id == 'revise_builder_contents'){
		console.log('revise')
		builder_contents.revise_contents(req, res); //최상단에 선언한 [var builder_contents 확인할 것]
	}else if(req.params.id == 'update_builder_thumbnail'){ // update_thumbnail 부분
		builder_thumbnail.revise_thumbnail(req, res);
	}else if(req.params.id == 'insertSurveyTitle'){ //대질문 저장
		viewSurveyTitle.insertSurveyTitle(req, res);
	}else if(req.params.id == 'deleteSurveyTitle'){	//대질문 삭제
		viewSurveyTitle.deleteSurveyTitle(req, res)
	}else if(req.params.id == 'updateSurveyTitle'){	//대질문 수정
		viewSurveyTitle.updateSurveyTitle(req, res);
	}else if(req.params.id == 'insertSurveySecondTitle'){	//중질문 저장하기
		viewSurveySecondTitle.insertSurveySecondTitle(req, res);	
	}else if(req.params.id == 'tempStoreSvySecTitle'){	//중질문 임시저장
		viewSurveySecondTitle.tempStoreSvySecTitle(req, res);
	}else if(req.params.id == 'deleteSurveyType'){	//중질문 삭제
		viewSurveySecondTitle.deleteSurveyType(req, res);
	}else if(req.params.id == 'deleteConts'){	//중질문에 대한 해당 답변 삭제
		viewSurveySecondTitle.deleteConts(req, res);
	}
}



