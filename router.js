// router.js
class Router {
    constructor() {
        this.routes = {
            'chat': 'chat.html',
            'history': 'history.html',
            'settings': 'settings.html',
            'about': 'about.html'
        };
        this.defaultRoute = 'chat';
    }

    getCurrentRoute() {
        const hash = window.location.hash.replace('#', '');
        return hash || this.defaultRoute;
    }

    async loadPage(route) {
        const pageFile = this.routes[route] || this.routes[this.defaultRoute];
        try {
            const response = await fetch(pageFile);
            if (response.ok) {
                const html = await response.text();
                document.getElementById('page-content').innerHTML = html;
                this.updateActiveMenu(route);
                // 加载页面特定的JavaScript
                await this.loadPageScript(route);
            } else {
                throw new Error('Page not found');
            }
        } catch (error) {
            console.error('Error loading page:', error);
            document.getElementById('page-content').innerHTML = '<div class="page"><h2>页面加载失败</h2></div>';
        }
    }

    updateActiveMenu(route) {
        document.querySelectorAll('.sidebar-menu-item').forEach(item => {
            item.classList.remove('active');
            if (item.getAttribute('data-route') === route) {
                item.classList.add('active');
            }
        });
    }

    async loadPageScript(route) {
        try {
            const script = document.createElement('script');
            script.src = `${route}.js`;
            script.onload = () => {
                if (window[`${route}PageInit`]) {
                    window[`${route}PageInit`]();
                }
            };
            document.head.appendChild(script);
        } catch (error) {
            console.log('No specific script for page:', route);
        }
    }
}

const router = new Router();