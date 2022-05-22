interface Song {
    id: string;
    title: string;
    artist: string;
    album: string;
    url: string;
    cover: string;
    publishDate?: string|null;
    skipped: boolean;
    createAudioResource: any;
}

export { Song };