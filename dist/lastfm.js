"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.lastfm = void 0;
class lastFm {
    constructor(options) {
        this.lfm = null;
        const lastFM = require("lastfm").LastFmNode;
        this.lfm = new lastFM(options);
    }
    async request(reqString, args) {
        return new Promise((resolve, reject) => {
            this.lfm.request(reqString, { ...args, handlers: {
                    success: resolve,
                    error: reject
                } });
        });
    }
    async getTrackInfo(title, artist, autocorrect = true) {
        let data = await this.request("track.getInfo", {
            track: title,
            artist: artist,
            autocorrect: autocorrect
        });
        if (data.error) {
            return data.error;
        }
        else {
            return data;
        }
    }
    async getCoverUrl(title, artist) {
        let data = await this.getTrackInfo(title, artist);
        let sizes = ["extralarge", "large", "medium", "small"];
        if (data.error) {
            return data.error;
        }
        else {
            if (!data.track.album || !data.track.album.image) {
                return null;
            }
            let images = data.track.album.image;
            return images[images.length - 1]["#text"];
        }
    }
    async getSimilarTracks(title, artist, autocorrect = true) {
        let data = await this.request("track.getSimilar", {
            track: title,
            artist: artist,
            autocorrect: autocorrect
        });
        if (data.error) {
            return data.error;
        }
        else {
            return data.similartracks.track;
        }
    }
}
let lastfm = new lastFm({
    api_key: process.env.LF_API_KEY,
    useragent: "BeeBop/1.0.0"
});
exports.lastfm = lastfm;
