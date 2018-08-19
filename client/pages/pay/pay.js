// pages/demo/pay/pay.js
import utilMd5 from '../../utils/md5.js'
import util from '../../utils/util.js'
var appInstance = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    paypackage: '',
  },

  ordersubmit: function(){
    let self = this
    wx.login({
      success: function (res) {
        if (res.code) {
          //发起网络请求
          wx.request({
            url: 'http://127.0.0.1:8360/v1/pay/ordersubmit',
            data: {
              code: res.code
            },
            method: 'POST',
            success: function (res) {  
              console.log(res)            
              self.paypackage = res.data.data.package
            }
          })
        } else {
          console.log('登录失败！' + res.errMsg)
        }
      }
    });

  },

  orderpay: function () { 
    let self = this   
    let timeStamp = Date.parse(new Date()).toString().substr(0, 10)
    let nonceStr = util.random32()
    console.log(this.paypackage)
    const paySignObj = {
      'appId': appInstance.globalData.config.appId,
      'nonceStr': nonceStr,
      'package': this.paypackage,
      'signType':'MD5',
      'timeStamp': timeStamp,
      'key': appInstance.globalData.config.key
    }

    const paySignStr = 'appId=' + paySignObj.appId + '&nonceStr=' + paySignObj.nonceStr + '&package=' + paySignObj.package + '&signType=' + paySignObj.signType + '&timeStamp=' + paySignObj.timeStamp + '&key=' + paySignObj.key

    paySignObj.paySign = utilMd5.hexMD5(paySignStr).toUpperCase()
    console.log(paySignObj)
    console.log('str is : '+paySignStr)
    console.log(paySignObj.paySign)

    //调用wx.requestPayment(OBJECT)发起微信支付
    wx.requestPayment(
      {
        'timeStamp': paySignObj.timeStamp,
        'nonceStr': paySignObj.nonceStr,
        'package': paySignObj.package,
        'signType': paySignObj.signType,
        'paySign': paySignObj.paySign,
        'success': function (res) {
          // {errMsg: "requestPayment:ok"}
          console.log(res)
         },
        'fail': function (res) {
          console.log(res)
         },
        'complete': function (res) { }
      })       

  },
})