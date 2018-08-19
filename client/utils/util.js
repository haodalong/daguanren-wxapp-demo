var appInstance = getApp()

const wxlogin = (callback) => {
  // 登录
  wx.login({
    success: res => {
      // 发送 res.code 到后台换取 openId, sessionKey, unionId
      if (res.code) {

        //发起网络请求
        wx.request({
          url: appInstance.globalData.config.host_url + '/user/wxlogin',
          method: 'POST',
          data: {
            js_code: res.code
          },
          dataType: 'json',
          success: function (res) {
            if (0 == res.data.errno) {
              wx.setStorageSync('third_session', res.data.data.third_session)
              wx.setStorageSync('sessionId', res.data.data.session_id)

              callback(true)

            } else {
              console.log('登录失败！' + res.data.data.errmsg)
              callback(false)
            }

          }
        })
      } else {
        console.log('登录失败！' + res.errMsg)
        callback(false)
      }
    }
  })
}


const safeRequest = (uri, data, callback) => {
  var token = null
  var sessionId = null
  try {
    token = wx.getStorageSync('third_session')
    sessionId = wx.getStorageSync('sessionId')

    if (token) {
      // Do something with return value
    }
  } catch (e) {
    // Do something when catch error
    callback(false);
  }
  wx.checkSession({    
    success: function () {      
      //session_key 未过期，并且在本生命周期一直有效

      wx.request({
        url: appInstance.globalData.config.host_url + uri, //仅为示例，并非真实的接口地址
        data: data,
        method: 'POST',
        header: {
          'content-type': 'application/json', // 默认值
          'x-wxapp-token': token,
          'Cookie': 'thinkjs=' + sessionId
        },
        success: function (res) {
          if (0 == res.data.errno){
            callback(res.data)
          }          
        }
      })
    },
    fail: function () {
      // session_key 已经失效，需要重新执行登录流程
      if (token != null && token != ''){
        wx.request({
          url: appInstance.globalData.config.host_url + '/user/deletesession', //仅为示例，并非真实的接口地址
          method: 'POST',
          header: {
            'content-type': 'application/json', // 默认值
            'x-wxapp-token': token,
            'Cookie': 'thinkjs=' + sessionId
          },
          data: data,
          success: function (res) {
            if (0 != res.data.errno) {
              callback(false);
            }

          }
        })
      }
      wxlogin(function (flag) {
        if (flag) {
          safeRequest(uri, data, callback)
        }
      })
        
  }
})
  
}

// 生成32位的随机字符串
function random32() {
  let str = '',
    pos = 0,
    arr = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];

  for (var i = 0; i < 32; i++) {
    pos = Math.round(Math.random() * (arr.length - 1));
    str += arr[pos];
  }
  return str;
}


const formatTime = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}

const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : '0' + n
}




module.exports = {
  wxlogin: wxlogin,
  safeRequest: safeRequest,
  formatTime: formatTime,
  random32: random32
}
