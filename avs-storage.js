window.AVS_Storage = {
    get: function(key, defaultValue) {
        try {
            if (typeof GM_getValue !== 'undefined') {
                let val = GM_getValue(`avs7_${key}`, null);
                if (val !== null) return val;
            }
            const lsVal = localStorage.getItem(`avs7_${key}`);
            return lsVal ? JSON.parse(lsVal) : defaultValue;
        } catch (e) {
            console.warn('[AVS] Storage get error:', e);
            return defaultValue;
        }
    },
    set: function(key, value) {
        try {
            if (typeof GM_setValue !== 'undefined') {
                GM_setValue(`avs7_${key}`, value);
            }
            localStorage.setItem(`avs7_${key}`, JSON.stringify(value));
        } catch (e) {
            console.warn('[AVS] Storage set error:', e);
        }
    },
    getAllKeys: function(prefix) {
        let keys = [];
        try {
            if (typeof GM_listValues !== 'undefined') {
                let all = GM_listValues();
                keys = all.filter(k => k.startsWith(`avs7_${prefix}`));
            }
        } catch (e) {}
        try {
            for (let i = 0; i < localStorage.length; i++) {
                let key = localStorage.key(i);
                if (key && key.startsWith(`avs7_${prefix}`)) {
                    keys.push(key);
                }
            }
        } catch (e) {}
        return [...new Set(keys)];
    }
};
