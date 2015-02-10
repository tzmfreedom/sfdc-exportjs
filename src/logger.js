// logger functions
var Logger = {
  log : function(msg) {
    console.log("[" + new Date().toFormat("YYYY-MM-DD HH:MI:SS") + "] " + msg);
  },
  error : function(msg) {
    console.error("[" + new Date().toFormat("YYYY-MM-DD HH:MI:SS") + "] " + msg);
  }
};

module.exports = Logger;