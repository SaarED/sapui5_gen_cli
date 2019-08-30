sap.ui.jsview("%%NAMESPACE%%%%APPNAME%%.view.%%VIEWNAME%%", { // this View file is called %%VIEWNAME%%.view.js

	getControllerName: function () {
		return "%%NAMESPACE%%%%APPNAME%%.controller.%%VIEWNAME%%"; // the Controller lives in %%VIEWNAME%%.controller.js
	},

	createContent: function (oController) {
		return new sap.m.Page({
			title: '{i18n>title}',
			content: [
				new sap.m.Text({
					text: 'Simple App'
				})
			]
		});
	}

});