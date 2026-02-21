window.AVS_Ghost = {
    setupFullscreenListener(app) {
        document.addEventListener('fullscreenchange', () => this.handleFullscreenChange(app));
        document.addEventListener('webkitfullscreenchange', () => this.handleFullscreenChange(app));
    },

    handleFullscreenChange(app) {
        const player = app.getPlayer();
        if (!player) return;

        if (document.fullscreenElement) {
            if (app.settings.ghostMode && !player.classList.contains('avs-ghost-active')) {
                player.classList.add('avs-ghost-active');
            }
        } else {
            player.classList.remove('avs-ghost-active');
        }
    },

    setupPlayerObserver(app) {
        const observer = new MutationObserver(() => {
            if (document.fullscreenElement && app.settings.ghostMode) {
                const player = app.getPlayer();
                if (player && !player.classList.contains('avs-ghost-active')) {
                    player.classList.add('avs-ghost-active');
                }
            }
        });
        observer.observe(document.body, { childList: true, subtree: true });
    }
};
