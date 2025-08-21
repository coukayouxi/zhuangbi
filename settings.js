// settings.js
function settingsPageInit() {
    const modelSelect = document.getElementById('default-model');
    const clearHistoryBtn = document.getElementById('clear-history');
    
    // 加载设置
    const settings = aiAssistant.getSettings();
    modelSelect.value = settings.model;
    
    // 绑定事件
    modelSelect.addEventListener('change', (e) => {
        aiAssistant.saveSettings({ model: e.target.value });
    });
    
    clearHistoryBtn.addEventListener('click', () => {
        if (confirm('确定要清除所有对话历史吗？')) {
            localStorage.removeItem('aiChatHistory');
            alert('对话历史已清除');
        }
    });
}