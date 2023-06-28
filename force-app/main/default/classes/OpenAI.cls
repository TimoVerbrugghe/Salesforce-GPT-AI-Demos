public class OpenAI {
    @AuraEnabled
    public static string getGPTResponse(String openAIcommand) {

        // Standard boilerplate text that will go in front of ANY open AI command

        String finalCommand = getOpenAIDefaultInput() + openAIcommand;

        // Create command for openAI

        Map<String, Object> payload = new Map<String, Object>();
        payload.put('model', 'gpt-3.5-turbo');

        List<Map<String, Object>> messages = new List<Map<String, Object>>();
        messages.add(new Map<String, Object>{'role' => 'user', 'content' => finalCommand});
        payload.put('messages', messages);

        String payloadJson = JSON.serialize(payload);

        return sendOpenAIRequest(payloadJson);

    }

    @AuraEnabled
    public static string getGPTChatResponse(String[] chatHistory){

        List<Map<String, Object>> messages = new List<Map<String, Object>>();
        for (Integer i = 0; i < chatHistory.size(); i++) {

            String message = chatHistory[i];
            String role = (Math.mod(i,2) == 0) ? 'user' : 'assistant';

            // The first message should ALWAYS include the default input as defined by the user
            if (i == 0) {
                messages.add(new Map<String, Object>{
                    'role' => role,
                    'content' => getOpenAIDefaultInput() + message
                });
            } else {
                messages.add(new Map<String, Object>{
                    'role' => role,
                    'content' => message
                });
            }
        }

        Map<String, Object> payload = new Map<String, Object>{
            'model' => 'gpt-3.5-turbo',
            'messages' => messages
        };

        String payloadJson = JSON.serialize(payload);

        return sendOpenAIRequest(payloadJson);

    }

    private static string sendOpenAIRequest(String payload) {

        // Get endpoint & API Key
        String openAIEndpoint = 'https://api.openai.com/v1/chat/completions';
        String openAIKey = APIKeyManagement.getOpenAIAPIKey();

        // Create request
        HttpRequest request = new HttpRequest();
        request.setEndpoint(openAIEndpoint);
        request.setMethod('POST');
        request.setHeader('Authorization', 'Bearer ' + openAIkey);
        request.setHeader('Content-Type', 'application/json');
        request.setTimeOut(120000);
        request.setBody(payload);

        // Send request, parse body & send message back
        String responseBody = HTTPRequests.postRequest(request);

        OpenAIParser openaiResponse = new OpenAIParser();
        openaiResponse = OpenAIParser.parse(responseBody);

        return openaiResponse.choices[0].message.content;

    }

    private static string getOpenAIDefaultInput() {
        String defaultInput = EinsteinGPTConfigManagement.getEinsteinGPTStandardPrompt();
        return defaultInput;
    }
}