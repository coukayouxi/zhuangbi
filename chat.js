// chat.js
function chatPageInit() {
    const messageInput = document.getElementById('message-input');
    const sendButton = document.getElementById('send-button');
    const messagesContainer = document.getElementById('messages-container');
    const modelSelect = document.getElementById('model-select');
    
    // 加载设置
    const settings = aiAssistant.getSettings();
    modelSelect.value = settings.model;
    
    // 绑定事件
    sendButton.addEventListener('click', sendMessage);
    messageInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });
    
    modelSelect.addEventListener('change', (e) => {
        aiAssistant.saveSettings({ model: e.target.value });
    });
    
    function sendMessage() {
        const message = messageInput.value.trim();
        if (!message) return;
        
        // 添加用户消息
        addMessageToChat('user', message);
        messageInput.value = '';
        
        // 获取当前模型
        const model = modelSelect.value;
        
        // 获取聊天历史
        const chatMessages = getChatMessages();
        chatMessages.push({ role: 'user', content: message });
        
        // 显示AI正在输入
        const aiMessageId = addMessageToChat('ai', '<div class="typing-indicator"><span></span><span></span><span></span></div>');
        
        // 调用AI API
        aiAssistant.callAIApi(chatMessages, model)
            .then(response => {
                // 检查响应结果是否存在
                if (response && response.results && response.results.length > 0) {
                    const aiResponse = response.results[0].document.text;
                    updateAIMessage(aiMessageId, aiResponse);
                    
                    // 保存对话历史
                    aiAssistant.addChatToHistory({
                        title: message.substring(0, 30) + (message.length > 30 ? '...' : ''),
                        messages: [...chatMessages, { role: 'assistant', content: aiResponse }],
                        model: model
                    });
                } else {
                    console.log('API响应详情:', response); // 用于调试
                    updateAIMessage(aiMessageId, `错误: 无法从API获取有效响应。响应内容: ${JSON.stringify(response)}`);
                }
            })
            .catch(error => {
                console.error('API调用错误:', error); // 用于调试
                updateAIMessage(aiMessageId, `错误: ${error.message}`);
            });
    }
    
    function addMessageToChat(role, content) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${role}-message`;
        
        const messageHeader = document.createElement('div');
        messageHeader.className = 'message-header';
        messageHeader.innerHTML = role === 'user' 
            ? '<i class="fas fa-user"></i> 您' 
            : '<i class="fas fa-robot"></i> AI助手';
        
        const messageContent = document.createElement('div');
        messageContent.className = 'message-content';
        messageContent.innerHTML = formatMessageContent(content);
        
        messageDiv.appendChild(messageHeader);
        messageDiv.appendChild(messageContent);
        messagesContainer.appendChild(messageDiv);
        
        // 滚动到底部
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
        
        // 正确设置消息ID
        const messageId = 'msg-' + Date.now();
        messageDiv.id = messageId;
        return messageId;
    }
    
    function updateAIMessage(messageId, content) {
        const messageDiv = document.getElementById(messageId);
        if (messageDiv) {
            const contentDiv = messageDiv.querySelector('.message-content');
            contentDiv.innerHTML = formatMessageContent(content);
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }
    }
    
    function getChatMessages() {
        const messages = [];
        document.querySelectorAll('.message').forEach(msg => {
            const isUserMessage = msg.classList.contains('user-message');
            const role = isUserMessage ? 'user' : 'assistant';
            const contentElement = msg.querySelector('.message-content');
            
            // 正确获取消息内容，避免获取到输入指示器等额外内容
            let content = '';
            if (contentElement) {
                // 如果包含markdown-content元素，获取其中的文本
                const markdownContent = contentElement.querySelector('.markdown-content');
                if (markdownContent) {
                    content = markdownContent.textContent || markdownContent.innerText;
                } else {
                    // 否则直接获取内容元素的文本
                    content = contentElement.textContent || contentElement.innerText;
                }
            }
            
            // 过滤掉空消息、加载提示和输入指示器
            if (content && content.trim() && 
                !content.includes('正在输入') && 
                !content.includes('typing-indicator') &&
                content.trim() !== '') {
                messages.push({ 
                    role, 
                    content: content.trim() 
                });
            }
        });
        return messages;
    }
    
    function formatMessageContent(content) {
        // 这里应该使用marked和katex来渲染Markdown和数学公式
        // 由于外部文件限制，我们简化处理
        // 确保内容被正确包装以避免解析错误
        if (!content) return '<div class="markdown-content"></div>';
        
        // 转义HTML特殊字符以防止XSS
        const escapedContent = content
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;')
            .replace(/\n/g, '<br>');
            
        return `<div class="markdown-content">${escapedContent}</div>`;
    }
}