package services

import (
	"strings"

	"gorm.io/gorm"
	"gorm.io/gorm/clause"

	"zadanie4/models"
)

type LocalWeatherService struct {
	db *gorm.DB
}

func NewLocalWeatherService(db *gorm.DB) *LocalWeatherService {
	return &LocalWeatherService{db: db}
}

func (s *LocalWeatherService) GetWeather(location string) (*models.Weather, error) {
	location = strings.ToLower(location)

	var weather models.Weather
	if err := s.db.Where("LOWER(location) = ?", location).First(&weather).Error; err != nil {
		return nil, err
	}
	return &weather, nil
}

func (s *LocalWeatherService) Save(weather *models.Weather) error {
	return s.db.Clauses(clause.OnConflict{
		Columns:   []clause.Column{{Name: "location"}},
		DoUpdates: clause.AssignmentColumns([]string{"temperature", "humidity", "description"}),
	}).Create(weather).Error
}
