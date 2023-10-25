// require('dotenv').config();
import dotenv from 'dotenv';
dotenv.config();

import express from "express";
// const express = require("express");
import bodyParser from "body-parser";
//const bodyParser = require("body-parser");
import request from "request";

const app = express();

app.use(bodyParser.urlencoded({extended:true}));

const port = 3000; 

app.get("/",(req,res)=>{
    res.render("index.ejs",
    {
        weatherData : null,
        forecastData : null,
        forecastArray : null,
        error : null,
    });
  });

app.use(express.static("public"));

// Render 404.ejs if url entered wrong
app.get("*",(req,res)=>{
    res.render("404.ejs");
})

app.post("/",function(req,res){

    const city = req.body.city;
    
    const url = "https://api.openweathermap.org/data/2.5/weather?q="+ city +"&appid="+(process.env.appKey)+"&units=metric#";
    const forecast_url = "https://api.openweathermap.org/data/2.5/forecast?q="+ city +"&appid="+(process.env.appKey)+"&units=metric#";
    
    const currentDate = new Date();
    
    const option_month = {month : "long"};
    const option_day = { weekday : "short"};

    const monthName = currentDate.toLocaleString("en-US", option_month);
    
    const currentDay = currentDate.toLocaleString("en-US", option_day);
    const date = currentDate.getDate() + " " + monthName;


    request(url,(err,response,data)=>{
        request(forecast_url,(err,response,data_forecast)=>{
        if(err){
            res.render("index.ejs",{
                weatherData : null,
                forecastData : null,
                forecastArray : null,
                error : "City Not Found."
            });
        }
        else{
            const weatherData = JSON.parse(data);  
            const forecastData = JSON.parse(data_forecast);
            const uniqueForecastDays = new Set();       //   Creating a set for next 5 days including current day 
            const forecastArray = forecastData.list;

            if(weatherData.main == undefined){
                res.render("index.ejs",{
                    weatherData : null,
                    forecastData : null,
                    forecastArray : null,
                    error : "City Not Found!"
                });
            }
            else{              
                const fiveDaysForecast = forecastArray.filter(forecast => {
                    const forecastDate = new Date(forecast.dt_txt).getDate();

                    if (!uniqueForecastDays.has(forecastDate) && uniqueForecastDays.size < 6) {
                        uniqueForecastDays.add(forecastDate);
                        return true;
                    }
                    return false;
                });

                // console.log(fiveDaysForecast);
                // console.log(weatherData);
                // console.log(forecastData);

                const cityName = weatherData.name;
                const countryName = weatherData.sys.country;
                const temp = weatherData.main.temp; 
                const desc = weatherData.weather[0].description;
                const icon = "https://openweathermap.org/img/wn/" + weatherData.weather[0].icon +"@2x.png";
                const feels_like = weatherData.main.feels_like; 
                
                res.render("index.ejs",
                {
                    weatherData : weatherData,
                    forecastArray : forecastArray,
                    forecastData : forecastData,
                    cityName : cityName,
                    countryName : countryName,
                    temp : temp,
                    desc : desc,
                    icon : icon,
                    feels_like : feels_like,
                    date : date,
                    fiveDaysForecast : fiveDaysForecast,
                    currentDay : currentDay,
                    error: null
                }
                )
            }
        }
    });
    });
    
});


app.listen(port,()=>{
    console.log("Server started on on port " + port);
});