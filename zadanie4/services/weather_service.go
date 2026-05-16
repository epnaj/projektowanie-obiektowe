package services

import (
	"zadanie4/models"
)

type WeatherService interface {
	GetWeather(location string) (*models.Weather, error)
}
