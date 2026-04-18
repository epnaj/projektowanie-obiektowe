package com.example.zadanie3

object AuthService {

    private const val VALID_USERNAME = "admin"
    private const val VALID_PASSWORD = "admin123"

    fun authenticate(username: String, password: String): Boolean {
        return username == VALID_USERNAME && password == VALID_PASSWORD
    }
}
