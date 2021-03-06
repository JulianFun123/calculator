package xyz.gojani.calc.responses;

import org.javawebstack.abstractdata.AbstractElement;

import java.util.ArrayList;
import java.util.List;

public class UserResponse extends ActionResponse {
    public String name;
    public String avatar;

    public List<CalculationResponse> calculations = new ArrayList<>();
    public AbstractElement nickName;
}
