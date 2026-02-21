// ==UserScript==
// @name         AVS UI
// @namespace    https://github.com/Hibandd122/animevietsub
// @version      1.3
// @description  UI components and main logic (filter, settings, hotkeys) – no bookmark. Đã sửa lỗi tạo nút float.
// @author       HolaCanh
// ==/UserScript==

window.AVS_UI = class AVSApp {
    constructor() {
        const saved = window.AVS_Storage.get('settings', {});
        this.settings = { ...window.AVS_CONFIG.defaults, ...saved };
        this.init();
    }

    init() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setup());
        } else {
            this.setup();
        }
    }

    getPlayer() {
        return document.querySelector(window.AVS_CONFIG.player.selectors.join(','));
    }

    setup() {
        this.setupUI();
        this.setupEventListeners();
        this.setupHotkeys();
        this.applyTheme(this.settings.theme);
        window.AVS_Ghost.setupFullscreenListener(this);
        window.AVS_Ghost.setupPlayerObserver(this);

        this.showToast(`✨ AVS Ultimate V${window.AVS_CONFIG.version} đã sẵn sàng!`);
    }

    setupUI() {
        // Nếu nút float đã tồn tại (do fallback), thì không tạo lại
        if (document.getElementById('avs-float-btn')) {
            this.floatBtn = document.getElementById('avs-float-btn');
            // Gỡ bỏ fallback style để tránh xung đột
            const fallbackStyle = document.getElementById('avs-fallback-style');
            if (fallbackStyle) fallbackStyle.remove();
        } else {
            this.floatBtn = document.createElement('div');
            this.floatBtn.id = 'avs-float-btn';
            this.floatBtn.innerHTML = '⚡';
            document.body.appendChild(this.floatBtn);
        }

        // Load vị trí đã lưu
        const savedPos = window.AVS_Storage.get('floatPos', null);
        if (savedPos && typeof savedPos.left === 'number' && typeof savedPos.top === 'number') {
            this.floatBtn.style.left = savedPos.left + 'px';
            this.floatBtn.style.top = savedPos.top + 'px';
            this.floatBtn.style.right = 'auto';
            this.floatBtn.style.bottom = 'auto';
        }

        // Tạo overlay
        this.overlay = document.createElement('div');
        this.overlay.id = 'avs-overlay';
        this.overlay.innerHTML = this.generatePanelHTML();
        document.body.appendChild(this.overlay);

        this.bindUIEvents();
        this.initSettingsUI();
    }

    generatePanelHTML() {
        const config = window.AVS_CONFIG;
        const typeChips = config.types.map(t =>
            `<div class="avs-chip ${t.val === 'all' ? 'active' : ''}" data-val="${t.val}" data-group="type">${t.txt}</div>`
        ).join('');

        const seasonChips = config.seasons.map(s =>
            `<div class="avs-chip ${s.val === 'all' ? 'active' : ''}" data-val="${s.val}" data-group="season">${s.txt}</div>`
        ).join('');

        const yearChips = config.years.map(y =>
            `<div class="avs-chip" data-val="${y}" data-group="year">${y}</div>`
        ).join('');
        const yearAllChip = `<div class="avs-chip active" data-val="all" data-group="year">Tất cả</div>`;

        const genreChips = config.genres.map(g =>
            `<div class="avs-chip" data-val="${g.id}" data-group="genre">${g.name}</div>`
        ).join('');

        const settingsHTML = `
            <div class="avs-settings-group">
                <div class="avs-settings-title">⚙️ Cài đặt nhanh</div>
                <div class="avs-setting-item">
                    <label>Tự động toàn màn hình (khi click lần đầu)</label>
                    <input type="checkbox" id="avs-set-auto-fullscreen" ${this.settings.autoFullscreen ? 'checked' : ''}>
                </div>
                <div class="avs-setting-item">
                    <label>Ghost Mode mặc định (tự động khi fullscreen)</label>
                    <input type="checkbox" id="avs-set-ghost-mode" ${this.settings.ghostMode ? 'checked' : ''}>
                </div>
                <div class="avs-setting-item">
                    <label>Bước âm lượng (%)</label>
                    <div style="display: flex; align-items: center; gap: 10px;">
                        <input type="range" id="avs-set-volume-step" min="1" max="20" value="${this.settings.volumeStep}">
                        <span class="avs-setting-value" id="avs-volume-step-value">${this.settings.volumeStep}%</span>
                    </div>
                </div>
                <div class="avs-setting-item">
                    <label>Tắt hiệu ứng float (nút không bay lên xuống)</label>
                    <input type="checkbox" id="avs-set-disable-float" ${this.settings.disableFloatAnimation ? 'checked' : ''}>
                </div>
            </div>
        `;

        return `
            <div class="avs-panel">
                <div class="avs-header">
                    <h3 class="avs-title">⚡ Bộ Lọc Đa Năng V${config.version}</h3>
                    <div class="avs-close">&times;</div>
                </div>

                <div class="avs-sec-label">Loại Phim</div>
                <div class="avs-grid" id="grp-type">${typeChips}</div>

                <div class="avs-sec-label">Mùa</div>
                <div class="avs-grid" id="grp-season">${seasonChips}</div>

                <div class="avs-sec-label">Năm</div>
                <div class="avs-grid" id="grp-year">${yearAllChip}${yearChips}</div>

                <div class="avs-sec-label">Thể Loại (Chọn nhiều)</div>
                <input type="text" id="avs-genre-search" placeholder="🔍 Tìm kiếm thể loại...">
                <div class="avs-grid" id="grp-genre">${genreChips}</div>

                ${settingsHTML}

                <button class="avs-btn-apply" id="avs-apply">🚀 LỌC PHIM NGAY</button>
            </div>
        `;
    }

    bindUIEvents() {
        let isDragging = false;
        let startX, startY, startLeft, startTop;
        const dragThreshold = 5;

        const onMouseDown = (e) => {
            if (e.button !== 0) return;
            e.preventDefault();

            isDragging = false;
            startX = e.clientX;
            startY = e.clientY;
            const rect = this.floatBtn.getBoundingClientRect();
            startLeft = rect.left;
            startTop = rect.top;

            const onMouseMove = (e) => {
                const dx = Math.abs(e.clientX - startX);
                const dy = Math.abs(e.clientY - startY);
                if (dx > dragThreshold || dy > dragThreshold) {
                    isDragging = true;
                    this.floatBtn.classList.add('dragging');
                    let newLeft = startLeft + e.clientX - startX;
                    let newTop = startTop + e.clientY - startY;
                    newLeft = Math.max(0, Math.min(window.innerWidth - this.floatBtn.offsetWidth, newLeft));
                    newTop = Math.max(0, Math.min(window.innerHeight - this.floatBtn.offsetHeight, newTop));
                    this.floatBtn.style.left = newLeft + 'px';
                    this.floatBtn.style.top = newTop + 'px';
                    this.floatBtn.style.right = 'auto';
                    this.floatBtn.style.bottom = 'auto';
                }
            };

            const onMouseUp = (e) => {
                document.removeEventListener('mousemove', onMouseMove);
                document.removeEventListener('mouseup', onMouseUp);
                this.floatBtn.classList.remove('dragging');

                if (!isDragging) {
                    this.overlay.classList.add('active');
                } else {
                    const rect = this.floatBtn.getBoundingClientRect();
                    window.AVS_Storage.set('floatPos', { left: rect.left, top: rect.top });
                }
            };

            document.addEventListener('mousemove', onMouseMove);
            document.addEventListener('mouseup', onMouseUp);
        };

        this.floatBtn.addEventListener('mousedown', onMouseDown);

        this.overlay.addEventListener('click', (e) => {
            if (e.target === this.overlay || e.target.closest('.avs-close')) {
                this.overlay.classList.remove('active');
            }
        });

        const searchInput = document.getElementById('avs-genre-search');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                const keyword = e.target.value.toLowerCase();
                document.querySelectorAll('#grp-genre .avs-chip').forEach(chip => {
                    const text = chip.textContent.toLowerCase();
                    chip.style.display = text.includes(keyword) ? 'block' : 'none';
                });
            });
        }

        document.querySelectorAll('.avs-chip').forEach(chip => {
            chip.addEventListener('click', function() {
                const group = this.closest('[id^="grp-"]');
                if (!group) return;

                if (group.id === 'grp-genre') {
                    this.classList.toggle('active');
                    if (searchInput && searchInput.value) {
                        searchInput.value = '';
                        searchInput.dispatchEvent(new Event('input'));
                    }
                } else {
                    group.querySelectorAll('.avs-chip').forEach(c => c.classList.remove('active'));
                    this.classList.add('active');
                }
            });
        });

        document.getElementById('avs-apply').addEventListener('click', () => {
            this.applyFilter();
        });
    }

    initSettingsUI() {
        const autoFsCheck = document.getElementById('avs-set-auto-fullscreen');
        if (autoFsCheck) {
            autoFsCheck.addEventListener('change', (e) => {
                this.settings.autoFullscreen = e.target.checked;
                this.saveSettings();
            });
        }

        const ghostCheck = document.getElementById('avs-set-ghost-mode');
        if (ghostCheck) {
            ghostCheck.addEventListener('change', (e) => {
                this.settings.ghostMode = e.target.checked;
                this.saveSettings();
                if (document.fullscreenElement) {
                    const player = this.getPlayer();
                    if (player) {
                        if (this.settings.ghostMode) {
                            player.classList.add('avs-ghost-active');
                        } else {
                            player.classList.remove('avs-ghost-active');
                        }
                    }
                }
            });
        }

        const volumeStep = document.getElementById('avs-set-volume-step');
        const volumeStepVal = document.getElementById('avs-volume-step-value');
        if (volumeStep && volumeStepVal) {
            volumeStep.addEventListener('input', (e) => {
                const val = parseInt(e.target.value, 10);
                volumeStepVal.textContent = val + '%';
            });
            volumeStep.addEventListener('change', (e) => {
                this.settings.volumeStep = parseInt(e.target.value, 10);
                this.saveSettings();
            });
        }

        const disableFloatCheck = document.getElementById('avs-set-disable-float');
        if (disableFloatCheck) {
            disableFloatCheck.addEventListener('change', (e) => {
                this.settings.disableFloatAnimation = e.target.checked;
                this.saveSettings();
                if (this.settings.disableFloatAnimation) {
                    this.floatBtn.style.animation = 'none';
                } else {
                    this.floatBtn.style.animation = 'float 3s ease-in-out infinite';
                }
            });
        }
    }

    saveSettings() {
        window.AVS_Storage.set('settings', this.settings);
        this.showToast('⚙️ Đã lưu cài đặt');
    }

    applyFilter() {
        const getSelectedVal = (groupId) => {
            const active = document.querySelector(`#${groupId} .avs-chip.active`);
            return active ? active.dataset.val : 'all';
        };

        const type = getSelectedVal('grp-type');
        const genreChips = document.querySelectorAll('#grp-genre .avs-chip.active');
        const genres = genreChips.length ? Array.from(genreChips).map(c => c.dataset.val).join('-') : 'all';
        const season = getSelectedVal('grp-season');
        const year = getSelectedVal('grp-year');

        const url = `${window.location.origin}/danh-sach/${type}/${genres}/${season}/${year}/`;
        this.showToast('🔄 Đang lọc phim...');

        setTimeout(() => {
            window.location.href = url;
        }, 500);
    }

    setupEventListeners() {
        if (this.settings.autoFullscreen) {
            let hasClicked = false;
            document.addEventListener('click', (e) => {
                if (!hasClicked && !e.target.closest('#avs-float-btn') && !e.target.closest('#avs-overlay')) {
                    hasClicked = true;
                    const player = document.querySelector('video');
                    if (player && player.requestFullscreen) {
                        player.requestFullscreen().catch(() => {});
                    }
                }
            }, { once: true });
        }
    }

    setupHotkeys() {
        document.addEventListener('keydown', (e) => {
            if (document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'TEXTAREA') {
                return;
            }

            const key = e.key;
            const video = document.querySelector('video');
            const shortcuts = this.settings.shortcuts;

            if (key === shortcuts.ghost) {
                const player = this.getPlayer();
                if (player) {
                    player.classList.toggle('avs-ghost-active');
                    this.showToast(player.classList.contains('avs-ghost-active') ? '👻 Ghost Mode ON' : '👀 Ghost Mode OFF');
                }
            }

            if (key === 's' && !e.shiftKey) {
                e.preventDefault();
                const skipBtn = document.querySelector(window.AVS_CONFIG.player.skipButtons.join(','));
                if (skipBtn) {
                    skipBtn.click();
                    this.showToast('⏩ Skipped!');
                } else if (video) {
                    video.currentTime += this.settings.skipTime;
                    this.showToast(`⏩ +${this.settings.skipTime}s`);
                }
            }

            if (key === 'S' && e.shiftKey) {
                e.preventDefault();
                if (video) {
                    video.currentTime = Math.max(0, video.currentTime - 90);
                    this.showToast('⏪ -90s');
                }
            }

            if (key === 'ArrowRight' && video) {
                e.preventDefault();
                video.currentTime += 5;
                this.showToast('⏩ +5s');
            }
            if (key === 'ArrowLeft' && video) {
                e.preventDefault();
                video.currentTime -= 5;
                this.showToast('⏪ -5s');
            }

            if (key === 'ArrowUp' && video) {
                e.preventDefault();
                const step = this.settings.volumeStep || 5;
                let newVol = Math.min(1, (video.volume || 0) + step/100);
                video.volume = newVol;
                this.showVolumeToast(newVol * 100);
            }
            if (key === 'ArrowDown' && video) {
                e.preventDefault();
                const step = this.settings.volumeStep || 5;
                let newVol = Math.max(0, (video.volume || 0) - step/100);
                video.volume = newVol;
                this.showVolumeToast(newVol * 100);
            }

            if (key === shortcuts.toggleFilter) {
                this.overlay.classList.toggle('active');
            }
        });
    }

    showVolumeToast(percent) {
        let toast = document.getElementById('avs-toast');
        if (!toast) {
            toast = document.createElement('div');
            toast.id = 'avs-toast';
            document.body.appendChild(toast);
        }
        toast.innerHTML = `
            <div class="avs-volume-toast">
                <span>🔊</span>
                <div class="avs-volume-bar">
                    <div class="avs-volume-fill" style="width: ${percent}%;"></div>
                </div>
                <span>${Math.round(percent)}%</span>
            </div>
        `;
        toast.style.opacity = '1';
        clearTimeout(this.volumeToastTimeout);
        this.volumeToastTimeout = setTimeout(() => {
            toast.style.opacity = '0';
        }, 1500);
    }

    showToast(text, duration = 3000) {
        let toast = document.getElementById('avs-toast');
        if (!toast) {
            toast = document.createElement('div');
            toast.id = 'avs-toast';
            document.body.appendChild(toast);
        }
        toast.innerHTML = text;
        toast.style.opacity = '1';
        clearTimeout(this.toastTimeout);
        this.toastTimeout = setTimeout(() => {
            toast.style.opacity = '0';
        }, duration);
    }

    applyTheme(theme) {
        document.body.setAttribute('data-avs-theme', theme);
    }
};
