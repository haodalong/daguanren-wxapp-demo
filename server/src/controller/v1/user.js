const Base = require('./base.js');

module.exports = class extends Base {
  async wxloginAction() {
  	let js_code = this.post('js_code');
  	
  	//1、记录客户的IP地址
		const clientIp = this.ctx.ip; 
  	
  	//2、开发者服务器使用 临时登录凭证code 获取 session_key 和 openid 等。
		const WxloginSerivce = this.service('wxlogin');
		const sessionData = await WxloginSerivce.generate_third_session(js_code);
		
		if(40029 === sessionData.errcode){
			return this.fail('WX_LOGIN_CODE_WRONG');
		}
		
		//3、指定secret生成3rd_session
		const TokenSerivce = this.service('token');
		const third_session = await TokenSerivce.create(sessionData);
		
		//4、将third_session作为key，session_key+openid为value，存入session中
		let value = sessionData.session_key+sessionData.openid;
		await this.session(third_session, value);
		
		const session_id = this.cookie('thinkjs')
  	
  	let returnData = {
  		'third_session':third_session,
  		'session_id':session_id
  	}
		
		return this.success(returnData);
  	
  }

  async deletesessionAction() {
  	console.log(this.ctx.header);
  	let wxappToken = this.header('x-wxapp-token');
  	//清除当前用户的 session
    await this.session(null);
  	return this.success('删除session成功');
  	
  } 
  
  async testAction() {
  	let wxappToken = this.header('x-wxapp-token');
  	
  	const third_session = await this.session(wxappToken);
  	console.log(third_session);
  	if(think.isTrueEmpty(third_session)){
  		return this.fail('NO_THIRD_SESSION');
  	}
  	return this.success(third_session);
  	
  }  
  
};
