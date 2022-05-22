"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.YouTubeDownloader = void 0;
const { google } = require('googleapis');
const scrape_youtube_1 = require("scrape-youtube");
const fs_1 = require("fs");
const voice_1 = require("@discordjs/voice");
const downloader_1 = require("./downloader");
const youtube = google.youtube({
    version: 'v3',
    auth: process.env.YOUTUBE_API_KEY
});
const ytdl = require('youtube-dl-exec');
class YouTubeDownloader extends downloader_1.Downloader {
    async searchSongs(query) {
        let songs;
        songs = await this.searchByYouTubeAPI(query);
        if (songs.length > 0) {
            return songs;
        }
        console.log(" - Falling back to YouTube scraper");
        songs = await this.searchByYouTubeScraper(query);
        return songs;
    }
    async searchByYouTubeAPI(query) {
        let response = await youtube.search.list({
            part: 'snippet',
            type: 'video',
            q: query,
            maxResults: 9,
            safeSearch: 'moderate',
            videoEmbeddable: true,
            videoCategoryId: 10
        }).then(res => {
            return res.data;
        }).catch(error => {
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
            return false;
        });
        if (response === false) {
            return [];
        }
        let results = response.items;
        let songs = {};
        results.forEach(result => {
            let snippet = result.snippet;
            let thumbnails = snippet.thumbnails;
            songs[result.id.videoId] = {
                title: snippet.title,
                artist: snippet.channelTitle,
                publishDate: snippet.publishedAt,
                thumbnail: thumbnails.high.url,
            };
        });
        return songs;
    }
    async searchByYouTubeScraper(query) {
        const headers = {
            'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/101.0.4951.67 Safari/537.36',
            'accept-language': 'en-US,en;q=0.9',
            'accept-encoding': 'gzip, deflate, br',
            'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
            'referer': 'https://youtube.com/'
        };
        const options = {
            type: 'video',
            requestOptions: {
                headers: headers
            }
        };
        console.log("Querying for song: " + query);
        console.log(options);
        const search = await scrape_youtube_1.youtube.search(query, options);
        let results = search.videos;
        return results.map(result => {
            return {
                id: result.id,
                title: result.title,
                artist: result.channel.name,
                thumbnail: result.thumbnail,
                publishDate: result.uploaded
            };
        });
    }
    async getCover(title, artist, album = null) {
        const lastfm = require("../lastfm");
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
        return await lastfm.getCoverUrl(title, artist);
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
