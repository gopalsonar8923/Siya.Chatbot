const chatBody = document.querySelector(".chat-body");
const messageInput = document.querySelector(".message-input");
const sendMessageButton = document.querySelector("#send-message");
const fileInput = document.querySelector("#file-input");
const fileUploadWrapper = document.querySelector(".file-upload-wrapper");
const fileCancleButton = document.querySelector("#file-cancle");
const chatbotToggler = document.querySelector("#chatbot-toggler");
const closeChatbot = document.querySelector("#close-chatbot");



const API_KEY="Enter_your_Api_key";
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;

const userData = {
    message: null,
    file: {
        data: null,
        mime_type: null
    }
}

// Create message element with dynamic classes and return it
const createMessageElement = (content, ...classes) => {
    const div = document.createElement("div");
    div.classList.add("message", ...classes);
    div.innerHTML = content;
    return div;
};

// Generate bot response using API key 
const generateBotResponse = async (incomingMessageDiv) => {
    const MessageElement = incomingMessageDiv.querySelector(".message-text")
    const requestOptions = {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            contents: [{
                parts: [{ text: userData.message }, ...(userData.file.data ?[{inline_data: userData.file}]: [])]
            }]
        })
    }

    try {
        const response = await fetch(API_URL, requestOptions);
        const data = await response.json();
        if (!response.ok) throw new Error(data.error.message);

        const apiResponseText = data.candidates[0].content.parts[0].text.replace(/\*\*(.*?)\*\*/g,"$1").trim();
        MessageElement.innerText = apiResponseText;
    } catch (error) {
        console.log(error);
        MessageElement.innerText = error.message;
        MessageElement.style.color = "#ff0000";

    }finally{
        userData.file = {};
        incomingMessageDiv.classList.remove("thinking");
        chatBody.scrollTo({top: chatBody.scrollHeight, behavior:"smooth"});
    }
};

    const handleOutgoingMessage = (e) => {
    e.preventDefault();
    userData.message = messageInput.value.trim();
    messageInput.value = "";
    fileUploadWrapper.classList.remove("file-uploaded");

    // Create and display user message
    const messageContent = `<div class="message-text"></div>
    
                            ${userData.file.data ? `<img src="data:${userData.file.mime_type};base64,${userData.file.data}"class="attachment" />` : ""}`;
    
                        
   
   
    const outgoingMessageDiv = createMessageElement(messageContent, "user-message");
    outgoingMessageDiv.querySelector(".message-text").textContent = userData.message;
    chatBody.appendChild(outgoingMessageDiv);
    chatBody.scrollTo({top: chatBody.scrollHeight, behavior:"smooth"});

    // Simulate the bot
    setTimeout(() => {
        const messageContent = ` <svg class="" xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 1024 1024">
                    <path d="M738.3 287.6H285.7c-59 0-106.8 47.8-106.8 106.8v303.1c0 59 47.8 106.8 106.8 106.8h81.5v111.1c0 .7.8 1.1 1.4.7l166.9-110.6 41.8-.8h117.4l43.6-.4c59 0 106.8-47.8 106.8-106.8V394.5c0-59-47.8-106.9-106.8-106.9z"></path>
                </svg>
                <div class="message-text">
                    <div class="thinking-indicator">
                        <div class="dot"></div>
                        <div class="dot"></div>
                        <div class="dot"></div>
                    </div>
                </div>`;

        const incomingMessageDiv = createMessageElement(messageContent, "bot-message", "thinking");
        chatBody.appendChild(incomingMessageDiv);
        chatBody.scrollTo({top: chatBody.scrollHeight, behavior:"smooth"});
        generateBotResponse(incomingMessageDiv);
    }, 600);
};

// Handle Enter key press for sending messages
messageInput.addEventListener("keydown", (e) => {
    const userMessage = e.target.value.trim();
    if (e.key === "Enter" && userMessage) {
        handleOutgoingMessage(e);
    }
});
//handle 
fileInput.addEventListener("change", () => {
    const file = fileInput.files[0];
    if(!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
        fileUploadWrapper.querySelector("img").src = e.target.result;
        fileUploadWrapper.classList.add("file-uploaded");
        const base64string = e.target.result.split(",")[1];
        //store file data int he userData
        userData.file = {
            data: base64string,
            mime_type: file.type
        }

        fileInput.value = "";
    }

    reader.readAsDataURL(file);
})
fileCancleButton.style.display = "none"; // Ensure the cancel button is hidden initially

fileInput.addEventListener("change", () => {
    const file = fileInput.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
        // Check if the file is an image
        if (file.type.startsWith("image/")) {
            // Replace attach button content with image preview
            fileUploadWrapper.innerHTML = `<img src="${e.target.result}" class="file-preview" alt="File Preview" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;">`;
        } else {
            // Replace attach button content with file name for non-image files
            fileUploadWrapper.innerHTML = `<span class="file-preview-text" style="font-size: 0.9rem;">${file.name}</span>`;
        }

        // Append the cancel button but keep it hidden
        fileUploadWrapper.appendChild(fileCancleButton);
        fileCancleButton.style.display = "block"; // Show the cancel button
        const base64string = e.target.result.split(",")[1];

        // Store file data
        userData.file = {
            data: base64string,
            mime_type: file.type,
        };

        fileInput.value = ""; // Clear the input field
    };

    reader.readAsDataURL(file);
});
//cancle file upload
fileCancleButton.addEventListener("click", () => {
    userData.file = {};
    fileUploadWrapper.classList.remove("file-uploaded");
});
//intialize emoji picker
const picker = new EmojiMart.Picker({
    theme: "light",
    skinTonePosition: "none",
    previewPosition: "none",
    onEmojiSelect: (emoji) => {
        const {selectionStart: start, selectionEnd: end} =messageInput;
        messageInput.setRangeText(emoji.native, start, end, "end");
        messageInput.focus();
    },
    onClickOutside: (e) => {
        if(e.target.id === "emoji-picker"){
            document.body.classList.toggle("show-emoji-picker");
        }else{
            document.body.classList.remove("show-emoji-picker");
        }
    }
});

document.querySelector(".chat-form").appendChild(picker);

sendMessageButton.addEventListener("click", (e) => handleOutgoingMessage(e));
document.querySelector("#file-upload").addEventListener("click", () => fileInput.click());
chatbotToggler.addEventListener("click", () => document.body.classList.toggle("show-chatbot"));
closeChatbot.addEventListener("click",() => document.body.classList.remove("show-chatbot") );
