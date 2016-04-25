$(document).ready(function(){
//파트너 신청현황
    $.ajax({
      url : '/user/inqure_app_user',
      success:function(data){
    	  var userCode ='';
    	  var paper = {};
    	  for(i in data){
			  if(data[i].USER_CODE == '1'){
				  userCode = '<a href="#">일반유저</a>';
			  }else if(data[i].USER_CODE == '2'){
				  userCode = '<button id="apply_'+i+'">신청중</button>';
			  }

			  paper.a = data[i].DOCUMENT.split('_')[0];
			  paper.b = data[i].DOCUMENT.split('_')[1];
			  paper.c = data[i].DOCUMENT.split('_')[2];
  
		  if(paper.a == 'n'){
			  business_license = '<input type="checkbox" id="business_license'+i+'">사업자 등록증'
		  }else{
		  	business_license = '<input type="checkbox" id="business_license'+i+'" checked>사업자 등록증'
		  }
		  if(paper.b == 'n'){
			  seal_certification = '<input type="checkbox" id="seal_certification'+i+'">인감증명서'
		  }else{
		  	seal_certification = '<input type="checkbox" id="seal_certification'+i+'" checked>인감증명서'
		  }
		  if(paper.c == 'n'){
			  internet_business_license = '<input type="checkbox" id=internet_business_license'+i+'>통신판매업'
		  }else{
		  	internet_business_license = '<input type="checkbox" id=internet_business_license'+i+' checked>통신판매업'
		  }
		  $('#admin_tb_1').append('<tr class="text-center"><td><input type="checkbox" id="partner'+i+'"></td>'
								  +'<td id="partnerId'+data[i].PARTNER_ID+'">'+data[i].PARTNER_ID+'</td>'
		                          +'<td>'+Base64.decode(data[i].USER_EMAIL)+'</td>'
		                          +'<td name="document">'+business_license+'    '+seal_certification+'    '+internet_business_license+'    '+'</td>'
		                          +'<td>'+userCode+'</td>'
		                          +'<td>'+data[i].REG_DATE+'</td></tr>');
    	  }
//전체선택(체크박스) 아래 각 유저당 선택 function
$("input[id*=partner]").change(function () {
	$(this).parent().parent().children().children().prop('checked', $(this).prop("checked"));
});

//신청중 클릭 : 신청중 -> 처리완료(파트너유저로 전환됨)
$('button[id*=apply_]').on('click',function(){
	var checkboxs = $(this).parent().parent().children('td[name="document"]').children();
	var partnerId = $(this).parent().parent().children('td[id*="partnerId"]').attr('id');
	var json = {partnerId:partnerId.split('partnerId')[1]}; //파트너 아이디 보냄.
	console.log(json);
	
	var count = 0;
	checkboxs.each(function(){
		if($(this).is(':checked') == true){
			count ++;
		}				})
	if(count == 3){
		if(confirm("신청완료처리 하시겠습니까?")){
			$.ajax({
				url:'/user/success_application',
				data : json,
				success:function(){
				}
			})
		}else{
	
		}
	}else{
		alert('서류를 확인해주세요.');
			}
		})
	  }
});

//체크박스 전체 체크 function
$("#checkAll").change(function () {
	$("input:checkbox").prop('checked', $(this).prop("checked"));
});

//파트너 관리
$.ajax({
	url : '/user/manage_partner',
	success : function(data){
		for(i in data){
			 $('#admin_tb_2').append('<tr class="text-center"><td><input type="checkbox" id="partner'+i+'"></td>'
					  +'<td id="partnerId'+data[i].PARTNER_ID+'">'+data[i].PARTNER_ID+'</td>'
	                  +'<td>'+Base64.decode(data[i].USER_EMAIL)+'</td>'
	                  +'<td></td>'
	                  +'<td>'+data[i].REG_DATE+'</td></tr>');
			}
		}
})


//부트스트랩 관련 js
$("div.bhoechie-tab-menu>div.list-group>a").click(function(e) {
	e.preventDefault();
	$(this).siblings('a.active').removeClass("active");
	$(this).addClass("active");
	var index = $(this).index();
	$("div.bhoechie-tab>div.bhoechie-tab-content").removeClass("active");
	$("div.bhoechie-tab>div.bhoechie-tab-content").eq(index).addClass("active");
	});
});

