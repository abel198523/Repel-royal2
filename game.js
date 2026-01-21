// 1. መሰረታዊ መረጃዎች
const STAKES = [10];
let currentUser = null;
let socket = null;

// 2. ሩሞችን በስክሪኑ ላይ የመሳል ስራ
function renderStakeRooms() {
    const listContainer = document.getElementById('stake-rooms-list');
    if (!listContainer) {
        console.error("ስህተት: 'stake-rooms-list' የሚለው ቦታ በ HTML ላይ አልተገኘም!");
        return;
    }

    listContainer.innerHTML = ''; // የቆየውን አጽዳ

    // Ensure screens are handled correctly
    const mainContent = document.getElementById('main-content');
    const stakeScreen = document.getElementById('stake-screen');
    const welcomeScreen = document.getElementById('welcome-screen');
    const authScreen = document.getElementById('auth-screen');

    if (mainContent) mainContent.style.display = 'block';
    if (stakeScreen) {
        stakeScreen.style.display = 'block';
        stakeScreen.classList.add('active');
    }
    if (welcomeScreen) welcomeScreen.style.display = 'none';
    if (authScreen) authScreen.style.display = 'none';

    STAKES.forEach(amount => {
        const row = document.createElement('div');
        row.className = 'stake-card';
        row.style.background = "#2a2a2a";
        row.style.margin = "10px";
        row.style.padding = "15px";
        row.style.borderRadius = "10px";
        row.style.display = "flex";
        row.style.justifyContent = "space-between";
        row.style.alignItems = "center";
        row.style.borderLeft = "5px solid #f59e0b";
        row.style.cursor = "pointer";
        
        row.onclick = () => selectStake(amount);
        
        row.innerHTML = `
            <div class="stake-info">
                <div style="font-weight: bold; color: white; font-size: 1.2rem;">${amount} ETB</div>
                <div style="color: #aaa; font-size: 0.9rem;" id="stake-count-${amount}">0 Players</div>
            </div>
            <div class="stake-action">
                <button style="background: #f59e0b; color: black; border: none; padding: 8px 15px; border-radius: 5px; font-weight: bold;">ቀላቀል</button>
            </div>
        `;
        listContainer.appendChild(row);
    });
}

// 3. ሩም ሲመረጥ የሚሆን ነገር
function selectStake(amount) {
    console.log("የተመረጠው ሩም: " + amount + " ETB");
    
    // Explicitly hide everything else first
    const welcome = document.getElementById('welcome-screen');
    const auth = document.getElementById('auth-screen');
    const main = document.getElementById('main-content');
    const stake = document.getElementById('stake-screen');
    const gameScreen = document.getElementById('game-screen');
    
    if (welcome) welcome.style.display = 'none';
    if (auth) auth.style.display = 'none';
    if (main) main.style.display = 'block';
    if (stake) stake.style.display = 'none';
    
    if (gameScreen) {
        gameScreen.style.setProperty('display', 'flex', 'important');
        gameScreen.classList.add('active');
        // Ensure it covers the full viewport with extreme high z-index and explicit visibility
        gameScreen.style.position = 'fixed';
        gameScreen.style.top = '0';
        gameScreen.style.left = '0';
        gameScreen.style.width = '100vw';
        gameScreen.style.height = '100vh';
        gameScreen.style.zIndex = '999999';
        gameScreen.style.background = '#0c111d';
        gameScreen.style.visibility = 'visible';
        gameScreen.style.opacity = '1';
    }
    
    const betAmount = document.getElementById('bet-amount');
    if (betAmount) betAmount.innerText = amount;
    
    // Initialize grid
    initGameGrid(); 
    
    if (socket && socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify({
            type: 'JOIN_ROOM',
            room: amount,
            token: localStorage.getItem('token')
        }));
    }
}

function initGameGrid() {
    const masterGrid = document.getElementById('master-grid');
    const instruction = document.getElementById('selection-instruction');
    const gameScreen = document.getElementById('game-screen');
    
    if (!masterGrid) {
        console.error("Master grid not found");
        return;
    }

    // Force visibility of the screen and grid
    if (gameScreen) {
        gameScreen.style.display = 'flex';
        gameScreen.classList.add('active');
    }
    
    masterGrid.innerHTML = '';
    masterGrid.style.display = 'grid'; 
    masterGrid.style.visibility = 'visible';
    masterGrid.style.opacity = '1';
    
    if (instruction) {
        instruction.style.display = 'block';
        instruction.style.visibility = 'visible';
    }
    
    // Grid styling for mobile
    masterGrid.style.gridTemplateColumns = 'repeat(5, 1fr)';
    masterGrid.style.gap = '10px';
    masterGrid.style.padding = '15px';
    masterGrid.style.width = '100%';
    masterGrid.style.boxSizing = 'border-box';

    console.log("Initializing card selection grid (1-100)");

    for (let i = 1; i <= 100; i++) {
        const cardBtn = document.createElement('button');
        cardBtn.innerText = i;
        cardBtn.className = 'card-select-btn';
        
        // Ensure buttons are visible with distinct styling
        cardBtn.style.padding = '15px 5px';
        cardBtn.style.background = '#1e2533';
        cardBtn.style.color = '#ffffff';
        cardBtn.style.border = '2px solid #374151';
        cardBtn.style.borderRadius = '12px';
        cardBtn.style.fontWeight = 'bold';
        cardBtn.style.fontSize = '18px';
        cardBtn.style.display = 'block';
        
        cardBtn.onclick = (e) => {
            e.preventDefault();
            console.log("Card " + i + " clicked");
            selectCard(i);
        };
        masterGrid.appendChild(cardBtn);
    }
    
    const bingoBoard = document.getElementById('bingo-board');
    if (bingoBoard) {
        bingoBoard.innerHTML = '<div style="text-align:center; color:#94a3b8; margin:10px; font-weight: bold; font-size: 1rem;">እባክዎን ካርድ ይምረጡ</div>';
        bingoBoard.style.display = 'block';
    }
}

function selectCard(cardNumber) {
    console.log("የተመረጠ ካርድ: " + cardNumber);
    
    // Hide selection grid after choice
    const masterGrid = document.getElementById('master-grid');
    const instruction = document.getElementById('selection-instruction');
    if (masterGrid) masterGrid.style.display = 'none';
    if (instruction) instruction.style.display = 'none';

    if (socket && socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify({
            type: 'SELECT_CARD',
            cardNumber: cardNumber,
            token: localStorage.getItem('token')
        }));
    }
}

// 4. ገጹ ሲከፈት በቅድሚያ የሚሰሩ ስራዎች
document.addEventListener('DOMContentLoaded', () => {
    // Initial render
    renderStakeRooms();
    
    // Check for existing token
    const token = localStorage.getItem('token');
    if (token) {
        document.getElementById('welcome-screen').style.display = 'none';
        document.getElementById('auth-screen').style.display = 'none';
        document.getElementById('main-content').style.display = 'block';
        document.getElementById('stake-screen').style.display = 'block';
        document.getElementById('stake-screen').classList.add('active');
        initWebSocket();
    }

    const loginBtn = document.getElementById('do-login');
    if (loginBtn) {
        loginBtn.addEventListener('click', async () => {
            const username = document.getElementById('login-telegram').value;
            const password = document.getElementById('login-pass').value;

            try {
                const res = await fetch('/api/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username, password })
                });
                const data = await res.json();
                if (data.token) {
                    localStorage.setItem('token', data.token);
                    currentUser = data;
                    document.getElementById('auth-screen').style.display = 'none';
                    document.getElementById('main-content').style.display = 'block';
                    document.getElementById('stake-screen').style.display = 'block';
                    document.getElementById('stake-screen').classList.add('active');
                    document.getElementById('stake-username').innerText = data.username;
                    renderStakeRooms();
                    initWebSocket();
                } else {
                    alert(data.error || "Login failed");
                }
            } catch (err) {
                console.error(err);
                alert("Connection error");
            }
        });
    }
});

function initWebSocket() {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    socket = new WebSocket(`${protocol}//${window.location.host}`);
    
    socket.onopen = () => {
        console.log("WebSocket connected");
    };

    socket.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.type === 'STATS_UPDATE') {
            Object.keys(data.rooms).forEach(room => {
                const countEl = document.getElementById(`stake-count-${room}`);
                if (countEl) {
                    countEl.innerText = `${data.rooms[room].playerCount} Players`;
                }
            });
        }
    };
}

function showAuth(type) {
    document.getElementById('welcome-screen').style.display = 'none';
    document.getElementById('auth-screen').style.display = 'flex';
    if (type === 'signup') {
        showSignup();
    } else {
        showLogin();
    }
}

function showSignup() {
    document.getElementById('login-form').style.display = 'none';
    document.getElementById('signup-form').style.display = 'block';
}

function showLogin() {
    document.getElementById('signup-form').style.display = 'none';
    document.getElementById('login-form').style.display = 'block';
}

// Signup Request logic
document.addEventListener('DOMContentLoaded', () => {
    const signupRequestBtn = document.getElementById('do-signup-request');
    if (signupRequestBtn) {
        signupRequestBtn.addEventListener('click', async () => {
            const telegram_chat_id = document.getElementById('signup-telegram').value;
            const username = document.getElementById('signup-username').value;

            try {
                const res = await fetch('/api/signup-request', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ telegram_chat_id, username })
                });
                const data = await res.json();
                if (res.ok) {
                    alert(data.message);
                    document.getElementById('otp-section').style.display = 'block';
                    signupRequestBtn.style.display = 'none';
                } else {
                    alert(data.error || "Request failed");
                }
            } catch (err) {
                console.error(err);
                alert("Connection error");
            }
        });
    }

    const verifyBtn = document.getElementById('do-verify');
    if (verifyBtn) {
        verifyBtn.addEventListener('click', async () => {
            const telegram_chat_id = document.getElementById('signup-telegram').value;
            const otp = document.getElementById('signup-otp').value;
            const password = document.getElementById('signup-pass').value;

            try {
                const res = await fetch('/api/signup-verify', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ telegram_chat_id, otp, password })
                });
                const data = await res.json();
                if (data.token) {
                    localStorage.setItem('token', data.token);
                    currentUser = data;
                    document.getElementById('auth-screen').style.display = 'none';
                    document.getElementById('main-content').style.display = 'block';
                    document.getElementById('stake-screen').style.display = 'block';
                    document.getElementById('stake-screen').classList.add('active');
                    document.getElementById('stake-username').innerText = data.username;
                    renderStakeRooms();
                    initWebSocket();
                } else {
                    alert(data.error || "Verification failed");
                }
            } catch (err) {
                console.error(err);
                alert("Connection error");
            }
        });
    }
});
