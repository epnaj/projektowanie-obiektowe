import Fluent
import Vapor

func routes(_ app: Application) throws {
    app.get { _ async in
        "Zadanie 7; endpoint: /products"
    }

    try app.register(collection: ProductController())
}
