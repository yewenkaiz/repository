<template>
	<view class="lamp-index">
		<!-- :style="{backgroundColor:Switch?'rgb(110, 150, 246)':'rgb(241, 244, 249)'}" -->
		<view style="height: 5px;"></view>
		<view class="lamp-title">
			<view class="lamp-title-bg" style="width: 20px;"></view>
			<view class="lamp-title-text">颜色选择</view>
			<view class="lamp-title-text">{{fx_color(color)}}</view>
			<view class="lamp-title-bg" style="flex: 1;"></view>
		</view>
		<view class="color">
			<view v-if="data.TYPE=='702'" class="color-item" @touchstart="touchstart"
					@touchmove="touchmoveRgb" @touchend="touchendRgb"> 
				<image class="circle-warm" src="../../static/color/circle_rgb.png" mode="" ></image>
				<div class="circle-center-wrap">
					<image class="circle-center" src="../../static/color/circle_center.png" mode="" :style="{transform:`rotate(${rotate}deg)`}"></image>
				</div>
			</view>

			<view v-if="data.TYPE=='701'" class="color-item" @touchstart="touchstart"
					@touchmove="touchmove" @touchend="touchend"> 
				<image class="circle-warm" src="../../static/color/bg_circle_warm_full.png" mode="" ></image>
				<div class="circle-center-wrap">
					<image class="circle-center" src="../../static/color/circle_center.png" mode="" :style="{transform:`rotate(${rotate}deg)`}"></image>
				</div>
			</view>
		</view>
		<view class="lamp-title">
			<view class="lamp-title-bg" style="width: 20px;"></view>
			<view class="lamp-title-text">亮度选择</view>
			<view class="lamp-title-text">{{brightness}}</view>
			<view class="lamp-title-bg" style="flex: 1;"></view>
		</view>
		<view class="slider-cont">
			<view class="slider">
				<slider style="flex: 1;" min='1' max='10' value="5" @change="sliderChange" backgroundColor="#E8E8E8"
					activeColor="#5773FB" />
			</view>
			<!-- <view class="slider-info">
				亮度 {{brightness}}
			</view> -->
		</view>

		<view class="lamp-switch">
			<view :class="Switch?'open':'close'" class="image-cont" @click="Switch_click()">
				<image src="../../static/cl.png" mode=""></image>
			</view>
		</view>
	</view>
</template>
<script>
	let dsq=null
	export default {
		data() {
			return {
				//颜色 亮度 开关
				color: 1,
				brightness: 5,
				Switch: false,
				data: {
					TYPE:'701'
				},
				startPoint:{
					clientX:0,
					clientY:0
				},
				endPoint:{
					clientX:0,
					clientY:0
				},
				rotate : 0,
				lastRotate:0,
				lastEndRotate:0
			}
		},
		onLoad() {
			const query = uni.createSelectorQuery().in(this);
			query.select('.color-item').boundingClientRect(data => {
				const y = data.top+data.height/2
				const x = data.left+data.width/2
				this.centerPoint = {
					clientX:x,
					clientY:y
				}
			}).exec();
			const eventChannel = this.getOpenerEventChannel();
			eventChannel.on('lampData', (data) => {
				this.data = data
				uni.setNavigationBarTitle({
					title: data.NAME
				});
				if (this.data.TYPE == '702') {
					this.rotate = 0
					this.color=2
				} else {
					this.rotate = 250
				}
			})

		},
		methods: {
			sliderChange(e) {
				//更新亮度 延迟请求
				this.brightness = e.detail.value
				if(dsq){
					clearTimeout(dsq)
					dsq=null
				}
				dsq=setTimeout(()=>{
					const STATE = '1' + String(this.brightness).padStart(2,'0')+String(this.color).padStart(2,'0')
					this.setColor(STATE)
					clearTimeout(dsq)
				},1000)
				
			},
			Switch_click() {
				this.$api({
					OBJECT: "WEIFA",
					ACTIVE: 'CONTORL',
					KEYWORD: [{
						STATE: !this.Switch ? '1'+String(this.brightness).padStart(2,'0') + String(this.color).padStart(2,'0') : "0",
						DEVID: this.data.DEVID,
						SCENEID:''
					}],
				}).then(res => {
					this.Switch = !this.Switch
					uni.showToast({
						title:(this.Switch?'开灯':'关灯')+'指令已发送',
						icon:'none'
					})
					this.$forceUpdate()
				})
			},
			 getAngle(x1, y1, x2, y2) {
				// 获取组件的位置信息
				//2个点之间的角度获取
				let c1 = Math.atan2(y1 - this.centerPoint.clientY, x1 - this.centerPoint.clientX) * 180 / (Math.PI);
				let c2 = Math.atan2(y2 - this.centerPoint.clientY, x2 - this.centerPoint.clientX) * 180 / (Math.PI);
				let angle;
				c1 = c1 <= -90 ? (360 + c1) : c1;
				c2 = c2 <= -90 ? (360 + c2) : c2;
				//夹角获取
				angle = Math.floor(c2 - c1);
				angle = angle < 0 ? angle + 360 : angle;
				return angle;
			},
			touchstart(e){
				const {clientX,clientY} = e.changedTouches[0]
				this.startPoint = {
					clientX,clientY
				}
			},
			touchmoveRgb(e){
				const {clientX,clientY} = e.changedTouches[0]
				let angle = this.getAngle(this.startPoint.clientX, this.startPoint.clientY, clientX, clientY);
				let startAngle = this.lastEndRotate;
				let deg;
				// 赋值的旋转角度
				let rotate;
				// 顺时针旋转
				if (clientX - this.startPoint.clientX > 0) {
					deg = startAngle + angle;
					rotate = deg > 360 ? deg - 360 : deg;
					
				} else {
					// 逆时针旋转
					angle = 360 - angle;
					deg = startAngle - angle;
					rotate = deg < 0 ? deg + 360 : deg;
				}
				this.rotate = rotate
			},
			touchmove(e){
				const {clientX,clientY} = e.changedTouches[0]
				let angle = this.getAngle(this.startPoint.clientX, this.startPoint.clientY, clientX, clientY);
				let startAngle = this.lastEndRotate;
				let deg;
				let rotate;
				// 顺时针旋转
				if (clientX - this.startPoint.clientX > 0) {
					deg = startAngle + angle;
					rotate = deg > 360 ? deg - 360 : deg;
					
				} else {
				// 逆时针旋转
				angle = 360 - angle;
				deg = startAngle - angle;
				rotate = deg < 0 ? deg + 360 : deg;
					
				}
				if(this.lastRotate-rotate>0){ // 逆时针旋转
					if(rotate<220&&rotate>140){
						rotate=220
					}
				}else{ //顺时针旋转
					if(rotate<220&&rotate>140){
						rotate=140
					}
				}
				this.rotate = rotate
				this.lastRotate = rotate
			},
			touchendRgb(e){
				const {clientX,clientY} = e.changedTouches[0]
				
				this.endPoint = {
					clientX,clientY
				}
				if(this.rotate>=335||this.rotate<=20){
					console.log('红')
					this.color=2
				}else if(this.rotate>20&&this.rotate<=65){
					console.log('白')
					this.color=1
				}else if(this.rotate>65&&this.rotate<=125){
					console.log('紫')
					this.color=8
				}else if(this.rotate>125&&this.rotate<=170){
					console.log('蓝')
					this.color=7
				}else if(this.rotate>170&&this.rotate<=210){
					console.log('青')
					this.color=6
				}else if(this.rotate>210&&this.rotate<=270){
					console.log('绿')
					this.color=5
				}else if(this.rotate>270&&this.rotate<=300){
					console.log('黄')
					this.color=4
				}else if(this.rotate>300&&this.rotate<332){
					console.log('橙')
					this.color=3
				}
				this.lastEndRotate = this.rotate
				const STATE = '1' + String(this.brightness).padStart(2,'0')+String(this.color).padStart(2,'0')
				this.setColor(STATE)
				
			},
			touchend(e){
				const {clientX,clientY} = e.changedTouches[0]
				
				this.endPoint = {
					clientX,clientY
				}
				let key
				if(this.rotate>=220&&this.rotate<=280){
					key = 1
				}else if(this.rotate>=80&&this.rotate<=140){
					key = 2
				}else {
					key = 3
				}
				this.lastEndRotate = this.rotate
				this.color=key
				const STATE = '1'+ String(this.brightness).padStart(2,'0')+String(key).padStart(2,'0') 
				console.log(this.rotate,STATE)
				this.setColor(STATE)
			},
			setColor(STATE){
				this.$api({
					OBJECT: "WEIFA",
					ACTIVE: 'CONTORL',
					KEYWORD: [{
						DEVID: this.data.DEVID,
						STATE: STATE,
						SCENEID:''
					}],
				}).then(res => {
					this.Switch = true
					this.$forceUpdate()
					uni.showToast({
						title:'调节指令已发送',
						icon:'none'
					})
				})
			},
			fx_color(key){
				if(this.data.TYPE=='702'){
					switch (key){
						case 1:
							return '白';
						case 2:
							return '红';
						case 3:
							return '橙';
						case 4:
							return '黄';
						case 5:
							return '绿';
						case 6:
							return '青';
						case 7:
							return '蓝';
						case 8:
							return '紫';
						default:
							break;
					}
				}else{
					switch (key){
						case 1:
							return '白';
						case 2:
							return '黄';
						case 3:
							return '中';
						default:
							break;
					}
				}
			}
		}
	}
</script>

<style lang="scss">
	.lamp-index {
		width: 100%;
		background-color: rgb(241, 244, 249);
		min-height: 100vh;
		position: relative;

		.lamp-title {
			// background-color: #FFF;
			display: flex;
			justify-content: center;
			align-items: center;
			padding: 5px;
			margin: 5px 0;

			.lamp-title-bg {
				background-color: rgb(235, 237, 240);
				height: 1px;
			}

			.lamp-title-text {
				margin: 5px 10px;
				padding: 2px 5px;
				font-size: 14px;
			}
		}
		.circle-warm{
			width: 201px;
			height: 201px;
		}
		.circle-center-wrap{
			width: 165px;
			height: 165px;
			position: absolute;
			top: 50%;
			left: 50%;
			transform: translate(-50%,-50%);
		}
		.circle-center{
			width: 165px;
			height: 165px;
	
		}
		.color {
			width: 100%;
			padding: 10px 10%;
			box-sizing: border-box;

			.color-item {
				position: relative;
				width: 201px;
				height: 201px;
				margin: 0 auto;
		
			}

			.color-item-RBG {
				width: 80vw;
				height: 30px;
				background-image: linear-gradient(to right, white, white, red, red, orange, orange, yellow, yellow, green, green, cyan, cyan, blue, blue, purple, purple)
			}

			.color-item-LNS {
				width: 100%;
				height: 30px;
				display: flex;

				&>view {
					width: 33.3333%;
					height: 30px;
				}

				.white {
					background-color: #ffffff;
				}

				.center {
					background: linear-gradient(to right bottom,
							rgba(255, 255, 204, 0.6),
							rgba(255, 255, 204, 0.3),
							rgba(255, 255, 204, 0.2));
				}

				.yellow {
					background: linear-gradient(to right bottom,
							rgba(255, 255, 153, 0.6),
							rgba(255, 255, 153, 0.3),
							rgba(255, 255, 153, 0.2));
				}
			}
		}

		.slider-cont {
			width: 100%;

			.slider-info {
				text-align: center;
				margin: 20px 0;
			}

			.slider {
				display: flex;
				justify-content: center;
				align-items: center;

				.slider-tag {
					margin: 5px;
					padding: 5px;
				}
			}

		}

		.lamp-switch {
			position: absolute;
			bottom: 10vh;
			width: 100%;
			padding: 10px;
			display: flex;
			justify-content: center;
			align-items: center;

			.image-cont {
				width: 50px;
				height: 50px;
				border-radius: 25px;
				background-color: rgb(133, 135, 147);
				display: flex;
				justify-content: center;
				align-items: center;
				margin-right: 15px;

				image {
					width: 30px;
					height: 30px;
				}
			}
		}

		.open {
			background-color: rgb(110, 150, 246) !important;
		}

		.close {
			background-color: rgb(133, 135, 147) !important;
		}

	}
</style>
