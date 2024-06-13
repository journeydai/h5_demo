(function() {
  if (window.hcJsBridge) {
      return;
  }
  
  window.hcJsBridge = {
      callHandler: callHandler,
      registerHandler: registerHandler,
      handleMessageFromNative: handleMessageFromNative,
      messageHandlers: {},
      messageCallbacks: {},
      ok:false,
  };
  var uniqueId = 1;
  
  function callHandler(name, data, responseCallback) {
      if (arguments.length == 2 && typeof data == 'function') {
          responseCallback = data;
          data = null;
      }
      var message = {name:name, data:data};
      if (responseCallback) {
          var callbackId = 'cb_'+(uniqueId++)+'_'+new Date().getTime();
          message["callbackId"] = callbackId;
          hcJsBridge.messageCallbacks[callbackId] = responseCallback;
      }
      var messageJson = JSON.stringify(message);
      if (typeof nativeBridgeHead === "undefined") {
          window.webkit.messageHandlers.handleMessage.postMessage(messageJson);
      } else {
          nativeBridgeHead.handleMessage(messageJson);
      }
  }
  
  function registerHandler(name, handler) {
      hcJsBridge.messageHandlers[name] = handler;
  }

  // register func when login success
  hcJsBridge.registerHandler('onAppLoginSuccess', function() {
    console.log('onAppLoginSuccess')
    if (MagicTool && MagicTool.isLogin) {
        MagicTool.isLogin.then(function(isLogin){
            if (!isLogin) window.location.reload()
        }, function(){
            window.location.reload()
        })
    }
  })
  
  function handleMessageFromNative(messageJSON) {
  
      var message = messageJSON;
      if (typeof message != "object") {
          message = JSON.parse(unescape(messageJSON));
      }
      var responseId = message["responseId"];
      if (responseId) {
          var responseData = message["responseData"];
          var callback = hcJsBridge.messageCallbacks[responseId];
          callback(responseData);
      } else {
          var messageName = message["name"];
          var messageData = message["data"];
          var messageCallbackId = message["callbackId"];
  
          var handler = hcJsBridge.messageHandlers[messageName];
          if (typeof handler === "undefined") {
              console.warn(message);
              return;
          }
          var responseCallback = function(data) {
              var responseMessage = {
                  responseId: messageCallbackId,
                  responseData: data
              };
              var responseMessageJson = JSON.stringify(responseMessage);
              if (typeof nativeBridgeHead === "undefined") {
                  window.webkit.messageHandlers.handleResponseMessage.postMessage(responseMessageJson);
              } else {
                  nativeBridgeHead.handleResponseMessage(responseMessageJson);
              }
          };
          try {
              handler(messageData, responseCallback);
          } catch (e) {
              console.warn(e,message);
          }
      }
  }
  
  setTimeout(function () {
      try {
          if (typeof nativeBridgeHead === "undefined") {
              window.webkit.messageHandlers.handleStartupMessage.postMessage("");
          } else {
              nativeBridgeHead.handleStartupMessage();
          }
          hcJsBridge.ok = true;
      } catch (e) {
          console.warn(e);
      }        
  }, 0);
})();

window.MagicJSBridge = {
    openLogin() {
        console.log('call openLogin')
        try {
            hcJsBridge.callHandler('magicBox.openLogin')
        } catch (r) {
            console.log('请在app上使用', r)
        }
    },
    share(params) {
        try {
            hcJsBridge.callHandler('magicBox.share', params)
        } catch (r) {
            console.log('请在app上使用', r)
        }
    },
    getAccessToken() {
        console.log('call getAccessToken')
        return new Promise((resolve, reject) => {
            console.log('call getAccessToken in promise')
            hcJsBridge.callHandler('webkit.getAppUserInfo', {}, function (response) {
                console.log('call getAccessToken in callback')
                let userInfo = JSON.parse(response)
                let newUserInfo = {
                    statusCode: 0,
                    data: {
                        access_token: ""
                    }
                }
                if (userInfo.statusCode == 1) {
                    newUserInfo.statusCode = userInfo.statusCode
                    newUserInfo.data.access_token = userInfo.data.userInfo.wdhacid
                }
                console.log('wdhacid:' + newUserInfo.data.access_token)
                resolve(newUserInfo)
            })
        })
    },
    getSchemeAndLink() {
        let params = new URLSearchParams(window.location.search)
        let inviteUUID = params.get('uid')
        let link = 'https://h5test.dongfeng-honda.com/register/pages/register/activeLogin/index' + window.location.search + '&inviteUuid=' + inviteUUID + '&from=magicBox&code=magicBox&actId=2024'
        return {
            link: link,
            scheme: 'honda'
        }
    }
}

