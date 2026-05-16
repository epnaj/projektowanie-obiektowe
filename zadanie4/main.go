package main

import (
	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"

	"zadanie4/controllers"
	"zadanie4/database"
	"zadanie4/services"
)

func main() {
	e := echo.New()

	e.Use(middleware.Logger())
	e.Use(middleware.Recover())

	db, err := database.InitDB("weather.db")
	if err != nil {
		e.Logger.Fatal(err)
	}

	localService := services.NewLocalWeatherService(db)
	weatherService := services.NewWeatherProxy(localService)

	weatherController := controllers.NewWeatherController(weatherService)
	weatherController.RegisterRoutes(e)

	e.Logger.Fatal(e.Start(":8000"))
}
