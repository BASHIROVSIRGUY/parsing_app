
function fix_click_del (i){
	$('#del_btn'+i).on('click', function(){
		if($('.div_inpt').length >= 2){
			$('#inpt'+i).hide('slow',
				function(){
					$('#inpt'+i).remove();
				});
		}
	});	
}

function add_inpt (num){
	$(".div_inpt").last().after(
		`<div id = "inpt${num}" class = "div_inpt" style = "display: none;">
        <input id = "name_col${num}" required type="text" class = "db_teg" style = "width: 80px;"/>
        <input id = "inpt_cell${num}" class="input_key_cell" required type="text"/>
        <select id = "select_attr${num}">
           <option value = "text">текст</option>
           <option value = "attr(href)">ссылка</option>
        </select>
        <button type = "reset" id = "del_btn${num}" class="c-button del" style="height:26px;">🗑</button>
        <br/>
        </div>`
        );
	$('#inpt'+num).slideDown("slow");
}

function processing(){
	var inpt_data = {};
	if ($('#chbox').is(':checked')){
		inpt_data['host'] =  $('#inpt_db_host').val();
		inpt_data['username'] =  $('#inpt_db_username').val();
		inpt_data['password'] =  $('#inpt_db_password').val();
		inpt_data['db_name'] =  $('#inpt_db_name').val();
	}
	inpt_data['url'] = $('#input_url_site').val();
	inpt_data['key_to_arr'] = $('#input_key_arr').val();
	inpt_data['names_col'] = [];
	inpt_data['paths_elem'] = [];
	inpt_data['purpose'] =[];
	$(".div_inpt").each(function(i){
		inpt_data['names_col'][i] = $(this).children('.db_teg').val();
		inpt_data['paths_elem'][i] = $(this).children('.input_key_cell').val();
		inpt_data['purpose'][i] = $(this).children('select').val();
	});
   return inpt_data;
}




function load_disp() {
	if ($("#preloader").attr('class') == "visible") {
		$("#preloader").removeClass("visible");		
		$("#preloader").addClass("non_visible");
	} else {
		$("#preloader").removeClass("non_visible");		
		$("#preloader").addClass("visible");
	}		
}

$('document').ready(function(){


	$(".c-button.del").each(function(i) {
			fix_click_del(i+1);
  	});


	$(".c-button.up").on('click', function(){
		let num = $('.div_inpt').length+1;
		add_inpt(num);
		fix_click_del (num);
	});	
	

	$('#parseon').on('click', function(){

		load_disp();
		let JSONdata = processing();
		console.log(JSONdata);
		$('#div-site').remove();
		$.ajax({
			type: "POST", 
			url: "./scripts/parse.php", 
			data: JSONdata,
			dataType: "json"
		})
			.done(function(data) {
				table_data = data['table_data'];
				var table =`<style> 
								#scrolltable {text-align: center; margin-top: 20px; height: 400px; overflow: auto; font-family: cursive;}
								#scrolltable table { border-collapse: separate; border-spacing: 5px; margin: 3px; background: #f2fff5;}
								#scrolltable tbody tr:nth-child(3n+1){background: #ffeaea ;}
								#scrolltable tbody tr:nth-child(3n+2){background: #eeecff;}
								#scrolltable tbody tr:nth-child(3n+3){background: #CFFAF1;}
								#scrolltable th div {position: absolute; margin-top: -27px; margin-right: -50%; color: #3258E3; font-size: 16px;}
								::-webkit-scrollbar {width: 6px;} 
								::-webkit-scrollbar-track {box-shadow: inset 0 0 6px rgba(0,0,0,0.3);} 
								::-webkit-scrollbar-thumb {box-shadow: inset 0 0 6px rgba(0,0,0,0.3);} 
								</style>`;
				table += '<div id="scrolltable"> <table> <thead> <tr>';
				for (let name_db in table_data[0]) {
					table += '<th><div>';
					table += name_db;
					table += '</div></th>';
				}
				table += '</tr> </thead> <tbody>';
				table_data.forEach(function(row){
					table += '<tr>';
					for (let name_db in row){
						table += '<td>';
						table += row[name_db];
						table += '</td>';
					}	
					table += '</tr>';
				});
				table += '</tbody> </table> </div>';
				$('body').append(table);
				console.log(data['message']);
				$('body').append(`<p align="center" style = "font-family: cursive; color: #3258E3;">${data['message']}<p/>`);
				return 0;   
		   })

		   .fail(function(error) {
		   	$('body').append( `<style> 
			    							.outer{
											    top: 0; 
											    left: 0; 
											    width: 100%; 
											    height: 100%; 
											    position: fixed;
													 text-align: center;
													 background-image: url("./img/err.jpg")
											}
											.inner{
										   	 margin: 30px;
										   	 padding: 30px;
										   	 width: 50%; 
										   	 height: 400px; 
										   	 position: static;
											    vertical-align: middle;
											    background-color: #FF7878;
											    color: #3258E3;
											    font-size: 16px;
											    font-family: cursive;
												 display: inline-block;
												 border-top-left-radius: 100% 20px;
												 border-bottom-right-radius: 100% 20px;
												 overflow: scroll;
											}
												 ::-webkit-scrollbar {width: 6px;} 
												 ::-webkit-scrollbar-track {box-shadow: inset 0 0 6px rgba(0,0,0,0.3);} 
												 ::-webkit-scrollbar-thumb {box-shadow: inset 0 0 6px rgba(0,0,0,0.3);}
										  </style> 

									     <div class = "outer"> 
											 <div class = "inner"> 
												 Что то пошло не так... <br/>
			    								 ${error.responseText}
			    	 						 </div>
			    	 					   </div>` );
			    console.log(error);
			    return 0;
		   })
		   .always(function() {
            load_disp();
         	return 0;
		   });
	});


});