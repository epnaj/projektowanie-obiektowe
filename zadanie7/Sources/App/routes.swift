import Vapor

func routes(_ app: Application) throws {
    app.get { _ async in
        "Zadanie 7; endpoint: /products or for web view /web/products"
    }

    try app.register(collection: ProductController())
    try app.register(collection: ProductWebController())
    try app.register(collection: CategoryController())
    try app.register(collection: CategoryWebController())
}
