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
            maxResults: 9,
            safeSearch: 'moderate',
            videoEmbeddable: true,
            videoCategoryId: 10     // Music
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

    },

    async getSongData(video_id) {
        let data = await ytdl(`https://www.youtube.com/watch?v=${video_id}`, {
            dumpSingleJson: true,
        }).then(info => info);

        console.log(data);

        let artist = data.creator ?? data.uploader_id;
        let title = data.track ?? data.title;

        return {
            artist: artist,
            title: title,
        }
    },

    async downloadSong(video_id) {
        console.log(`Downloading song: ${video_id}`);

        return ytdl.exec(`https://www.youtube.com/watch?v=${video_id}`, {
            extractAudio: true,
            writeThumbnail: true,
            // output: `./downloads/%(creator)s/%(track)s (%(id)s).%(ext)s`,
            output: `./downloads/youtube/%(id)s.%(ext)s`,
            format: 'bestaudio',
        }).then(
            output => console.log(output)
        )
    }
}