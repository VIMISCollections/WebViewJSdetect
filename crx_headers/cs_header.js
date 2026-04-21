// content script header
var chrome = {
  runtime: {
    onConnect: { addListener: function() {} },
    connect: function() {},
    sendMessage: function() {}
  },
  tabs: {
    query: function() {},
    sendMessage: function() {}
  },
  storage: {
    local: {
      get: function() {},
      set: function() {}
    }
  }
};
