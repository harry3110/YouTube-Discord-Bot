"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlexDownloader = void 0;
const downloader_1 = require("./downloader");
const fs_1 = require("fs");
const path_1 = require("path");
const voice_1 = require("@discordjs/voice");
const plex_api_1 = require("plex-api");
const http_1 = require("http");
var plex = new plex_api_1.default({
    hostname: process.env.PLEX_HOSTNAME,
    token: process.env.PLEX_TOKEN
});
class PlexDownloader extends downloader_1.Downloader {
    getPlexUrl(absoluteUrl, addToken = true, protocol = "http", extraParams = []) {
        if (absoluteUrl.startsWith("/")) {
            absoluteUrl = absoluteUrl.substring(1);
        }
        let url_string = `${process.env.PLEX_HOSTNAME}:${process.env.PLEX_PORT}/${absoluteUrl}`;
        let url = new URL(url_string);
        if (addToken) {
            url.searchParams.set("X-Plex-Token", process.env.PLEX_TOKEN);
        }
        extraParams.forEach(param => {
            url.searchParams.set(param.name, param.value);
        });
        return protocol + "://" + url.toString();
    }
    async getTracks(query, limit = 10) {
        return await this.getSearchResults(query, limit, "music");
    }
    async getSearchResults(query, limit = 10, searchType = null) {
        query = encodeURIComponent(query);
        let response = await this.query(`/hubs/search?query=${query}&includeExternalMedia=0&limit=${limit}` + (searchType ? "&searchTypes=" + searchType : ""));
        return response.MediaContainer.Hub;
    }
    async getTrack(trackId) {
        let data = await this.query(`/library/metadata/${trackId}`);
        return data.MediaContainer.Metadata[0];
    }
    async query(absoluteUrl, addToken = true) {
        let char = String(absoluteUrl).includes("?") ? "&" : "?";
        let url = absoluteUrl + (addToken ? char + "X-Plex-Token=" + process.env.PLEX_TOKEN : "");
        return await plex.query(url);
    }
    async searchSongs(query) {
        let results = await this.getTracks(query);
        let search = results.find(result => result.type == "track");
        let tracks = [];
        for (let track of search["Metadata"]) {
            let title = String(track.title);
            let artist = String(track.originalTitle ?? track.grandparentTitle);
            let album = String(track.parentTitle);
            let cover = String(track.thumb);
            tracks.push({
                type: "plex",
                id: String(track.ratingKey),
                title: title,
                artist: artist,
                album: album,
                url: this.getPlexUrl(track.Media[0].Part[0].key),
                skipped: false,
                cover: cover,
                createAudioResource: this.createAudioResource
            });
        }
        return tracks;
    }
    async getCover(title, artist, album) {
        const lastfm = require("../lastfm");
        return await lastfm.getCoverUrl(title, artist);
    }
    async downloadFile(url, downloadPath) {
        let file = fs_1.createWriteStream(downloadPath);
        http_1.get(url, function (response) {
            response.on('data', (chunk) => { });
            response.on('end', () => { });
            response.pipe(file);
        });
    }
    async downloadCover(localAbsoluteUrl, trackId) {
        const url = this.getPlexUrl(localAbsoluteUrl);
        const downloadPath = path_1.resolve(`../downloads/plex/cover-${trackId}.jpg`);
        await this.downloadFile(url, downloadPath);
        return downloadPath;
    }
    async getSongData(id) {
        let trackInfo = await this.getTrack(id);
        console.log(trackInfo);
        let title = String(trackInfo.title);
        let artist = String(trackInfo.originalTitle ?? trackInfo.grandparentTitle);
        let album = String(trackInfo.parentTitle);
        return {
            id: id,
            title: title,
            artist: artist,
            album: album,
            url: this.getPlexUrl(trackInfo.Media[0].Part[0].key),
            skipped: false,
            cover: await this.getCover(title, artist, album),
            createAudioResource: this.createAudioResource
        };
    }
    async downloadSong(video_id) {
        let song = await this.getSongData(video_id);
        let url = song.url;
        let downloadPath = `./downloads/plex/${video_id}.ext`;
        const file = fs_1.createWriteStream(downloadPath);
        http_1.get(url, resp => {
            resp.pipe(file);
            file.on('finish', () => {
                file.close();
            });
        });
        return downloadPath;
    }
    createAudioResource(video_url) {
        console.log("Creating audio resource", video_url);
        return new Promise((resolve, reject) => {
            resolve(voice_1.createAudioResource(video_url));
        });
    }
}
exports.PlexDownloader = PlexDownloader;
//# sourceMappingURL=plex.js.map