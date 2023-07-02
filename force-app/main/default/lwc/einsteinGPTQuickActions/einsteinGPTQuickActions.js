import { LightningElement, api, wire } from "lwc";
import getGPTResponse from '@salesforce/apex/OpenAI.getGPTResponse';
import getRecordDetails from "@salesforce/apex/EinsteinGPTActions.getRecordDetails";
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class EinsteinGPTQuickActions extends LightningElement {
  containerHeight = 245;
  currentMessage;
  wordCount = 0;
  messageInt = 1;
  showSources = false;
  suggestedMessage = "";
  sources;
  recordDetails;
  error;

  thinking = false;
  firstButtonThinking = false;
  secondButtonThinking = false;
  thirdButtonThinking = false;

  @api recordId;
  @api firstButtonInput;
  @api secondButtonInput;
  @api thirdButtonInput;

  @api firstButtonText;
  @api secondButtonText;
  @api thirdButtonText;

  @api enableFirstButton;
  @api enableSecondButton;
  @api enableThirdButton;

  @api firstButtonSources;
  @api secondButtonSources;
  @api thirdButtonSources;

  @api enableRecordDetails;
  @api title;
  @api enableSummarizeChatButton;

  @wire(getRecordDetails, { recordId : '$recordId' })
  recordDetails({ data, error }) {
    if (data) {
        this.recordDetails = data;
        this.error = undefined;
    } else if (error) {
        console.log(error);
        this.error = error;
        this.contacts = undefined;
    }
  }

  connectedCallback() {
  }

  // Button Actions //

  getThirdButtonResponse(event) {
    this.resetMessage();

    this.thirdButtonThinking = true;
    this.thinking = true;

    this.sources = this.formatSources(this.thirdButtonSources);
    
    this.getEinsteinGPTResponse(this.thirdButtonInput);

  }

  getSecondButtonResponse(event) {
    this.resetMessage();
    
    this.thinking = true
    this.secondButtonThinking = true;

    this.sources = this.formatSources(this.secondButtonSources);

    this.getEinsteinGPTResponse(this.secondButtonInput);
  
  }

  getFirstButtonResponse(event) {
    this.resetMessage();

    this.thinking = true;
    this.firstButtonThinking = true;
    
    this.sources = this.formatSources(this.firstButtonSources);
    console.log(this.sources);
    
    this.getEinsteinGPTResponse(this.firstButtonInput);
  }

  formatSources(sourceString) {
    // Sources have to have something in it, so if user did not define them, we will define it for them
    if (typeof sourceString === 'undefined' || typeof sourceString === null) {
      sourceString = "Salesforce, Data Cloud";
    }

    const sources = sourceString.split(", ");
    const formattedSources = sources.map(source => ({ Name: source }));
    return formattedSources;
  }

  // Back-end actions //

  getEinsteinGPTResponse(question) {
    let finalQuestion;

    if (this.enableRecordDetails) {
      const context = "Additionally, the user that has asked the question is looking at a specific Salesforce record. The type of record the user is currently looking at is " + this.objectApiName + ". You will find a complete summary of this record below in JSON format. Don't mention the term JSON in any way to the user. Only use what is below as additional information where you can base your answer on. If you use the information below in your answer, try to explain to the user exactly which information you used." + this.recordDetails;
      finalQuestion = question + context;
    } else {
      finalQuestion = question;
    };

    console.log(finalQuestion);

    getGPTResponse({ openAIcommand: finalQuestion })
      .then((result) => {
        this.showResponse(result);
        }
      )
      .catch((error) => {
        this.error = error;
        console.log("error is " + error.message);
        this.postError(error.message);
        this.resetMessage();
      });
  }

  showResponse(response) {
    // type out the response word by word
    this.typing = true;
    let speed = 15;
    let words = response.split(" ");

    // If there is still text that needs to be displayed
    if (this.wordCount < words.length) {
      // eslint-disable-next-line @lwc/lwc/no-async-operation
      setTimeout(() => {
        this.suggestedMessage += words[this.wordCount] + " ";
        this.wordCount++;
        // eslint-disable-next-line @lwc/lwc/no-async-operation
        setTimeout(() => {
          this.showResponse(response);
        }, speed);
      }, 25);

    // If the full answer is now displayed
    } else {
      this.typing = false;
      this.showSources = true;
      this.resetThinking();
      this.wordCount = 0;
    }

  }

  postError(error){
    const event = new ShowToastEvent({
      title: 'Error',
      message: error,
      variant: 'error',
  });
  this.dispatchEvent(event);
  }

  resetThinking() {
    this.thinking = false;
    this.firstButtonThinking = false;
    this.secondButtonThinking = false;
    this.thirdButtonThinking = false;
  }

  resetMessage() {
    this.currentMessage = "";
    this.suggestedMessage = "";
    this.showSources = false;
    this.resetThinking();
  }

  get containerStyle() {
    return `min-height:${this.containerHeight}px;`;
  }

  get containerClass() {
    return "slds-grid slds-wrap slds-align_absolute-center";
  }

  get messageStyle() {
    return this.thinking && !this.typing ? "text-weak" : "";
  }

  get messageContainer() {
    return this.suggestedMessage === "" ? "chat-message-container" : "chat-message-container";
  }

  get showRecomendation() {
    return true;
  }

}