const { google } = require('googleapis');
import { Client as youtubeScraper } from 'youtubei';
import VideoCompact from '../../node_modules/youtubei/dist/classes/VideoCompact';

import { existsSync } from 'fs';
import { AudioResource, createAudioResource, demuxProbe } from '@discordjs/voice';
import { Downloader } from './downloader';
import { Song } from '../song-interface';
import { lastfm } from '../lastfm';

const youtube = google.youtube({
    version: 'v3',
    auth: process.env.YOUTUBE_API_KEY
});

// Youtube Search Interface
interface YoutubeSearchVideo {
    kind: string;
    etag: string;
    id: {
        kind: string;
        videoId: string;
    },
    snippet: {
        publishedAt: string;
        channelId: string;
        title: string;
        description: string;
        thumbnails: any;
        channelTitle: string;
        liveBroadcastContent: string;
        publishTime: string;
    }
}

// Youtube DL
const ytdl = require('youtube-dl-exec');

class YouTubeDownloader extends Downloader
{
    /**
     * Search for a song through youtube
     * 
     * @param {*} query 
     */
    async searchSongs(query: string) {
        let songs;

        songs = await this.searchByYouTubeAPI(query);
        
        if (songs) {
            return songs;
        }

        console.log("No songs found with YouTube API");
        
        console.log(" - Falling back to YouTube scraper");
        songs = await this.searchByYouTubeScraper(query);

        return songs;
    }

    async searchByYouTubeAPI(query: string) {
        let results: YoutubeSearchVideo[]|null = null;

        try {
            let response = await youtube.search.list({
                part: 'snippet',
                type: 'video',
                q: query,
                maxResults: 9,
                safeSearch: 'moderate',
                videoEmbeddable: true,
                videoCategoryId: 10     // Music
            });

            results = response.data.items;
        } catch (error) {
            let errors = error.errors;

            console.log("Error searching for song: " + query);

            for (let i = 0; i < errors.length; i++) {
                if (errors[i].reason === "quotaExceeded") {
                    console.log(" - Quota exceeded");
                } else {
                    console.log(" - " + errors[i].message);
                }
            }

            return false;
        }

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
    }

    async searchByYouTubeScraper(query: string) {
        console.log("Querying for song: " + query);

        let scraper = new youtubeScraper();
        
        const videos: VideoCompact[] = await scraper.search(query, {
            type: "video",
        });

        let songs = {};

        videos.forEach(video => {
            songs[video.id] = {
                id: video.id,
                title: video.title,
                artist: video.channel.name,
                thumbnail: video.thumbnails[0].url,
                publishDate: video.uploadDate
            };
        });

        return songs;
    }

    async getCover(title: string, artist: string, album: string|null = null) {
        title = String(title).toLowerCase();
        
        // Remove common YouTube music video/lyric words
        title = title.replace("music video", "");
        title = title.replace("official video", "");
        title = title.replace("official music video", "");
        title = title.replace("lyrics", "");
        title = title.replace("lyric video", "");

        // Trim '(' and ')' from the title
        title.replace(/^(\(|\))+|(\(|\))+$/g, "");

        artist = String(artist).toLowerCase();

        // Remove common YouTube music words
        artist = artist.replace("vevo", "");
        artist = artist.replace("official", "");

        return await lastfm.getCoverUrl(title, artist);
    }

    async getSongData(video_id: string): Promise<Song|null> {
        let video_url = `https://www.youtube.com/watch?v=${video_id}`;

        let data = await ytdl(video_url, {
            dumpSingleJson: true,
        }).then(info => info);

        let artist = data.creator ?? data.uploader;
        let title = data.track ?? data.title;
        let album = data.album = null ?? data.playlist ?? "Unknown Album";

        return {
            id: video_id,
            title: title,
            artist: artist,
            album: album,
            url: video_url,
            skipped: false,
            cover: await this.getCover(title, artist) ?? data.thumbnail,
            createAudioResource: this.createAudioResource
        }
    }

    async downloadSong(video_id: string): Promise<string> {
        console.log(`Downloading song: ${video_id}`);

        let downloadLocation = `./downloads/youtube/${video_id}.%(ext)s`;
        let songFile = downloadLocation.replace("%(ext)s", "opus");

        if (existsSync(songFile)) return songFile;

        await ytdl.exec(`https://www.youtube.com/watch?v=${video_id}`, {
            extractAudio: true,
            writeThumbnail: true,
            // output: `./downloads/%(creator)s/%(track)s (%(id)s).%(ext)s`,
            output: downloadLocation,
            format: 'bestaudio',
            // audioFormat: "opus",        // Make YouTube DL only use opus
        }).then(output => {
            console.log({
                "status": "success",
                "output": output
            });
        }).catch(error => {
            console.error({
                "status": "error",
                "error": error
            })
        });

        return songFile;
    }

    /**
     * 
     * @returns {Promise<AudioResource<Track>>}
     */
    createAudioResource(video_url: string): Promise<AudioResource> {
		return new Promise((resolve, reject) => {
			const process = ytdl.exec(video_url, {
                o: '-',
                q: '',
                f: 'bestaudio[ext=webm+acodec=opus+asr=48000]/bestaudio',
                r: '100K',
            }, {
                stdio: [
                    'ignore',
                    'pipe',
                    'ignore'
                ]
            });

			if (!process.stdout) {
				reject(new Error('No stdout'));
				return;
			}

			const stream = process.stdout;

			const onError = (error) => {
				if (!process.killed) process.kill();
				stream.resume();
				reject(error);
			}

            process.once('spawn', () => {
                demuxProbe(stream).then((probe) =>
                    resolve(createAudioResource(probe.stream, {
                        metadata: this,
                        inputType: probe.type
                    }))
                ).catch(onError);
            }).catch(onError);
		});
	}
}

export { YouTubeDownloader }