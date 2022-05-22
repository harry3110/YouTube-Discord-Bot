"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Downloader = void 0;
class Downloader {
    async searchSongs(query) {
        return [];
    }
    async getCover(title, artist, album) {
        const lastfm = require("../lastfm");
        title = String(title).toLowerCase();
        artist = String(artist).toLowerCase();
        return await lastfm.getCoverUrl(title, artist);
    }
    async getSongData(video_id) {
        return null;
    }
    async downloadSong(video_id) {
        return false;
    }
    createAudioResource(video_url) {
        return new Promise((resolve, reject) => {
            return false;
        });
    }
}
exports.Downloader = Downloader;
//# sourceMappingURL=downloader.js.map