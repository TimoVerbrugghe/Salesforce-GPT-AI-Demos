import { LightningElement } from 'lwc';
import azureGetImageDescription from '@salesforce/apex/AzureCognitiveServices.azureGetImageDescription';
import getGPTResponse from '@salesforce/apex/OpenAI.getGPTResponse';
import serializeAzureResponse from '@salesforce/apex/AzureCognitiveServices.serializeAzureResponse';

export default class AzureAnalyzeImage extends LightningElement {
    get acceptedFormats() {
        return ['.jpg', '.jpeg', '.gif', '.bmp', '.png'];
    }

    result;
    resultGPT;
    showResult = false;
    showLoadingScreen = false;

    handleUploadFinished(event) {
        this.showLoadingScreen = true;
        // Get the list of uploaded files
        const uploadedFiles = event.detail.files;
        const uploadedFileDocumentId = uploadedFiles[0].documentId;

        azureGetImageDescription({contentDocumentId : uploadedFileDocumentId})
            .then((result) => {
                this.result = result;
                this.transformAzureResponse(result);                
            })
            .catch((error) => {
                this.result = undefined;
                this.showLoadingScreen = false;
                console.log(error);
            })
    }

    transformAzureResponse(input) {
        const azureResponse = input;

        serializeAzureResponse({input : azureResponse})
            .then((azureResponseSerialized) => {
                console.log(azureResponseSerialized);
                this.getGPTresult(azureResponseSerialized);
            })
            .catch((error) => {
                console.log(error);
            })
    }

    getGPTresult(gptinput) {

        const gptInputModified = 'Do as if you are a generative AI assistant that is trying to help a user to describe an image. The user has sent the image to an AI model that can analyze it fully and has now given back in JSON what the image looks like. Give a description of the image based on the information below in 5 sentences or less. This description should not contain any numbers and should be easily readable by a business person.' + gptinput; 

        console.log(gptInputModified);
        console.log('Will now send the GPT command');

        getGPTResponse({openAIcommand : gptInputModified})
            .then((result) => {
                this.resultGPT = result;
                this.showLoadingScreen = false;
                this.showResult = true;
                this.error = undefined;
            })
            .catch((error) => {
                this.result = undefined;
                this.showLoadingScreen = false;
                console.log(error);
            })
    }

}