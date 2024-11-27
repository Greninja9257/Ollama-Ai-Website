const chatbox = document.getElementById('chatbox');
const messageInput = document.getElementById('message-input');
const sendButton = document.getElementById('send-button');
const conversationList = document.getElementById('conversation-list');
let currentConversationId = null;

function displayMessage(message, sender) {
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message', sender);

    // Split message into parts (text and code)
    const parts = message.split(/```/g);

    parts.forEach((part, index) => {
        if (index % 2 === 1) {
            // Code block
            const codeContent = part.trim();
            // Remove the first line if it contains the code name
            const codeLines = codeContent.split('\n');
            if (codeLines.length > 1 && codeLines[0].match(/^[a-zA-Z0-9]+$/)) {
                codeLines.shift(); // Remove the first line
            }
            const cleanCode = codeLines.join('\n');

            const codeBlock = document.createElement('pre');
            const codeElement = document.createElement('code');
            codeElement.textContent = cleanCode; // Escape and trim code content
            codeBlock.appendChild(codeElement);
            messageDiv.appendChild(codeBlock);
        } else {
            // Normal text
            const escapedText = part
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/\n/g, '<br>'); // Handle line breaks

            const textElement = document.createElement('span'); // Use span instead of p
            textElement.innerHTML = escapedText;
            messageDiv.appendChild(textElement);
        }
    });

    chatbox.appendChild(messageDiv);
    chatbox.scrollTop = chatbox.scrollHeight;
}

// Fetch all conversations from the server
async function updateConversationList() {
    const response = await fetch(`/get-conversations?userId=default`);
    const data = await response.json();

    conversationList.innerHTML = ''; // Clear the list
    data.conversations.forEach(({ id, preview }) => {
        const listItem = document.createElement('li');
        listItem.classList.add('conversation-item');

        const textSpan = document.createElement('span');
        textSpan.textContent = preview;
        textSpan.onclick = () => loadConversation(id); // Load conversation on click

        const deleteButton = document.createElement('button');
        deleteButton.textContent = '🗑️';
        deleteButton.classList.add('delete-button');
        deleteButton.onclick = (e) => {
            e.stopPropagation(); // Prevent triggering loadConversation
            deleteConversation(id);
        };

        listItem.appendChild(textSpan);
        listItem.appendChild(deleteButton);
        conversationList.appendChild(listItem);
    });
}

async function sendMessage() {
    const userMessage = messageInput.value.trim();
    if (!userMessage) return; // Don't send empty messages

    if (!currentConversationId) {
        // If no current conversation, create a new one
        await startNewConversation();
    }

    displayMessage(userMessage, 'user');
    messageInput.value = '';

    try {
        sendButton.disabled = true;
        displayMessage('Thinking...', 'bot');

        const response = await fetch('/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: 'default', conversationId: currentConversationId, message: userMessage }),
        });

        const data = await response.json();
        chatbox.lastChild.remove();

        if (data.response) {
            displayMessage(data.response, 'bot');
        } else {
            displayMessage('No response from the server.', 'bot');
        }
    } catch (error) {
        chatbox.lastChild.remove();
        console.error('Error sending message:', error);
        displayMessage('Error: Unable to reach the server.', 'bot');
    } finally {
        sendButton.disabled = false;
    }
}

async function startNewConversation() {
    const response = await fetch('/new-conversation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: 'default' }),
    });

    const data = await response.json();
    currentConversationId = data.conversationId;

    // Fetch the initial conversation history (with the starting message)
    await loadConversation(currentConversationId);
    updateConversationList(); // Refresh the conversation list
}

async function loadConversation(conversationId) {
    currentConversationId = conversationId;
    chatbox.innerHTML = ''; // Clear the chatbox

    try {
        const response = await fetch('/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: 'default', conversationId, message: null }),
        });

        const data = await response.json();

        if (data.history && data.history.length > 0) {
            data.history.forEach(({ role, content }) => {
                displayMessage(content, role === 'user' ? 'user' : 'bot');
            });
        } else {
            displayMessage('This conversation is empty.', 'bot');
        }
    } catch (error) {
        console.error('Error loading conversation:', error);
        displayMessage('Error: Unable to load conversation.', 'bot');
    }
}

async function initializeChat() {
    const response = await fetch('/get-conversations?userId=default');
    const data = await response.json();

    if (data.conversations.length === 0) {
        // If no conversations exist, start a new one
        await startNewConversation();
    } else {
        updateConversationList(); // Refresh the conversation list
    }
}

// Delete a conversation
async function deleteConversation(conversationId) {
    const response = await fetch('/delete-conversation', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: 'default', conversationId }),
    });

    const data = await response.json();
    if (data.success) {
        updateConversationList();
        if (currentConversationId === conversationId) {
            currentConversationId = null;
            chatbox.innerHTML = '';
        }
    } else {
        alert('Failed to delete the conversation.');
    }
}

// Initialize
document.getElementById('new-chat-button').onclick = startNewConversation;
updateConversationList();
messageInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') sendMessage();
});
