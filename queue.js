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
    currentSong = null;
    
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

    setVoiceChannel(voiceChannel) {
        this.voiceChannel = voiceChannel;
    }

    setTextChannel(textChannel) {
        this.textChannel = textChannel;
    }

    maybeJoinVoiceChannel() {
        if (this.connection) return;

        // console.log(this.voiceChannel ?? "No voice channel");
        // console.log(this.textChannel ?? "No text channel");

        // Join the voice channel
        this.connection = discordVoice.joinVoiceChannel({
            channelId: this.voiceChannel.id,
            guildId: this.guildId,
            adapterCreator: this.voiceChannel.guild.voiceAdapterCreator
        });
        
        // Create audio player
        this.player = discordVoice.createAudioPlayer();
        this.subscription = discordVoice.getVoiceConnection(this.guildId).subscribe(this.player);

        
		// Configure audio player
		this.player.on('stateChange', (oldState, newState) => {
            if (newState.status === discordVoice.AudioPlayerStatus.Idle && oldState.status !== discordVoice.AudioPlayerStatus.Idle) {
                // Play next song, if the current song has finished playing
                (oldState.resource).metadata.onFinish();
                void this.playNextOrLeave();

            } /* else if (newState.status === discordVoice.AudioPlayerStatus.Playing) {
                // A new track has started playing
                (newState.resource).metadata.onStart();
            } */
        });

        console.log(`Joined voice channel: ${this.voiceChannel.name}`);
    }

    addSong(song) {
        this.songQueue.push(song);
    }
    
    addOrPlay(song) {
        if (this.currentSong !== null) {
            this.addSong(song);
            return
        }

        this.playSong(song);
    }

    playNextOrLeave() {
        if (this.songQueue.length > 0) {
            this.playSong(this.songQueue[0]);
        } else {
            this.leaveVoiceChannel();
        }
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

        let audioResource = await song.createAudioResource(song.url);

        // Remove the song from the queue
        this.songQueue.shift();

        await this.player.play(audioResource)
    }

    skip() {
        this.player.stop();
        this.playNextOrLeave();
    }

    leaveVoiceChannel() {
        this.connection.destroy();
        this.connection = null;
        this.player = null;
        this.songQueue = [];
        this.currentSong = null;
    }
}

module.exports = Queue;