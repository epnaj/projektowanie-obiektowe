import Fluent
import Vapor

// Widoki HTML (Leaf) dla kategorii.
struct CategoryWebController: RouteCollection {
    struct CategoryForm: Content {
        var name: String
    }

    struct IndexContext: Content {
        var categories: [Category]
    }

    struct CategoryContext: Content {
        var category: Category
    }

    func boot(routes: RoutesBuilder) throws {
        let web = routes.grouped("web", "categories")
        web.get(use: index)
        web.get("create", use: createForm)
        web.post(use: create)

        web.group(":categoryID") { 
            category in
                category.get(use: show)
                category.get("edit", use: editForm)
                category.post("edit", use: update)
                category.post("delete", use: delete)
        }
    }

    // GET /web/categories
    func index(req: Request) async throws -> View {
        let categories = try await Category.query(on: req.db).all()
        return try await req.view.render(
            "categories/index",
            IndexContext(categories: categories)
        )
    }

    // GET /web/categories/create
    func createForm(req: Request) async throws -> View {
        try await req.view.render("categories/create")
    }

    // POST /web/categories
    func create(req: Request) async throws -> Response {
        let form = try req.content.decode(CategoryForm.self)
        let category = Category(name: form.name)
        try await category.create(on: req.db)
        return req.redirect(to: "/web/categories")
    }

    // GET /web/categories/:categoryID 
    // show details here
    func show(req: Request) async throws -> View {
        let category = try await find(req, withProducts: true)
        return try await req.view.render(
            "categories/show",
            CategoryContext(category: category)
        )
    }

    // GET /web/categories/:categoryID/edit
    func editForm(req: Request) async throws -> View {
        let category = try await find(req)

        return try await req.view.render(
            "categories/edit",
            CategoryContext(category: category)
        )
    }

    // POST /web/categories/:categoryID/edit
    func update(req: Request) async throws -> Response {
        let category = try await find(req)
        let form     = try req.content.decode(CategoryForm.self)

        category.name = form.name

        try await category.update(on: req.db)
        return req.redirect(to: "/web/categories")
    }

    // POST /web/categories/:categoryID/delete
    func delete(req: Request) async throws -> Response {
        let category = try await find(req)

        try await category.delete(on: req.db)
        return req.redirect(to: "/web/categories")
    }

    private func find(_ req: Request, withProducts: Bool = false) async throws -> Category {
        guard let id = req.parameters.get("categoryID", as: UUID.self) else {
            throw Abort(.badRequest)
        }

        var query = Category.query(on: req.db).filter(\.$id == id)
        if withProducts {
            query = query.with(\.$products)
        }
        
        guard let category = try await query.first() else {
            throw Abort(.notFound)
        }
        return category
    }
}
