function UploadFotoFileController() {

	var isIELegacy = !document.addEventListener;
	
	if (isIELegacy) {
		alert('Navegador nao compativel para upload. Favor utilizar o Google Chrome, ou Internet Explorer 9 ou superior, ou Microsoft Edge.');
		return;
	}
	
	this.maxConvertedSize = 110*1024;
	this.maxFileSize = 10;

	this.allowedFileExtensions = "";
	this.maxFiles = "";
	this.numeradorArqs=1;
	this.totalArqsEnviados=0;
	this.filaUpload=0;
	
	this.fotosUpload=[];
	this.arquivosEnviados=[];
	
	this.init = function() {
		
		var emitirErro = function(mensagem){
			var idComp = '#errorQueue_foto_alert';
			document.querySelector(idComp).html( mensagem  );
			Richfaces.showModalPanel('modalFotos_alert');	    				
		}
		

		this.container.innerHTML="";
		
		//Inclusao de parametro "token" para utilizacao do webservice FileService - F0122886 - DAYANE MOREIRA
		
		var element = document.createElement("input");
		element.title="Procurar";
		element.type="file";
		element.multiple="multiple";
		element.accept=this.allowedFileExtensions;
		element.controller = this;
		element.style.display="none"
		element.addEventListener('change', function(e) {this.controller.handleFileSelect(e);}, false);

		
		this.container.appendChild(element);
		
		this.searchButton = element;
		
		if (!this.uploadButton) {
			this.uploadButton = document.createElement("input");
			this.uploadButton.type="button";
			this.uploadButton.value="Procurar";
			this.container.appendChild(this.uploadButton);
		}
		this.uploadButton.searchButton = element;
		this.uploadButton.onclick=function(){ this.searchButton.click() };
		
		this.thumbs = document.createElement("DIV");
		this.thumbs.className="uploadthumbscontainer";
		//this.thumbs.innerHTML="<div class=\"uploadthumbsinnercontainer\"/>";
		this.container.appendChild(this.thumbs);
		
		if (!this.statusUpload) {
			this.statusUpload = document.createElement("DIV");
			this.container.appendChild(this.statusUpload);
		}
		
		if (!this.fnEmitirErro) {
			this.fnEmitirErro = function(err) { alert(err); };
		}
		
	};


	this.updateStatusUpload = function() {
	
		if (this.statusUpload) {
		
			if (this.filaUpload==0) {
				this.statusUpload.innerHTML = "";
				this.uploadButton.disabled="";
			} else {
				if (this.filaUpload==1) {
					this.statusUpload.innerHTML = "Carregando 1 arquivo ...";
				} else {
					this.statusUpload.innerHTML = "Carregando " + this.filaUpload + " arquivos ...";
				}
				this.uploadButton.disabled="disabled";
			}
			
			if (this.totalArqsEnviados >= this.maxFiles) {
				this.statusUpload.innerHTML = "Quantidade maxima enviada " + this.maxFiles;
				this.uploadButton.disabled="disabled";
			}
		}
		if (this.fnUpdateStatus) {
			this.fnUpdateStatus(this);
		}
	}
	
	
	this.saveFileUploadManagedBean = function() {};
	
	this.handleFileSelect = function(evt) {
		
		var allowedFileExtensionsArray = formataTiposPermitidos(this.allowedFileExtensions);
		var tamanhoMaximoPermitido = this.tamanhoPermitidoUpload;
	
		// FileList object
		var files = evt.target.files;

		if (files.length > -1) {
			
			var i = 0;
			var qtdeArquivos = 0;
			
			// reset 
			this.fotosUpload = [];

			var totalArqTela = this.searchButton.files.length + this.totalArqsEnviados;
			
			if (totalArqTela > this.maxFiles) {
				this.fnEmitirErro("Voce adicionou muitos arquivos na fila.\n Sao permitidos ate " + (this.maxFiles-this.totalArqsEnviados) + " arquivos.");
				return;
			}

			var erros = "";


			while (i < this.searchButton.files.length){
				
				var fileUploaded = files[i];
				i++;
				
				fileUploaded.id = "html_" + this.numeradorArqs;
				var barraIndex = fileUploaded.name.lastIndexOf(".");
				var typeFile = fileUploaded.name.substring(barraIndex + 1, fileUploaded.name.length).toLowerCase();				

				var arquivo = new Object();
				arquivo.id =   fileUploaded.id
				arquivo.name = fileUploaded.name;
				arquivo.type = typeFile;				

				var fileSize = (parseInt(fileUploaded.size) / 1024);
				fileSize = Math.round(fileSize * 100) / 100;
				
				var tipoPermitido = isTipoPermitido(typeFile, allowedFileExtensionsArray);
				var tamanhoPermitido = isTamanhoPermitido(fileSize, this.maxFileSize);
				
				if (!tipoPermitido){
					erros+="Tipo de arquivo invalido: "+fileUploaded.name+"<BR>";
					continue;
				}else if (!tamanhoPermitido){
					erros+="Arquivo muito grande e nao pode ser enviado: "+fileUploaded.name+"<BR>";
					continue;
				} else {
					this.fotosUpload.push(fileUploaded);
					this.numeradorArqs++;
				}
			
			}
		
			if (erros!="" && this.fnEmitirErro) {
				this.fnEmitirErro(erros);
			}
			
			
			if (this.fotosUpload.length>0) {
				this.enviarArquivosFotos();
			}
			
		}
	};


	this.addThumb = function(fileName, base64data) {

		var newThumb = document.createElement("div");
		newThumb.className="thumb";
		newThumb.innerHTML = "<DIV class=\"thumb-name\" alt=\"" + fileName + "\">" + fileName + "</DIV><DIV><img src=\"\"/></DIV>";
		
		this.thumbs.insertBefore(newThumb, this.thumbs.childNodes[0]);
		newThumb.querySelector("IMG").src=base64data;
	}
	


	this.enviarArquivosFotos = function (){
		
		if(this.fotosUpload.length > 0){
			
			for (var i=0; i<this.fotosUpload.length; i++) {
				
				var file = this.fotosUpload[i];
				
				var reader = new FileReader();
				reader.controller = this;
				
				reader.onloadend = (function(f) {
					var fileExtension = f.name.split('.');
					return function(e) {

						if (this.controller.doCompression && f.size > this.controller.maxConvertedSize) {
							this.controller.comprimirJS(e.target.result, 
										f.name.toLowerCase());
						} else {
							this.controller.callMultipartUpload(e.target.result, 
										f.name.toLowerCase());
						}
					};
					
				})(file);

				reader.readAsDataURL(file);	
			}
		}
		
	};
	
	
	
	//upload file to multipart service
	this.callMultipartUpload = function(base64data, nomeArquivo) {
		
		var fileContent = base64data.split(',')[1]
		var fileName = normalizeFileName(nomeArquivo);
		this.filaUpload++;
		this.updateStatusUpload();


		var xhr = new XMLHttpRequest();

		xhr.open('POST', this.multipartPostURL);
//		xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
		xhr.onload = function() {
			// if (xhr.status === 200 && xhr.responseText !== newName) {
			// 	alert('Something went wrong.  Name is now ' + xhr.responseText);
			// }
			if (xhr.status !== 200) {
				this.controller.fnEmitirErro("Erro no upload " + this.fileName);
				this.controller.filaUpload--;
				this.controller.updateStatusUpload();
			} else {

				var data = JSON.parse(xhr.responseText);

				if (data && data.status == "0") {
					this.controller.addThumb(this.fileName, base64data);
					this.controller.arquivosEnviados.push(this.fileName);
					this.controller.totalArqsEnviados++;
				} else {
					this.controller.fnEmitirErro("Erro no upload " + this.fileName);
				}
				this.controller.filaUpload--;
				this.controller.updateStatusUpload();

			}
		};
		xhr.controller=this;
		xhr.base64data=base64data;
		xhr.fileName=fileName;

		var formData = new FormData();
		
		formData.append("file", base64ToBlob(fileContent, "text/jpg"));
 
		formData.append("fileName", fileName);
 
		Object.keys(this.multipartValues).forEach( key => {
			
			
			formData.append(key, this.multipartValues[key]);
 
		
		})

		try {
			xhr.send(formData);
		} catch (e) {
			this.controller.fnEmitirErro("Erro no upload " + this.fileName);
			this.controller.filaUpload--;
			this.controller.updateStatusUpload();
		}

	}
	
		
	//Realiza o upload dos arquivos em diretorio temporario, atraves do WebServices
	this.callUploadWs = function(base64data, nomeArquivo) {
		
		var fileContent = base64data.split(',')[1]
		var filename = normalizeFileName(nomeArquivo);
		this.filaUpload++;
		this.updateStatusUpload();

		//Chama webservice FileService - F0122886 - DAYANE MOREIRA
		jQuery.ajax({
			url: this.endpointWS,
			type: "POST",
			contentType: "application/json; charset=utf-8",
			crossDomain: true,
			dataType: "json",
			data: JSON.stringify({
				Token: this.token,
				CallbackUrl: "",
				CallbackUrlParameters: "",
				NomeArquivo: filename,
				ConteudoBase64: fileContent,
				DiretorioArquivo: this.destinationFilePath, 
				SobrescreverArquivoExistir: true,
				SistemaOperacional: "WINDOWS"
			}),
			controller: this,
			base64data: base64data,
			filename: filename,
			success: function(data, status,jqXHR) {

				if (data && data.Codigo == "0") {
					this.controller.addThumb(nomeArquivo, base64data);
					this.controller.arquivosEnviados.push(this.filename);
					this.controller.totalArqsEnviados++;
				} else {
					this.controller.fnEmitirErro("Erro no upload " + nomeArquivo);
				}
				this.controller.filaUpload--;
				this.controller.updateStatusUpload();
			},
			error: function (jqXHR, status) {
				this.controller.fnEmitirErro("Erro no upload " + nomeArquivo);
				this.controller.filaUpload--;
				this.controller.updateStatusUpload();
			}
		});

	}
	
		
	
	
	this.getUploadedFileNames = function() {
		var retorno = "";
		for (var i=0; i<this.arquivosEnviados.length; i++) {
			retorno = retorno + this.arquivosEnviados[i];
			if (i<this.arquivosEnviados.length-1) {
				retorno = retorno + ",";
			}
		}
		return retorno;
	}


	this.comprimirJS = function(base64data, nomeArquivo) {
		var source_image = new Image;

		source_image.controller = this;

		source_image.onload = function() {
			console.log("Tamanho do arquivo " + Math.round((base64data.length)*3/4));

			var isLandscape = ( this.naturalWidth > this.naturalHeight );
			
			// setup
			var mime_type = "image/jpeg";
			var maxWidth = 1024;
			var cvs = document.createElement('canvas');
			
			var desiredWidth = 0;
			var desiredHeight = 0;
			if (isLandscape) {
				if (this.naturalWidth>maxWidth) desiredWidth = maxWidth;
				else desiredWidth = this.naturalWidth;
				desiredHeight = this.naturalHeight * desiredWidth / this.naturalWidth;
			} else {
				if (this.naturalHeight>maxWidth) desiredHeight = maxWidth;
				else desiredHeight = this.naturalHeight;
				desiredWidth = this.naturalWidth * desiredHeight / this.naturalHeight;
			}

			console.log("Tamanho original: " + this.naturalWidth + " x " + this.naturalHeight );
			console.log("Tamanho desejado: " + desiredWidth + " x " + desiredHeight );

			 cvs.width = desiredWidth;
			 cvs.height = desiredHeight;

			var quality = 100;
			var resultSize = Math.round((base64data.length)*3/4);
			var newImageData;
			var result_image_obj;

			while (resultSize > this.controller.maxConvertedSize && quality > 40) {

				var ctx = cvs.getContext("2d").drawImage(this, 0, 0, desiredWidth, desiredHeight);
				newImageData = cvs.toDataURL(mime_type, quality/100);
				var result_image_obj = new Image();
				result_image_obj.src = newImageData;	
				resultSize = Math.round((newImageData.length)*3/4);
				console.log("Tamanho do arquivo convertido " + Math.round((newImageData.length)*3/4) + " qualidade " + quality);
				quality = quality-5;
			}

			this.controller.callMultipartUpload(
				newImageData,
				nomeArquivo.replace(/\.[^.]+$/, '.jpg')
			);
		}

		source_image.src=base64data;

	}
}


//Remove o *(asterisco) e o .(ponto) da string de arquivos permitidos '@param allowedFileExtensions'
function formataTiposPermitidos(allowedFileExtensions){
	/* Ex: *.doc; *.docx; *.jpg; *.png; *.bmp; *.jpeg; *.pdf; *.tif */
	var allowedFileExtensionsArray = allowedFileExtensions.split(",");

	for (var i = 0; i < allowedFileExtensionsArray.length; i++) {
		var tipo = allowedFileExtensionsArray[i];
		
		var pontoIndex = tipo.indexOf(".");
		allowedFileExtensionsArray[i] = tipo.substring(pontoIndex + 1, tipo.length);
	}
	return allowedFileExtensionsArray;
}


//Valida se o arquivo possui tipo permitido para upload
function isTipoPermitido(typeFile, tiposPermitidosArray){
	
	var retorno = false;
	
	for (var i = 0; i < tiposPermitidosArray.length; i++) {
		if (typeFile === tiposPermitidosArray[i]){
			retorno = true;
		}
	}
	return retorno;
}


//Valida se o arquivo possui tamanho permitido para upload (Tamanho maximo permitido e 10MB)
function isTamanhoPermitido(tamanho, tamanhoMaximoPermitido){

	var returno = tamanho <= (1024 * tamanhoMaximoPermitido);
	return returno;
}

//Remove caracteres especiais do nome do arquivo
function normalizeFileName(objResp){
	var varRes = objResp.normalize('NFD').replace(/[\u0300-\u036f]/g, "");
	return varRes.replace(/[`~!@#$%^&*()|+\-=?;:'",<>\{\}\[\]\\\/\ ]/gi, '');
}


function base64ToBlob(base64, mime) 
{
    mime = mime || '';
    var sliceSize = 1024;
    var byteChars = window.atob(base64);
    var byteArrays = [];

    for (var offset = 0, len = byteChars.length; offset < len; offset += sliceSize) {
        var slice = byteChars.slice(offset, offset + sliceSize);

        var byteNumbers = new Array(slice.length);
        for (var i = 0; i < slice.length; i++) {
            byteNumbers[i] = slice.charCodeAt(i);
        }

        var byteArray = new Uint8Array(byteNumbers);

        byteArrays.push(byteArray);
    }

    return new Blob(byteArrays, {type: mime});
}
