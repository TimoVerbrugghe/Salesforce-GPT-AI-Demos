import { LightningElement, track, api } from "lwc";;
import getUserDetails from "@salesforce/apex/EinsteinGPTActions.getUserDetails";
import getGPTChatResponse from "@salesforce/apex/OpenAI.getGPTChatResponse";
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class EinsteinGPTChat extends LightningElement {
  // ****** Props ******

  // State
  chatState = "empty"; // empty | active
  loading = false;

  // User Data
  user;

  // Data
  responses;

  @track messages = [];
  @track chatHistory = [];
  @api recordId;

  @api customContext;
  
  // ****** Starting State ******

  connectedCallback() {
    this.getUser();
    this.addEventListeners();
    console.log(this.recordId);
  }

  getUser() {
    getUserDetails()
      .then((result) => {
        this.user = result;
      })
      .catch((error) => {
        console.log("Error: ", error);
      });
  }

  addEventListeners() {
    window.addEventListener("egpt_messagetyping", this.handleMessageTyping, false);
  }

  // ****** Event Handling ******

  handleMessageTyping = () => {
    // eslint-disable-next-line @lwc/lwc/no-async-operation
    setTimeout(() => {
      this.scrollToBottom();
    }, 50);
  };

  // ****** Chat Handling ******

  // When the users send a question
  handleInputCommit(event) {
    const question = event.target.value;

    // Display the question in the chat window with user picture
    let message = this.configureMessage(this.user.SmallPhotoUrl, question, null, "", "question");
    this.messages.push(message);
    event.target.value = "";
    this.chatState = "active";
    this.scrollToBottom();

    // Then get the answer to the question
    this.getAnswer(question);
  }

  // Getting the answer from OpenAI and displaying that answer in the chatwindow
  getAnswer(question) {
    this.loading = true;
    this.scrollToBottom();
    console.log('searching for answer');

    let finalQuestion = question;

    // If this is the first time we're sending a message in the chat history, add the custom context (if it isn't empty)
    if (this.customContext && this.chatHistory.length === 0) {
      finalQuestion = this.customContext + finalQuestion;
    }

    console.log(finalQuestion);

    this.getEinsteinGPTResponse(finalQuestion);  
    }

  configureMessage(avatar, question, actions, responseText, type) {
    let message = {
      avatar: avatar,
      question: question,
      actions: actions,
      responseText: responseText,
      type: type
    };
    return message;
  }

  scrollToBottom() {
    // eslint-disable-next-line @lwc/lwc/no-async-operation
    setTimeout(() => {
      const el = this.template.querySelector(".scroller");
      el.scrollTop = el.scrollHeight;
    });
  }

  getEinsteinGPTResponse(question) {

    // Add question to the chathistory
    this.chatHistory.push(question);

    getGPTChatResponse({ chatHistory: this.chatHistory })
    .then((response) => {
      this.chatHistory.push(response);
      console.log(this.chatHistory);
      this.showResponse(response);
      }
    )
    .catch((error) => {
      this.showError(error);
    });      
  }

  showError(error) {
    let message;
    message = this.configureMessage(
      this.user.SmallPhotoUrl,
      "",
      null,
      "I couldn't find the answer to that question",
      "unknown"
    );
    this.error = error;
    console.log("error is " + error.message);
    this.postError(error.message);
    this.messages.push(message);
    this.scrollToBottom();
  }

  showResponse(response) {
    let message;
    // If OpenAI gave a response -> Configure the message with the response in it
    this.loading = false;
    console.log(response);
    console.log('putting response in chat');
    message = this.configureMessage(
      this.user.SmallPhotoUrl, 
      "", 
      null,
      response, 
      "answer");
    this.messages.push(message);
    this.scrollToBottom();
  }

  toggleSidebar() {
    this.showSidebar = !this.showSidebar;
  }

  get showEmptyChatState() {
    return this.chatState === "empty";
  }

  get sidebarIcon() {
    return this.showSidebar ? "utility:chevronright" : "utility:chevronleft";
  }

  disconnectedCallback() {
    window.removeEventListener("egpt_messagetyping", this.handleMessageTyping, false);
  }

  postError(error){
    const event = new ShowToastEvent({
      title: 'Error',
      message: error,
      variant: 'error',
  });
  this.dispatchEvent(event);
  }

}