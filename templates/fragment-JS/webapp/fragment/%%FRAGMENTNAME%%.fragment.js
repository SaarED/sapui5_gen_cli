sap.ui.jsfragment ( "%%NAMESPACE%%%%APPNAME%%.fragment.%%FRAGMENTNAME%%",{ 
	createContent: function (oController ) {
        var oButton  = new sap.ui.commons.Button({ 
			text: "Hello World" , 
			press:oController.doSomething 
		}); 
		return oButton; 
	} 
});