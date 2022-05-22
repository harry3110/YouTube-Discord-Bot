import { URL } from "url";

interface LastFmImage {
    '#text': string; // URL to image
    size: string;
}

interface LastFmSimilarTrack {
    name: string;
    artist: {
        name: string;
        url: string; // Last FM URL
    },
    image: LastFmImage[],
    match: number;
    playcount: number;
    streamable: {
        "#text": string;
        fulltrack: string;
    }
    url: string;
}

class lastFm {
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
        let data: any = await this.request("track.getInfo", {
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

    async getCoverUrl(title: string, artist: string) {
        let data = await this.getTrackInfo(title, artist);

        let sizes = ["extralarge", "large", "medium", "small"];

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

    async getSimilarTracks(title, artist, autocorrect = true): Promise<LastFmSimilarTrack> {
        let data: any = await this.request("track.getSimilar", {
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

let lastfm = new lastFm({
    api_key: process.env.LF_API_KEY,
    // secret: process.env.LF_API_SECRET,
    useragent: "BeeBop/1.0.0"
});

// lastfm.getSimilarTracks("The Sign", "Ace of Base").then(data => {
//     console.log(data);
// });

// lastfm.getCoverUrl("Pretty girl", "Maggie lindemann").then(data => {
//     console.log(data);
// });

/* similarSongs.push({
    title: track.name,
    artist: track.artist.name,
    // album: track.album.title,
    cover: image_url,
    match_chance: track.match,
}); */

export { lastfm };