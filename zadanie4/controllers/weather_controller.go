package controllers

import (
	"errors"
	"net/http"
	"strings"

	"github.com/labstack/echo/v4"
	"gorm.io/gorm"

	"zadanie4/models"
)

// WeatherController handles weather-related HTTP requests
type WeatherController struct {
	db *gorm.DB
}

func NewWeatherController(db *gorm.DB) *WeatherController {
	return &WeatherController{db: db}
}

func (c *WeatherController) RegisterRoutes(e *echo.Echo) {
	e.GET("/weather/:location", c.GetWeather)
	e.POST("/weather/:location", c.GetWeather)
}

func (c *WeatherController) GetWeather(ctx echo.Context) error {
	location := strings.ToLower(ctx.Param("location"))

	var weather models.Weather
	err := c.db.Where("LOWER(location) = ?", location).First(&weather).Error
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
