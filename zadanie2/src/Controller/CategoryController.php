<?php

namespace App\Controller;

use App\Entity\Category;
use App\Repository\CategoryRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;

#[Route('/api/categories')]
class CategoryController extends AbstractController
{
    #[Route('', methods: ['GET'])]
    public function index(CategoryRepository $repository): JsonResponse
    {
        $categories = $repository->findAll();

        $data = array_map(fn(Category $category) => [
            'id' => $category->getId(),
            'name' => $category->getName(),
            'description' => $category->getDescription(),
        ], $categories);

        return $this->json($data);
    }

    #[Route('/{id}', methods: ['GET'])]
    public function show(Category $category): JsonResponse
    {
        return $this->json([
            'id' => $category->getId(),
            'name' => $category->getName(),
            'description' => $category->getDescription(),
        ]);
    }

    #[Route('', methods: ['POST'])]
    public function create(Request $request, EntityManagerInterface $em): JsonResponse
    {
        $data = json_decode($request->getContent(), true);

        if (empty($data['name'])) {
            return $this->json(['error' => 'Name is required'], Response::HTTP_BAD_REQUEST);
        }

        $category = new Category();
        $category->setName($data['name']);
        $category->setDescription($data['description'] ?? null);

        $em->persist($category);
        $em->flush();

        return $this->json([
            'id' => $category->getId(),
            'name' => $category->getName(),
            'description' => $category->getDescription(),
        ], Response::HTTP_CREATED);
    }

    #[Route('/{id}', methods: ['PUT'])]
    public function update(Request $request, Category $category, EntityManagerInterface $em): JsonResponse
    {
        $data = json_decode($request->getContent(), true);

        if (isset($data['name'])) {
            $category->setName($data['name']);
        }
        if (array_key_exists('description', $data)) {
            $category->setDescription($data['description']);
        }

        $em->flush();

        return $this->json([
            'id' => $category->getId(),
            'name' => $category->getName(),
            'description' => $category->getDescription(),
        ]);
    }

    #[Route('/{id}', methods: ['DELETE'])]
    public function delete(Category $category, EntityManagerInterface $em): JsonResponse
    {
        $em->remove($category);
        $em->flush();

        return $this->json(null, Response::HTTP_NO_CONTENT);
    }
}
