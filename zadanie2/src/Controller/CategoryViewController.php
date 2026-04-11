<?php

namespace App\Controller;

use App\Entity\Category;
use App\Repository\CategoryRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;

#[Route('/categories')]
class CategoryViewController extends AbstractController
{
    #[Route('', methods: ['GET'])]
    public function index(CategoryRepository $repository): Response
    {
        $categories = $repository->findAll();

        return $this->render('category/index.html.twig', [
            'categories' => $categories,
        ]);
    }

    #[Route('/{id}', methods: ['GET'], requirements: ['id' => '\d+'])]
    public function show(Category $category): Response
    {
        return $this->render('category/show.html.twig', [
            'category' => $category,
        ]);
    }

    #[Route('/new', methods: ['GET', 'POST'])]
    public function new(Request $request, EntityManagerInterface $em): Response
    {
        if ($request->isMethod('POST')) {
            $category = new Category();
            $category->setName($request->request->get('name'));
            $category->setDescription($request->request->get('description'));

            $em->persist($category);
            $em->flush();

            $this->addFlash('success', 'Kategoria została utworzona.');
            return $this->redirectToRoute('app_categoryview_index');
        }

        return $this->render('category/new.html.twig');
    }

    #[Route('/{id}/edit', methods: ['GET', 'POST'])]
    public function edit(Request $request, Category $category, EntityManagerInterface $em): Response
    {
        if ($request->isMethod('POST')) {
            $category->setName($request->request->get('name'));
            $category->setDescription($request->request->get('description'));

            $em->flush();

            $this->addFlash('success', 'Kategoria została zaktualizowana.');
            return $this->redirectToRoute('app_categoryview_index');
        }

        return $this->render('category/edit.html.twig', [
            'category' => $category,
        ]);
    }

    #[Route('/{id}/delete', methods: ['POST'])]
    public function delete(Category $category, EntityManagerInterface $em): Response
    {
        $em->remove($category);
        $em->flush();

        $this->addFlash('success', 'Kategoria została usunięta.');
        return $this->redirectToRoute('app_categoryview_index');
    }
}
