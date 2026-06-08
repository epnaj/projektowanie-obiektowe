import Foundation
import Leaf
import Redis
import Vapor

public func configure(_ app: Application) throws {
    if let urlString = Environment.get("REDIS_URL"), let url = URL(string: urlString) {
        app.redis.configuration = try RedisConfiguration(url: url)
    } else {
        let hostname = Environment.get("REDIS_HOST") ?? "127.0.0.1"
        app.redis.configuration = try RedisConfiguration(hostname: hostname, port: 6379)
    }

    app.views.use(.leaf)

    app.http.server.configuration.hostname = "0.0.0.0"
    app.http.server.configuration.port     = 8000

    try routes(app)
}
