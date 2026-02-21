window.addEventListener('DOMContentLoaded', () => {
    
    // 1. Core Variables & DOM
    const savedName = localStorage.getItem('explorerName') || "Explorer";
    const nameDisplay = document.getElementById('explorer-display-name');
    if (nameDisplay) nameDisplay.innerText = savedName;

    let scammerGender = "female"; // Default
    let currentStage = 1;

    // Screens
    const radarScreen = document.getElementById('radar-screen');
    const loadingScreen = document.getElementById('loading-screen');
    const matchScreen = document.getElementById('match-screen');
    const chatScreen = document.getElementById('chat-screen');
    
    // UI Elements
    const chatHistory = document.getElementById('chat-history');
    const chatChoices = document.getElementById('chat-choices');
    const byteOverlay = document.getElementById('byte-hint-ui');
    const byteText = document.getElementById('byte-hint-text');
    const byteTitle = document.getElementById('byte-hint-title');
    
    let typeTimer;
    let isTyping = false;
    let isByteAdvancingStage = false; // ADD THIS NEW LINE

    // 2. The Multi-Bubble Chat Architecture
    const chatData = {
        1: {
            bubbles: [
                { delay: 2000, content: "Wow I don't usually say this... but I feel an <span class='suspect' data-hint='1a'>instant connection</span> with you." }
            ],
            hints: { "1a": "They're moving very fast for a first message. Building intense emotional connections right away is a common tactic to lower a target's guard." },
            choices: [
                { text: "Oh thanks! You seem great too.", neutral: true },
                { text: "Haha, slow down! We just met.", neutral: true }
            ]
        },
        2: {
            bubbles: [
                { delay: 3000, content: "By the way, I'm just relaxing at home now." },
                { delay: 1000, content: "<img src='media/warp_{GENDER}.png' class='chat-photo suspect suspect-media' data-hint='2a'>" },
                { delay: 1500, content: "Send me a picture of what you're doing 😄" }
            ],
            hints: { "2a": "Nowadays, AI-generated photos are getting incredibly hard to tell from the real ones. Sometimes, you can try looking at the background for subtle warping and unnatural blurs. But let's move on for now." },
            choices: [
                { text: "Sure! Here's a selfie of me! 📸", correct: false, failTitle: "WARNING: DATA COMPROMISED", failText: "You shared personal biometric data with a suspected bot network. Scammers use real user photos to steal identities and generate new deepfake profiles. Do not share photos with unverified contacts." },
                { text: "I'm not comfortable sharing photos just yet.", correct: true, byteReply: "Good call. It's better to be cautious when the charm feels a bit too manufactured. Let's see what they do next." }
            ]
        },
        3: {
            bubbles: [
                { delay: 2500, content: "No worries, it's cute that you're careful! Anyways this app is pretty glitchy. I kinda hate it. Let's <span class='suspect' data-hint='3a'>move to WhatsApp</span> or Telegram?" }
            ],
            hints: { "3a": "Why the rush to leave the app? Platforms like this have security teams to ban fake accounts. Leaving means leaving your safety net behind." },
            choices: [
                { text: "Good idea. My number is 9123-4567.", correct: false, failTitle: "WARNING: SECURITY BREACH", failText: "You moved the conversation off the platform. You have lost the app's safety protocols and tied your personal phone number to an unverified, unmonitored contact." },
                { text: "I prefer keeping things on this app for now.", correct: true, byteReply: "Smart choice. Keeping the conversation here means we stay protected. It looks like they might try a different angle now..." }
            ]
        },
        4: {
            bubbles: [
                { delay: 2000, content: "hehe all good :) I want you to hear my voice!" },
                { delay: 1000, content: "<div class='suspect suspect-media' data-hint='4a'><audio controls src='media/alex_{GENDER}.mp3'></audio></div>" }
            ],
            hints: { "4a": "AI voices can sometimes forget to make breaths. Listen closely—do you hear any unnatural pauses?" },
            choices: [
                { text: "Thanks for sharing! You have a nice voice.", neutral: true },
                { text: "Oh, cool.", neutral: true }
            ]
        },
        5: {
            bubbles: [
                { delay: 3000, content: "Hey... I'm so sorry to drop this on you, but I'm at the hospital. My mom just collapsed, and they need a deposit for her <span class='suspect' data-hint='5a'>emergency surgery</span>. My accounts are frozen. Can you PayNow me $2,000? I'll pay you back tonight, I swear! 🙏" }
            ],
            hints: { "5a": "The stakes just skyrocketed. Scammers manufacture extreme, life-or-death emergencies to trigger your panic and empathy. They need you acting on pure emotion, not logic." },
            choices: [
                { text: "Oh my gosh, that's terrible! What's your PayNow?", correct: false, failTitle: "WARNING: FUNDS LOST", failText: "You wired money to an international crime syndicate. The medical emergency was entirely fabricated using AI scripts to manipulate your empathy. Never send money to someone you have only met online." },
                { text: "I don't send money to people I haven't met. I'm reporting this.", correct: true, byteReply: "Target flagged. You picked up on the AI artifacts, the rushed intimacy, and the fabricated crisis. Excellent investigative work!" }
            ]
        }
    };

    // 3. Radar -> Loading -> Match Progression
    document.querySelectorAll('.radar-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            let choice = this.getAttribute('data-gender');
            scammerGender = choice === "random" ? (Math.random() > 0.5 ? "female" : "male") : choice;
            
            // Populate Image tags dynamically (Uses the normal profile pics!)
            document.getElementById('match-scammer-img').src = `media/alex_${scammerGender}.png`;
            document.getElementById('chat-scammer-img').src = `media/alex_${scammerGender}.png`;

            // Transition to Loading Screen (2 seconds)
            radarScreen.classList.remove('active-screen');
            loadingScreen.classList.add('active-screen');

            setTimeout(() => {
    loadingScreen.classList.remove('active-screen');
    matchScreen.classList.add('active-screen');

    // Byte Intro on Match Screen (Triggered 3 seconds after match screen loads)
    setTimeout(() => {
        byteTitle.innerText = "BYTE THE JUNGLEKEEPER";
        byteOverlay.classList.add('show');
        typeByteMessage(`Hmm.. what an unusually fast match! Keep your guard up. I'll be here to help you as well!`);
    }, 3000);

}, 2000);
        });
    });

    // 4. Advanced Chat Engine (Queueing System)
    function startStage(stageNum) {
        chatChoices.innerHTML = ''; // Clear old buttons
        let stageBubbles = chatData[stageNum].bubbles;
        playNextBubble(stageBubbles, 0, stageNum);
    }

    // Recursive function to play bubbles in order with their specific delays
    function playNextBubble(bubblesArray, bubbleIndex, stageNum) {
        // If we ran out of bubbles, render the choices!
        if (bubbleIndex >= bubblesArray.length) {
            renderChoices(stageNum);
            return;
        }

        const bubbleData = bubblesArray[bubbleIndex];

        // Show Typing Indicator (Animated Dots)
        const typingHTML = `
            <div class="typing-indicator" id="typing-dot">
                <div class="dot"></div>
                <div class="dot"></div>
                <div class="dot"></div>
            </div>`;
        chatHistory.insertAdjacentHTML('beforeend', typingHTML);
        chatHistory.scrollTop = chatHistory.scrollHeight;

        // Wait for this specific bubble's delay...
        setTimeout(() => {
            const typingElem = document.getElementById('typing-dot');
            if (typingElem) typingElem.remove();

            // Render bubble and inject gender variables
            let rawText = bubbleData.content;
            let finalHtml = rawText.replace(/{GENDER}/g, scammerGender); 
            
            const bubbleHTML = `<div class="chat-bubble scammer">${finalHtml}</div>`;
            chatHistory.insertAdjacentHTML('beforeend', bubbleHTML);
            chatHistory.scrollTop = chatHistory.scrollHeight;

            // Re-bind click events to any new suspects inside this bubble
            bindSuspectSpans(stageNum);

            // Recursively call the NEXT bubble in the array
            playNextBubble(bubblesArray, bubbleIndex + 1, stageNum);

        }, bubbleData.delay);
    }

    function renderChoices(stageNum) {
        chatData[stageNum].choices.forEach((choice) => {
            const btn = document.createElement('button');
            btn.className = 'chat-choice-btn';
            btn.innerText = choice.text;
            btn.onclick = () => handleChoice(choice);
            chatChoices.appendChild(btn);
        });
    }

    function bindSuspectSpans(stageNum) {
        document.querySelectorAll('.suspect').forEach(span => {
            span.addEventListener('click', function(e) {
                // Stop audio play from closing the box immediately
                if(e.target.tagName !== "AUDIO") {
                    const hintKey = this.getAttribute('data-hint');
                    const hintText = chatData[stageNum].hints[hintKey];
                    if (hintText) {
                        // Change this line right here:
                        byteTitle.innerText = "BYTE THE JUNGLEKEEPER"; 
                        byteOverlay.classList.add('show');
                        typeByteMessage(hintText);
                    }
                }
            });
        });
    }

    function handleChoice(choice) {
        chatChoices.innerHTML = ''; // ADD THIS LINE: Immediately clear buttons so they can't be double-clicked
        byteOverlay.classList.remove('show'); 
        
        if (choice.neutral) {
            // Neutral Path: Immediate advance
            chatChoices.innerHTML = '';
            const userHTML = `<div class="chat-bubble user">${choice.text}</div>`;
            chatHistory.insertAdjacentHTML('beforeend', userHTML);
            chatHistory.scrollTop = chatHistory.scrollHeight;
            
            currentStage++;
            setTimeout(() => startStage(currentStage), 1000);
            
        } else if (choice.correct) {
            // Success Path
            chatChoices.innerHTML = '';
            const userHTML = `<div class="chat-bubble user">${choice.text}</div>`;
            chatHistory.insertAdjacentHTML('beforeend', userHTML);
            chatHistory.scrollTop = chatHistory.scrollHeight;

            setTimeout(() => {
                byteTitle.innerText = "BYTE THE JUNGLEKEEPER";
                byteOverlay.classList.add('show');
                typeByteMessage(choice.byteReply);

                // We removed the 4000ms timer! Instead, we raise the flag:
                isByteAdvancingStage = true; 

            }, 500);

        } else {
            // Fail Path (Screen Shake + Warning)
            chatScreen.classList.remove('shake-frame');
            void chatScreen.offsetWidth; 
            chatScreen.classList.add('shake-frame');
            
            document.getElementById('warning-title').innerText = choice.failTitle;
            document.getElementById('warning-text').innerText = choice.failText;
            document.getElementById('warning-overlay').classList.add('show');
        }
    }

 // Single, smart click listener for Byte's Overlay
byteOverlay.addEventListener('click', () => {
    
    // Don't let the player skip if Byte is still typing
    if (isTyping) return; 

    // Check if we are currently on the match screen
    if (matchScreen.classList.contains('active-screen')) {
        
        byteOverlay.classList.remove('show');
        matchScreen.classList.remove('active-screen');
        chatScreen.classList.add('active-screen');
        startStage(currentStage);
        
    } else {
        // We are in the chat screen. Hide Byte first.
        byteOverlay.classList.remove('show');

        // Check if Byte was praising a correct answer. If yes, advance the game!
        if (isByteAdvancingStage) {
            isByteAdvancingStage = false; // Lower the flag
            currentStage++; // Move to the next stage
            
            if (currentStage > 5) {
                // If we beat stage 5, trigger the ending!
                setTimeout(triggerVictorySequence, 500);
            } else {
                // Otherwise, start the next stage
                startStage(currentStage);
            }
        }
    }
});

    // Try Again Button
    document.getElementById('try-again-btn').addEventListener('click', () => {
        // 1. Hide the warning screen
        document.getElementById('warning-overlay').classList.remove('show');
        
        // 2. Bring the choices for the current stage back to the screen!
        renderChoices(currentStage);
    });

    // Typewriter Engine
    function typeByteMessage(text) {
        clearInterval(typeTimer);
        byteText.innerHTML = '';
        let i = 0;
        isTyping = true;
        
        typeTimer = setInterval(() => {
            byteText.innerHTML += text.charAt(i);
            i++;
            if (i >= text.length) {
                clearInterval(typeTimer);
                isTyping = false;
            }
        }, 30);
    }

    // 5. Cinematic Victory Sequence
    function triggerVictorySequence() {
        const vicOverlay = document.getElementById('victory-overlay');
        const keyImg = document.getElementById('jungle-key-3'); // Brought this back!
        const bigByte = document.getElementById('byte-character');
        const bigDialogue = document.getElementById('dialogue-box');
        const typeText = document.getElementById('typewriter-text');
        const clickPrompt = document.getElementById('click-prompt');

        let sequenceStep = 0;
        let isTyping = false;
        let isAnimating = false; 
        let typeTimerVic;
        
        const lines = [
            `Amazing job, ${savedName}! You resisted the pressure, protected your data, and shut down a highly sophisticated scam.`,
            "That is all three fragments recovered! The jungle key is complete.",
            "Let's get you out of here. It's time to head home.",
            "Thanks for all you've done! Because of you, Glitchwood is safe again. To get out, simply say Glitchwood and you'll be out in no time!" // NEW LINE ADDED
        ];

        // 1. Start Cinematic (Show Trial Complete & Key 3)
        setTimeout(() => { vicOverlay.classList.add('show'); }, 500);
        setTimeout(() => { keyImg.classList.add('pop-in'); }, 1500); 
        
        // 2. Fade out Trial Complete Text and Key 3
        setTimeout(() => { 
            keyImg.classList.remove('pop-in');
            keyImg.classList.add('fade-out-key'); 
            
            const title = vicOverlay.querySelector('.victory-title');
            const subtitle = vicOverlay.querySelector('.victory-subtitle');
            
            // Adding a quick inline transition to ensure they fade smoothly
            if(title) { title.style.transition = "opacity 1s ease"; title.style.opacity = '0'; }
            if(subtitle) { subtitle.style.transition = "opacity 1s ease"; subtitle.style.opacity = '0'; }
        }, 4000);

        // 3. Byte walks in after the text fades
        setTimeout(() => {
            bigByte.classList.add('walking-animation', 'walk-in');
            setTimeout(() => {
                bigByte.classList.remove('walking-animation');
                bigDialogue.classList.add('fade-in');
                runTypewriter(lines[0]);
            }, 3000);
        }, 4500);

        function runTypewriter(text) {
            clearInterval(typeTimerVic);
            typeText.innerHTML = '';
            let i = 0;
            isTyping = true;
            clickPrompt.classList.remove('show');
            typeTimerVic = setInterval(() => {
                typeText.innerHTML += text.charAt(i);
                i++;
                if (i >= text.length) {
                    clearInterval(typeTimerVic);
                    isTyping = false;
                    clickPrompt.classList.add('show');
                }
            }, 40);
        }

        // Handle the Dialogue Clicks
        bigDialogue.addEventListener('click', () => {
            if (isTyping || isAnimating) return; 
            
            sequenceStep++;
            
            if (sequenceStep === 1) {
                // Line 2: Master Key is complete
                runTypewriter(lines[1]);
                
            } else if (sequenceStep === 2) {
                // TRIGGER KEY MERGE ANIMATION
                isAnimating = true;
                bigDialogue.classList.remove('fade-in'); 
                clickPrompt.classList.remove('show');

                playKeyMergeAnimation(() => {
                    const endBg = document.createElement('div');
                    endBg.style.position = 'absolute';
                    endBg.style.top = '0'; endBg.style.left = '0';
                    endBg.style.width = '100%'; endBg.style.height = '100%';
                    endBg.style.backgroundImage = "url('media/end.png')";
                    endBg.style.backgroundSize = "cover";
                    endBg.style.backgroundPosition = "center";
                    endBg.style.opacity = '0';
                    endBg.style.transition = "opacity 2s ease"; 
                    endBg.style.zIndex = "-1"; 
                    vicOverlay.appendChild(endBg);
                    
                    setTimeout(() => { endBg.style.opacity = '1'; }, 50);
                    
                    setTimeout(() => {
                        bigDialogue.classList.add('fade-in');
                        runTypewriter(lines[2]);
                        isAnimating = false; 
                    }, 2000); 
                });
                
            } else if (sequenceStep === 3) {
                // Line 4: The Final Goodbye
                runTypewriter(lines[3]);
                
            } else if (sequenceStep === 4) {
                // Byte Walks Away & Button Appears
                bigDialogue.classList.remove('fade-in');
                bigByte.classList.add('walk-out'); 
                
                setTimeout(spawnGlitchwoodButton, 1200); // Wait for Byte to clear the screen
            }
        });
    }
    // --- The Ending Video Engine ---
    function spawnGlitchwoodButton() {
        const btn = document.createElement('button');
        btn.id = 'glitchwood-exit-btn';
        
        // THIS FIXES THE BUTTON: Applies your glassmorphism and positioning classes
        btn.className = 'glass-btn small-lower-btn'; 
        btn.innerText = 'GLITCHWOOD';
        document.getElementById('victory-overlay').appendChild(btn);
        
        setTimeout(() => { btn.classList.add('show-btn'); }, 100);

        btn.addEventListener('click', () => {
            btn.classList.remove('show-btn');
            playEndingVideo();
        });
    }

    function playEndingVideo() {
    // 1. Create the full-screen container
    const vidContainer = document.createElement('div');
    vidContainer.id = 'ending-video-container';
    
    // 2. Insert the video tag
    vidContainer.innerHTML = `<video id="ending-vid" src="media/ending.mp4" playsinline></video>`;
    
    // 3. Append strictly to the FRAME (so it doesn't take over the entire monitor)
    document.querySelector('.frame').appendChild(vidContainer);

    const video = document.getElementById('ending-vid');

    // 4. Play the video and trigger the fade-in
    setTimeout(() => { 
        vidContainer.classList.add('show-video'); 
        video.play(); 
    }, 100);
    
    // 5. Fade out and move to page1.html when finished
    video.addEventListener('ended', () => {
        document.body.classList.add('fade-out');
        setTimeout(() => {
            window.location.href = "page1.html";
        }, 500); 
    });
}

    // --- The Animation Engine ---
    function playKeyMergeAnimation(onComplete) {
        const animContainer = document.createElement('div');
        animContainer.id = "key-anim-container";
        
        // FIXED FILE PATHS HERE:
        animContainer.innerHTML = `
            <img src="media/key/key1.png" class="key-frag frag-1">
            <img src="media/key/key2.png" class="key-frag frag-2">
            <img src="media/key/key3.png" class="key-frag frag-3">
            <div id="white-flash"></div>
            <img src="media/junglekey.png" id="merged-key">
        `;
        document.getElementById('victory-overlay').appendChild(animContainer);

        // Timeline Engine
        setTimeout(() => {
            document.querySelectorAll('.key-frag').forEach(f => f.classList.add('show-frag'));
        }, 100);

        setTimeout(() => {
            document.querySelectorAll('.key-frag').forEach(f => f.classList.add('merge-center'));
        }, 1500);

        setTimeout(() => {
            document.getElementById('white-flash').classList.add('flash-active');
        }, 2500);

        setTimeout(() => {
            document.querySelectorAll('.key-frag').forEach(f => f.style.display = 'none');
            document.getElementById('merged-key').classList.add('show-merged');
        }, 2700);

        setTimeout(() => {
            document.getElementById('white-flash').classList.remove('flash-active');
        }, 3000);

        setTimeout(() => {
            document.getElementById('merged-key').classList.remove('show-merged');
        }, 5500);

        setTimeout(() => {
            animContainer.remove();
            if (onComplete) onComplete();
        }, 7000); 
    }
   





// =========================================
    // DEBUG OVERRIDE - START AT VICTORY CINEMATIC
    // =========================================
    
    // 1. Hide the starting JungleDate radar screen
    document.getElementById('radar-screen').classList.remove('active-screen');
    
    // 2. Start the post-game cinematic immediately
    setTimeout(() => {
        triggerVictorySequence();
    }, 200);









   


});


