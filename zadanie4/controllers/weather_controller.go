package controllers

import (
	"errors"
	"net/http"

	"github.com/labstack/echo/v4"
	"gorm.io/gorm"

	"zadanie4/services"
)

// WeatherController handles weather-related HTTP requests.
// It depends on the WeatherService interface so it does not know
// whether it is talking to the real subject or to a proxy.
type WeatherController struct {
	service services.WeatherService
}

func NewWeatherController(service services.WeatherService) *WeatherController {
	return &WeatherController{service: service}
}

func (c *WeatherController) RegisterRoutes(e *echo.Echo) {
	e.GET("/weather/:location", c.GetWeather)
	e.POST("/weather/:location", c.GetWeather)
}

func (c *WeatherController) GetWeather(ctx echo.Context) error {
	location := ctx.Param("location")

	weather, err := c.service.GetWeather(location)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return ctx.JSON(http.StatusNotFound, map[string]string{
				"error": "Weather data not found for location: " + location,
			})
		}
		return ctx.JSON(http.StatusInternalServerError, map[string]string{
			"error": err.Error(),
		})
	}

	return ctx.JSON(http.StatusOK, weather)
}
