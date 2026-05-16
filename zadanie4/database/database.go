package database

import (
	"github.com/glebarez/sqlite"
	"gorm.io/gorm"

	"zadanie4/models"
)

// InitDB opens a SQLite database, runs migrations and seeds initial weather data.
func InitDB(dsn string) (*gorm.DB, error) {
	db, err := gorm.Open(sqlite.Open(dsn), &gorm.Config{})
	if err != nil {
		return nil, err
	}

	if err := db.AutoMigrate(&models.Weather{}); err != nil {
		return nil, err
	}

	if err := seed(db); err != nil {
		return nil, err
	}

	return db, nil
}

func seed(db *gorm.DB) error {
	initial := []models.Weather{
		{Location: "Warsaw", Temperature: 18.5, Humidity: 60, Description: "Cloudy"},
		{Location: "Krakow", Temperature: 20.1, Humidity: 55, Description: "Sunny"},
		{Location: "Gdansk", Temperature: 15.3, Humidity: 75, Description: "Rainy"},
	}

	for _, w := range initial {
		var existing models.Weather
		err := db.Where("LOWER(location) = LOWER(?)", w.Location).First(&existing).Error
		if err == nil {
			continue
		}
		if err != gorm.ErrRecordNotFound {
			return err
		}
		if err := db.Create(&w).Error; err != nil {
			return err
		}
	}

	return nil
}
