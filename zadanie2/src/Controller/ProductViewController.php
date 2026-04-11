<?php

namespace App\Controller;

use App\Entity\Product;
use App\Repository\ProductRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;

#[Route('/products')]
class ProductViewController extends AbstractController
{
    #[Route('', methods: ['GET'])]
    public function index(ProductRepository $repository): Response
    {
        $products = $repository->findAll();

        return $this->render('product/index.html.twig', [
            'products' => $products,
        ]);
    }

    #[Route('/{id}', methods: ['GET'], requirements: ['id' => '\d+'])]
    public function show(Product $product): Response
    {
        return $this->render('product/show.html.twig', [
            'product' => $product,
        ]);
    }

    #[Route('/new', methods: ['GET', 'POST'])]
    public function new(Request $request, EntityManagerInterface $em): Response
    {
        if ($request->isMethod('POST')) {
            $product = new Product();
            $product->setName($request->request->get('name'));
            $product->setDescription($request->request->get('description'));
            $product->setPrice((float) $request->request->get('price'));

            $em->persist($product);
            $em->flush();

            $this->addFlash('success', 'Produkt został utworzony.');
            return $this->redirectToRoute('app_productview_index');
        }

        return $this->render('product/new.html.twig');
    }

    #[Route('/{id}/edit', methods: ['GET', 'POST'])]
    public function edit(Request $request, Product $product, EntityManagerInterface $em): Response
    {
        if ($request->isMethod('POST')) {
            $product->setName($request->request->get('name'));
            $product->setDescription($request->request->get('description'));
            $product->setPrice((float) $request->request->get('price'));

            $em->flush();

            $this->addFlash('success', 'Produkt został zaktualizowany.');
            return $this->redirectToRoute('app_productview_index');
        }

        return $this->render('product/edit.html.twig', [
            'product' => $product,
        ]);
    }

    #[Route('/{id}/delete', methods: ['POST'])]
    public function delete(Product $product, EntityManagerInterface $em): Response
    {
        $em->remove($product);
        $em->flush();

        $this->addFlash('success', 'Produkt został usunięty.');
        return $this->redirectToRoute('app_productview_index');
    }
}
