// original file:crx_headers/header.js

// Android WebView bridge stubs
// Sources: bridge methods that return sensitive data from the Android side
// Sinks: bridge methods that send data back to the Android side

var bridge = {};
bridge.getName         = function() { return MarkSource(undefined, "webview_name_source"); };
bridge.findName        = function() { return MarkSource(undefined, "webview_name_source"); };
bridge.getContactNames = function() { return MarkSource(undefined, "webview_contact_source"); };
bridge.getLocation     = function() { return MarkSource(undefined, "webview_location_source"); };
bridge.checkTypes      = function() { return MarkSource(undefined, "webview_data_source"); };
bridge.getData         = function() { return MarkSource(undefined, "webview_data_source"); };
bridge.sendName        = function(data) { sink_function(data, "bridge_sendName_sink"); };
bridge.sendMessage     = function(data) { sink_function(data, "bridge_sendMessage_sink"); };
bridge.sendContacts    = function(data) { sink_function(data, "bridge_sendContacts_sink"); };

window.bridge = bridge;

// Android object (addJavascriptInterface)
var Android = {};
Android.getData   = function() { return MarkSource(undefined, "android_data_source"); };
Android.showData  = function(data) { sink_function(data, "android_showData_sink"); };

// original file:/home/vivek/Documents/ERIS-Tools/WebViewJSdetect/extracted_apks/HelloScript/assets/www/js/contact.js

var name;

var app = {
		sendContacts: function(){
			var msgBox = document.getElementById("msgbox");
			//location.href="androidjava:fuck!";
			msgBox.innerHTML = "Getting contacts...";
			var contacts = window.bridge.getContactNames();
			name = this.parse(contacts);
			msgBox.innerHTML += name;
			window.bridge.sendMessage(name);
			console.log("JS:SEND");
			var array = window.bridge.checkTypes();
			console.log(array);
			console.log("JS:END");
//			console.log(array);
//			alert(contacts);
		},
		parse: function(str){
			return str.substring(0,str.indexOf("/"));
		}
};
