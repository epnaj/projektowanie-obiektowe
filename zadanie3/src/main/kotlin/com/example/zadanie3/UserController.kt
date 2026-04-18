package com.example.zadanie3

import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

data class User(val id: Int, val username: String, val password: String)

@RestController
@RequestMapping("/users")
class UserController {

    private val users = listOf(
        User(1, "jan", "haslo123"),
        User(2, "anna", "qwerty"),
        User(3, "piotr", "admin")
    )

    @GetMapping
    fun getUsers(): List<User> = users
}
