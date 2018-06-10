// pages/login/login.js
const util = require('../../utils/util.js')
Page({

  /**
   * 页面的初始数据
   */
  data: {
  
  },

  /**
   * 按钮点击触发后的逻辑操作
   */
  sendRequest: function (e) {
    // 
    if (e) {
      var data = {
        name:'dalong'
      }
      util.safeRequest('/user/test', data, (data)=>{
        console.log(data)

      })
      
    }

  },

  /**
   * wx.login
   */
  wxlogin: function (e) {
    // 
    if (e) {
      var data = {
        name: 'dalong'
      }
      util.wxlogin()
    }

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
  
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
  
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
  
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
  
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
  
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
  
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
  
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
  
  }
})