package com.example.zadanie3

import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

data class LoginRequest(val username: String, val password: String)

data class LoginResponse(val authenticated: Boolean)

@RestController
@RequestMapping("/login")
class AuthController(private val authService: AuthService) {

    @PostMapping
    fun login(@RequestBody request: LoginRequest): LoginResponse {
        val authenticated = authService.authenticate(request.username, request.password)
        return LoginResponse(authenticated)
    }
}
