// Initialize your app
var myApp = new Framework7({
    animateNavBackIcon: true,
    // Enable templates auto precompilation
    precompileTemplates: true,
    // Enabled pages rendering using Template7
	swipeBackPage: false,
	swipeBackPageThreshold: 1,
	swipePanel: "left",
	swipePanelCloseOpposite: true,
	pushState: true,
    template7Pages: true
});


// Export selectors engine
var $$ = Dom7;

// Add main View
var mainView = myApp.addView('.view-main', {
    // Enable dynamic Navbar
    dynamicNavbar: false
});


myApp.onPageInit('agendar', function (page) {
	
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
		
		if ($('#cmbFilial').val() != 1) {
			event.preventDefault();
			myApp.alert('Selecione a unidade Maria Gata onde quer ser atendida.', 'Maria Gata');
			return false;
		}
		if ($('#data_agendamento').val() == "") {
			event.preventDefault();
			myApp.alert('Escolha a data do agendamento.', 'Maria Gata');
			return false;			
		}
		if ($('#cmbListaServicos').val() == null) {
			event.preventDefault();
			myApp.alert('Nenhum pacote ou serviço selecionado.', 'Maria Gata');
			return false;			
		}
		
		//Aciona a página de horários e profissionais
		mainView.router.loadPage("horarios.html?filial=" + $('#cmbFilial').val() + "&data=" + $('#data_agendamento').val() + "&servicos=" + $('#cmbListaServicos').val());
		
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

myApp.onPageInit('horarios', function (page) {
	
	console.log('parametros horarios: ' + page.query.filial + " - " + page.query.data + " - " + page.query.servicos);
		
	//Obter servicos filial
	$.ajax({
		url: "http://mariagata.com.br/sistema/mariagata.php",
		type: 'POST',
		data: {
			a: 'obterprofissionaishorarios',
			filial: page.query.filial,
			data: page.query.data,
			servicos: page.query.servicos
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
			
			//console.log('totalItens: ' + totalItens);
			//return false;
			
			//adiciona os serviços e pacotes
			$.each(jsonRetorno, function( index, value ) {
				//myApp.alert('ok com o retorno!!', 'Maria Gata');
				//{"FUNC_ID":"1","FUNC_Nome":"Tati","FUHB_Horario":"09:00:00","FUHB_HorarioBloqueado":"N","GSER_ID":"1"}
				//console.log("valor " + index + ": " + value.FUHB_Horario);
				
				//lsHTML = "";
				
				//Obtem e seta a div correspondente ao grupo
				if (value.GSER_ID == 1) {
					var divGrupo = $('#cardEsmalteria');
				} else {
					var divGrupo = $('#cardEscovaria');
				}
				
				//Insere cabeçalho do grupo:
				if (ultimoGrupo != value.GSER_ID) {					
					if (value.GSER_ID == "1") {
						lsHTML += "<div class='content-block-title'>ESMALTERIA: Escolha profissional e horário</div>";
					} else {
						lsHTML += "<div class='content-block-title'>ESCOVARIA: Escolha profissional e horário</div>";
					}
				}			
				
				//Se novo funcionário
				if (ultimoFuncionario != value.FUNC_ID) {
					lsHTML += "<div class='card facebook-card'>";
					lsHTML += "<div class='card-header'>";
					lsHTML += "<div class='facebook-avatar'><img src='images/funcionarios/juliana.png' width='40' height='40'></div>";
					lsHTML += "<div class='facebook-name'>" + value.FUNC_Nome + "</div>";
					lsHTML += "<div class='facebook-date'>Manicure e Art Designer</div>";
					lsHTML += "</div>";
					lsHTML += "<div class='card-content'>";
					lsHTML += "<div class='card-content-inner'>";
					lsHTML += "<p class='buttons-row theme-pink'>";
					if (value.FUHB_HorarioBloqueado == "N") {
						lsHTML += "<a href='#' class='button'>" + value.FUHB_Horario + "</a>";
					} else {
						lsHTML += "<a href='#' class='button' disabled>" + value.FUHB_Horario + "</a>";
					}
				} else {
					//Se o mesmo funcionário, insere apenas um horário novo
					if (value.FUHB_HorarioBloqueado == "N") {
						lsHTML += "<a href='#' class='button'>" + value.FUHB_Horario + "</a>";
					} else {
						lsHTML += "<a href='#' class='button' disabled>" + value.FUHB_Horario + "</a>";
					}					
				}
				
				if (index == totalItens - 1) {
					//Final itens
					lsHTML += "</p>";	
					lsHTML += "</div>";
					lsHTML += "</div>";	  
					lsHTML += "</div>";
				}
				
				
				//divGrupo.append(lsHTML);
				
				ultimoGrupo = value.GSER_ID;
				ultimoFuncionario = value.FUNC_ID;
				
			});
			console.log("lsHTML: " + lsHTML);
			divGrupo.append(lsHTML);
			
		} else {			
			if (jsonRetorno.resultado == 'NAOENCONTRADO') {			
				myApp.alert(jsonRetorno.mensagem, 'Maria Gata');				
			} else {
				myApp.alert(jsonRetorno.mensagem, 'Maria Gata');
			}
		}	
	});
	
});


$$(document).on('pageInit', function (e) {
	
		console.log('pageInit');
		
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
	*/
	
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
	
		
		
})
