"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.YouTubeDownloader = void 0;
const { google } = require('googleapis');
const youtubei_1 = require("youtubei");
const fs_1 = require("fs");
const voice_1 = require("@discordjs/voice");
const downloader_1 = require("./downloader");
const lastfm_1 = require("../lastfm");
const youtube = google.youtube({
    version: 'v3',
    auth: process.env.YOUTUBE_API_KEY
});
const ytdl = require('youtube-dl-exec');
class YouTubeDownloader extends downloader_1.Downloader {
    async searchSongs(query, limit = 9) {
        let songs = await this.searchByYouTubeAPI(query, limit);
        if (songs.length > 0) {
            return songs;
        }
        console.log("No songs found with YouTube API");
        console.log(" - Falling back to YouTube scraper");
        songs = await this.searchByYouTubeScraper(query, limit);
        if (songs.length > 0) {
            console.log(` - Found ${songs.length} songs using scraper`);
        }
        else {
            console.log(" - No songs found with scraper");
        }
        songs = songs.slice(0, limit);
        return songs;
    }
    async searchByYouTubeAPI(query, limit = 9) {
        let results = null;
        try {
            let response = await youtube.search.list({
                part: 'snippet',
                type: 'video',
                q: query,
                maxResults: limit,
                safeSearch: 'moderate',
                videoEmbeddable: true,
                videoCategoryId: 10
            });
            results = response.data.items;
        }
        catch (error) {
            let errors = error.errors;
            console.log("Error searching for song: " + query);
            for (let i = 0; i < errors.length; i++) {
                if (errors[i].reason === "quotaExceeded") {
                    console.log(" - Quota exceeded");
                }
                else {
                    console.log(" - " + errors[i].message);
                }
            }
            return [];
        }
        let songs = [];
        results.forEach(result => {
            let snippet = result.snippet;
            let thumbnails = snippet.thumbnails;
            songs.push({
                id: result.id.videoId,
                title: snippet.title,
                artist: snippet.channelTitle,
                publishDate: snippet.publishedAt,
                thumbnail: thumbnails.high.url,
            });
        });
        return songs;
    }
    async searchByYouTubeScraper(query, limit = 9) {
        console.log("Querying for song: " + query);
        let scraper = new youtubei_1.Client();
        const videos = await scraper.search(query, {
            type: "video",
        });
        videos.slice(0, limit);
        let songs = [];
        videos.forEach(video => {
            songs.push({
                id: video.id,
                title: video.title,
                artist: video.channel.name,
                thumbnail: video.thumbnails[0].url,
                publishDate: video.uploadDate
            });
        });
        return songs;
    }
    async getCover(title, artist, album = null) {
        title = String(title).toLowerCase();
        title = title.replace("music video", "");
        title = title.replace("official video", "");
        title = title.replace("official music video", "");
        title = title.replace("lyrics", "");
        title = title.replace("lyric video", "");
        title.replace(/^(\(|\))+|(\(|\))+$/g, "");
        artist = String(artist).toLowerCase();
        artist = artist.replace("vevo", "");
        artist = artist.replace("official", "");
        return await lastfm_1.lastfm.getCoverUrl(title, artist);
    }
    async getSongData(video_id) {
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
        };
    }
    async downloadSong(video_id) {
        console.log(`Downloading song: ${video_id}`);
        let downloadLocation = `./downloads/youtube/${video_id}.%(ext)s`;
        let songFile = downloadLocation.replace("%(ext)s", "opus");
        if (fs_1.existsSync(songFile))
            return songFile;
        await ytdl.exec(`https://www.youtube.com/watch?v=${video_id}`, {
            extractAudio: true,
            writeThumbnail: true,
            output: downloadLocation,
            format: 'bestaudio',
        }).then(output => {
            console.log({
                "status": "success",
                "output": output
            });
        }).catch(error => {
            console.error({
                "status": "error",
                "error": error
            });
        });
        return songFile;
    }
    createAudioResource(video_url) {
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
                if (!process.killed)
                    process.kill();
                stream.resume();
                reject(error);
            };
            process.once('spawn', () => {
                voice_1.demuxProbe(stream).then((probe) => resolve(voice_1.createAudioResource(probe.stream, {
                    metadata: this,
                    inputType: probe.type
                }))).catch(onError);
            }).catch(onError);
        });
    }
}
exports.YouTubeDownloader = YouTubeDownloader;
//# sourceMappingURL=youtube.js.map