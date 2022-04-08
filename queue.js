const discordVoice = require('@discordjs/voice');
const fs = require('fs');

colors = {
    'aqua': 0x5abdd1,       // Search and queue
    'red': 0xa11a1a,        // Errors
    'orange': 0xdbbb1a,     // Currently playing
    'green': 0x11ba49       // Bot ready message
}

const player = discordVoice.createAudioPlayer();

module.exports = {
    songQueue: {},

    // guildId: null, or the index
    songPlaying: {},

    // Voice channels
    voiceChannels: {},

    // Text channels
    textChannels: {},

    setGuildVoiceChannel(guildId, voiceChannel) {
        this.voiceChannels[guildId] = voiceChannel;
    },

    setGuildTextChannel(guildId, textChannel) {
        this.textChannels[guildId] = textChannel;
    },
    
    addSongToQueue: function(guildId, songData) {
        if (!this.songQueue[guildId]) {
            this.songQueue[guildId] = [];
        }

        this.songQueue[guildId].push(songData);
    },

    addOrPlay: function(guildId, songData) {
        const connection = this.getConnection(guildId);
        connection.subscribe(player);

        if (this.songQueue[guildId]) {
            this.addSongToQueue(guildId, songData);
        } else {
            this.addSongToQueue(guildId, songData);

            this.getConnection(guildId);
            this.playSong(guildId, 0);
        }
    },
    
    getSongQueue: function(guildId) {
        return this.songQueue[guildId];
    },

    removeSongFromQueue: function(guildId, videoId) {
        this.songQueue[guildId] = this.songQueue[guildId].filter(song => song.id !== videoId);
    },

    /**
     * Join and get the channel
     * 
     * @param {*} guildId 
     * @returns 
     */
    async getConnection(guildId) {
        let connection = discordVoice.joinVoiceChannel({
            guildId: guildId,
            channelId: this.voiceChannels[guildId].channelId
        });

        try {
		    await discordVoice.entersState(connection, discordVoice.VoiceConnectionStatus.Ready, 30e3);
            return connection;
        } catch (error) {
            connection.destroy();
            throw error;
        }
    },

    playSong(guildId, index) {
        let connection = this.getConnection(guildId);

        if (!connection) {
            console.log("No connection found, returning");
            return;
        }

        let songToPlay = this.songQueue[guildId][index];
        this.songPlaying[guildId] = index;
        
        console.log(this.songQueue);
        console.log(connection);

        const song = discordVoice.createAudioResource(songToPlay.file, {
            inputType: StreamType.Arbitrary
        })

        player.play(song);

        discordVoice.entersState(player, discordVoice.AudioPlayerStatus.Playing, 5e3);

        /* dispatcher.on("start", () => {
            let embed = new DiscordJS.MessageEmbed()
                .setColor(colors["orange"])
                .setTitle('Now playing!')
                .addField(title, artist)

                // .attachFiles(new DiscordJS.MessageAttachment('./images/temp.png'))
                // .setThumbnail("attachment://temp.png")
            ;

            this.textChannels[guildId].send({
                embeds: [embed]
            });
        })

        dispatcher.on("finish", () => {
            this.playNextOrLeave(guildId)
        }); */
    },

    playNextOrLeave(guildId) {
        let nextSong = this.songQueue.get(this.songPlaying[guildId]);

        if (nextSong) {
            this.playNextSong();
        } else {
            dispatcher.on("finish", () => {
                voiceChannel.leave();
                
                this.songQueue[guildId] = [];
                this.songPlaying[guildId] = null;
                this.voiceChannels[guildId] = null;
                this.textChannels[guildId] = null;
            });
        }
    },

    playNextSong(guildId) {
        let nextSong = this.songQueue[guildId][this.songPlaying[guildId] + 1];

        if (nextSong) {
            this.playSong(guildId, this.songPlaying[guildId] + 1);
        } else {
            voiceChannel.leave();
        }
    }
}