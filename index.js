(function() {
    'use strict';
    
    const TARGET_VALUE = 3;
    const PLUGIN_NAME = '[强制truncation=3]';
    const CHECK_INTERVAL = 5000; // 5秒检查一次（降低频率）
    
    let lastSaveTime = 0;
    const SAVE_COOLDOWN = 3000; // 保存冷却时间 3 秒
    
    function forceSettings() {
        if (typeof power_user === 'undefined') return false;
        
        let changed = false;
        
        // 只修改确定存在的字段
        if (power_user.chat_truncation !== TARGET_VALUE) {
            console.log(PLUGIN_NAME, `修改 chat_truncation: ${power_user.chat_truncation} → ${TARGET_VALUE}`);
            power_user.chat_truncation = TARGET_VALUE;
            changed = true;
        }
        
        // 节流保存（避免频繁写入）
        if (changed) {
            const now = Date.now();
            if (now - lastSaveTime > SAVE_COOLDOWN) {
                if (typeof saveSettingsDebounced === 'function') {
                    saveSettingsDebounced();
                    lastSaveTime = now;
                    console.log(PLUGIN_NAME, '已保存设置');
                }
            }
        }
        
        return true;
    }
    
    // 安全的 localStorage 修改
    function fixLocalStorage() {
        try {
            const stored = localStorage.getItem('power_user');
            if (stored) {
                const settings = JSON.parse(stored);
                if (settings.chat_truncation !== TARGET_VALUE) {
                    settings.chat_truncation = TARGET_VALUE;
                    localStorage.setItem('power_user', JSON.stringify(settings));
                    console.log(PLUGIN_NAME, '已修复 localStorage');
                }
            }
        } catch (e) {
            console.warn(PLUGIN_NAME, 'localStorage 操作失败:', e);
        }
    }
    
    function init() {
        console.log(PLUGIN_NAME, '插件已加载（安全版）');
        
        // 初始化时执行一次
        setTimeout(() => {
            forceSettings();
            fixLocalStorage();
        }, 500);
        
        // 定期检查（降低频率）
        setInterval(() => {
            forceSettings();
        }, CHECK_INTERVAL);
        
        // 页面激活时检查
        document.addEventListener('visibilitychange', () => {
            if (!document.hidden) {
                forceSettings();
            }
        });
        
        // 监听设置面板打开
        const observer = new MutationObserver(() => {
            const settingsPanel = document.querySelector('#user_settings');
            if (settingsPanel && settingsPanel.style.display !== 'none') {
                forceSettings();
            }
        });
        
        observer.observe(document.body, {
            childList: true,
            subtree: true,
            attributes: true,
            attributeFilter: ['style']
        });
    }
    
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();