<template>
	<view class="bind-page">
		<image class="bind-banner" src="../../static/bind.png"></image>
		<view class="bind-content">
			<view class="content-Terminal">{{TerminalNumber}}</view>
			<view class="content-current">{{current||'尚未绑定小度'}}</view>
			<view class="content-discovery">{{discovery||'未发现小度'}}</view>
			<view class="content-Tip">
				请先下载小度APP，找到技能 嘉睿客控 并绑定，然后对音箱说 发现设备 然后点刷新
			</view>
			<view class="content-operate">
				<view style="border-right: 1px solid #e8e8e8;" @click="unbind">取消绑定</view>
				<view style="border-right: 1px solid #e8e8e8;" @click="Refresh">刷新</view>
				<view @click="Binding">确定绑定</view>
			</view>
		</view>
	</view>
</template>

<script>
	//绑定页面
	export default {
		data() {
			return {
				TerminalNumber:'',
				current:'',
				discovery:''
			};
		},
		mounted() {
			this.TerminalNumber=this.WEIFA
			this.Refresh()
		},
		methods:{
			Refresh(){
				this.$api({
					OBJECT:'WEIFA',
					ACTIVE:'CUID',
					KEYWORD:[]
				}).then(res=>{
					if(res.KEYWORD.length){
						this.discovery=res.KEYWORD[0].ID
						this.current=res.KEYWORD[0].CURRXD
					}
				})
			},
			Binding(){
				if(!this.discovery){
					uni.showToast({
						title:'未发现小度',
						icon:'error',
						duration:2000
					})
					return
				}
				this.$api({
					OBJECT:'WEIFA',
					ACTIVE:'BOUND',
					KEYWORD:[{
						ID:this.discovery
					}]
				}).then(res=>{
					uni.showToast({
						title:'绑定成功',
						icon:'success',
						duration:2000
					})
				})
			},
			unbind(){
				if(!this.current){
					uni.showToast({
						title:'未绑定小度',
						icon:'error',
						duration:2000
					})
					return
				}
				this.$api({
					OBJECT:'WEIFA',
					ACTIVE:'BOUND',
					KEYWORD:[{
						ID:''
					}]
				}).then(res=>{
					uni.showToast({
						title:'取消绑定成功',
						icon:'success',
						duration:2000
					})
				})
			}
		}
	}
</script>

<style lang="scss" scoped>
.bind-page{
	background-color: rgb(241,244,249);
	height: 100%;
	.bind-banner{
		width: 100%;
	}
	.bind-content{
		background-color: rgb(241,244,249);
		border-radius: 30px 30px 0 0 ;
		transform: translateY(-50px);
		z-index: 1;
		padding: 25px 20px;
		.content-Terminal{
			text-align: center;
			padding: 5px;
			font-weight: 600;
			font-size: 18px;
			color: #000000;
		}
		.content-current{
			text-align: center;
			margin: 10px;
			border-bottom: 1px solid #e8e8e8;
			padding-bottom: 10px;
			font-size: 12px;
		}
		.content-discovery{
			text-align: center;
			border-bottom: 1px solid #e8e8e8;
			padding-bottom: 10px;
			font-size: 12px;
			margin: 10px;
		}
		.content-Tip{
			font-size: 10px;
			text-align: center;
			margin: 10px;
			color: #0000FF;
		}
		.content-operate{
			display: flex;
			border-top: 1px solid #e8e8e8;
			margin-top: 30px;
			&>view{
				width: 33.333333%;
				text-align: center;
				font-size: 16px;
				padding: 20px 0;
			}
		}
	}
}
</style>
