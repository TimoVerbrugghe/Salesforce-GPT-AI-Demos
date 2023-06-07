import { LightningElement, api, wire } from "lwc";
import getGPTResponse from '@salesforce/apex/OpenAI.getGPTResponse';
import getRecordDetails from "@salesforce/apex/EinsteinGPTActions.getRecordDetails";
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class ServiceChatSuggestions extends LightningElement {
  thinking = false;
  summaryThinking = false;
  nbaThinking = false;
  repairInstructionsThinking = false;

  containerHeight = 245;
  currentMessage;
  wordCount = 0;
  messageInt = 1;
  showSources = false;
  suggestedMessage = "";
  sources;
  recordDetails;
  error;

  @api recordId;
  @api repairInstructionsResponse;
  @api summaryInput;
  @api nbaInput;
  @api firstButtonText;
  @api secondButtonText;
  @api thirdButtonText;

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

  endChat(wait) {
    // eslint-disable-next-line @lwc/lwc/no-async-operation
    setTimeout(() => {
      this.showSources = false;
    }, 700);
  }

  // Button Actions //

  getRepairInstructions(event) {
    this.resetMessage();

    this.repairInstructionsThinking = true;
    this.thinking = true;

    this.sources = [{ Name: "Einstein Knowledge" }, {Name: "Data Cloud"}];

    console.log(this.repairInstructionsResponse);
    
    this.getEinsteinGPTResponse(this.repairInstructionsResponse);

  }

  getSummary(event) {
    this.resetMessage();
    
    this.thinking = true
    this.summaryThinking = true;

    this.sources = [{ Name: "Sales Cloud" }, {Name: "Data Cloud"}];
    
    const question = this.summaryInput + this.recordDetails;

    this.getEinsteinGPTResponse(question);
  
  }

  getNextBestActions(event) {
    this.resetMessage();

    this.thinking = true;
    this.nbaThinking = true;
    
    this.sources = [{ Name: "Sales Cloud" }, {Name: "Data Cloud"}];
    
    const question = this.nbaInput + this.recordDetails;
    
    this.getEinsteinGPTResponse(question);
  }


  // Back-end actions //

  getEinsteinGPTResponse(question) {
    getGPTResponse({ openAIcommand: question })
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
    this.summaryThinking = false;
    this.nbaThinking = false;
    this.repairInstructionsThinking = false;
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