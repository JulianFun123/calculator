package xyz.gojani.calc.responses;

public class ActionResponse {
    public boolean success = false;

    public static ActionResponse error(){
        ActionResponse actionResponse = new ActionResponse();
        actionResponse.success = false;
        return actionResponse;
    }
}
