package xyz.gojani.calc.requests;

import org.javawebstack.validator.Rule;

public class CreateCalculationRequest {

    @Rule("string(0, 100)")
    public String title;
    @Rule({"required", "string"})
    public String content;


}
