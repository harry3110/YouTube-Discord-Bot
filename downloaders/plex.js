// YouTube API
const fs = require('fs');
const { AudioResource, createAudioResource, demuxProbe } = require('@discordjs/voice');
const PlexAPI = require('plex-api')

var plex = new PlexAPI({
    hostname:process.env.PLEX_HOSTNAME,
    token: process.env.PLEX_TOKEN
})

class PlexDownloader
{
    getPlexUrl(absoluteUrl, addToken = true, protocol = "http", extraParams = []) {
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

    async getTracks(query, limit = 10) {
        return await this.getSearchResults(query, limit, "music");
    }

    async getSearchResults(query, limit = 10, searchType = null) {
        query = encodeURIComponent(query);
        let response = await this.query(`/hubs/search?query=${query}&includeExternalMedia=0&limit=${limit}` + (searchType ? "&searchTypes=" + searchType : ""));

        return response.MediaContainer.Hub;
    }

    async getTrack(trackId) {
        let data = await this.query(`/library/metadata/${trackId}`);

        console.log("Getting track")
        console.log(data);

        return data.MediaContainer.Metadata[0];
    }

    async query(absoluteUrl, addToken = true) {
        let char = String(absoluteUrl).includes("?") ? "&" : "?";
        let url = absoluteUrl + (addToken ? char + "X-Plex-Token=" + process.env.PLEX_TOKEN : "");

        return await plex.query(url);
    }

    /**
     * Search for a song
     * 
     * @param {*} query 
     */
    async searchSongs(query) {
        let results = await this.getTracks(query);

        // Get tracks of search
        let search = results.find(result => result.type == "track");

        // Title:           title
        // Artist:          originalTitle
        // Album artist:    grandparentTitle
        // Album:           parentTitle
        // Album cover:     thumb

        let tracks = {};

        search["Metadata"].forEach(track => {
            let title = String(track.title);
            let artist = String(track.originalTitle ?? track.grandparentTitle);
            let album = String(track.parentTitle);
            let cover = String(track.thumb);

            // ratingKey is the unique id of the track (/library/metadata/{ratingKey})
            tracks[track.ratingKey] = {
                type: "plex",
                id: String(track.ratingKey),
                title: title,
                artist: artist,
                album: album,
                url: this.getPlexUrl(track.Media[0].Part[0].key),
                skipped: false,
                cover: cover,
                createAudioResource: this.createAudioResource
            };
        });

        console.log(tracks);

        return tracks;
    }

    async getCover(title, artist, album) {
        const lastfm = require("../lastfm");

        return await lastfm.getCoverUrl(title, artist);
    }

    async getSongData(id) {
        let trackInfo = await this.getTrack(id);

        console.log(trackInfo);

        let title = String(trackInfo.title);
        let artist = String(trackInfo.originalTitle ?? trackInfo.grandparentTitle);
        let album = String(trackInfo.parentTitle);

        return {
            id: id,
            type: "plex",
            id: String(trackInfo.guid), // trackInfo.ratingKey,
            title: title,
            artist: artist,
            album: album,
            url: this.getPlexUrl(trackInfo.Media[0].Part[0].key),
            skipped: false,
            cover: trackInfo.thumb,
            createAudioResource: this.createAudioResource
        }
    }

    async downloadSong(video_id) {
        

        return songFile;
    }

    /**
     * 
     * @returns {Promise<AudioResource<Track>>}
     */
    createAudioResource(video_url) {
		return new Promise((resolve, reject) => {
            

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

module.exports = new PlexDownloader();