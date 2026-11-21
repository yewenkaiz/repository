<template>
	<view class="setting-page">
		<view class="setting-item" @click="xiaodu">
			<view class="setting-title">
				绑定小度
			</view>
			<view class="icon-wrap">
				<image src="../../static/right.png" mode="" ></image>
			</view>
		</view>
		<view class="setting-item" @click="pws">
			<view class="setting-title">
				修改密码
			</view>
			<view class="icon-wrap">
				<image src="../../static/right.png" mode="" ></image>
			</view>
		</view>
		<view class="setting-item" @click="again">
			<view class="setting-title">
				重新登录
			</view>
			<view class="icon-wrap">
				<image src="../../static/right.png" mode="" ></image>
			</view>
		</view>
		<view class="setting-item" @click="gateway">
			<view class="setting-title">
				设置网关
			</view>
			<view class="icon-wrap">
				<image src="../../static/right.png" mode="" ></image>
			</view>
		</view>
		<view class="setting-item" @click="cutover_click">
			<view class="setting-title">
				{{cutover? "智慧办公":"智慧家庭"}}
			</view>
			<view class="icon-wrap">
				<image src="../../static/right.png" mode="" ></image>
			</view>
		</view>
		<!-- <view class="setting-item">
			<view class="setting-title">
				关于我们
			</view>
			<view class="icon-wrap">
				<image src="../../static/right.png" mode="" ></image>
			</view>
		</view> -->
	</view>
</template>

<script>
	export default {
		data() {
			return {
				cutover:true
			};
		},
		onLoad() {
		uni.getStorage({
			key:'cutover',
			success: (res) => {
				console.log(res)
				this.cutover=res.data
			}
		})
		},
		methods:{
			xiaodu(){
				uni.navigateTo({
					url:'../bind/bind'
				})
			},
			again(){
				uni.$emit('clear')
				uni.reLaunch({
					url:'../login/login'
				})
			},
			pws(){
				uni.navigateTo({
					url:'../pws/pws'
				})
			},
			gateway(){
				uni.navigateTo({
					url:'../airkiss/airkiss'
				})
			},
			cutover_click(){
				uni.setStorage({
					key:"cutover",
					data:!this.cutover,
					success: () => {
						uni.navigateBack()
					}
				})
			}
		}
	}
</script>

<style lang="scss">
.setting-page{
	height: 100%;
	background-color: #efeff4;
	.setting-item{
		background-color: #fff;
		border-bottom: 1px solid #e5e5e5;
		padding: 12px ;
		display: flex;
		justify-content: space-between;
		align-items: center;
		.icon-wrap{
			width: 20px;
			height: 20px;
			image{
				width: 20px;
				height: 20px;
			}
		}
	}
}
</style>
