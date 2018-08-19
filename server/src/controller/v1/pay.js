const Base = require('./base.js');
const rp = require('request-promise');
const md5 = require('md5');
const xml2js = require('xml2js');

module.exports = class extends Base {
	async ordersubmitAction() {
		const code = this.post('code');

		function random32(){
		    let str = '',
		    pos = 0,		    
		    arr = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];
		 
		    for(var i=0; i<32; i++){
		        pos = Math.round(Math.random() * (arr.length-1));
		        str += arr[pos];
		    }
		    return str;
		}

		//1、向以下地址发送请求换取openid, session_key和unionid(需关注公众号，且绑定在同一微信开放平台)，主要目的为了获得openid
		//https://api.weixin.qq.com/sns/jscode2session?appid=APPID&secret=SECRET&js_code=JSCODE&grant_type=authorization_code

		const loginOptions = {
			method: 'GET',
			url: 'https://api.weixin.qq.com/sns/jscode2session',
			qs: {
				grant_type: 'authorization_code',
				js_code: code,
				secret: think.config('wxapp.secret'),
				appid: think.config('wxapp.appid')
			}
		};

		const loginResult = await rp(loginOptions);
		const loginResultObj = JSON.parse(loginResult);
		const openid = loginResultObj.openid;
		
		console.log(loginResultObj);

		//2、调用统一下单api
		//https://api.mch.weixin.qq.com/pay/unifiedorder
		const nonce_str = random32();
		const requestParams = {
			appid: think.config('wxapp.appid'),
			mch_id: think.config('wxapp.mch_id'),
			nonce_str: nonce_str,
//			sign:
			sign_type: 'MD5',
			body: '订单编号：010',
			out_trade_no: 'sn010',
			total_fee: parseInt(0.01 * 100),
			spbill_create_ip: '123.12.12.123',
			notify_url: think.config('wxapp.notify_url'),
			trade_type: 'JSAPI',
			openid: openid
		};

		//2.1、用md5加密算法计算sign值
		//第一步：对参数(requestParams)按照key=value的格式，并按照参数名ASCII字典序排序如下：
		//第二步：拼接API密钥：
		let paramStr = '';
		for (let key of Object.keys(requestParams).sort()) {
			paramStr += key + '=' + requestParams[key] +'&';
		}
//		paramStr = paramStr.substring(0,paramStr.length-1);
		paramStr += 'key='+think.config('wxapp.partner_key');
		
		
		//第三步：使用sign_type中配置的方式加密，这里是MD5
		requestParams.sign = md5(paramStr).toUpperCase();

		//第四步：将json对象转换成XML
		var builder = new xml2js.Builder({rootName: 'xml'});
		var xml = builder.buildObject(requestParams);
		console.log(xml);
		
		//2.2、向如下地址发送统一下单请求
		//https://api.mch.weixin.qq.com/pay/unifiedorder

		const orderOptions = {
			method: 'POST',
			url: 'https://api.mch.weixin.qq.com/pay/unifiedorder',
			formData: {
				xml
			}
		};
		
		const orderResultXml = await rp(orderOptions);
//		const orderResultObj = JSON.parse(orderResult);

		console.log(orderResultXml);
		
		//3、将微信返回的xml数据转换成json对象，返回到前端
		//3.1、现将异步函数转成同步，再将xml转成json对象
		const parseString = think.promisify(xml2js.parseString, xml2js);
		const orderResultObj = await parseString(orderResultXml);
		
		console.log(orderResultObj.xml);
		
		//3.2、校验微信服务器返回的sign值
		let validateStr = '';
		for (let key of Object.keys(orderResultObj.xml).sort()) {
			if('sign' != key){
				validateStr += key + '=' + orderResultObj.xml[key][0] +'&';
			}
		}
		validateStr += 'key='+think.config('wxapp.partner_key');
		console.log(validateStr);
		validateStr = md5(validateStr).toUpperCase();
		console.log(validateStr);
		
		if(validateStr != orderResultObj.xml.sign[0]){
			return this.fail('微信服务器返回sign不正确');
		}
		
		//——如果业务结果返回失败，如订单已支付，将返回结果，错误码，错误描述返回前端
		if('FAIL' === orderResultObj.xml.result_code[0]){
			const returnResult = {
				result_code: orderResultObj.xml.result_code[0],
				err_code: orderResultObj.xml.err_code[0],
				err_code_des: orderResultObj.xml.err_code_des[0]
			}
			return this.success(returnResult);
		}
		
		//——如果业务结果返回成功，将package和返回结果返回前端
		const returnResult ={
			result_code: orderResultObj.xml.result_code[0],
			package:'prepay_id=' + orderResultObj.xml.prepay_id[0]
		}
		
		return this.success(returnResult);

	}
	
	
	async notifyAction() {
		const returnObj = this.post();
		
		if('SUCCESS' === returnObj.return_code){
			//1、校验微信服务器返回的sign值
			let validateStr = '';
			for (let key of Object.keys(returnObj.xml).sort()) {
				if('sign' != key && !think.isTrueEmpty(returnObj.xml[key][0])){
					validateStr += key + '=' + returnObj.xml[key][0] +'&';
				}else if('sign' != key){
					validateStr += key + '=' + returnObj.xml[key] +'&';
				}
			}
			validateStr += 'key='+think.config('wxapp.partner_key');
			console.log(validateStr);
			validateStr = md5(validateStr).toUpperCase();
			console.log(validateStr);
			
			if(validateStr != returnObj.xml.sign[0]){
				return this.fail('微信服务器返回sign不正确');
			}
			
			//2、校验订单金额
			
		}
		
		const result = {
			return_code: 'SUCCESS',
			return_msg: 'OK'
		}
		
		const builder = new xml2js.Builder({rootName: 'xml'});
		const xml = builder.buildObject(result);
		
		this.ctx.body = xml;
		return;
		
		
	}
	

};