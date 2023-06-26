import { LightningElement, api, track } from 'lwc';

export default class EinsteinGPTChatMessage extends LightningElement {

    @track _message;
    wordCount = 0;
    typedAnswer = '';
    typing = true;
    @api
    get message() {
        return this._message;
    }
    set message(value) {
       this._message = value;
       if(value){
        this.type = value.type;
        if(this.type === 'answer' || this.type === 'unknown'){
            this.typeMessage(value.responseText);
        }
        console.log(JSON.stringify(value));
       }
    }

    typeMessage(value) {
        let speed = 15;
        let words = value.split(' ');
        if (this.wordCount < words.length) {
          // eslint-disable-next-line @lwc/lwc/no-async-operation
          setTimeout(() => {
            this.typedAnswer += words[this.wordCount] + ' ';
            this.notifyParentTyping();
            this.wordCount++;
            // eslint-disable-next-line @lwc/lwc/no-async-operation
            setTimeout(() => {
              this.typeMessage(value);
            }, speed);
          }, 25);
        } else {
          this.wordCount = 0;
          this.typing = false;
          this.notifyParentTyping();
        }
      }

      notifyParentTyping(){
        let event = new CustomEvent('egpt_messagetyping', {
          detail: {
            value: true
          },
          bubbles: true,
          composed: true
        });
        this.dispatchEvent(event);    
      }

      handleAction(event){
        // Clone the message so we can see which action was pressed
        let messageClone = JSON.parse(JSON.stringify(this._message));

        // Create variable to store the selected action in and get the action ID so we can identify id
        let selectedAction;
        let actionId = event.currentTarget.dataset.actionid;
        console.log('Selected action is: ' + actionId);

        // Go over all actions in a message and see which action has the same action ID as the one that got pressed, store that in selectedAction
        messageClone.actions.forEach((action) => {
          console.log('Current Action ID checking is: ' + action.Id);
          if(action.Id == actionId){
              action.Disabled__c= true;
              selectedAction = action.Name;
          }
        })
        this._message = messageClone;

        // Fire off custom event called egpt_messageaction that einsteinGPTChat can capture to do a certain action
        let customEvent = new CustomEvent("egpt_messageaction", {
          detail: {
            value: selectedAction
          },
          bubbles: true,
          composed: true
        });
        this.dispatchEvent(customEvent);
    }    

    get showQuestion(){
        return this.type === 'question';
    }

    get showAnswer(){
        return this.type === 'answer' || this.type === 'unknown';
    }

    renderedCallback(){
      this.notifyParentTyping();
    }
  
}