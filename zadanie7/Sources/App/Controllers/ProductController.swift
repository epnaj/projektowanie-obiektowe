import Redis
import Vapor

struct ProductController: RouteCollection {
    func boot(routes: RoutesBuilder) throws {
        let products = routes.grouped("products")
        products.get(use: index)
        products.post(use: create)
        products.group(":productID") {
            product in
                product.get(use: show)
                product.put(use: update)
                product.delete(use: delete)
        }
    }

    // GET /products
    func index(req: Request) async throws -> [Product] {
        try await repository(req).all()
    }

    // POST /products
    func create(req: Request) async throws -> Product {
        var product = try req.content.decode(Product.self)
        try product.validateBusinessRules()

        let id = product.id ?? UUID()
        product.id = id
        try await repository(req).save(id, product)
        return product
    }

    // GET /products/:productID
    func show(req: Request) async throws -> Product {
        try await find(req)
    }

    // PUT /products/:productID
    func update(req: Request) async throws -> Product {
        var product     = try await find(req)
        let updated     = try req.content.decode(Product.self)
        product.name        = updated.name
        product.price       = updated.price
        product.description = updated.description
        product.quantity    = updated.quantity
        product.categoryID  = updated.categoryID
        try product.validateBusinessRules()

        try await repository(req).save(product.id!, product)
        return product
    }

    // DELETE /products/:productID
    func delete(req: Request) async throws -> HTTPStatus {
        let product = try await find(req)
        try await repository(req).delete(product.id!)
        return .noContent
    }

    private func repository(_ req: Request) -> RedisRepository<Product> {
        RedisRepository(client: req.redis, prefix: "product", indexKey: "products")
    }

    private func find(_ req: Request) async throws -> Product {
        guard let id = req.parameters.get("productID", as: UUID.self) else {
            throw Abort(.badRequest)
        }
        guard let product = try await repository(req).find(id) else {
            throw Abort(.notFound)
        }
        return product
    }
}
