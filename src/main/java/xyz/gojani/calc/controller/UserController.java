package xyz.gojani.calc.controller;

import com.google.gson.Gson;
import org.javawebstack.framework.HttpController;
import org.javawebstack.httpserver.router.annotation.Attrib;
import org.javawebstack.httpserver.router.annotation.Get;
import org.javawebstack.httpserver.router.annotation.PathPrefix;
import org.javawebstack.orm.Repo;
import org.javawebstack.passport.Profile;
import xyz.gojani.calc.models.Calculation;
import xyz.gojani.calc.models.Session;
import xyz.gojani.calc.responses.CalculationResponse;
import xyz.gojani.calc.responses.UserResponse;

import java.util.stream.Collectors;

@PathPrefix("/api/v1/user")
public class UserController extends HttpController {

    @Get
    public UserResponse getUser(@Attrib("session") Session session){
        UserResponse userResponse = new UserResponse();

        if (session != null) {
            Profile profile = session.getUser();

            if (profile == null || !profile.get("success").bool()) {
                session.delete();
                return userResponse;
            }

            userResponse.name = profile.getName();
            userResponse.nickName = profile.get("full_name");
            userResponse.avatar = profile.getAvatar();

            userResponse.calculations = Repo.get(Calculation.class).where("userId", profile.getId()).order("updatedAt", true).get().stream().map(calculation -> new CalculationResponse(calculation, false)).collect(Collectors.toList());

            userResponse.success = true;
        }

        return userResponse;
    }
}
