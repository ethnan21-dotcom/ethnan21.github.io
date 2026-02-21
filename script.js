window.addEventListener('DOMContentLoaded', () => {

    // ==========================================
    // PAGE 1 LOGIC (Laptop, Keypad, Video)
    // ==========================================
    const rightHitbox = document.querySelector('.wrong-hitbox.right');
    const leftHitbox = document.querySelector('.wrong-hitbox.left');
    const keypadHitbox = document.querySelector('.keypad-hitbox');
    const logo = document.querySelector('.logo');
    const instruction = document.querySelector('.instruction');
    const frame = document.querySelector('.frame');
    const bgImage = document.querySelector('.bg-image');
    const zoomVideo = document.getElementById('zoom-video');
    const originalText = "Click the laptop to play";

    function triggerError(message) {
        if (!frame || !instruction) return;
        frame.classList.remove('apply-shake');
        void frame.offsetWidth; 
        instruction.textContent = message;
        instruction.classList.add('error');
        frame.classList.add('apply-shake');

        setTimeout(() => {
            instruction.textContent = originalText;
            instruction.classList.remove('error');
            frame.classList.remove('apply-shake');
        }, 1500);
    }

    function startZoomTransition() {
        console.log("Success! Starting video...");
        
        // --- ADD THIS EXACT LINE HERE ---
        // This tells the Master Iframe (index.html) to start the music
        window.parent.postMessage('startAmbience', '*');
        // --------------------------------
        
        const uiToFade = document.querySelectorAll('.frame img, .instruction, .wrong-hitbox, .keypad-hitbox');
        
        if(zoomVideo) {
            zoomVideo.play();
            zoomVideo.classList.add('active');
            zoomVideo.onended = () => {
                console.log("Video ended. Fading out...");
                document.body.classList.add('fade-out-screen');
                setTimeout(() => { window.location.href = "page2.html"; }, 1000);
            };
        }

        if(bgImage) bgImage.style.opacity = '0';
        uiToFade.forEach(el => {
            el.style.transition = 'opacity 0.8s ease';
            el.style.opacity = '0';
            el.style.pointerEvents = 'none';
        });
    }

    if(rightHitbox) rightHitbox.addEventListener('click', () => triggerError("Not that!"));
    if(leftHitbox) leftHitbox.addEventListener('click', () => triggerError("Are you hungry?"));
    if(logo) logo.addEventListener('click', startZoomTransition);
    if(keypadHitbox) keypadHitbox.addEventListener('click', startZoomTransition);


    // ==========================================
    // PAGE 2 LOGIC (Byte, Dialogue, Map, Trials)
    // ==========================================
    const byte = document.getElementById('byte-character');
    const dialogue = document.getElementById('dialogue-box');
    const textElement = document.getElementById('typewriter-text');
    const prompt = document.getElementById('click-prompt');
    const options = document.getElementById('options-container');
    const initialBtns = document.querySelectorAll('.initial-choice');
    const yesBtn = document.getElementById('btn-yes');
    
    const mapContainer = document.getElementById('map-container');
    const byteMapUI = document.getElementById('byte-map-ui');
    const byteMapText = document.getElementById('byte-map-text');
    const mailPin = document.getElementById('pin-mail');
    const lockedPins = [document.getElementById('pin-dating'), document.getElementById('pin-social')];
    const popupText = document.getElementById('not-ready-popup');
    const overlay = document.getElementById('transition-overlay');

    // Dialogue Data
    const introLines = ["Hey there! Surprised to see a real human around these parts.", "What brings you here?"];
    const finalLines = ["I don't blame you. This place is beautiful, but the apps have gone wild. To go back to reality, you’ll need the Jungle Key. But the Jungle has shattered it into 3 pieces.", "You have to finish 3 trials to reclaim the fragments. Here's the map."];
    const mapDialogue = ["Here they are—the 3 Trials! You’ll find them marked on your map.", "Don’t worry, I’ll be right here to guide you along the way!"];

    let currentQueue = introLines;
    let lineIndex = 0; let charIndex = 0; let isTyping = false; let waitingForChoice = false; let typingTimer;
    let mapLineIndex = 0; let mapCharIndex = 0; let mapIsTyping = false;

    // Byte Entrance Animation
    setTimeout(() => {
        if (byte) {
            byte.classList.add('walking-animation', 'walk-in');
            setTimeout(() => {
                byte.classList.remove('walking-animation');
                if (dialogue) {
                    dialogue.classList.add('fade-in');
                    setTimeout(typeEffect, 600);
                }
            }, 3000);
        }
    }, 1500);

    // Typewriter Logic
    function typeEffect() {
        clearTimeout(typingTimer);
        if (charIndex < currentQueue[lineIndex].length) {
            isTyping = true;
            textElement.innerHTML += currentQueue[lineIndex].charAt(charIndex);
            charIndex++;
            typingTimer = setTimeout(typeEffect, 40);
        } else {
            isTyping = false;
            textElement.classList.add('done');
            checkState();
        }
    }

    function checkState() {
        if (currentQueue === introLines && lineIndex === 1) {
            options.classList.add('show'); waitingForChoice = true;
        } else if (waitingForChoice && currentQueue[0].includes("get out?")) {
            yesBtn.style.display = "block"; options.classList.add('show');
        } else {
            if (prompt) prompt.classList.add('show');
        }
    }

    // Dialogue Choices
    initialBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const response = btn.id === "btn-1" 
                ? "Lost, then? Glitchwood is a mess, and it’s definitely not safe for a wanderer. I suppose you want to get out?"
                : "The old glitch! One minute you're on your device, the next you're part of the system. I suppose you want to get out?";
            initialBtns.forEach(b => b.style.display = "none");
            resetDialogue([response]);
            waitingForChoice = true; 
        });
    });

    if (yesBtn) {
        yesBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            yesBtn.style.display = "none"; options.classList.remove('show');
            waitingForChoice = false; resetDialogue(finalLines);
        });
    }

    function resetDialogue(newQueue) {
        currentQueue = newQueue; lineIndex = 0; charIndex = 0;
        textElement.innerHTML = ""; textElement.classList.remove('done');
        if (prompt) prompt.classList.remove('show');
        typeEffect();
    }

    // Main Advancing Click & Map Reveal
    if (dialogue) {
        dialogue.addEventListener('click', () => {
            if (isTyping || waitingForChoice) return;

            if (lineIndex < currentQueue.length - 1) {
                lineIndex++; charIndex = 0;
                textElement.innerHTML = ""; textElement.classList.remove('done');
                if (prompt) prompt.classList.remove('show');
                typeEffect();
            } else if (currentQueue === finalLines && lineIndex === finalLines.length - 1) {
                if (byte) byte.style.opacity = "0";
                dialogue.style.opacity = "0"; dialogue.style.pointerEvents = "none";
                if (mapContainer) {
                    mapContainer.style.display = "block";
                    setTimeout(() => {
                        mapContainer.classList.add('reveal');
                        setTimeout(startMapDialogue, 1500); 
                    }, 50);
                }
            }
        });
    }

    // Map Dialogue Logic
    function typeMapText() {
        if (mapCharIndex < mapDialogue[mapLineIndex].length) {
            mapIsTyping = true;
            byteMapText.innerHTML += mapDialogue[mapLineIndex].charAt(mapCharIndex);
            mapCharIndex++;
            setTimeout(typeMapText, 40);
        } else { mapIsTyping = false; }
    }

    function startMapDialogue() {
        if(byteMapUI) byteMapUI.classList.add('show');
        setTimeout(typeMapText, 600);
    }

    if (byteMapUI) {
        byteMapUI.addEventListener('click', () => {
            if (mapIsTyping) return;
            if (mapLineIndex < mapDialogue.length - 1) {
                mapLineIndex++; mapCharIndex = 0;
                byteMapText.innerHTML = ""; typeMapText();
            } else {
                byteMapUI.classList.remove('show'); byteMapUI.classList.add('exit');
            }
        });
    }

    // Locked Pins Shaker
    lockedPins.forEach(pin => {
        if (pin) {
            pin.addEventListener('click', function(e) {
                e.stopPropagation();
                this.classList.remove('shake-pin'); void this.offsetWidth; this.classList.add('shake-pin');
                if(mapContainer) { mapContainer.classList.remove('shake-frame'); void mapContainer.offsetWidth; mapContainer.classList.add('shake-frame'); }
                if(popupText) {
                    popupText.classList.add('show-popup');
                    setTimeout(() => { popupText.classList.remove('show-popup'); this.classList.remove('shake-pin'); if(mapContainer) mapContainer.classList.remove('shake-frame'); }, 1500);
                }
            });
        }
    });

    // JungleMail Cinematic Zoom & Fog Transition
    if (mailPin) {
        mailPin.addEventListener('click', (e) => {
            e.stopPropagation();
            console.log("Zooming to JungleMail Trial...");

            // 1. Zoom
            if(mapContainer) mapContainer.classList.add('map-zoom-transition');
            if (byteMapUI) byteMapUI.style.opacity = "0"; // Hide Byte immediately

            // 2. White Fog
            setTimeout(() => {
                if(overlay) overlay.classList.add('clouds-rush');
            }, 800);

            // 3. Redirect
            setTimeout(() => {
                document.body.style.transition = "opacity 0.5s ease";
                document.body.style.opacity = "0";
                setTimeout(() => { window.location.href = "page3.html"; }, 500);
            }, 2500); 
        });
    }
});