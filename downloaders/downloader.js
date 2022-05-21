class Downloader
{
    /**
     * Search for a song through youtube
     * 
     * @param {*} query 
     */
    async searchSongs(query) {
        return []
    }

    async getCover(title, artist, album) {
        const lastfm = require("../lastfm");

        title = String(title).toLowerCase();
        artist = String(artist).toLowerCase();

        return await lastfm.getCoverUrl(title, artist);
    }

    async getSongData(video_id) {
        return {}
    }

    async downloadSong(video_id) {
        return false;
    }

    /**
     * 
     * @returns {Promise<AudioResource<Track>>}
     */
    createAudioResource(video_url) {
		return new Promise((resolve, reject) => {
			return false;
		});
	}
}

module.exports = Downloader;