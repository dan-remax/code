
// --- Simple Chat State ---
const chatEl = document.getElementById('chat');
const inputEl = document.getElementById('input');
const sendBtn = document.getElementById('sendBtn');
const clearBtn = document.getElementById('clearBtn');
const copyBtn = document.getElementById('copyBtn');

const SETTINGS = {
	streaming: true,
	persist: true,
	typingDelayMsPerChar: 12,
	maxHistory: 200
};

let messages = [];

// --- Helpers ---
const save = () => {
	if (!SETTINGS.persist) return;
	try { localStorage.setItem('simple-chat', JSON.stringify(messages.slice(-SETTINGS.maxHistory))); }
	catch { }
};
const load = () => {
	if (!SETTINGS.persist) return [];
	try {
		const raw = localStorage.getItem('simple-chat');
		return raw ? JSON.parse(raw) : [];
	} catch { return []; }
};

function scrollToBottom() {
	chatEl.scrollTop = chatEl.scrollHeight;
}

function createMessageNode(role, content, isTyping = false) {
	const wrap = document.createElement('div');
	wrap.className = `msg ${role}`;

	const avatar = document.createElement('div');
	avatar.className = `avatar ${role === 'user' ? 'user' : 'bot'}`;
	avatar.textContent = role === 'user' ? 'U' : 'AI';

	const bubble = document.createElement('div');
	bubble.className = 'bubble';

	if (isTyping) {
		const typing = document.createElement('span');
		typing.className = 'typing';
		typing.innerHTML = '<span class="dotty"></span><span class="dotty"></span><span class="dotty"></span>';
		bubble.appendChild(typing);
	} else {
		bubble.textContent = content;
	}

	wrap.appendChild(avatar);
	wrap.appendChild(bubble);
	return { wrap, bubble };
}

function render() {
	chatEl.innerHTML = '';
	for (const m of messages) {
		const { wrap } = createMessageNode(m.role, m.content);
		chatEl.appendChild(wrap);
	}
	scrollToBottom();
}

function addMessage(role, content) {
	const msg = { role, content, ts: Date.now() };
	messages.push(msg);
	save();
	const { wrap } = createMessageNode(role, content);
	chatEl.appendChild(wrap);
	scrollToBottom();
	return msg;
}

function addTyping() {
	const { wrap, bubble } = createMessageNode('assistant', '', true);
	chatEl.appendChild(wrap);
	scrollToBottom();
	return { wrap, bubble };
}

// Simulated "model" response (dummy content)
function generateDummyResponse(userText) {
	const templates = [
		`You said: "${userText}". Here's a concise response with a friendly tone. (Dummy content)`,
		`Great question! If we break it down:\n• Point 1\n• Point 2\n• Point 3\n\nLet me know where to go deeper. (Dummy)`,
		`Quick summary: [placeholder]\n\nDetails: This is a mock reply to demonstrate UI streaming and formatting.`,
		`Here's a short answer, followed by a tip: Always structure outputs for readability. (Sample text)`,
		`Thanks for the message! This response is generated locally and not calling any API.`
	];
	return templates[Math.floor(Math.random() * templates.length)];
}

async function streamIntoBubble(bubble, text) {
	bubble.textContent = '';
	for (let i = 0; i < text.length; i++) {
		bubble.textContent += text[i];
		if (SETTINGS.typingDelayMsPerChar) {
			await new Promise(r => setTimeout(r, SETTINGS.typingDelayMsPerChar));
		}
		if (i % 5 === 0) scrollToBottom();
	}
}

async function handleSend() {
	const text = inputEl.value.trim();
	if (!text) return;
	inputEl.value = '';
	inputEl.style.height = '52px';
	sendBtn.disabled = true;

	addMessage('user', text);

	// Show typing indicator
	const typing = addTyping();

	// Simulate latency
	await new Promise(r => setTimeout(r, 500 + Math.random() * 600));

	const reply = generateDummyResponse(text);

	if (SETTINGS.streaming) {
		await streamIntoBubble(typing.bubble, reply);
	} else {
		typing.bubble.textContent = reply;
	}

	// Replace typing indicator "message" with a proper assistant message in state
	typing.wrap.remove();
	addMessage('assistant', reply);

	sendBtn.disabled = false;
	inputEl.focus();
}

// --- Events ---
sendBtn.addEventListener('click', handleSend);

inputEl.addEventListener('keydown', (e) => {
	if (e.key === 'Enter' && !e.shiftKey) {
		e.preventDefault();
		handleSend();
	}
});

// Auto-resize textarea
inputEl.addEventListener('input', () => {
	inputEl.style.height = 'auto';
	inputEl.style.height = Math.min(inputEl.scrollHeight, window.innerHeight * 0.34) + 'px';
});

clearBtn.addEventListener('click', () => {
	if (!confirm('Clear the chat?')) return;
	messages = [];
	save();
	render();
});

copyBtn.addEventListener('click', async () => {
	const lines = messages.map(m => (m.role === 'user' ? 'You: ' : 'AI: ') + m.content);
	const text = lines.join('\n\n');
	try {
		await navigator.clipboard.writeText(text);
		copyBtn.textContent = 'Copied!';
		setTimeout(() => copyBtn.textContent = 'Copy', 1200);
	} catch {
		alert('Copy failed. Your browser may block clipboard access.');
	}
});

// --- Init ---
(function init() {
	messages = load();
	if (messages.length === 0) {
		addMessage('assistant', 'Hi! Ask me anything. This is a simple demo with dummy responses.');
	} else {
		render();
	}
	inputEl.focus();
})();
