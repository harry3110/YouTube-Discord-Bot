// Config
const config = require('dotenv').config();

class lastFmAsync {
    lfm = null;

    constructor(options) {
        const lastFM = require("lastfm").LastFmNode;

        this.lfm = new lastFM(options);
    }

    async request(reqString, args) {
        return new Promise((resolve, reject) => {
            this.lfm.request(reqString, { ...args, handlers: {
                success: resolve,
                error: reject 
            }});
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
        } else {
            return data;
        }
    }

    async getCoverUrl(title, artist) {
        let data = await this.getTrackInfo(title, artist);

        let sizes = ["extralarge", "large", "medium", "small"];

        // Get sizes from the 'size' variable and smaller
        sizes = sizes.slice(sizes.indexOf(size));

        if (data.error) {
            return data.error;
        } else {
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
        } else {
            return data.similartracks.track;
        }
    }
}

let asyncLF = new lastFmAsync({
    api_key: process.env.LF_API_KEY,
    // secret: process.env.LF_API_SECRET,
    useragent: "BeeBop/1.0.0"
});

// asyncLF.getSimilarTracks("The Sign", "Ace of Base").then(data => {
//     console.log(data);
// });

// asyncLF.getCoverUrl("Pretty girl", "Maggie lindemann").then(data => {
//     console.log(data);
// });

/**
similarSongs.push({
    title: track.name,
    artist: track.artist.name,
    // album: track.album.title,
    cover: image_url,
    match_chance: track.match,
});
 */

module.exports = asyncLF;