public class EinsteinGPTActions {
    
    @AuraEnabled(cacheable=true)
    public static User getUserDetails() {
      try {
        Id userId = UserInfo.getUserId();
        return [SELECT Id, FirstName, SmallPhotoUrl FROM USER WHERE Id = :userId LIMIT 1];
      } catch (Exception e) {
        throw new AuraHandledException(e.getMessage());
      }
    }

    @AuraEnabled(cacheable=true)
    public static string getRecordDetails(String recordId){
        try {

            // Fetch record using the provided ID
            SObject record = Database.query('SELECT ' + getAllFields(recordId) + ' FROM ' + getSObjectName(recordId) + ' WHERE Id = \'' + recordId + '\' LIMIT 1');

            // Serialize the record into JSON
            String recordDetailsSerialized = JSON.serialize(record);
            String jsonSerialized = JSON.serialize(recordDetailsSerialized);
            String recordDetailsSerializedWithoutQuotes = jsonSerialized.substring(1, jsonSerialized.length() - 1);

            return recordDetailsSerializedWithoutQuotes;
            
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }
    private static String getAllFields(Id recordId) {
        // Get the record's object API name dynamically
        String objectApiName = recordId.getSObjectType().getDescribe().getName();
        Map<String, Schema.SObjectField> fieldMap = Schema.getGlobalDescribe().get(objectApiName).getDescribe().fields.getMap();
        return String.join(new List<String>(fieldMap.keySet()), ',');
    }

    private static String getSObjectName(Id recordId) {
        // Get the record's object API name dynamically
        return recordId.getSObjectType().getDescribe().getName();
    }

}