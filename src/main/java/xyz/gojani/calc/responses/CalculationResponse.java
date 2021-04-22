package xyz.gojani.calc.responses;

import xyz.gojani.calc.models.Calculation;

import java.sql.Timestamp;

public class CalculationResponse extends ActionResponse {

    public String id;
    public String title;
    public String contents;
    public Timestamp createdAt;
    public Timestamp updatedAt;

    public CalculationResponse(Calculation calculation, boolean shorten){
        id = calculation.id;
        title = calculation.title;
        if (shorten && calculation.contents.length() > 50)
            contents = calculation.contents.substring(0, 50)+"...";
        else
            contents = calculation.contents;
        createdAt = calculation.createdAt;
        updatedAt = calculation.updatedAt;
    }

}
