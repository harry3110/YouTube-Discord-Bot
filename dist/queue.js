"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Queue = void 0;
const voice_1 = require("@discordjs/voice");
const discord_js_1 = require("discord.js");
const lastfm_1 = require("./lastfm");
const colors = {
    'aqua': 0x5abdd1,
    'red': 0xa11a1a,
    'orange': 0xdbbb1a,
    'green': 0x11ba49
};
class Queue {
    constructor(client, guildId, voiceChannel, textChannel) {
        this.songQueue = [];
        this.pastSongs = [];
        this.currentSong = null;
        this.guildId = null;
        this.voiceChannel = null;
        this.textChannel = null;
        this.client = null;
        this.lastInteraction = null;
        this.paused = false;
        this.downloader = null;
        this.connection = null;
        this.subscription = null;
        this.player = null;
        this.client = client;
        this.guildId = guildId;
        this.voiceChannel = voiceChannel;
        this.textChannel = textChannel;
    }
    setGuildId(guildId) {
        this.guildId = guildId;
    }
    setVoiceChannel(voiceChannel) {
        this.voiceChannel = voiceChannel;
    }
    setTextChannel(textChannel) {
        this.textChannel = textChannel;
    }
    setLastInteraction(interaction) {
        this.lastInteraction = interaction;
    }
    setDownloader(downloader) {
        this.downloader = downloader;
    }
    async maybeJoinVoiceChannel() {
        if (this.connection)
            return;
        this.connection = voice_1.joinVoiceChannel({
            channelId: this.voiceChannel.id,
            guildId: this.guildId,
            adapterCreator: this.voiceChannel.guild.voiceAdapterCreator
        });
        this.player = voice_1.createAudioPlayer();
        this.subscription = voice_1.getVoiceConnection(this.guildId).subscribe(this.player);
        this.player.on('stateChange', (oldState, newState) => {
            if (newState.status === voice_1.AudioPlayerStatus.Idle && oldState.status !== voice_1.AudioPlayerStatus.Idle) {
                void this.playNextOrLeave();
            }
            else if (newState.status === voice_1.AudioPlayerStatus.Playing) {
                let song = this.getCurrentSong();
                this.client.user.setActivity(`${song.title} by ${song.artist}`, {
                    type: "LISTENING"
                });
                if (this.textChannel) {
                    let embed = new discord_js_1.MessageEmbed()
                        .setTitle(`Now playing  ${song.title} by ${song.artist}!`)
                        .setColor(colors.green)
                        .setThumbnail(song.cover);
                    this.textChannel.send({
                        embeds: [embed],
                        components: []
                    });
                }
            }
        });
        console.log(`Joined voice channel: ${this.voiceChannel.name}`);
    }
    async addSong(song, editLastInteraction = true) {
        this.songQueue.push(song);
        if (editLastInteraction) {
            let embed = new discord_js_1.MessageEmbed()
                .setTitle(`Added ${song.title} by ${song.artist} to queue!`)
                .setDescription(`In position #${this.songQueue.length}`)
                .setColor(colors.aqua)
                .setThumbnail(song.cover);
            await this.lastInteraction.editReply({
                embeds: [embed],
                components: []
            });
        }
    }
    async addOrPlay(song) {
        await this.addSong(song);
        if (this.currentSong === null) {
            this.playSong();
        }
    }
    playNextOrLeave() {
        if (this.songQueue.length > 0) {
            this.playSong();
        }
        else {
            this.leaveVoiceChannel();
        }
    }
    getCurrentSong() {
        return this.currentSong;
    }
    getSongQueue() {
        return this.songQueue;
    }
    getSong(index) {
        return this.songQueue[index];
    }
    removeSong(index) {
        this.songQueue.splice(index, 1);
    }
    getPastSongs() {
        return this.pastSongs;
    }
    addPastSong(song) {
        this.pastSongs.push(song);
    }
    async playSong() {
        let song = this.currentSong = this.songQueue.shift();
        await this.maybeJoinVoiceChannel();
        console.log("Playing song: " + song.title + " by " + song.artist);
        let audioResource = await song.createAudioResource(song.url);
        this.addPastSong(song);
        await this.player.play(audioResource);
    }
    skip() {
        if (this.player) {
            this.getPastSongs()[this.getPastSongs().length - 1].skipped = true;
            this.player.stop();
            return true;
        }
        else {
            return false;
        }
    }
    async pause() {
        if (!this.paused) {
            await this.player.pause();
            this.paused = true;
        }
        else {
            await this.player.unpause();
            this.paused = false;
        }
        let embed = new discord_js_1.MessageEmbed()
            .setTitle(`${this.paused ? "Paused" : "Resumed"} the song!`)
            .setColor(colors.green);
        await this.lastInteraction.reply({
            embeds: [embed]
        });
        return this.paused;
    }
    async leaveVoiceChannel() {
        this.connection.destroy();
        this.connection = null;
        this.player = null;
        this.songQueue = [];
        this.currentSong = null;
        this.client.user.setActivity("music", {
            type: "LISTENING"
        });
    }
    async addSimilarSongs(amount) {
        if (this.downloader === null) {
            return;
        }
        console.log("Adding similar songs for queue");
        let similarSongs = [];
        similarSongs.push(await this.getSimilarSongs(this.getCurrentSong(), amount));
        this.getSongQueue().forEach(async (song) => {
            similarSongs.push(...await this.getSimilarSongs(song, amount));
        });
        similarSongs.forEach(async (song) => {
            await this.addSong(song, false);
            console.log(` - Added ${song.title} by ${song.artist}`);
        });
    }
    async getSimilarSongs(song, amount) {
        let lfmSimilar = await lastfm_1.lastfm.getSimilarTracks(song.title, song.artist);
        console.log(lfmSimilar);
        console.log(` - Adding similar songs for ${song.title} by ${song.artist}`);
        let similarSongs = [];
        lfmSimilar.forEach(async (similarSong) => {
            const title = similarSong.name;
            const artist = similarSong.artist.name;
            let search = await this.downloader.searchSongs(`${title} ${artist}`);
            console.log(` - Found ${search.length} similar songs`);
            if (search.length > 0) {
                similarSongs.push(search[0]);
            }
        });
        return similarSongs;
    }
}
exports.Queue = Queue;
//# sourceMappingURL=queue.js.map