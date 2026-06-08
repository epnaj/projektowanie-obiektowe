import Fluent
import Vapor

struct ProductWebController: RouteCollection {
    struct ProductForm: Content {
        var name: String
        var price: Double
        var description: String?
        var quantity: Int
    }

    struct IndexContext: Content {
        var products: [Product]
    }

    struct ProductContext: Content {
        var product: Product
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
        let products = try await Product.query(on: req.db).all()

        return try await req.view.render(
            "products/index", 
            IndexContext(products: products)
        )
    }

    // GET /web/products/create
    func createForm(req: Request) async throws -> View {
        try await req.view.render("products/create")
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
        try product.validateBusinessRules()

        try await product.create(on: req.db)
        return req.redirect(to: "/web/products")
    }

    // GET /web/products/:productID
    func show(req: Request) async throws -> View {
        let product = try await find(req)

        return try await req.view.render(
            "products/show", 
            ProductContext(product: product)
        )
    }

    // GET /web/products/:productID/edit
    func editForm(req: Request) async throws -> View {
        let product = try await find(req)

        return try await req.view.render(
            "products/edit", 
            ProductContext(product: product)
        )
    }

    // POST /web/products/:productID/edit
    func update(req: Request) async throws -> Response {
        let product = try await find(req)
        let form    = try req.content.decode(ProductForm.self)

        product.name        = form.name
        product.price       = form.price
        product.description = form.description
        product.quantity    = form.quantity
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

    private func find(_ req: Request) async throws -> Product {
        guard let product = try await Product.find(
            req.parameters.get("productID"),
            on: req.db
        ) else {
            throw Abort(.notFound)
        }
        return product
    }
}
