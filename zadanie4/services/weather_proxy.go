package services

import (
	"encoding/json"
	"fmt"
	"net/http"
	"net/url"
	"time"

	"zadanie4/models"
)

type WeatherProxy struct {
	real   WeatherService
	client *http.Client
}

func NewWeatherProxy(real WeatherService) *WeatherProxy {
	return &WeatherProxy{
		real: real,
		client: &http.Client{
			Timeout: 5 * time.Second,
		},
	}
}

type wttrResponse struct {
	CurrentCondition []struct {
		TempC      string `json:"temp_C"`
		Humidity   string `json:"humidity"`
		WeatherDesc []struct {
			Value string `json:"value"`
		} `json:"weatherDesc"`
	} `json:"current_condition"`
}

func (p *WeatherProxy) GetWeather(location string) (*models.Weather, error) {
	weather, err := p.fetchRemote(location)
	if err == nil {
		return weather, nil
	}
	// Fallback to the real subject when the external service is unavailable
	// or does not know the requested location.
	return p.real.GetWeather(location)
}

func (p *WeatherProxy) fetchRemote(location string) (*models.Weather, error) {
	endpoint := fmt.Sprintf("https://wttr.in/%s?format=j1", url.PathEscape(location))

	resp, err := p.client.Get(endpoint)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("external weather API returned status %d", resp.StatusCode)
	}

	var payload wttrResponse
	if err := json.NewDecoder(resp.Body).Decode(&payload); err != nil {
		return nil, err
	}

	if len(payload.CurrentCondition) == 0 {
		return nil, fmt.Errorf("external weather API returned no data for %q", location)
	}

	current := payload.CurrentCondition[0]

	var temperature float64
	if _, err := fmt.Sscanf(current.TempC, "%f", &temperature); err != nil {
		return nil, fmt.Errorf("failed to parse temperature: %w", err)
	}

	var humidity int
	if _, err := fmt.Sscanf(current.Humidity, "%d", &humidity); err != nil {
		return nil, fmt.Errorf("failed to parse humidity: %w", err)
	}

	description := ""
	if len(current.WeatherDesc) > 0 {
		description = current.WeatherDesc[0].Value
	}

	return &models.Weather{
		Location:    location,
		Temperature: temperature,
		Humidity:    humidity,
		Description: description,
	}, nil
}
