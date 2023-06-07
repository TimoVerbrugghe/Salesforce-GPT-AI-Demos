import { LightningElement, wire, track } from "lwc";;
import getUserDetails from "@salesforce/apex/EGPT_SalesController.getUserDetails";
import getResponse from "@salesforce/apex/OpenAIController.getResponse";

export default class EgptSidebar extends LightningElement {
  // ****** Props ******

  // State
  pannelState = "empty"; // empty | active
  loading = true;

  // Config
  config;
  user;

  // Data
  responses;

  @track messages = [];
  description;
  emailBody;

  // ****** Starting State ******

  connectedCallback() {
    this.getUser();
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
    window.addEventListener("egpt_togglepannel", this.openSidebar, false);
    window.addEventListener("egpt_messageaction", this.handleMessageAction, false);
    window.addEventListener("egpt_messagetyping", this.handleMessageTyping, false);
  }

  // ****** Event Handling ******

  openSidebar = () => {
    this.toggleSidebar();
  };

  handleMessageTyping = () => {
    // eslint-disable-next-line @lwc/lwc/no-async-operation
    setTimeout(() => {
      this.scrollToBottom();
    }, 50);
  };

  // ****** Message Handling ******

  handleInputCommit(event) {
    const question = event.target.value;
    let message = this.configureMessage(this.user.SmallPhotoUrl, question, null, "", "question");
    this.messages.push(message);
    event.target.value = "";
    this.pannelState = "active";
    this.scrollToBottom();
    this.getAnswer(question);
  }

  getAnswer(question) {
    this.loading = true;
    this.scrollToBottom();
    const response = this.responses.find((item) => question.toLowerCase().includes(item.Question__c.toLowerCase()));
    let wait = response?.ResponseDelay__c >= 1 ? response.ResponseDelay__c : 3000;
    // eslint-disable-next-line @lwc/lwc/no-async-operation
    setTimeout(() => {
      this.loading = false;
      let message;
      if (response) {
        message = this.configureMessage(this.user.SmallPhotoUrl, "", response, response.Answer__c, "answer");
        if (response.ChangeInteractivePageState__c) {
          let pageReference = this.constructPageReference(
            'Record Page',
            response.TargetRecordId__c,
            response.TargetSObjectType__c,
            '',
            ''
          );
          this.publishPageReference(pageReference);
          }
        
        this.messages.push(message);
      } else {
        if (this.config.SalesUseOpenAI__c) {
          this.getOpenAPIResponse(question);
          wait = wait + 5000;
        } else {
          message = this.configureMessage(
            this.user.SmallPhotoUrl,
            "",
            null,
            this.config.AssistantUnknownAnswerResponse__c,
            "unknown"
          );
          this.messages.push(message);
        }
      }
      this.scrollToBottom();
    }, wait);
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
    // eslint-disable-next-line @lwc/lwc/no-async-operation
    setTimeout(() => {
      const el = this.template.querySelector(".scroller");
      el.scrollTop = el.scrollHeight;
    });
  }

  toggleSidebar() {
    this.showSidebar = !this.showSidebar;
  }

  get showEmptyPannelState() {
    return this.pannelState === "empty";
  }

  get sidebarIcon() {
    return this.showSidebar ? "utility:chevronright" : "utility:chevronleft";
  }

  disconnectedCallback() {
    window.removeEventListener("openeinstein", this.handleMessage, false);
    window.removeEventListener("messageaction", this.handleMessage, false);
  }

  getOpenAPIResponse(question) {
    getResponse({ searchString: question })
      .then((result) => {
        let response = JSON.parse(JSON.stringify(JSON.parse(result)));
        if (response.error) {
          this.responseData = response.error.message;
        } else if (response.choices[0].text) {
          this.responseData = response.choices[0].text;
          this.responseData = this.responseData.replace(/\n/g, "<br />");
          let tempScriptData = "";
          tempScriptData = response.choices[0].text.includes("<script>")
            ? "JS File: " + response.choices[0].text.split("<script>")[1]
            : "";
          tempScriptData = tempScriptData.replace(/\n/g, "<br />");
          this.responseData = this.responseData + tempScriptData;
          this.responseData = this.responseData.includes("XML File:")
            ? this.responseData.split("XML File:")[0]
            : this.responseData;
          this.responseData.trim();
        }
        let message = this.configureMessage("", "", null, this.responseData.slice(12), "answer");
        this.messages.push(message);
        this.loading = false;
      })
      .catch((error) => {
        this.loading = false;
        console.log("error is " + error);
      });
  }
}