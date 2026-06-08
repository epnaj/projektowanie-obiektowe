import Fluent
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

    struct IndexContext: Content {
        var products: [Product]
    }

    struct ProductContext: Content {
        var product: Product
    }

    struct CreateContext: Content {
        var categories: [Category]
    }

    struct EditContext: Content {
        var product: Product
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
        let products = try await Product.query(on: req.db)
            .with(\.$category)
            .all()

        return try await req.view.render(
            "products/index",
            IndexContext(products: products)
        )
    }

    // GET /web/products/create
    func createForm(req: Request) async throws -> View {
        let categories = try await Category.query(on: req.db).all()
        return try await req.view.render(
            "products/create",
            CreateContext(categories: categories)
        )
    }

    // POST /web/products
    func create(req: Request) async throws -> Response {
        let form = try req.content.decode(ProductForm.self)
        let product = Product(
            name: form.name,
            price: form.price,
            description: form.description,
            quantity: form.quantity
        )

        product.$category.id = parseCategoryID(form.categoryID)
        try product.validateBusinessRules()

        try await product.create(on: req.db)
        return req.redirect(to: "/web/products")
    }

    // GET /web/products/:productID
    func show(req: Request) async throws -> View {
        let product = try await find(req, withCategory: true)

        return try await req.view.render(
            "products/show",
            ProductContext(product: product)
        )
    }

    // GET /web/products/:productID/edit
    func editForm(req: Request) async throws -> View {
        let product = try await find(req)
        let categories = try await Category.query(on: req.db).all()

        return try await req.view.render(
            "products/edit",
            EditContext(product: product, categories: categories)
        )
    }

    // POST /web/products/:productID/edit
    func update(req: Request) async throws -> Response {
        let product = try await find(req)
        let form    = try req.content.decode(ProductForm.self)

        product.name         = form.name
        product.price        = form.price
        product.description  = form.description
        product.quantity     = form.quantity
        product.$category.id = parseCategoryID(form.categoryID)

        try product.validateBusinessRules()

        try await product.update(on: req.db)
        return req.redirect(to: "/web/products")
    }

    // POST /web/products/:productID/delete
    func delete(req: Request) async throws -> Response {
        let product = try await find(req)

        try await product.delete(on: req.db)
        return req.redirect(to: "/web/products")
    }

    private func find(_ req: Request, withCategory: Bool = false) async throws -> Product {
        guard let id = req.parameters.get("productID", as: UUID.self) else {
            throw Abort(.badRequest)
        }
        
        var query = Product.query(on: req.db).filter(\.$id == id)
        if withCategory {
            query = query.with(\.$category)
        }

        guard let product = try await query.first() else {
            throw Abort(.notFound)
        }
        return product
    }

    private func parseCategoryID(_ raw: String?) -> UUID? {
        guard let raw, !raw.isEmpty else { 
            return nil 
        }

        return UUID(uuidString: raw)
    }
}
