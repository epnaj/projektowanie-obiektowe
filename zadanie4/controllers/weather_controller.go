package controllers

import (
	"errors"
	"net/http"
	"strings"

	"github.com/labstack/echo/v4"
	"gorm.io/gorm"

	"zadanie4/models"
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

	// Multi-location endpoint
	e.GET("/weather", c.GetWeatherMulti)
	e.POST("/weather", c.GetWeatherMulti)
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

type multiRequest struct {
	Locations []string `json:"locations"`
}

type multiResponse struct {
	Results []*models.Weather `json:"results"`
	Errors  map[string]string `json:"errors,omitempty"`
}

// (GET /weather?locations=Warsaw,Krakow) or as a JSON body
// (POST /weather with {"locations":["Warsaw","Krakow"]}).
func (c *WeatherController) GetWeatherMulti(ctx echo.Context) error {
	locations := parseLocations(ctx)
	if len(locations) == 0 {
		return ctx.JSON(http.StatusBadRequest, map[string]string{
			"error": "No locations provided. Use ?locations=A,B or JSON body {\"locations\":[\"A\",\"B\"]}.",
		})
	}

	response := multiResponse{
		Results: make([]*models.Weather, 0, len(locations)),
		Errors:  map[string]string{},
	}

	for _, loc := range locations {
		weather, err := c.service.GetWeather(loc)
		if err != nil {
			response.Errors[loc] = err.Error()
			continue
		}
		response.Results = append(response.Results, weather)
	}

	if len(response.Errors) == 0 {
		response.Errors = nil
	}

	return ctx.JSON(http.StatusOK, response)
}

func parseLocations(ctx echo.Context) []string {
	var body multiRequest
	if err := ctx.Bind(&body); err == nil && len(body.Locations) > 0 {
		return cleanLocations(body.Locations)
	}

	if raw := ctx.QueryParam("locations"); raw != "" {
		return cleanLocations(strings.Split(raw, ","))
	}

	return nil
}

func cleanLocations(in []string) []string {
	out := make([]string, 0, len(in))
	for _, s := range in {
		s = strings.TrimSpace(s)
		if s != "" {
			out = append(out, s)
		}
	}
	return out
}
