/**
 * 项目列表管理逻辑
 * 路径：js/listguanli.js
 */
new Vue({
    el: "#orderlist",
    data: {
        row: null,
        phone: '',
        lastClickTimes: {}, // 保存每个 oid 的上次点击时间
        sex: [],
        ddinfo3: {
            status: false,
            info: []
        },
        dc: [],
        dc2: {
            gs: 1
        },
        cx: {
            status_text: '',
            dock: '',
            qq: '',
            kcname: '',
            process: '',
            school: '',
            remarks: '',
            detailed: '',
            oid: '',
            cid: '',
            name: '',
            hid: '',
            uid: '',
            limit: 30, // 确保这里默认为 30
        },
        classes: [],  // 用于存储从后台获取的商品类别数据
        filteredClasses: [],  // 用于存储过滤后的商品类别数据
        selectedClassName: '', // 用于存储选中的类别名称
        debounceTimeout: null,  // 防抖定时器
        yidnew: '',
    },
    computed: {
        /**
         * 检测是否是移动设备
         */
        isMobileDevice() {
            return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        },

        /**
         * 智能生成分页页码数组
         */
        pages() {
            if (!this.row || !this.row.last_page) return [];
            const { current_page, last_page } = this.row;
            const range = 2; 
            let pages = [];

            for (let i = 1; i <= last_page; i++) {
                if (i === 1 || i === last_page || (i >= current_page - range && i <= current_page + range)) {
                    pages.push(i);
                }
            }
            
            let result = [];
            let last = 0;
            for (const page of pages) {
                if (last !== 0 && page > last + 1) {
                    result.push('...'); 
                }
                result.push(page);
                last = page;
            }
            return result;
        }
    },
    methods: {
        getclasses() {
            this.$http.post("/apisub/class/fenlei.php?act=getclasslist", {})
                .then(response => {
                    if (response.data.code === 1) {
                        this.classes = response.data.classes;
                        this.filteredClasses = this.classes;
                    } else {
                        console.error("Failed to load classes:", response.data.msg);
                    }
                })
                .catch(error => {
                    console.error("Error fetching classes:", error);
                });
        },
        debouncedFilterClasses() {
            clearTimeout(this.debounceTimeout);
            this.debounceTimeout = setTimeout(() => {
                this.filterClasses();
            }, 300);
        },
        filterClasses() {
            if (this.cx.name.trim() === '') {
                this.filteredClasses = this.classes;
            } else {
                this.filteredClasses = this.classes.filter(item =>
                    item.name.toLowerCase().includes(this.cx.name.toLowerCase())
                );
            }
        },
        handleSelectChange() {
            if (this.selectedClassName) {
                this.cx.name = this.selectedClassName;
                this.filterClasses();
            } else {
                this.cx.name = '';
                this.filterClasses();
            }
        },
        get: function (page) {
            var load = layer.load();
            var data = {
                cx: this.cx,
                page: page
            };
            this.$http.post("/apisub/list/list.php?act=htorderlist", data, {
                emulateJSON: true
            }).then(function (data) {
                layer.close(load);
                if (data.data.code == 1) {
                    this.row = data.body;
                } else {
                    layer.msg(data.data.msg, { icon: 2 });
                }
            });
        },
        bs: function (oid) {
            var load = layer.load();
            var _this = this;
            $.get("/apisub/list/bs.php?act=budan&oid=" + oid, function (data) {
                layer.close(load);
                if (data.code == 1) {
                    _this.get(_this.row.current_page);
                    layer.msg(data.msg, { icon: 1, time: 3000 });
                } else {
                    layer.msg(data.msg, { icon: 2, time: 3000 });
                }
            });
        },
        up: function (oid) {
            var currentTime = new Date().getTime();
            this.lastClickTimes[oid] = currentTime;
            var _this = this;
            var load = layer.load();
            layer.msg("正在努力获取中....", { icon: 4 });
            $.get("/apisub/list/up.php?act=up&oid=" + oid, function (data) {
                layer.close(load);
                if (data.code == 1) {
                    _this.get(_this.row.current_page);
                    setTimeout(function () {
                        for (var i = 0; i < _this.row.data.length; i++) {
                            if (_this.row.data[i].oid == oid) {
                                _this.ddinfo3.info = _this.row.data[i];
                                return true;
                            }
                        }
                    }, 1800);
                    layer.msg(data.msg, { icon: 1 });
                } else {
                    layer.msg(data.msg, { icon: 2 });
                }
            });
        },
        plup: function (a) {
            var load = layer.load();
            var _this = this;
            $.post("/apisub/list/up.php?act=plup&a=" + a, { sex: this.sex, type: 1 }, { emulateJSON: true }).then(function (data) {
                layer.close(load);
                var res = data.body || data; // 处理 vue-resource 兼容性
                if (res.code == 1) {
                    _this.sex = [];
                    _this.get(_this.row.current_page);
                    layer.msg(res.msg, { icon: 1 });
                } else {
                    layer.msg(res.msg, { icon: 2 });
                }
            });
        },
        upyid: function () {
            if (this.sex.length === 0) {
                layer.msg("请先选择订单！", { icon: 2 });
                return false;
            }
            if (!this.yidnew) {
                layer.msg("请输入YID！", { icon: 2 });
                return false;
            }
            var load = layer.load();
            this.$http.post("/apisub/list/up.php?act=yidup", {
                sex: this.sex,
                yidnew: this.yidnew
            }, { emulateJSON: true })
                .then(function (response) {
                    layer.close(load);
                    if (response.data.code == 1) {
                        this.sex = [];
                        this.yidnew = '';
                        this.get(this.row.current_page);
                        layer.msg(response.data.msg, { icon: 1 });
                    } else {
                        layer.msg(response.data.msg, { icon: 2 });
                    }
                });
        },
        duijie: function (oid) {
            var _this = this;
            layer.confirm('确定处理么?', { title: '温馨提示', icon: 4, btn: ['确定', '取消'] }, function () {
                var load = layer.load();
                $.get("/apisub/list/duijie.php?act=duijie&oid=" + oid, function (data) {
                    layer.close(load);
                    if (data.code == 1) {
                        _this.get(_this.row.current_page);
                        layer.alert(data.msg, { icon: 1 });
                    } else {
                        layer.msg(data.msg, { icon: 2 });
                    }
                });
            });
        },
        plbs: function (a) {
            var load = layer.load();
            var _this = this;
            $.post("/apisub/list/bs.php?act=plbs&a=" + a, { sex: this.sex, type: 1 }, { emulateJSON: true }).then(function (data) {
                layer.close(load);
                var res = data.body || data;
                if (res.code == 1) {
                    _this.sex = [];
                    _this.get(_this.row.current_page);
                    layer.msg(res.msg, { icon: 1, time: 3000 });
                } else {
                    layer.msg(res.msg, { icon: 2, time: 3000 });
                }
            });
        },
        ms: function (oid) {
            var _this = this;
            layer.confirm('提交秒刷将扣除0.05学时服务费', { title: '温馨提示', icon: 4, btn: ['确定', '取消'] }, function () {
                var load = layer.load();
                $.get("/apisub/list/bs.php?act=ms_order&oid=" + oid, function (data) {
                    layer.close(load);
                    if (data.code == 1) {
                        _this.get(_this.row.current_page);
                        layer.alert(data.msg, { icon: 1 });
                    } else {
                        layer.msg(data.msg, { icon: 2 });
                    }
                });
            });
        },
        status_text: function (a) {
            var load = layer.load();
            var _this = this;
            $.post("/apisub/list/bs.php?act=status_order&a=" + a, { sex: this.sex, type: 1 }, { emulateJSON: true }).then(function (data) {
                layer.close(load);
                var res = data.body || data;
                if (res.code == 1) {
                    _this.sex = [];
                    _this.get(_this.row.current_page);
                    layer.msg(res.msg, { icon: 1 });
                } else {
                    layer.msg(res.msg, { icon: 2 });
                }
            });
        },
        tk: function (sex) {
            if (this.sex.length == 0) { layer.msg("请先选择订单！"); return false; }
            var _this = this;
            layer.confirm('确定要退款吗？陛下，三思三思！！！', { title: '温馨提示', icon: 3, btn: ['确定', '取消'] }, function () {
                var load = layer.load();
                $.post("/apisub/list/bs.php?act=tk", { sex: sex }, { emulateJSON: true }).then(function (data) {
                    layer.close(load);
                    var res = data.body || data;
                    if (res.code == 1) {
                        _this.sex = [];
                        _this.get(_this.row.current_page);
                        layer.msg(res.msg, { icon: 1 });
                    } else {
                        layer.msg(res.msg, { icon: 2 });
                    }
                });
            });
        },
        shanchu: function (sex) {
            if (this.sex.length == 0) { layer.msg("请先选择订单！"); return false; }
            var _this = this;
            layer.confirm('确定要删除订单吗？陛下，三思三思！！！', { title: '温馨提示', icon: 3, btn: ['确定', '取消'] }, function () {
                var load = layer.load();
                $.post("/apisub/list/shanchu.php?act=shanchu", { sex: sex }, { emulateJSON: true }).then(function (data) {
                    layer.close(load);
                    var res = data.body || data;
                    if (res.code == 1) {
                        _this.sex = [];
                        _this.get(_this.row.current_page);
                        layer.msg(res.msg, { icon: 1 });
                    } else {
                        layer.msg(res.msg, { icon: 2 });
                    }
                });
            });
        },
        shanchuyid: function (sex) {
            if (this.sex.length == 0) { layer.msg("请先选择订单！"); return false; }
            var _this = this;
            layer.confirm('确定要删除订单吗？陛下，三思三思！！！', { title: '温馨提示', icon: 3, btn: ['确定', '取消'] }, function () {
                var load = layer.load();
                $.post("/apisub/list/shanchu.php?act=shanchuyid", { sex: sex }, { emulateJSON: true }).then(function (data) {
                    layer.close(load);
                    var res = data.body || data;
                    if (res.code == 1) {
                        _this.sex = [];
                        _this.get(_this.row.current_page);
                        layer.msg(res.msg, { icon: 1 });
                    } else {
                        layer.msg(res.msg, { icon: 2 });
                    }
                });
            });
        },
        dock: function (a) {
            var load = layer.load();
            var _this = this;
            $.post("/apisub/list/bs.php?act=status_order&a=" + a, { sex: this.sex, type: 2 }, { emulateJSON: true }).then(function (data) {
                layer.close(load);
                var res = data.body || data;
                if (res.code == 1) {
                    _this.sex = [];
                    _this.get(_this.row.current_page);
                    layer.msg(res.msg, { icon: 1 });
                } else {
                    layer.msg(res.msg, { icon: 2 });
                }
            });
        },
        selectAll: function () {
            if (this.sex.length == 0) {
                for (var i = 0; i < this.row.data.length; i++) {
                    this.sex.push(this.row.data[i].oid)
                }
            } else {
                this.sex = []
            }
        },
        daochu: function () {
            if (this.dc2.gs == '') {
                layer.msg("请先选择格式", { icon: 2 });
                return false;
            }
            if (!this.sex[0]) {
                layer.msg("请先选择订单", { icon: 2 });
                return false;
            }
            for (var i = 0; i < this.sex.length; i++) {
                var oid = this.sex[i];
                for (var x = 0; x < this.row.data.length; x++) {
                    if (this.row.data[x].oid == oid) {
                        var item = this.row.data[x];
                        var a = "";
                        if (this.dc2.gs == '1') a = item.school + ' ' + item.user + ' ' + item.pass + ' ' + item.kcname;
                        else if (this.dc2.gs == '2') a = item.user + ' ' + item.pass + ' ' + item.kcname;
                        else if (this.dc2.gs == '3') a = item.school + ' ' + item.user + ' ' + item.pass;
                        else if (this.dc2.gs == '4') a = item.user + ' ' + item.pass;
                        this.dc.push(a)
                    }
                }
            }
            layer.alert(this.dc.join("<br>"));
            this.dc = [];
        },
        ddinfo: function(res) {
            this.ddinfo3.info = res;
            layer.open({
                type: 1,
                title: '订单详细信息',
                area: ['400px', '80%'],
                content: $('#ddinfo2')
            });
        }
    },
    mounted() {
        this.get(1);
        this.getclasses(); 
    }
});