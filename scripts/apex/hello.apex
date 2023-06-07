// Use .apex files to store anonymous Apex.
// You can execute anonymous Apex in VS Code by selecting the
//     apex text and running the command:
//     SFDX: Execute Anonymous Apex with Currently Selected Text
// You can also execute the entire file by running the command:
//     SFDX: Execute Anonymous Apex with Editor Contents

String response = EinsteinGPTActions.getRecordDetails('0017Y00001uX3EwQAK');
System.debug(response);

String json = '{"attributes":{"type":"Account","url":"/services/data/v57.0/sobjects/Account/0017Y00001uX3EwQAK"},"Id":"0017Y00001uX3EwQAK","IsDeleted":false,"Name":"Nestlé","BillingAddress":null,"ShippingAddress":null,"PhotoUrl":"/services/images/photo/0017Y00001uX3EwQAK","AnnualRevenue":100000000,"Description":"Nestlé S.A. is a Swiss multinational food and drink processing conglomerate corporation headquartered in Vevey, Vaud, Switzerland. It has been the largest publicly held food company in the world, measured by revenue and other metrics, since 2014.","OwnerId":"0057Y000009gJxzQAE","CreatedDate":"2023-06-06T08:00:39.000+0000","CreatedById":"0057Y000009gJxzQAE","LastModifiedDate":"2023-06-06T08:00:39.000+0000","LastModifiedById":"0057Y000009gJxzQAE","SystemModstamp":"2023-06-06T08:00:39.000+0000","LastViewedDate":"2023-06-06T09:44:36.000+0000","LastReferencedDate":"2023-06-06T09:44:36.000+0000","CleanStatus":"Pending"}';

String jsonSerialized = JSON.serialize(json);
String recordDetailsSerializedWithoutQuotes = jsonSerialized.substring(1, jsonSerialized.length() - 1);

String test = 'You are now being asked to provide a summary of a record in Salesforce. You will find the record data below in JSON that has been retrieved from the Salesforce Database. Be short, concise and give the user the key insights they need of this record. The record is of the type Account.' + recordDetailsSerializedWithoutQuotes;

String response = OpenAI.getGPTResponse(test);
System.debug(response);

String result = (String)JSON.deserializeUntyped(test);