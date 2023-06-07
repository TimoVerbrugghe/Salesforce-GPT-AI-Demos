import { LightningElement, api, track } from 'lwc';

export default class egptBotMessage extends LightningElement {

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
        let messageClone = JSON.parse(JSON.stringify(this._message));
        let selectedAction;
        let actionType = event.currentTarget.dataset.type;
        if(actionType === 'card-action'){
          let cardId = event.currentTarget.dataset.cardid;
          let actionId = event.currentTarget.dataset.actionid;
          messageClone.response.Cards.forEach((card) => {
            if(card.Id === cardId){
                card.Actions.forEach((action) => {
                  if(action.Id === actionId){
                    action.Disabled__c= true;
                    selectedAction = action;    
                  }
                })
            }
          })
        } else {
          let actionId = event.currentTarget.dataset.actionid;
          messageClone.response.Actions.forEach((action) => {
            if(action.Id === actionId){
                action.Disabled__c= true;
                selectedAction = action;
            }
        })
        }
        this._message = messageClone;
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

    get unknown(){
        return this.type === 'unknown';
    }

    renderedCallback(){
      this.notifyParentTyping();
    }
  
}