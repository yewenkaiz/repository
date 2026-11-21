const mode = [{
 		"name": "开灯",
 		"url": "turnOnTheLights"
 	},
 	{
 		"name": "关灯",
 		"url": "turnOffTheLights"
 	},
 	{
 		"name": "会客",
 		"url": "receive"
 	},
 	{
 		"name": "欢迎",
 		"url": "Welcome"
 	},
 	{
 		"name": "阅读",
 		"url": "read"
 	},
 	{
 		"name": "起床",
 		"url": "getUp"
 	},
 	{
 		"name": "休闲",
 		"url": "leisure"
 	},
 	{
 		"name": "睡眠",
 		"url": "slumber"
 	},
 	{
 		"name": "影视",
 		"url": "filmAndTelevision"
 	},
 	{
 		"name": "洗浴",
 		"url": "takeABath"
 	},
 	{
 		"name": "起夜",
 		"url": "wakeUp"
 	},
 	{
 		"name": "浪漫",
 		"url": "romantic"
 	},
 	{
 		"name": "打开窗帘",
 		"url": "openTheCurtains"
 	},
 	{
 		"name": "关闭窗帘",
 		"url": "closeTheCurtains"
 	},
 	{
 		"name": "打开卫生间灯",
 		"url": "bathroom"
 	},
 	{
 		"name": "关闭卫生间灯",
 		"url": "bathroom"
 	},
 	{
 		"name": "SOS",
 		"url": "sos"
 	},
 	{
 		"name": "柔和",
 		"url": "gentle"
 	},
	{
		"name": "娱乐",
		"url": "recreation"
	},
	{
		"name": "室外",
		"url": "outdoor"
	},
	{
		"name": "离家",
		"url": "LeaveHome"
	},
	{
		"name": "回家",
		"url": "returnHome"
	},
	{
		"name": "门磁",
		"url": "doorSensor"
	},
	{
		"name": "用餐",
		"url": "dining"
	},
	{
		"name": "动感",
		"url": "dynamic"
	}
 ]
 export function FilmScreenings(name) {
	let url=''
 	for (var i = 0; i < mode.length; i++) {
 		if ( name.indexOf(mode[i].name)>-1) {
 			url= mode[i].url
			break
 		}
 	}
	return url||'current'
 }
//检查是否时一个正确的时间格式
export function inspectTime(time) {
    if (!(time instanceof Date)) {//将时间转换为date类型
        if ((typeof time === 'number') && (time.toString().length === 10)) { time = time * 1000 }//判断时间戳是否为秒
        time = new Date(time || new Date())
    }
    if (time instanceof Date && isNaN(time.getTime())) {
        console.error('无效的时间格式')
        return false
    }
    return true
}
// 日期格式化函数
/**
 * y:年
 * m:月
 * mm:月 补0
 * d:天
 * dd:天 补0
 * h:小时
 * hh:小时 补0
 * i:分
 * ii:分 补0
 * s:秒
 * ss:秒 补0
 * @param {Date|String|Number} time 格式话的时间
 * @param {String} pattern 格式化的格式 用{}包裹替换值
 * @returns 格式化后的时间 是一个字符串
 */
export function parseTime(time, pattern) {
    if (!(time instanceof Date)) {//将时间转换为date类型
        if ((typeof time === 'number') && (time.toString().length === 10)) { time = time * 1000 }//判断时间戳是否为秒
        time = new Date(time || new Date())
    }
    if (time instanceof Date && isNaN(time.getTime())) {
        console.error('无效的时间格式')
        return ''
    }
    const format = pattern || '{y}-{m}-{d} {h}:{i}:{s}'
    const formatObj = {
        y: time.getFullYear(), //获取年份
        m: time.getMonth() + 1, //获取月份
        mm: time.getMonth() + 1 > 9 ? time.getMonth() + 1 : '0' + (time.getMonth() + 1),//获取月份 补零
        d: time.getDate(), //获取 天数
        dd: time.getDate() > 9 ? time.getDate() : '0' + time.getDate(), //获取 天数 补零
        h: time.getHours(), //获取小时
        hh: time.getHours() > 9 ? time.getHours() : '0' + time.getHours(), //获取小时 补零
        i: time.getMinutes(), //获取分
        ii: time.getMinutes() > 9 ? time.getMinutes() : '0' + time.getMinutes(), //获取分 补零
        s: time.getSeconds(), //获取秒
        ss: time.getSeconds() > 9 ? time.getSeconds() : '0' + time.getSeconds(), //获取秒 补零
        a: time.getDay() //获取星期
    }
    return format.replace(/{(y|m|mm|d|dd|h|hh|i|ii|s|ss|a)}/g, (result, key) => {
        let value = formatObj[key]
        if (key === 'a') { return ['日', '一', '二', '三', '四', '五', '六'][value] }
        return value || 0
    })
}
export function wisdom(key){
	switch (key){
		case '卧室':
			return '总经理'
		case '次卧':
			return '副总'
		case '老人房':
			return '财务室'
		case '儿童房':
			return '会议室'
		case '书房':
			return '办公一'
		case '影音房':
			return '办公二'
		case '保姆房':
			return '办公三'
		default:
			return key
	}
}
const sceneData={
	"开灯":"上班","关灯":"下班","卧室起床":"总经开","卧室睡眠":"总经关","卧室阅读":"总经柔和","卧室起夜":"总经明亮",
	"次卧起床":"副总开","次卧睡眠":"副总关","次卧阅读":"副总柔和","次卧起夜":"副总明亮",
	"老人起床":"财务开","老人睡眠":"财务关","老人阅读":"财务柔和","老人起夜":"财务明亮",
	"儿童起床":"会议开","儿童睡眠":"会议关","儿童阅读":"会议柔和","儿童起夜":"会议明亮",
	"书房起床":"办公一开","书房睡眠":"办公一关","书房阅读":"办公一柔和","书房起夜":"办公一明亮",
	"影音起床":"办公二开","影音睡眠":"办公二关","影音阅读":"办公二柔和","影音起夜":"办公二明亮",
	"保姆起床":"办公三开","保姆睡眠":"办公三关","保姆阅读":"办公三柔和","保姆起夜":"办公三明亮"
}
export function sceneSwitch(key){
	return	sceneData[key]?sceneData[key]:key
}
// 场景列表
export const sceneTable = [
  { id: 1, name: '开灯' },
  { id: 2, name: '关灯' },
  { id: 3, name: '会客' },
  { id: 4, name: '欢迎' },
  { id: 5, name: '阅读' },
  { id: 6, name: '起床' },
  { id: 7, name: '娱乐' },
  { id: 8, name: '睡眠' },
  { id: 9, name: '影视' },
  { id: 10, name: '动感' },
  { id: 11, name: '起夜' },
  { id: 12, name: '浪漫' },
  { id: 13, name: '柔和' },
  { id: 14, name: '室外关' },
  { id: 15, name: '用餐' },
  { id: 16, name: '回家' },
  { id: 17, name: '离家' },
  { id: 18, name: '卧室睡眠' },
  { id: 19, name: '卧室起床' },
  { id: 20, name: '卧室阅读' },
  { id: 21, name: '卧室起夜' },
  { id: 22, name: '次卧睡眠' },
  { id: 23, name: '次卧起床' },
  { id: 24, name: '次卧阅读' },
  { id: 25, name: '次卧起夜' },
  { id: 26, name: '老人睡眠' },
  { id: 27, name: '老人起床' },
  { id: 28, name: '老人阅读' },
  { id: 29, name: '老人起夜' },
  { id: 30, name: '儿童睡眠' },
  { id: 31, name: '儿童起床' },
  { id: 32, name: '儿童阅读' },
  { id: 33, name: '儿童起夜' },
  { id: 34, name: '书房睡眠' },
  { id: 35, name: '书房起床' },
  { id: 36, name: '书房阅读' },
  { id: 37, name: '书房起夜' },
  { id: 38, name: '影音睡眠' },
  { id: 39, name: '影音起床' },
  { id: 40, name: '影音阅读' },
  { id: 41, name: '影音起夜' },
  { id: 42, name: '保姆睡眠' },
  { id: 43, name: '保姆起床' },
  { id: 44, name: '保姆阅读' },
  { id: 45, name: '保姆起夜' },
  { id: 46, name: '室外开' },
  { id: 47, name: '门磁开' },
  { id: 48, name: '门磁关' },
  { id: 49, name: 'SOS' }
].map(I=>{ return { ...I, id:String(I.id) }})
// 红外命令定义
export const infraredTable = [
  { id: 100, name: '打开空调' },
  { id: 101, name: '关闭空调' },
  { id: 102, name: '高速风' },
  { id: 103, name: '中速风' },
  { id: 104, name: '低速风' },
  { id: 105, name: '自动风速' },
  { id: 106, name: '停止扫风' },
  { id: 107, name: '开启扫风' },
  { id: 108, name: '十九度' },
  { id: 109, name: '二十度' },
  { id: 110, name: '二十一度' },
  { id: 111, name: '二十二度' },
  { id: 112, name: '二十三度' },
  { id: 113, name: '二十四度' },
  { id: 114, name: '二十五度' },
  { id: 115, name: '二十六度' },
  { id: 116, name: '二十七度' },
  { id: 117, name: '二十八度' },
  { id: 118, name: '二十九度' },
  { id: 119, name: '三十度' },
  { id: 120, name: '制冷模式' },
  { id: 121, name: '制热模式' },
  { id: 122, name: '送风模式' },
  { id: 123, name: '除湿模式' },
  { id: 124, name: '上下扫风' },
  { id: 125, name: '左右扫风' },
  { id: 126, name: '停止扫风' },
  { id: 127, name: '十八度' },
  { id: 128, name: '打开电视' },
  { id: 129, name: '关闭电视' },
  { id: 130, name: '上一个节目' },
  { id: 131, name: '下一个节目' },
  { id: 132, name: '音量增加' },
  { id: 133, name: '音量降低' },
  { id: 134, name: '关闭静音/电视静音' },
  { id: 135, name: '返回主页' },
  { id: 136, name: '打开风扇' },
  { id: 137, name: '关闭风扇' },
  { id: 138, name: '风扇摇头' },
  { id: 139, name: '停止摇头' },
  { id: 140, name: '风速切换' }
].map(I=>{ return { ...I, id:String(I.id) }})
export const equipmentTable = [
  { id: 1, name: '房灯' },
  { id: 2, name: '筒灯' },
  { id: 3, name: '灯带' },
  { id: 4, name: '床头灯' },
  { id: 5, name: '左床灯' },
  { id: 6, name: '右床灯' },
  { id: 7, name: '背景灯' },
  { id: 8, name: '射灯' },
  { id: 9, name: '书桌灯' },
  { id: 10, name: '夜灯' },
  { id: 11, name: '卫灯' },
  { id: 12, name: '浴室灯' },
  { id: 13, name: '镜前灯' },
  { id: 14, name: '穿衣灯' },
  { id: 15, name: '衣柜灯' },
  { id: 16, name: '排气扇' },
  { id: 17, name: '阳台灯' },
  { id: 18, name: '窗帘' },
  { id: 19, name: '窗纱' },
  { id: 21, name: '廊灯' },
  { id: 22, name: '主灯' },
  { id: 23, name: '沙发灯' },
  { id: 24, name: '阅读灯' },
  { id: 25, name: '吊灯' },
  { id: 26, name: '台灯' },
  { id: 27, name: '氛围灯' },
  { id: 28, name: '壁灯' },
  { id: 29, name: '马桶灯' },
  { id: 30, name: '轨道灯' },
  { id: 31, name: '麻将灯' },
  { id: 32, name: '吧灯' },
  { id: 33, name: '仓库灯' },
  { id: 34, name: '电源' },
  { id: 35, name: '浴霸' },
  { id: 36, name: '勿扰' },
  { id: 37, name: '清扫' },
  { id: 38, name: '过道灯' },
  { id: 39, name: '过道灯带' },
  { id: 40, name: '玄关灯' },
  { id: 41, name: '玄关灯带' },
  { id: 42, name: '客厅灯' },
  { id: 43, name: '阳台筒灯' },
  { id: 44, name: '阳台灯带' },
  { id: 45, name: '餐厅灯' },
  { id: 46, name: '餐厅筒灯' },
  { id: 47, name: '餐厅灯带' },
  { id: 48, name: '餐厅吊灯' },
  { id: 49, name: '厨房灯' },
  { id: 50, name: '厨房灯带' },
  { id: 51, name: '厨柜灯' },
  { id: 53, name: '卷帘' },
  { id: 54, name: '退房' },
  { id: 55, name: '空调' },
  { id: 56, name: '电视' },
  { id: 57, name: '地暖' },
  { id: 58, name: '卧室电视' },
  { id: 60, name: '音箱' },
  { id: 61, name: '卧室-房灯' },
  { id: 62, name: '卧室-筒灯' },
  { id: 63, name: '卧室-灯带' },
  { id: 64, name: '卧室-床头灯' },
  { id: 65, name: '卧室-左床灯' },
  { id: 66, name: '卧室-右床灯' },
  { id: 67, name: '卧室-背景灯' },
  { id: 68, name: '卧室-射灯' },
  { id: 69, name: '卧室-书桌灯' },
  { id: 70, name: '卧室-夜灯' },
  { id: 71, name: '卧室-卫灯' },
  { id: 72, name: '卧室-浴室灯' },
  { id: 73, name: '卧室-镜前灯' },
  { id: 74, name: '卧室-穿衣灯' },
  { id: 75, name: '卧室-衣柜灯' },
  { id: 76, name: '卧室-排气扇' },
  { id: 77, name: '卧室-阳台灯' },
  { id: 78, name: '卧室-窗帘' },
  { id: 79, name: '卧室-窗纱' },
  { id: 80, name: '卧室-空调' },
  { id: 81, name: '次卧-房灯' },
  { id: 82, name: '次卧-筒灯' },
  { id: 83, name: '次卧-灯带' },
  { id: 84, name: '次卧-床头灯' },
  { id: 85, name: '次卧-左床灯' },
  { id: 86, name: '次卧-右床灯' },
  { id: 87, name: '次卧-背景灯' },
  { id: 88, name: '次卧-射灯' },
  { id: 89, name: '次卧-书桌灯' },
  { id: 90, name: '次卧-夜灯' },
  { id: 91, name: '次卧-卫灯' },
  { id: 92, name: '次卧-浴室灯' },
  { id: 93, name: '次卧-镜前灯' },
  { id: 94, name: '次卧-穿衣灯' },
  { id: 95, name: '次卧-衣柜灯' },
  { id: 96, name: '次卧-排气扇' },
  { id: 97, name: '次卧-阳台灯' },
  { id: 98, name: '次卧-窗帘' },
  { id: 99, name: '次卧-窗纱' },
  { id: 100, name: '次卧-空调' },
  { id: 101, name: '老人房-房灯' },
  { id: 102, name: '老人房-筒灯' },
  { id: 103, name: '老人房-灯带' },
  { id: 104, name: '老人房-床头灯' },
  { id: 105, name: '老人房-左床灯' },
  { id: 106, name: '老人房-右床灯' },
  { id: 107, name: '老人房-背景灯' },
  { id: 108, name: '老人房-射灯' },
  { id: 109, name: '老人房-书桌灯' },
  { id: 110, name: '老人房-夜灯' },
  { id: 111, name: '老人房-卫灯' },
  { id: 112, name: '老人房-浴室灯' },
  { id: 113, name: '老人房-镜前灯' },
  { id: 114, name: '老人房-穿衣灯' },
  { id: 115, name: '老人房-衣柜灯' },
  { id: 116, name: '老人房-排气扇' },
  { id: 117, name: '老人房-阳台灯' },
  { id: 118, name: '老人房-窗帘' },
  { id: 119, name: '老人房-窗纱' },
  { id: 120, name: '老人房-空调' },
  { id: 121, name: '儿童房-房灯' },
  { id: 122, name: '儿童房-筒灯' },
  { id: 123, name: '儿童房-灯带' },
  { id: 124, name: '儿童房-床头灯' },
  { id: 125, name: '儿童房-左床灯' },
  { id: 126, name: '儿童房-右床灯' },
  { id: 127, name: '儿童房-背景灯' },
  { id: 128, name: '儿童房-射灯' },
  { id: 129, name: '儿童房-书桌灯' },
  { id: 130, name: '儿童房-夜灯' },
  { id: 131, name: '儿童房-卫灯' },
  { id: 132, name: '儿童房-浴室灯' },
  { id: 133, name: '儿童房-镜前灯' },
  { id: 134, name: '儿童房-穿衣灯' },
  { id: 135, name: '儿童房-衣柜灯' },
  { id: 136, name: '儿童房-排气扇' },
  { id: 137, name: '儿童房-阳台灯' },
  { id: 138, name: '儿童房-窗帘' },
  { id: 139, name: '儿童房-窗纱' },
  { id: 140, name: '儿童房-空调' },
  { id: 141, name: '书房-房灯' },
  { id: 142, name: '书房-筒灯' },
  { id: 143, name: '书房-灯带' },
  { id: 144, name: '书房-床头灯' },
  { id: 145, name: '书房-左床灯' },
  { id: 146, name: '书房-右床灯' },
  { id: 147, name: '书房-背景灯' },
  { id: 148, name: '书房-射灯' },
  { id: 149, name: '书房-书桌灯' },
  { id: 150, name: '书房-夜灯' },
  { id: 151, name: '书房-卫灯' },
  { id: 152, name: '书房-浴室灯' },
  { id: 153, name: '书房-镜前灯' },
  { id: 154, name: '书房-穿衣灯' },
  { id: 155, name: '书房-衣柜灯' },
  { id: 156, name: '书房-排气扇' },
  { id: 157, name: '书房-阳台灯' },
  { id: 158, name: '书房-窗帘' },
  { id: 159, name: '书房-窗纱' },
  { id: 160, name: '书房-空调' },
  { id: 161, name: '影音房-房灯' },
  { id: 162, name: '影音房-筒灯' },
  { id: 163, name: '影音房-灯带' },
  { id: 164, name: '影音房-床头灯' },
  { id: 165, name: '影音房-左床灯' },
  { id: 166, name: '影音房-右床灯' },
  { id: 167, name: '影音房-背景灯' },
  { id: 168, name: '影音房-射灯' },
  { id: 169, name: '影音房-书桌灯' },
  { id: 170, name: '影音房-夜灯' },
  { id: 171, name: '影音房-卫灯' },
  { id: 172, name: '影音房-浴室灯' },
  { id: 173, name: '影音房-镜前灯' },
  { id: 174, name: '影音房-穿衣灯' },
  { id: 175, name: '影音房-衣柜灯' },
  { id: 176, name: '影音房-排气扇' },
  { id: 177, name: '影音房-阳台灯' },
  { id: 178, name: '影音房-窗帘' },
  { id: 179, name: '影音房-窗纱' },
  { id: 180, name: '影音房-空调' },
  { id: 181, name: '保姆房-房灯' },
  { id: 182, name: '保姆房-筒灯' },
  { id: 183, name: '保姆房-灯带' },
  { id: 184, name: '保姆房-床头灯' },
  { id: 185, name: '保姆房-左床灯' },
  { id: 186, name: '保姆房-右床灯' },
  { id: 187, name: '保姆房-背景灯' },
  { id: 188, name: '保姆房-射灯' },
  { id: 189, name: '保姆房-书桌灯' },
  { id: 190, name: '保姆房-夜灯' },
  { id: 191, name: '保姆房-卫灯' },
  { id: 192, name: '保姆房-浴室灯' },
  { id: 193, name: '保姆房-镜前灯' },
  { id: 194, name: '保姆房-穿衣灯' },
  { id: 195, name: '保姆房-衣柜灯' },
  { id: 196, name: '保姆房-排气扇' },
  { id: 197, name: '保姆房-阳台灯' },
  { id: 198, name: '保姆房-窗帘' },
  { id: 199, name: '保姆房-窗纱' },
  { id: 200, name: '保姆房-空调' }
].map(I=>{ return { ...I, id:String(I.id) }})