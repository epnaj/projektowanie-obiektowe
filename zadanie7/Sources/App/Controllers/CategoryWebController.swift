import Redis
import Vapor

struct CategoryWebController: RouteCollection {
    struct CategoryForm: Content {
        var name: String
    }

    struct ProductRef: Content {
        var id: UUID
        var name: String
    }

    struct CategoryDetail: Content {
        var id: UUID?
        var name: String
        var products: [ProductRef]
    }

    struct IndexContext: Content {
        var categories: [Category]
    }

    struct DetailContext: Content {
        var category: CategoryDetail
    }

    struct EditContext: Content {
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
        let categories = try await categoryRepo(req).all()
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
        let id   = UUID()
        try await categoryRepo(req).save(id, Category(id: id, name: form.name))
        return req.redirect(to: "/web/categories")
    }

    // GET /web/categories/:categoryID
    // show details here, including products of this category
    func show(req: Request) async throws -> View {
        let category = try await find(req)
        let products = try await productRepo(req).all()
            .filter { $0.categoryID == category.id }
            .compactMap { product -> ProductRef? in
                product.id.map { ProductRef(id: $0, name: product.name) }
            }

        let detail = CategoryDetail(id: category.id, name: category.name, products: products)
        return try await req.view.render(
            "categories/show",
            DetailContext(category: detail)
        )
    }

    // GET /web/categories/:categoryID/edit
    func editForm(req: Request) async throws -> View {
        let category = try await find(req)
        return try await req.view.render(
            "categories/edit",
            EditContext(category: category)
        )
    }

    // POST /web/categories/:categoryID/edit
    func update(req: Request) async throws -> Response {
        var category = try await find(req)
        let form     = try req.content.decode(CategoryForm.self)

        category.name = form.name

        try await categoryRepo(req).save(category.id!, category)
        return req.redirect(to: "/web/categories")
    }

    // POST /web/categories/:categoryID/delete
    func delete(req: Request) async throws -> Response {
        let category = try await find(req)
        try await categoryRepo(req).delete(category.id!)
        return req.redirect(to: "/web/categories")
    }

    // helpers
    private func categoryRepo(_ req: Request) -> RedisRepository<Category> {
        RedisRepository(client: req.redis, prefix: "category", indexKey: "categories")
    }

    private func productRepo(_ req: Request) -> RedisRepository<Product> {
        RedisRepository(client: req.redis, prefix: "product", indexKey: "products")
    }

    private func find(_ req: Request) async throws -> Category {
        guard let id = req.parameters.get("categoryID", as: UUID.self) else {
            throw Abort(.badRequest)
        }
        guard let category = try await categoryRepo(req).find(id) else {
            throw Abort(.notFound)
        }
        return category
    }
}
