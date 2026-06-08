import Redis
import Vapor

struct ProductWebController: RouteCollection {
    struct ProductForm: Content {
        var name: String
        var price: Double
        var description: String?
        var quantity: Int
        // Empty string means lack of category
        var categoryID: String?
    }

    struct CategoryRef: Content {
        var id: UUID
        var name: String
    }

    struct ProductView: Content {
        var id: UUID?
        var name: String
        var price: Double
        var description: String?
        var quantity: Int
        var category: CategoryRef?
    }

    struct IndexContext: Content {
        var products: [ProductView]
    }

    struct ProductContext: Content {
        var product: ProductView
    }

    struct CreateContext: Content {
        var categories: [Category]
    }

    struct EditContext: Content {
        var product: ProductView
        var categories: [Category]
    }

    func boot(routes: RoutesBuilder) throws {
        let web = routes.grouped("web", "products")
        web.get(use: index)
        web.get("create", use: createForm)
        web.post(use: create)

        web.group(":productID") {
            product in
                product.get(use: show)
                product.get("edit", use: editForm)
                product.post("edit", use: update)
                product.post("delete", use: delete)
        }
    }

    // GET /web/products
    func index(req: Request) async throws -> View {
        let products   = try await productRepo(req).all()
        let categories = try await categoryMap(req)
        let views      = products.map { view(of: $0, categories: categories) }

        return try await req.view.render(
            "products/index",
            IndexContext(products: views)
        )
    }

    // GET /web/products/create
    func createForm(req: Request) async throws -> View {
        let categories = try await categoryRepo(req).all()
        return try await req.view.render(
            "products/create",
            CreateContext(categories: categories)
        )
    }

    // POST /web/products
    func create(req: Request) async throws -> Response {
        let form    = try req.content.decode(ProductForm.self)
        let id      = UUID()
        let product = Product(
            id: id,
            name: form.name,
            price: form.price,
            description: form.description,
            quantity: form.quantity,
            categoryID: parseCategoryID(form.categoryID)
        )

        try product.validateBusinessRules()

        try await productRepo(req).save(id, product)
        return req.redirect(to: "/web/products")
    }

    // GET /web/products/:productID
    func show(req: Request) async throws -> View {
        let product    = try await find(req)
        let categories = try await categoryMap(req)

        return try await req.view.render(
            "products/show",
            ProductContext(product: view(of: product, categories: categories))
        )
    }

    // GET /web/products/:productID/edit
    func editForm(req: Request) async throws -> View {
        let product    = try await find(req)
        let categories = try await categoryRepo(req).all()
        let map        = dictionary(of: categories)

        return try await req.view.render(
            "products/edit",
            EditContext(product: view(of: product, categories: map), categories: categories)
        )
    }

    // POST /web/products/:productID/edit
    func update(req: Request) async throws -> Response {
        var product = try await find(req)
        let form    = try req.content.decode(ProductForm.self)

        product.name        = form.name
        product.price       = form.price
        product.description = form.description
        product.quantity    = form.quantity
        product.categoryID  = parseCategoryID(form.categoryID)

        try product.validateBusinessRules()

        try await productRepo(req).save(product.id!, product)
        return req.redirect(to: "/web/products")
    }

    // POST /web/products/:productID/delete
    func delete(req: Request) async throws -> Response {
        let product = try await find(req)
        try await productRepo(req).delete(product.id!)
        return req.redirect(to: "/web/products")
    }


    private func productRepo(_ req: Request) -> RedisRepository<Product> {
        RedisRepository(client: req.redis, prefix: "product", indexKey: "products")
    }

    private func categoryRepo(_ req: Request) -> RedisRepository<Category> {
        RedisRepository(client: req.redis, prefix: "category", indexKey: "categories")
    }

    private func categoryMap(_ req: Request) async throws -> [UUID: Category] {
        dictionary(of: try await categoryRepo(req).all())
    }

    private func dictionary(of categories: [Category]) -> [UUID: Category] {
        Dictionary(uniqueKeysWithValues: categories.compactMap { category in
            category.id.map { ($0, category) }
        })
    }

    private func find(_ req: Request) async throws -> Product {
        guard let id = req.parameters.get("productID", as: UUID.self) else {
            throw Abort(.badRequest)
        }
        guard let product = try await productRepo(req).find(id) else {
            throw Abort(.notFound)
        }
        return product
    }

    private func view(of product: Product, categories: [UUID: Category]) -> ProductView {
        var ref: CategoryRef?
        if let categoryID = product.categoryID,
           let category = categories[categoryID],
           let id = category.id {
            ref = CategoryRef(id: id, name: category.name)
        }

        return ProductView(
            id: product.id,
            name: product.name,
            price: product.price,
            description: product.description,
            quantity: product.quantity,
            category: ref
        )
    }

    private func parseCategoryID(_ raw: String?) -> UUID? {
        guard let raw, !raw.isEmpty else {
            return nil
        }
        return UUID(uuidString: raw)
    }
}
