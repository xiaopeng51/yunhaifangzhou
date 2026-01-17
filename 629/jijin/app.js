// jijin/app.js

// 确保在 Vue 实例创建前，配置对象已存在
if (typeof window.licaiAppConfig === 'undefined') {
    alert('应用配置加载失败，请刷新页面！');
    // 或者可以抛出错误来中断执行
    throw new Error('Licai App aonfiguration is missing.');
}

var vm = new Vue({
    el: "#licai",
    data: {
        // 基本状态
        apiTimestamp: window.licaiAppConfig.apiTimestamp,
        apiToken: window.licaiAppConfig.apiToken,
        loading: false,
        submitLoading: false,
        activeTab: 'tuijian',
        
        // 列表数据
        tuijianList: [],
        myList: [],
        
        // 用户钱包和状态
        user_money: '0.00',
        tixian_in_progress: '0.00',
        isAccountOpened: false,
        
        // 开户弹窗
        kaihuDialogVisible: false,
        kaihuForm: { alipay_xingming: '', alipay_zhanghao: '', anquanma: '' },
        
        // 购买弹窗
        buyDialogVisible: false,
        buyForm: { jjid: null, name: '', amount: '' },

        // 卖出弹窗
        sellDialogVisible: false,
        sellForm: { jjid: null, name: '', amount: '', chiyou: 0 },
        
        // 提现弹窗
        tixianDialogVisible: false,
        tixianForm: { amount: '' },
        
        // 兑换弹窗
        zonghuanDialogVisible: false,
        zonghuanForm: { amount: '' },
        
         // 充值弹窗 (新增)
    chargeDialogVisible: false,
    chargeForm: { amount: '' },
        
        // 通用交易密码验证弹窗
        passwordDialogVisible: false,
        transactionPassword: '',
        pendingTransaction: { type: '', payload: {} 
            
        }
    },
    methods: {
        // 准备API请求参数
        getApiParams: function(extraParams = {}) {
            const params = new URLSearchParams();
            params.append('timestamp', this.apiTimestamp);
            params.append('token', this.apiToken);
            for (const key in extraParams) {
                params.append(key, extraParams[key]);
            }
            return params;
        },

        // 获取用户状态和钱包信息
        updateUserStatusAndWallet: function() {
            axios.post('/apisub/licaijijin/my_user.php?act=check_status', this.getApiParams())
                .then(res => {
                    if (res.data.code === 1) {
                        this.isAccountOpened = res.data.opened;
                        this.user_money = res.data.money;
                        this.tixian_in_progress = res.data.tixian_amount;
                        if (!this.isAccountOpened) {
                            this.kaihuDialogVisible = true;
                        }
                    } else {
                        this.$message.error(res.data.msg || '获取用户信息失败');
                    }
                }).catch(err => {
                    console.error("获取用户状态和钱包信息失败: ", err);
                    this.$message.error("网络错误，无法获取您的账户信息");
                });
        },

        // 切换标签页
        handleTabClick: function(tab) {
            if (tab.name === 'tuijian') this.getTuijian();
            else if (tab.name === 'my') this.getMyFunds();
            else if (tab.name === 'wallet') this.updateUserStatusAndWallet();
        },

        // 获取推荐基金列表
        getTuijian: function() {
            this.loading = true;
            axios.post('/apisub/licaijijin/class.php?act=tuijian', this.getApiParams())
                .then(response => {
                    this.loading = false;
                    if (response.data.code == 1) this.tuijianList = response.data.data;
                    else this.$message.error(response.data.msg);
                }).catch(() => { this.loading = false; this.$message.error('网络错误'); });
        },

        // 获取我的基金列表
        getMyFunds: function() {
            this.loading = true;
            axios.post('/apisub/licaijijin/class.php?act=my', this.getApiParams())
                .then(response => {
                    this.loading = false;
                    if (response.data.code == 1) this.myList = response.data.data;
                    else this.$message.error(response.data.msg);
                }).catch(() => { this.loading = false; this.$message.error('网络错误'); });
        },

        // 开户相关
        submitKaihu: function() {
            this.submitLoading = true;
            const params = this.getApiParams(this.kaihuForm);
            axios.post('/apisub/licaijijin/my_user.php?act=kaihu', params)
                .then(res => {
                    this.submitLoading = false;
                    if (res.data.code === 1) {
                        this.$message.success('开户成功！');
                        this.kaihuDialogVisible = false;
                        this.isAccountOpened = true;
                    } else {
                        this.$message.error(res.data.msg);
                    }
                }).catch(() => { this.submitLoading = false; });
        },
        
        // 提交充值请求
    submitCharge: function() {
            if (!this.chargeForm.amount || parseFloat(this.chargeForm.amount) <= 0) {
                this.$message.error('请输入有效的充值金额');
                return;
            }
            
            this.submitLoading = true;
            const params = new URLSearchParams();
            params.append('amount', this.chargeForm.amount);
            
            axios.post('/apisub/licaijijin/pay.php', params)
                .then(res => {
                    this.submitLoading = false;
                    if (res.data.code === 1) {
                        this.$message.success('正在跳转到支付页面...');
                        // 【核心改动】直接跳转页面
                        window.location.href = res.data.payurl;
                    } else {
                        this.$message.error(res.data.msg || '创建支付订单失败');
                    }
                }).catch(() => {
                    this.submitLoading = false;
                    this.$message.error('网络请求失败');
                });
        },


        // 各类操作弹窗的打开函数
        openBuyDialog: function(item) {
            this.buyForm.jjid = item.jjid;
            this.buyForm.name = item.name;
            this.buyForm.amount = '';
            this.buyDialogVisible = true;
        },
        openSellDialog: function(item) {
            if(this.activeTab !== 'my' || !item.chiyou){
                return this.$message.error('请在【我的】页面操作您已持有的基金。');
            }
            this.sellForm.jjid = item.jjid;
            this.sellForm.name = item.name;
            this.sellForm.chiyou = item.chiyou;
            this.sellForm.amount = '';
            this.sellDialogVisible = true;
        },
        openTixianDialog: function() {
            this.tixianForm.amount = '';
            this.tixianDialogVisible = true;
        },
        openZonghuanDialog: function(){
            this.zonghuanForm.amount = '';
            this.zonghuanDialogVisible = true;
        },
        // 打开充值弹窗
    openChargeDialog: function() {
        this.chargeForm.amount = '';
        this.chargeDialogVisible = true;
    },

        // 启动交易流程 (已修改验证逻辑以支持小数)
initiateTransaction: function(type) {
    this.pendingTransaction.type = type;
    let payload = {};
    let isValid = true;

    // 将金额转换为浮点数并进行验证的辅助函数
    const validateAmount = (amountStr) => {
        if (!amountStr || isNaN(parseFloat(amountStr))) {
            return null; // 无效输入
        }
        return parseFloat(amountStr);
    };

    if (type === 'buy') {
        const amount = validateAmount(this.buyForm.amount);
        if (amount === null) {
            this.$message.error('请输入有效的购买金额');
            isValid = false;
        } else if (amount < 100) { // 【修改点1】只检查是否低于100
            this.$message.error('购买金额最低100元');
            isValid = false;
        } else {
            payload = { ...this.buyForm }; // payload中仍然是字符串形式的amount
            this.buyDialogVisible = false;
        }

    } else if (type === 'sell') {
        const amount = validateAmount(this.sellForm.amount);
        const chiyou = parseFloat(this.sellForm.chiyou);
        if (amount === null || amount <= 0) { // 【修改点2】不再检查是否为整数
            this.$message.error('请输入有效的正数卖出金额');
            isValid = false;
        } else if (amount > chiyou) {
            this.$message.error('卖出金额不能超过您的持有金额');
            isValid = false;
        } else {
            payload = { ...this.sellForm };
            this.sellDialogVisible = false;
        }

    } else if (type === 'tixian') {
        const amount = validateAmount(this.tixianForm.amount);
        const userMoney = parseFloat(this.user_money);
        if (amount === null || amount < 100) { // 【修改点3】允许小数，但保留最低100的限制
            this.$message.error('提现金额最少100元');
            isValid = false;
        } else if (amount > userMoney) {
            this.$message.error('提现金额不能超过基金钱包余额');
            isValid = false;
        } else {
            payload = { ...this.tixianForm };
            this.tixianDialogVisible = false;
        }
        
    } else if (type === 'zonghuan') {
        const amount = validateAmount(this.zonghuanForm.amount);
        const userMoney = parseFloat(this.user_money);
        if (amount === null || amount < 100) { // 【修改点4】允许小数，但保留最低100的限制
            this.$message.error('兑换金额最少100元');
            isValid = false;
        } else if (amount > userMoney) {
            this.$message.error('兑换金额不能超过基金钱包余额');
            isValid = false;
        } else {
            payload = { ...this.zonghuanForm };
            this.zonghuanDialogVisible = false;
        }
    }
    
    if (!isValid) return;

    this.pendingTransaction.payload = payload;
    this.transactionPassword = '';
    this.passwordDialogVisible = true;
},

        // 最终确认交易
        confirmTransaction: function() {
            if (!this.transactionPassword || this.transactionPassword.length !== 6) {
                return this.$message.error('请输入6位交易密码');
            }
            
            this.submitLoading = true;
            const type = this.pendingTransaction.type;
            let payload = this.pendingTransaction.payload;
            payload.password = this.transactionPassword;

            let url = '';
            if (type === 'buy') url = '/apisub/licaijijin/my_jijin.php?act=add';
            else if (type === 'sell') url = '/apisub/licaijijin/my_jijin.php?act=sell';
            else if (type === 'tixian') url = '/apisub/licaijijin/my_user.php?act=tixian';
            else if (type === 'zonghuan') url = '/apisub/licaijijin/my_user.php?act=zonghuan';

            axios.post(url, this.getApiParams(payload))
                .then(res => {
                    this.submitLoading = false;
                    if (res.data.code === 1) {
                        this.$message.success(res.data.msg);
                        this.passwordDialogVisible = false;
                        this.updateUserStatusAndWallet();
                        this.getTuijian();
                        this.getMyFunds();
                    } else {
                        this.$message.error(res.data.msg);
                    }
                }).catch(() => { this.submitLoading = false; this.$message.error('网络请求失败'); });
        },
        
        // 关闭弹窗前的处理函数
        handleClose: function() {
            this.buyDialogVisible = false;
        }
    },
    mounted() {
        // 页面加载时获取用户状态和推荐列表
        this.updateUserStatusAndWallet();
        this.getTuijian();
    }
});