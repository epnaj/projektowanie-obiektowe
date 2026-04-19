package com.example.zadanie3

import org.springframework.beans.factory.annotation.Qualifier
import org.springframework.context.annotation.Lazy
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

data class LoginRequest(val username: String, val password: String)

data class LoginResponse(val authenticated: Boolean)

@RestController
@RequestMapping("/login")
class AuthController(
    @Qualifier("eager") private val eagerAuthService: AuthService,
    @Lazy @Qualifier("lazy") private val lazyAuthService: AuthService
) {

    @PostMapping
    fun loginDefault(@RequestBody request: LoginRequest): LoginResponse {
        val authenticated = eagerAuthService.authenticate(request.username, request.password)
        return LoginResponse(authenticated)
    }

    @PostMapping("/eager")
    fun loginEager(@RequestBody request: LoginRequest): LoginResponse {
        val authenticated = eagerAuthService.authenticate(request.username, request.password)
        return LoginResponse(authenticated)
    }

    @PostMapping("/lazy")
    fun loginLazy(@RequestBody request: LoginRequest): LoginResponse {
        val authenticated = lazyAuthService.authenticate(request.username, request.password)
        return LoginResponse(authenticated)
    }
}
