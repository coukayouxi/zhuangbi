// app.js
class AIAssistant {
    constructor() {
        this.apiKey = 'sk-xjnhcrfxfyqgxfhzyfbzjcnhhmrgiclysnchnolaqsccblhc';
        this.defaultModel = 'Qwen/Qwen3-8B';
        this.supportedModels = [
            'Qwen/Qwen3-8B',
            'deepseek-ai/DeepSeek-R1-0528-Qwen3-8B'
        ];
        this.chatHistory = this.loadChatHistory();
        
        this.init();
    }
    
    init() {
        this.setupRouter();
        this.bindGlobalEvents();
    }
    
    setupRouter() {
        const loadCurrentRoute = () => {
            const route = router.getCurrentRoute();
            router.loadPage(route);
        };
        
        window.addEventListener('hashchange', loadCurrentRoute);
        loadCurrentRoute();
    }
    
    bindGlobalEvents() {
        // 全局事件监听
        document.addEventListener('click', (e) => {
            // 侧边栏菜单点击
            if (e.target.closest('.sidebar-menu-item')) {
                const route = e.target.closest('.sidebar-menu-item').getAttribute('data-route');
                window.location.hash = `#${route}`;
            }
        });
    }
    
    loadChatHistory() {
        try {
            const history = localStorage.getItem('aiChatHistory');
            return history ? JSON.parse(history) : [];
        } catch (error) {
            console.error('Error loading chat history:', error);
            return [];
        }
    }
    
    saveChatHistory() {
        try {
            localStorage.setItem('aiChatHistory', JSON.stringify(this.chatHistory));
        } catch (error) {
            console.error('Error saving chat history:', error);
        }
    }
    
    addChatToHistory(chat) {
        chat.id = Date.now();
        chat.timestamp = new Date().toISOString();
        this.chatHistory.unshift(chat);
        // 限制历史记录数量
        if (this.chatHistory.length > 100) {
            this.chatHistory = this.chatHistory.slice(0, 100);
        }
        this.saveChatHistory();
    }
    
    getSettings() {
        try {
            const settings = localStorage.getItem('aiSettings');
            return settings ? JSON.parse(settings) : { model: this.defaultModel };
        } catch (error) {
            return { model: this.defaultModel };
        }
    }
    
    saveSettings(settings) {
        try {
            localStorage.setItem('aiSettings', JSON.stringify(settings));
        } catch (error) {
            console.error('Error saving settings:', error);
        }
    }
    
    async callAIApi(messages, model) {
        const url = 'https://api.siliconflow.cn/v1/chat/completions';
        const options = {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${this.apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: model,
                messages: messages
            })
        };

        try {
            const response = await fetch(url, options);
            const data = await response.json();
            
            if (response.status === 200) {
                // 根据实际响应结构调整数据格式
                // 实际响应格式与文档中的示例不一致，需要适配
                return {
                    results: [{
                        document: {
                            text: data.choices[0].message.content
                        }
                    }]
                };
            } else {
                throw new Error(this.handleError(response.status, data));
            }
        } catch (error) {
            throw error;
        }
    }
    
    handleError(status, data) {
        switch (status) {
            case 400:
                return data.message || '请求参数错误';
            case 401:
                return 'API密钥无效';
            case 404:
                return '请求的资源未找到';
            case 429:
                return data.message || '请求过于频繁，请稍后再试';
            case 503:
                return data.message || '模型服务过载，请稍后再试';
            case 504:
                return '请求超时，请稍后再试';
            default:
                return '未知错误';
        }
    }
}

// 初始化应用
const aiAssistant = new AIAssistant();