import { joinVoiceChannel, createAudioPlayer, getVoiceConnection, AudioPlayerStatus, AudioResource } from '@discordjs/voice';
import { MessageEmbed,  } from 'discord.js';
import { SongSearchResult } from './downloaders/downloader';
import { lastfm } from './lastfm';
import { Song } from './song-interface';

const colors = {
    'aqua': 0x5abdd1,       // Search and queue
    'red': 0xa11a1a,        // Errors
    'orange': 0xdbbb1a,     // Currently playing
    'green': 0x11ba49       // Bot ready message
}

class Queue
{
    songQueue: Array<Song> = [];
    pastSongs: Array<Song> = [];
    currentSong: Song|null = null;
    
    guildId = null;
    voiceChannel = null;    // The actual channel
    textChannel = null;     // channel ID
    client = null;

    // The last interaction, the last message will be updated
    lastInteraction = null;

    paused = false;

    /**
     * @param {Downloader} downloader
     */
    downloader = null;

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

    setDownloader(downloader) {
        this.downloader = downloader;
    }

    async maybeJoinVoiceChannel() {
        if (this.connection) return;

        // console.log(this.voiceChannel ?? "No voice channel");
        // console.log(this.textChannel ?? "No text channel");

        // Join the voice channel
        this.connection = joinVoiceChannel({
            channelId: this.voiceChannel.id,
            guildId: this.guildId,
            adapterCreator: this.voiceChannel.guild.voiceAdapterCreator
        });
        
        // Create audio player
        this.player = createAudioPlayer();
        this.subscription = getVoiceConnection(this.guildId).subscribe(this.player);

        
		// Configure audio player
		this.player.on('stateChange', (oldState, newState) => {
            // console.log({
            //     "oldState": oldState,
            //     "newState": newState
            // })

            // States: 'bufferering', 'idle', 'playing', 'paused'

            if (newState.status === AudioPlayerStatus.Idle && oldState.status !== AudioPlayerStatus.Idle) {
                // Play next song, if the current song has finished playing or has been skipped
                void this.playNextOrLeave();

            } else if (newState.status === AudioPlayerStatus.Playing) {
                // Playing new song

                let song = this.getCurrentSong();

                // Set the 'listening to' message
                this.client.user.setActivity(`${song.title} by ${song.artist}`, {
                    type: "LISTENING"
                });

                if (this.textChannel) {
                    // Send message when the song starts playing
                    let embed = new MessageEmbed()
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
     * @param {Song} song      The song to add
     */
    async addSong(song: Song, editLastInteraction: Boolean = true) {
        this.songQueue.push(song);

        if (editLastInteraction) {
            let embed = new MessageEmbed()
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
    }
    
    async addOrPlay(song: Song) {
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

    getSong(index: number) {
        return this.songQueue[index];
    }

    removeSong(index: number) {
        this.songQueue.splice(index, 1);
    }

    getPastSongs() {
        return this.pastSongs;
    }

    addPastSong(song: Song) {
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

        let embed = new MessageEmbed()
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

    async addSimilarSongsFromQueue(amount: number = 10) {
        // id, title, artist, album, url, skipped, cover, createAudioResource

        // currentSongs.push(this.getCurrentSong());

        if (this.downloader === null) {
            return;
        }

        console.log("Adding similar songs for queue");

        let similarSongs = [];

        // Combine currently playing song with the queue
        let songs = this.getSongQueue().concat(this.getCurrentSong());
        
        // Add songs for each of the similar tracks from last fm
        for (let song of songs) {
            this.addSimilarSongs(song, Math.round(amount / songs.length));
        }
    }

    private async addSimilarSongs(song: Song, limit: number) {
        let lfmSimilar = await lastfm.getSimilarTracks(song.title, song.artist);

        lfmSimilar = lfmSimilar.slice(0, limit);

        console.log(` - Adding similar songs for ${song.title} by ${song.artist}`);

        // Loop through the similar songs and add to array
        for (let similarSong of lfmSimilar) {
            let title = similarSong.name;
            let artist = similarSong.artist.name;

            // Search for song
            let search: SongSearchResult[] = await this.downloader.searchSongs(`${title} ${artist}`, 1);

            console.log(` - Found ${search.length} similar song(s)`);

            // Add song, if there is at least one result
            if (search.length > 0) {
                let songData: Song|null = await this.downloader.getSongData(search[0].id);
                
                this.addSong(songData, false);
            }
        }
    }
}

export { Queue };