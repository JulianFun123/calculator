package xyz.gojani.calc.models;

import org.apache.commons.lang3.RandomStringUtils;
import org.javawebstack.orm.Model;
import org.javawebstack.orm.annotation.Column;
import org.javawebstack.orm.annotation.Dates;
import org.javawebstack.passport.Profile;
import xyz.gojani.calc.CalculatorApp;

import java.sql.Timestamp;

@Dates
public class Calculation extends Model {
    @Column(size = 100)
    public String id;

    @Column
    public String title;

    @Column
    public String contents;

    @Column
    public String userId;

    @Column
    public boolean shared;

    @Column
    public Timestamp createdAt;

    @Column
    public Timestamp updatedAt;

    public boolean offline = false;

    public Calculation(){
        id = RandomStringUtils.random(15, "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz1234567890");
    }



}
