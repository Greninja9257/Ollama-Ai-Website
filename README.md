# Ollama Ai Website

This project is a chat-based application that leverages a backend powered by Node.js and Express, with a front-end interface for interactive chat sessions. It integrates Ollama's `llama3.2` AI model for conversation generation.

## Features

- **Chat Interface**: A responsive front-end chat interface for users.
- **Conversation Management**:
  - Start new conversations.
  - Retrieve conversation history.
  - Delete specific conversations.
- **Backend Integration**:
  - API for managing conversations.
  - Interfacing with the `llama3.2` model for AI-generated responses.

## Project Structure

- **`server.js`**: Backend server managing API endpoints, user conversations, and integration with the `llama3.2` model.
- **`index.html`**: Front-end HTML file providing the user interface.
- **`script.js`**: JavaScript file handling the chat interface's logic, API calls, and conversation updates.
- **`package.json`**: Node.js dependencies and project metadata.

## Prerequisites

- Node.js installed on your system.
- Ollama installed and configured to use `llama3.2`.

## Installation

1. Clone the repository:
   ```
   git clone https://github.com/Greninja9257/Ollama-Ai-Website
   cd Ollama-Ai-Website
   ```
Install dependencies:

```
npm install
```
Start the server:

```
npm start
```
Open the application in your browser:

```
http://localhost:3000
```
Usage
Open the application in a web browser.
Start a new conversation or select an existing one from the sidebar.
Type your message in the input box and hit "Send".
View AI-generated responses in the chat area.
API Endpoints
POST /new-conversation: Start a new conversation.
GET /get-conversations: Retrieve a list of all conversations.
DELETE /delete-conversation: Delete a specific conversation.
POST /chat: Send a message and receive AI-generated responses.
Development
To modify the front-end, edit the index.html and script.js files.
To extend backend functionality, modify server.js.
License
This project is licensed under the Apache License. See LICENSE for more details.
