public class EinsteinGPTConfigManagement {

    @AuraEnabled
    public static string getEinsteinGPTStandardPrompt() {
        List<Einstein_GPT_Config__c> egptConfigRecords = [SELECT Id, Standard_Prompt__c FROM Einstein_GPT_Config__c LIMIT 1];

        if (egptConfigRecords.size() > 0) {
            Einstein_GPT_Config__c egptConfigRecord = egptConfigRecords[0];
            return egptConfigRecord.Standard_Prompt__c;
        } else {
            return null;
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


    @AuraEnabled
    public static string getEinsteinGPTModel(){
        try {
            return 'gpt-3.5-turbo';
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }

    @AuraEnabled
    public static void setEinsteinGPTModel(){
        try {
            
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }
}