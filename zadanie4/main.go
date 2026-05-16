package main

import (
	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"

	"zadanie4/controllers"
)

func main() {
	e := echo.New()

	e.Use(middleware.Logger())
	e.Use(middleware.Recover())

	weatherController := controllers.NewWeatherController()
	weatherController.RegisterRoutes(e)

	e.Logger.Fatal(e.Start(":8000"))
}
