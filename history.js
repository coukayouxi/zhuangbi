// history.js
function historyPageInit() {
    const historyList = document.getElementById('history-list');
    
    function loadHistory() {
        const history = aiAssistant.loadChatHistory();
        
        if (history.length === 0) {
            historyList.innerHTML = '<p>暂无对话历史</p>';
            return;
        }
        
        historyList.innerHTML = '';
        history.forEach((chat, index) => {
            const historyItem = document.createElement('div');
            historyItem.className = 'history-item';
            historyItem.innerHTML = `
                <div class="history-title">${chat.title}</div>
                <div class="history-preview">${chat.messages[0]?.content?.substring(0, 50) || ''}...</div>
                <div class="history-time">${new Date(chat.timestamp).toLocaleString()}</div>
            `;
            
            historyItem.addEventListener('click', () => {
                // 这里可以跳转到聊天页面并加载历史对话
                console.log('Load chat:', chat);
            });
            
            historyList.appendChild(historyItem);
        });
    }
    
    loadHistory();
}