// ==UserScript==
// @name         AVS Config
// @namespace    https://github.com/Hibandd122/animevietsub
// @version      1.0
// @description  Cấu hình cho AnimeVietsub Ultimate
// @author       HolaCanh
// ==/UserScript==

window.AVS_CONFIG = {
    version: '6.0',
    types: [
        { val: 'all', txt: 'Tất cả' },
        { val: 'list-le', txt: 'Movie/OVA' },
        { val: 'list-bo', txt: 'TV-Series' },
        { val: 'list-tron-bo', txt: 'Trọn bộ' }
    ],
    seasons: [
        { val: 'all', txt: 'Tất cả' },
        { val: 'winter', txt: 'Đông' },
        { val: 'spring', txt: 'Xuân' },
        { val: 'summer', txt: 'Hạ' },
        { val: 'autumn', txt: 'Thu' }
    ],
    years: ['2026','2025','2024','2023','2022','2021','2020','2019','2018','2017','2016','2015','2014','2013'],
    genres: [
        { id: 1, name: 'Action' }, { id: 2, name: 'Adventure' }, { id: 46, name: 'Boys Love' },
        { id: 44, name: 'Cartoon' }, { id: 47, name: 'Cổ Trang' }, { id: 3, name: 'Comedy' },
        { id: 7, name: 'Ecchi' }, { id: 8, name: 'Fantasy' }, { id: 10, name: 'Harem' },
        { id: 12, name: 'Horror' }, { id: 13, name: 'Josei' }, { id: 15, name: 'Magic' },
        { id: 17, name: 'Mecha' }, { id: 19, name: 'Music' }, { id: 20, name: 'Mystery' },
        { id: 22, name: 'Police' }, { id: 23, name: 'Psychological' }, { id: 24, name: 'Romance' },
        { id: 26, name: 'School' }, { id: 27, name: 'Sci-Fi' }, { id: 28, name: 'Seinen' },
        { id: 29, name: 'Shoujo' }, { id: 30, name: 'Shoujo Ai' }, { id: 31, name: 'Shounen' },
        { id: 32, name: 'Shounen Ai' }, { id: 33, name: 'Slice of Life' }, { id: 35, name: 'Sports' },
        { id: 37, name: 'Supernatural' }, { id: 38, name: 'Thriller' }, { id: 40, name: 'Yaoi' },
        { id: 41, name: 'Yuri' }
    ],
    ads: {
        blockPatterns: [
            /bom88|five_5ec|popunder|cpd|clickadu|exoclick|propellerads?/i,
            /utm_(source|medium|campaign|term|content)=/i,
            /(doubleclick|googlesyndication)\.net/i,
            /ad(\d)?\.(doubleclick|servedby)/i
        ],
        cookieFakes: [
            { name: 'popupOpened', value: 'true', days: 365 },
            { name: '__adblocker', value: 'false', days: 30 },
            { name: 'hasPopup', value: '1', days: 365 }
        ],
        selectors: [
            '.Adv', '.ad-center-980', '.pc_catfix_adv', '.Ads', '.bellow_ads_player',
            'div[id^="ads"]', '.banner-quang-cao', '#invideo_wrapper', '.Menu',
            '.filter-toggle', '#pc-catfixx', '.fbcmt', '[class*="quang-cao"]',
            '[class*="advert"]', 'iframe[src*="ads"]', 'ins.adsbygoogle'
        ]
    },
    player: {
        selectors: ['#watch-block', '.jwplayer', 'video', '.vjs-tech', '#player', '#video-player'],
        skipButtons: [
            '.jw-skip-intro', '.jw-skip-intro-text',
            'div[button="skipButton"]', 'div[aria-label="Skip OP/ED"]',
            '.vjs-skip-intro', '.skip-button'
        ]
    },
    defaults: {
        autoFullscreen: true,
        ghostMode: true,
        skipTime: 85,
        theme: 'netflix',
        volumeStep: 5,
        disableFloatAnimation: false,
        autoMarkWatched: true,
        watchedThreshold: 300,
        shortcuts: {
            ghost: 'H',
            skip: 'S',
            rewind: 'Shift+S',
            forward5: 'ArrowRight',
            backward5: 'ArrowLeft',
            toggleFilter: 'F',
            volumeUp: 'ArrowUp',
            volumeDown: 'ArrowDown',
            bookmark: 'B'
        }
    },
    cssUrls: {
        scriptUI: 'https://raw.githubusercontent.com/Hibandd122/animevietsub/main/script-ui.css',
        webEnhancement: 'https://raw.githubusercontent.com/Hibandd122/animevietsub/main/web-enhancement.css'
    }
};
