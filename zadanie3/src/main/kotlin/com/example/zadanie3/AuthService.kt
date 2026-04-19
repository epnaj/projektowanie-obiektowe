package com.example.zadanie3

import org.springframework.beans.factory.annotation.Qualifier
import org.springframework.context.annotation.Lazy
import org.springframework.stereotype.Service

interface AuthService {
    fun authenticate(username: String, password: String): Boolean
}

@Service
@Qualifier("eager")
class EagerAuthService : AuthService {

    init {
        println("EagerAuthService created (eager - przy starcie kontekstu Springa)")
    }

    override fun authenticate(username: String, password: String): Boolean {
        return username == VALID_USERNAME && password == VALID_PASSWORD
    }

    companion object {
        private const val VALID_USERNAME = "admin"
        private const val VALID_PASSWORD = "admin123"
    }
}

@Service
@Lazy
@Qualifier("lazy")
class LazyAuthService : AuthService {

    init {
        println("LazyAuthService created (lazy - przy pierwszym uzyciu)")
    }

    override fun authenticate(username: String, password: String): Boolean {
        return username == VALID_USERNAME && password == VALID_PASSWORD
    }

    companion object {
        private const val VALID_USERNAME = "admin"
        private const val VALID_PASSWORD = "admin123"
    }
}
