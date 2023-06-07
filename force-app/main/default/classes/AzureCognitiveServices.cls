public class AzureCognitiveServices {

    @AuraEnabled
    public static string azureGetImageDescription(Id contentDocumentId) {
            String endpoint = 'https://aidemossforg.cognitiveservices.azure.com';

            String key = APIKeyManagement.getAzureCognitiveServicesAPIKey();

            List<ContentVersion> contentVersions = [SELECT VersionData FROM ContentVersion WHERE ContentDocumentId = :contentDocumentId AND IsLatest = true LIMIT 1];
            Blob imageData = contentVersions[0].VersionData;

            String imageDescribeEndpoint = '/vision/v3.1/analyze?visualFeatures=Categories,Tags,Description,Color,ImageType,Objects,Brands';
            String finalEndpoint = endpoint + imageDescribeEndpoint;

            // Create request
            HttpRequest request = new HttpRequest();
            request.setEndpoint(finalEndpoint);
            request.setMethod('POST');
            request.setHeader('Ocp-Apim-Subscription-Key', key);
            request.setHeader('Content-Type', 'application/octet-stream');
            request.setBodyAsBlob(imageData);

            // Send request and get response back from Azure

            String azureResponseRaw = HTTPRequests.postRequest(request);

            // Return description
            return azureResponseRaw;  
    }

    @AuraEnabled
    public static string serializeAzureResponse(String input){
        try {
            String azureResponseSerialized = JSON.serialize(input);
            String azureResponse = azureResponseSerialized.substring(1, azureResponseSerialized.length() - 1);

            return azureResponse;

        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }

}