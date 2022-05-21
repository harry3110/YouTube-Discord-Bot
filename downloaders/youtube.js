// YouTube API
const {google} = require('googleapis');
const { from_string } = require('libsodium-wrappers');
const fs = require('fs');
const { AudioResource, createAudioResource, demuxProbe } = require('@discordjs/voice');
const Downloader = require('./downloader');

const youtube = google.youtube({
    version: 'v3',
    auth: process.env.YOUTUBE_API_KEY
});

// Youtube DL
const ytdl = require('youtube-dl-exec');

class YouTubeDownloader extends Downloader
{
    /**
     * Search for a song through youtube
     * 
     * @param {*} query 
     */
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
            videoCategoryId: 10     // Music
        }).then(res => {
            return res.data;
        }).catch(error => {
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
        });

        if (response === false) {
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
    }

    async searchByYouTubeScraper(query) {
        const { search } = require('scrape-youtube');

        const headers = {
            'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/101.0.4951.67 Safari/537.36',
            'accept-language': 'en-US,en;q=0.9',
            'accept-encoding': 'gzip, deflate, br',
            'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
            'referer': 'https://youtube.com/'
        }

        const options = {
            type: 'video',
            requestOptions: {
                headers: headers
            }
        }

        let result = await search(query, options);

        return [
            {
                id: result.id,
                title: result.title,
                artist: result.channel.name,
                thumbnail: result.thumbnail,
                publishDate: result.uploaded
            }
        ];
    }

    async getCover(title, artist, album) {
        const lastfm = require("../lastfm");

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

    async getSongData(video_id) {
        let video_url = `https://www.youtube.com/watch?v=${video_id}`;

        let data = await ytdl(video_url, {
            dumpSingleJson: true,
        }).then(info => info);

        let artist = data.creator ?? data.uploader;
        let title = data.track ?? data.title;
        let album = data.album ?? data.playlist ?? "Unknown Album";

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

    async downloadSong(video_id) {
        console.log(`Downloading song: ${video_id}`);

        let downloadLocation = `./downloads/youtube/${video_id}.%(ext)s`;
        let songFile = downloadLocation.replace("%(ext)s", "opus");

        if (fs.existsSync(songFile)) return songFile;

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

module.exports = new YouTubeDownloader();