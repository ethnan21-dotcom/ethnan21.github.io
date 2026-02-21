window.addEventListener('DOMContentLoaded', () => {
    
    // 1. Personalize the Profile Name
    const savedName = localStorage.getItem('explorerName') || "Explorer Utt";
    const nameDisplay = document.getElementById('explorer-display-name');
    if (nameDisplay) nameDisplay.innerText = savedName;

    // 2. Map Elements & Interactivity
    const mapContainer = document.getElementById('map-container');
    const overlay = document.getElementById('transition-overlay');
    const datingPin = document.getElementById('pin-dating');

    // MAP CLICK TO JUNGLEDATE (PAGE 5)
    if (datingPin) {
        datingPin.addEventListener('click', (e) => {
            e.stopPropagation();
            if(mapContainer) mapContainer.classList.add('dating-zoom-transition');
            setTimeout(() => { if(overlay) overlay.classList.add('clouds-rush'); }, 800);
            setTimeout(() => {
                document.body.style.transition = "opacity 0.5s ease";
                document.body.style.opacity = "0";
                setTimeout(() => { window.location.href = "page5.html"; }, 500); 
            }, 2500); 
        });
    }

    // 3. Game Data & Insights
    const scannerInsights = {
        "post-1": "Notice the heavy bias? Generative AI is incredibly good at writing with extreme emotion. It uses 'loaded language' to trigger your anger or fear, because psychological studies show angry users are the most likely to hit share without thinking. It’s manufacturing outrage to bypass your logic.",
        "post-2": "This is a chaotic and dramatic situation, but look closely at the language. It states the facts and the outcomes objectively without telling you how to feel about it. There's no manufactured outrage or panic, just a wild day on set. Dramatic truth is still the truth.",
        "post-3": "This is an AI botnet. One AI generated the fake post, and a swarm of other AI accounts instantly commented to create 'social proof.' It's an echo chamber designed to make a dangerous phishing scam look like a legitimate, popular government payout."
    };

    const gameData = {
        "post-1": {
            flag: { correct: true, title: "CORRECT: OUTRAGE TRAP FLAGGED", text: "Good call. You recognized the emotionally loaded language designed to trigger outrage. Flagging it stops the AI's algorithm from spreading it further." },
            share: { correct: false, title: "WARNING: MISINFORMATION SHARED", text: "Critical Error! You let the outrage bypass your logic and just amplified AI-generated misinformation to your entire network." }
        },
        "post-2": {
            flag: { correct: false, title: "WARNING: LEGIT POST FLAGGED", text: "Wait! You just flagged a verified, factual post. Remember, just because a situation on set is chaotic doesn't mean the news about it is fake. Don't let AI paranoia stop you from trusting real sources!" },
            share: { correct: true, title: "CORRECT: VERIFIED NEWS SHARED", text: "Nice. You verified the source and noticed the objective, factual language. It's safe to share real, verified updates with others." }
        },
        "post-3": {
            flag: { correct: true, title: "CORRECT: BOTNET FLAGGED", text: "Eagle eyes! You spotted the perfectly synchronized comment timestamps. You just flagged an entire AI botnet." },
            share: { correct: false, title: "WARNING: PHISHING SCAM SHARED", text: "Critical Error! You fell for the artificial 'social proof' and just sent a phishing link to all your friends." }
        }
    };

    // 4. Scanner Tool Logic & Intro Sequence
    const scannerTitle = document.getElementById('scanner-title');
    const scannerText = document.getElementById('scanner-text');
    const scannerPrompt = document.getElementById('scanner-prompt');
    const scannerScreen = document.getElementById('scanner-screen-area');
    const scannerModule = document.querySelector('.scanner-module'); 

    let isScannerTyping = false;
    let scannerTimer;
    let introStep = 0;

    const introLines = [
        `Welcome to Junglegram, ${savedName}! The place of constant connection, and unfortunately, constant harm sometimes.`,
        "Thankfully, I brought the right gear to help us get through. Click the SCAN button to analyze any of the posts here before you make a move!"
    ];

    function typeScannerMessage(text, isInsight = false) {
        clearInterval(scannerTimer);
        scannerText.innerHTML = '';
        let i = 0;
        isScannerTyping = true;
        
        if (scannerPrompt) {
            scannerPrompt.style.opacity = '0';
            if (introStep > 0 || isInsight) {
                setTimeout(() => { scannerPrompt.style.display = 'none'; }, 500); 
            }
        }

        if (isInsight && scannerTitle) {
            scannerTitle.innerText = "SCANNER INSIGHT";
        }

        scannerTimer = setInterval(() => {
            scannerText.innerHTML += text.charAt(i);
            i++;
            if (i >= text.length) {
                clearInterval(scannerTimer);
                isScannerTyping = false;
                
                if (!isInsight && introStep === 0 && scannerPrompt) {
                    scannerPrompt.style.opacity = '0.6';
                }
            }
        }, 30);
    }

    setTimeout(() => {
        typeScannerMessage(introLines[0], false);
    }, 1000);

    if (scannerScreen) {
        scannerScreen.addEventListener('click', () => {
            if (isScannerTyping) return;
            
            if (introStep === 0) {
                introStep++;
                typeScannerMessage(introLines[1], false);
                scannerScreen.style.cursor = 'default';
            }
        });
    }

    document.querySelectorAll('.scan-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const post = this.closest('.post-card');
            const postId = post.id;
            
            post.classList.add('scanned');
            
            if (scannerModule) scannerModule.classList.add('active-scanner');
            if (scannerScreen) scannerScreen.classList.add('active-scanner');
            
            typeScannerMessage(scannerInsights[postId], true);
            
            document.getElementById('social-feed').scrollTop = post.offsetTop - 20;
        });
    });

    // 4.5. "View More Comments" Interactive Reveal
    const loadMoreBtn = document.getElementById('load-more-btn');
    const hiddenComments = document.getElementById('extra-comments');
    if (loadMoreBtn && hiddenComments) {
        loadMoreBtn.addEventListener('click', function() {
            hiddenComments.style.display = 'block'; 
            this.innerText = "View 44 more comments..."; 
            this.style.pointerEvents = 'none'; 
            this.style.opacity = '0.5';
        });
    }

    // 5. Action Logic (Flag / Share)
    const feedbackOverlay = document.getElementById('feedback-overlay');
    const feedbackPopup = document.getElementById('feedback-popup');
    const feedbackTitle = document.getElementById('feedback-title');
    const feedbackText = document.getElementById('feedback-text');
    const feedbackCloseBtn = document.getElementById('feedback-close-btn');
    const appContainer = document.getElementById('junglesocial-app-container');
    
    let resolvedPostsCount = 0;

    document.querySelectorAll('.post-card .flag-btn, .post-card .share-btn').forEach(button => {
        button.addEventListener('click', function() {
            const postCard = this.closest('.post-card');
            const postId = postCard.id; 
            const action = this.classList.contains('flag-btn') ? 'flag' : 'share';
            const resultData = gameData[postId][action];

            feedbackPopup.className = ''; 

            if (resultData.correct) {
                feedbackTitle.innerText = resultData.title;
                feedbackText.innerHTML = resultData.text;
                feedbackPopup.classList.add('success');
                feedbackCloseBtn.innerText = "ACKNOWLEDGE";
                feedbackOverlay.classList.add('show');

                const actionsDiv = postCard.querySelector('.post-actions');
                actionsDiv.classList.add('actions-resolved'); 
                const stamp = document.createElement('div');
                stamp.className = action === 'flag' ? 'action-stamp stamp-blocked' : 'action-stamp stamp-proceeded';
                stamp.innerText = action === 'flag' ? 'FLAGGED' : 'SHARED';
                actionsDiv.appendChild(stamp);

                postCard.style.opacity = '0.6'; 
                resolvedPostsCount++;
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
        if (resolvedPostsCount === 3) {
            triggerVictorySequence();
        }
    });

    // 6. Victory Sequence
    function triggerVictorySequence() {
        const vicOverlay = document.getElementById('victory-overlay');
        const keyImg = document.getElementById('jungle-key-2');
        const bigByte = document.getElementById('byte-character');
        const bigDialogue = document.getElementById('dialogue-box');
        const typeText = document.getElementById('typewriter-text');
        const clickPrompt = document.getElementById('click-prompt');
        const mapKey2 = document.getElementById('map-key-fragment-2'); 

        let sequenceStep = 0;
        let isTyping = false;
        let typeTimer;
        
        const lines = [
            `Incredible work, ${savedName}! You saw right through the outrage traps and the echo chambers.`,
            "Generative AI can fake emotions and social proof perfectly, but it can't fake your critical thinking. That’s Key Fragment number two!",
            "Only one trial left. JungleDate. Brace yourself... the bots there are designed to manipulate your trust on a deeply personal level. Let's go."
        ];

        // Start Cinematic
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
                    clickPrompt.classList.add('show');
                }
            }, 40);
        }

        bigDialogue.addEventListener('click', () => {
            if (isTyping) return;
            
            sequenceStep++;
            if (sequenceStep < lines.length) {
                runTypewriter(lines[sequenceStep]);
            } else {
                // ==========================================
                // THE MAP REVEAL
                // ==========================================
                document.getElementById('junglesocial-app-container').classList.add('fade-out-element');
                vicOverlay.classList.remove('show');
                
                // THE FIX: Permanently hide the giant key and Byte so they stop blocking the map!
                keyImg.classList.add('fade-out-element');
                bigByte.classList.add('fade-out-element');
                bigDialogue.classList.add('fade-out-element');

                if (mapContainer) {
                    mapContainer.style.display = "block";
                    setTimeout(() => {
                        mapContainer.classList.add('reveal');
                        if (mapKey2) mapKey2.classList.add('show'); // Reveal Key 2 on the map!
                    }, 500);
                }
            }
        });
    }
});