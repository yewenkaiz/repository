<template>
	<view class="ac-page" :style="{backgroundColor:Switch?'rgb(110, 150, 246)':'rgb(133, 135, 147)'}">
		<view class="temperature-info">
			{{temperature_scale}} <text>°C</text>
		</view>
		<view class="mode-info">
			{{CustomerModel}} | {{Windmill}}
		</view>
		<view class="block-wrap controller-wrap">
			<view class="controller-icon" :class="Switch?'open':'close'" @click="Switch_click()">
				<image src="../../static/cl.png" mode=""></image>
			</view>
			开关
		</view>
		<view class="block-wrap">
			<view class="block-title">
				温度 | {{temperature}}°C
			</view>
			<view class="setting-wrap">
				18
				<slider :value="temperature" min="18" max="30" @changing="sliderChange"  activeColor="#6e96f6" />
				30
			</view>
		</view>
		<view class="block-wrap">
			<view class="block-title">
				模式 | {{CustomerModel}}
			</view>
			<view class="mode-wrap">
				<view class="mode-item" v-for="(item,key) in modeList" :key='key'>
					<view class="icon-wrap" @click="mode_click(item,'CustomerModel')">
						<image :src="`../../static/AirConditioner/${item.url}.png`" style="width: 30px;height: 30px;margin: 10px;" ></image>
					</view>
					<view class="">
						{{item.name}}
					</view>
				</view>
				<view class="" v-for="key in 4" :key='key' style="height: 0;width: 72px;"></view>
			</view>
		</view>
		<view class="block-wrap">
			<view class="block-title">
				风速 | {{Windmill}}
			</view>
			<view class="mode-wrap">
				<view class="mode-item" v-for="(item,key) in windVelocity" :key='key'>
					<view class="icon-wrap" @click="mode_click(item,'Windmill')">
						<image :src="`../../static/AirConditioner/${item.url}.png`" style="width: 30px;height: 30px;margin: 10px;" ></image>
					</view>
					<view class="">
						{{item.name}}
					</view>
				</view>
				<view class="" v-for="key in 4" :key='key' style="height: 0;width: 72px;"></view>
			</view>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				temperature:30,
				windVelocity:[
					{name:'开启扫风',url:'start',key:107},
					{name:'停止扫风',url:'end',key:106},
					{name:'自动风速',url:'automatic',key:105},
					{name:'高速风',url:'highWindSpeed',key:102},
					{name:'中速风',url:'highWindSpeed',key:103},
					{name:'低速风',url:'lowWindSpeed',key:104},
					{name:'上下扫风',url:'UpAndDown',key:124},
					{name:'左右扫风',url:'around',key:125}
				],
				modeList:[
					{name:'制冷模式',url:'cryogen',key:120},
					{name:'制热模式',url:'heating',key:121},
					{name:'送风模式',url:'airSupply',key:122},
					{name:'除湿模式',url:'Dehumidification',key:123},
				],
				ShockTemperatureFloor:[
					{name:18,key:127},
					{name:19,key:108},
					{name:20,key:109},
					{name:21,key:110},
					{name:22,key:111},
					{name:23,key:112},
					{name:24,key:113},
					{name:25,key:114},
					{name:26,key:115},
					{name:27,key:116},
					{name:28,key:117},
					{name:29,key:118},
					{name:30,key:119},
				],
				Switch:false,
				STATE:'',
				DEVID:'',
				TimeoutID:null,
				temperature_scale:30,
				CustomerModel:'制冷模式',
				Windmill:'自动风速'
			};
		},
		onLoad(OP) {
			this.STATE=OP.STATE
			this.DEVID=OP.DEVID
			// this.Switch=this.STATE=='30100'?true:false
			this.$api({OBJECT:"WEIFA",ACTIVE:'REQUEST',KEYWORD:[]}).then(res=>{
				console.log(res)
			})
		},
		methods:{
			sliderChange(e) {
				const old=this.temperature
				this.temperature  = e.detail.value
			   if(this.TimeoutID){
				   clearTimeout(this.TimeoutID)
				   this.TimeoutID=null
			   }
			   const key=this.ShockTemperatureFloor.find(item=>{return e.detail.value==item.name }).key
				this.TimeoutID=  setTimeout(()=>{
					if(!this.Switch){
						uni.showToast({
							title:'请打开空调',
							icon:'none',
							duration:1500
						})
						clearTimeout(this.TimeoutID)
						return
					}
					const type = '30'+ String(key)
					this.$api({OBJECT:"WEIFA",ACTIVE:'CONTORL',KEYWORD:[{STATE:type,SCENEID:'',DEVID:this.DEVID}]}).then(res=>{
						this.temperature_scale=e.detail.value
						clearTimeout(this.TimeoutID)
					})
				},1300)
			},
			Switch_click(){
				const type =!this.Switch?'100':'101'
				const data={
					OBJECT:"WEIFA",
					ACTIVE:'CONTORL',
					KEYWORD:[{
						STATE:'30'+ type,
						DEVID:this.DEVID,
						SCENEID:''
					}]
				}
				
				this.$api(data).then(res=>{
					this.Switch=!this.Switch
				})
			},
			mode_click(item,str){
				if(!this.Switch){
					uni.showToast({
						title:'请打开空调',
						icon:'none',
						duration:1500
					})
					return
				}
				const type = '30'+ String(item.key)
				this.$api({OBJECT:"WEIFA",ACTIVE:'CONTORL',KEYWORD:[{STATE:type,SCENEID:'',DEVID:this.DEVID}]}).then(res=>{
					this[str]=item.name
				})
			},
			SERVICE(key){
				const type = '30'+ String(key)
				this.$api({
					OBJECT:"WEIFA",
					ACTIVE:'CONTORL',
					KEYWORD:[
						{STATE:type,SCENEID:'',DEVID:this.DEVID}
					]
				}).then(res=>{
					console.log(res)
				})
			}
		}
	}
</script>

<style lang="scss">
.ac-page{
	background-color: rgb(133,135,147);
	height: 100%;
	padding:25px 15px;
	overflow: scroll;
	.mode-wrap{
		display: flex;
		flex-wrap: wrap;
		justify-content: space-evenly;
		.mode-item{
			display: flex;
			flex-direction: column;
			align-items: center;
			justify-content: center;
			font-size: 14px;
		}
		.icon-wrap{
			border-radius: 100px;
			width: 50px;
			height: 50px;
			border: 1px solid #eeeeee;
			box-shadow: 0 6px 8px #ebedf0;
			margin: 10px;
		}
	}
	.block-wrap{
		box-sizing: border-box;
		width: 100%;
		padding: 20px 15px;
		background-color: #fff;
		border-radius: 10px;
		margin-top: 20px;
	}
	.controller-wrap{
		display: flex;
		align-items: center;
	}
	.setting-wrap{
		display: flex;
		align-items: center;
		font-size: 12px;
		color: #999999;
		slider{
			flex:1;
		}
	}
	.controller-icon{
		width: 50px;
		height: 50px;
		border-radius: 25px;
		background-color: rgb(133,135,147);
		display: flex;
		justify-content: center;
		align-items: center;
		margin-right: 15px;
		image{
			width: 30px;
			height: 30px;
		}
	}
	.block-title{
		margin-bottom: 20px;
	}
	.open{
		background-color: rgb(110,150,246);
	}
	.close{
		background-color: rgb(133,135,147);
	}
	.mode-info{
		color: #ffffff;
		text-align: center;
		font-size: 14px;
		margin-bottom: 50px;
	}
	.temperature-info{
		font-size: 68px;
		color: #ffffff;
		font-weight: 600;
		text-align: center;
		line-height: 110px;
		text{
			font-size: 24px;
			font-weight: 500;
			vertical-align: text-bottom;
		}
	}
}
</style>
