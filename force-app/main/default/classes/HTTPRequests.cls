public class HTTPRequests {
    public static string postRequest(HttpRequest request) {
        Http http = new Http();

        try {
            HttpResponse res = http.send(request);
            if (res.getStatusCode() >= 200 && res.getStatusCode() < 300) {

                String responseBody = res.getBody();
                return responseBody;

            } else {
                String errorMessage = 'We got a bad status code back, the status code is ' + res.getStatusCode();
                System.debug(errorMessage);
                return errorMessage;
            }

        } catch (Exception e) {
            System.debug(e.getMessage());

            throw new AuraHandledException(e.getMessage());

        }
}
}