/**
 * js/class.js - 网课平台管理核心逻辑脚本
 * 包含：数据加载、分页、批量操作、表单同步、折叠逻辑等
 */
new Vue({
    el: "#orderlist",
    data: {
        // --- 列表相关数据 ---
        row: { data: [], current_page: 1, last_page: 0 }, // 列表数据存储
        selectedItems: [],       // 已勾选的CID数组
        selectedCategory: "",    // 筛选：分类HID
        cxname: "",              // 筛选：搜索名称
        cxStatus: "",            // 筛选：状态
        cxPrice: "",             // 筛选：价格上限
        pageSize: 50,            // 每页显示条目
        jumpPage: null,          // 分页跳转页码

        // --- 编辑相关数据 ---
        storeInfo: {},           // 存储当前正在编辑的那行数据

        // --- 一键同步功能（临时变量） ---
        syncPlat: "",            // 编辑窗口：统一平台选择
        syncNoun: "",            // 编辑窗口：统一参数填写
        syncPlatAdd: "0",        // 添加窗口：统一平台选择 (默认自营)
        syncNounAdd: "",         // 添加窗口：统一参数填写
    },
    methods: {
        /**
         * 1. 核心数据获取 (分页/筛选)
         */
        get: function (page) {
            var load = layer.load(2);
            this.$http.post("/apisub/class/list.php?act=classlist", {
                page: page,
                category: this.selectedCategory,
                status: this.cxStatus,
                name: this.cxname,
                price_lt: this.cxPrice,
                pagesize: this.pageSize
            }, { emulateJSON: true }).then(function (data) {
                layer.close(load);
                if (data.data.code == 1) {
                    this.row = data.body;
                } else {
                    layer.msg(data.data.msg, { icon: 2 });
                }
            });
        },

        /**
         * 2. 打开编辑窗口并初始化数据
         * @param {Object} item 从列表传入的单行数据
         */
        openEdit: function (item) {
    let temp = JSON.parse(JSON.stringify(item));
    
    const toJsonText = (str) => {
        try {
            // 如果已经是数组格式的字符串，才进行转换
            if (str && (str.startsWith('[') || str.startsWith('{'))) {
                let arr = JSON.parse(str);
                return Array.isArray(arr) ? arr.join("\n") : str;
            }
        } catch (e) {}
        return str; // 解析失败则原样显示
    };

    temp.school = toJsonText(temp.school);
    temp.remarks = toJsonText(temp.remarks);

    this.storeInfo = temp;
    this.syncPlat = ""; 
    this.syncNoun = "";
    $('#edit-advanced-params').collapse('hide');
},

        /**
         * 3. 提交表单 (新增或修改)
         */
        form: function (formType) {
    var load = layer.load(2);
    
    // 1. 获取基础表单数据（CID、名称、状态等）
    var formData = $("#form-" + formType).serializeArray();
    
    /**
     * 2. 精准清理函数：将换行文本转为干净的数组
     * 作用：同时识别 \r\n 和 \n，并彻底删除残留的 \r 符号
     */
    let cleanTextToArray = (raw) => {
        if (!raw) return [];
        return raw.split(/\r?\n/)               // 1. 同时匹配 Windows(\r\n) 和 Unix(\n) 换行符
                  .map(i => i.replace(/\r/g, "")) // 2. 强制清除字符串中任何位置的 \r
                  .map(i => i.trim())             // 3. 去除首尾多余空格
                  .filter(i => i !== "");         // 4. 过滤掉空行
    };

    // 获取原始文本（编辑窗口从 Vue 对象取，添加窗口从 DOM 取）
    let schoolRaw = formType === 'update' ? this.storeInfo.school : $("#form-add textarea[name='school']").val();
    let remarksRaw = formType === 'update' ? this.storeInfo.remarks : $("#form-add textarea[name='remarks']").val();

    // 转换为标准 JSON 字符串
    let schoolJson = JSON.stringify(cleanTextToArray(schoolRaw));
    let remarksJson = JSON.stringify(cleanTextToArray(remarksRaw));

    // 3. 构造最终发送的数据包，合并基础字段与处理后的 JSON 字段
    var postData = {};
    formData.forEach(item => {
        postData[item.name] = item.value;
    });
    postData.school = schoolJson;
    postData.remarks = remarksJson;

    // 4. 发送请求
    this.$http.post("/apisub/class/list.php?act=upclass", { 
        data: $.param(postData) // 使用 jQuery 的 param 方法将对象转回 PHP 可解析的字符串
    }, { emulateJSON: true }).then(function (data) {
        layer.close(load);
        if (data.data.code == 1) {
            this.get(this.row.current_page);
            $("#modal-" + formType).modal('hide');
            layer.msg(data.data.msg, { icon: 1 });
            if(formType === 'add') {
                // 重置添加窗口状态
                this.syncPlatAdd = "0";
                this.syncNounAdd = "";
                $("#form-add")[0].reset();
            }
        } else {
            layer.msg(data.data.msg, { icon: 2 });
        }
    });
},

        /**
         * 4. 一键同步：平台选择 (核心优化)
         * @param {String} type 'add' 或 'edit' 区分窗口
         */
        /**
 * 修正版：一键同步平台选择
 */
doSyncPlat: function (type) {
    var val = (type === 'add') ? this.syncPlatAdd : this.syncPlat;
    if (val === "" || val === null) return;

    if (type === 'edit') {
        // 重要：在 Vue 中必须直接操作对象属性，界面才会跟着变
        this.storeInfo.queryplat = val;
        this.storeInfo.queryplat2 = val;
        this.storeInfo.docking = val;
    } else {
        // 添加窗口由于没有 storeInfo 绑定，保持操作 DOM
        $("#add_queryplat").val(val);
        $("#add_queryplat2").val(val);
        $("#add_docking").val(val);
    }
    layer.msg("平台已同步", { time: 800 });
},

/**
         * 5. 一键同步：参数输入 (核心优化)
         * @param {String} type 'add' 或 'edit' 区分窗口
         */
         
doSyncNoun: function (type) {
    var val = (type === 'add') ? this.syncNounAdd : this.syncNoun;

    if (type === 'edit') {
        // 直接操作对象属性
        this.storeInfo.getnoun = val;
        this.storeInfo.getnoun2 = val;
        this.storeInfo.noun = val;
    } else {
        // 添加窗口操作隐藏域
        $("#add_getnoun").val(val);
        $("#add_getnoun2").val(val);
        $("#add_noun").val(val);
    }
},

        /**
         * 6. 批量上架/下架
         */
        batchStatusUpdate: function (status, actionName) {
            if (this.selectedItems.length === 0) { layer.msg("请勾选项目"); return; }
            var load = layer.load(2);
            this.$http.post("/apisub/class/list.php?act=class_ban", { 
                cids: this.selectedItems, 
                status: status 
            }, { emulateJSON: true }).then(function (data) {
                layer.close(load);
                if (data.data.code == 1) {
                    this.get(this.row.current_page);
                    layer.msg(actionName + "成功", { icon: 1 });
                }
            });
        },
        batchOn: function() { this.batchStatusUpdate(1, "批量上架"); },
        batchOff: function() { this.batchStatusUpdate(0, "批量下架"); },

        /**
         * 7. 批量删除平台
         */
        plshanchu: function () {
            if (this.selectedItems.length === 0) { layer.msg("请勾选项目"); return; }
            var self = this;
            layer.confirm('确定要彻底删除选中的平台吗？', { title: '警告', icon: 0 }, function(){
                var load = layer.load(2);
                self.$http.post("/apisub/class/list.php?act=plshanchu", { 
                    cids: self.selectedItems 
                }, { emulateJSON: true }).then(function (data) {
                    layer.close(load);
                    if (data.data.code == 1) {
                        self.get(1);
                        self.selectedItems = [];
                        layer.msg("删除成功", { icon: 1 });
                    }
                });
            });
        },

        /**
         * 8. 辅助功能 (全选、分页)
         */
        quanxuan: function () {
            if (this.selectedItems.length < this.row.data.length) {
                this.selectedItems = this.row.data.map(item => item.cid);
            } else {
                this.selectedItems = [];
            }
        },
        changePageSize: function() {
            this.get(1);
        },
        jumpToPage: function() {
            if (this.jumpPage >= 1 && this.jumpPage <= this.row.last_page) {
                this.get(this.jumpPage);
            } else {
                layer.msg("页码超出范围", { icon: 5 });
            }
        }
    },
    // 页面加载完成后，自动获取第一页数据
    mounted: function () {
        this.get(1);
    }
});