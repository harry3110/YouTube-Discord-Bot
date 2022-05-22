"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Downloader = exports.getDownloader = void 0;
const config = require('dotenv').config();
function getDownloader() {
    if (process.env.DOWNLOADER === 'plex') {
        const { PlexDownloader } = require('./plex');
        return new PlexDownloader();
    }
    const { YouTubeDownloader } = require("./youtube");
    return new YouTubeDownloader();
}
exports.getDownloader = getDownloader;
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