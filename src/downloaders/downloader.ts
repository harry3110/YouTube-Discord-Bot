import { AudioResource } from '@discordjs/voice';
import { Song } from 'src/song-interface';

const config = require('dotenv').config();

export interface SongSearchResult {
    id: string;
    title: string;
    artist: string;
    publishDate: string;
    thumbnail: string;
}

export function getDownloader() {
    // Plex Downloader
    if (process.env.DOWNLOADER === 'plex') {
        const { PlexDownloader } = require('./plex');

        return new PlexDownloader();
    }
    
    // YouTube Downloader
    const { YouTubeDownloader } = require("./youtube");
    return new YouTubeDownloader();
}

class Downloader
{
    /**
     * Search for a song through youtube
     * 
     * @param {*} query 
     */
    async searchSongs(query: string): Promise<SongSearchResult[]> {
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