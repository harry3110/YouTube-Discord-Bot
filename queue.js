const discordVoice = require('@discordjs/voice');
const { channel } = require('diagnostics_channel');
const fs = require('fs');

colors = {
    'aqua': 0x5abdd1,       // Search and queue
    'red': 0xa11a1a,        // Errors
    'orange': 0xdbbb1a,     // Currently playing
    'green': 0x11ba49       // Bot ready message
}



class Queue
{
    songQueue = [];
    playingSong = false;
    
    guildId = null;
    voiceChannel = null;
    textChannel = null;

    /**
     * @param {VoiceConnection} connection
     */
    connection = null;
    subscription = null;
    player = null;

    constructor(guildId, voiceChannel, textChannel) {
        this.guildId = guildId;
        this.voiceChannel = voiceChannel;
        this.textChannel = textChannel;
    }

    maybeJoinVoiceChannel() {
        if (this.connection) return;

        // Join the voice channel
        this.connection = discordVoice.joinVoiceChannel({
            channelId: this.voiceChannel.id,
            guildId: this.guildId,
            adapterCreator: this.voiceChannel.guild.voiceAdapterCreator
        });
        
        // Create audio player
        this.player = discordVoice.createAudioPlayer();
        this.subscription = discordVoice.getVoiceConnection(this.guildId).subscribe(this.player);

        console.log(`Joined voice channel: ${this.voiceChannel.name}`);
    }

    addSong(song) {
        this.songQueue.push(song);
    }
    
    addOrPlay(song) {
        if (this.playingSong) {
            this.addSong(song);
            return
        }

        this.playSong(song);
    }

    getSongQueue() {
        return this.songQueue;
    }

    removeSongFromQueue(song) {
        this.songQueue.splice(this.songQueue.indexOf(song), 1);
    }

    async playSong(song) {
        this.currentSong = song;
        this.maybeJoinVoiceChannel();

        console.log("About to play song...")
        console.log(song);

        // let audioResource = discordVoice.createAudioResource(song.file)
        let audioResource = await song.createAudioResource(song.url);

        this.player.play(audioResource);
    }

    leaveVoiceChannel() {
        this.connection.destroy();
        this.connection = null;
        this.player = null;
        this.songQueue = [];
    }
}

module.exports = Queue;