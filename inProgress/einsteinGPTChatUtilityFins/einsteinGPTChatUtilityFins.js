import { LightningElement, track, api } from "lwc";
import { NavigationMixin } from 'lightning/navigation';
import { updateRecord } from 'lightning/uiRecordApi';
import getUserDetails from "@salesforce/apex/EinsteinGPTActions.getUserDetails";
import getGPTChatResponse from "@salesforce/apex/OpenAI.getGPTChatResponse";
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

import RISK_ASSESSMENT_COMPLETED from '@salesforce/schema/FinServ__FinancialAccount__c.Risk_Assessment_Completed__c';
import RISK_ASSESSMENT_DATE from '@salesforce/schema/FinServ__FinancialAccount__c.Risk_Assessment_Date__c';
import RISK_ASSESSMENT_NOTES from '@salesforce/schema/FinServ__FinancialAccount__c.Risk_Assessment_Notes__c';
import RISK_ASSESSMENT_CLASS from '@salesforce/schema/FinServ__FinancialAccount__c.Risk_Assessment_Class__c';

export default class EinsteinGPTChat extends NavigationMixin(LightningElement) {
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
  investmentRecordId = 'a4l06000000x30FAAQ';
  rachelRecordId = '0010600002ANMk1AAH';
  fundInsuranceRecordId = 'a4l06000000x30KAAQ';

  @api customContext;

  currentId = 0;
  demoMessages = [
    {
      id : 1,
      message: 'I cannot find information about risk experience regarding investments, but this customer does have a risk-class assigned to her, based on her fund-linked pension insurance opened in 2019. The risk class then assigned was 5 on a scale of 7. You can view more information on the insurance below or take over the same risk appetite for the investment you are setting up right now.',
      showActions: true,
      actions: [
        {
          Id : 1,
          Name : 'Show Insurance Info',
          IconName__c : 'utility:preview',
          Variant__c : 'neutral',
          Disabled__c : false
        },
        {
          Id : 2,
          Name : 'Take Over Risk Appetite',
          IconName__c : 'utility:add',
          Variant__c : 'Brand',
          Disabled__c : false
        },

      ]
    },
    {
      id: 2,
      message: 'We have received information from Rachel Morris on the following: income, expenses, assets & liabilities. This was given by her on 12 July 2018 when Rachel signed a private loan contract. All information can be viewed on her Customer Overview page, in the tab Financial Accounts.',
      showActions: true,
      actions: [
        {
          Id : 1,
          Name : 'Show Customer Overview',
          IconName__c : 'utility:preview',
          Variant__c : 'neutral',
          Disabled__c : false
        }
      ]
    },
    {
      id: 3,
      message: 'Happy to help, Paul! As an additional next best action, since this customer is currently in a low-risk state, but with a higher risk class, this could be an opportunity to talk to the customer about other opportunity investments, such as ETFs.',
      showActions: false,
      actions: []
    },
  ]
  
  // ****** Starting State ******

  connectedCallback() {
    this.getUser();
    this.addEventListeners();
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
    window.addEventListener("egpt_messageaction", this.handleMessageAction, false);
  }

  // ****** Event Handling ******

  handleMessageAction = (event) => {
    if (event.detail.value == 'Show Insurance Info') {
      console.log("Opening Insurance Record");
      this.openInsuranceRecord();
    }

    if (event.detail.value == 'Show Customer Overview') {
      console.log("Opening Rachel's Record");
      this.openRachelRecord();
    }

    if (event.detail.value == 'Take Over Risk Appetite') {
      console.log('Taking over risk class selected');
      this.changeRiskClass();
    }
  }

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
        const finalQuestion = this.demoMessages[this.currentId].message;


        setTimeout(() => {
          this.showResponse(finalQuestion);
        }, 1000);
        

                // this.loading = true;
        // this.scrollToBottom();
        // console.log('searching for answer');

        // let finalQuestion = question;

        // // If this is the first time we're sending a message in the chat history, add the custom context (if it isn't empty)
        // if (this.customContext && this.chatHistory.length() === 0) {
        //   finalQuestion = this.customContext + finalQuestion;
        // }

        // console.log(finalQuestion);

        // this.getEinsteinGPTResponse(finalQuestion);  
    }

  openRachelRecord() {
      this[NavigationMixin.Navigate]({
          type: 'standard__recordPage',
          attributes: {
              recordId: this.rachelRecordId,
              actionName: 'view'
          }
      });
  }

  openInsuranceRecord() {
      this[NavigationMixin.Navigate]({
          type: 'standard__recordPage',
          attributes: {
              recordId: this.fundInsuranceRecordId,
              actionName: 'view'
          }
      });
  }

  changeRiskClass() {
    const fields = {};
    fields.Id = this.investmentRecordId;
    fields[RISK_ASSESSMENT_COMPLETED.fieldApiName] = true;
    fields[RISK_ASSESSMENT_DATE.fieldApiName] = '2023-06-26';
    fields[RISK_ASSESSMENT_NOTES.fieldApiName] = 'Taken over from FLP-02489 - Fund-Linked Pension Insurance - Rachel Morris';
    fields[RISK_ASSESSMENT_CLASS.fieldApiName] = '5';

    const recordInput = { fields };
    updateRecord(recordInput)
        .then(() => {
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Success',
                    message: 'Risk Class Updated',
                    variant: 'success'
                })
            );
        })
        .catch(error => {
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Error updating record',
                    message: error.body.message,
                    variant: 'error'
                })
            );
        });
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
      "answer"
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

    if (this.demoMessages[this.currentId].showActions) {
      message = this.configureMessage(
        this.user.SmallPhotoUrl, 
        "", 
        this.demoMessages[this.currentId].actions,
        response, 
        "answer");
    } else {
      message = this.configureMessage(
        this.user.SmallPhotoUrl, 
        "", 
        null,
        response, 
        "answer");
    }
    this.messages.push(message);
    this.currentId = this.currentId + 1;
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
    window.removeEventListener("openeinstein", this.handleMessage, false);
    window.removeEventListener("messageaction", this.handleMessage, false);
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