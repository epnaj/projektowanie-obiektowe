import Vapor

struct Category: Content {
    var id: UUID?
    var name: String
}
