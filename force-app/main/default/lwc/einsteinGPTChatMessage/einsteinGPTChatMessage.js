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