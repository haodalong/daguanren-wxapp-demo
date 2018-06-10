const rp = require('request-promise');

module.exports = class extends think.Service {
  /**
   * 根据header中的X-daguanren-Token值获取用户id
   */
  async generate_third_session(js_code) {
  	

		//2、开发者服务器使用 临时登录凭证code 获取 session_key 和 openid 等。https://developers.weixin.qq.com/miniprogram/dev/api/api-login.html#wxloginobject
		const options = {
			method: 'GET',
			url: 'https://api.weixin.qq.com/sns/jscode2session',
			qs: {
				appid: think.config('wxapp.appid'),
				secret: think.config('wxapp.secret'),
				js_code: js_code,
				grant_type: 'authorization_code'
			},
			json: true // Automatically parses the JSON string in the response
		};
		const sessionData = await rp(options);
		
		//错误时返回JSON数据包(示例为Code无效)
		/*{
		    "errcode": 40029,
		    "errmsg": "invalid code"
		}*/
		return sessionData;
	}
};
