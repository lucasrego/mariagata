// Initialize your app
var myApp = new Framework7({
    animateNavBackIcon: true,
    // Enable templates auto precompilation
    precompileTemplates: true,
    // Enabled pages rendering using Template7
	swipeBackPage: false,
	swipeBackPageThreshold: 1,
	swipePanel: "left",
	sortable: false,
	swipePanelCloseOpposite: true,
	pushState: false,
    template7Pages: true,
	modalTitle: 'Maria Gata',
	modalButtonOk: 'Ok',
	modalButtonCancel: 'Cancelar',
	//smartSelectSearchbar: true,
	//smartSelectInPopup: true,
	hideTabbarOnPageScroll: true
});


// Export selectors engine
var $$ = Dom7;

// Add main View
var mainView = myApp.addView('.view-main', {
    // Enable dynamic Navbar
    dynamicNavbar: false
});


myApp.onPageInit('agendar', function (page) {
	
	//console.log("onPageInit agendar");
	
	//Obter servicos filial
	$.ajax({
		url: "http://mariagata.com.br/sistema/mariagata.php",
		type: 'POST',
		data: {
			a: 'obterservicosfilial',
			filial: '1'
		},
		beforeSend: function( xhr ) {
			myApp.showPreloader('Obtendo serviços...');
			//Se precisar alterar xhr: xhr.overrideMimeType( "text/plain; charset=x-user-defined" );
		},
		context: document.body
		
	})
	.always(function() {		
		myApp.hidePreloader(); 			
	})
	.fail(function(jqXHR, textStatus, errorThrown) {
		myApp.alert('Desculpe! Ocorreu um erro inesperado. Por favor, feche e abra novamente o APP ou entre em contato pelo Whatsapp Maria Gata: 71 8879-1014.', 'Maria Gata');
	})
	.done(function(ret) {
		
		//Teste se o objeto retornao é JSON, ou seja, existem dados
		var jsonRetorno = jQuery.parseJSON(ret);
		
		//Se o JSON não tiver a opção resultado é porque 1 ou mais condomínios foram retornados
		if (typeof jsonRetorno.resultado === "undefined") {
		
			//adiciona os serviços e pacotes
			$.each(jsonRetorno, function( index, value ) {
				if (value.SERV_Tipo == "PA") {
					$("#cmbListaServicosPacotes").append('<option value=' + value.SERV_ID + '>' + value.SERV_Nome + '</option>');
				}
				if (value.SERV_Tipo == "EC") {
					$("#cmbListaServicosEscovaria").append('<option value=' + value.SERV_ID + '>' + value.SERV_Nome + '</option>');
				}
				if (value.SERV_Tipo == "EM") {
					$("#cmbListaServicosEsmalteria").append('<option value=' + value.SERV_ID + '>' + value.SERV_Nome + '</option>');
				}
				
			});
		} else {			
			if (jsonRetorno.resultado == 'NAOENCONTRADO') {			
				myApp.alert(jsonRetorno.mensagem, 'Maria Gata');				
			} else {
				myApp.alert(jsonRetorno.mensagem, 'Maria Gata');
			}			
		}	
	});
	
	//Evento de clique no botão de pesquisar horários
	$('#btnVerHorarios').click(function () {
		
		var filial = $('#cmbFilial').val();
		var data = $('#data_agendamento').val();
		var servicos = $('#cmbListaServicos').val().toString();
		
		if (filial != 1) {
			event.preventDefault();
			myApp.alert('Selecione a unidade Maria Gata onde quer ser atendida.', 'Maria Gata');
			return false;
		}
		if (data == "") {
			event.preventDefault();
			myApp.alert('Escolha a data do agendamento.', 'Maria Gata');
			return false;			
		}
		if (servicos == null) {
			event.preventDefault();
			myApp.alert('Nenhum pacote ou serviço selecionado.', 'Maria Gata');
			return false;			
		}
		
		//Aciona a página de horários e profissionais
		//mainView.router.loadPage("horarios.html?filial=" + $('#cmbFilial').val() + "&data=" + $('#data_agendamento').val() + "&servicos=" + $('#cmbListaServicos').val());
		
		//Consultar disponibilidade de profissionais e os horário livres
		$.ajax({
			url: "http://mariagata.com.br/sistema/mariagata.php",
			type: 'POST',
			data: {
				a: 'obterprofissionaishorarios',
				filial: filial,
				data: data,
				servicos: servicos
			},
			beforeSend: function( xhr ) {
				myApp.showPreloader('Consultando disponibilidade dos profissionais...');
				//Se precisar alterar xhr: xhr.overrideMimeType( "text/plain; charset=x-user-defined" );
			},
			context: document.body
			
		})
		.always(function() {		
			myApp.hidePreloader(); 			
		})
		.fail(function(jqXHR, textStatus, errorThrown) {
			myApp.alert('Desculpe! Ocorreu um erro inesperado. Por favor, feche e abra novamente o APP ou entre em contato pelo Whatsapp Maria Gata: 71 8879-1014.', 'Maria Gata');
		})
		.done(function(ret) {
			
			//Teste se o objeto retornao é JSON, ou seja, existem dados
			var jsonRetorno = jQuery.parseJSON(ret);
			
			//Se o JSON não tiver a opção resultado é porque 1 ou mais condomínios foram retornados
			if (typeof jsonRetorno.resultado === "undefined") {
				
				var ultimoGrupo = "";
				var ultimoFuncionario = "";
				var totalItens = jsonRetorno.length;
				var lsHTML = "";
				var classeBotao = "";
				var divGrupo = "";
				var qtdHorariosProfissional = 0;
				
				//console.log('totalItens: ' + totalItens);
				
				var newPageHorarios = 	'<div class="pages">' +
											'<div data-page="horarios" class="page">' +
												'<div class="page-content">' +
													'<h2 class="page_title">Profissionais e Horários</h2>';

				$.each(jsonRetorno, function( index, value ) {
					//{"FUNC_ID":"1","FUNC_Nome":"Tati","FUHB_Horario":"09:00:00","FUHB_HorarioBloqueado":"N","GSER_ID":"1",", FUNC_Especialidade":"Manicure e Art Designer"}
					
					//Obtem e seta a div correspondente ao grupo
					if (value.GSER_ID == 1) {
						divGrupo = $('#cardEsmalteria');
						classeBotao = "btnEsmalteria";
					} else {
						divGrupo = $('#cardEscovaria');
						classeBotao = "btnEscovaria";
					}
					
					//Se novo funcionário
					//vazio - 2, 2-2..., 2-1, 1-1, 1-3, 3-3...
					if (ultimoFuncionario != value.FUNC_ID) {
						
						qtdHorariosProfissional = 1;
						
						if (index != 0) {
							//Se não for o primeiro registro, fecha o anterior
							//newPageHorarios += "</p>";
							
							//Os botões serão agrupados 4 por linha (25%). A cada múltiplo de 4, fecha e reabre a DIV class='row'
							//if ((index == 0)||(index == 4)||(index == 8)||(index == 12)||(index == 16)||(index == 20)||(index == 24)||(index == 28)||(index == 32)) {
							if ((qtdHorariosProfissional == 1)||(qtdHorariosProfissional == 5)||(qtdHorariosProfissional == 9)||(qtdHorariosProfissional == 13)||(qtdHorariosProfissional == 17)||(qtdHorariosProfissional == 21)||(qtdHorariosProfissional == 25)||(qtdHorariosProfissional == 29)||(qtdHorariosProfissional == 33)) {
								newPageHorarios += "</div>";
							}
							newPageHorarios += "</div>";
							newPageHorarios += "</div>";	  
							newPageHorarios += "</div>";
							//newPageHorarios += "</div>";
						}
						
						//Se mudou de grupo, insere cabeçalho do grupo:
						if (ultimoGrupo != value.GSER_ID) {					
							if (value.GSER_ID == "1") {
								newPageHorarios += "<div class='content-block-title'>ESMALTERIA: Escolha profissional e horário</div>";								
							} else {
								newPageHorarios += "<div class='content-block-title'>ESCOVARIA: Escolha profissional e horário</div>";								
							}
						}	
						
						//Abre o novo card e registra o 1º horário
						newPageHorarios += "<div class='card facebook-card'>";
						newPageHorarios += "<div class='card-header'>";
						newPageHorarios += "<div class='facebook-avatar'><img src='images/funcionarios/juliana.png' width='40' height='40'></div>";
						newPageHorarios += "<div class='facebook-name'><b>" + value.FUNC_Nome + "</b></div>";
						newPageHorarios += "<div class='facebook-date'>" + value.FUNC_Especialidade + "</div>";
						newPageHorarios += "</div>";
						newPageHorarios += "<div class='card-content'>";
						newPageHorarios += "<div class='card-content-inner'>";
						//newPageHorarios += "<p class='buttons-row theme-pink'>";
						
						//Os botões serão agrupados 4 por linha (25%). A cada múltiplo de 4, fecha e reabre a DIV class='row'							
						if ((qtdHorariosProfissional == 1)||(qtdHorariosProfissional == 5)||(qtdHorariosProfissional == 9)||(qtdHorariosProfissional == 13)||(qtdHorariosProfissional == 17)||(qtdHorariosProfissional == 21)||(qtdHorariosProfissional == 25)||(qtdHorariosProfissional == 29)||(qtdHorariosProfissional == 33)) {
							newPageHorarios += "<div class='row'>";
						}
						
						if (value.FUHB_HorarioBloqueado == "N") {
							newPageHorarios += "<div class='col-25'><a href='#' class='button btnHorario " + classeBotao + "'>" + value.FUHB_Horario + "</a></div>";
						} else {
							newPageHorarios += "<div class='col-25'><a href='#' class='button btnHorario " + classeBotao + "' disabled>" + value.FUHB_Horario + "</a></div>";
						}
					} else {
						
						qtdHorariosProfissional = qtdHorariosProfissional + 1;
						
						
						//Se o mesmo funcionário, insere apenas um horário novo
						if (value.FUHB_HorarioBloqueado == "N") {
							newPageHorarios += "<div class='col-25'><a href='#' class='button btnHorario " + classeBotao + "'>" + value.FUHB_Horario + "</a></div>";
						} else {
							newPageHorarios += "<div class='col-25'><a href='#' class='button btnHorario " + classeBotao + "' disabled>" + value.FUHB_Horario + "</a></div>";
						}					
					}
					
					if (index == totalItens - 1) {
						//Final itens
						//newPageHorarios += "</p>";
						
						//Os botões serão agrupados 4 por linha (25%). A cada múltiplo de 4, fecha e reabre a DIV class='row'							
						if ((qtdHorariosProfissional == 1)||(qtdHorariosProfissional == 5)||(qtdHorariosProfissional == 9)||(qtdHorariosProfissional == 13)||(qtdHorariosProfissional == 17)||(qtdHorariosProfissional == 21)||(qtdHorariosProfissional == 25)||(qtdHorariosProfissional == 29)||(qtdHorariosProfissional == 33)) {
							newPageHorarios += "</div>";
						}
						newPageHorarios += "</div>";
						newPageHorarios += "</div>";	  
						newPageHorarios += "</div>";
					}
					
					//divGrupo.append(lsHTML);
					
					ultimoGrupo = value.GSER_ID;
					ultimoFuncionario = value.FUNC_ID;
					
				});
				
				newPageHorarios += 	'<div class="content-block">' +
										'<div class="row">' +
											  '<div class="col-50">' +
												'<a href="agendar.html" class="button button-fill color-red button-round">Voltar</a>' +
											  '</div>' +
											  '<div class="col-50">' +
												'<a href="#" id="btnConcluirAgendamento" class="button button-fill color-green button-round">Agendar</a>' +
											  '</div>' +
											'</div>' +										
										'</div>' +
									'</div>' +
								'</div>' +
							'</div>';

				mainView.router.load({
					content: newPageHorarios,
					animatePages: false
				});
								
				//console.log("html Pagina: " + newPageHorarios);
				
			} else {			
				if (jsonRetorno.resultado == 'NAOENCONTRADO') {			
					myApp.alert(jsonRetorno.mensagem, 'Maria Gata');				
				} else {
					myApp.alert(jsonRetorno.mensagem, 'Maria Gata');
				}
			}	
		});
				
	});
	
	
	$$(document).on('click', '#btnConcluirAgendamento', function () {
		//Se já tiver os dados de login e cadastro no BD, conclui o agendamento. Caso contrário, abre popup de login/cadastro.
	   myApp.popup('.popup-login');
	});
		
	
	//Seta a data de hoje no campo Data
	//var data_hoje = new Date();
	//mes = ("0" + (data_hoje.getMonth() + 1)).slice(-2)
	//data_hoje = data_hoje.getFullYear().toString() + "-" + mes.toString() + "-" + data_hoje.getDate().toString();
	//$$("#data_agendamento").val(data_hoje);
	
	//Preencher próximas datas disponíveis
	//for (i = 0; i < 15; i++) {
	//	var d = new Date();
	//	d.setDate( d.getDate() + i );
	//	var dias = ["Domingo","Segunda","Terça","Quarta","Quinta","Sexta","Sábado"];
	//	dia = d.getDay(); //0=dom, 1=seg, 2=ter, 3=qua, 4=qui, 5=sex, 6=sab
	//	nome_dia = dias[dia];
	//	mes = d.getMonth() + 1;
	//	data_id = d.getFullYear() + "/" + mes + "/" + d.getDate();
	//	data_exibicao = d.getDate() + "/" + mes + "/" + d.getFullYear() + " (" + nome_dia + ")";
		
		//Não exibe segunda e domingo
	//	if ((dia != 0)&&((dia != 1))) {
	//		$('#agendamento_data').append('<option value=' + data_id + '>' + data_exibicao + '</option>');
	//	}
	//}
	
});

$$(document).on('pageInit', function (e) {
	
		//console.log('pageInit generico');
		
		/*
  		//$(".swipebox").swipebox();
		//$(".videocontainer").fitVids();
		
		//$("#ContactForm").validate({
		//	submitHandler: function(form) {
		//		ajaxContact(form);
		//		return false;
		//	}
		//});
		
		
		$(".posts li").hide();	
		size_li = $(".posts li").size();
		x=4;
		$('.posts li:lt('+x+')').show();
		$('#loadMore').click(function () {
			x= (x+1 <= size_li) ? x+1 : size_li;
			$('.posts li:lt('+x+')').show();
			if(x == size_li){
				$('#loadMore').hide();
				$('#showLess').show();
			}
		});
        */
	
	/*
	$("a.switcher").bind("click", function(e){
		e.preventDefault();
		
		var theid = $(this).attr("id");
		var theproducts = $("ul#photoslist");
		var classNames = $(this).attr('class').split(' ');
		
		
		if($(this).hasClass("active")) {
			// if currently clicked button has the active class
			// then we do nothing!
			return false;
		} else {.
			// otherwise we are clicking on the inactive button
			// and in the process of switching views!

  			if(theid == "view13") {
				$(this).addClass("active");
				$("#view11").removeClass("active");
				$("#view11").children("img").attr("src","images/switch_11.png");
				
				$("#view12").removeClass("active");
				$("#view12").children("img").attr("src","images/switch_12.png");
			
				var theimg = $(this).children("img");
				theimg.attr("src","images/switch_13_active.png");
			
				// remove the list class and change to grid
				theproducts.removeClass("photo_gallery_11");
				theproducts.removeClass("photo_gallery_12");
				theproducts.addClass("photo_gallery_13");

			}
			
			else if(theid == "view12") {
				$(this).addClass("active");
				$("#view11").removeClass("active");
				$("#view11").children("img").attr("src","images/switch_11.png");
				
				$("#view13").removeClass("active");
				$("#view13").children("img").attr("src","images/switch_13.png");
			
				var theimg = $(this).children("img");
				theimg.attr("src","images/switch_12_active.png");
			
				// remove the list class and change to grid
				theproducts.removeClass("photo_gallery_11");
				theproducts.removeClass("photo_gallery_13");
				theproducts.addClass("photo_gallery_12");

			} 
			else if(theid == "view11") {
				$("#view12").removeClass("active");
				$("#view12").children("img").attr("src","images/switch_12.png");
				
				$("#view13").removeClass("active");
				$("#view13").children("img").attr("src","images/switch_13.png");
			
				var theimg = $(this).children("img");
				theimg.attr("src","images/switch_11_active.png");
			
				// remove the list class and change to grid
				theproducts.removeClass("photo_gallery_12");
				theproducts.removeClass("photo_gallery_13");
				theproducts.addClass("photo_gallery_11");

			} 
			
		}

	});	
	
	
	document.addEventListener('touchmove', function(event) {
	   if(event.target.parentNode.className.indexOf('navbarpages') != -1 || event.target.className.indexOf('navbarpages') != -1 ) {
		event.preventDefault(); }
	}, false);
	
	// Add ScrollFix
	var scrollingContent = document.getElementById("pages_maincontent");
	new ScrollFix(scrollingContent);
	
	
	var ScrollFix = function(elem) {
		// Variables to track inputs
		var startY = startTopScroll = deltaY = undefined,
	
		elem = elem || elem.querySelector(elem);
	
		// If there is no element, then do nothing	
		if(!elem)
			return;
	
		// Handle the start of interactions
		elem.addEventListener('touchstart', function(event){
			startY = event.touches[0].pageY;
			startTopScroll = elem.scrollTop;
	
			if(startTopScroll <= 0)
				elem.scrollTop = 1;
	
			if(startTopScroll + elem.offsetHeight >= elem.scrollHeight)
				elem.scrollTop = elem.scrollHeight - elem.offsetHeight - 1;
		}, false);
	};
	
		*/
		
})
