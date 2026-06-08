import Vapor

struct Product: Content {
    var id: UUID?
    var name: String
    var price: Double
    var description: String?
    var quantity: Int
    var categoryID: UUID?

    func validateBusinessRules() throws {
        guard quantity >= 0 else {
            throw Abort(.badRequest, reason: "Quantity of products can't be negative.")
        }
    }
}
