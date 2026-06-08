import Redis
import Vapor

struct CategoryController: RouteCollection {
    func boot(routes: RoutesBuilder) throws {
        let categories = routes.grouped("categories")
        categories.get(use: index)
        categories.post(use: create)
        categories.group(":categoryID") {
            category in
                category.get(use: show)
                category.put(use: update)
                category.delete(use: delete)
        }
    }

    // GET /categories
    func index(req: Request) async throws -> [Category] {
        try await repository(req).all()
    }

    // POST /categories
    func create(req: Request) async throws -> Category {
        var category = try req.content.decode(Category.self)

        let id = category.id ?? UUID()
        category.id = id
        try await repository(req).save(id, category)
        return category
    }

    // GET /categories/:categoryID
    func show(req: Request) async throws -> Category {
        try await find(req)
    }

    // PUT /categories/:categoryID
    func update(req: Request) async throws -> Category {
        var category = try await find(req)
        let updated  = try req.content.decode(Category.self)

        category.name = updated.name

        try await repository(req).save(category.id!, category)
        return category
    }

    // DELETE /categories/:categoryID
    func delete(req: Request) async throws -> HTTPStatus {
        let category = try await find(req)
        try await repository(req).delete(category.id!)
        return .noContent
    }

    private func repository(_ req: Request) -> RedisRepository<Category> {
        RedisRepository(client: req.redis, prefix: "category", indexKey: "categories")
    }

    private func find(_ req: Request) async throws -> Category {
        guard let id = req.parameters.get("categoryID", as: UUID.self) else {
            throw Abort(.badRequest)
        }
        guard let category = try await repository(req).find(id) else {
            throw Abort(.notFound)
        }
        return category
    }
}
