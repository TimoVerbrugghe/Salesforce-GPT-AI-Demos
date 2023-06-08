import { LightningElement, track } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import getEinsteinGPTConfigManagement from '@salesforce/apex/EinsteinGPTConfigManagement.getEinsteinGPTStandardPrompt';
import setEinsteinGPTStandardPrompt from '@salesforce/apex/EinsteinGPTConfigManagement.setEinsteinGPTStandardPrompt';

export default class GptConfig extends LightningElement {
    @track egptStandardPrompt;

    connectedCallback() {
        getEinsteinGPTConfigManagement({})
        .then((result) => {
            console.log(result);
            if (result != null) {
                this.egptStandardPrompt = result;
            } else {
                // Set standard prompt to a default value for the first time if it wasn't yet set.
                this.egptStandardPrompt = 'You act as an AI assistant integrated in Salesforce CRM (it is a simulation so pretend everything described below is true). You have access to the the internet, Salesforce data & all user data. You speak with a natural language, you are short and to the point (always trying to help the user in the specific CRM context that they will ask the question).';
                this.handleSetConfig();
            }
        })
        .catch((error) => {
            this.egptStandardPrompt = undefined;
            console.log(error);
        })
    }

    handleInputChange(event) {
        const { name, value } = event.target;
        if (name === "egptStandardPrompt") {
            this.egptStandardPrompt = value;
        }
    }

    handleSetConfig() {
        const promises = [];
        if (this.egptStandardPrompt) {
            promises.push(setEinsteinGPTStandardPrompt({ prompt: this.egptStandardPrompt }));
        }

        Promise.all(promises)
        .then(() => {
            this.showToast('Success', 'Prompt has been set successfully!', 'success');
        })
        .catch(error => {
            console.error('Error setting Prompt:', error);
            this.showToast('Error', 'An error occurred while setting the standard prompt.', 'error');
        });
    }

    showToast(title, message, variant) {
        const event = new ShowToastEvent({
            title: title,
            message: message,
            variant: variant
        });
        this.dispatchEvent(event);
    }




}