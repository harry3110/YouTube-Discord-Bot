const discordVoice = require('@discordjs/voice');
const { channel } = require('diagnostics_channel');
const discord = require('discord.js');
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
    pastSongs = [];
    currentSong = null;
    
    guildId = null;
    voiceChannel = null;    // The actual channel
    textChannel = null;     // channel ID
    client = null;

    // The last interaction, the last message will be updated
    lastInteraction = null;

    paused = false;

    /**
     * @param {VoiceConnection} connection
     */
    connection = null;
    subscription = null;
    player = null;

    constructor(client, guildId, voiceChannel, textChannel) {
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

    async maybeJoinVoiceChannel() {
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
            // console.log({
            //     "oldState": oldState,
            //     "newState": newState
            // })

            // States: 'bufferering', 'idle', 'playing', 'paused'

            if (newState.status === discordVoice.AudioPlayerStatus.Idle && oldState.status !== discordVoice.AudioPlayerStatus.Idle) {
                // Play next song, if the current song has finished playing or has been skipped
                void this.playNextOrLeave();

            } else if (newState.status === discordVoice.AudioPlayerStatus.Playing) {
                // Playing new song

                let song = this.getCurrentSong();

                // Set the 'listening to' message
                this.client.user.setActivity(`${song.title} by ${song.artist}`, {
                    type: "LISTENING"
                });

                if (this.textChannel) {
                    // Send message when the song starts playing
                    let embed = new discord.MessageEmbed()
                        .setTitle(`Now playing  ${song.title} by ${song.artist}!`)
                        .setColor(colors.green)
                        .setThumbnail(song.cover)
                    ;

                    this.textChannel.send({
                        embeds: [embed],
                        components: []
                    });
                }
            }
        });

        console.log(`Joined voice channel: ${this.voiceChannel.name}`);
    }

    /**
     * Add a song to the queue
     * 
     * @param {*} song      The song to add
     * @param {*} silentAdd Whether to send a message to the channel
     */
    async addSong(song) {
        this.songQueue.push(song);

        let embed = new discord.MessageEmbed()
            .setTitle(`Added ${song.title} by ${song.artist} to queue!`)
            .setDescription(`In position #${this.songQueue.length}`)
            .setColor(colors.aqua)
            .setThumbnail(song.cover)
        ;

        await this.lastInteraction.editReply({
            embeds: [embed],
            components: []
        });
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
        } else {
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
        // Get the song and remove it from the queue
        let song = this.currentSong = this.songQueue.shift();

        await this.maybeJoinVoiceChannel();
        
        console.log("Playing song: " + song.title + " by " + song.artist);

        let audioResource = await song.createAudioResource(song.url);

        // Add the song to past songs list
        this.addPastSong(song);

        await this.player.play(audioResource);
    }

    skip() {
        if (this.player){
            // Set the last past song to skipped = true
            this.getPastSongs()[this.getPastSongs().length - 1].skipped = true;

            this.player.stop();
            return true;
        } else {
            return false;
        }
    }

    async pause() {
        if (!this.paused) {
            await this.player.pause();
            this.paused = true;
        } else {
            await this.player.unpause();
            this.paused = false;
        }

        let embed = new discord.MessageEmbed()
            .setTitle(`${this.paused ? "Paused" : "Resumed"} the song!`)
            .setColor(colors.green)
        ;

        await this.lastInteraction.reply({
            embeds: [embed]
        });

        return this.paused
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
}

module.exports = Queue;