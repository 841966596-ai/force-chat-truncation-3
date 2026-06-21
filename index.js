(function() {
    'use strict';

    const TARGET_VALUE = 3;
    const PLUGIN_NAME = '[强制chat_truncation=3]';

    function enforceSettings() {
        if (typeof power_user === 'undefined' || !power_user) {
            console.log(PLUGIN_NAME, 'power_user 未加载，等待...');
            return false;
        }

        const currentValue = power_user.chat_truncation;

        if (currentValue !== TARGET_VALUE) {
            console.log(PLUGIN_NAME, `检测到 chat_truncation = ${currentValue}，强制修改为 ${TARGET_VALUE}`);
            power_user.chat_truncation = TARGET_VALUE;

            if (typeof saveSettingsDebounced === 'function') {
                saveSettingsDebounced();
                console.log(PLUGIN_NAME, '已保存设置');
            }

            const inputElement = document.querySelector('input[name="chat_truncation"], #chat_truncation');
            if (inputElement) {
                inputElement.value = TARGET_VALUE;
            }

            return true;
        }

        console.log(PLUGIN_NAME, `设置已正确：chat_truncation = ${TARGET_VALUE}`);
        return true;
    }

    function watchSettings() {
        if (typeof power_user === 'undefined' || power_user.__chatTruncationWatched) return;

        const originalValue = power_user.chat_truncation;

        Object.defineProperty(power_user, 'chat_truncation', {
            get: function() {
                return this._chat_truncation || TARGET_VALUE;
            },
            set: function(value) {
                if (value !== TARGET_VALUE) {
                    console.log(PLUGIN_NAME, `拦截修改尝试：${value} → ${TARGET_VALUE}`);
                    value = TARGET_VALUE;
                }
                this._chat_truncation = value;
            }
        });

        power_user._chat_truncation = originalValue;
        power_user.__chatTruncationWatched = true;
        console.log(PLUGIN_NAME, '已启用设置监听');
    }

    function init() {
        console.log(PLUGIN_NAME, '插件已加载');

        let attemptCount = 0;
        const maxAttempts = 50;

        const checkInterval = setInterval(() => {
            attemptCount++;

            if (enforceSettings()) {
                clearInterval(checkInterval);
                watchSettings();
                setInterval(enforceSettings, 10000);
            } else if (attemptCount >= maxAttempts) {
                clearInterval(checkInterval);
                console.error(PLUGIN_NAME, 'power_user 加载超时');
            }
        }, 200);
    }

    if (typeof jQuery !== 'undefined') {
        jQuery(init);
    } else {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', init);
        } else {
            init();
        }
    }
})();