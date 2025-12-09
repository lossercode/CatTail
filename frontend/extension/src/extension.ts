// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	console.log('cat-tail extension is now active!');

	// 注册 WebView View Provider
	const provider = new ChatViewProvider(context.extensionUri);
	
	context.subscriptions.push(
		vscode.window.registerWebviewViewProvider(
			'cat-tail.chatView',
			provider,
			{
				webviewOptions: {
					retainContextWhenHidden: true
				}
			}
		)
	);

	// 注册命令，允许用户手动打开聊天面板
	const disposable = vscode.commands.registerCommand('cat-tail.openChat', () => {
		vscode.commands.executeCommand('workbench.view.extension.cat-tail-sidebar');
	});

	context.subscriptions.push(disposable);
}

// WebView View Provider 类
class ChatViewProvider implements vscode.WebviewViewProvider {
	private _view?: vscode.WebviewView;

	constructor(private readonly _extensionUri: vscode.Uri) {}

	public resolveWebviewView(
		webviewView: vscode.WebviewView,
		context: vscode.WebviewViewResolveContext,
		_token: vscode.CancellationToken
	) {
		this._view = webviewView;

		webviewView.webview.options = {
			enableScripts: true,
			localResourceRoots: [this._extensionUri]
		};

		webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);

		// 处理来自 WebView 的消息
		webviewView.webview.onDidReceiveMessage(
			message => {
				switch (message.type) {
					case 'sendMessage':
						const userMessage = message.text;
						console.log('User message:', userMessage);
						
						// 模拟 AI 回复（这里可以接入真实的大模型 API）
						setTimeout(() => {
							if (this._view) {
								this._view.webview.postMessage({
									type: 'receiveMessage',
									text: `AI 回复: 你说了 "${userMessage}"`,
									isBot: true
								});
							}
						}, 500);
						break;
				}
			}
		);
	}

	private _getHtmlForWebview(webview: vscode.Webview) {
		return getWebviewContent();
	}
}

function getWebviewContent(): string {
	return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<title>AI Chat</title>
	<style>
		* {
			margin: 0;
			padding: 0;
			box-sizing: border-box;
		}
		
		body {
			font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
			background-color: var(--vscode-editor-background);
			color: var(--vscode-editor-foreground);
			height: 100vh;
			display: flex;
			flex-direction: column;
			overflow: hidden;
		}
		
		#chat-container {
			flex: 1;
			overflow-y: auto;
			padding: 20px;
			display: flex;
			flex-direction: column;
			gap: 12px;
		}
		
		.message {
			max-width: 85%;
			padding: 10px 12px;
			border-radius: 8px;
			word-wrap: break-word;
			word-break: break-word;
			animation: fadeIn 0.3s ease-in;
			font-size: 13px;
			line-height: 1.5;
		}
		
		@keyframes fadeIn {
			from {
				opacity: 0;
				transform: translateY(10px);
			}
			to {
				opacity: 1;
				transform: translateY(0);
			}
		}
		
		.message.user {
			align-self: flex-end;
			background-color: var(--vscode-button-background);
			color: var(--vscode-button-foreground);
		}
		
		.message.bot {
			align-self: flex-start;
			background-color: var(--vscode-input-background);
			border: 1px solid var(--vscode-input-border);
		}
		
		#input-container {
			padding: 12px;
			background-color: var(--vscode-editor-background);
			border-top: 1px solid var(--vscode-panel-border);
			display: flex;
			flex-direction: column;
			gap: 8px;
		}
		
		#message-input {
			width: 100%;
			padding: 8px 10px;
			background-color: var(--vscode-input-background);
			color: var(--vscode-input-foreground);
			border: 1px solid var(--vscode-input-border);
			border-radius: 4px;
			font-size: 13px;
			outline: none;
			font-family: inherit;
			resize: vertical;
			min-height: 36px;
		}
		
		#message-input:focus {
			border-color: var(--vscode-focusBorder);
		}
		
		#send-button {
			width: 100%;
			padding: 8px 16px;
			background-color: var(--vscode-button-background);
			color: var(--vscode-button-foreground);
			border: none;
			border-radius: 4px;
			cursor: pointer;
			font-size: 13px;
			font-weight: 500;
			transition: background-color 0.2s;
		}
		
		#send-button:hover {
			background-color: var(--vscode-button-hoverBackground);
		}
		
		#send-button:active {
			transform: scale(0.98);
		}
		
		#send-button:disabled {
			opacity: 0.5;
			cursor: not-allowed;
		}
		
		.welcome-message {
			text-align: center;
			padding: 30px 16px;
			color: var(--vscode-descriptionForeground);
		}
		
		.welcome-message h2 {
			margin-bottom: 8px;
			color: var(--vscode-editor-foreground);
			font-size: 16px;
		}
		
		.welcome-message p {
			font-size: 12px;
		}
		
		/* 滚动条样式 */
		#chat-container::-webkit-scrollbar {
			width: 10px;
		}
		
		#chat-container::-webkit-scrollbar-track {
			background: var(--vscode-editor-background);
		}
		
		#chat-container::-webkit-scrollbar-thumb {
			background: var(--vscode-scrollbarSlider-background);
			border-radius: 5px;
		}
		
		#chat-container::-webkit-scrollbar-thumb:hover {
			background: var(--vscode-scrollbarSlider-hoverBackground);
		}
	</style>
</head>
<body>
	<div id="chat-container">
		<div class="welcome-message">
			<h2>🤖 AI 聊天助手</h2>
			<p>在下方输入框中输入消息开始对话</p>
		</div>
	</div>
	
	<div id="input-container">
		<textarea 
			id="message-input" 
			placeholder="输入消息... (按 Enter 发送)"
			rows="2"
		></textarea>
		<button id="send-button">发送</button>
	</div>

	<script>
		const vscode = acquireVsCodeApi();
		const chatContainer = document.getElementById('chat-container');
		const messageInput = document.getElementById('message-input');
		const sendButton = document.getElementById('send-button');
		
		// 发送消息函数
		function sendMessage() {
			const text = messageInput.value.trim();
			if (!text) return;
			
			// 移除欢迎消息
			const welcomeMsg = document.querySelector('.welcome-message');
			if (welcomeMsg) {
				welcomeMsg.remove();
			}
			
			// 显示用户消息
			addMessage(text, false);
			
			// 发送消息到扩展
			vscode.postMessage({
				type: 'sendMessage',
				text: text
			});
			
			// 清空输入框
			messageInput.value = '';
			messageInput.focus();
		}
		
		// 添加消息到聊天容器
		function addMessage(text, isBot) {
			const messageDiv = document.createElement('div');
			messageDiv.className = 'message ' + (isBot ? 'bot' : 'user');
			messageDiv.textContent = text;
			chatContainer.appendChild(messageDiv);
			
			// 滚动到底部
			chatContainer.scrollTop = chatContainer.scrollHeight;
		}
		
		// 发送按钮点击事件
		sendButton.addEventListener('click', sendMessage);
		
		// 输入框回车事件
		messageInput.addEventListener('keypress', (e) => {
			if (e.key === 'Enter' && !e.shiftKey) {
				e.preventDefault();
				sendMessage();
			}
		});
		
		// 接收来自扩展的消息
		window.addEventListener('message', event => {
			const message = event.data;
			switch (message.type) {
				case 'receiveMessage':
					addMessage(message.text, message.isBot);
					break;
			}
		});
		
		// 自动聚焦输入框
		messageInput.focus();
	</script>
</body>
</html>`;
}

// This method is called when your extension is deactivated
export function deactivate() {}
