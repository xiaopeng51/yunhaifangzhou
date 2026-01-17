// 这是 shouye.js 文件的内容

var vm = new Vue({
        el: "#userindex",
        data: {
            row: null,
            inte: '',
            isCodeSending: false,
            codeTime: 60,
            // 【新增】公告列表数据
        gonggaoList: [], 
        // 【新增】当前展开的公告索引（默认0表示展开第一个，-1表示全部折叠）
        activeNoticeIndex: 0 
        
        },
        methods: {
            
         /**
         * @function showInvitationPopup
         * @description 使用您最初提供的、可以正常工作的 layer.open 代码来显示弹窗。
         */
        showInvitationPopup: function() {
    const self = this;

    layer.open({
        type: 1,
        title: '<span style="color:#4CAF50;">🎁 邀请好友注册奖励活动</span>',
        content: `
          <div class="custom-modal-content-12345">
              <h2 class="custom-modal-title-12345" style="position:relative;">
                  <span style="color:#43A047;font-size:22px;">🌟 邀请好友 · 获得现金奖励</span>
                  <div style="position:absolute;right:0;top:-5px;background:#E8F5E9;padding:2px 8px;border-radius:3px;font-size:12px;">
                      📅 活动长期有效
                  </div>
              </h2>

              <div class="custom-modal-body-12345" style="position:relative;line-height:1.7;">
                  
                  <div style="background:#F1FFF1;padding:12px;border-radius:8px;margin-bottom:15px;">
                      <p style="margin:0;">
                          🎉 <span style="color:#43A047;font-weight:bold;">邀请新人注册并完成首单</span>  
                          <br>即可获得 <span style="color:#2E7D32;font-weight:bold;">2 ~ 15 元余额奖励</span>
                      </p>
                  </div>

                  <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:15px;">
                      <div style="border:1px solid #D1FFD1;padding:10px;border-radius:5px;text-align:center;">
                          <div style="color:#4CAF50;font-size:14px;">💵 最低奖励 2 元</div>
                      </div>
                      <div style="border:1px solid #D1FFD1;padding:10px;border-radius:5px;text-align:center;">
                          <div style="color:#4CAF50;font-size:14px;">🏆 单个最高奖励 15 元</div>
                      </div>
                  </div>

                  <div style="border-left:3px solid #66BB6A;padding-left:10px;margin:15px 0;">
                      <p style="margin:5px 0;color:#666;">
                          📢 每成功邀请 1 位完成注册 👉 可获得随机奖励  
                          <br>奖励将在好友完成有效操作后自动发放到账
                      </p>
                  </div>

                  <div style="text-align:center;background:#F8F9FA;padding:10px;border-radius:8px;">
                      <p style="margin:5px 0;font-size:14px;">
                          <span style="color:#666;">好友越多，奖励越多，</span><br>
                          <span style="font-size:18px;color:#43A047;">邀请不设上限！</span>
                      </p>
                  </div>

                  <div style="margin-top:15px;font-size:12px;color:#999;text-align:center;">
                      <span style="background:#F0F0F0;padding:2px 5px;border-radius:3px;">🔐 系统自动发放</span>
                      <span style="background:#F0F0F0;padding:2px 5px;border-radius:3px;margin-left:5px;">📈 邀请记录可查</span>
                  </div>
              </div>
          </div>
        `,
        area: ['480px', 'auto'],
        btn: '<span style="letter-spacing:1px;">🚀 立即参与</span>',
        btnStyle: {
            background: 'linear-gradient(135deg, #66BB6A, #43A047)',
            color: '#fff',
            borderRadius: '20px',
            border: 'none',
            padding: '0 20px'
        },
        btnAlign: 'c',
        shadeClose: true,
        anim: 3,
        skin: 'layui-layer-brand',

        // 点击按钮改为仅关闭弹窗
        yes: function(index, layero) {
            layer.close(index);
        }
    });
},


        scyqlj: function () {
            var load = layer.load();
            this.$http.post("/apisub/jiben/xitong.php?act=fenxiang", {
                yqm: this.row.yqm
            }, { emulateJSON: true }).then((data) => {
                layer.close(load);
                if (data.data.code == 1) {
                    var { longUrl, tinyUrl, isGdUrl, dwzUrl, ft12Url } = data.data;

                    var linksHtml = `
                        <div style="padding:10px;max-height:450px;overflow:auto;">
                          <p>邀请好友注册赠送 <b style="color:red">2-10元余额</b>！</p>
                          <p>平台链接（备用）: <a href="${longUrl}" target="_blank">${longUrl}</a></p>
                          <img src="https://api.pwmqr.com/qrcode/create/?url=${encodeURIComponent(longUrl)}" style="width:100px;height:100px;margin:5px 0;">
                          <hr>
                          <p>支持国内: <a href="${ft12Url}" target="_blank">${ft12Url}</a></p>
                          <img src="https://api.pwmqr.com/qrcode/create/?url=${encodeURIComponent(ft12Url)}" style="width:100px;height:100px;margin:5px 0;">
                          <hr>
                          <p>地区爆红: <a href="${dwzUrl}" target="_blank">${dwzUrl}</a></p>
                          <img src="https://api.pwmqr.com/qrcode/create/?url=${encodeURIComponent(dwzUrl)}" style="width:100px;height:100px;margin:5px 0;">
                          <hr>
                          <p>需要翻墙: <a href="${tinyUrl}" target="_blank">${tinyUrl}</a></p>
                          <img src="https://api.pwmqr.com/qrcode/create/?url=${encodeURIComponent(tinyUrl)}" style="width:100px;height:100px;margin:5px 0;">
                          <hr>
                          <p>需要翻墙: <a href="${isGdUrl}" target="_blank">${isGdUrl}</a></p>
                          <img src="https://api.pwmqr.com/qrcode/create/?url=${encodeURIComponent(isGdUrl)}" style="width:100px;height:100px;margin:5px 0;">
                        </div>
                    `;

                    layer.open({
                        type: 1,
                        title: '专属邀请链接',
                        area: ['520px', '600px'],
                        shadeClose: true,
                        btn: ['复制所有链接', '关闭'],
                        content: linksHtml,
                        yes: function (index) {
                            var tempInput = document.createElement("textarea");
                            document.body.appendChild(tempInput);
                            tempInput.value = [longUrl, ft12Url, dwzUrl, tinyUrl, isGdUrl].join('\n');
                            tempInput.select();
                            document.execCommand("copy");
                            document.body.removeChild(tempInput);
                            layer.msg('所有链接已复制到剪贴板', { icon: 1 });
                        }
                    });
                } else {
                    layer.msg(data.data.msg, { icon: 2 });
                }
            });
        },
            
            userinfo: function () {
                var load = layer.load();
                this.$http.post("/apisub/jiben/xitong.php?act=userinfo_1")
                    .then(function (data) {
                        layer.close(load);
                        if (data.data.code == 1) {
                            this.row = data.data
                        } else {
                            layer.alert(data.data.msg, {
                                icon: 2
                            });
                        }
                    });
            },
            yecz: function () {
                layer.alert('请联系您的上级QQ：' + this.row.sjuser + '，进行充值。（代理点充值，此处将显示您的QQ）', {
                    icon: 1,
                    title: "温馨提示"
                });
            },
            ktapi: function () {
                layer.confirm('余额必须大于50，开通API，将扣除1余额', {
                    title: '温馨提示',
                    icon: 1,
                    btn: ['确定', '取消'] //按钮
                }, function () {
                    var load = layer.load();
                    axios.get("/apisub/jiben/xitong.php?act=ktapi&type=1")
                        .then(function (data) {
                            layer.close(load);
                            if (data.data.code == 1) {
                                layer.alert(data.data.msg, {
                                    icon: 1,
                                    title: "温馨提示"
                                }, function () {
                                    setTimeout(function () {
                                        window.location.href = ""
                                    });
                                });
                            } else {
                                layer.msg(data.data.msg, {
                                    icon: 2
                                });
                            }
                        });

                });
            },
            ghapi: function () {
                layer.confirm('确定更换key吗，更换之后之前的就不能用了', {
                    title: '温馨提示',
                    icon: 1,
                    btn: ['确定', '取消'] //按钮
                }, function () {
                    var load = layer.load();
                    axios.get("/apisub/jiben/xitong.php?act=ghapi&type=1")
                        .then(function (data) {
                            layer.close(load);
                            if (data.data.code == 1) {
                                layer.alert(data.data.msg, {
                                    icon: 1,
                                    title: "温馨提示"
                                }, function () {
                                    setTimeout(function () {
                                        window.location.href = ""
                                    });
                                });
                            } else {
                                layer.msg(data.data.msg, {
                                    icon: 2
                                });
                            }
                        });

                });
            },
            szyqprice: function () {
                layer.prompt({
                    title: '设置代理默认等级，首次自动生成邀请码',
                    formType: 3
                }, function (yqprice, index) {
                    layer.close(index);
                    var load = layer.load();
                    $.post("/apisub/jiben/xitong.php?act=yqprice", {
                        yqprice
                    }, function (data) {
                        layer.close(load);
                        if (data.code == 1) {
                            vm.userinfo();
                            layer.alert(data.msg, {
                                icon: 1
                            });
                        } else {
                            layer.msg(data.msg, {
                                icon: 2
                            });
                        }
                    });
                });
            },
            szapiip: function () {
                var vm = this;
                var currentIpList = vm.row.apiip || '';
                layer.prompt({
                    formType: 2,
                    value: currentIpList,
                    title: '编辑对接IP白名单 (多个IP请用英文逗号 , 分隔)',
                    area: ['500px', '200px']
                }, function (newIpListRaw, index1) {
                    layer.close(index1);
                    var newIpList = newIpListRaw.trim();
                    if (newIpList !== '' && !/^[0-9.,\s]*$/.test(newIpList)) {
                        layer.msg('IP列表中包含无效字符', {
                            icon: 2
                        });
                        return;
                    }
                    layer.open({
                        type: 1,
                        title: '邮箱验证码确认',
                        area: ['400px', '250px'],
                        shadeClose: false,
                        content: `
                    <div style="padding: 20px;">
                        <p>为了您的账户安全，请输入发送到您邮箱 (${vm.row.email || '未知邮箱'}) 的验证码：</p>
                        <div style="margin-top: 15px; display: flex; align-items: center;">
                            <input type="text" id="ip_email_code_input" class="layui-input" placeholder="请输入验证码" style="flex-grow: 1; margin-right: 10px;">
                            <button type="button" id="send_ip_code_btn" class="layui-btn layui-btn-primary">发送验证码</button>
                        </div>
                    </div>
                `,
                        success: function (layero, index2) {
                            $('#send_ip_code_btn').off('click').on('click', function () {
                                vm.sendIpVerificationCode();
                            });
                            if (vm.isCodeSending) {
                                var btn = $('#send_ip_code_btn');
                                btn.prop('disabled', true).text(vm.codeTime + '秒后重发');
                            }
                        },
                        btn: ['确定保存', '取消'],
                        yes: function (index2, layero) {
                            var emailCode = $('#ip_email_code_input').val().trim();
                            if (!emailCode) {
                                layer.msg('请输入验证码', {
                                    icon: 7
                                });
                                return;
                            }
                            var load = layer.load();
                            $.post("/apisub/jiben/xitong.php?act=szapiip", {
                                szapiip: newIpList,
                                email_code: emailCode
                            }, function (data) {
                                layer.close(load);
                                if (data.code == 1) {
                                    layer.close(index2);
                                    vm.userinfo();
                                    layer.alert(data.msg, {
                                        icon: 1
                                    });
                                } else {
                                    layer.msg(data.msg, {
                                        icon: 2
                                    });
                                }
                            }, 'json');
                        }
                    });
                });
            },

            sendIpVerificationCode: function () {
                var vm = this;
                if (vm.isCodeSending) return;
                if (!vm.row || !vm.row.email) {
                    layer.msg('无法获取用户邮箱信息', {
                        icon: 2
                    });
                    return;
                }
                var load = layer.load(2);
                $.post("/apisub/jiben/login.php?act=send_email_code", {
                    email: vm.row.email
                }, function (data) {
                    layer.close(load);
                    if (data.code == 1) {
                        layer.msg(data.msg, {
                            icon: 1
                        });
                        vm.startIpCodeCountdown();
                    } else {
                        layer.msg(data.msg, {
                            icon: 2
                        });
                    }
                }, 'json').fail(function () {
                    layer.close(load);
                    layer.msg('请求发送验证码失败', {
                        icon: 2
                    });
                });
            },

            startIpCodeCountdown: function () {
                var vm = this;
                vm.isCodeSending = true;
                vm.codeTime = 60;
                var btn = $('#send_ip_code_btn');
                if (btn.length === 0) return;
                btn.prop('disabled', true);
                var interval = setInterval(function () {
                    if (!vm.isCodeSending || $('#send_ip_code_btn').length === 0) {
                        clearInterval(interval);
                        vm.isCodeSending = false;
                        if ($('#send_ip_code_btn').length > 0) {
                            $('#send_ip_code_btn').prop('disabled', false).text('发送验证码');
                        }
                        return;
                    }
                    vm.codeTime--;
                    if (vm.codeTime <= 0) {
                        clearInterval(interval);
                        vm.isCodeSending = false;
                        btn.prop('disabled', false).text('发送验证码');
                    } else {
                        btn.text(vm.codeTime + '秒后重发');
                    }
                }, 1000);
            },
            connect_qq: function () {
                var ii = layer.load(0, {
                    shade: [0.1, '#fff']
                });
                $.ajax({
                    type: "POST",
                    url: "/apisub/denglu/login.php?act=connect",
                    data: {},
                    dataType: 'json',
                    success: function (data) {
                        layer.close(ii);
                        if (data.code == 0) {
                            window.location.href = data.url;
                        } else {
                            layer.alert(data.msg, {
                                icon: 7
                            });
                        }
                    }
                });
            },
            szgg: function () {
                layer.prompt({
                    title: '设置代理公告，您的代理可看到',
                    formType: 2
                }, function (notice, index) {
                    layer.close(index);
                    var load = layer.load();
                    $.post("/apisub/jiben/xitong.php?act=user_notice", {
                        notice
                    }, function (data) {
                        layer.close(load);
                        if (data.code == 1) {
                            vm.userinfo();
                            layer.msg(data.msg, {
                                icon: 1
                            });
                        } else {
                            layer.msg(data.msg, {
                                icon: 2
                            });
                        }
                    });
                });
            },
            
        // 【修改】获取公告的方法
        getxitonggonggao: function() {
            // 请确保 act=xitonggonggao 与 PHP 后端一致
            this.$http.post("/apisub/jiben/xitong.php?act=xitonggonggao")
                .then(function(res) {
                    if (res.data.code == 1) {
                        // 【关键修改】将后端返回的数据赋值给 noticeList
                        this.gonggaoList = res.data.data;
                    }
                });
        },

        // 【新增】切换折叠状态
        toggleNotice: function(index) {
            // 如果点击的是当前已经展开的，就关闭它；否则展开点击的那一项
            if (this.activeNoticeIndex === index) {
                this.activeNoticeIndex = -1;
            } else {
                this.activeNoticeIndex = index;
            }
        }
            
        },
         mounted() {
        // 1. 首先获取用户信息 (这行保持不变)
        this.userinfo();
    
        // 2. 在这里重新添加调用弹窗的函数 (这是关键)
        //    这行代码会告诉Vue, 当页面准备好后, 立即执行显示弹窗的函数
        this.showInvitationPopup(); 
        
        // 【新增】页面加载完成后，获取独立公告
        this.getxitonggonggao();
    }
    });
