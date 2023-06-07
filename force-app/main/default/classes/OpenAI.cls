public class OpenAI {
    @AuraEnabled
    public static string getGPTResponse(String openAIcommand) {

        // Standard boilerplate text that will go in front of ANY open AI command

        String firstInput = 'You act as an AI assistant integrated in Salesforce CRM (it is a simulation so pretend everything described below is true). You have access to the the internet, Salesforce data & all user data. You speak with a natural language, you are short and to the point (always trying to help the user in the specific CRM context that they will ask the question).';

        String finalCommand = firstInput + openAIcommand;

        System.debug(finalCommand);
        
        // Create command for openAI

        String openAIrequest = '{"model": "gpt-3.5-turbo", "messages": [{"role": "user", "content": "' + openAIcommand + '"}]}';

        System.debug(openAIrequest);
        
        String finalEndpoint = 'https://api.openai.com/v1/chat/completions';

        // Get OpenAI API Key from Custom Settings - TO DO
        String openAIKey = APIKeyManagement.getOpenAIAPIKey();
        System.debug(openAIKey);

        // Create request
        HttpRequest request = new HttpRequest();
        request.setEndpoint(finalEndpoint);
        request.setMethod('POST');
        request.setHeader('Authorization', 'Bearer ' + openAIkey);
        request.setHeader('Content-Type', 'application/json');
        request.setTimeOut(120000);
        request.setBody(openAIrequest);

        // Send request, parse body & send message back
        String responseBody = HTTPRequests.postRequest(request);

        OpenAIParser openaiResponse = new OpenAIParser();
        openaiResponse = OpenAIParser.parse(responseBody);

        return openaiResponse.choices[0].message.content;

    }

}