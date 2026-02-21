// ==UserScript==
// @name         AVS Storage
// @namespace    https://github.com/Hibandd122/animevietsub
// @version      1.1
// @description  Storage manager for AVS (GM + localStorage)
// @author       HolaCanh
// ==/UserScript==

window.AVS_Storage = {
    get: function(key, defaultValue) {
        try {
            if (typeof GM_getValue !== 'undefined') {
                let val = GM_getValue(`avs6_${key}`, null);
                if (val !== null) return val;
            }
            const lsVal = localStorage.getItem(`avs6_${key}`);
            return lsVal ? JSON.parse(lsVal) : defaultValue;
        } catch (e) {
            console.warn('[AVS] Storage get error:', e);
            return defaultValue;
        }
    },
    set: function(key, value) {
        try {
            if (typeof GM_setValue !== 'undefined') {
                GM_setValue(`avs6_${key}`, value);
            }
            localStorage.setItem(`avs6_${key}`, JSON.stringify(value));
        } catch (e) {
            console.warn('[AVS] Storage set error:', e);
        }
    },
    getAllKeys: function(prefix) {
        let keys = [];
        try {
            if (typeof GM_listValues !== 'undefined') {
                let all = GM_listValues();
                keys = all.filter(k => k.startsWith(`avs6_${prefix}`));
            }
        } catch (e) {}
        try {
            for (let i = 0; i < localStorage.length; i++) {
                let key = localStorage.key(i);
                if (key && key.startsWith(`avs6_${prefix}`)) {
                    keys.push(key);
                }
            }
        } catch (e) {}
        return [...new Set(keys)];
    }
};
