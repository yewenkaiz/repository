<template>
	<view class="pws-page">
		<image class="bg" src="/static/webp.png"></image>
		<div class="filter"></div>
		<div class="input-wrap">
			<input placeholder-class="font-color" class="input"  v-model="GetUserAccount" placeholder="账号" />
			<!-- <input placeholder-class="font-color" class="input"  v-model="user" placeholder="用户" /> -->
			<input placeholder-class="font-color" class="input"  v-model="phone" placeholder="手机号码" />
			<div class="btn-login" @click='UPPws'>找回密码</div>
		</div>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				GetUserAccount: '',
				phone:'',
				user:''
			}
		},
		mounted() {
			
		},
		methods: {
			UPPws() {
				if (!this.GetUserAccount) {
					uni.showToast({
						title: '请填写账号',
						icon: 'error',
						duration: 2000
					})
					return
				}
				// if (!this.user) {
				// 	uni.showToast({
				// 		title: '请填写用户',
				// 		icon: 'error',
				// 		duration: 2000
				// 	})
				// 	return
				// }
				if (!this.phone) {
					uni.showToast({
						title: '请填写手机号码',
						icon: 'error',
						duration: 2000
					})
					return
				}
				if(!/^1(3\d|4[5-9]|5[0-35-9]|6[567]|7[0-8]|8\d|9[0-35-9])\d{8}$/.test(this.phone)){
					uni.showToast({
						title: '手机号有误',
						icon: 'error',
						duration: 2000
					})
					return
				}
				this.$api({
					OBJECT: this.GetUserAccount,
					ACTIVE: 'GETPWD',
					KEYWORD: [{
						USER: this.GetUserAccount,
						PHONE_ID:this.phone
					}]
				}).then(res => {
					console.log(res)
					uni.showModal({
						title:"密码找回成功",
						content:'当前密码为：'+res.KEYWORD[0].PWD+'，请牢记密码，重新登录账号！',
						showCancel:false,
						confirmText:'确认',
						success: (res)=> {
						    if (res.confirm) {
						      console.log('用户点击确定')
							  uni.navigateBack()
						    } else if (res.cancel) {
						      console.log('用户点击取消')
						    }
						  }
					})
					
				})
			}
		}
	}
</script>

<style lang="scss">
	.font-color {
		color: #fff;
	}

	.pws-page {
		height: 100%;
		overflow: hidden;

		.info-text {
			color: #fff;
			padding: 6px 0;
			margin-top: 15px;
			border: 1px solid rgb(48, 174, 102);
			width: 100px;
			text-align: center;
			border-radius: 100px;
			font-size: 12px;
			margin-left: 10%;
		}

		.account-list {
			padding-left: 15px;
			margin-top: 25px;
			height: 160px;
			background: #fff;
			overflow: scroll;
			color: #414141;
		}

		.account-item {
			padding: 8px 14px;
			border-bottom: 1px solid #eee;
		}

		.btn-login {
			background: rgb(48, 174, 102);
			width: 80%;
			height: 48px;
			border-radius: 100px;
			padding: 10px 15px;
			display: flex;
			justify-content: center;
			align-content: center;
			color: #fff;
			box-sizing: border-box;
			font-size: 18px;
		}

		.input-wrap {
			width: 100%;
			display: flex;
			justify-content: center;
			flex-wrap: wrap;
			padding-top: 20%;

		}
		.input-account{
			width: 100%;
			text-align: center;
			margin-top: 20%;
			margin-bottom: 20px;
			color: #FFFFFF;
		}

		.input-item {
			display: flex;
			justify-content: center;
			align-items: center;
			position: relative;
			width: 80%;

			.code {
				box-sizing: content-box;
				position: absolute;
				right: 10px;
				top: 11%;
				width: 30px;
				height: 30px;
				padding: 3px;

				&:active {
					opacity: .5;
				}
			}

			input {
				width: 100%;
			}
		}

		.input {
			box-sizing: border-box;
			height: 48px;
			border: 1px solid #fff;
			border-radius: 100px;
			width: 80%;
			margin-bottom: 15px;
			text-align: center;
			color: #fff;
		}

		.bg {
			width: 100%;
			height: 100%;
			position: absolute;
			z-index: -2;
		}

		.filter {
			width: 100%;
			height: 100%;
			content: '';
			position: absolute;

			z-index: -1;
			background: linear-gradient(to right bottom,
					rgba(44, 44, 69, 0.6),
					rgba(44, 44, 69, 0.3),
					rgba(44, 44, 69, 0.2));
			backdrop-filter: blur(3px);
		}
	}
</style>
