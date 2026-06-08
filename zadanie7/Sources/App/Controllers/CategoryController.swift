import Fluent
import Vapor

// JSON CRUD dla kategorii (analogiczny do ProductController).
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
        try await Category.query(on: req.db).all()
    }

    // POST /categories
    func create(req: Request) async throws -> Category {
        let category = try req.content.decode(Category.self)

        try await category.create(on: req.db)
        return category
    }

    // GET /categories/:categoryID
    func show(req: Request) async throws -> Category {
        try await find(req)
    }

    // PUT /categories/:categoryID
    func update(req: Request) async throws -> Category {
        let category = try await find(req)
        let updated = try req.content.decode(Category.self)
        
        category.name = updated.name

        try await category.update(on: req.db)
        return category
    }

    // DELETE /categories/:categoryID
    func delete(req: Request) async throws -> HTTPStatus {
        let category = try await find(req)

        try await category.delete(on: req.db)
        return .noContent
    }

    private func find(_ req: Request) async throws -> Category {
        guard let category = try await Category.find(
            req.parameters.get("categoryID"),
            on: req.db
        ) else {
            throw Abort(.notFound)
        }
        return category
    }
}
