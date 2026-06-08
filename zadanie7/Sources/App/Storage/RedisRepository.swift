import Foundation
import Redis
import Vapor


struct RedisRepository<Entity: Codable> {
    let client: RedisClient
    let prefix: String
    let indexKey: RedisKey

    private func key(for id: UUID) -> RedisKey {
        RedisKey("\(prefix):\(id.uuidString)")
    }


    func all() async throws -> [Entity] {
        let ids = try await client.smembers(of: indexKey, as: String.self).get()
        var entities: [Entity] = []

        for case let raw? in ids {
            guard let id = UUID(uuidString: raw),
                  let entity = try await find(id) else { continue }

            entities.append(entity)
        }
        
        return entities
    }

    func find(_ id: UUID) async throws -> Entity? {
        guard let json = try await client.get(key(for: id), as: String.self).get() else {
            return nil
        }
        return try JSONDecoder().decode(Entity.self, from: Data(json.utf8))
    }

    func save(_ id: UUID, _ entity: Entity) async throws {
        let json = String(decoding: try JSONEncoder().encode(entity), as: UTF8.self)
        try await client.set(key(for: id), to: json).get()
        _ = try await client.sadd(id.uuidString, to: indexKey).get()
    }

    func delete(_ id: UUID) async throws {
        _ = try await client.delete(key(for: id)).get()
        _ = try await client.srem(id.uuidString, from: indexKey).get()
    }
}
