import { LightningElement, track } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import getEinsteinGPTConfigManagement from '@salesforce/apex/EinsteinGPTConfigManagement.getEinsteinGPTStandardPrompt';
import setEinsteinGPTStandardCommand from '@salesforce/apex/EinsteinGPTConfigManagement.setEinsteinGPTStandardCommand';

export default class GptConfig extends LightningElement {
    @track egptStandardPrompt;

    connectedCallback() {
        getEinsteinGPTConfigManagement({})
        .then((result) => {
            this.egptStandardPrompt = result;
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
            promises.push(setEinsteinGPTStandardPrompt({ service: "azureCognServices", key: this.azureCognitiveServicesAPIKey }));
        }

        Promise.all(promises)
        .then(() => {
            this.showToast('Success', 'API Keys have been set successfully!', 'success');
        })
        .catch(error => {
            console.error('Error setting API Keys:', error);
            this.showToast('Error', 'An error occurred while setting API Keys.', 'error');
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