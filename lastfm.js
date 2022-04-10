// Config
const config = require('dotenv').config();

const lastFM = require("last-fm");
const lastfm = new lastFM(process.env.LF_API_KEY, {
    userAgent: "BeeBop/1.0.0"
})

let fm = {
    /**
     * Get the cover art for a song
     * 
     * @param {*} title 
     * @param {*} artist 
     * @returns 
     */
    getCoverUrl: function(title, artist) {
        let query = {
            name: title,
            artistName: artist,
        }

        let coverUrl = null;
        
        lastfm.trackInfo(query, (error, data) => {
            if (error) {
                console.log("There was an error:");
                console.log(error);
                return;
            }
        
            console.log(data);

            let images = data.images;
        
            // Get the last image in the array
            coverUrl = images[images.length - 1];
        })

        return coverUrl;
    },

    getSimilarSongs(title, artist, limit = 10) {
        let query = {
            name: title,
            artistName: artist,
            limit: limit
        }

        var similarSongs = [];
        
        lastfm.trackSimilar(query, (error, data) => {
            if (error) {
                console.log("There was an error:");
                console.log(error);
                return;
            }

            let tracks = data.track;

            tracks.forEach(track => {
                // Get cover image
                // Possible image sizes: small, medium, large, extralarge, mega
                let image_url = track.image.find(image => image.size === 'large')['#text'];

                similarSongs.push({
                    title: track.name,
                    artist: track.artist.name,
                    // album: track.album.title,
                    cover: image_url,
                    match_chance: track.match,
                });
            })
        });

        // @TODO The songs aren't being returned because the callback isn't setup to return the songs (in the API)

        return similarSongs;
    }
}

let songs = fm.getSimilarSongs("The Sign", "Ace of Base");

console.log(songs);

console.log("Finished");

// module.exports = fm;