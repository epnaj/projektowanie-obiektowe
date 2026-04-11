<?php

namespace App\Controller;

use App\Entity\Product;
use App\Repository\ProductRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;

#[Route('/api/products')]
class ProductController extends AbstractController
{
    #[Route('', methods: ['GET'])]
    public function index(ProductRepository $repository): JsonResponse
    {
        $products = $repository->findAll();

        $data = array_map(fn(Product $product) => [
            'id' => $product->getId(),
            'name' => $product->getName(),
            'description' => $product->getDescription(),
            'price' => $product->getPrice(),
        ], $products);

        return $this->json($data);
    }

    #[Route('/{id}', methods: ['GET'])]
    public function show(Product $product): JsonResponse
    {
        return $this->json([
            'id' => $product->getId(),
            'name' => $product->getName(),
            'description' => $product->getDescription(),
            'price' => $product->getPrice(),
        ]);
    }

    #[Route('', methods: ['POST'])]
    public function create(Request $request, EntityManagerInterface $em): JsonResponse
    {
        $data = json_decode($request->getContent(), true);

        if (empty($data['name']) || !isset($data['price'])) {
            return $this->json(['error' => 'Name and price are required'], Response::HTTP_BAD_REQUEST);
        }

        $product = new Product();
        $product->setName($data['name']);
        $product->setDescription($data['description'] ?? null);
        $product->setPrice((float) $data['price']);

        $em->persist($product);
        $em->flush();

        return $this->json([
            'id' => $product->getId(),
            'name' => $product->getName(),
            'description' => $product->getDescription(),
            'price' => $product->getPrice(),
        ], Response::HTTP_CREATED);
    }

    #[Route('/{id}', methods: ['PUT'])]
    public function update(Request $request, Product $product, EntityManagerInterface $em): JsonResponse
    {
        $data = json_decode($request->getContent(), true);

        if (isset($data['name'])) {
            $product->setName($data['name']);
        }
        if (array_key_exists('description', $data)) {
            $product->setDescription($data['description']);
        }
        if (isset($data['price'])) {
            $product->setPrice((float) $data['price']);
        }

        $em->flush();

        return $this->json([
            'id' => $product->getId(),
            'name' => $product->getName(),
            'description' => $product->getDescription(),
            'price' => $product->getPrice(),
        ]);
    }

    #[Route('/{id}', methods: ['DELETE'])]
    public function delete(Product $product, EntityManagerInterface $em): JsonResponse
    {
        $em->remove($product);
        $em->flush();

        return $this->json(null, Response::HTTP_NO_CONTENT);
    }
}
