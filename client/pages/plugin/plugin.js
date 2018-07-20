// pages/plugin/plugin.js

let plugin = requirePlugin("txmap")
let routeInfo = {
  startLat: 39.90469,    //起点纬度 选填
  startLng: 116.40717,    //起点经度 选填
  startName: "我的位置",   // 起点名称 选填
  endLat: 39.94055,    // 终点纬度必传
  endLng: 116.43207,  //终点经度 必传
  endName: "来福士购物中心",  //终点名称 必传
  mode: "car"  //算路方式 选填
}



Page({

  /**
   * 页面的初始数据
   */
  data: {
    routeInfo: routeInfo
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    const TxvContext = requirePlugin("txvideo");

    let txvContext = TxvContext.getTxvContext('txv1') // txv1即播放器组件的playerid值

    txvContext.play();  // 播放
    txvContext.pause(); // 暂停
    txvContext.requestFullScreen(); // 进入全屏
    txvContext.exitFullScreen();    // 退出全屏
    txvContext.playbackRate(+e.currentTarget.dataset.rate); // 设置播放速率 
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