package xyz.gojani.calc.models;


import org.apache.commons.lang3.RandomStringUtils;
import org.javawebstack.framework.WebApplication;
import org.javawebstack.injector.Inject;
import org.javawebstack.orm.Model;
import org.javawebstack.orm.annotation.Column;
import org.javawebstack.orm.annotation.Dates;
import org.javawebstack.passport.Profile;
import org.javawebstack.passport.services.oauth2.InteraAppsOAuth2Service;
import xyz.gojani.calc.CalculatorApp;

import java.sql.Timestamp;


@Dates
public class Session extends Model {
    @Column(size = 100)
    public String id;

    @Column
    public String accessToken;

    @Column
    public String refreshToken;

    @Column
    public Timestamp createdAt;

    @Column
    public Timestamp updatedAt;

    public Session(){
        id = RandomStringUtils.random(100, "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz1234567890");
    }

    public Profile getUser(){
        return CalculatorApp.getInstance().getIaOAuth2Service().getProfile(accessToken);
    }

}
