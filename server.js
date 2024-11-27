const express = require('express');
const { spawn } = require('child_process');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const app = express();
app.use(express.json());

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, 'public')));

// Memory object to store user conversations
const userConversations = {};

app.post('/new-conversation', (req, res) => {
    const userId = req.body.userId || 'default';
    const conversationId = `conversation-${Date.now()}`;

    // Ensure userConversations is initialized for the user
    if (!userConversations[userId]) {
        userConversations[userId] = {};
    }

    // Add the new conversation with a starting message
    userConversations[userId][conversationId] = [
        { role: 'bot', content: 'Hi! I am a helpful AI assistant, how may I help you?' }
    ];

    res.json({ conversationId });
});

// Fetch all conversation IDs and their preview
app.get('/get-conversations', (req, res) => {
    const userId = req.query.userId || 'default';

    if (!userConversations[userId]) {
        return res.json({ conversations: [] });
    }

    const conversations = Object.keys(userConversations[userId]).map((id, index) => {
        return { id, preview: `Conversation ${index + 1}` };
    });

    res.json({ conversations });
});


// Delete a specific conversation
app.delete('/delete-conversation', (req, res) => {
    const userId = req.body.userId || 'default';
    const conversationId = req.body.conversationId;

    if (!userConversations[userId] || !userConversations[userId][conversationId]) {
        return res.status(404).json({ error: 'Conversation not found.' });
    }

    // Delete the conversation
    delete userConversations[userId][conversationId];
    res.json({ success: true });
});

app.post('/chat', (req, res) => {
    const userMessage = req.body.message;
    const userId = req.body.userId || 'default';
    const conversationId = req.body.conversationId;

    // Validate the request
    if (!conversationId) {
        return res.status(400).json({ error: 'Conversation ID is required.' });
    }

    // Ensure the userConversations structure is initialized
    if (!userConversations[userId]) {
        userConversations[userId] = {};
    }

    // Ensure the specific conversation is initialized
    if (!userConversations[userId][conversationId]) {
        userConversations[userId][conversationId] = [];
    }

    if (!userMessage) {
        // If no user message is provided, return the conversation history
        const conversationHistory = userConversations[userId][conversationId];
        return res.json({ history: conversationHistory });
    }

    console.log(`User Message: ${userMessage}`);

    // Append the user's message to the conversation
    userConversations[userId][conversationId].push({ role: 'user', content: userMessage });

    // Generate AI response
    const conversationHistory = userConversations[userId][conversationId]
        .map((entry) => `${entry.role}: ${entry.content}`)
        .join('\n');

    const process = spawn('ollama', ['run', 'llama3.2']);

    let output = '';

    process.stdout.on('data', (data) => {
        output += data.toString();
    });

    process.on('close', () => {
        const aiResponse = output.trim();
        console.log(`AI Response: ${aiResponse}`);

        // Append the AI response to the conversation
        userConversations[userId][conversationId].push({ role: 'ai', content: aiResponse });

        res.json({ response: aiResponse });
    });

    process.on('error', (err) => {
        console.error('Error spawning the AI process:', err);
        res.status(500).json({ error: 'Internal server error.' });
    });

    // Send the conversation history to the AI
    process.stdin.write(conversationHistory + '\n');
    process.stdin.end();
});

// Start the server
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
