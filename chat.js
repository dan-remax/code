// --- Simple Chat State ---
const chatEl = document.getElementById('chat');
const inputEl = document.getElementById('input');
const sendBtn = document.getElementById('sendBtn');
const appEl = document.querySelector('.app');

const SETTINGS = {
	streaming: true,
	persist: false,
	typingDelayMsPerChar: 4,
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


function generateDummyResponse(userText) {
	const templates = [
		`You said: "${userText}". Here's a concise response with a friendly tone. (Soluta possimus asperiores. Assumenda facilis rerum sunt debitis natus perspiciatis. Dicta aut rautem quia reiciendis inventore. Consequatur sint quaerat. Omnis quisquam et vel quis perspiciatis provident perspiciatis et.)`,
		`Great question! If we break it down:\n• Point 1\n• Point 2\n• Point 3\n\nLet me know where to go deeper. Thus concludes the sample response`,
		`Quick summary: [placeholder]\n\nDetails: This is a mock reply. Soluta possimus asperiores. Assumenda facilis rerum sunt debitis natus perspiciatis. Dicta aut rem inventore quia velit officiis quia. Nulla iusto nihil omnis dolores et illum eos dolore. Ex quas harum autem libero illum. Dignissimos rerum quo officiis. Sapiente adipisci veritatis non consequatur doloribus. Omnis nihil dolores odit sapiente doloremque. Ut facere sunt recusandae saepe nisi perferendis doloremque porro. Ad ut amet. Voluptatem excepturi sunt omnis excepturi cumque voluptates. Quis laborum laborum ea ducimus nemo tenetur aut. Fugit autem quia reiciendis inventore. Consequatur sint quaerat. Omnis quisquam et vel quis perspiciatis provident perspiciatis et.`,
		`Here's a sample short answer.`,
		`Thanks for the message! This is not the actual pypestream embed. It's a sample for design`
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

  // If we were in centered state, return to normal layout
  if (appEl.classList.contains('centered')) {
    appEl.classList.remove('centered');
  }

  inputEl.value = '';
  inputEl.style.height = '64px';
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
``
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




(function init() {
  messages = load();
  if (messages.length === 0) {
    // Center the composer on first load
    appEl.classList.add('centered');
    addMessage('assistant', 'Hi! Ask me anything. This is a simple demo with dummy responses.');
  } else {
    appEl.classList.remove('centered');
    render();
  }
  inputEl.focus();
})();
