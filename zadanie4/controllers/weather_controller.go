package controllers

import (
	"net/http"
	"strings"

	"github.com/labstack/echo/v4"

	"zadanie4/models"
)

// WeatherController handles weather-related HTTP requests
type WeatherController struct {
	data map[string]models.Weather
}

func NewWeatherController() *WeatherController {
	return &WeatherController{
		data: map[string]models.Weather{
			"warsaw": {Location: "Warsaw", Temperature: 18.5, Humidity: 60, Description: "Cloudy"},
			"krakow": {Location: "Krakow", Temperature: 20.1, Humidity: 55, Description: "Sunny"},
			"gdansk": {Location: "Gdansk", Temperature: 15.3, Humidity: 75, Description: "Rainy"},
		},
	}
}

func (c *WeatherController) RegisterRoutes(e *echo.Echo) {
	e.GET("/weather/:location", c.GetWeather)
	e.POST("/weather/:location", c.GetWeather)
}

func (c *WeatherController) GetWeather(ctx echo.Context) error {
	location := strings.ToLower(ctx.Param("location"))

	weather, ok := c.data[location]
	if !ok {
		return ctx.JSON(http.StatusNotFound, map[string]string{
			"error": "Weather data not found for location: " + location,
		})
	}

	return ctx.JSON(http.StatusOK, weather)
}
