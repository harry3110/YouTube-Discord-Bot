import { Downloader, SongSearchResult } from "./downloader";
import { createWriteStream, unlink } from 'fs';
import fetch from 'node-fetch';
import { resolve } from "path";
import { AudioResource, createAudioResource, demuxProbe } from '@discordjs/voice';
import PlexAPI from 'plex-api';
import { Song } from "src/song-interface";
import { get } from "http";

var plex = new PlexAPI({
    hostname:process.env.PLEX_HOSTNAME,
    token: process.env.PLEX_TOKEN
})

export class PlexDownloader extends Downloader
{
    getPlexUrl(absoluteUrl: string, addToken = true, protocol = "http", extraParams = []) {
        if (absoluteUrl.startsWith("/")) {
            absoluteUrl = absoluteUrl.substring(1);
        }

        let url_string = `${process.env.PLEX_HOSTNAME}:${process.env.PLEX_PORT}/${absoluteUrl}`;

        let url = new URL(url_string);

        if (addToken) {
            url.searchParams.set("X-Plex-Token", process.env.PLEX_TOKEN);
        }

        extraParams.forEach(param => {
            url.searchParams.set(param.name, param.value);
        });

        return protocol + "://" + url.toString();
    }

    async getTracks(query: string, limit = 10) {
        return await this.getSearchResults(query, limit, "music");
    }

    async getSearchResults(query: string, limit = 10, searchType = null) {
        query = encodeURIComponent(query);
        let response = await this.query(`/hubs/search?query=${query}&includeExternalMedia=0&limit=${limit}` + (searchType ? "&searchTypes=" + searchType : ""));

        return response.MediaContainer.Hub;
    }

    async getTrack(trackId: string) {
        let data = await this.query(`/library/metadata/${trackId}`);

        return data.MediaContainer.Metadata[0];
    }

    async query(absoluteUrl: string, addToken: Boolean = true) {
        let char = String(absoluteUrl).includes("?") ? "&" : "?";
        let url = absoluteUrl + (addToken ? char + "X-Plex-Token=" + process.env.PLEX_TOKEN : "");

        return await plex.query(url);
    }

    async searchSongs(query: string): Promise<SongSearchResult[]> {
        let results = await this.getTracks(query);

        // Get tracks of search
        let search = results.find(result => result.type == "track");

        // Title:           title
        // Artist:          originalTitle
        // Album artist:    grandparentTitle
        // Album:           parentTitle
        // Album cover:     thumb

        let tracks = [];

        for (let track of search["Metadata"]) {
            let title = String(track.title);
            let artist = String(track.originalTitle ?? track.grandparentTitle);
            let album = String(track.parentTitle);
            let cover = String(track.thumb);

            // ratingKey is the unique id of the track (/library/metadata/{ratingKey})
            tracks.push({
                type: "plex",
                id: String(track.ratingKey),
                title: title,
                artist: artist,
                album: album,
                url: this.getPlexUrl(track.Media[0].Part[0].key),
                skipped: false,
                cover: cover,
                createAudioResource: this.createAudioResource
            });
        }

        return tracks;
    }

    async getCover(title: string, artist: string, album: string): Promise<string> {
        const lastfm = require("../lastfm");

        return await lastfm.getCoverUrl(title, artist);
    }

    async downloadFile(url: string, downloadPath: string) {
        let file = createWriteStream(downloadPath);

        get(url, function(response) {
            response.on('data', (chunk) => {});
    
            response.on('end', () => {});
    
            response.pipe(file);
        });
    }

    async downloadCover(localAbsoluteUrl: string, trackId: string) {
        const url = this.getPlexUrl(localAbsoluteUrl);
        const downloadPath = resolve(`../downloads/plex/cover-${trackId}.jpg`);

        await this.downloadFile(url, downloadPath);

        return downloadPath;
    }

    async getSongData(id: string): Promise<Song|null> {
        let trackInfo = await this.getTrack(id);

        console.log(trackInfo);

        let title = String(trackInfo.title);
        let artist = String(trackInfo.originalTitle ?? trackInfo.grandparentTitle);
        let album = String(trackInfo.parentTitle);

        return {
            id: id,
            title: title,
            artist: artist,
            album: album,
            url: this.getPlexUrl(trackInfo.Media[0].Part[0].key),
            skipped: false,
            cover: await this.getCover(title, artist, album), // await this.downloadCover(trackInfo.thumb, id),
            createAudioResource: this.createAudioResource
        }
    }

    /**
     * TODO This possible doesn't work
     * 
     * @param video_id 
     * @returns 
     */
    async downloadSong(video_id: string): Promise<string|Boolean> {
        let song = await this.getSongData(video_id);

        let url = song.url;
        let downloadPath = `./downloads/plex/${video_id}.ext`;

        // Download file
        const file = createWriteStream(downloadPath);

        get(url, resp => {
            resp.pipe(file);

            file.on('finish', () => {
                file.close();
            });
        });

        return downloadPath;
    }

    createAudioResource(video_url: string): Promise<AudioResource> {
        console.log("Creating audio resource", video_url);

		return new Promise((resolve, reject) => {
            resolve(createAudioResource(video_url));
		});
	}
}