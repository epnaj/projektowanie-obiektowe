package com.example.zadanie3

import org.springframework.stereotype.Service

@Service
class AuthService {

    fun authenticate(username: String, password: String): Boolean {
        return username == VALID_USERNAME && password == VALID_PASSWORD
    }

    companion object {
        private const val VALID_USERNAME = "admin"
        private const val VALID_PASSWORD = "admin123"
    }
}
