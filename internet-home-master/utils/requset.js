import Vue from 'vue'
const dev = 'https://www.szjarui.cn/8111POST/IO_WEIFATERMINAL/API'
const noPermissionRou = ['LOGMAC','GETPWD','USERNICK']
let login_key = 0
const uploading = () => {
	if (login_key == 0) {
		uni.showLoading({ mask: true, "title":'加载中...' })
	}
	login_key++

}
const xmlLoadin = () => {
	login_key--
	if (login_key == 0) { uni.hideLoading() }
}

let dsx3LineCoding = ''
// 从本地存储同步读取设备号，避免重启后丢失
let WEIFA = uni.getStorageSync('WEIFA') || ''
uni.$on('clear',()=>{
	WEIFA=''
	uni.removeStorageSync('WEIFA')
})
function request(data,hide) {
	return new Promise((res, rej) => {
		if (data.OBJECT == 'WEIFA') data.OBJECT = WEIFA
		if(!noPermissionRou.includes(data.ACTIVE) && !WEIFA){
			uni.reLaunch({ url:'/pages/login/login' })
			return
		}
		uploading()
		uni.request({
			url: dev,
			method: "POST",
			timeout:5000,
			// dataType: 'json',
			data: data,
			success(resove) {
				xmlLoadin()
				if (resove.statusCode == 200) {
					// console.log(resove.data)
					// console.log(JSON.parse(resove.data))
					const obj = JSON.parse(resove.data)
					if (obj.MESSAGE == 'OK') {
						res(obj)
						if (data.ACTIVE == 'LOGMAC') {
							WEIFA = data.OBJECT
							Vue.prototype.WEIFA=data.OBJECT
						}
					} else {
							if(!hide){
								uni.showToast({ title: obj.MESSAGE, icon: 'none', duration: 3000 })
							}
						rej()
					}
				} else {
					uni.showToast({
						title: resove.errMsg,
						icon: 'none',
						duration: 3000
					})
				}

			},
			fail(err) {
				xmlLoadin()
				uni.showToast({
					title: JSON.err,
					icon: 'none',
					duration: 3000
				})
			},
			// complete() {
			// 	xmlLoadin()
			// }
		})
	})
}
export default request
