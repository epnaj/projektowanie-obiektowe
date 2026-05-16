package models

type Weather struct {
	ID          uint    `gorm:"primaryKey" json:"id"`
	Location    string  `gorm:"uniqueIndex;not null" json:"location"`
	Temperature float64 `json:"temperature"`
	Humidity    int     `json:"humidity"`
	Description string  `json:"description"`
}
