// ==UserScript==
// @name         AVS AntiAds
// @namespace    https://github.com/Hibandd122/animevietsub
// @version      1.1
// @description  Anti-ad system
// @author       HolaCanh
// ==/UserScript==

window.AVS_AntiAds = class AntiAds {
    constructor() {
        this.initCookies();
        this.hijackWindowOpen();
        this.initObserver();
    }

    initCookies() {
        const config = window.AVS_CONFIG;
        config.ads.cookieFakes.forEach(c => {
            const date = new Date();
            date.setTime(date.getTime() + (c.days * 24 * 60 * 60 * 1000));
            document.cookie = `${c.name}=${c.value}; expires=${date.toUTCString()}; path=/`;
        });
    }

    hijackWindowOpen() {
        const config = window.AVS_CONFIG;
        const originalOpen = window.open;
        window.open = function(url, target, features) {
            if (url && typeof url === 'string') {
                if (config.ads.blockPatterns.some(p => p.test(url))) {
                    console.warn('[AVS] 🚫 Blocked popup:', url);
                    return null;
                }
            }
            return originalOpen.apply(this, arguments);
        };
    }

    initObserver() {
        const config = window.AVS_CONFIG;
        const observer = new MutationObserver((mutations) => {
            mutations.forEach(m => {
                m.addedNodes.forEach(node => {
                    if (node.nodeType === 1) {
                        config.ads.selectors.forEach(sel => {
                            if (node.matches && node.matches(sel)) {
                                node.remove();
                            } else if (node.querySelectorAll) {
                                node.querySelectorAll(sel).forEach(el => el.remove());
                            }
                        });
                    }
                });
            });
        });
        observer.observe(document.documentElement, { childList: true, subtree: true });
    }
};
