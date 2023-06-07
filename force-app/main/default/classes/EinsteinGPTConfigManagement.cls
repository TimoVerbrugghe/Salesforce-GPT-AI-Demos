public class EinsteinGPTConfigManagement {

    @AuraEnabled
    public static string getEinsteinGPTStandardPrompt() {
        Einstein_GPT_Config__c egptConfigRecord = [SELECT Id, Standard_Prompt__c FROM Einstein_GPT_Config__c LIMIT 1];

        if (egptConfigRecord != null) {
            return egptConfigRecord.Standard_Prompt__c;
        } else {
            return 'N/A';
        }

    }

    @AuraEnabled
    public static void setEinsteinGPTStandardPrompt(String prompt) {
        List<Einstein_GPT_Config__c> egptConfigRecords = [SELECT Id FROM Einstein_GPT_Config__c LIMIT 1];

        if (egptConfigRecords.size() > 0) {

            // Modify the existing record
            Einstein_GPT_Config__c egptConfigRecord = egptConfigRecords[0];
            egptConfigRecord.Standard_Prompt__c = prompt;
            update egptConfigRecord;

        } else {
            // Create a new record
            Einstein_GPT_Config__c newConfigRecord = new Einstein_GPT_Config__c();
            newConfigRecord.Name = 'EinsteinGPTConfig';
            newConfigRecord.Standard_Prompt__c = prompt;
            insert newConfigRecord;
        }
    }

}