import { AudioResource } from '@discordjs/voice';
import { Song } from 'src/song-interface';

class Downloader
{
    /**
     * Search for a song through youtube
     * 
     * @param {*} query 
     */
    async searchSongs(query: string) {
        return []
    }

    async getCover(title: string, artist: string, album: string): Promise<string> {
        const lastfm = require("../lastfm");

        title = String(title).toLowerCase();
        artist = String(artist).toLowerCase();

        return await lastfm.getCoverUrl(title, artist);
    }

    async getSongData(video_id: string): Promise<Song|null> {
        return null;
    }

    /**
     * Returns the URL of the song
     *
     * @param video_id 
     * @returns 
     */
    async downloadSong(video_id: string): Promise<string|Boolean> {
        return false;
    }

    /**
     * 
     * @returns {Promise<AudioResource>}
     */
    createAudioResource(video_url: string): Promise<AudioResource> {
		return new Promise((resolve, reject) => {
			return false;
		});
	}
}

export { Downloader };