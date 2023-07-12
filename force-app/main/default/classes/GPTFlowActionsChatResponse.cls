global class GPTFlowActionsChatResponse {

    @InvocableMethod(callout=true label='Get GPT Response (Based on Chat Conversation)' description='Give a chat conversation to GPT to get the next message in the conversation. The input should be an array of text, each text part of a conversation.')
    global static List<GetGPTResponseResult> GetGPTResponses(List<GetGPTResponseRequest> requests) {
        List<GetGPTResponseResult> results = new List<GetGPTResponseResult>();
        for (GetGPTResponseRequest request : requests) {
            results.add(GetGPTResponse(request));
        }
        return results;
    }

    public static GetGPTResponseResult GetGPTResponse(GetGPTResponseRequest request) {
        try {
            String gptOutput = OpenAI.getGPTChatResponse(request.gptInput);
            GetGPTResponseResult result = new GetGPTResponseResult();
            result.gptOutput = gptOutput;
            return result;  
        } catch(CalloutException e) {
            throw new GetGPTResponseException('An error has occurred');
        }

    }

    global class GetGPTResponseRequest {
        @InvocableVariable(required=true)
        global String[] gptInput;
    }  

    global class GetGPTResponseResult {
        @InvocableVariable
        global String gptOutput;
    }

    class GetGPTResponseException extends Exception {}

}

