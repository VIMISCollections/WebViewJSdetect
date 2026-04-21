// background header
var chrome = {
  runtime: {
    onConnect: { addListener: function() {} },
    onMessage: { addListener: function() {} },
    sendMessage: function() {}
  },
  tabs: {
    query: function() {},
    create: function() {},
    update: function() {}
  },
  storage: {
    local: {
      get: function() {},
      set: function() {}
    }
  },
  topSites: {
    get: function() {}
  }
};
