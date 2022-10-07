import global from './global.js'

class Request {
    /**
    * 内部的属性定义有：基础配置(config)、拦截器(interceptor)、请求方法表达式（get post put delete）
    */
    constructor(){
        this.config = {
            baseUrl: '', // 请求的根域名
            header: {}, // 默认的请求头
            method: 'POST',
            dataType: 'json',// 设置为json，返回后uni.request会对数据进行一次JSON.parse
            responseType: 'text',// 此参数无需处理，因为5+和支付宝小程序不支持，默认为text即可
            showLoading: true, // 是否显示请求中的loading
            loadingText: '请求中...',
            loadingTime: 800, // 在此时间内，请求还没回来的话，就显示加载中动画，单位ms
            timer: null, // 定时器
            loadingMask: true, // 展示loading的时候，是否给一个透明的蒙层，防止触摸穿透
        }
        
        /**
         * 包含了值都为空的请求拦截和响应拦截属性的拦截器对象。
         */ 
        this.interceptor = {
            // 请求拦截
            request(config){
                config.data  = config.data || {}
                return config
            },
            // 响应拦截
            response(response){
               if (response.status !== 200) {
                   uni.showToast({
                        icon:'none',
                        title:response.msg || '系统错误'
    		})
    		return Promise.reject(response)
               }
               return response.data || {}
            }
        }
        
        /**
         * 声明请求函数表达式：get post put delete。this.request方法在第四步声明
         */ 
        // get请求
        this.get = (url, data = {}, header = {}) => {
            return this.request({
                method: 'GET',
                url,
                header,
                data
            })
        }
    
        // post请求
        this.post = (url, data = {}, header = {}) => {
            return this.request({
                url,
                method: 'POST',
                header,
                data
            })
        }
    
        // put请求，不支持支付宝小程序
        this.put = (url, data = {}, header = {}) => {
            return this.request({
                url,
                method: 'PUT',
                header,
                data
            })
        }
    
        // delete请求，不支持支付宝和头条小程序
        this.delete = (url, data = {}, header = {}) => {
            return this.request({
                url,
                method: 'DELETE',
                header,
                data
            })
        }
    }
  
    

   
    //判断是否是数组
        function isArray(obj){
            return Object.prototype.toString.call(obj) === '[object Array]'
        }
        
        //js 深度克隆
        function deepClone(obj){
            if([null, undefined, NaN, false].includes(obj) return obj;
            if(typeof obj !== 'function' && typeof obj !== 'object') return obj;
            var res = isArray(obj)? []: {};
            for(var i in obj){
                if(Object.prototype.hasOwnProperty.call(obj, i)){
                    res[i] = typeof obj[i] === 'object' ? deepClone(obj[i]) : obj[i]
                }
            }
            return res
        }
        //js 深度合并
        function deepMerge(target = {}, source = {}) {
            target = deepClone(target);
            if (typeof target !== 'object' || typeof source !== 'object') return false;
            for (var prop in source) {
                if (!source.hasOwnProperty(prop)) continue;
                if (prop in target) {
                    if (typeof target[prop] !== 'object') {
                        target[prop] = source[prop];
                    }else{
                        if (typeof source[prop] !== 'object') {
                            target[prop] = source[prop];
                        }else{
                            if (target[prop].concat && source[prop].concat) {
                                target[prop] = target[prop].concat(source[prop]);
                            }else{
                                target[prop] = deepMerge(target[prop], source[prop]);
                            }
                        }
                    }
                }else{
                    target[prop] = source[prop];
                }
            }
            return target;
        }
           
        /**
         * setConfig接收一个自定义的配置对象，将类中的config对象和它进行深度合并。
         * @param {Object} customConfig  深度合并对象，否则会造成对象深层属性丢失
         */ 
        setConfig(customConfig) {
            this.config = deepMerge(this.config, customConfig);
        }
    

    

    /**
    * 主要请求部分,使用uni.request进行请求，并实现请求和响应的拦截
    */
    request (options = {}) {
        //检查请求拦截
        this.options = this.interceptor.request(options);
        options.dataType = options.dataType || this.config.dataType;
        options.responseType = options.responseType || this.config.responseType;
        options.url = options.url || '';
        options.params = options.params || {};
        options.header = Object.assign({}, this.config.header, options.header);
        options.method = options.method || this.config.method;
        
        return new Promise((resolve, reject) => {
            options.complete = (response) => {
                //请求返回后，隐藏loading
                uni.hideLoading();
                //清除定时器，如果请求快，不用显示loading
                clearTimeout(this.config.timer);
                this.config.timer = null;
                 //响应拦截
                let resInterceptors = this.interceptor.response(response);
                resolve(resInterceptors);
            }
            //是否显示loading，加一个是否有已经有了timer的判断，否则两个同时请求的时候，后者会清除前者的定时器id，而没有清除前者的定时器，导致前者超时，一直显示loading
            if(this.config.showLoading && this.config.timer) {
                this.config.timer = setTimeout(()=>{
                    uni.showLoading({
                        title: this.config.loadingText,
                        mask: this.config.loadingMask
                    })
                },this.config.loadingTime)
            }
            uni.request(options)
        }
    }

}
export default new Request



