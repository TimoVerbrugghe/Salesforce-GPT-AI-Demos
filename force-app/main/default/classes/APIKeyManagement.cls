public class APIKeyManagement {

    @AuraEnabled
    public static string getAzureCognitiveServicesAPIKey() {
        return getAPIKey('azureCognServices');
    }

    @AuraEnabled
    public static string getOpenAIAPIKey() {
        return getAPIKey('OpenAI');
    }

    private static String getAPIKey(String service) {
        API_Key__c apiKeyRecord = [SELECT Key__c FROM API_Key__c WHERE Name = :service LIMIT 1];

        if (apiKeyRecord != null) {
            return apiKeyRecord.Key__c;
        }

        return 'N/A';
    }

    @AuraEnabled
    public static void setAPIKey(String service, String key) {
        List<API_Key__c> apiKeyRecords = [SELECT Id, Name, Key__c FROM API_Key__c WHERE Name = :service LIMIT 1];

        if (apiKeyRecords.size() > 0) {

            // Modify the existing record
            API_Key__c apiKeyRecord = apiKeyRecords[0];
            apiKeyRecord.Key__c = key;
            System.debug(apiKeyRecord);
            update apiKeyRecord;

        } else {
            // Create a new record
            API_Key__c newAPIKey = new API_Key__c();
            newAPIKey.Name = service;
            newAPIKey.Key__c = key;
            System.debug(newAPIKey);
            insert newAPIKey;
        }
    }

}