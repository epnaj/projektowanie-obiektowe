import Fluent
import Vapor

final class Product: Model, Content {
    static let schema = "products"

    @ID(key: .id)
    var id: UUID?

    @Field(key: "name")
    var name: String

    @Field(key: "price")
    var price: Double

    @OptionalField(key: "description")
    var description: String?

    @Field(key: "quantity")
    var quantity: Int

    init() {}

    init(id: UUID? = nil, name: String, price: Double, description: String? = nil, quantity: Int = 0) {
        self.id = id
        self.name = name
        self.price = price
        self.description = description
        self.quantity = quantity
    }

    func validateBusinessRules() throws {
        guard quantity >= 0 else {
            throw Abort(.badRequest, reason: "Quantity of products can't be negative.")
        }
    }
}
