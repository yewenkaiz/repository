<template>
	<view class="index-page">
		<image class="home-banner" src="/static/home_banner.png"></image>
		<view class="gateway-wrapper">
			<gateway-status></gateway-status>
		</view>
		<view class="set" @click="set_click">设置</view>
		<view class="home-content">
			<view class="title-wrap">
				<p class="title">智能场景</p>
				<text class="more" @click="moreminutely">{{thousands?'关闭':'更多'}}</text>
			</view>
			<view class="scroll-wrap">
				<scroll-view  :scroll-x="true"  scroll-left="120" >
					<view class="scroll-view_H">
						<view class="scroll-item" v-for="(item,index) in sceneList" :key="index">
							<view class="icon-wrap" @click="mode_click(item)">
								<image :src="item.url"></image>
							</view>
							<text class="scene-name">{{cutover?item.NAME:sceneSwitch(item.NAME)}}</text>
						</view>
					</view>
				</scroll-view>
				<scroll-view  :scroll-x="true">
					<view class="scroll-view_H">
						<view class="scroll-text" v-for="(item,index) in keyList" :key="index">
							<text class="scene-name" :class="{'active': keyListIndex==index}" @click="selectMap(item,index)">{{cutover?item:wisdom(item)}}</text>
						</view>
					</view>
				</scroll-view>
			</view>
			<view class="device-wrap" >
				<view class="device-item" :class="{'device-item-active': item.STATE==1}" v-for="(item,index) in deviceList" :key="index">
					<!-- 普通设备卡片 -->
					<template v-if='item.TYPE!=301&&item.TYPE!=300&&item.TYPE!=505&&item.TYPE!=510'>
						<view class="device-header">
							<text class="device-name">{{item.NICK_NAME || item.NAME}}<text v-if="item.NICK_NAME" class="origin-name">({{item.NAME}})</text></text>
						</view>
						<view class="device-body">
							<text class="device-state" :class="{'state-on': item.STATE==1}">{{item.STATE==1?'已开启':'已关闭'}}</text>
							<image class="power-icon" :src="item.STATE==1?'/static/open.png':'/static/close.png'" @click.stop="lookupswitch(item)"></image>
						</view>
						<view class="device-footer">
							<text class="timer-btn" @click.stop="goTimer(item)">定时</text>
							<image class="edit-icon" src="/static/icon/edit.png" @click="editDevice(item)"></image>
						</view>
					</template>
					<!-- 窗帘设备卡片 -->
					<template v-else-if="item.TYPE==301||item.TYPE==300">
						<view class="device-header">
							<text class="device-name">{{item.NICK_NAME || item.NAME}}<text v-if="item.NICK_NAME" class="origin-name">({{item.NAME}})</text></text>
						</view>
						<view class="curtain-controls">
							<view class="curtain-btn" @click.stop="Curtains(item,'1')">开启</view>
							<view class="curtain-btn" @click.stop="Curtains(item,'3')">暂停</view>
							<view class="curtain-btn" @click.stop="Curtains(item,'0')">关闭</view>
						</view>
						<view class="device-footer">
							<text class="timer-btn" @click.stop="goTimer(item)">定时</text>
							<image class="edit-icon" src="/static/icon/edit.png" @click="editDevice(item)"></image>
						</view>
					</template>
					<!-- 空调等特殊设备 -->
					<template v-else>
						<view class="device-header">
							<text class="device-name">{{item.NICK_NAME || item.NAME}}<text v-if="item.NICK_NAME" class="origin-name">({{item.NAME}})</text></text>
						</view>
						<view class="device-body">
							<view class="device-state" @click="MoreSettings(item)">点击设置</view>
						</view>
						<view class="device-footer">
							<text class="timer-btn" @click.stop="goTimer(item)">定时</text>
							<image class="edit-icon" src="/static/icon/edit.png" @click="editDevice(item)"></image>
						</view>
					</template>
				</view>
				<view class="none-wrap" v-if="!deviceList.length">
					<image src="../../static/none.png" ></image>
					<text>暂无数据</text>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	import {FilmScreenings,wisdom,sceneSwitch} from '../../utils/commin.js'
	import { getSceneList, getDeviceList, controlDevice } from '../../api/api.js'
	import GatewayStatus from '../../components/gateway-status/gateway-status.vue'
	export default {
		components: {
			GatewayStatus
		},
		data() {
			return {
				sceneList: [],
				deviceList: [],
				mapList:{
					'公区':[],
					'卧室':[],
					'次卧':[],
					'老人房':[],
					'儿童房':[],
					'书房':[],
					'影音房':[],
					'保姆房':[],
				},
				keyList:['公区','卧室','次卧','老人房',  '儿童房' ,'书房', '影音房', '保姆房'],
				keyListIndex:0,
				cutover:true,
				wisdom,
				sceneSwitch
			}
		},
		onShow() {
			uni.getStorage({
				key:'cutover',
				success: (res) => {
					this.cutover=res.data
				}
			})
			this.refreshData()
		},
		onPullDownRefresh() {
			this.refreshData().finally(() => {
				uni.stopPullDownRefresh()
			})
		},
		methods: {
			// 刷新场景和设备数据
			refreshData() {
				const scenePromise = getSceneList().then(res => {
					this.sceneList = (res.KEYWORD || []).map(item => {
						return { ...item, url: `/static/icon/${FilmScreenings(item.NAME)}.png` }
					})
				})
				const devicePromise = this.DeviceList()
				return Promise.all([scenePromise, devicePromise])
			},
			//进入更多
			moreminutely(){
				uni.navigateTo({
					url:'../more/more'
				})
			},
			//开启或者关闭普通的灯
			lookupswitch(item){
				const STATE = item.STATE== 1 ? 0 : 1
				controlDevice({ STATE, DEVID:item.DEVID, SCENEID:"" }).then(res=>{
					this.DeviceList()
				})

			},
			// 编辑设备别名
			editDevice(item) {
				uni.navigateTo({
					url: '../device-edit/device-edit',
					success: (res) => {
						res.eventChannel.emit('deviceData', item)
					}
				})
			},
			// 进入定时页面
			goTimer(item) {
				uni.navigateTo({
					url: '../timer/timer?type=device',
					success: (res) => {
						res.eventChannel.emit('timerData', item)
					}
				})
			},
			//对于特殊的设备进入特殊的页面设置
			MoreSettings(item){
				if(item.TYPE=='505'||item.TYPE=='510'){
					uni.navigateTo({ url:'../ac/ac?STATE='+item.STATE+'&DEVID='+item.DEVID })
					return
				}
				if(item.TYPE=='701'||item.TYPE=='702'){
					uni.navigateTo({ url:'../lamp/index', success: (res) => { res.eventChannel.emit('lampData',item) } })
				}
			},
			//窗帘的开启和关闭
			Curtains(item,key){
				const STATE ='200'+ key.padStart(2,'0')
				controlDevice({ STATE, DEVID:item.DEVID, SCENEID:'' }).then(res=>{
					const  title = (key==0?'关闭':key==1?'开启':'暂停')+item.NAME+'的指令已发送！'
					uni.showToast({ icon:"none", title, duration:3000 })
				})
			},
			//点击进入不同的区域
			selectMap(key,index){
				this.keyListIndex=index
				this.deviceList=this.mapList[key]
			},
			//获取区域
			DeviceList(){
				this.mapList={ '公区':[], '卧室':[], '次卧':[], '老人房':[], '儿童房':[], '书房':[], '影音房':[], '保姆房':[]}
				return getDeviceList().then(res=>{
					res.KEYWORD.forEach(element => {
						// console.log(element)
						if(element.ID*1<=60){
							this.mapList['公区'].push(element)
						}else if(element.ID*1<=80){
							this.mapList['卧室'].push({...element,NAME:element.NAME.replace('卧室','')})
						}else if(element.ID*1<=100){
							this.mapList['次卧'].push({...element,NAME:element.NAME.replace('次卧','')})
						}else if(element.ID*1<=120){
							this.mapList['老人房'].push({...element,NAME:element.NAME.replace('老人房','')})
						}else if(element.ID*1<=140){
							this.mapList['儿童房'].push({...element,NAME:element.NAME.replace('儿童房','')})
						}else if(element.ID*1<=160){
							this.mapList['书房'].push({...element,NAME:element.NAME.replace('书房','')})
						}else if(element.ID*1<=180){
							this.mapList['影音房'].push({...element,NAME:element.NAME.replace('影音房','')})
						}else if(element.ID*1<=200){
							this.mapList['保姆房'].push({...element,NAME:element.NAME.replace('保姆房','')})
						}
					});
					// 对每个区域的设备列表按 ROOM 排序
					Object.keys(this.mapList).forEach(key => {
						// this.mapList[key].sort((a, b) => (a.ROOM || '').localeCompare(b.ROOM || ''))
						this.mapList[key] = this.sortNickNames(this.mapList[key])
					})
					this.deviceList=this.mapList[this.keyList[this.keyListIndex]]
				})
			},
			sortNickNames (arr = []) {
				// 分离数组
				const numberArray = []
				const stringArray = []

				arr.forEach(item => {
					if (/^\d+$/.test(item.NICK_NAME)) {
						numberArray.push(item)
					} else {
						stringArray.push(item)
					}
				})

				// 分别排序
				numberArray.sort((a, b) => parseInt(a.NICK_NAME, 10) - parseInt(b.NICK_NAME, 10))
				stringArray.sort((a, b) => a.NICK_NAME.localeCompare(b.NICK_NAME))

				// 合并返回
				return [...numberArray, ...stringArray]
			},
			//场景开启
			mode_click(obj){
				controlDevice({ STATE:'1', SCENEID:obj.SCENEID, DEVID:'' }).then(res=>{
					uni.showToast({ icon:"none", title:"开启"+obj.NAME+'的指令已发送！', duration:3000 })
				})
			},
			//进入设置
			set_click(){
				uni.navigateTo({ url:'../setting/setting' })
			},
		}
	}
</script>

<style  lang="scss">
.index-page{
	width: 100%;
	height: 100%;
	background-color: rgb(241,244,249);
	position: relative;
	.home-banner{
		width: 100%;
	}
	.set{
		position: absolute;
		color: #FFF;
		top: 15px;
		right: 15px;
		z-index: 11;
	}
	.gateway-wrapper{
		position: absolute;
		top: 15px;
		left: 15px;
		z-index: 10;
	}
	.home-content{
		background-color: rgb(241,244,249);
		border-radius: 30px 30px 0 0 ;
		transform: translateY(-50px);
		z-index: 1;
		padding: 25px 20px;
	}
	.device-wrap{
		// display: flex;
		// flex-wrap: wrap;
		// justify-content: space-between;
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 10px;
		grid-auto-rows: 120px;
		.device-item{
			display: flex;
			justify-content: space-between;
			flex-direction: column;
			background-color: #fff;
			// width: 48%;
			border-radius: 10px;
			padding: 10px 12px;
			box-sizing: border-box;
			border: 1px solid #e8e8e8;
			transition: all 0.3s;
			&.device-item-active{
				border-color: #1890ff;
			}
			&:active{
				background-color: #f7f8fa;
			}
		}
		.device-header{
			display: flex;
			justify-content: space-between;
			align-items: flex-start;
			// margin-bottom: 8px;
		}
		.device-name{
			font-size: 14px;
			font-weight: 500;
			color: #333;
			flex: 1;
			line-height: 1.3;
			.origin-name{
				font-size: 0.8em;
				color: #999;
				font-weight: 400;
			}
		}
		.edit-icon{
			width: 18px;
			height: 18px;
			flex-shrink: 0;
		}
		.device-body{
			display: flex;
			justify-content: space-between;
			align-items: center;
			// margin-bottom: 8px;
		}
		.device-state{
			font-size: 12px;
			color: #999;
		}
		.state-on{
			color: #FDA96B;
		}
		.power-icon{
			width: 20px;
			height: 20px;
		}
		.device-footer{
			display: flex;
			justify-content: space-between;
			align-items: center;
			border-top: 1px solid #f0f0f0;
			padding-top: 6px;
		}
	}
	.timer-btn{
		font-size: 12px;
		color: #1890ff;
	}
	.curtain-controls{
		display: flex;
		justify-content: space-between;
		margin-top: 6px;
	}
	.curtain-btn{
		flex: 1;
		text-align: center;
		padding: 5px 0;
		font-size: 12px;
		color: #666;
		background-color: #f5f5f5;
		border-radius: 4px;
		margin: 0 2px;
		&:first-child{
			margin-left: 0;
		}
		&:last-child{
			margin-right: 0;
		}
		&:active{
			background-color: #e8e8e8;
		}
	}
}
.scroll-view_H {
	white-space: nowrap;
	width: 100%;
}
.scroll-text{
	display: inline-block;
	margin-right: 8px;
	margin-bottom: 12px;
	.scene-name{
		background-color: #fff;
		padding: 8px 16px;
		border-radius: 8px;
		border: 1px solid #e8e8e8;
		font-size: 14px;
		color: #666;
		display: inline-block;
		transition: all 0.3s;
		&.active{
			border-color: #1890ff;
			color: #1890ff;
			background-color: #f0f7ff;
		}
		&:active{
			background-color: #f7f8fa;
		}
	}
}
.scroll-item {
	display: inline-block;
	overflow: visible;
	text-align: center;
	margin-right: 16px;
	margin-bottom: 12px;
	.icon-wrap{
		background-color: #fff;
		width: 70px;
		height: 70px;
		border-radius: 10px;
		margin-bottom: 8px;
		border: 1px solid #e8e8e8;
		display: flex;
		align-items: center;
		justify-content: center;
		transition: all 0.3s;
		image{
			width: 40px;
			height: 40px;
		}
		&:active{
			background-color: #f7f8fa;
			border-color: #1890ff;
		}
	}
	.scene-name{
		font-size: 12px;
		white-space:pre-wrap;
		width: 70px;
		height: 32px;
		display: inline-block;
		color: #666;
		line-height: 1.2;
	}

}
.title-wrap{
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 20px;
	.title{
		font-size: 16px;
		font-weight: 600;
		color: #333;
	}
	.more{
		font-size: 14px;
		color: #999999;
	}
}
.scroll-wrap{
	margin-bottom: 20px;
}
.none-wrap{
	width: 100%;
	text-align: center;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	image{
		width: 300px;
		height: 300px;
	}
}
</style>
