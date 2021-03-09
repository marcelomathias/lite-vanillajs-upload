var ultimoId = 0;
var hostSHOWCASE = "https://www.longocaminho.com.br";
//var hostSHOWCASE = "http://localhost";

function criouElemento() {
    if (document.querySelector("body")!=null) {

        if (document.querySelector("#showcase")==null) {
            var myDiv = document.createElement("div");
            myDiv.id = "showcase";
            myDiv.innerHTML = "<BR><BR>Sent Files (they're in the server):<BR><DIV><TABLE border=1 style='border-collapse: collapse'><THEAD><TH>Path</TH><TH>File name</TH><TH>Preview</TH></THEAD><TBODY id='FDBK'></TBODY></TABLE></DIV>";
            document.querySelector("body").appendChild(myDiv);
        }

    }
}
window.setInterval(checarArquivos, 7000);
window.setTimeout(criouElemento, 200);


function checarArquivos() {

    if (criouElemento()) return;

        if (uploadController.multipartPostURL.indexOf(hostSHOWCASE) == -1) return;





		var xhr = new XMLHttpRequest();

		xhr.open('GET', hostSHOWCASE+"/upload/api/filesystem/listaarquivos?ultimoId="+ultimoId);

		xhr.onerror = function() {

            
		};
		
		xhr.onload = function() {
			// if (xhr.status === 200 && xhr.responseText !== newName) {
			// 	alert('Something went wrong.  Name is now ' + xhr.responseText);
			// }
			if (xhr.status !== 200) {
                
			} else {

				var data = JSON.parse(xhr.responseText);

                for (var i=0; i<data.length; i++) {

                    var img = "<img src='data:image/png;base64, "+data[i].ConteudoBase64+"'>";
                    var esteTr = document.createElement("tr");
                    esteTr.innerHTML = 
                        "<TD>" + data[i].DiretorioArquivo + "</TD><TD>" + data[i].NomeArquivo + "</TD><TD id='FDBKIMG" + data[i].id + "'>"+ img +"</TD>";
                    document.querySelector("#FDBK").prepend(
                        esteTr
                    );

                    if (data[i].id > ultimoId) {
                        ultimoId=data[i].id
                    }

                    var ow = document.querySelector("#FDBKIMG"+data[i].id+" IMG").offsetWidth;
                    var oh = document.querySelector("#FDBKIMG"+data[i].id+" IMG").offsetHeight;

                    document.querySelector("#FDBKIMG"+data[i].id+" IMG").style.width=120;
                    document.querySelector("#FDBKIMG"+data[i].id+" IMG").style.height= 120 / ow * oh;

                }

			}
        };

		try {
			xhr.send(null);
		} catch (e) {
            
		}



}