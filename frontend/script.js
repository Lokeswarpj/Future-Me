// API Configuration - Smart Resolution
// Works seamlessly when index.html is loaded directly via file:// (calls localhost:5000)
// and when index.html is served statically by the Express backend itself (calls window.location.origin).
const API_BASE = (window.location.protocol === 'file:' || window.location.hostname === '127.0.0.1' || window.location.hostname === 'localhost')
  ? 'http://localhost:5000'
  : window.location.origin;

// Application State
let appState = {
    userProfile: null,
    chatHistory: [],
    isGenerating: false,
    isChatting: false
};

// UI Elements - Core Forms & States
const futureForm = document.getElementById('future-form');
const generateBtn = document.getElementById('generate-btn');
const formError = document.getElementById('form-error');
const loadingState = document.getElementById('loading-state');
const resultState = document.getElementById('result-state');
const formWrapper = document.getElementById('form-wrapper');

// UI Elements - Dynamic Loading Text
const loadingTitle = document.getElementById('loading-title');
const loadingDesc = document.getElementById('loading-desc');

// UI Elements - Result Outputs
const outputMessage = document.getElementById('output-message');
const outputIdentity = document.getElementById('output-identity');
const outputHabit = document.getElementById('output-habit');
const outputMoves = document.getElementById('output-moves');
const outputWarning = document.getElementById('output-warning');
const outputMantra = document.getElementById('output-mantra');

// UI Elements - Chat System
const chatLockOverlay = document.getElementById('chat-lock-overlay');
const chatThread = document.getElementById('chat-thread');
const chatForm = document.getElementById('chat-form');
const chatInput = document.getElementById('chat-input');
const chatSubmitBtn = document.getElementById('chat-submit-btn');
const chatHeaderName = document.getElementById('chat-header-name');
const chatToneBadge = document.getElementById('chat-tone-badge');

// UI Elements - Result Actions Buttons
const btnScrollChat = document.getElementById('btn-scroll-chat');
const btnCopyResult = document.getElementById('btn-copy-result');
const btnReflectAgain = document.getElementById('btn-reflect-again');
const btnShareBottom = document.getElementById('btn-share-bottom');

// UI Elements - Toast Notifications
const shareToast = document.getElementById('share-toast');
const toastText = document.getElementById('toast-text');

// ----------------------------------------------------
// 1. Initializers & Global Event Listeners
// ----------------------------------------------------
document.addEventListener('DOMContentLoaded', () => {
    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });

    // Intersection Observer for scroll reveal animations
    const revealElements = document.querySelectorAll('.reveal');
    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                observer.unobserve(entry.target);
            }
        });
    }, {
        root: null,
        threshold: 0.1,
        rootMargin: "0px 0px -50px 0px"
    });
    revealElements.forEach(el => revealObserver.observe(el));

    // Form Submission Event
    if (futureForm) {
        futureForm.addEventListener('submit', (e) => {
            e.preventDefault();
            generateFutureMe();
        });
    }

    // Chat Form Event
    if (chatForm) {
        chatForm.addEventListener('submit', (e) => {
            e.preventDefault();
            sendChatMessage();
        });
    }

    // Actions Listeners
    if (btnScrollChat) btnScrollChat.addEventListener('click', () => {
        const chatSection = document.getElementById('chat');
        if (chatSection) chatSection.scrollIntoView({ behavior: 'smooth' });
    });
    if (btnCopyResult) btnCopyResult.addEventListener('click', copyResultToClipboard);
    if (btnReflectAgain) btnReflectAgain.addEventListener('click', resetReflection);
    if (btnShareBottom) btnShareBottom.addEventListener('click', shareMoment);
});

// Helper: Show customized glass-style Toast notification
function showToast(message, isSuccess = true) {
    if (!shareToast) return;
    toastText.innerText = message;
    
    // Aesthetic adjustment
    if (!isSuccess) {
        shareToast.style.background = 'var(--error-color)';
        shareToast.style.color = '#fff';
    } else {
        shareToast.style.background = 'var(--text-primary)';
        shareToast.style.color = 'var(--bg-color)';
    }

    shareToast.classList.add('show');
    setTimeout(() => {
        shareToast.classList.remove('show');
    }, 4000);
}

// ----------------------------------------------------
// 2. Core Generation Engine (/api/generate-futureme)
// ----------------------------------------------------
async function generateFutureMe() {
    if (appState.isGenerating) return;

    // Gather Inputs
    const name = document.getElementById('userName').value.trim();
    const age = document.getElementById('userAge').value;
    const goal = document.getElementById('userGoal').value.trim();
    const struggle = document.getElementById('userStruggle').value.trim();
    const timeline = document.getElementById('userTimeline').value.trim();
    const tone = document.getElementById('userTone').value;

    // Double validation
    if (!name || !age || !goal || !struggle || !timeline || !tone) {
        formError.style.display = 'block';
        formError.scrollIntoView({ behavior: 'smooth', block: 'center' });
        return;
    }
    formError.style.display = 'none';

    // Set Loading State
    appState.isGenerating = true;
    generateBtn.disabled = true;
    futureForm.style.display = 'none';
    loadingState.style.display = 'block';

    // Start animated premium loading text cycles
    const loadingPhrases = [
        { title: "Establishing timeline bridge...", desc: "Synchronizing current-self coordinate layers" },
        { title: "Synthesizing goal projections...", desc: "Formulating your one-year vision path" },
        { title: "Analyzing psychological friction...", desc: "Bypassing struggle loops and constraints" },
        { title: "Assembling future coordinates...", desc: "Rendering actions based on the selected tone" },
        { title: "Opening quantum link...", desc: "Streaming a transmission from your future identity" }
    ];
    let phraseIndex = 0;
    const loadingInterval = setInterval(() => {
        phraseIndex = (phraseIndex + 1) % loadingPhrases.length;
        loadingTitle.style.opacity = 0;
        loadingDesc.style.opacity = 0;
        setTimeout(() => {
            loadingTitle.innerText = loadingPhrases[phraseIndex].title;
            loadingDesc.innerText = loadingPhrases[phraseIndex].desc;
            loadingTitle.style.opacity = 1;
            loadingDesc.style.opacity = 1;
        }, 300);
    }, 2500);

    try {
        const response = await fetch(`${API_BASE}/api/generate-futureme`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name,
                age,
                goal,
                struggle,
                oneYearVision: timeline,
                tone
            })
        });

        const result = await response.json();
        clearInterval(loadingInterval);

        if (!response.ok || !result.success) {
            throw new Error(result.error || "Failed to contact your future self.");
        }

        // Save generated profile state
        appState.userProfile = { name, age, goal, struggle, oneYearVision: timeline, tone };
        appState.chatHistory = []; // Reset dialogue context

        // Render Generated Data to DOM
        const data = result.data;
        outputMessage.innerHTML = `"${data.message.replace(/\n/g, '<br>')}"`;
        outputIdentity.innerText = data.futureIdentity;
        outputHabit.innerText = data.habit;

        // Render Next Moves List
        outputMoves.innerHTML = "";
        (data.nextMoves || []).forEach(move => {
            const li = document.createElement('li');
            li.innerText = move;
            li.style.marginBottom = "0.6rem";
            outputMoves.appendChild(li);
        });

        // Warnings and Daily Mantra
        outputWarning.innerText = data.warning || "None recorded. Execute without fear.";
        outputMantra.innerText = `"${data.mantra || 'Consistency is my identity.'}"`;

        // Configure Chat Header
        chatHeaderName.innerText = `Future ${name}`;
        const toneLabels = {
            motivational: "Mentor Mode",
            brutal: "Hard Truths",
            mentor: "Sage Counsel",
            ceo: "Strategic Core"
        };
        chatToneBadge.innerText = toneLabels[tone] || "Future Self";

        // Setup first chat bubble dynamically
        chatThread.innerHTML = `
            <div class="chat-bubble chat-ai">
                "I am here. The version of you who achieved the one-year goal to <strong>${timeline}</strong>. I know ${struggle.toLowerCase()} is testing you right now. Speak to me. Ask me anything."
            </div>
        `;

        // UI transitions - show result state
        loadingState.style.display = 'none';
        resultState.style.display = 'block';
        
        // Unlock Interactive Dialogue Section
        if (chatLockOverlay) {
            chatLockOverlay.style.opacity = '0';
            setTimeout(() => {
                chatLockOverlay.style.display = 'none';
            }, 300);
        }

        // Scroll to results
        resultState.scrollIntoView({ behavior: 'smooth', block: 'start' });
        showToast("Link established with your Future Self! ✨");

    } catch (error) {
        console.error("Generation error:", error);
        clearInterval(loadingInterval);
        
        // Restore Form State
        loadingState.style.display = 'none';
        futureForm.style.display = 'block';
        generateBtn.disabled = false;
        
        // Display elegant visual error banner
        formError.innerText = error.message || "FutureMe could not respond right now. Try again.";
        formError.style.display = 'block';
        formError.scrollIntoView({ behavior: 'smooth', block: 'center' });
        showToast("Temporal transmission failed.", false);
    } finally {
        appState.isGenerating = false;
    }
}

// ----------------------------------------------------
// 3. Premium Interactive Chat Engine (/api/chat-futureme)
// ----------------------------------------------------
async function sendChatMessage() {
    if (appState.isChatting || !appState.userProfile) return;

    const messageText = chatInput.value.trim();
    if (!messageText) return;

    // Lock Chat Form Inputs
    appState.isChatting = true;
    chatInput.disabled = true;
    chatSubmitBtn.disabled = true;
    chatInput.value = "";

    // Append User Bubble
    appendChatBubble(messageText, true);

    // Add User Message to historical state
    appState.chatHistory.push({ role: 'user', message: messageText });

    // Render premium bouncing dots typing indicator
    const typingIndicator = showTypingIndicator();

    try {
        const response = await fetch(`${API_BASE}/api/chat-futureme`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                userProfile: appState.userProfile,
                chatHistory: appState.chatHistory,
                question: messageText
            })
        });

        const result = await response.json();
        removeTypingIndicator(typingIndicator);

        if (!response.ok || !result.success) {
            throw new Error(result.error || "Communication drop. FutureMe timeline disconnected.");
        }

        const reply = result.reply;

        // Append AI Bubble
        appendChatBubble(reply, false);

        // Add AI message to state history
        appState.chatHistory.push({ role: 'futureme', message: reply });

    } catch (error) {
        console.error("Chat error:", error);
        removeTypingIndicator(typingIndicator);

        // Render visual error bubble
        const errBubble = appendChatBubble("Connection interrupted. FutureMe could not respond. Click send to try again.", false);
        errBubble.style.color = 'var(--error-color)';
        errBubble.style.borderColor = 'rgba(255, 69, 58, 0.3)';
        errBubble.style.background = 'rgba(255, 69, 58, 0.05)';
        
        showToast("Timeline link disrupted.", false);
    } finally {
        // Unlock input
        chatInput.disabled = false;
        chatSubmitBtn.disabled = false;
        chatInput.focus();
        appState.isChatting = false;
    }
}

// Helper: Append bubbles dynamically and auto-scroll
function appendChatBubble(text, isUser = false) {
    const bubble = document.createElement('div');
    bubble.className = `chat-bubble ${isUser ? 'chat-user' : 'chat-ai'}`;
    // Support basic line breaks from markdown or clean paragraphs
    bubble.innerHTML = text.replace(/\n/g, '<br>');
    chatThread.appendChild(bubble);
    
    // Auto-scroll chat thread to bottom with animation
    chatThread.scrollTo({
        top: chatThread.scrollHeight,
        behavior: 'smooth'
    });

    return bubble;
}

// Helper: Create bouncing-dots typing indicator bubble
function showTypingIndicator() {
    const indicator = document.createElement('div');
    indicator.className = 'chat-bubble chat-ai typing-indicator';
    indicator.id = 'chat-typing-indicator';
    indicator.innerHTML = '<span></span><span></span><span></span>';
    chatThread.appendChild(indicator);

    chatThread.scrollTo({
        top: chatThread.scrollHeight,
        behavior: 'smooth'
    });

    return indicator;
}

// Helper: Safely tear down bouncing dots indicator
function removeTypingIndicator(indicator) {
    if (indicator && indicator.parentNode) {
        indicator.parentNode.removeChild(indicator);
    }
}

// ----------------------------------------------------
// 4. Utility Handlers - Reset, Copy & Sharing Actions
// ----------------------------------------------------
function resetReflection() {
    // Reset inputs
    futureForm.reset();
    
    // Hide Results State
    resultState.style.display = 'none';
    futureForm.style.display = 'block';
    generateBtn.disabled = false;

    // Relock Chat UI
    if (chatLockOverlay) {
        chatLockOverlay.style.display = 'flex';
        setTimeout(() => {
            chatLockOverlay.style.opacity = '1';
        }, 50);
    }

    // Clear Thread
    chatThread.innerHTML = "";

    // Clear memory states
    appState.userProfile = null;
    appState.chatHistory = [];

    // Scroll to form wrapper
    formWrapper.scrollIntoView({ behavior: 'smooth', block: 'center' });
    showToast("Timeline reset. Design a new future.");
}

function copyResultToClipboard() {
    if (!appState.userProfile) return;

    // Extract values directly from rendered fields
    const message = outputMessage.innerText;
    const identity = outputIdentity.innerText;
    const habit = outputHabit.innerText;
    const warning = outputWarning.innerText;
    const mantra = outputMantra.innerText;
    
    const moves = [];
    outputMoves.querySelectorAll('li').forEach(li => moves.push(li.innerText));

    // Structured text compilation
    const copyText = `--- FUTUREME REFLECTION REPORT ---
Name: ${appState.userProfile.name}
Tone: ${appState.userProfile.tone.toUpperCase()}

[MESSAGE FROM FUTURE SELF]
${message}

[FUTURE IDENTITY]
${identity}

[ONE SMALL HABIT]
${habit}

[NEXT MOVES]
${moves.map((m, i) => `${i+1}. ${m}`).join('\n')}

[FUTURE WARNING]
${warning}

[DAILY MANTRA]
${mantra}

Synthesized at: ${new Date().toLocaleString()}
FutureMe - Premium AI Portal
----------------------------------`;

    navigator.clipboard.writeText(copyText)
        .then(() => showToast("Reflection report copied to clipboard! 📋"))
        .catch(() => showToast("Failed to copy. Access block.", false));
}

function shareMoment() {
    const text = `I just looked into the mirror of my potential and established a connection with my future self via FutureMe! 🚀 Make your future identity now.`;
    navigator.clipboard.writeText(text)
        .then(() => showToast("Sharing summary copied! Ready to post. 🔗"))
        .catch(() => showToast("Failed to copy.", false));
}
