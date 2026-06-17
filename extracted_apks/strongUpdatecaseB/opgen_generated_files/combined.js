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

// original file:/home/vivek/Documents/ERIS-Tools/WebViewJSdetect/extracted_apks/strongUpdatecaseB/assets/script.js

//invoke the bridge class method showData with interface object Android
Android.getData();
