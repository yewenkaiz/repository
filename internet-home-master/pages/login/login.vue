<template>
	<view class="login-page">
		<image class="bg" src="/static/webp.png"></image>
		<div class="filter"></div>
		<div class="input-wrap">
			<div class="input-item">
				<input placeholder-class="font-color" class="input" type="text" v-model="equipment" placeholder="设备编号" />
				<image class="code" src="/static/code1.png" @click="hashCode"></image>
			</div>
			<div class="input-item">
				<input placeholder-class="font-color" class="input" :type="text" :password="!pwdShow" v-model="password" placeholder="登录密码" />
				<image v-show="pwdShow" class="code" src="/static/pwd_close.png" @click="changePwd"></image>
				<image v-show="!pwdShow" class="code" src="/static/pwd_open.png" @click="changePwd"></image>
			</div>
			<div class="btn-login" @click='login'>登录</div>
		</div>
		<div @click="open" class="info-text">账号列表</div>
		<div @click="Retrieve" class="info-Retrieve">找回密码</div>
		<div @click="goAirkiss" class="info-airkiss">设备配网</div>
		<uni-popup ref="popup" type="bottom">
			<div class="account-list">
				<div class="account-item" v-for="(item,index) in list" :key="index">
					<div class="item-name" @click="account_click(item)">{{item.acount}} <div @click.stop="openNick(item)" class="mark-btn">{{item.nick?item.nick:'设置别名'}}</div> </div>

					<text style="float: right;color: #707070;" @click="del(index)"> X </text>
				</div>

			</div>
		</uni-popup>
		<uni-popup ref="nick" type="dialog">
			<uni-popup-dialog title="设置别名" mode="input" message="成功消息" :duration="2000" :before-close="true" @close="closeNick" @confirm="saveNick"></uni-popup-dialog>
		</uni-popup>
	</view>
</template>

<script>
	import Vue from 'vue'
	export default {
		data() {
			return {
				equipment: '',
				password: '',
				list: [],
				userNick:'',
				currentItem:{},
				pwdShow:false
			}
		},
		computed: {
			// 账号自动取设备号后6位
			GetUserAccount() {
				return this.equipment ? this.equipment.slice(-6) : ''
			}
		},
		mounted() {
			// 从本地存储读取数据
			const listData = uni.getStorageSync('list')
			this.list = listData ? JSON.parse(listData) : []
			this.equipment = uni.getStorageSync('equipment') || ''
			this.password = uni.getStorageSync('password') || ''
		},
		methods: {
			// 保存账号列表到本地存储
			saveList() {
				uni.setStorageSync('list', JSON.stringify(this.list))
			},
			hashCode(){
				uni.scanCode({
					onlyFromCamera:false,
					scanType:"qrCode",
					success:(res)=>{
						this.equipment=res.result
						this.password=''
					},
					fail: (err) => {
						uni.showToast({
							title:err.errMsg,
							icon:'none'
						})
					}
				})
			},
			changePwd(){
				this.pwdShow = !this.pwdShow
			},
			account_click(item){
				this.equipment=item.acount
				this.password=item.pwd
				this.$refs.popup.close()
			},
			open() {

				//通过组件定义的ref调用uni-popup方法 ,如果传入参数 ，type 属性将失效 ，仅支持 ['top','left','bottom','right','center']
				if (this.list.length > 0) {
					this.$refs.popup.open('bottom')
				} else {
					uni.showToast({
						title: '暂无历史账号',
						icon: 'error',
						duration: 3000
					})
				}
			},
			Retrieve(){
				uni.navigateTo({
					url:'../Retrieve/Retrieve'
				})
			},
			goAirkiss() {
				uni.navigateTo({
					url: '../airkiss/airkiss'
				})
			},
			del(key){
				this.list.splice(key,1)
				this.saveList()
			},
			saveNick(userNick){
				let that = this
				this.$api({
					OBJECT: this.currentItem.acount.slice(this.currentItem.acount.length-6),
					ACTIVE: 'USERNICK',
					KEYWORD: [{
						USER: this.currentItem.acount.slice(this.currentItem.acount.length-6),
						PWD: this.currentItem.pwd,
						USER_NICK: userNick
					}]
				}).then(res => {
					this.list.forEach((item,index)=>{
						if(item.acount===that.currentItem.acount){
							that.currentItem.nick = userNick
							that.$set(that.list,index,that.currentItem)
							that.saveList()
						}
					})
					this.closeNick()
				})
			},
			openNick(item){
				this.currentItem = item
				this.$refs.nick.open()
			},
			closeNick(){
				this.$refs.nick.close()
			},
			login() {
				if (!this.equipment) {
					uni.showToast({
						title: '请填写设备编号',
						icon: 'error',
						duration: 2000
					})
					return
				}
				if (!this.password) {
					uni.showToast({
						title: '请填写登录密码',
						icon: 'error',
						duration: 2000
					})
					return
				}
				this.$api({
					OBJECT: this.equipment,
					ACTIVE: 'LOGMAC',
					KEYWORD: [{
						USER: this.GetUserAccount,
						PWD: this.password,
						WXID: ''
					}]
				}).then(res => {
					uni.reLaunch({ url: '../index/index' })
					Vue.prototype.$account=this.GetUserAccount
					this.$api({ OBJECT: this.GetUserAccount, ACTIVE: 'GETNICK', KEYWORD: [] },true).then(res => {
						let mark = false // 查看本地有没有这条账号记录
						this.list.forEach((item,index)=>{
							if(item.acount===this.equipment){
								mark = true
								this.$set(this.list,index,{nick:res.KEYWORD[0].USER_NICK,acount:this.equipment,pwd:this.password})
							}
						})
						if(!mark){
							this.list.push({acount:this.equipment,pwd:this.password,nick:res.KEYWORD[0].USER_NICK})
						}
						this.saveList()
					}).catch(()=>{
						let mark = this.list.some((item)=>{
							return item.acount === this.equipment
						})
						if(!mark){
							this.list.push({acount:this.equipment,pwd:this.password,nick:''})
						}
						this.saveList()
					})
					// 保存登录信息到本地
					uni.setStorageSync('equipment', this.equipment)
					uni.setStorageSync('password', this.password)

				})
			}
		}
	}
</script>

<style lang="scss">
	.font-color {
		color: #fff;
	}

	.login-page {
		height: 100%;
		overflow: hidden;

		.info-text {
			display: inline-block;
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
		.info-Retrieve{
			color: #fff;
			padding: 6px 0;
			margin-top: 15px;
			margin-right: 10%;
			display: inline-block;
			float: right;
			font-size: 12px;
		}
		.info-airkiss {
			color: #fff;
			padding: 6px 0;
			margin-top: 15px;
			margin-right: 10%;
			display: inline-block;
			float: right;
			font-size: 12px;
			margin-left: 10px;
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
			display: flex;
			justify-content: space-between;
			padding: 8px 14px;
			border-bottom: 1px solid #eee;
			.item-name{
				display: flex;width: 70%;
				align-items: center;
			}
		}
		.mark-btn{
			margin-left: 10px;
			font-size: 12px;
			color: #5c5c5c;
			padding: 3px 5px;
			border: 1px solid #eee;
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
			margin-top: 40%;
			display: flex;
			justify-content: center;
			flex-wrap: wrap;

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
				z-index: 99;
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
