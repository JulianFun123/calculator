package xyz.gojani.calc;

import org.javawebstack.command.CommandSystem;
import org.javawebstack.framework.HttpController;
import org.javawebstack.framework.WebApplication;
import org.javawebstack.framework.config.Config;
import org.javawebstack.httpserver.Exchange;
import org.javawebstack.httpserver.HTTPServer;
import org.javawebstack.httpserver.handler.ExceptionHandler;
import org.javawebstack.injector.Injector;
import org.javawebstack.orm.ORM;
import org.javawebstack.orm.ORMConfig;
import org.javawebstack.orm.Repo;
import org.javawebstack.orm.exception.ORMConfigurationException;
import org.javawebstack.orm.wrapper.SQL;
import org.javawebstack.passport.OAuth2Module;
import org.javawebstack.passport.services.oauth2.InteraAppsOAuth2Service;
import org.javawebstack.passport.services.oauth2.OAuth2Callback;
import org.javawebstack.passport.services.oauth2.OAuth2CallbackHandler;
import org.javawebstack.validator.ValidationException;
import xyz.gojani.calc.controller.UserController;
import xyz.gojani.calc.models.Session;
import xyz.gojani.calc.responses.SessionResponse;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

public class CalculatorApp extends WebApplication {
    private OAuth2Module oAuth2Module;

    private static CalculatorApp instance;

    private InteraAppsOAuth2Service iaOAuth2Service;

    protected void setupConfig(Config config) {

        config.addEnvKeyMapping(new HashMap(){{
            put("IA_OAUTH2_CLIENT_ID", "ia.oauth2.id");
            put("IA_OAUTH2_CLIENT_SECRET", "ia.oauth2.secret");
            put("SERVER_NAME", "server.name");
        }});

        config.addEnvFile(".env");

        iaOAuth2Service = new InteraAppsOAuth2Service(getConfig().get("ia.oauth2.id"), getConfig().get("ia.oauth2.secret"), getConfig().get("server.name")).setScopes(new String[]{"user:read"});
        oAuth2Module.addService(iaOAuth2Service);

    }

    protected void setupModels(SQL sql) throws ORMConfigurationException {
        ORMConfig ormConfig = new ORMConfig().setTablePrefix("calc_");
        ORM.register(Session.class.getPackage(), sql, ormConfig);
        
        ORM.autoMigrate();
    }

    protected void setupServer(HTTPServer server) {

        oAuth2Module.setOAuth2Callback((s, exchange, oAuth2Callback) -> {
            Session session = new Session();
            session.accessToken = oAuth2Callback.getToken();
            session.refreshToken = oAuth2Callback.getRefreshToken();
            session.save();
            if (exchange.rawRequest().getParameter("popup") != null) {
                SessionResponse response = new SessionResponse();
                response.session = session.id;
                response.success = true;
                return response;
            }
            exchange.redirect("/login.html#"+session.id);
            return "";
        });

        server.exceptionHandler((exchange, throwable) -> {
            if (throwable instanceof ValidationException) {
                ValidationException validationException = (ValidationException) throwable;
                validationException.getResult().getErrorMap().forEach((s, list)->{
                    list.forEach(validationError -> {
                        System.out.println(validationError.getMessage());
                    });
                });
            }
            return "{}";
        });

        server.beforeInterceptor(exchange -> {
            if (exchange.bearerAuth() != null){
                Session session = Repo.get(Session.class).get(exchange.bearerAuth());

                if (session != null) {
                    exchange.attrib("session", session);
                }
            }

            return false;
        });

        server.controller(HttpController.class, UserController.class.getPackage());

        server.get("/", exchange -> {
            try {
                exchange.write(getClass().getClassLoader().getResourceAsStream("static/calc.html"));
            } catch (IOException ignore) { }
            return "";
        });

        server.get("/oauth/info", exchange -> {
            Map<String, Object> response = new HashMap<>();
            response.put("client_id", getConfig().get("ia.oauth2.id"));
            response.put("type", "INTERAAPPS");
            return response;
        });

        server.staticResourceDirectory("/", getClass().getClassLoader(), "static");
    }

    protected void setupCommands(CommandSystem commandSystem) {

    }

    protected void setupModules() {
        // http://localhost:1337/authorization/oauth2/interaapps
        oAuth2Module = new OAuth2Module();
        addModule(oAuth2Module);
    }

    @Override
    protected void setupInjection(Injector injector) {

        injector.setInstance(CalculatorApp.class, this);
    }

    public static void main(String[] args) {
        instance = new CalculatorApp();
        instance.start();
    }

    public InteraAppsOAuth2Service getIaOAuth2Service() {
        return iaOAuth2Service;
    }

    public static CalculatorApp getInstance() {
        return instance;
    }
}
