package xyz.gojani.calc.controller;

import com.google.gson.Gson;
import org.javawebstack.framework.HttpController;
import org.javawebstack.httpserver.router.annotation.*;
import org.javawebstack.orm.Repo;
import org.javawebstack.passport.Profile;
import xyz.gojani.calc.models.Calculation;
import xyz.gojani.calc.models.Session;
import xyz.gojani.calc.requests.CreateCalculationRequest;
import xyz.gojani.calc.responses.ActionResponse;
import xyz.gojani.calc.responses.CalculationResponse;
import xyz.gojani.calc.responses.ElementCreatedResponse;

@PathPrefix("/api/v1/calculation")
public class CalculationController extends HttpController {

    @Post
    public ElementCreatedResponse createCalc(@Body CreateCalculationRequest request, @Attrib("session") Session session){
        ElementCreatedResponse response = new ElementCreatedResponse();

        if (session != null) {
            Profile profile = session.getUser();
            if (profile != null) {
                Calculation calculation = new Calculation();
                calculation.title = request.title;
                calculation.contents = request.content;
                calculation.userId = profile.id;
                calculation.save();
                response.id = calculation.id;
                response.success = true;
            }
        }

        return response;
    }

    @Get("/{id}")
    public ActionResponse getCalc(@Attrib("session") Session session, @Path("id") String id){
        ActionResponse response = new ActionResponse();
        if (session != null) {
            Profile profile = session.getUser();
            if (profile != null) {
                response = new CalculationResponse(Repo.get(Calculation.class).where("id", id).where("userId", profile.getId()).first(), false);
                response.success = true;
            }
        }

        return response;
    }

    @Delete("/{id}")
    public ActionResponse deleteCalc(@Attrib("session") Session session, @Path("id") String id){
        ActionResponse response = new ActionResponse();
        if (session != null) {
            Profile profile = session.getUser();
            if (profile != null) {
                Repo.get(Calculation.class).where("id", id).where("userId", profile.getId()).first().delete();
                response.success = true;
            }
        }

        return response;
    }

    @Put("/{id}")
    public ActionResponse editCalc(@Body CreateCalculationRequest request, @Attrib("session") Session session, @Path("id") String id){
        ActionResponse response = new ActionResponse();

        if (session != null) {
            Profile profile = session.getUser();
            if (profile != null) {
                Calculation calculation = Repo.get(Calculation.class).where("id", id).where("userId", profile.getId()).first();
                if (request.title != null)
                    calculation.title = request.title;
                if (request.content != null)
                    calculation.contents = request.content;
                calculation.save();
                response.success = true;
            }
        }

        return response;
    }


}
