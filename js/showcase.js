var ultimoId = 0;

function feedbackDoClone() {

    
    $(document.body).append("<BR><BR>Arquivos Enviados:<BR><DIV><TABLE border=1 style='border-collapse: collapse'><THEAD><TH>Caminho</TH><TH>Nome</TH><TH>Preview</TH></THEAD><TBODY id='FDBK'></TBODY></TABLE></DIV>");
    window.setInterval(checarArquivos, 5000);


}

function checarArquivos() {

        if (jQuery(".endpointRestUrl").val().indexOf("3.129.238.124:8080") == -1) return;

		jQuery.ajax({
            url: "http://3.129.238.124:8080/api/filesystem/listaarquivos?ultimoId="+ultimoId,
            type: "GET",
			contentType: "application/json; charset=utf-8",
			crossDomain: true,
			dataType: "json",

            
			success: function(data, status,jqXHR) {

                for (var i=0; i<data.length; i++) {

                    var img = "<img src='data:image/png;base64, "+data[i].ConteudoBase64+"'>";
                    $("#FDBK").prepend(
                        "<TR><TD>" + data[i].DiretorioArquivo + "</TD><TD>" + data[i].NomeArquivo + "</TD><TD id='FDBKIMG" + data[i].id + "'>"+ img +"</TD></TR>"
                    );

                    if (data[i].id > ultimoId) {
                        ultimoId=data[i].id
                    }

                    var ow = $("#FDBKIMG"+data[i].id+" IMG")[0].offsetWidth;
                    var oh = $("#FDBKIMG"+data[i].id+" IMG")[0].offsetHeight;

                    $("#FDBKIMG"+data[i].id+" IMG").css("width", 120);
                    $("#FDBKIMG"+data[i].id+" IMG").css("height", 120 / ow * oh);

                }
                
			},
			error: function (jqXHR, status) {
                
			}
		});

}