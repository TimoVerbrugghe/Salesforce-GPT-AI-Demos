import { LightningElement, track } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import getAzureCognitiveServicesAPIKey from '@salesforce/apex/APIKeyManagement.getAzureCognitiveServicesAPIKey';
import getOpenAIAPIKey from '@salesforce/apex/APIKeyManagement.getOpenAIAPIKey';
import setAPIKey from '@salesforce/apex/APIKeyManagement.setAPIKey';


export default class SetAPIKeys extends LightningElement {

    @track azureCognitiveServicesAPIKey;
    @track openAIAPIKey;

    connectedCallback() {
        getAzureCognitiveServicesAPIKey({})
        .then((result) => {
            this.azureCognitiveServicesAPIKey = result;
        })
        .catch((error) => {
            this.azureCognitiveServicesAPIKey = undefined;
            console.log(error);
        })

        getOpenAIAPIKey({})
        .then((result) => {
            this.openAIAPIKey = result;
        })
        .catch((error) => {
            this.openAIAPIKey = undefined;
            console.log(error);
        })
    }

    handleInputChange(event) {
        const { name, value } = event.target;
        if (name === "azureCognServices") {
            this.azureCognitiveServicesAPIKey = value;
        } else if (name === "openAI") {
            this.openAIAPIKey = value;
        }
    }

    handleSetAPIKeys() {
        const promises = [];
        if (this.azureCognitiveServicesAPIKey) {
            promises.push(setAPIKey({ service: "azureCognServices", key: this.azureCognitiveServicesAPIKey }));
        }

        if (this.openAIAPIKey) {
            promises.push(setAPIKey({ service: "OpenAI", key: this.openAIAPIKey }));
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