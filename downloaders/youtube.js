// YouTube API
const {google} = require('googleapis');

const youtube = google.youtube({
    version: 'v3',
    auth: process.env.YOUTUBE_API_KEY
});

// Youtube DL
const ytdl = require('youtube-dl-exec');

module.exports = {
    /**
     * Searcj for a song through youtube
     * 
     * @param {*} query 
     */
    async searchSongs(query) {
        let response = await youtube.search.list({
            part: 'snippet',
            type: 'video',
            q: query,
            maxResults: 10,
            safeSearch: 'moderate',
            videoEmbeddable: true
        }).then(res => {
            return res.data;
            console.log(res.data);
        }).catch(error => {
            console.error(error);
            return false;
        });

        if (response === false) {
            console.log("Error searching for songs");
            return [];
        }

        let results = response.items;

        let songs = {};

        results.forEach(result => {
            let snippet = result.snippet;
            let thumbnails = snippet.thumbnails; // Object of small/medium/high thumbnails

            songs[result.id.videoId] = {
                title: snippet.title,
                artist: snippet.channelTitle,
                publishDate: snippet.publishedAt,
                thumbnail: thumbnails.high.url,
            }
        });

        return songs;
    },

    /**
     * Add a song to the queue by a video ID.
     * 
     * @param {*} video_id 
     */
    addSongToQueue(video_id) {
        
    },

    /**
     * Returns an associative array of songs in the queue, where the key is the key is the video ID.
     */
    getQueue(guild_id) {

    }
}