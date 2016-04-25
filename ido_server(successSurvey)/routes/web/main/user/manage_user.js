var partner = require('./partner/partner.js');
var mysql = require('mysql');
var base64_encode = require('base-64').encode;
var Buffer = require('buffer').Buffer;

var client = mysql.createConnection({
	host : 'localhost',
	user : 'root',
	password : '1234',
	database : 'ido'
});

exports.manage_user = function(req,res){
	if(req.params.id == 'register_partner'){
		partner.registerPartner(req, res);
		res.end();
	}else if(req.params.id == 'check_businessNumber'){
		partner.check_businessNumber(req, res);
		res.end();
	}else if(req.params.id == 'partner_detail'){
		res.render('main/user/partner_detail.ejs'); //디테일 정보 입력(View단 Form 작성)
	}else if(req.params.id == 'inqure_app_user'){
		client.query('SELECT PARTNER_TB.PARTNER_ID, USER_EMAIL, DOCUMENT, USER_CODE, DATE_FORMAT(REG_DATE, "%Y/%m/%d") REG_DATE FROM IDO_USER_TB JOIN PARTNER_TB ON IDO_USER_TB.PARTNER_ID = PARTNER_TB.PARTNER_ID WHERE IDO_USER_TB.USER_CODE=2', function(error,result){
			res.json(result);
		})
	}else if(req.params.id =='success_application'){
		console.log(req.query.partnerId);
		client.query('UPDATE PARTNER_TB SET DOCUMENT="y_y_y" WHERE PARTNER_ID=?',[req.query.partnerId+""], function(e,r){
			client.query('UPDATE IDO_USER_TB SET USER_TYPE=2, USER_CODE=3 WHERE PARTNER_ID=?',[req.query.partnerId+""], function(e,r){
				res.end();
			})
		})
	}else if(req.params.id =='manage_partner'){
		client.query('SELECT PARTNER_TB.PARTNER_ID, USER_EMAIL, DATE_FORMAT(REG_DATE, "%Y/%m/%d") REG_DATE FROM IDO_USER_TB JOIN PARTNER_TB ON IDO_USER_TB.PARTNER_ID = PARTNER_TB.PARTNER_ID WHERE IDO_USER_TB.USER_CODE=3', function(error,result){
			res.json(result);
		})
	}
};

exports.p_manager_user = function(req,res){
	if(req.params.id == 'applicationPartner'){
		var userId = req.body.userId;
		var buf = new Buffer(userId); //이메일값을 buffer로 바꿈
		var incoding_data = base64_encode(buf); //이메일값이 인코딩 되어서 들어감
		client.query('SELECT USER_ID FROM IDO_USER_TB WHERE USER_EMAIL=?', [incoding_data], function(e,userId){
			console.log(userId[0].USER_ID);
			client.query('INSERT INTO PARTNER_TB VALUES(NULL, "n_n_n", now())', function(e,r){
				client.query('SELECT @last :=LAST_INSERT_ID()');
				client.query('UPDATE IDO_USER_TB SET PARTNER_ID=@last, USER_CODE=2 WHERE USER_EMAIL=?',[incoding_data], function(e,r){
					console.log(e);
				});
			});	
		})
	}
}



exports.admin = function(req, res){
	res.render('main/admin/admin2.ejs'); //디테일 정보 변경
}