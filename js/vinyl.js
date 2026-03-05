document.addEventListener('DOMContentLoaded', () => {
    // Playlist logic (easy to extend)
    const playlist = [
        {
            title: "Last Rebel",
            artist: "A Masterpiece in Motion",
            audio: "../misic/record-audio.mp3",
            cover: "../img/record-cover.jpg"
        },
        // Developers can add new songs here:
        // {
        //     title: "Another Song",
        //     artist: "Another Artist",
        //     audio: "../misic/other-audio.mp3",
        //     cover: "../img/other-cover.jpg"
        // }
    ];

    let currentTrackIndex = 0;

    const playBtn = document.getElementById('playBtn');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const audioPlayer = document.getElementById('audioPlayer');
    const vinylRecord = document.getElementById('vinylRecord');
    const tonearm = document.getElementById('tonearm');
    const trackTitle = document.getElementById('trackTitle');
    const trackArtist = document.getElementById('trackArtist');
    const trackCover = document.getElementById('trackCover');

    // Progress Bar Elements
    const progressBar = document.getElementById('progressBar');
    const currentTimeEl = document.getElementById('currentTime');
    const totalTimeEl = document.getElementById('totalTime');

    let isPlaying = false;
    let isDragging = false; // prevents range update fighting timeupdate

    // Formats seconds into MM:SS
    function formatTime(seconds) {
        if (isNaN(seconds)) return "00:00";
        const min = Math.floor(seconds / 60);
        const sec = Math.floor(seconds % 60);
        return `${min < 10 ? '0' : ''}${min}:${sec < 10 ? '0' : ''}${sec}`;
    }

    // Load track meta into DOM
    function loadTrack(index) {
        const track = playlist[index];
        trackTitle.textContent = track.title;
        trackArtist.textContent = track.artist;
        trackCover.src = track.cover;
        audioPlayer.src = track.audio;

        // Reset playback visual state
        vinylRecord.classList.remove('playing', 'paused');
        vinylRecord.classList.add('paused'); // default to paused position (animation 0s)
        progressBar.value = 0;
        currentTimeEl.textContent = "00:00";
        totalTimeEl.textContent = "00:00";
    }

    // Playback state toggle
    function togglePlay() {
        if (isPlaying) {
            audioPlayer.pause();
            playBtn.textContent = 'PLAY';

            // Just switch the animation state to pause it in place
            vinylRecord.classList.replace('playing', 'paused');
            tonearm.classList.remove('active');

        } else {
            audioPlayer.play().then(() => {
                playBtn.textContent = 'PAUSE';

                tonearm.classList.add('active');

                setTimeout(() => {
                    // Update animation state to running
                    if (vinylRecord.classList.contains('paused')) {
                        vinylRecord.classList.replace('paused', 'playing');
                    } else {
                        vinylRecord.classList.add('playing');
                    }
                }, 300);
            }).catch(e => console.error("Audio playback failed:", e));
        }
        isPlaying = !isPlaying;
    }

    // Initialize first track
    loadTrack(currentTrackIndex);

    playBtn.addEventListener('click', togglePlay);

    // Audio Meta Loaded - update total time
    audioPlayer.addEventListener('loadedmetadata', () => {
        totalTimeEl.textContent = formatTime(audioPlayer.duration);
        progressBar.max = Math.floor(audioPlayer.duration);
    });

    // Time progress
    audioPlayer.addEventListener('timeupdate', () => {
        if (!isDragging) {
            progressBar.value = audioPlayer.currentTime;
            currentTimeEl.textContent = formatTime(audioPlayer.currentTime);
        }
    });

    // Dragging progress bar
    progressBar.addEventListener('input', () => {
        isDragging = true;
        currentTimeEl.textContent = formatTime(progressBar.value);
    });

    // Release progress bar
    progressBar.addEventListener('change', () => {
        audioPlayer.currentTime = progressBar.value;
        isDragging = false;
    });

    // Handle end of track
    audioPlayer.addEventListener('ended', () => {
        playNextTrack(); // loop to next song, or pause if needed
    });

    // Next Track
    function playNextTrack() {
        currentTrackIndex = (currentTrackIndex + 1) % playlist.length;
        loadTrack(currentTrackIndex);
        if (isPlaying) {
            isPlaying = false; // togglePlay will flip this back
            togglePlay();
        }
    }

    nextBtn.addEventListener('click', playNextTrack);

    // Prev Track
    prevBtn.addEventListener('click', () => {
        // If more than 3 seconds in, just restart song
        if (audioPlayer.currentTime > 3) {
            audioPlayer.currentTime = 0;
            return;
        }

        currentTrackIndex = (currentTrackIndex - 1 + playlist.length) % playlist.length;
        loadTrack(currentTrackIndex);
        if (isPlaying) {
            isPlaying = false;
            togglePlay();
        }
    });
});
