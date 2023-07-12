global class GPTFlowActionsSimpleResponse {

    @InvocableMethod(callout=true label='Get GPT Response' description='Gives your input to GPT and then gives you back the response')
    global static List<GetGPTResponseResult> GetGPTResponses(List<GetGPTResponseRequest> requests) {
        List<GetGPTResponseResult> results = new List<GetGPTResponseResult>();
        for (GetGPTResponseRequest request : requests) {
            results.add(GetGPTResponse(request));
        }
        return results;
    }

    public static GetGPTResponseResult GetGPTResponse(GetGPTResponseRequest request) {
        try {
            String gptOutput = OpenAI.getGPTResponse(request.gptInput);
            GetGPTResponseResult result = new GetGPTResponseResult();
            result.gptOutput = gptOutput;
            return result;  
        } catch(CalloutException e) {
            throw new GetGPTResponseException('An error has occurred');
        }

    }

    global class GetGPTResponseRequest {
        @InvocableVariable(required=true)
        global String gptInput;
    }  

    global class GetGPTResponseResult {
        @InvocableVariable
        global String gptOutput;
    }

    class GetGPTResponseException extends Exception {}

}