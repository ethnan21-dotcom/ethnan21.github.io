// Pre-load the sound effects
const selectSound = new Audio('media/select.mp3');
const wrongSound = new Audio('media/wrong.mp3');

// 1. Automatically play 'select.mp3' whenever ANY button is clicked
document.addEventListener('click', function(event) {
    // Checks if the clicked element is a button or has a specific button class
    const isButton = event.target.tagName === 'BUTTON' || event.target.closest('button') || event.target.classList.contains('glass-btn') || event.target.classList.contains('chat-choice-btn');
    
    if (isButton) {
        // Clone the audio node so rapid clicking doesn't cut the sound off
        let clickSfx = selectSound.cloneNode();
        clickSfx.volume = 0.6;
        clickSfx.play().catch(e => console.log("Click audio blocked", e));
    }
});

// 2. A global function you can call whenever they get something wrong
window.playWrongSound = function() {
    let errorSfx = wrongSound.cloneNode();
    errorSfx.volume = 0.8;
    errorSfx.play().catch(e => console.log("Wrong audio blocked", e));
};