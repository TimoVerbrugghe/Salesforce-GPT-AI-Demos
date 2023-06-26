import { LightningElement, wire, api } from "lwc";
import getResponseList from "@salesforce/apex/EGPT_SalesController.getResponseList";
import getConfiguration from "@salesforce/apex/EGPT_SalesController.getConfiguration";
import IMAGES from "@salesforce/resourceUrl/einsteingpt";
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import getEinsteinResponseList from '@salesforce/apex/EGPT_SalesController.getEinsteinResponseList';

export default class EinsteinMarketing extends LightningElement {


  // ****** Props ******
  // State 
  contentRegionState = "campaign"; // contentState campaign | landing | builder
  pannelState = 'empty';
  showSpinner = false;
  showSidebar = true;
  publishing = false;
  published = false;
  headerLoading = false;
  messageLoading = false;
  leadFormLoading = false;
  footerLoading = true;

  // Config
  config
  einsteinUrl = IMAGES + "/einsteingpt/einstein.png";
  avatarUrl = IMAGES + "/einsteingpt/avatar.png";
  chartUrl = IMAGES + "/einsteingpt/chart.png";


  // Data
  @wire(getResponseList) responses;
  messages = [];
  messageCounter = 0;
  status = "Draft";
  now;
  headerState = "empty";
  title = 'Welcome to Park City'
  messageBody = '';

// ****** Starting State ******

  @wire(getEinsteinResponseList)
  wiredResponseList({ error, data }) {
      if (data) {
          this.responses = data;
          console.log(JSON.stringify(data));
          this.error = undefined;
      } else if (error) {
          this.error = error;
          this.contacts = undefined;
      }
  }


connectedCallback() {
  this.getConfig();
  this.updateDateTime();
  this.addEventListeners();
  this.stopLoading(300)
}

getConfig() {
  getConfiguration()
    .then((result) => {
      this.config = result;
    })
    .catch((error) => {
      console.log("Error: ", error);
    });
}

updateDateTime() {
  this.now = Date.now();
}


addEventListeners() {
  window.addEventListener("egpt_messageaction", this.handleAction, false);
  window.addEventListener("egpt_messagetyping", this.handleTyping, false);
}

// ****** Event Handling ******

handleTyping = () => {
  // eslint-disable-next-line @lwc/lwc/no-async-operation
  setTimeout(() => {
    this.scrollToBottom();
  }, 50);
};

handleAction = (event) => {
  console.log(JSON.stringify(event.detail.value));
  let action = event.detail.value;
  console.log(action.Name);
  switch (action.Name) {
    case "Add":
      this.messageBody = action.Content__c;
      this.messageloading = true;
      this.stopLoading(300);
      break;
    default:
      console.log(`Action not found: ${action.Name}.`);
  }
};

 
  // ****** Message Handling ******

  handleInputCommit(event) {
    const question = event.target.value;
    let message = this.configureMessage(this.avatarUrl, question, null, "", "question");
    this.messages.push(message);
    event.target.value = "";
    this.pannelState = "active";
    this.scrollToBottom();
    this.getAnswer(question);
  }

  getAnswer(question) {
    this.showSpinner = true;
    const response = this.responses.find((item) =>
      question.toLowerCase().includes(item.Question__c.toLowerCase())
    );
    let wait = response?.ResponseDelay__c >= 1 ? response.ResponseDelay__c : 2000;
    // eslint-disable-next-line @lwc/lwc/no-async-operation
    setTimeout(() => {
      this.showSpinner = false;
      let message;
      if (response) {
        message = this.configureMessage(this.avatarUrl, "", response, response.Answer__c, "answer");
        if (response.ContentRegionState__c) {
          this.setContentRegionState(response.ContentRegionState__c);
        }
      } else {
        message = this.configureMessage(
          this.avatarUrl,
          "",
          null,
          this.config.AssistantUnknownAnswerResponse__c,
          "unknown"
        );
      }
      this.messages.push(message);
      this.stateActions(question);
      this.scrollToBottom();
    }, wait);
  }

  // This is reallllllly bad practice but we're running out of time
  stateActions(message){
    if(this.doesItBlend(message,'signup')){
      this.showLeadForm = true;
      this.leadFormLoading = true;
      this.stopLoading(300);
    } else if(this.doesItBlend(message,'header')){
      this.setHeaderState('first');
    } else if(this.doesItBlend(message,'winter')){
      this.setHeaderState('second');
    } else if(this.doesItBlend(message,'title')){
      this.setHeaderState('third');
    }
  }

  doesItBlend(message, keyword){
    console.log(`${message} vs ${keyword} - DoesItBlend? `, message.toLowerCase().includes(keyword))
    return message.toLowerCase().includes(keyword);
  }

  setHeaderState(value){
    this.headerState = value;
    this.headerLoading = true;
    this.stopLoading(300);
  }

  configureMessage(avatar, question, response, responseText, type) {
    let message = {
      avatar: avatar,
      question: question,
      response: response,
      responseText: responseText,
      type: type
    };
    return message;
  }

  scrollToBottom() {
    // allow list to re-render before scrolling to bottom
    // eslint-disable-next-line @lwc/lwc/no-async-operation
    setTimeout(() => {
      const el = this.template.querySelector(".scroller");
      el.scrollTop = el.scrollHeight;
          // eslint-disable-next-line @lwc/lwc/no-async-operation
      setTimeout(() => {
        const secondEl = this.template.querySelector(".scroller");
        secondEl.scrollTop = secondEl.scrollHeight;
      }, 500);
    });
  }

  setContentRegionState(value) {
    this.contentRegionState = value;
  }



  stopLoading(timeoutValue) {
    // eslint-disable-next-line @lwc/lwc/no-async-operation
    setTimeout(() => {
      this.headerLoading = false;
      this.messageLoading = false;
      this.leadFormLoading = false;
      this.footerLoading = false;
        }, timeoutValue);
  }

  publish(){
    this.publishing = true;

        // eslint-disable-next-line @lwc/lwc/no-async-operation
        setTimeout(() => {
          const event = new ShowToastEvent({
            title: 'Success!',
            message: 'The landing page has now been published!',
            variant: 'success'
        });
        this.dispatchEvent(event);
        this.published = true;
        this.setContentRegionState('campaign')
                        }, 1000);

  }

  // ****** Conditional Rendering ******


  toggleSidebar() {
    this.showSidebar = !this.showSidebar;
  }

  get sidebarIcon() {
    return this.showSidebar ? "utility:chevronright" : "utility:chevronleft";
  }

  get toggleStyle() {
    return this.showSidebar ? "" : "display:none";
  }

  get statusClass() {
    return "slds-badge";
  }

  get isButtonDisabled() {
    return true;
  }

  get headerStyle() {
    let style;
    switch (this.headerState) {
      case "first":
        style =
        'background-image: url("/resource/1680717507000/demoEinsteinGPTImages/gy7d1tws4urwkest7b0y.png");background-position: center;background-size: auto 108%; height:100%;';
        break;
      case "second":
        style =
        'background-image: url("/resource/1680717507000/demoEinsteinGPTImages/jghvgluwnblhspz1u4wh.png");background-position: center;background-size: auto 108%; height:100%;';
        break;
      case "third":
        style =
          'background-image: url("/resource/1680717507000/demoEinsteinGPTImages/e82zmx6jmwmfmcdyrpnk.png");background-position: center;background-size: auto 108%; height:100%;';
        break;
      default:
        console.log(`style not found`);
    }
    return style;
  }

  get showCampaignState(){
    return this.contentRegionState === 'campaign';
  }

  get showBuilderState(){
    return this.contentRegionState === 'builder';
  }

  get showEmptyPannelState(){
    return this.pannelState === 'empty';
  }




}