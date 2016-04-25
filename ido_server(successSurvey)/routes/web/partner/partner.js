//파트너 리스트 화면
exports.main = function(req, res){
	if(req.params.id == 'partner_office'){
		console.log('partner_office');
		console.log(req.user.emails);
		if(typeof req.user.emails =='undefined'){
			//partner login 페이지 띄워주기
			console.log('login 요청');
		}else{
			console.log(req.user.emails);
			if(req.user.emails == 'admin@neopad.com'){
				console.log('admin')
				res.render('main/admin/admin.ejs');	
			}else{
				res.render('index.ejs', { user: req.user });	
			}
		}
//		client.query('select CONTENTS_ID, TITLE, DATE_FORMAT(REG_DATE, "%Y/%m/%d") REG_DATE from ido_contents_tb  where PARTNER_ID = 1111;', function(e,r){
//			res.render('builder/list/list.ejs', { list: r });
//		});
	}
}