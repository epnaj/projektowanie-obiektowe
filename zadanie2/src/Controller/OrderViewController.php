<?php

namespace App\Controller;

use App\Entity\Order;
use App\Repository\OrderRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;

#[Route('/orders')]
class OrderViewController extends AbstractController
{
    #[Route('', methods: ['GET'])]
    public function index(OrderRepository $repository): Response
    {
        $orders = $repository->findAll();

        return $this->render('order/index.html.twig', [
            'orders' => $orders,
        ]);
    }

    #[Route('/{id}', methods: ['GET'], requirements: ['id' => '\d+'])]
    public function show(Order $order): Response
    {
        return $this->render('order/show.html.twig', [
            'order' => $order,
        ]);
    }

    #[Route('/new', methods: ['GET', 'POST'])]
    public function new(Request $request, EntityManagerInterface $em): Response
    {
        if ($request->isMethod('POST')) {
            $order = new Order();
            $order->setCustomerName($request->request->get('customerName'));
            $order->setCustomerEmail($request->request->get('customerEmail'));
            $order->setStatus($request->request->get('status', 'new'));
            $order->setCreatedAt(new \DateTime());

            $em->persist($order);
            $em->flush();

            $this->addFlash('success', 'Zamówienie zostało utworzone.');
            return $this->redirectToRoute('app_orderview_index');
        }

        return $this->render('order/new.html.twig');
    }

    #[Route('/{id}/edit', methods: ['GET', 'POST'])]
    public function edit(Request $request, Order $order, EntityManagerInterface $em): Response
    {
        if ($request->isMethod('POST')) {
            $order->setCustomerName($request->request->get('customerName'));
            $order->setCustomerEmail($request->request->get('customerEmail'));
            $order->setStatus($request->request->get('status'));

            $em->flush();

            $this->addFlash('success', 'Zamówienie zostało zaktualizowane.');
            return $this->redirectToRoute('app_orderview_index');
        }

        return $this->render('order/edit.html.twig', [
            'order' => $order,
        ]);
    }

    #[Route('/{id}/delete', methods: ['POST'])]
    public function delete(Order $order, EntityManagerInterface $em): Response
    {
        $em->remove($order);
        $em->flush();

        $this->addFlash('success', 'Zamówienie zostało usunięte.');
        return $this->redirectToRoute('app_orderview_index');
    }
}
