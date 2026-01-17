// 独立的辅助函数，用于对字符串进行HTML转义，防止XSS攻击
function escapeHtml(text) {
    return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

// 全局复制代码函数，用于代码块的一键复制功能
window.copyCode = function(buttonElement) {
    // 找到按钮旁边的pre > code元素
    const preElement = buttonElement.parentElement.querySelector('pre');
    if (preElement && preElement.querySelector('code')) {
        const codeText = preElement.querySelector('code').innerText;
        // 使用浏览器 Clipboard API 进行复制
        navigator.clipboard.writeText(codeText).then(() => {
            buttonElement.classList.add('copied');
            const originalText = buttonElement.innerHTML;
            buttonElement.innerHTML = '<i class="fas fa-check"></i> 已复制!';
            // 1.5秒后恢复按钮原来的状态
            setTimeout(() => {
                buttonElement.classList.remove('copied');
                buttonElement.innerHTML = originalText;
            }, 1500);
        }).catch(err => {
            console.error('复制失败: ', err);
            alert('复制失败，您的浏览器可能不支持或权限不足。');
        });
    }
};

// 关闭公告栏的函数
function closeAnnouncement() {
    var banner = document.getElementById('announcementBanner');
    if (banner) {
        banner.style.display = 'none';
        // 使用 localStorage 记录用户已关闭，下次不再显示
        localStorage.setItem('announcementClosed', 'true');
    }
}

// 页面加载完成后执行的事件监听
document.addEventListener('DOMContentLoaded', function() {
    // 检查localStorage中是否有关闭公告的记录
    var banner = document.getElementById('announcementBanner');
    var isClosed = localStorage.getItem('announcementClosed');
    
    // 如果用户之前没有关闭过公告，则显示
    if (banner && isClosed !== 'true') {
        banner.style.display = 'flex';
    } else if (banner) {
        banner.style.display = 'none'; // 确保如果已关闭则不显示
    }
});


// Vue.js 实例，是整个页面的核心控制器
var vm = new Vue({
    el: "#yuanxinai", // 绑定到页面上 id="yuanxinai" 的元素
    data: {
        // --- 页面状态和用户数据 ---
        row: null,              // 存储用户信息
        isSending: false,       // 标志位，防止在AI响应前重复发送消息
        
        // --- 模型和线路选择 ---
        apiLines: [],           // 存储从后端获取的所有API线路
        xianlu: '',             // 当前选中的线路ID
        moxingneme: null,       // 当前选中的模型对象（包含名称、价格等信息）
        
        // --- 聊天数据 ---
        newMessage: '',         // 输入框中正在编辑的新消息
        liaotianlishi: [],      // 当前对话的聊天记录数组
        
        // --- 对话历史管理 ---
        conversationList: [],      // 从后端获取的历史对话列表
        selectedConversationId: 0, // 当前选中的对话ID, 0 代表“新建对话”

        // --- 功能设置 ---
        qidonglishi: true,      // "启用连续对话" 开关，默认为 true
        contextLength: 6,       // 携带历史消息数
        zuidahuifushu: 2048,    // AI最大回复字数（Token数）
        chuangzuoxing: 0.7,      // AI回复的随机性/创作性 (0.0-1.0)
        
        // 【新增】用于分页的状态
        totalMessages: 0,       // 当前对话的总消息数
        messagesPerPage: 20,    // 每页加载的消息数量，应与后端 limit 一致
        isLoadingMore: false    // 防止重复加载的标志位
    },
     computed: {
          // 【新增】计算属性，判断是否还有更多消息可以加载
        hasMoreMessages() {
            // 如果当前显示的消息数小于总消息数，说明还有
            return this.liaotianlishi.length < this.totalMessages;
        },
        // 计算属性：根据当前选中的线路ID，动态计算出该线路下所有可用的模型列表
        currentModels() {
            // 找到当前选中的线路对象
            const selectedLine = this.apiLines.find(line => line.apiid == this.xianlu);
            // 如果找到了线路，则筛选出其中 status 为 1 (可用) 的模型并返回
            return selectedLine ? selectedLine.apimoxing.filter(model => model.status === 1) : [];
        }
    },
     methods: {
        // 格式化消息，支持Markdown
        formatMessage(text) {
            if (typeof marked === 'undefined') {
                return escapeHtml(text).replace(/\n/g, '<br>');
            }
            const rawHtml = marked.parse(text);
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = rawHtml;
            const preBlocks = tempDiv.querySelectorAll('pre');
            preBlocks.forEach(pre => {
                const code = pre.querySelector('code');
                if (code) {
                    const wrapper = document.createElement('div');
                    wrapper.className = 'code-block-header';
                    pre.parentNode.insertBefore(wrapper, pre);
                    wrapper.appendChild(pre);

                    const copyButton = document.createElement('button');
                    copyButton.className = 'copy-code-btn';
                    copyButton.innerHTML = '<i class="fas fa-copy"></i> 复制';
                    // 使用箭头函数确保`this`指向正确，或者直接调用全局函数
                    copyButton.onclick = function() { window.copyCode(this); };
                    wrapper.appendChild(copyButton);
                }
            });
            return tempDiv.innerHTML;
        },

        // 自动调整输入框高度
        adjustHeight(event) {
            const textarea = event.target;
            textarea.style.height = 'auto';
            const scrollHeight = textarea.scrollHeight;
            textarea.style.height = (scrollHeight > 150 ? 150 : scrollHeight) + 'px';
        },

        // 处理回车键事件
        handleEnter(event) {
            if (event.ctrlKey || event.metaKey) {
                const textarea = event.target;
                const start = textarea.selectionStart;
                this.newMessage = this.newMessage.slice(0, start) + '\n' + this.newMessage.slice(start);
                this.$nextTick(() => {
                    textarea.selectionStart = textarea.selectionEnd = start + 1;
                });
                event.preventDefault();
                this.adjustHeight(event);
            } else {
                event.preventDefault();
                this.sendMessage();
            }
        },

        // 【接口】获取用户信息
        userinfo: function() {
            axios.post("/apisub.php?act=userinfo_1", { uid: USER_UID }) // 【修正】这里也建议加上 uid
                .then(response => {
                    if (response.data.code == 1) {
                        this.row = response.data;
                    } else {
                        layer.alert(response.data.msg, { icon: 2 });
                    }
                })
                .catch(error => console.error('获取用户信息失败:', error));
        },

        // 【接口】获取API线路
        fetchApiLines: function() {
            // 【修正】将 uid: USER_UID 作为请求体发送
            axios.post('/apisub/qita/yuanxinai.php?act=class', { uid: USER_UID })
                .then(response => {
                    if (response.data.code == 1) {
                        this.apiLines = response.data.data;
                        if (this.apiLines.length > 0) {
                            this.xianlu = this.apiLines[0].apiid;
                            this.moxingneme = this.currentModels.length > 0 ? this.currentModels[0] : null;
                        }
                    } else {
                        layer.alert(response.data.msg || '获取AI线路失败', { icon: 2 });
                    }
                })
                .catch(error => console.error('请求AI线路错误:', error));
        },

        // 切换线路时
        onXianluChange: function() {
            this.moxingneme = this.currentModels.length > 0 ? this.currentModels[0] : null;
        },

        // 【接口】获取历史对话列表
        fetchConversationList: function() {
            // 【修正】将 uid: USER_UID 作为请求体发送
            axios.post('/apisub/qita/yuanxinai.php?act=get_history_list', { uid: USER_UID })
                .then(response => {
                    if (response.data.code == 1) {
                        this.conversationList = response.data.data;
                    }
                })
                .catch(error => console.error('获取历史对话列表失败:', error));
        },

        // 编辑对话名称
        editConversationName: function() {
            const currentConvo = this.conversationList.find(c => c.id == this.selectedConversationId);
            if (!currentConvo) return;
            layer.prompt({
                value: currentConvo.dhname,
                title: '请输入新的对话名称',
            }, (value, index) => {
                layer.close(index);
                if (!value || value.trim() === '') return;
                // 【修正】将 uid: USER_UID 作为请求体发送
                axios.post('/apisub/qita/yuanxinai.php?act=edit_conversation_name', {
                    uid: USER_UID,
                    duihua_id: this.selectedConversationId,
                    new_name: value
                }).then(response => {
                    if (response.data.code == 1) {
                        currentConvo.dhname = value;
                        layer.msg('修改成功', { icon: 1 });
                    } else {
                        layer.alert(response.data.msg || '修改失败', { icon: 2 });
                    }
                });
            });
        },

        // 删除对话
        deleteConversation: function() {
            layer.confirm('确定要删除这个对话吗？此操作不可恢复。', { title: "警告" }, () => {
                // 【修正】将 uid: USER_UID 作为请求体发送
                axios.post('/apisub/qita/yuanxinai.php?act=delete_conversation', {
                    uid: USER_UID,
                    duihua_id: this.selectedConversationId
                }).then(response => {
                    if (response.data.code == 1) {
                        this.conversationList = this.conversationList.filter(c => c.id != this.selectedConversationId);
                        this.selectedConversationId = 0;
                        this.liaotianlishi = [];
                        layer.msg('删除成功', { icon: 1 });
                    } else {
                        layer.alert(response.data.msg || '删除失败', { icon: 2 });
                    }
                });
            });
        },

        // 【重写】切换对话时的逻辑
        onConversationChange: function() {
            // 切换到“新建对话”
            if (this.selectedConversationId == 0) {
                this.liaotianlishi = [];
                this.totalMessages = 0; // 重置总数
                return;
            }
            
            // 重置聊天记录，然后加载第一页（即最新的消息）
            this.liaotianlishi = [];
            this.totalMessages = 0;
            
            // 计算最后一页的 offset
            // 这一步比较复杂，因为我们不知道总数，所以先请求一次来获取总数
            // 简化处理：我们先请求最新的20条，offset设为-20，让后端去处理
            // 后端PHP的 array_slice 可以接受负数 offset，表示从末尾开始
            
            this.fetchMessages(this.selectedConversationId, 0, this.messagesPerPage, true);
        },

        // 【新增】加载更多消息的方法
        loadMoreMessages: function() {
            if (this.isLoadingMore || !this.hasMoreMessages) return;

            const offset = this.liaotianlishi.length; // 计算下一次请求的偏移量
            this.fetchMessages(this.selectedConversationId, offset, this.messagesPerPage, false);
        },

        // 【新增】封装的获取消息的通用方法
        fetchMessages: function(convoId, offset, limit, isInitialLoad) {
            this.isLoadingMore = true;
            axios.post('/apisub/qita/yuanxinai.php?act=get_conversation', {
                uid: USER_UID,
                duihua_id: convoId,
                offset: offset,
                limit: limit
            }).then(response => {
                if (response.data.code == 1 && response.data.duihua) {
                    this.totalMessages = response.data.total; // 更新总消息数
                    
                    const newMessages = response.data.duihua;
                    
                    // 如果是初次加载，直接赋值
                    if (isInitialLoad) {
                        this.liaotianlishi = newMessages;
                    } else {
                        // 如果是加载更多，将新消息添加到数组的开头
                        this.liaotianlishi = newMessages.concat(this.liaotianlishi);
                    }
                } else {
                    layer.alert(response.data.msg || '加载对话失败', { icon: 2 });
                }
            }).finally(() => {
                this.isLoadingMore = false;
            });
        },

        // 发送消息
        sendMessage: function() {
            if (this.isSending || this.newMessage.trim() === '') return;
            if (!this.xianlu || !this.moxingneme) {
                layer.msg('请选择线路和模型');
                return;
            }
            this.liaotianlishi.push({ sender: 'user', text: this.newMessage });
            this.sendToBackend(this.newMessage);
            this.newMessage = '';
            this.$refs.messageTextarea.style.height = 'auto';
        },

        // 核心方法：发送到后端
        sendToBackend: function(message, historyContext) {
            this.isSending = true;
            const historyToSend = historyContext !== undefined ? historyContext : this.getliaotianlishi();
            
            // 【修正】将 uid: USER_UID 作为请求体的一部分
            const requestData = {
                uid: USER_UID,
                xianlu: this.xianlu,
                model: this.moxingneme.name,
                user_model_price: this.moxingneme.price,
                message: message,
                history: this.qidonglishi ? JSON.stringify(historyToSend) : '[]',
                duihua_id: this.selectedConversationId,
                qidonglishi: this.qidonglishi,
                zuidahuifushu: this.zuidahuifushu,
                chuangzuoxing: this.chuangzuoxing
            };

            axios.post('/apisub/qita/yuanxinai.php?act=duihua', requestData)
                .then(response => {
                    if (response.data.code == 1) {
                        this.liaotianlishi.push({ sender: 'ai', text: response.data.result });
                        if (response.data.new_duihua_id) {
                            const newId = response.data.new_duihua_id;
                            this.selectedConversationId = newId;
                            this.conversationList.unshift({
                                id: newId,
                                dhname: "新对话 - " + new Date().toLocaleString(),
                                time: new Date().toISOString().slice(0, 19).replace('T', ' ')
                            });
                        }
                    } else {
                        this.liaotianlishi.push({ sender: 'ai', text: '抱歉，出错了：' + (response.data.msg || '未知错误') });
                    }
                })
                .catch(error => {
                    this.liaotianlishi.push({ sender: 'ai', text: '系统错误，请检查网络或联系管理员。' });
                })
                .finally(() => {
                    this.isSending = false;
                    this.$nextTick(() => {
                        const chatHistory = document.getElementById('chat-history');
                        if (chatHistory) chatHistory.scrollTop = chatHistory.scrollHeight;
                    });
                });
        },

        // 重新生成
        resendMessage: function(index) {
            const messageToResend = this.liaotianlishi[index];
            if (messageToResend.sender !== 'user') return;
            layer.confirm('这将从这条消息开始重新生成，后续消息将被覆盖，确定吗？', { title: '确认操作' }, (layerIndex) => {
                layer.close(layerIndex);
                this.liaotianlishi.splice(index + 1);
                const contextHistory = this.liaotianlishi.slice(0, index);
                this.sendToBackend(messageToResend.text, contextHistory);
            });
        },

        // 编辑消息
        editMessage: function(index) {
            const message = this.liaotianlishi[index];
            if (!message) return;
            layer.prompt({
                formType: 2,
                value: message.text,
                title: '编辑消息内容',
                area: ['400px', '200px']
            }, (value, layerIndex) => {
                layer.close(layerIndex);
                // 【修正】将 uid: USER_UID 作为请求体发送
                axios.post('/apisub/qita/yuanxinai.php?act=edit_message', {
                    uid: USER_UID,
                    duihua_id: this.selectedConversationId,
                    message_index: index,
                    new_text: value
                }).then(response => {
                    if (response.data.code == 1) {
                        this.liaotianlishi[index].text = value;
                        layer.msg('修改成功', { icon: 1 });
                    } else {
                        layer.alert(response.data.msg || '修改失败', { icon: 2 });
                    }
                });
            });
        },

        // 删除消息
        deleteMessage: function(index) {
            layer.confirm('确定要删除这条消息吗？', { title: "确认删除" }, (layerIndex) => {
                layer.close(layerIndex);
                // 【修正】将 uid: USER_UID 作为请求体发送
                axios.post('/apisub/qita/yuanxinai.php?act=delete_message', {
                    uid: USER_UID,
                    duihua_id: this.selectedConversationId,
                    message_index: index
                }).then(response => {
                    if (response.data.code == 1) {
                        this.liaotianlishi.splice(index, 1);
                        layer.msg('删除成功', { icon: 1 });
                    } else {
                        layer.alert(response.data.msg || '删除失败', { icon: 2 });
                    }
                });
            });
        },

        // 获取上下文
        getliaotianlishi: function() {
            // 如果用户设置的上下文长度为0，则返回空数组
            if (this.contextLength <= 0) {
                return [];
            }
            
            const historyLength = this.liaotianlishi.length;
            
            // 使用用户设置的 contextLength 来截取数组，而不是固定的 `6`
            const startIndex = Math.max(0, historyLength - this.contextLength);
            
            return this.liaotianlishi.slice(startIndex);
        }
    },
    // Vue 实例挂载后执行
    mounted: function() {
        this.userinfo();
        this.fetchApiLines();
        this.fetchConversationList();
    }
});