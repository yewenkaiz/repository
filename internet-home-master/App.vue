<script>
	export default {
		onLaunch: function() {
			wx.onNeedPrivacyAuthorization((resolve) => {
				wx.showModal({
					title: "隐私保护提示",
					content: "需要使用蓝牙功能，请阅读并同意隐私政策",
					confirmText: "同意",
					cancelText: "拒绝",
					success: (res) => {
						if (res.confirm) {
							resolve({ event: "agree" });
						} else {
							resolve({ event: "disagree" });
							wx.showToast({
								title: "需要同意隐私政策才能使用蓝牙配网",
								icon: "none",
								duration: 2000
							});
						}
					},
				});
			});
		},
		onShow: function() {
			console.log("App Show");
		},
		onHide: function() {
			console.log("App Hide");
		},
	};
</script>

<style>
	/*每个页面公共css */

	* {
		box-sizing: border-box;
	}

	uni-page-body,
	page {
		height: 100%;
		color: #34495e;
	}
</style>
