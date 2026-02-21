window.addEventListener('DOMContentLoaded', () => {
    // ==========================================
    // MAP INTERACTIVITY (Post-Victory)
    // ==========================================
    const mapContainer = document.getElementById('map-container');
    const lockedPins = [document.getElementById('pin-dating')];
    const socialPin = document.getElementById('pin-social');
    const popupText = document.getElementById('not-ready-popup');
    const overlay = document.getElementById('transition-overlay');

    // A. Locked Pin Shaker
    lockedPins.forEach(pin => {
        if (pin) {
            pin.addEventListener('click', function(e) {
                e.stopPropagation();
                this.classList.remove('shake-pin'); void this.offsetWidth; this.classList.add('shake-pin');
                if(mapContainer) { mapContainer.classList.remove('shake-frame'); void mapContainer.offsetWidth; mapContainer.classList.add('shake-frame'); }
                
                if(popupText) {
                    popupText.classList.add('show-popup');
                    setTimeout(() => { 
                        popupText.classList.remove('show-popup'); 
                        this.classList.remove('shake-pin'); 
                        if(mapContainer) mapContainer.classList.remove('shake-frame'); 
                    }, 1500);
                }
            });
        }
    });

    // B. JungleSocial Transition
    if (socialPin) {
        socialPin.addEventListener('click', (e) => {
            e.stopPropagation();
            console.log("Zooming to JungleGram Trial...");
            if(mapContainer) mapContainer.classList.add('social-zoom-transition');
            setTimeout(() => { if(overlay) overlay.classList.add('clouds-rush'); }, 800);
            setTimeout(() => {
                document.body.style.transition = "opacity 0.5s ease";
                document.body.style.opacity = "0";
                setTimeout(() => { window.location.href = "page4.html"; }, 500);
            }, 2500); 
        });
    }

    // --- 1. SELECTIONS ---
    const byteUI = document.getElementById('byte-map-ui');
    const byteText = document.getElementById('byte-map-text');
    const byteHint = document.getElementById('byte-hint-text');
    const emailItems = document.querySelectorAll('.email-item');
    const emailBodies = document.querySelectorAll('.email-body');
    const suspectSpans = document.querySelectorAll('.suspect');

    // --- 2. DATA ---
    const introLines = [
        "You made it to Junglemail!",
        "Two emails just landed in your inbox. Inspect the details before you decide to Block or Proceed."
    ];

    const hints = {
        "hint-1": "Wait... LinkedIn uses '.com.' That '.co' is a tiny change meant to slip past your eyes. AI helps scammers generate 'look-alike' domains instantly.",
        "hint-2": "That’s a lot of money for a 'Remote Project Assistant' with no interviews.",
        "hint-3": "A generic link that doesn't tell you where it goes? Strange.",
        "hint-4": "This looks solid. '.edu.sg' is a verified official domain. No 'glitches' or typos here.",
        "hint-5": "Notice the calm tone? Scams usually scream 'DO THIS NOW' to trigger panic.",
        "hint-6": "This isn't a suspicious third-party link."
    };

    let introIndex = 0;
    let isTyping = false;
    let typeInterval;
    let currentMode = "intro";

    // --- 3. THE TYPEWRITER ENGINE ---
    function typeMessage(text, isHint = false) {
        if (!byteText) return;
        clearInterval(typeInterval);
        byteText.innerHTML = '';
        let i = 0;
        isTyping = true;
        
        if (byteHint) {
            byteHint.innerText = isHint ? "Inspecting Detail..." : "Click to continue...";
        }

        typeInterval = setInterval(() => {
            byteText.innerHTML += text.charAt(i);
            i++;
            if (i >= text.length) {
                clearInterval(typeInterval);
                isTyping = false;
                if (isHint && byteHint) byteHint.innerText = "Click to dismiss";
            }
        }, 30);
    }

    // --- 4. EVENT LISTENERS ---
    setTimeout(() => {
        if (byteUI) {
            byteUI.classList.add('show');
            typeMessage(introLines[0]);
        }
    }, 1000);

    if (byteUI) {
        byteUI.addEventListener('click', (e) => {
            e.stopPropagation();
            if (isTyping) return;
            
            if (currentMode === "intro") {
                if (introIndex < introLines.length - 1) {
                    introIndex++;
                    typeMessage(introLines[introIndex]);
                } else {
                    byteUI.classList.remove('show');
                    byteUI.classList.add('exit');
                    currentMode = "hints"; 
                }
            } else {
                byteUI.classList.remove('show');
                byteUI.classList.add('exit');
            }
        });
    }

    emailItems.forEach(item => {
        item.addEventListener('click', () => {
            emailItems.forEach(el => el.classList.remove('active'));
            emailBodies.forEach(el => el.classList.remove('active-email'));
            
            item.classList.add('active');
            item.classList.remove('unread');
            
            const targetId = item.getAttribute('data-target');
            const targetBody = document.getElementById(targetId);
            
            if (targetBody) {
                targetBody.classList.add('active-email');
                document.getElementById('email-main').scrollTop = 0; 
            }
        });
    });

    suspectSpans.forEach(span => {
        span.addEventListener('click', function(e) {
            e.stopPropagation();
            if (byteUI) {
                byteUI.classList.remove('exit');
                byteUI.classList.add('show');
                const hintKey = this.getAttribute('data-hint');
                if (hints[hintKey]) {
                    typeMessage(hints[hintKey], true);
                }
            }
        });
    });

    // --- 5. GAME LOGIC ---
    const feedbackOverlay = document.getElementById('feedback-overlay');
    const feedbackPopup = document.getElementById('feedback-popup');
    const feedbackTitle = document.getElementById('feedback-title');
    const feedbackText = document.getElementById('feedback-text');
    const feedbackCloseBtn = document.getElementById('feedback-close-btn');
    const appContainer = document.getElementById('junglemail-app-container');
    
    let resolvedEmailsCount = 0;

    const gameData = {
        "email-1": {
            block: { correct: true, title: "CORRECT: SCAM BLOCKED", text: "Spot on! In the past, bad grammar gave scams away. Now, scammers use Generative AI to write flawless, professional emails in seconds. If it seems too good to be true, and there are red flags written all over the email, it is a scam." },
            proceed: { correct: false, title: "WARNING: SCAM SUCCESSFUL", text: "Watch your step! Generative AI makes creating near-perfect emails effortless for scammers. If you clicked the link, someone might have been waiting on the other side to smoothly extract your bank details or personal info." }
        },
        "email-2": {
            block: { correct: false, title: "WARNING: LEGIT EMAIL BLOCKED", text: "A bit too cautious! While AI makes scams look real, you can always trust verified sources. Official domains like '.edu.sg' are strictly regulated. Don't let AI paranoia make you miss your deadlines!" },
            proceed: { correct: true, title: "CORRECT: LEGIT EMAIL APPROVED", text: "Good eye. Real institutions don't use high-pressure tactics. AI scams often manufacture a false sense of urgency to bypass your critical thinking. This email only gave you facts and a safe, recognizable link." }
        }
    };

    document.querySelectorAll('.action-btn').forEach(button => {
        button.addEventListener('click', function() {
            const emailContainer = this.closest('.email-body');
            const emailId = emailContainer.id; 
            const action = this.classList.contains('block-btn') ? 'block' : 'proceed';
            const resultData = gameData[emailId][action];

            feedbackPopup.className = ''; 

            if (resultData.correct) {
                feedbackTitle.innerText = resultData.title;
                feedbackText.innerHTML = resultData.text;
                feedbackPopup.classList.add('success');
                feedbackCloseBtn.innerText = "ACKNOWLEDGE";
                feedbackOverlay.classList.add('show');

                const actionsDiv = emailContainer.querySelector('.email-actions');
                actionsDiv.classList.add('actions-resolved'); 
                const stamp = document.createElement('div');
                stamp.className = action === 'block' ? 'action-stamp stamp-blocked' : 'action-stamp stamp-proceeded';
                stamp.innerText = action === 'block' ? 'BLOCKED' : 'PROCEEDED';
                actionsDiv.appendChild(stamp);

                const sidebarItem = document.querySelector(`.email-item[data-target="${emailId}"]`);
                if (sidebarItem) sidebarItem.style.opacity = '0.5'; 

                resolvedEmailsCount++;
            } else {
                appContainer.classList.remove('shake-frame');
                void appContainer.offsetWidth;
                appContainer.classList.add('shake-frame');
                feedbackTitle.innerText = resultData.title;
                feedbackText.innerHTML = resultData.text + "<br><br><strong>That was the wrong option. Try again!</strong>";
                feedbackPopup.classList.add('error');
                feedbackCloseBtn.innerText = "TRY AGAIN";
                feedbackOverlay.classList.add('show');
            }
        });
    });

    feedbackCloseBtn.addEventListener('click', () => {
        feedbackOverlay.classList.remove('show');
        if (resolvedEmailsCount === 2) {
            triggerVictorySequence();
        }
    });

    function triggerVictorySequence() {
        const vicOverlay = document.getElementById('victory-overlay');
        const keyImg = document.getElementById('jungle-key-1');
        const bigByte = document.getElementById('byte-character');
        const bigDialogue = document.getElementById('dialogue-box');
        const typeText = document.getElementById('typewriter-text');
        const inputContainer = document.getElementById('name-input-container');
        const nameInput = document.getElementById('explorer-name');
        const confirmBtn = document.getElementById('confirm-name-btn');
        const clickPrompt = document.getElementById('click-prompt');
        const smallByteUI = document.getElementById('byte-map-ui');
        const mapKey = document.getElementById('map-key-fragment'); 

        if (smallByteUI) smallByteUI.style.display = 'none';

        let playerName = "";
        let sequenceStep = 0;
        let isTyping = false;
        let typeTimer;
        
        const lines = [
            "Good work, player! You navigated that trial like a true explorer. That’s 1 Key Fragment secured.",
            "By the way, we've been at this for a bit, and I realize I didn't even get your name...",
            "Got it. Be careful in the next trial, [Name]... I have a feeling the apps ahead won't be so forgiving."
        ];

        // 3. Start Sequence Timeline
        setTimeout(() => { vicOverlay.classList.add('show'); }, 500);
        setTimeout(() => { keyImg.classList.add('pop-in'); }, 1500); 
        
        setTimeout(() => { 
            keyImg.classList.remove('pop-in');
            keyImg.classList.add('fade-out-key'); 
            vicOverlay.querySelector('.victory-title').style.opacity = '0'; 
            vicOverlay.querySelector('.victory-subtitle').style.opacity = '0'; 
        }, 4000);

        setTimeout(() => {
            bigByte.classList.add('walking-animation', 'walk-in');
            setTimeout(() => {
                bigByte.classList.remove('walking-animation');
                bigDialogue.classList.add('victory-mode'); 
                bigDialogue.classList.add('fade-in');
                runTypewriter(lines[0]);
            }, 3000);
        }, 4500);

        function runTypewriter(text) {
            clearInterval(typeTimer);
            typeText.innerHTML = '';
            let i = 0;
            isTyping = true;
            clickPrompt.classList.remove('show');
            typeTimer = setInterval(() => {
                typeText.innerHTML += text.charAt(i);
                i++;
                if (i >= text.length) {
                    clearInterval(typeTimer);
                    isTyping = false;
                    checkSequenceState();
                }
            }, 40);
        }

        function checkSequenceState() {
            if (sequenceStep === 1) {
                inputContainer.classList.add('show');
                clickPrompt.classList.remove('show');
            } else {
                clickPrompt.classList.add('show');
            }
        }

        bigDialogue.addEventListener('click', () => {
            if (isTyping) return;
            
            if (sequenceStep === 0) {
                sequenceStep++;
                runTypewriter(lines[sequenceStep]);
            } else if (sequenceStep === 2) {
                // ==========================================
                // THE MAP REVEAL
                // ==========================================
                
                // 1. Hide Page 3 UI smoothly
                document.getElementById('junglemail-app-container').style.transition = "opacity 1s ease";
                document.getElementById('junglemail-app-container').style.opacity = "0";
                document.getElementById('junglemail-app-container').style.pointerEvents = "none";
                
                // FIX: Correctly hide the overlay to restore interactivity
                vicOverlay.classList.remove('show');

                // Smoothly hide Byte and Dialogue using the new utility class
                bigByte.classList.add('fade-out-element');
                bigDialogue.classList.add('fade-out-element');

                // 2. Reveal the Map & The New Key
                const mapContainer = document.getElementById('map-container');
                if (mapContainer) {
                    mapContainer.style.display = "block";
                    setTimeout(() => {
                        mapContainer.classList.add('reveal');
                        if (mapKey) mapKey.classList.add('show'); // Reveal the key on the map!
                    }, 500);
                }
            }
        });

        confirmBtn.addEventListener('click', (e) => {
            e.stopPropagation(); 
            playerName = nameInput.value.trim() || "Explorer"; 
            localStorage.setItem('explorerName', playerName);
            inputContainer.classList.remove('show');
            sequenceStep++;
            let finalLine = lines[2].replace("[Name]", playerName);
            runTypewriter(finalLine);
        });
    }
});






